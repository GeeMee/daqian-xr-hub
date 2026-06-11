// Aliyun OSS 图片处理：按展示尺寸生成缩略图，避免加载多 MB 原图导致卡顿。
// CDN 已开启 OSS 图片处理服务，支持 ?x-oss-process=image/resize 参数。
const CDN_HOST = 'cdn.daqianmijing.com'

/**
 * 给 CDN 图片 URL 追加 OSS 缩放参数。
 * @param url 原图 URL（非 CDN 域名或空值原样返回）
 * @param width 目标宽度（物理像素，建议 = rpx 显示宽度 × 2 以适配高清屏）
 */
export function ossImg(url: string | undefined | null, width: number): string {
  if (!url || typeof url !== 'string') return url || ''
  if (!url.includes(CDN_HOST)) return url
  if (url.includes('x-oss-process')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}x-oss-process=image/resize,w_${width}/format,webp/quality,q_80`
}
