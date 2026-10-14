import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

// 使用 Node 内置 crypto 的 scrypt 做密码散列，避免引入额外依赖。
// 存储格式：<salt(hex)>:<hash(hex)>
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const hashBuf = Buffer.from(hash, 'hex')
  const testBuf = scryptSync(plain, salt, 64)
  if (hashBuf.length !== testBuf.length) return false
  return timingSafeEqual(hashBuf, testBuf)
}
