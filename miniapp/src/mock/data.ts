import type { Product, Category, Banner, HomeData } from '../types'

export const categories: Category[] = [
  { id: 'cat-1', name: '自研产品', sortOrder: 1 },
  { id: 'cat-2', name: '发行产品', sortOrder: 2 },
  { id: 'cat-3', name: '密室产品', sortOrder: 3 },
  { id: 'cat-4', name: '即将上线', sortOrder: 4 },
]

export const products: Product[] = [
  {
    id: 'p-001',
    name: '深渊之眼',
    category: 'cat-1',
    poster: 'https://picsum.photos/seed/xr1/400/533',
    video: '',
    shortDesc: '沉浸式深海探秘',
    description: '在无尽深海中，一座被遗忘的古老神殿正在苏醒。你将穿戴XR设备，化身深海探险家，穿越幽暗的海底隧道，解开远古文明留下的谜题。每一步都充满未知，每一个转角都可能遇见深海巨兽的凝视。这是一场关于勇气与智慧的终极考验。',
    tags: ['爆款'],
    horrorLevel: 3,
    playerCount: '4-6人',
    duration: '60分钟',
    onlineDate: '2024-06',
    recommendations: [
      { icon: '🌊', text: '全景深海环境，360度沉浸体验' },
      { icon: '🧩', text: '多人协作解谜，考验团队默契' },
      { icon: '🎭', text: '专业NPC互动，剧情跌宕起伏' },
      { icon: '✨', text: '顶级光影特效，视觉震撼' },
    ],
    notices: {
      duration: '演出/活动时长以现场为准，无需预约',
      preparation: '建议穿着舒适便于活动的鞋履\n体验前请调整发型方便佩戴(如高发髻、丸子头等)设备重量约0.7kg，未成年人建议成人陪同观展',
      safety: '体验期间请勿奔跑、打闹、大声喧哗虚拟场景中的物品请勿攀爬或就坐妥善保管个人物品，场馆不承担保管责任',
    },
    isRecommended: true,
    isNew: false,
    isOnShelf: true,
    sortOrder: 1,
  },
  {
    id: 'p-002',
    name: '星际迷航',
    category: 'cat-1',
    poster: 'https://picsum.photos/seed/xr2/400/533',
    video: '',
    shortDesc: '太空冒险之旅',
    description: '2187年，人类的星际殖民船"方舟号"在穿越虫洞时遭遇未知能量风暴，你作为幸存的船员之一，必须在飞船失控前找到逃生舱。零重力环境下的每一次移动都需要精确计算，而飞船的AI系统似乎有了自己的意志...',
    tags: ['新品'],
    horrorLevel: 2,
    playerCount: '2-4人',
    duration: '45分钟',
    onlineDate: '2025-03',
    recommendations: [
      { icon: '🚀', text: '真实零重力模拟，太空漫步体验' },
      { icon: '🤖', text: 'AI智能剧情，每次体验都不同' },
      { icon: '🎮', text: '体感交互操作，直觉式游玩' },
    ],
    notices: {
      duration: '演出/活动时长以现场为准，无需预约',
      preparation: '请穿着舒适运动服装\n体验前请勿大量进食',
      safety: '如感到不适请立即告知工作人员\n禁止携带尖锐物品进入体验区',
    },
    isRecommended: true,
    isNew: true,
    isOnShelf: true,
    sortOrder: 2,
  },
  {
    id: 'p-003',
    name: '幽灵古堡',
    category: 'cat-3',
    poster: 'https://picsum.photos/seed/xr3/400/533',
    video: '',
    shortDesc: '哥特式恐怖密室',
    description: '维多利亚时代的古堡深处，传说中的幽灵伯爵已经沉睡了三百年。当午夜钟声敲响，古堡的每一面墙壁都开始低语。你们必须在黎明前找到封印之钥，否则将永远困在这座时间停滞的古堡中。',
    tags: ['爆款'],
    horrorLevel: 5,
    playerCount: '4-8人',
    duration: '75分钟',
    onlineDate: '2024-03',
    recommendations: [
      { icon: '👻', text: '超真实恐怖氛围，肾上腺素飙升' },
      { icon: '🏰', text: '精致哥特场景，细节满分' },
      { icon: '🔑', text: '多线索解谜，烧脑又刺激' },
      { icon: '🎪', text: '真人NPC演绎，沉浸感拉满' },
    ],
    notices: {
      duration: '演出/活动时长以现场为准，无需预约',
      preparation: '建议穿着舒适便于活动的鞋履\n16岁以下未成年人禁止参与',
      safety: '体验中可随时呼叫退出\n心脏病、高血压患者禁止参与\n建议结伴体验',
    },
    isRecommended: true,
    isNew: false,
    isOnShelf: true,
    sortOrder: 3,
  },
  {
    id: 'p-004',
    name: '侏罗纪重生',
    category: 'cat-2',
    poster: 'https://picsum.photos/seed/xr4/400/533',
    video: '',
    shortDesc: '恐龙世界探险',
    description: '时空裂缝将你带回了白垩纪末期，这里是恐龙统治的最后乐园。作为时空旅行者，你需要在火山爆发前收集珍贵的基因样本。但请小心，霸王龙的领地可不是随便能闯的...',
    tags: ['新品', '限时特惠'],
    horrorLevel: 2,
    playerCount: '2-6人',
    duration: '50分钟',
    onlineDate: '2025-05',
    recommendations: [
      { icon: '🦖', text: '1:1恐龙还原，震撼视觉冲击' },
      { icon: '🌋', text: '火山爆发特效，身临其境' },
      { icon: '👨‍👩‍👧‍👦', text: '适合亲子互动，寓教于乐' },
    ],
    notices: {
      duration: '演出/活动时长以现场为准，无需预约',
      preparation: '8-12岁需家长陪同\n请穿着舒适鞋子',
      safety: '请勿触碰场景道具\n听从工作人员指引',
    },
    isRecommended: true,
    isNew: true,
    isOnShelf: true,
    sortOrder: 4,
  },
  {
    id: 'p-005',
    name: '赛博朋克2099',
    category: 'cat-1',
    poster: 'https://picsum.photos/seed/xr5/400/533',
    video: '',
    shortDesc: '未来都市沉浸剧',
    description: '2099年的新东京，霓虹灯下暗流涌动。你是一名赏金猎人，接到了一个神秘委托——潜入巨型企业"天网"的总部，窃取一份足以改变世界格局的数据。在这个人机共生的时代，你能相信谁？',
    tags: [],
    horrorLevel: 3,
    playerCount: '2-4人',
    duration: '55分钟',
    onlineDate: '2024-09',
    recommendations: [
      { icon: '🌃', text: '赛博朋克美学，霓虹光影盛宴' },
      { icon: '🕵️', text: '多分支剧情，结局由你决定' },
      { icon: '⚡', text: '高科技道具交互，未来感十足' },
    ],
    notices: {
      duration: '演出/活动时长以现场为准，无需预约',
      preparation: '剧情含多结局，欢迎二刷\n请勿剧透',
      safety: '含闪烁光效，癫痫患者请勿参与',
    },
    isRecommended: false,
    isNew: false,
    isOnShelf: true,
    sortOrder: 5,
  },
  {
    id: 'p-006',
    name: '失落的亚特兰蒂斯',
    category: 'cat-2',
    poster: 'https://picsum.photos/seed/xr6/400/533',
    video: '',
    shortDesc: '海底文明解谜',
    description: '传说中的亚特兰蒂斯并未沉没，它只是隐藏在了另一个维度。一张古老的海图指引你来到了这座水下都市的入口。在这里，古老的机关与魔法共存，每一道谜题都是通往真相的钥匙。',
    tags: [],
    horrorLevel: 1,
    playerCount: '3-6人',
    duration: '60分钟',
    onlineDate: '2024-01',
    recommendations: [
      { icon: '🏛️', text: '精美古文明场景，视觉享受' },
      { icon: '🧠', text: '高质量谜题设计，成就感满满' },
      { icon: '💎', text: '隐藏彩蛋众多，探索乐趣' },
    ],
    notices: {
      duration: '演出/活动时长以现场为准，无需预约',
      preparation: '建议3人以上组队\n请提前10分钟到店',
      safety: '幽闭恐惧症患者请谨慎参与',
    },
    isRecommended: false,
    isNew: false,
    isOnShelf: true,
    sortOrder: 6,
  },
  {
    id: 'p-007',
    name: '末日列车',
    category: 'cat-3',
    poster: 'https://picsum.photos/seed/xr7/400/533',
    video: '',
    shortDesc: '末世生存剧场',
    description: '冰封末世，最后的人类文明在一列永不停歇的列车上延续。你从末等车厢醒来，记忆全无，只有手臂上的神秘编号暗示着你的真实身份。列车即将驶入暴风雪核心区，而车头传来的广播越来越诡异...',
    tags: ['新品'],
    horrorLevel: 4,
    playerCount: '4-6人',
    duration: '70分钟',
    onlineDate: '2025-04',
    recommendations: [
      { icon: '🚂', text: '移动场景设计，空间不断变化' },
      { icon: '❄️', text: '极寒氛围营造，体感温度联动' },
      { icon: '🎭', text: '角色扮演深度，代入感极强' },
    ],
    notices: {
      duration: '演出/活动时长以现场为准，无需预约',
      preparation: '请提前20分钟到店进行角色分配\n体验时长较长，请合理安排时间',
      safety: '心脏病、孕妇、幽闭恐惧症患者禁止参与',
    },
    isRecommended: false,
    isNew: true,
    isOnShelf: true,
    sortOrder: 7,
  },
  {
    id: 'p-008',
    name: '龙宫秘境',
    category: 'cat-4',
    poster: 'https://picsum.photos/seed/xr8/400/533',
    video: '',
    shortDesc: '东方神话冒险',
    description: '即将上线的全新东方神话主题体验。你将化身龙宫来客，探索海底龙王的宝藏殿堂，与虾兵蟹将斗智斗勇，揭开定海神针的终极秘密。',
    tags: ['新品'],
    horrorLevel: 1,
    playerCount: '2-8人',
    duration: '45分钟',
    onlineDate: '2025-07',
    recommendations: [
      { icon: '🐉', text: '东方美学场景，国风沉浸体验' },
      { icon: '🎆', text: '全新交互玩法，敬请期待' },
    ],
    notices: {
      duration: '具体时长待定',
      preparation: '敬请期待',
      safety: '适合全年龄段',
    },
    isRecommended: false,
    isNew: false,
    isOnShelf: true,
    sortOrder: 8,
  },
]

export const banners: Banner[] = [
  { id: 'b-1', image: 'https://picsum.photos/seed/banner1/750/350', productId: 'p-001', sortOrder: 1 },
  { id: 'b-2', image: 'https://picsum.photos/seed/banner2/750/350', productId: 'p-002', sortOrder: 2 },
  { id: 'b-3', image: 'https://picsum.photos/seed/banner3/750/350', productId: 'p-004', sortOrder: 3 },
]

export function getHomeData(): HomeData {
  const onShelfProducts = products.filter((p) => p.isOnShelf)
  const recommendedProducts = onShelfProducts
    .filter((p) => p.isRecommended)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4)
  const newProducts = onShelfProducts
    .filter((p) => p.isNew)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3)

  return { banners, recommendedProducts, newProducts }
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products
    .filter((p) => p.isOnShelf && p.category === categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}
