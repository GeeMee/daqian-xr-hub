import { Router } from 'express'
import prisma from '../db'
import { uploadImageOnly, handleUpload } from '../upload-core'
import { authMiddleware } from '../middleware/auth'

export const suggestionsRouter = Router()

const STATUS_LABEL: Record<string, string> = {
  pending: '暂未查阅',
  viewed: '已查阅',
  replied: '已答复',
}

// 后台只读列表（GET 默认放行）
suggestionsRouter.get('/', async (_req, res) => {
  const list = await prisma.suggestion.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json({
    data: list.map((s) => ({
      ...s,
      images: JSON.parse(s.images || '[]'),
      statusLabel: STATUS_LABEL[s.status] || STATUS_LABEL.pending,
    })),
  })
})

// 用户端按本地保存的 id 批量查询自己提交的建议状态（公开，GET）
// 用法：GET /api/suggestions/status?ids=id1,id2,id3
suggestionsRouter.get('/status', async (req, res) => {
  const ids = (req.query.ids ?? '')
    .toString()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100)
  if (ids.length === 0) return res.json({ data: [] })
  const list = await prisma.suggestion.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({
    data: list.map((s) => ({
      id: s.id,
      content: s.content,
      images: JSON.parse(s.images || '[]'),
      status: s.status,
      statusLabel: STATUS_LABEL[s.status] || STATUS_LABEL.pending,
      reply: s.reply || '',
      repliedAt: s.repliedAt,
      createdAt: s.createdAt,
    })),
  })
})

// 建议箱图片上传（公开，匿名可传；仅图片，10MB）
suggestionsRouter.post('/upload', uploadImageOnly, (req, res) => handleUpload(req, res, { imageOnly: true }))

// 小程序用户提交（公开，无需登录）：内容必填，联系方式（手机号/微信号）必填，图片选填
suggestionsRouter.post('/', async (req, res) => {
  const content = (req.body?.content ?? '').toString().trim()
  const contact = (req.body?.contact ?? '').toString().trim()
  const images = Array.isArray(req.body?.images)
    ? req.body.images.filter((u: unknown) => typeof u === 'string').slice(0, 9)
    : []
  if (!content) {
    return res.status(400).json({ error: '建议内容不能为空' })
  }
  if (content.length > 500) {
    return res.status(400).json({ error: '建议内容最多 500 字' })
  }
  if (!contact) {
    return res.status(400).json({ error: '请填写手机号/微信号' })
  }
  if (contact.length > 50) {
    return res.status(400).json({ error: '联系方式过长' })
  }
  const suggestion = await prisma.suggestion.create({
    data: { content, contact, images: JSON.stringify(images) },
  })
  res.json({ success: true, id: suggestion.id })
})

// 后台回复 / 更新状态（需登录鉴权）。本路由整体在鉴权中间件之前注册，故单独加 authMiddleware。
suggestionsRouter.patch('/:id', authMiddleware, async (req, res) => {
  const id = req.params.id
  const exists = await prisma.suggestion.findUnique({ where: { id } })
  if (!exists) return res.status(404).json({ error: '建议不存在' })

  const data: { status?: string; reply?: string; repliedAt?: Date | null } = {}

  if (typeof req.body?.reply === 'string') {
    const reply = req.body.reply.trim()
    if (reply.length > 500) return res.status(400).json({ error: '回复内容最多 500 字' })
    data.reply = reply
    // 写入回复即视为已答复
    data.status = 'replied'
    data.repliedAt = reply ? new Date() : null
    if (!reply) data.status = 'viewed'
  }

  if (typeof req.body?.status === 'string' && data.status === undefined) {
    if (!['pending', 'viewed', 'replied'].includes(req.body.status)) {
      return res.status(400).json({ error: '状态值非法' })
    }
    data.status = req.body.status
  }

  const updated = await prisma.suggestion.update({ where: { id }, data })
  res.json({
    success: true,
    data: {
      ...updated,
      images: JSON.parse(updated.images || '[]'),
      statusLabel: STATUS_LABEL[updated.status] || STATUS_LABEL.pending,
    },
  })
})
