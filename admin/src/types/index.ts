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
  phone: string
  role: 'super' | 'normal'
  permissions: string[]
  lastLoginAt: string
}

export interface OperationLog {
  id: string
  operator: string
  type: string
  content: string
  createdAt: string
  ip: string
}
