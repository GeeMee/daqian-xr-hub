// 给所有已有产品补上默认动线「6x10 · Pico 4 UE」。
// 幂等：已经挂了的产品直接跳过，可重复执行。
// 用法：npx tsx src/backfill-default-dongxian.ts [--dry] [--skip-neo3]
//   --dry        只打印不写库
//   --skip-neo3  跳过名字以 neo3 结尾的 Pico Neo3 专供产品（默认不跳过，全部产品都补）
import prisma from './db'
import { findDefaultDongxian, DEFAULT_DONGXIAN_SIZE } from './lib/defaultDongxian'

async function main() {
  const dry = process.argv.includes('--dry')
  const target = await findDefaultDongxian()
  if (!target) {
    console.error(`找不到动线「${DEFAULT_DONGXIAN_SIZE} · Pico 4 UE」，请先在后台「动线管理」里创建`)
    process.exit(1)
  }

  const products = await prisma.product.findMany({
    select: { id: true, name: true, dongxians: { select: { id: true } } },
    orderBy: { createdAt: 'asc' },
  })
  const skipNeo3 = process.argv.includes('--skip-neo3')
  const todo = products
    .filter((p) => !(skipNeo3 && /neo3\s*$/i.test(p.name)))
    .filter((p) => !p.dongxians.some((d) => d.id === target.id))
  console.log(
    `产品共 ${products.length} 个，需要补「${target.sizeName} · Pico 4 UE」的 ${todo.length} 个${dry ? '（dry-run，不写库）' : ''}`,
  )

  for (const p of todo) {
    console.log(`  + ${p.name}`)
    if (dry) continue
    await prisma.product.update({
      where: { id: p.id },
      data: { dongxians: { connect: { id: target.id } } },
    })
  }

  console.log(`完成：${dry ? 0 : todo.length} 个产品已补上默认动线`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
