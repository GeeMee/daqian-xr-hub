import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import OSS from 'ali-oss'

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

function getOssPath(mimetype: string, originalname: string): string {
  const ext = path.extname(originalname)
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  if (mimetype.startsWith('video/')) {
    return `daqian-xr-hub/video/${filename}`
  }
  return `daqian-xr-hub/image/${filename}`
}

export const uploadRouter = Router()

uploadRouter.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  try {
    const ossPath = getOssPath(req.file.mimetype, req.file.originalname)
    await ossClient.put(ossPath, req.file.buffer)
    const url = `${CDN_BASE}/${ossPath}`
    res.json({ url })
  } catch (e: any) {
    console.error('OSS upload error:', e.message)
    res.status(500).json({ error: '文件上传失败' })
  }
})
