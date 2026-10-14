import { Router } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../db'
import { hashPassword } from '../lib/password'

export const adminsRouter = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// 管理员管理属于敏感操作，所有方法（含 GET 列表）都要求已登录
adminsRouter.use((req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' })
  }
  try {
    jwt.verify(header.slice(7), JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: '登录已过期' })
  }
})

// 统一剔除密码字段
function sanitize(admin: any) {
  if (!admin) return admin
  const { password, ...rest } = admin
  return rest
}

adminsRouter.get('/', async (_req, res) => {
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: 'asc' } })
  res.json({ data: admins.map(sanitize) })
})

adminsRouter.post('/', async (req, res) => {
  const username = (req.body.username || '').trim()
  const password = (req.body.password || '').trim()
  const role = req.body.role === 'super' ? 'super' : 'normal'
  if (!username) return res.status(400).json({ error: '请输入账号' })
  if (!password) return res.status(400).json({ error: '请输入密码' })

  const exists = await prisma.admin.findUnique({ where: { username } })
  if (exists) return res.status(400).json({ error: '该账号已存在' })

  const admin = await prisma.admin.create({
    data: { username, password: hashPassword(password), role },
  })
  res.json(sanitize(admin))
})

adminsRouter.put('/:id', async (req, res) => {
  const data: any = {}
  if (typeof req.body.username === 'string' && req.body.username.trim()) {
    const username = req.body.username.trim()
    const dup = await prisma.admin.findUnique({ where: { username } })
    if (dup && dup.id !== req.params.id) return res.status(400).json({ error: '该账号已存在' })
    data.username = username
  }
  if (req.body.role) data.role = req.body.role === 'super' ? 'super' : 'normal'
  // 密码留空则不修改
  if (typeof req.body.password === 'string' && req.body.password.trim()) {
    data.password = hashPassword(req.body.password.trim())
  }
  try {
    const admin = await prisma.admin.update({ where: { id: req.params.id }, data })
    res.json(sanitize(admin))
  } catch (e: any) {
    res.status(400).json({ error: e.message || '更新失败' })
  }
})

adminsRouter.delete('/:id', async (req, res) => {
  const target = await prisma.admin.findUnique({ where: { id: req.params.id } })
  if (!target) return res.status(404).json({ error: '管理员不存在' })
  // 至少保留一个超级管理员
  if (target.role === 'super') {
    const superCount = await prisma.admin.count({ where: { role: 'super' } })
    if (superCount <= 1) return res.status(400).json({ error: '至少保留一个超级管理员' })
  }
  await prisma.admin.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})
