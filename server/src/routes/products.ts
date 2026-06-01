import { Router } from 'express'
import prisma from '../db'

export const productsRouter = Router()

productsRouter.get('/', async (req, res) => {
  const { category, search, status, page = '1', pageSize = '20' } = req.query
  const where: any = {}
  if (category) where.categoryId = category
  if (search) where.name = { contains: search as string }
  if (status === 'on') where.isOnShelf = true
  if (status === 'off') where.isOnShelf = false

  const total = await prisma.product.count({ where })
  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { sortOrder: 'asc' },
    skip: (Number(page) - 1) * Number(pageSize),
    take: Number(pageSize),
  })

  const formatted = products.map((p) => ({
    ...p,
    recommendations: JSON.parse(p.recommendations),
    categoryName: p.category.name,
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
    take: 6,
  })

  const recent = await prisma.product.findMany({
    where: { isOnShelf: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  res.json({
    banners: banners.map((b) => ({
      id: b.id,
      image: b.image,
      productId: b.productId,
      productName: b.product.name,
    })),
    recommended: recommended.map((p) => ({
      ...p,
      recommendations: JSON.parse(p.recommendations),
    })),
    recent: recent.map((p) => ({
      ...p,
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
    ...p,
    recommendations: JSON.parse(p.recommendations),
  }))
  res.json({
    recommended: formatted.filter((p) => p.isRecommended),
    all: formatted,
  })
})

productsRouter.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  })
  if (!product) return res.status(404).json({ error: 'Not found' })
  res.json({
    ...product,
    recommendations: JSON.parse(product.recommendations),
    categoryName: product.category.name,
  })
})

productsRouter.post('/', async (req, res) => {
  const { recommendations, ...data } = req.body
  const product = await prisma.product.create({
    data: {
      ...data,
      description: data.description || '',
      notices: data.notices || '',
      recommendations: JSON.stringify(recommendations || []),
    },
  })
  res.json(product)
})

productsRouter.put('/:id', async (req, res) => {
  const { recommendations, ...data } = req.body
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...data,
      recommendations: recommendations ? JSON.stringify(recommendations) : undefined,
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
