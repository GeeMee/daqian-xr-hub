import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export function BannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formProductId, setFormProductId] = useState('')
  const [formSort, setFormSort] = useState(0)
  const [formImage, setFormImage] = useState('')
  const [formError, setFormError] = useState('')
  const [uploading, setUploading] = useState(false)

  const loadData = async () => {
    const [bannerRes, prodRes] = await Promise.all([
      api.banners.list(),
      api.products.list({ status: 'on' }),
    ])
    setBanners(bannerRes.data)
    setProducts(prodRes.data)
  }

  useEffect(() => { loadData() }, [])

  const openAdd = () => { setEditingId(null); setFormProductId(''); setFormSort(0); setFormImage(''); setFormError(''); setShowDialog(true) }
  const openEdit = (b: any) => { setEditingId(b.id); setFormProductId(b.productId); setFormSort(b.sortOrder); setFormImage(b.image); setFormError(''); setShowDialog(true) }

  const handleSave = async () => {
    if (!formImage && !editingId) {
      setFormError('请上传轮播图图片')
      return
    }
    if (!formProductId) {
      setFormError('请选择跳转产品')
      return
    }
    setFormError('')
    try {
      if (editingId) {
        await api.banners.update(editingId, { image: formImage, productId: formProductId, sortOrder: formSort })
      } else {
        await api.banners.create({ image: formImage, productId: formProductId, sortOrder: formSort })
      }
      setShowDialog(false)
      loadData()
    } catch (e: any) {
      setFormError(e.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定删除该轮播图？')) {
      await api.banners.delete(id)
      loadData()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">轮播图管理</h2>
        <button onClick={openAdd} disabled={banners.length >= 5} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
          <Plus size={16} />新增轮播图
        </button>
      </div>

      {banners.length >= 5 && <p className="text-sm text-amber-600 mb-4">最多允许添加5张轮播图</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">缩略图</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">跳转产品</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">排序</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">创建时间</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><img src={banner.image} alt="" className="w-24 h-12 rounded object-cover" /></td>
                <td className="px-4 py-3 text-gray-900">{banner.productName}</td>
                <td className="px-4 py-3 text-gray-600">{banner.sortOrder}</td>
                <td className="px-4 py-3 text-gray-500">{banner.createdAt?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(banner)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(banner.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{editingId ? '编辑轮播图' : '新增轮播图'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">轮播图 <span className="text-red-500">*</span></label>
                {formImage && <img src={formImage} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />}
                <label className={`px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer inline-block ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? '上传中...' : (formImage ? '重新上传' : '上传图片')}
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploading(true)
                      try {
                        const { url } = await api.upload(file)
                        setFormImage(url)
                        setFormError('')
                      } catch { setFormError('图片上传失败') }
                      setUploading(false)
                    }
                  }} />
                </label>
                {uploading && <span className="text-xs text-blue-500 animate-pulse ml-2">正在上传...</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">跳转产品 <span className="text-red-500">*</span></label>
                <select value={formProductId} onChange={(e) => { setFormProductId(e.target.value); setFormError('') }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">请选择产品</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input type="number" value={formSort} onChange={(e) => setFormSort(Number(e.target.value))} min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            {formError && <p className="text-sm text-red-500 mt-3">{formError}</p>}
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
