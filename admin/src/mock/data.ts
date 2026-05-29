import type { Product, Category, Banner, Admin, OperationLog, BrandInfo, StoreInfo } from '../types'

export const mockCategories: Category[] = [
  { id: 'cat-1', name: '自研产品', productCount: 3, createdAt: '2024-01-15' },
  { id: 'cat-2', name: '发行产品', productCount: 2, createdAt: '2024-01-15' },
  { id: 'cat-3', name: '密室产品', productCount: 2, createdAt: '2024-02-01' },
  { id: 'cat-4', name: '即将上线', productCount: 1, createdAt: '2024-03-01' },
]

export const mockProducts: Product[] = [
  {
    id: 'p-001', name: '深渊之眼', category: 'cat-1',
    poster: 'https://picsum.photos/seed/xr1/200/200', shortDesc: '沉浸式深海探秘',
    description: '在无尽深海中，一座被遗忘的古老神殿正在苏醒。',
    tags: ['爆款'], horrorLevel: 3, playerCount: '4-6人', duration: '60分钟',
    onlineDate: '2024-06', recommendations: [], notices: { duration: '', preparation: '', safety: '' },
    isRecommended: true, isNew: false, isOnShelf: true, sortOrder: 1, createdAt: '2024-06-01',
  },
  {
    id: 'p-002', name: '星际迷航', category: 'cat-1',
    poster: 'https://picsum.photos/seed/xr2/200/200', shortDesc: '太空冒险之旅',
    description: '2187年，人类的星际殖民船在穿越虫洞时遭遇未知能量风暴。',
    tags: ['新品'], horrorLevel: 2, playerCount: '2-4人', duration: '45分钟',
    onlineDate: '2025-03', recommendations: [], notices: { duration: '', preparation: '', safety: '' },
    isRecommended: true, isNew: true, isOnShelf: true, sortOrder: 2, createdAt: '2025-03-01',
  },
  {
    id: 'p-003', name: '幽灵古堡', category: 'cat-3',
    poster: 'https://picsum.photos/seed/xr3/200/200', shortDesc: '哥特式恐怖密室',
    description: '维多利亚时代的古堡深处，传说中的幽灵伯爵已经沉睡了三百年。',
    tags: ['爆款'], horrorLevel: 5, playerCount: '4-8人', duration: '75分钟',
    onlineDate: '2024-03', recommendations: [], notices: { duration: '', preparation: '', safety: '' },
    isRecommended: true, isNew: false, isOnShelf: true, sortOrder: 3, createdAt: '2024-03-01',
  },
  {
    id: 'p-004', name: '侏罗纪重生', category: 'cat-2',
    poster: 'https://picsum.photos/seed/xr4/200/200', shortDesc: '恐龙世界探险',
    description: '时空裂缝将你带回了白垩纪末期。',
    tags: ['新品', '限时特惠'], horrorLevel: 2, playerCount: '2-6人', duration: '50分钟',
    onlineDate: '2025-05', recommendations: [], notices: { duration: '', preparation: '', safety: '' },
    isRecommended: true, isNew: true, isOnShelf: true, sortOrder: 4, createdAt: '2025-05-01',
  },
  {
    id: 'p-005', name: '赛博朋克2099', category: 'cat-1',
    poster: 'https://picsum.photos/seed/xr5/200/200', shortDesc: '未来都市沉浸剧',
    description: '2099年的新东京，霓虹灯下暗流涌动。',
    tags: [], horrorLevel: 3, playerCount: '2-4人', duration: '55分钟',
    onlineDate: '2024-09', recommendations: [], notices: { duration: '', preparation: '', safety: '' },
    isRecommended: false, isNew: false, isOnShelf: true, sortOrder: 5, createdAt: '2024-09-01',
  },
  {
    id: 'p-006', name: '失落的亚特兰蒂斯', category: 'cat-2',
    poster: 'https://picsum.photos/seed/xr6/200/200', shortDesc: '海底文明解谜',
    description: '传说中的亚特兰蒂斯并未沉没。',
    tags: [], horrorLevel: 1, playerCount: '3-6人', duration: '60分钟',
    onlineDate: '2024-01', recommendations: [], notices: { duration: '', preparation: '', safety: '' },
    isRecommended: false, isNew: false, isOnShelf: true, sortOrder: 6, createdAt: '2024-01-01',
  },
  {
    id: 'p-007', name: '末日列车', category: 'cat-3',
    poster: 'https://picsum.photos/seed/xr7/200/200', shortDesc: '末世生存剧场',
    description: '冰封末世，最后的人类文明在一列永不停歇的列车上延续。',
    tags: ['新品'], horrorLevel: 4, playerCount: '4-6人', duration: '70分钟',
    onlineDate: '2025-04', recommendations: [], notices: { duration: '', preparation: '', safety: '' },
    isRecommended: false, isNew: true, isOnShelf: false, sortOrder: 7, createdAt: '2025-04-01',
  },
  {
    id: 'p-008', name: '龙宫秘境', category: 'cat-4',
    poster: 'https://picsum.photos/seed/xr8/200/200', shortDesc: '东方神话冒险',
    description: '即将上线的全新东方神话主题体验。',
    tags: ['新品'], horrorLevel: 1, playerCount: '2-8人', duration: '45分钟',
    onlineDate: '2025-07', recommendations: [], notices: { duration: '', preparation: '', safety: '' },
    isRecommended: false, isNew: false, isOnShelf: false, sortOrder: 8, createdAt: '2025-06-01',
  },
]

