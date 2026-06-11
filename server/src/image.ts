import sharp from 'sharp'

// 阿里云 OSS 图片处理服务的源图上限是 20MB，超过会导致缩略图请求返回 400（ImageTooLarge）裂图。
// 上传时把图片最长边限制在 2560px 并重新编码，确保存进 OSS 的图远小于该上限，
// 同时缩略图（ossImg）仍能正常处理。仅处理产品实际使用的 png/jpg/webp。
const MAX_DIMENSION = 2560
const RASTER_MIME = /^image\/(png|jpe?g|webp)$/i

export function isCompressibleImage(mimetype: string): boolean {
  return RASTER_MIME.test(mimetype)
}

/**
 * 压缩图片：限制最长边为 2560px（只缩不放），按原格式重新编码。
 * 保持原格式，避免改变对象扩展名 / Content-Type。
 */
export async function compressImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
  const pipeline = sharp(buffer, { failOn: 'none', limitInputPixels: false })
    .rotate() // 依据 EXIF 方向自动旋正
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })

  if (/jpe?g/i.test(mimetype)) return pipeline.jpeg({ quality: 84, mozjpeg: true }).toBuffer()
  if (/webp/i.test(mimetype)) return pipeline.webp({ quality: 84 }).toBuffer()
  // png：无损重新编码，保留透明通道
  return pipeline.png({ compressionLevel: 9 }).toBuffer()
}
