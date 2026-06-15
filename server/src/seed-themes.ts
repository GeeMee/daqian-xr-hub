import prisma from './db'

// 题材列表（幂等写入，不会清空已有数据，可在生产安全运行）
// 运行：npm run db:seed-themes
const THEMES = [
  { id: 'theme-deepsea', name: '深海' },
  { id: 'theme-mr', name: 'MR互动' },
  { id: 'theme-casual', name: '休闲' },
  { id: 'theme-history', name: '历史' },
  { id: 'theme-horror', name: '恐怖' },
  { id: 'theme-vrroom', name: 'VR密室' },
  { id: 'theme-red', name: '红色主题' },
  { id: 'theme-guofeng', name: '国风神话' },
  { id: 'theme-dino', name: '恐龙' },
  { id: 'theme-nature', name: '自然' },
]

async function seedThemes() {
  for (let i = 0; i < THEMES.length; i++) {
    const t = THEMES[i]
    await prisma.category.upsert({
      where: { id: t.id },
      update: { name: t.name, sortOrder: i + 1 },
      create: { id: t.id, name: t.name, sortOrder: i + 1 },
    })
  }
  console.log(`Upserted ${THEMES.length} themes`)
}

seedThemes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
