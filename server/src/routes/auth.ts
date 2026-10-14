import { Router } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../db'
import { verifyPassword } from '../lib/password'

export const authRouter = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body

  // 1) 环境变量内置超级管理员（始终可用，避免被锁在系统外）
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: 'super' }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token, username, role: 'super' })
  }

  // 2) 数据库管理员账号
  try {
    const admin = await prisma.admin.findUnique({ where: { username } })
    if (admin && verifyPassword(password, admin.password)) {
      await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })
      const token = jwt.sign({ username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '7d' })
      return res.json({ token, username: admin.username, role: admin.role })
    }
  } catch (e) {
    // 数据库异常时按凭证错误处理，避免泄露内部信息
  }

  return res.status(401).json({ error: '账号或密码错误' })
})

authRouter.get('/me', (req, res) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' })
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { username: string }
    res.json({ username: payload.username })
  } catch {
    return res.status(401).json({ error: '登录已过期' })
  }
})
