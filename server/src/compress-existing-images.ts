import 'dotenv/config'
import OSS from 'ali-oss'
import { compressImage, isCompressibleImage } from './image'

// 一次性脚本：把 OSS 上已存在的超大图片压缩覆盖，修复 >20MB 导致的缩略图裂图。
// 用法：
//   预演（只列出不修改）：npx tsx src/compress-existing-images.ts
//   实际执行：           npx tsx src/compress-existing-images.ts --apply
// 执行时会先把原图备份到 daqian-xr-hub/_backup/ 前缀下，确认无误后可手动删除备份。

const ossClient = new OSS({
  region: process.env.ALIYUN_OSS_REGION!,
  endpoint: process.env.ALIYUN_OSS_ENDPOINT!,
  accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.ALIYUN_OSS_BUCKET!,
})

const PREFIX = 'daqian-xr-hub/image/'
const BACKUP_PREFIX = 'daqian-xr-hub/_backup/'
const THRESHOLD = 4 * 1024 * 1024 // 超过 4MB 的图片才处理
const APPLY = process.argv.includes('--apply')

const mb = (n: number) => (n / 1024 / 1024).toFixed(2)

function mimeFromKey(key: string): string {
  const k = key.toLowerCase()
  if (k.endsWith('.png')) return 'image/png'
  if (k.endsWith('.jpg') || k.endsWith('.jpeg')) return 'image/jpeg'
  if (k.endsWith('.webp')) return 'image/webp'
  return ''
}

async function listAll(): Promise<Array<{ name: string; size: number }>> {
  const out: Array<{ name: string; size: number }> = []
  let marker: string | undefined
  do {
    const r: any = await ossClient.list({ prefix: PREFIX, marker, 'max-keys': 1000 }, {})
    for (const o of r.objects || []) out.push({ name: o.name, size: o.size })
    marker = r.nextMarker
  } while (marker)
  return out
}

async function main() {
  console.log(`扫描 OSS ${PREFIX}`)
  console.log(APPLY ? '>>> 应用模式：将压缩并覆盖' : '>>> 预演模式（dry-run）：只列出，不修改。加 --apply 才执行\n')

  const all = await listAll()
  const targets = all
    .filter((o) => o.size > THRESHOLD && isCompressibleImage(mimeFromKey(o.name)))
    .sort((a, b) => b.size - a.size)

  console.log(`共 ${all.length} 个图片对象，其中 ${targets.length} 个 > ${mb(THRESHOLD)}MB 需要压缩：`)
  for (const t of targets) console.log(`  ${mb(t.size).padStart(8)}MB  ${t.name}`)

  if (!APPLY) {
    console.log('\n预演结束。确认无误后加 --apply 执行。')
    return
  }

  console.log('')
  let ok = 0
  let fail = 0
  for (const t of targets) {
    try {
      const got: any = await ossClient.get(t.name)
      const original: Buffer = got.content
      const compressed = await compressImage(original, mimeFromKey(t.name))

      // 先备份原图，再覆盖
      await ossClient.put(t.name.replace(PREFIX, BACKUP_PREFIX), original)
      await ossClient.put(t.name, compressed)

      console.log(`✅ ${t.name}  ${mb(t.size)}MB → ${mb(compressed.length)}MB`)
      ok++
    } catch (e: any) {
      console.error(`❌ ${t.name}: ${e.message}`)
      fail++
    }
  }
  console.log(`\n完成：成功 ${ok}，失败 ${fail}。原图已备份到 ${BACKUP_PREFIX}（确认无问题后可手动删除）。`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
