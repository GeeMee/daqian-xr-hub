import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'
import { RichTextEditor } from '../../components/shared/RichTextEditor'
import { ImageCropUploader } from '../../components/shared/ImageCropUploader'
import {
  PRODUCT_TYPES,
  PRODUCT_SOURCES,
  DEVICE_TYPES,
  deviceTypeLabel,
  DEFAULT_DONGXIAN_SIZE,
  DEFAULT_DONGXIAN_DEVICE,
} from '../../lib/productTypes'
import { PACKAGE_SIZE_UNIT } from '../../lib/packageSize'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

const tabs = ['基础信息', '详细信息', '推荐设置', '上下架设置']
// 每个产品最多 5 个视频，详情页按此顺序自上而下排布
const MAX_VIDEOS = 5
const presetIcons = ['🌊', '🚀', '🧩', '🎭', '✨', '👻', '🏰', '🔑', '🦖', '🌋', '🎮', '🌃', '⚡', '🐉', '🎆', '❄️', '🚂', '🧠', '💎', '🎪']

export function ProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = !!id

  // 返回列表并保留来源页码（从列表「编辑」带过来的 ?from=N）
  const backToList = () => {
    const from = searchParams.get('from')
    navigate(from ? `/products?page=${from}` : '/products')
  }

  const [categories, setCategories] = useState<any[]>([])
  const [primaryTypes, setPrimaryTypes] = useState<string[]>([...PRODUCT_TYPES])
  // 一级分类完整数据（含各自的温馨提示模板）
  const [primaryCats, setPrimaryCats] = useState<any[]>([])
  // 全部动线，按设备类型分组展示供勾选
  const [dongxians, setDongxians] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState('')
  const [videoProgress, setVideoProgress] = useState(0)
  const [form, setForm] = useState({
    name: '',
    productType: '',
    productIndex: '',
    productSource: 0,
    packageSize: '',
    categoryIds: [] as string[],
    dongxianIds: [] as string[],
    poster: '',
    videos: [] as string[],
    shortDesc: '',
    horrorLevel: 0,
    puzzleLevel: 0,
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
        const [catRes, primaryRes, dongxianRes] = await Promise.all([
          api.categories.list(),
          api.primaryCategories.list().catch(() => null),
          api.dongxian.list().catch(() => null),
        ])
        setCategories(catRes.data)
        if (dongxianRes?.data) {
          setDongxians(dongxianRes.data)
          // 新建产品默认勾上「6x10 · Pico 4 UE」（每个产品都支持这条动线）
          if (!isEdit) {
            const def = dongxianRes.data.find(
              (dx: any) => dx.sizeName === DEFAULT_DONGXIAN_SIZE && dx.deviceType === DEFAULT_DONGXIAN_DEVICE,
            )
            if (def) setForm((prev) => ({ ...prev, dongxianIds: [def.id] }))
          }
        }
        if (primaryRes?.data?.length) {
          setPrimaryCats(primaryRes.data)
          setPrimaryTypes(primaryRes.data.map((c: any) => c.name))
        }
        if (isEdit) {
          const product = await api.products.get(id!)
          setForm({
            name: product.name,
            productType: product.productType || '',
            productIndex: product.productIndex || '',
            productSource: product.productSource ?? 0,
            packageSize: product.packageSize || '',
            categoryIds: (product.categories || []).map((c: any) => c.id),
            dongxianIds: product.dongxianIds || (product.dongxians || []).map((d: any) => d.id),
            poster: product.poster,
            // 老产品只有单个 video 字段，读取时回落成单元素数组
            videos: product.videos?.length ? product.videos : (product.video ? [product.video] : []),
            shortDesc: product.shortDesc,
            horrorLevel: product.horrorLevel,
            puzzleLevel: product.puzzleLevel ?? 0,
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

  // 选择一级大类：新建产品且「温馨提示」尚未手动改动过（为空或仍是某个大类的模板原文）时，
  // 自动带入所选大类的温馨提示模板；已有内容被用户改过则不覆盖
  const selectPrimaryType = (t: string) => {
    const next = form.productType === t ? '' : t
    setForm((prev) => {
      const plainNotices = prev.notices.replace(/<[^>]*>/g, '').trim()
      const untouched = !plainNotices || primaryCats.some((c) => (c.noticeTemplate || '') === prev.notices)
      const tpl = primaryCats.find((c) => c.name === next)?.noticeTemplate || ''
      const notices = !isEdit && untouched && tpl ? tpl : prev.notices
      return { ...prev, productType: next, notices }
    })
  }

  const toggleCategory = (catId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter((id) => id !== catId)
        : [...prev.categoryIds, catId],
    }))
  }

  const toggleDongxian = (dxId: string) => {
    setForm((prev) => ({
      ...prev,
      dongxianIds: prev.dongxianIds.includes(dxId)
        ? prev.dongxianIds.filter((id) => id !== dxId)
        : [...prev.dongxianIds, dxId],
    }))
  }

  // 一级大类是「VR密室 / VR儿童密室」，或任一题材含「密室」，即视为密室类产品
  const isEscapeRoom =
    form.productType?.includes('密室') ||
    categories
      .filter((c) => form.categoryIds.includes(c.id))
      .some((c) => c.name?.includes('密室'))

  const removeVideo = (index: number) => {
    setForm((prev) => ({ ...prev, videos: prev.videos.filter((_, i) => i !== index) }))
  }
  // 调整视频顺序，直接决定小程序详情页的排布先后
  const moveVideo = (index: number, delta: number) => {
    setForm((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.videos.length) return prev
      const videos = [...prev.videos]
      ;[videos[index], videos[target]] = [videos[target], videos[index]]
      return { ...prev, videos }
    })
  }

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
    if (!form.productType) { alert('请选择一级大类'); return false }
    if (form.categoryIds.length === 0) { alert('请至少选择一个题材'); return false }

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
            <Field label="产品索引">
              <input value={form.productIndex} onChange={(e) => update('productIndex', e.target.value)} placeholder="仅后台使用" className="input" />
              <p className="text-xs text-gray-400 mt-1">仅在后台与数据库中保存，不在小程序端展示</p>
            </Field>
            <Field label="产品类型">
              <select value={form.productSource} onChange={(e) => update('productSource', Number(e.target.value))} className="input">
                {PRODUCT_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">仅在后台与数据库中保存，不在小程序端展示</p>
            </Field>
            <Field label="资源包大小">
              <div className="relative">
                <input
                  value={form.packageSize}
                  onChange={(e) => update('packageSize', e.target.value)}
                  placeholder="只填数字，如 12.5"
                  className="input pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                  {PACKAGE_SIZE_UNIT}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                默认单位 GB，只填数字即可；需要其他单位可直接写成「800MB」。仅在后台与数据库中保存，不在小程序端展示
              </p>
            </Field>
            <Field label="一级大类" required>
              <div className="flex flex-wrap gap-2">
                {primaryTypes.map((t) => {
                  const checked = form.productType === t
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => selectPrimaryType(t)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        checked
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1">单选，决定产品在列表「类型」筛选中的归属</p>
            </Field>
            <Field label="所属题材" required>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const checked = form.categoryIds.includes(c.id)
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleCategory(c.id)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        checked
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  )
                })}
                {categories.length === 0 && <span className="text-sm text-gray-400">暂无题材，请先到「题材管理」添加</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">可多选，点击切换选中状态</p>
            </Field>
            <Field label="适配动线">
              <div className="space-y-3">
                {DEVICE_TYPES.map((d) => {
                  const group = dongxians.filter((dx) => dx.deviceType === d.value)
                  if (group.length === 0) return null
                  return (
                    <div key={d.value}>
                      <div className="text-xs text-gray-400 mb-1.5">{d.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {group.map((dx) => {
                          const checked = form.dongxianIds.includes(dx.id)
                          return (
                            <button
                              type="button"
                              key={dx.id}
                              onClick={() => toggleDongxian(dx.id)}
                              title={`${dx.sizeName} · ${deviceTypeLabel(dx.deviceType)}｜推荐 ${dx.recommendDevices} 台 / 最大 ${dx.maxDevices} 台`}
                              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                checked
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {dx.sizeName}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {dongxians.length === 0 && <span className="text-sm text-gray-400">暂无动线，请先到「动线管理」添加</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">可多选，表示该产品能在哪些场地动线上运营；与「动线管理」页的选择是同一份数据。仅后台使用，不在小程序端展示</p>
            </Field>
            <Field label="产品海报">
              <ImageCropUploader
                value={form.poster}
                onChange={(url) => update('poster', url)}
                aspect={3 / 4}
                ratioHint="3:4 竖版"
                previewClassName="w-[90px] h-[120px] rounded object-cover border border-gray-200"
              />
              <p className="text-xs text-gray-400 mt-1">不上传时将自动使用「敬请期待」官方海报，之后可随时回来替换</p>
            </Field>
            <Field label="产品视频">
              <div className="space-y-3">
                {form.videos.map((url, index) => (
                  <div key={`${url}-${index}`} className="flex items-center gap-3">
                    <span className="w-6 text-xs text-gray-400 font-mono">{index + 1}</span>
                    <video src={url} controls className="w-40 h-24 rounded object-cover bg-black" />
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveVideo(index, -1)} disabled={index === 0} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent" title="上移"><ArrowUp size={16} /></button>
                      <button type="button" onClick={() => moveVideo(index, 1)} disabled={index === form.videos.length - 1} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent" title="下移"><ArrowDown size={16} /></button>
                      <button type="button" onClick={() => removeVideo(index)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="删除"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}

                {form.videos.length < MAX_VIDEOS && (
                  <div className="flex items-center gap-4">
                    <label className={`px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer ${uploading === 'video' ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploading === 'video' ? '上传中...' : '上传视频'}
                      <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setUploading('video')
                          setVideoProgress(0)
                          try {
                            const { url } = await api.upload(file, (percent) => setVideoProgress(percent))
                            setForm((prev) => ({ ...prev, videos: [...prev.videos, url].slice(0, MAX_VIDEOS) }))
                          } catch { alert('视频上传失败') }
                          setUploading('')
                          setVideoProgress(0)
                        }
                        e.target.value = ''
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
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                最多 {MAX_VIDEOS} 个（已添加 {form.videos.length} 个），支持 mp4 格式，单个建议不超过 200MB；
                小程序详情页按上方顺序自上而下排布
              </p>
            </Field>
            <Field label="一句话推荐语">
              <input value={form.shortDesc} onChange={(e) => update('shortDesc', e.target.value)} placeholder="最多20字" maxLength={20} className="input" />
            </Field>
            {isEscapeRoom && (
              <>
                <Field label="恐怖指数">
                  <select value={form.horrorLevel} onChange={(e) => update('horrorLevel', Number(e.target.value))} className="input">
                    {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 0 ? '无' : '★'.repeat(n)}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">选「无」则小程序详情页不显示恐怖指数</p>
                </Field>
                <Field label="解密难度">
                  <select value={form.puzzleLevel} onChange={(e) => update('puzzleLevel', Number(e.target.value))} className="input">
                    {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 0 ? '无' : '★'.repeat(n)}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">选「无」则小程序详情页不显示解密难度，显示时位于恐怖指数下方</p>
                </Field>
              </>
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
                    <img src={ossImg(url, 300)} alt="" loading="lazy" decoding="async" className="w-full h-24 rounded-lg object-cover border border-gray-200" />
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
                    <input value={rec.text} onChange={(e) => updateRecommendation(index, 'text', e.target.value)} placeholder="推荐理由" className="input flex-1" />
                    <button type="button" onClick={() => removeRecommendation(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={addRecommendation} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1"><Plus size={14} />添加推荐理由</button>
              </div>
            </Field>
            <Field label="温馨提示">
              <RichTextEditor value={form.notices} onChange={(val) => update('notices', val)} placeholder="观演须知、注意事项等" />
              <p className="text-xs text-gray-400 mt-1">新建产品选择一级大类时会自动带入该大类的模板（可在「题材管理 → 一级分类」中编辑各大类模板），此处修改仅对当前产品生效</p>
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
        <button onClick={async () => { const ok = await handleSave(); if (ok) backToList() }} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">保存并返回</button>
        <button onClick={backToList} className="px-4 py-2 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50">取消</button>
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
