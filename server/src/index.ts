import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { authMiddleware } from './middleware/auth'
import { productsRouter } from './routes/products'
import { categoriesRouter } from './routes/categories'
import { bannersRouter } from './routes/banners'
import { settingsRouter } from './routes/settings'
import { uploadRouter } from './routes/upload'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})
app.use('/api/auth', authRouter)

app.use('/api', authMiddleware)
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/banners', bannersRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/upload', uploadRouter)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
