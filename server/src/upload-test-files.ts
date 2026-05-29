import 'dotenv/config'
import OSS from 'ali-oss'
import https from 'https'
import http from 'http'

const ossClient = new OSS({
  region: process.env.ALIYUN_OSS_REGION!,
  endpoint: process.env.ALIYUN_OSS_ENDPOINT!,
  accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.ALIYUN_OSS_BUCKET!,
})

function downloadBuffer(url: string, maxRedirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (maxRedirects <= 0) return reject(new Error('Too many redirects'))
        return resolve(downloadBuffer(res.headers.location, maxRedirects - 1))
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function uploadTestFiles() {
  console.log('Uploading test files to OSS...')

  const testFiles = [
    { name: 'product-001.jpg', source: 'https://picsum.photos/seed/xr1/400/533' },
    { name: 'product-002.jpg', source: 'https://picsum.photos/seed/xr2/400/533' },
    { name: 'product-003.jpg', source: 'https://picsum.photos/seed/xr3/400/533' },
    { name: 'product-004.jpg', source: 'https://picsum.photos/seed/xr4/400/533' },
    { name: 'product-005.jpg', source: 'https://picsum.photos/seed/xr5/400/533' },
    { name: 'product-006.jpg', source: 'https://picsum.photos/seed/xr6/400/533' },
    { name: 'product-007.jpg', source: 'https://picsum.photos/seed/xr7/400/533' },
    { name: 'product-008.jpg', source: 'https://picsum.photos/seed/xr8/400/533' },
    { name: 'banner-001.jpg', source: 'https://picsum.photos/seed/banner1/750/350' },
    { name: 'banner-002.jpg', source: 'https://picsum.photos/seed/banner2/750/350' },
    { name: 'banner-003.jpg', source: 'https://picsum.photos/seed/banner3/750/350' },
  ]

  for (const file of testFiles) {
    try {
      console.log(`  Downloading ${file.source}...`)
      const buffer = await downloadBuffer(file.source)
      const ossPath = `daqian-xr-hub/image/${file.name}`
      console.log(`  Uploading to ${ossPath} (${buffer.length} bytes)...`)
      await ossClient.put(ossPath, buffer)
      console.log(`  Done: http://cdn.daqianmijing.com/${ossPath}`)
    } catch (e: any) {
      console.error(`  Failed ${file.name}:`, e.message)
    }
  }

  console.log('\nAll done! Test CDN URL:')
  console.log('http://cdn.daqianmijing.com/daqian-xr-hub/image/product-001.jpg')
}

uploadTestFiles()
