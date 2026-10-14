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

// 批量设置该题材下的产品（整体覆盖）：勾选的产品关联该题材，未勾选的取消关联（不影响其它题材）
categoriesRouter.post('/:id/products', async (req, res) => {
  const { productIds } = req.body as { productIds: string[] }
  const ids = Array.isArray(productIds) ? productIds : []
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { products: { set: ids.map((id) => ({ id })) } },
    })
    res.json({ success: true, id: category.id })
  } catch (e: any) {
    res.status(400).json({ error: e.message || '保存失败' })
  }
})

categoriesRouter.delete('/:id', async (req, res) => {
  const count = await prisma.product.count({
    where: { categories: { some: { id: req.params.id } } },
  })
  if (count > 0) {
    return res.status(400).json({ error: '该题材下有产品，请先转移产品' })
  }
  await prisma.category.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})
