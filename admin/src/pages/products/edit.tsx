import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { RichTextEditor } from '../../components/shared/RichTextEditor'
import { Plus, Trash2 } from 'lucide-react'

const tabs = ['基础信息', '详细信息', '推荐设置', '上下架设置']
const presetIcons = ['🌊', '🚀', '🧩', '🎭', '✨', '👻', '🏰', '🔑', '🦖', '🌋', '🎮', '🌃', '⚡', '🐉', '🎆', '❄️', '🚂', '🧠', '💎', '🎪']

export function ProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [categories, setCategories] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState('')
  const [videoProgress, setVideoProgress] = useState(0)
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    poster: '',
    video: '',
    shortDesc: '',
    horrorLevel: 1,
    playerCount: '',
    duration: '',
    onlineDate: '',
    description: '',
    recommendations: [] as { icon: string; text: string }[],
    images: [] as string[],
    notices: '',
    isRecommended: false,
    sortOrder: 0,
    isOnShelf: true,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const catRes = await api.categories.list()
        setCategories(catRes.data)
        if (isEdit) {
          const product = await api.products.get(id!)
          setForm({
            name: product.name,
            categoryId: product.categoryId,
            poster: product.poster,
            video: product.video || '',
            shortDesc: product.shortDesc,
            horrorLevel: product.horrorLevel,
            playerCount: product.playerCount,
            duration: product.duration,
            onlineDate: product.onlineDate || '',
            description: product.description,
            recommendations: product.recommendations || [],
            images: product.images || [],
            notices: product.notices,
            isRecommended: product.isRecommended,
            sortOrder: product.sortOrder,
            isOnShelf: product.isOnShelf,
          })
        }
      } catch (e) {
        console.error('加载数据失败:', e)
        alert('加载数据失败，请检查网络连接')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const update = (key: string, value: unknown) => setForm({ ...form, [key]: value })

  const isEscapeRoom = categories.find((c) => c.id === form.categoryId)?.name?.includes('密室') ?? false

  const addRecommendation = () => {
    setForm({ ...form, recommendations: [...form.recommendations, { icon: '✨', text: '' }] })
  }
  const updateRecommendation = (index: number, field: 'icon' | 'text', value: string) => {
    const updated = [...form.recommendations]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, recommendations: updated })
  }
  const removeRecommendation = (index: number) => {
    setForm({ ...form, recommendations: form.recommendations.filter((_, i) => i !== index) })
  }

  const handleSave = async (): Promise<boolean> => {
    if (!form.name.trim()) { alert('请填写产品名称'); return false }
    if (!form.categoryId) { alert('请选择所属分类'); return false }

    // 检查重名
    if (!isEdit) {
      const existing = await api.products.list({ search: form.name.trim() })
      const duplicate = existing.data.find((p: any) => p.name === form.name.trim())
      if (duplicate) {
        const confirmed = confirm(`产品列表中已经有产品「${duplicate.name}」了，确定要保存吗？`)
        if (!confirmed) return false
      }
    }

    try {
      if (isEdit) {
        await api.products.update(id!, form)
      } else {
        await api.products.create(form)
      }
      return true
    } catch (e: any) {
      alert(e.message || '保存失败')
      return false
    }
  }

  if (loading) return <div className="py-12 text-center text-gray-400">加载中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? '编辑产品' : '新增产品'}</h2>
          {isEdit && <p className="text-xs text-gray-400 mt-1 font-mono">ID：{id}</p>}
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} className={`px-4 py-2 text-sm rounded-md transition-colors ${activeTab === i ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 0 && (
          <div className="space-y-5 max-w-2xl">
            <Field label="产品名称" required>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="最多20字" maxLength={20} className="input" />
            </Field>
            <Field label="所属分类" required>
              <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)} className="input">
                <option value="">请选择分类</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="产品海报" required>
              <div className="flex items-center gap-4">
                {form.poster && <img src={form.poster} alt="" className="w-20 h-20 rounded object-cover" />}
                <label className={`px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer ${uploading === 'poster' ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading === 'poster' ? '上传中...' : '上传图片'}
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploading('poster')
                      try {
                        const { url } = await api.upload(file)
                        update('poster', url)
                      } catch { alert('图片上传失败') }
                      setUploading('')
                    }
                  }} />
                </label>
                {uploading === 'poster' && <span className="text-xs text-blue-500 animate-pulse">正在上传图片...</span>}
              </div>
            </Field>
            <Field label="产品视频">
              <div className="flex items-center gap-4">
                {form.video && (
                  <div className="relative">
                    <video src={form.video} className="w-40 h-24 rounded object-cover bg-black" />
                    <button type="button" onClick={() => update('video', '')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                  </div>
                )}
                <label className={`px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer ${uploading === 'video' ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading === 'video' ? '上传中...' : (form.video ? '重新上传' : '上传视频')}
                  <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploading('video')
                      setVideoProgress(0)
                      try {
                        const { url } = await api.upload(file, (percent) => setVideoProgress(percent))
                        update('video', url)
                      } catch { alert('视频上传失败') }
                      setUploading('')
                      setVideoProgress(0)
                    }
                  }} />
                </label>
                {uploading === 'video' && (
                  <div className="flex-1 min-w-[160px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-blue-500">{videoProgress < 100 ? '正在上传视频...' : '上传完成，处理中...'}</span>
                      <span className="text-xs text-gray-500 font-mono">{videoProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${videoProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">支持 mp4 格式，建议不超过 200MB</p>
            </Field>
            <Field label="一句话推荐语">
              <input value={form.shortDesc} onChange={(e) => update('shortDesc', e.target.value)} placeholder="最多20字" maxLength={20} className="input" />
            </Field>
            {isEscapeRoom && (
              <Field label="恐怖指数">
                <select value={form.horrorLevel} onChange={(e) => update('horrorLevel', Number(e.target.value))} className="input">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
                </select>
              </Field>
            )}
            <Field label="适合人数">
              <input value={form.playerCount} onChange={(e) => update('playerCount', e.target.value)} placeholder="例如：4-6人" className="input" />
            </Field>
            <Field label="体验时长">
              <input value={form.duration} onChange={(e) => update('duration', e.target.value)} placeholder="例如：60分钟" className="input" />
            </Field>
            <Field label="上线日期">
              <input type="date" value={form.onlineDate} onChange={(e) => update('onlineDate', e.target.value)} className="input" />
            </Field>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-5 max-w-2xl">
            <Field label="产品简介">
              <RichTextEditor value={form.description} onChange={(val) => update('description', val)} placeholder="详细介绍产品的背景故事、核心剧情、体验亮点" />
            </Field>
            <Field label="产品图片">
              <div className="grid grid-cols-4 gap-3">
                {form.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt="" className="w-full h-24 rounded-lg object-cover border border-gray-200" />
                    <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== index) })} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                ))}
                <label className={`w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 ${uploading === 'images' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Plus size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">{uploading === 'images' ? '上传中...' : '添加图片'}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                    const files = e.target.files
                    if (files && files.length > 0) {
                      setUploading('images')
                      try {
                        const urls: string[] = []
                        for (const file of Array.from(files)) {
                          const { url } = await api.upload(file)
                          urls.push(url)
                        }
                        setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
                      } catch { alert('图片上传失败') }
                      setUploading('')
                    }
                    e.target.value = ''
                  }} />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1">支持多选，图片将在详情页「产品简介」下方展示</p>
            </Field>
            <Field label="官方推荐理由">
              <div className="space-y-3">
                {form.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select value={rec.icon} onChange={(e) => updateRecommendation(index, 'icon', e.target.value)} className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-base text-center">
                      {presetIcons.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                    <input value={rec.text} onChange={(e) => updateRecommendation(index, 'text', e.target.value)} placeholder="推荐理由（最多50字）" maxLength={50} className="input flex-1" />
                    <button type="button" onClick={() => removeRecommendation(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                ))}
                {form.recommendations.length < 5 && (
                  <button type="button" onClick={addRecommendation} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1"><Plus size={14} />添加推荐理由</button>
                )}
              </div>
            </Field>
            <Field label="温馨提示">
              <RichTextEditor value={form.notices} onChange={(val) => update('notices', val)} placeholder="观演须知、注意事项等" />
            </Field>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-5 max-w-2xl">
            <Field label="是否设置为官方推荐">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isRecommended} onChange={(e) => update('isRecommended', e.target.checked)} className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">开启后将在首页「本月推荐」展示</span>
              </label>
            </Field>
            {form.isRecommended && (
              <Field label="推荐排序">
                <input type="number" value={form.sortOrder} onChange={(e) => update('sortOrder', Number(e.target.value))} className="input w-32" min={0} />
                <p className="text-xs text-gray-400 mt-1">数字越小越靠前</p>
              </Field>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-5 max-w-2xl">
            <Field label="是否上架">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isOnShelf} onChange={(e) => update('isOnShelf', e.target.checked)} className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">上架后将在小程序端展示</span>
              </label>
            </Field>
            {!form.isOnShelf && (
              <Field label="是否推荐（即将上映）">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isRecommended} onChange={(e) => update('isRecommended', e.target.checked)} className="rounded border-gray-300" />
                  <span className="text-sm text-gray-600">开启后将在小程序「即将上映」的推荐栏展示</span>
                </label>
              </Field>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={async () => { const ok = await handleSave(); if (ok) navigate('/products') }} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">保存并返回</button>
        <button onClick={() => navigate('/products')} className="px-4 py-2 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50">取消</button>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}
