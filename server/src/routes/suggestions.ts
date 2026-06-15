import { Router } from 'express'
import prisma from '../db'

export const suggestionsRouter = Router()

// 后台只读列表（GET 默认放行）
suggestionsRouter.get('/', async (_req, res) => {
  const data = await prisma.suggestion.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json({ data })
})

// 小程序用户匿名提交（公开，无需登录）
suggestionsRouter.post('/', async (req, res) => {
  const content = (req.body?.content ?? '').toString().trim()
  if (!content) {
    return res.status(400).json({ error: '建议内容不能为空' })
  }
  if (content.length > 500) {
    return res.status(400).json({ error: '建议内容最多 500 字' })
  }
  const suggestion = await prisma.suggestion.create({ data: { content } })
  res.json({ success: true, id: suggestion.id })
})
