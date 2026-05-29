import { Router } from 'express'
import prisma from '../db'

export const settingsRouter = Router()

settingsRouter.get('/', async (_req, res) => {
  let settings = await prisma.setting.findUnique({ where: { id: 'main' } })
  if (!settings) {
    settings = await prisma.setting.create({ data: { id: 'main' } })
  }
  res.json(settings)
})

settingsRouter.put('/', async (req, res) => {
  const settings = await prisma.setting.upsert({
    where: { id: 'main' },
    update: req.body,
    create: { id: 'main', ...req.body },
  })
  res.json(settings)
})
