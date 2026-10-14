import { Router } from 'express'
import prisma from '../db'

export const dongxianRouter = Router()

// 设备类型：0=Pico 4 UE 1=Pico Neo3（与源表 tbl_dongxianmodel.shebeitype 一致）
const DEVICE_TYPES = [0, 1]

function toInt(value: unknown, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

const productSelect = {
  id: true,
  name: true,
  productIndex: true,
  poster: true,
  productType: true,
} as const

// 列表：deviceType=0/1 按设备类型筛选，不传或传 -1 返回全部
dongxianRouter.get('/', async (req, res) => {
  const { deviceType } = req.query
  const where: any = {}
  if (deviceType !== undefined && deviceType !== '' && DEVICE_TYPES.includes(Number(deviceType))) {
    where.deviceType = Number(deviceType)
  }

  const items = await prisma.dongxian.findMany({
    where,
    orderBy: [{ deviceType: 'asc' }, { sortOrder: 'asc' }, { sizeName: 'asc' }],
    include: { products: { select: productSelect, orderBy: { sortOrder: 'asc' } } },
  })

  res.json({
    data: items.map((d) => ({ ...d, productCount: d.products.length })),
  })
})

dongxianRouter.get('/:id', async (req, res) => {
  const item = await prisma.dongxian.findUnique({
    where: { id: req.params.id },
    include: { products: { select: productSelect, orderBy: { sortOrder: 'asc' } } },
  })
  if (!item) return res.status(404).json({ error: '动线不存在' })
  res.json({ ...item, productCount: item.products.length })
})

dongxianRouter.post('/', async (req, res) => {
  const { sizeName, deviceType, recommendDevices, maxDevices, sortOrder, productIds } = req.body
  const size = String(sizeName ?? '').trim()
  if (!size) return res.status(400).json({ error: '动线尺寸不能为空' })
  const device = toInt(deviceType)
  if (!DEVICE_TYPES.includes(device)) return res.status(400).json({ error: '设备类型不合法' })

  try {
    const item = await prisma.dongxian.create({
      data: {
        sizeName: size,
        deviceType: device,
        recommendDevices: toInt(recommendDevices),
        maxDevices: toInt(maxDevices),
        sortOrder: toInt(sortOrder),
        products: { connect: (Array.isArray(productIds) ? productIds : []).map((id: string) => ({ id })) },
      },
      include: { products: { select: productSelect } },
    })
    res.json(item)
  } catch (e: any) {
    res.status(400).json({ error: e.message || '创建失败' })
  }
})

dongxianRouter.put('/:id', async (req, res) => {
  const { sizeName, deviceType, recommendDevices, maxDevices, sortOrder, productIds } = req.body
  const existing = await prisma.dongxian.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: '动线不存在' })

  const size = sizeName !== undefined ? String(sizeName).trim() : existing.sizeName
  if (!size) return res.status(400).json({ error: '动线尺寸不能为空' })
  const device = deviceType !== undefined ? toInt(deviceType) : existing.deviceType
  if (!DEVICE_TYPES.includes(device)) return res.status(400).json({ error: '设备类型不合法' })

  try {
    const item = await prisma.dongxian.update({
      where: { id: req.params.id },
      data: {
        sizeName: size,
        deviceType: device,
        recommendDevices: recommendDevices !== undefined ? toInt(recommendDevices) : existing.recommendDevices,
        maxDevices: maxDevices !== undefined ? toInt(maxDevices) : existing.maxDevices,
        sortOrder: sortOrder !== undefined ? toInt(sortOrder) : existing.sortOrder,
        // productIds 传了就整体替换关联；没传则不动
        products: Array.isArray(productIds)
          ? { set: productIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: { products: { select: productSelect } },
    })
    res.json(item)
  } catch (e: any) {
    res.status(400).json({ error: e.message || '更新失败' })
  }
})

dongxianRouter.delete('/:id', async (req, res) => {
  const existing = await prisma.dongxian.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: '动线不存在' })
  // 多对多关联随记录一起删除，产品本身不受影响
  await prisma.dongxian.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

// 批量设置该动线下的产品（整体覆盖）
dongxianRouter.post('/:id/products', async (req, res) => {
  const { productIds } = req.body as { productIds: string[] }
  const existing = await prisma.dongxian.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: '动线不存在' })

  const ids = Array.isArray(productIds) ? productIds : []
  await prisma.dongxian.update({
    where: { id: req.params.id },
    data: { products: { set: ids.map((id) => ({ id })) } },
  })
  res.json({ success: true })
})
