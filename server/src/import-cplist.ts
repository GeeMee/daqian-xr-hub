// 一次性导入脚本：把 tbl_cplist 匹配好的 产品索引 / 产品类型 写入已存在的产品。
// 匹配（按产品名精准匹配）已在本地完成，这里只按产品 id 落库，确定性强、可重复执行。
// 用法：npx tsx src/import-cplist.ts <updates.json>  [--dry]
import fs from 'fs'
import prisma from './db'

type Row = { id: string; name: string; productIndex: string; productSource: number }

async function main() {
  const file = process.argv[2]
  const dry = process.argv.includes('--dry')
  if (!file) { console.error('缺少 updates.json 路径'); process.exit(1) }
  const rows: Row[] = JSON.parse(fs.readFileSync(file, 'utf-8'))
  console.log(`待更新 ${rows.length} 条${dry ? '（dry-run，不写库）' : ''}`)

  let ok = 0, miss = 0
  for (const r of rows) {
    const exist = await prisma.product.findUnique({ where: { id: r.id }, select: { id: true, name: true } })
    if (!exist) { console.warn(`  跳过：id 不存在 ${r.id} (${r.name})`); miss++; continue }
    if (!dry) {
      await prisma.product.update({
        where: { id: r.id },
        data: { productIndex: r.productIndex, productSource: r.productSource },
      })
    }
    ok++
  }
  console.log(`完成：更新 ${ok} 条，跳过 ${miss} 条`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
