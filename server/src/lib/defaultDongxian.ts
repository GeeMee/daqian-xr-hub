import prisma from '../db'

// 所有产品默认支持的动线：6x10 · Pico 4 UE（deviceType 0）
// 新建产品时自动挂上；已有产品由 src/backfill-default-dongxian.ts 补齐。
export const DEFAULT_DONGXIAN_SIZE = '6x10'
export const DEFAULT_DONGXIAN_DEVICE = 0

export function findDefaultDongxian() {
  return prisma.dongxian.findFirst({
    where: { sizeName: DEFAULT_DONGXIAN_SIZE, deviceType: DEFAULT_DONGXIAN_DEVICE },
    orderBy: { sortOrder: 'asc' },
  })
}
