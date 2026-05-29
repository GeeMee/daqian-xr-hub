import prisma from './db'

const CDN = 'http://cdn.daqianmijing.com/daqian-xr-hub/image'

async function seed() {
  console.log('Seeding database...')

  await prisma.banner.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const categories = [
    { id: 'cat-1', name: '自研产品', sortOrder: 1 },
    { id: 'cat-2', name: '发行产品', sortOrder: 2 },
    { id: 'cat-3', name: '密室产品', sortOrder: 3 },
    { id: 'cat-4', name: '即将上线', sortOrder: 4 },
  ]

  for (const cat of categories) {
    await prisma.category.create({ data: cat })
  }
  console.log(`Created ${categories.length} categories`)

  const products = [
    {
      id: 'p-001', name: '深渊之眼', categoryId: 'cat-1',
      poster: `${CDN}/product-001.jpg`,
      shortDesc: '沉浸式深海探秘',
      description: '在无尽深海中，一座被遗忘的古老神殿正在苏醒。你将穿戴XR设备，化身深海探险家，穿越幽暗的海底隧道，解开远古文明留下的谜题。',
      horrorLevel: 3, playerCount: '4-6人', duration: '60分钟', onlineDate: '2024-06',
      recommendations: JSON.stringify([
        { icon: '🌊', text: '全景深海环境，360度沉浸体验' },
        { icon: '🧩', text: '多人协作解谜，考验团队默契' },
        { icon: '🎭', text: '专业NPC互动，剧情跌宕起伏' },
        { icon: '✨', text: '顶级光影特效，视觉震撼' },
      ]),
      notices: '体验期间请勿奔跑、打闹、大声喧哗。虚拟场景中的物品请勿攀爬或就坐。',
      isRecommended: true, isOnShelf: true, sortOrder: 1,
    },
    {
      id: 'p-002', name: '星际迷航', categoryId: 'cat-1',
      poster: `${CDN}/product-002.jpg`,
      shortDesc: '太空冒险之旅',
      description: '2187年，人类的星际殖民船"方舟号"在穿越虫洞时遭遇未知能量风暴，你作为幸存的船员之一，必须在飞船失控前找到逃生舱。',
      horrorLevel: 2, playerCount: '2-4人', duration: '45分钟', onlineDate: '2025-03',
      recommendations: JSON.stringify([
        { icon: '🚀', text: '真实零重力模拟，太空漫步体验' },
        { icon: '🤖', text: 'AI智能剧情，每次体验都不同' },
        { icon: '🎮', text: '体感交互操作，直觉式游玩' },
      ]),
      notices: '如感到不适请立即告知工作人员。禁止携带尖锐物品进入体验区。',
      isRecommended: true, isOnShelf: true, sortOrder: 2,
    },
    {
      id: 'p-003', name: '幽灵古堡', categoryId: 'cat-3',
      poster: `${CDN}/product-003.jpg`,
      shortDesc: '哥特式恐怖密室',
      description: '维多利亚时代的古堡深处，传说中的幽灵伯爵已经沉睡了三百年。当午夜钟声敲响，古堡的每一面墙壁都开始低语。',
      horrorLevel: 5, playerCount: '4-8人', duration: '75分钟', onlineDate: '2024-03',
      recommendations: JSON.stringify([
        { icon: '👻', text: '超真实恐怖氛围，肾上腺素飙升' },
        { icon: '🏰', text: '精致哥特场景，细节满分' },
        { icon: '🔑', text: '多线索解谜，烧脑又刺激' },
        { icon: '🎪', text: '真人NPC演绎，沉浸感拉满' },
      ]),
      notices: '心脏病、高血压患者禁止参与。16岁以下未成年人禁止参与。',
      isRecommended: true, isOnShelf: true, sortOrder: 3,
    },
    {
      id: 'p-004', name: '侏罗纪重生', categoryId: 'cat-2',
      poster: `${CDN}/product-004.jpg`,
      shortDesc: '恐龙世界探险',
      description: '时空裂缝将你带回了白垩纪末期，这里是恐龙统治的最后乐园。作为时空旅行者，你需要在火山爆发前收集珍贵的基因样本。',
      horrorLevel: 2, playerCount: '2-6人', duration: '50分钟', onlineDate: '2025-05',
      recommendations: JSON.stringify([
        { icon: '🦖', text: '1:1恐龙还原，震撼视觉冲击' },
        { icon: '🌋', text: '火山爆发特效，身临其境' },
        { icon: '👨‍👩‍👧‍👦', text: '适合亲子互动，寓教于乐' },
      ]),
      notices: '8-12岁需家长陪同。请勿触碰场景道具。',
      isRecommended: true, isOnShelf: true, sortOrder: 4,
    },
    {
      id: 'p-005', name: '赛博朋克2099', categoryId: 'cat-1',
      poster: `${CDN}/product-005.jpg`,
      shortDesc: '未来都市沉浸剧',
      description: '2099年的新东京，霓虹灯下暗流涌动。你是一名赏金猎人，接到了一个神秘委托——潜入巨型企业"天网"的总部。',
      horrorLevel: 3, playerCount: '2-4人', duration: '55分钟', onlineDate: '2024-09',
      recommendations: JSON.stringify([
        { icon: '🌃', text: '赛博朋克美学，霓虹光影盛宴' },
        { icon: '🕵️', text: '多分支剧情，结局由你决定' },
        { icon: '⚡', text: '高科技道具交互，未来感十足' },
      ]),
      notices: '含闪烁光效，癫痫患者请勿参与。',
      isRecommended: false, isOnShelf: true, sortOrder: 5,
    },
    {
      id: 'p-006', name: '失落的亚特兰蒂斯', categoryId: 'cat-2',
      poster: `${CDN}/product-006.jpg`,
      shortDesc: '海底文明解谜',
      description: '传说中的亚特兰蒂斯并未沉没，它只是隐藏在了另一个维度。一张古老的海图指引你来到了这座水下都市的入口。',
      horrorLevel: 1, playerCount: '3-6人', duration: '60分钟', onlineDate: '2024-01',
      recommendations: JSON.stringify([
        { icon: '🏛️', text: '精美古文明场景，视觉享受' },
        { icon: '🧠', text: '高质量谜题设计，成就感满满' },
        { icon: '💎', text: '隐藏彩蛋众多，探索乐趣' },
      ]),
      notices: '幽闭恐惧症患者请谨慎参与。',
      isRecommended: false, isOnShelf: true, sortOrder: 6,
    },
    {
      id: 'p-007', name: '末日列车', categoryId: 'cat-3',
      poster: `${CDN}/product-007.jpg`,
      shortDesc: '末世生存剧场',
      description: '冰封末世，最后的人类文明在一列永不停歇的列车上延续。你从末等车厢醒来，记忆全无。',
      horrorLevel: 4, playerCount: '4-6人', duration: '70分钟', onlineDate: '2025-04',
      recommendations: JSON.stringify([
        { icon: '🚂', text: '移动场景设计，空间不断变化' },
        { icon: '❄️', text: '极寒氛围营造，体感温度联动' },
        { icon: '🎭', text: '角色扮演深度，代入感极强' },
      ]),
      notices: '心脏病、孕妇、幽闭恐惧症患者禁止参与。',
      isRecommended: false, isOnShelf: true, sortOrder: 7,
    },
    {
      id: 'p-008', name: '龙宫秘境', categoryId: 'cat-4',
      poster: `${CDN}/product-008.jpg`,
      shortDesc: '东方神话冒险',
      description: '即将上线的全新东方神话主题体验。你将化身龙宫来客，探索海底龙王的宝藏殿堂。',
      horrorLevel: 1, playerCount: '2-8人', duration: '45分钟', onlineDate: '2025-07',
      recommendations: JSON.stringify([
        { icon: '🐉', text: '东方美学场景，国风沉浸体验' },
        { icon: '🎆', text: '全新交互玩法，敬请期待' },
      ]),
      notices: '适合全年龄段。',
      isRecommended: false, isOnShelf: true, sortOrder: 8,
    },
  ]

  for (const p of products) {
    await prisma.product.create({ data: p })
  }
  console.log(`Created ${products.length} products`)

  const banners = [
    { id: 'b-1', image: `${CDN}/banner-001.jpg`, productId: 'p-001', sortOrder: 1 },
    { id: 'b-2', image: `${CDN}/banner-002.jpg`, productId: 'p-002', sortOrder: 2 },
    { id: 'b-3', image: `${CDN}/banner-003.jpg`, productId: 'p-004', sortOrder: 3 },
  ]

  for (const b of banners) {
    await prisma.banner.create({ data: b })
  }
  console.log(`Created ${banners.length} banners`)

  await prisma.setting.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      brandName: '大千迷境XR影院',
      slogan: '沉浸式XR娱乐体验',
      phone: '400-888-9999',
      storeName: '大千迷境XR影院（旗舰店）',
      address: '成都市锦江区春熙路99号',
      businessHours: '10:00-22:00',
    },
  })
  console.log('Created settings')

  console.log('Seed complete!')
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