export const mockBanners: Banner[] = [
  { id: 'b-1', image: 'https://picsum.photos/seed/banner1/750/350', productId: 'p-001', productName: '深渊之眼', sortOrder: 1, createdAt: '2024-06-01' },
  { id: 'b-2', image: 'https://picsum.photos/seed/banner2/750/350', productId: 'p-002', productName: '星际迷航', sortOrder: 2, createdAt: '2025-03-01' },
  { id: 'b-3', image: 'https://picsum.photos/seed/banner3/750/350', productId: 'p-004', productName: '侏罗纪重生', sortOrder: 3, createdAt: '2025-05-01' },
]

export const mockAdmins: Admin[] = [
  { id: 'a-1', username: 'admin', phone: '13800138000', role: 'super', permissions: [], lastLoginAt: '2025-05-28 10:30' },
  { id: 'a-2', username: '运营小王', phone: '13900139000', role: 'normal', permissions: ['products', 'categories', 'banners'], lastLoginAt: '2025-05-27 14:20' },
]

export const mockLogs: OperationLog[] = [
  { id: 'l-1', operator: 'admin', type: '登录', content: '管理员登录系统', createdAt: '2025-05-28 10:30', ip: '192.168.1.100' },
  { id: 'l-2', operator: 'admin', type: '编辑', content: '编辑产品「深渊之眼」', createdAt: '2025-05-28 10:35', ip: '192.168.1.100' },
  { id: 'l-3', operator: '运营小王', type: '新增', content: '新增轮播图', createdAt: '2025-05-27 14:25', ip: '192.168.1.101' },
  { id: 'l-4', operator: '运营小王', type: '编辑', content: '修改产品「星际迷航」上架状态', createdAt: '2025-05-27 14:30', ip: '192.168.1.101' },
]

export const mockBrandInfo: BrandInfo = {
  name: '大千迷境XR影院',
  logo: '',
  slogan: '沉浸式XR娱乐体验',
  phone: '400-888-9999',
}

export const mockStoreInfo: StoreInfo = {
  name: '大千迷境XR影院（旗舰店）',
  address: '北京市朝阳区xxx路xxx号',
  hours: '周一至周日 10:00-22:00',
  coordinates: '39.9042,116.4074',
}
