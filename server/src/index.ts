import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { authMiddleware } from './middleware/auth'
import { productsRouter } from './routes/products'
import { categoriesRouter } from './routes/categories'
import { primaryCategoriesRouter } from './routes/primaryCategories'
import { bannersRouter } from './routes/banners'
import { settingsRouter } from './routes/settings'
import { uploadRouter } from './routes/upload'
import { suggestionsRouter } from './routes/suggestions'
import { adminsRouter } from './routes/admins'
import { dongxianRouter } from './routes/dongxian'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
// 后台/小程序读到的都必须是最新数据，禁止浏览器与中间层缓存接口响应
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})
app.use('/uploads', express.static('uploads'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})
app.use('/api/auth', authRouter)
// 建议箱：用户匿名提交(POST)需公开，放在鉴权中间件之前
app.use('/api/suggestions', suggestionsRouter)

app.use('/api', authMiddleware)
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/primary-categories', primaryCategoriesRouter)
app.use('/api/dongxian', dongxianRouter)
app.use('/api/banners', bannersRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/admins', adminsRouter)
app.use('/api/upload', uploadRouter)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
