import { Router } from 'express'
import prisma from '../db'
import { findDefaultDongxian } from '../lib/defaultDongxian'

export const productsRouter = Router()

// 未上传海报时的默认「敬请期待」海报（CDN 上的官方图，与禁闭岛：机械纪元等产品同一张）
const COMING_SOON_POSTER = 'https://cdn.daqianmijing.com/daqian-xr-hub/image/1782809001062-rqdb6w3dfi.jpg'

function normalizeCdnUrl(url: string | null | undefined) {
  if (!url) return url || ''
  return url.replace(/^http:\/\/cdn\.daqianmijing\.com/i, 'https://cdn.daqianmijing.com')
}

// 每个产品最多 5 个视频
const MAX_VIDEOS = 5

// videos 存的是 JSON 数组字符串；老数据只有单个 video 字段时回落成单元素数组
function parseVideoList(product: any): string[] {
  let list: string[] = []
  if (typeof product.videos === 'string' && product.videos.trim()) {
    try {
      const parsed = JSON.parse(product.videos)
      if (Array.isArray(parsed)) list = parsed.filter((v) => typeof v === 'string' && v.trim())
    } catch {
      list = []
    }
  }
  if (list.length === 0 && product.video) list = [product.video]
  return list.slice(0, MAX_VIDEOS).map((v) => normalizeCdnUrl(v) as string)
}

// 入库前把前端传来的视频数组收敛成合法的 JSON 字符串
function serializeVideoList(videos: unknown): string[] {
  if (!Array.isArray(videos)) return []
  return videos
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .slice(0, MAX_VIDEOS)
}

function normalizeProduct(product: any) {
  if (!product) return product
  return {
    ...product,
    poster: normalizeCdnUrl(product.poster),
    video: normalizeCdnUrl(product.video),
    videos: parseVideoList(product),
    images: typeof product.images === 'string'
      ? product.images.replace(/http:\/\/cdn\.daqianmijing\.com/gi, 'https://cdn.daqianmijing.com')
      : product.images,
  }
}

function normalizeBanner(banner: any) {
  if (!banner) return banner
  return {
    ...banner,
    image: normalizeCdnUrl(banner.image),
  }
}

productsRouter.get('/', async (req, res) => {
  const { category, search, status, source, type, page = '1', pageSize = '20' } = req.query
  const where: any = {}
  if (category) where.categories = { some: { id: category as string } }
  // 按一级大类筛选：type=VR大空间 / VR密室 / MR游戏 / VR儿童密室（productType 字段，按名称精确匹配）
  if (type) where.productType = type as string
  if (search) where.name = { contains: search as string }
  if (status === 'on') where.isOnShelf = true
  if (status === 'off') where.isOnShelf = false
  // 按产品类型筛选：source=0 自研 / 1 定制 / 2 发行 / 3 密室（供后台及同事查询用）
  // source=-1 或不传 表示获取全部，不加类型过滤
  if (source !== undefined && source !== '' && !Number.isNaN(Number(source)) && Number(source) >= 0) {
    where.productSource = Number(source)
  }

  const total = await prisma.product.count({ where })
  const products = await prisma.product.findMany({
    where,
    include: {
      categories: true,
      // 列表页展示「适配动线」用，只取展示需要的字段
      dongxians: {
        select: { id: true, sizeName: true, deviceType: true },
        orderBy: [{ deviceType: 'asc' }, { sortOrder: 'asc' }],
      },
    },
    orderBy: { sortOrder: 'asc' },
    skip: (Number(page) - 1) * Number(pageSize),
    take: Number(pageSize),
  })

  const formatted = products.map((p) => ({
    ...normalizeProduct(p),
    recommendations: JSON.parse(p.recommendations),
    categories: p.categories.map((c) => ({ id: c.id, name: c.name })),
    categoryNames: p.categories.map((c) => c.name).join('、'),
  }))

  res.json({ data: formatted, total, page: Number(page), pageSize: Number(pageSize) })
})

productsRouter.get('/home', async (_req, res) => {
  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { product: true },
  })

  const recommended = await prisma.product.findMany({
    where: { isRecommended: true, isOnShelf: true },
    orderBy: { sortOrder: 'asc' },
    // 首页热映推荐位每列 3 个、一屏 4 列，多出来的横向滑动查看
    take: 24,
  })

  const recent = await prisma.product.findMany({
    where: { isOnShelf: true, isNew: true },
    // 按上线时间倒序，越新越靠前；未填上线时间的（空串最小）自然排到最后，同一天再按后台排序值
    orderBy: [{ onlineDate: 'desc' }, { sortOrder: 'asc' }],
  })

  res.json({
    banners: banners.map((b) => ({
      id: b.id,
      image: normalizeCdnUrl(b.image),
      productId: b.productId,
      productName: b.product.name,
    })),
    recommended: recommended.map((p) => ({
      ...normalizeProduct(p),
      recommendations: JSON.parse(p.recommendations),
    })),
    recent: recent.map((p) => ({
      ...normalizeProduct(p),
      recommendations: JSON.parse(p.recommendations),
    })),
  })
})

