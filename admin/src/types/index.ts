export interface Product {
  id: string
  name: string
  category: string
  productIndex?: string
  productSource?: number
  /** 资源包大小，只存数字，默认单位 GB */
  packageSize?: string
  poster: string
  /** 兼容字段，等于 videos[0] */
  video?: string
  /** 多视频，最多 5 个，详情页按顺序自上而下排布 */
  videos?: string[]
  shortDesc: string
  description: string
  tags: string[]
  horrorLevel: number
  /** 解密难度（密室类产品），0=不显示 */
  puzzleLevel?: number
  playerCount: string
  duration: string
  onlineDate: string
  recommendations: { icon: string; text: string }[]
  notices: { duration: string; preparation: string; safety: string }
  isRecommended: boolean
  isNew: boolean
  isOnShelf: boolean
  sortOrder: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  productCount: number
  createdAt: string
}

export interface Banner {
  id: string
  image: string
  productId: string
  productName: string
  sortOrder: number
  createdAt: string
}

export interface BrandInfo {
  name: string
  logo: string
  slogan: string
  phone: string
}

export interface StoreInfo {
  name: string
  address: string
  hours: string
  coordinates: string
}

export interface Admin {
  id: string
  username: string
  role: 'super' | 'normal'
  lastLoginAt?: string | null
  createdAt?: string
}

export interface OperationLog {
  id: string
  operator: string
  type: string
  content: string
  createdAt: string
  ip: string
}
