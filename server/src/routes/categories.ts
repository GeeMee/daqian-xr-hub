import { Router } from 'express'
import prisma from '../db'

export const categoriesRouter = Router()

categoriesRouter.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  res.json({
    data: categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    })),
  })
})

categoriesRouter.post('/', async (req, res) => {
  const category = await prisma.category.create({ data: req.body })
  res.json(category)
})

categoriesRouter.put('/:id', async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(category)
})

categoriesRouter.delete('/:id', async (req, res) => {
  const count = await prisma.product.count({ where: { categoryId: req.params.id } })
  if (count > 0) {
    return res.status(400).json({ error: '该分类下有产品，请先转移产品' })
  }
  await prisma.category.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})
