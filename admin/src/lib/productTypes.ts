// 一级大类（固定 4 类，与小程序端筛选保持一致）
export const PRODUCT_TYPES = ['VR大空间', 'VR密室', 'MR游戏', 'VR儿童密室'] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

// 动线的设备类型（与源表 tbl_dongxianmodel.shebeitype 一致）。库中存 0/1。
export const DEVICE_TYPES = [
  { value: 0, label: 'Pico 4 UE' },
  { value: 1, label: 'Pico Neo3' },
] as const

export function deviceTypeLabel(value: number) {
  return DEVICE_TYPES.find((d) => d.value === value)?.label || '未知设备'
}

// 产品类型（仅后台/数据库使用，不在小程序端展示）。库中存 0/1/2/3。
export const PRODUCT_SOURCES = [
  { value: 0, label: '自研产品' },
  { value: 1, label: '定制产品' },
  { value: 2, label: '发行产品' },
  { value: 3, label: '密室产品' },
] as const

// 每个产品默认支持的动线：6x10 · Pico 4 UE。新建产品时后台默认勾选、服务端也会兜底补上
export const DEFAULT_DONGXIAN_SIZE = '6x10'
export const DEFAULT_DONGXIAN_DEVICE = 0
