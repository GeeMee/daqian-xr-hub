import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'

type Props = {
  /** 当前图片 URL */
  value: string
  /** 上传/裁剪完成回调，返回新图片 URL */
  onChange: (url: string) => void
  /** 裁剪宽高比，例如竖版海报 3/4，横版轮播 4/3 */
  aspect: number
  /** 比例提示文案，例如「3:4 竖版」 */
  ratioHint?: string
  /** 预览框样式（受比例影响，外部传 className 控制大小） */
  previewClassName?: string
}

/**
 * 选图后弹出裁剪框，按固定比例裁剪再上传，保证海报/轮播图比例统一。
 */
export function ImageCropUploader({ value, onChange, aspect, ratioHint, previewClassName }: Props) {
  const [src, setSrc] = useState<string>('') // 待裁剪的本地图片 dataURL
  const [mime, setMime] = useState<string>('image/jpeg')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [areaPixels, setAreaPixels] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMime(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = () => {
      setSrc(reader.result as string)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
    e.target.value = '' // 允许重复选同一张
  }

  const onCropComplete = useCallback((_a: Area, pixels: Area) => setAreaPixels(pixels), [])

  const confirmCrop = async () => {
    if (!src || !areaPixels) return
    setUploading(true)
    try {
      const blob = await cropToBlob(src, areaPixels, mime)
      const ext = mime.includes('png') ? 'png' : 'jpg'
      const file = new File([blob], `crop-${Date.now()}.${ext}`, { type: blob.type })
      const { url } = await api.upload(file)
      onChange(url)
      setSrc('')
    } catch {
      alert('图片处理或上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        {value && <img src={ossImg(value, 300)} alt="" className={previewClassName || 'w-20 h-20 rounded object-cover border border-gray-200'} />}
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            {value ? '重新上传' : '上传图片'}
          </button>
          {ratioHint && <p className="text-xs text-gray-400 mt-1">将裁剪为 {ratioHint}</p>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>

      {src && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 text-sm font-semibold text-gray-900">
              裁剪图片{ratioHint ? `（${ratioHint}）` : ''}
            </div>
            <div className="relative w-full h-[360px] bg-gray-900">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="px-5 py-3 flex items-center gap-3">
              <span className="text-xs text-gray-500 whitespace-nowrap">缩放</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSrc('')}
                disabled={uploading}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmCrop}
                disabled={uploading}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {uploading ? '上传中...' : '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** 按裁剪区域把图片绘制到 canvas 并导出 Blob */
function cropToBlob(src: string, area: Area, mime: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(area.width)
      canvas.height = Math.round(area.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('no ctx'))
      ctx.drawImage(
        img,
        area.x, area.y, area.width, area.height,
        0, 0, area.width, area.height,
      )
      const outMime = mime.includes('png') ? 'image/png' : 'image/jpeg'
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
        outMime,
        0.92,
      )
    }
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}
