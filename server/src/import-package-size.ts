// 按「产品大小汇总」表批量写入产品资源包大小（单位 GB，只存数字）。
// 数据文件由本地按产品名匹配后生成（server/data/package-size.json），这里只按 id 落库，可重复执行。
// 用法：npx tsx src/import-package-size.ts data/package-size.json [--dry]
import fs from 'fs'
import prisma from './db'

type Row = { id: string; name: string; packageSize: string }

async function main() {
  const file = process.argv[2]
  const dry = process.argv.includes('--dry')
  if (!file) {
    console.error('缺少数据文件路径，例如：npx tsx src/import-package-size.ts data/package-size.json')
    process.exit(1)
  }
  const rows: Row[] = JSON.parse(fs.readFileSync(file, 'utf-8'))
  console.log(`待写入 ${rows.length} 条${dry ? '（dry-run，不写库）' : ''}`)

  let ok = 0
  let miss = 0
  for (const r of rows) {
    const exist = await prisma.product.findUnique({ where: { id: r.id }, select: { id: true, name: true, packageSize: true } })
    if (!exist) {
      console.warn(`  跳过：id 不存在 ${r.id}（${r.name}）`)
      miss++
      continue
    }
    if (exist.name !== r.name) {
      console.warn(`  ⚠ 名字对不上，仍按 id 写入：库里「${exist.name}」← 表里「${r.name}」`)
    }
    console.log(`  ${exist.name}：${exist.packageSize || '空'} → ${r.packageSize} GB`)
    if (!dry) {
      await prisma.product.update({ where: { id: r.id }, data: { packageSize: r.packageSize } })
    }
    ok++
  }
  console.log(`完成：写入 ${ok} 条，跳过 ${miss} 条`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
