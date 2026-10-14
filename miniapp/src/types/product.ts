export interface Product {
  id: string
  name: string
  category: string
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
  recommendations: Recommendation[]
  notices: NoticeInfo
  isRecommended: boolean
  isNew: boolean
  isOnShelf: boolean
  sortOrder: number
}

export interface Recommendation {
  icon: string
  text: string
}

export interface NoticeInfo {
  duration: string
  preparation: string
  safety: string
}

export interface Category {
  id: string
  name: string
  sortOrder: number
}

export interface Banner {
  id: string
  image: string
  productId: string
  sortOrder: number
}

export interface HomeData {
  banners: Banner[]
  recommendedProducts: Product[]
  newProducts: Product[]
}
