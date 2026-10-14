import { useState, useEffect, useMemo } from 'react'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'
import { Search, X } from 'lucide-react'

interface Props {
  title: string
  // 判断某个产品当前是否已属于该题材/分类（用于预勾选）
  isInitiallySelected: (product: any) => boolean
  onConfirm: (productIds: string[]) => Promise<void> | void
  onClose: () => void
}

export function ProductPickerModal({ title, isInitiallySelected, onConfirm, onClose }: Props) {
  const [products, setProducts] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.products.list({ pageSize: 1000 })
        setProducts(res.data)
        setSelected(new Set(res.data.filter(isInitiallySelected).map((p: any) => p.id)))
      } catch {
        alert('加载产品列表失败')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    if (!kw) return products
    return products.filter((p) => p.name?.toLowerCase().includes(kw))
  }, [products, search])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))
  const toggleAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        filtered.forEach((p) => next.delete(p.id))
      } else {
        filtered.forEach((p) => next.add(p.id))
      }
      return next
    })
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await onConfirm(Array.from(selected))
      onClose()
    } catch (e: any) {
      alert(e.message || '保存失败')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={18} /></button>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索产品名称"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">已选 {selected.size}</span>
        </div>

        <div className="flex-1 overflow-auto px-6 py-2">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">加载中...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">暂无产品</div>
          ) : (
            <>
              <label className="flex items-center gap-2 py-2 text-sm text-gray-600 cursor-pointer border-b border-gray-100">
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} className="rounded border-gray-300" />
                全选当前筛选结果（{filtered.length}）
              </label>
              {filtered.map((p) => (
                <label key={p.id} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-1">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="rounded border-gray-300" />
                  <img src={ossImg(p.poster, 80)} alt="" loading="lazy" className="w-8 h-11 rounded object-cover bg-gray-100" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {p.productType || '未分类'}
                      {p.categories?.length ? ` · ${p.categories.map((c: any) => c.name).join('、')}` : ''}
                    </div>
                  </div>
                </label>
              ))}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
          <button onClick={handleConfirm} disabled={saving} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
            {saving ? '保存中...' : '确定'}
          </button>
        </div>
      </div>
    </div>
  )
}
