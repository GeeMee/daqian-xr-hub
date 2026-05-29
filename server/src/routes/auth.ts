import { Router } from 'express'
import jwt from 'jsonwebtoken'

export const authRouter = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '账号或密码错误' })
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, username })
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
