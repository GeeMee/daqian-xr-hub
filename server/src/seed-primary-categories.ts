import prisma from './db'

// 一级大类初始数据（幂等写入，不会清空已有数据，可在生产安全运行）
// 运行：npm run db:seed-primary
const PRIMARY_CATEGORIES = ['VR大空间', 'VR密室', 'MR游戏', 'VR儿童密室']

async function seedPrimaryCategories() {
  for (let i = 0; i < PRIMARY_CATEGORIES.length; i++) {
    const name = PRIMARY_CATEGORIES[i]
    await prisma.primaryCategory.upsert({
      where: { name },
      update: { sortOrder: i + 1 },
      create: { name, sortOrder: i + 1 },
    })
  }
  console.log(`Upserted ${PRIMARY_CATEGORIES.length} primary categories`)
}

seedPrimaryCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
