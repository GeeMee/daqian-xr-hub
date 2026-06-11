import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import OSS from 'ali-oss'
import { compressImage, isCompressibleImage } from '../image'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
})

const ossClient = new OSS({
  region: process.env.ALIYUN_OSS_REGION!,
  endpoint: process.env.ALIYUN_OSS_ENDPOINT!,
  accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.ALIYUN_OSS_BUCKET!,
})

const CDN_BASE = process.env.CDN_BASE_URL || 'http://cdn.daqianmijing.com'

function buildOssPath(folder: 'image' | 'video', ext: string): string {
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  return `daqian-xr-hub/${folder}/${filename}`
}

export const uploadRouter = Router()

uploadRouter.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  try {
    const { mimetype, originalname } = req.file
    const isVideo = mimetype.startsWith('video/')

    // 图片在入库前压缩，避免超大原图（>20MB）导致 OSS 缩略图处理失败裂图
    let body = req.file.buffer
    if (!isVideo && isCompressibleImage(mimetype)) {
      try {
        body = await compressImage(req.file.buffer, mimetype)
      } catch (e: any) {
        console.error('图片压缩失败，存储原图:', e.message)
      }
    }

    const ext = path.extname(originalname) || (isVideo ? '' : '.png')
    const ossPath = buildOssPath(isVideo ? 'video' : 'image', ext)
    await ossClient.put(ossPath, body)
    res.json({ url: `${CDN_BASE}/${ossPath}` })
  } catch (e: any) {
    console.error('OSS upload error:', e.message)
    res.status(500).json({ error: '文件上传失败' })
  }
})
