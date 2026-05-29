export interface Product {
  id: string
  name: string
  category: string
  poster: string
  video?: string
  shortDesc: string
  description: string
  tags: string[]
  horrorLevel: number
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