productsRouter.get('/upcoming', async (_req, res) => {
  const all = await prisma.product.findMany({
    where: { isOnShelf: false },
    orderBy: { sortOrder: 'asc' },
  })
  const formatted = all.map((p) => ({
    ...normalizeProduct(p),
    recommendations: JSON.parse(p.recommendations),
  }))
  res.json({
    recommended: formatted.filter((p) => p.isRecommended),
    all: formatted,
  })
})

productsRouter.get('/sort-list', async (req, res) => {
  // type 由调用方决定：0=当日, 1=当月, 其它值=供应商提供的总榜等类型，原样透传
  const type = Number.isFinite(Number(req.query.type)) ? Number(req.query.type) : 0
  const sortApiUrl = process.env.SORT_API_URL

  if (!sortApiUrl) {
    return res.json({ data: [] })
  }

  try {
    const resp = await fetch(sortApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
      signal: AbortSignal.timeout(5000),
    })

    if (!resp.ok) {
      return res.json({ data: [] })
    }

    const json = await resp.json() as { state?: string; data?: string }
    if (json.state === 'ok' && json.data) {
      return res.json({ data: JSON.parse(json.data) })
    }
    return res.json({ data: [] })
  } catch (_e) {
    return res.json({ data: [] })
  }
})

productsRouter.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      categories: true,
      dongxians: { orderBy: [{ deviceType: 'asc' }, { sortOrder: 'asc' }] },
    },
  })
  if (!product) return res.status(404).json({ error: 'Not found' })
  const normalizedProduct = normalizeProduct(product)
  res.json({
    ...normalizedProduct,
    recommendations: JSON.parse(product.recommendations),
    images: JSON.parse((normalizedProduct.images as string) || '[]'),
    categories: product.categories.map((c) => ({ id: c.id, name: c.name })),
    categoryNames: product.categories.map((c) => c.name).join('、'),
    dongxians: product.dongxians,
    dongxianIds: product.dongxians.map((d) => d.id),
  })
})

productsRouter.post('/', async (req, res) => {
  const { recommendations, images, categoryIds, dongxianIds, videos, ...data } = req.body
  const videoList = serializeVideoList(videos)
  // 每个产品默认支持 6x10 · Pico 4 UE 动线，新建时自动挂上（前端没勾也补）
  const dongxianIdSet = new Set<string>(Array.isArray(dongxianIds) ? dongxianIds : [])
  const defaultDongxian = await findDefaultDongxian()
  if (defaultDongxian) dongxianIdSet.add(defaultDongxian.id)
  const product = await prisma.product.create({
    data: {
      ...data,
      // 海报留空时自动使用「敬请期待」官方海报，小程序与后台都直接可见
      poster: data.poster?.trim() ? data.poster : COMING_SOON_POSTER,
      description: data.description || '',
      notices: data.notices || '',
      videos: JSON.stringify(videoList),
      // video 保留为首个视频，兼容尚未更新的小程序版本
      video: videoList[0] || data.video || '',
      recommendations: JSON.stringify(recommendations || []),
      images: JSON.stringify(images || []),
      categories: { connect: (categoryIds || []).map((id: string) => ({ id })) },
      dongxians: { connect: Array.from(dongxianIdSet).map((id: string) => ({ id })) },
    },
  })
  res.json(product)
})

productsRouter.put('/:id', async (req, res) => {
  const { recommendations, images, categoryIds, dongxianIds, videos, ...data } = req.body
  const videoList = videos === undefined ? null : serializeVideoList(videos)
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(videoList ? { videos: JSON.stringify(videoList), video: videoList[0] || '' } : {}),
      // 编辑时把海报删空同样回落到「敬请期待」海报
      ...(data.poster !== undefined && !String(data.poster).trim() ? { poster: COMING_SOON_POSTER } : {}),
      recommendations: recommendations ? JSON.stringify(recommendations) : undefined,
      images: images ? JSON.stringify(images) : undefined,
      // categoryIds / dongxianIds 传了就整体替换关联；没传则不动
      categories: categoryIds ? { set: categoryIds.map((id: string) => ({ id })) } : undefined,
      dongxians: dongxianIds ? { set: dongxianIds.map((id: string) => ({ id })) } : undefined,
    },
  })
  res.json(product)
})

productsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.banner.deleteMany({ where: { productId: req.params.id } })
    await prisma.product.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e: any) {
    res.status(400).json({ error: e.message || '删除失败' })
  }
})
