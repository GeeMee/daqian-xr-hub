// 从供应商表 tbl_dongxianmodel 导入动线模型。
// 数据文件由本地脚本从源库导出（见 server/data/dongxian-import.json），
// 这里只按 sourceId 幂等 upsert，可重复执行。
// 用法：npx tsx src/import-dongxian.ts data/dongxian-import.json [--dry]
import fs from 'fs'
import prisma from './db'

// 与 routes/products.ts 保持一致的「敬请期待」占位海报
const COMING_SOON_POSTER = 'https://cdn.daqianmijing.com/daqian-xr-hub/image/1782809001062-rqdb6w3dfi.jpg'

type PlaceholderProduct = { productIndex: string; name: string }
type DongxianRow = {
  sourceId: number
  sizeName: string
  deviceType: number
  recommendDevices: number
  maxDevices: number
  sortOrder: number
  productIndexes: string[]
}

async function main() {
  const file = process.argv[2]
  const dry = process.argv.includes('--dry')
  if (!file) {
    console.error('缺少数据文件路径，例如：npx tsx src/import-dongxian.ts data/dongxian-import.json')
    process.exit(1)
  }
  const payload = JSON.parse(fs.readFileSync(file, 'utf-8')) as {
    products?: PlaceholderProduct[]
    dongxians: DongxianRow[]
  }
  const placeholders = payload.products || []
  const rows = payload.dongxians || []
  console.log(`动线 ${rows.length} 条，占位产品 ${placeholders.length} 个${dry ? '（dry-run，不写库）' : ''}`)

  // 1. 补齐源表引用了、但我们库里还没有的产品（下架的占位产品，后续在后台补内容）
  for (const p of placeholders) {
    const exist = await prisma.product.findFirst({ where: { productIndex: p.productIndex } })
    if (exist) {
      console.log(`  产品已存在，跳过创建：${p.productIndex} ${exist.name}`)
      continue
    }
    console.log(`  创建占位产品：${p.productIndex} ${p.name}`)
    if (dry) continue
    await prisma.product.create({
      data: {
        name: p.name,
        productIndex: p.productIndex,
        productType: 'VR大空间',
        productSource: 0,
        poster: COMING_SOON_POSTER,
        description: '',
        recommendations: '[]',
        notices: '',
        images: '[]',
        // 内容未补齐前默认下架，不会出现在小程序端
        isOnShelf: false,
      },
    })
  }

  // 2. productIndex → 产品 id。同一个索引挂了多个产品时全部关联，并打印出来供人工核对
  const products = await prisma.product.findMany({
    where: { NOT: { productIndex: '' } },
    select: { id: true, name: true, productIndex: true },
  })
  const byIndex = new Map<string, { id: string; name: string }[]>()
  for (const p of products) {
    const list = byIndex.get(p.productIndex) || []
    list.push({ id: p.id, name: p.name })
    byIndex.set(p.productIndex, list)
  }
  for (const [index, list] of byIndex) {
    if (list.length > 1) {
      console.warn(`  ⚠ 产品索引 ${index} 重复挂在 ${list.length} 个产品上：${list.map((p) => p.name).join('、')}`)
    }
  }

  // 3. 按 sourceId upsert 动线，并整体覆盖其产品关联
  const missing = new Set<string>()
  let created = 0
  let updated = 0
  for (const row of rows) {
    const productIds: string[] = []
    for (const index of row.productIndexes) {
      const matched = byIndex.get(index)
      if (!matched) {
        missing.add(index)
        continue
      }
      productIds.push(...matched.map((p) => p.id))
    }

    const data = {
      sizeName: row.sizeName,
      deviceType: row.deviceType,
      recommendDevices: row.recommendDevices,
      maxDevices: row.maxDevices,
      sortOrder: row.sortOrder,
    }
    const exist = await prisma.dongxian.findUnique({ where: { sourceId: row.sourceId } })
    exist ? updated++ : created++
    console.log(
      `  ${exist ? '更新' : '新增'} 动线 #${row.sourceId} ${row.sizeName}（设备类型 ${row.deviceType}）→ 关联 ${productIds.length}/${row.productIndexes.length} 个产品`,
    )
    if (dry) continue
    await prisma.dongxian.upsert({
      where: { sourceId: row.sourceId },
      create: {
        sourceId: row.sourceId,
        ...data,
        products: { connect: productIds.map((id) => ({ id })) },
      },
      update: {
        ...data,
        products: { set: productIds.map((id) => ({ id })) },
      },
    })
  }

  console.log(`完成：新增 ${created} 条，更新 ${updated} 条`)
  if (missing.size > 0) {
    console.warn(`匹配不到产品的索引（${missing.size} 个）：${Array.from(missing).join(', ')}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
