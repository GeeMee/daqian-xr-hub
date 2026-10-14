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

// 未上传海报时的「敬请期待」官方海报（CDN 图，与服务端创建产品时的默认值一致）。
// 服务端已在创建/编辑产品时自动填充此图，这里仅作为历史空数据的兜底。
export const DEFAULT_POSTER = 'https://cdn.daqianmijing.com/daqian-xr-hub/image/1782809001062-rqdb6w3dfi.jpg'

/**
 * 产品海报专用：有图则走 OSS 缩略图，无图则回退到「敬请期待」海报（同样走缩略图）。
 * @param url 产品 poster 字段
 * @param width 目标宽度（同 ossImg）
 */
export function posterImg(url: string | undefined | null, width: number): string {
  const poster = url && typeof url === 'string' && url.trim() ? url : DEFAULT_POSTER
  return ossImg(poster, width)
}
