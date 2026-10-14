import { Router } from 'express'
import { uploadAny, handleUpload } from '../upload-core'

export const uploadRouter = Router()

uploadRouter.post('/', uploadAny, (req, res) => handleUpload(req, res))
