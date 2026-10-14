import { Router } from 'express'
import prisma from '../db'
import { defaultNoticeTemplate } from '../lib/noticeTemplates'

export const primaryCategoriesRouter = Router()

// 列表（带产品数量）。productType 以名称字符串存在产品上，按名称聚合统计。
primaryCategoriesRouter.get('/', async (_req, res) => {
  const categories = await prisma.primaryCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  const counts = await prisma.product.groupBy({
    by: ['productType'],
    _count: { _all: true },
  })
  const countMap = new Map(counts.map((c) => [c.productType, c._count._all]))

  res.json({
    data: categories.map((c) => ({
      ...c,
      // 未单独设置模板时，按大类名称回退到内置默认模板，后台可在此基础上修改保存
      noticeTemplate: c.noticeTemplate?.trim() ? c.noticeTemplate : defaultNoticeTemplate(c.name),
      productCount: countMap.get(c.name) || 0,
    })),
  })
})

primaryCategoriesRouter.post('/', async (req, res) => {
  const { name, sortOrder } = req.body
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: '名称不能为空' })
  }
  try {
    const category = await prisma.primaryCategory.create({
      data: { name: String(name).trim(), sortOrder: sortOrder ?? 0 },
    })
    res.json(category)
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ error: '该一级分类名称已存在' })
    res.status(400).json({ error: e.message || '创建失败' })
  }
})

primaryCategoriesRouter.put('/:id', async (req, res) => {
  const { name, sortOrder, noticeTemplate } = req.body
  const existing = await prisma.primaryCategory.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: '一级分类不存在' })

  const newName = name !== undefined ? String(name).trim() : existing.name
  if (!newName) return res.status(400).json({ error: '名称不能为空' })

  try {
    // 重命名时级联更新所有引用旧名称的产品 productType
    const category = await prisma.$transaction(async (tx) => {
      const updated = await tx.primaryCategory.update({
        where: { id: req.params.id },
        data: {
          name: newName,
          sortOrder: sortOrder ?? existing.sortOrder,
          ...(noticeTemplate !== undefined ? { noticeTemplate: String(noticeTemplate) } : {}),
        },
      })
      if (newName !== existing.name) {
        await tx.product.updateMany({
          where: { productType: existing.name },
          data: { productType: newName },
        })
      }
      return updated
    })
    res.json(category)
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ error: '该一级分类名称已存在' })
    res.status(400).json({ error: e.message || '更新失败' })
  }
})

primaryCategoriesRouter.delete('/:id', async (req, res) => {
  const existing = await prisma.primaryCategory.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: '一级分类不存在' })

  const count = await prisma.product.count({ where: { productType: existing.name } })
  if (count > 0) {
    return res.status(400).json({ error: '该一级分类下有产品，请先转移产品' })
  }
  await prisma.primaryCategory.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

// 批量设置该一级分类下的产品（整体覆盖）：
// - 勾选的产品 productType 设为该分类名称（会把产品从其它一级分类移动过来）
// - 原本属于该分类但未勾选的产品 productType 清空
primaryCategoriesRouter.post('/:id/products', async (req, res) => {
  const { productIds } = req.body as { productIds: string[] }
  const existing = await prisma.primaryCategory.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: '一级分类不存在' })

  const ids = Array.isArray(productIds) ? productIds : []
  await prisma.$transaction([
    // 取消勾选的（原本属于该分类）置空
    prisma.product.updateMany({
      where: { productType: existing.name, id: { notIn: ids } },
      data: { productType: '' },
    }),
    // 勾选的设为该分类
    prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { productType: existing.name },
    }),
  ])
  res.json({ success: true })
})
