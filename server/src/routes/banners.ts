import { Router } from 'express'
import prisma from '../db'

export const bannersRouter = Router()

bannersRouter.get('/', async (_req, res) => {
  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { product: true },
  })
  res.json({
    data: banners.map((b) => ({
      ...b,
      productName: b.product.name,
    })),
  })
})

bannersRouter.post('/', async (req, res) => {
  const count = await prisma.banner.count()
  if (count >= 5) {
    return res.status(400).json({ error: '最多允许添加5张轮播图' })
  }
  const banner = await prisma.banner.create({ data: req.body })
  res.json(banner)
})

bannersRouter.put('/:id', async (req, res) => {
  const banner = await prisma.banner.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(banner)
})

bannersRouter.delete('/:id', async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})
