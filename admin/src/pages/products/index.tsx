import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'
import { PRODUCT_SOURCES, DEVICE_TYPES, deviceTypeLabel } from '../../lib/productTypes'
import { PACKAGE_SIZE_UNIT } from '../../lib/packageSize'
import { Search, Plus, Pencil, Trash2, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'

type SortField = 'name' | 'createdAt' | 'sortOrder'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 20

export function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('sortOrder')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  // 当前页码存进 URL（?page=N），从编辑页返回时即可保留页码
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const setPage = (updater: number | ((p: number) => number)) => {
    const next = typeof updater === 'function' ? updater(page) : updater
    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev)
        if (next <= 1) sp.delete('page')
        else sp.set('page', String(next))
        return sp
      },
      { replace: true },
    )
  }

  const loadData = async () => {
    const [prodRes, catRes] = await Promise.all([
      api.products.list({ search, category: categoryFilter, status: statusFilter }),
      api.categories.list(),
    ])
    setProducts(prodRes.data)
    setCategories(catRes.data)
  }

  useEffect(() => { loadData() }, [search, categoryFilter, statusFilter])

  // 列表页可能长时间开着（自己或同事在别处改了产品名等内容），
  // 标签页重新获得焦点时重拉一次，避免列表显示旧数据、点进详情才是新的
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') loadData() }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [search, categoryFilter, statusFilter])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sorted = [...products].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortField === 'name') return a.name.localeCompare(b.name) * dir
    if (sortField === 'createdAt') return a.createdAt.localeCompare(b.createdAt) * dir
    return (a.sortOrder - b.sortOrder) * dir
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))

  // 筛选 / 排序变化时回到第一页（首次渲染跳过，避免清掉 URL 里带回来的页码）
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setPage(1)
  }, [search, categoryFilter, statusFilter, sortField, sortDir])
  // 数据变少（如删除）导致当前页超界时收敛到最后一页
  // 注意：数据异步加载，products 为空时 totalPages=1，不能在此时收敛，否则会把 URL 带回来的页码冲掉
  useEffect(() => {
    if (products.length > 0 && page > totalPages) setPage(totalPages)
  }, [page, totalPages, products.length])

  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // 行内编辑「产品索引 / 产品类型」：本地乐观更新，失败回退到服务端数据
  const editingRef = useRef('')
  // 排序单独用草稿态：列表默认按 sortOrder 排，边输边写会让当前行跳走，所以失焦/回车才提交
  const [sortDraft, setSortDraft] = useState<Record<string, string>>({})
  const updateLocal = (id: string, patch: Record<string, unknown>) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const saveField = async (id: string, patch: Record<string, unknown>) => {
    try {
      await api.products.update(id, patch)
    } catch (e: any) {
      alert(e.message || '保存失败')
      loadData()
    }
  }

  const commitSort = (id: string, current: number) => {
    const draft = sortDraft[id]
    setSortDraft((prev) => { const next = { ...prev }; delete next[id]; return next })
    if (draft === undefined) return
    const value = Number(draft)
    // 空值或非数字直接放弃这次修改，回到原值
    if (draft.trim() === '' || !Number.isFinite(value) || value === current) return
    const sortOrder = Math.trunc(value)
    updateLocal(id, { sortOrder })
    saveField(id, { sortOrder })
  }

  const toggleShelf = async (id: string, current: boolean) => {
    try {
      await api.products.update(id, { isOnShelf: !current })
    } catch (e: any) {
      alert(e.message || '操作失败')
    }
    loadData()
  }

  const toggleRecommend = async (id: string, current: boolean) => {
    // 乐观更新，避免整页刷新导致的闪烁与排序跳动
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isRecommended: !current } : p)))
    try {
      await api.products.update(id, { isRecommended: !current })
    } catch (e: any) {
      alert(e.message || '操作失败')
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isRecommended: current } : p)))
    }
  }

  const toggleNew = async (id: string, current: boolean) => {
    // 乐观更新，避免整页刷新导致的闪烁与排序跳动
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isNew: !current } : p)))
    try {
      await api.products.update(id, { isNew: !current })
    } catch (e: any) {
      alert(e.message || '操作失败')
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isNew: current } : p)))
    }
  }

  const deleteProduct = async (id: string) => {
    if (confirm('确定删除该产品？')) {
      try {
        await api.products.delete(id)
      } catch (e: any) {
        alert(e.message || '删除失败')
      }
      loadData()
    }
  }

  const getCategoryNames = (product: any) =>
    (product.categories || []).map((c: any) => c.name).join('、') || '-'

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUp size={12} className="text-gray-300" />
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-gray-900" /> : <ArrowDown size={12} className="text-gray-900" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">产品管理</h2>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
        >
          <Plus size={16} />新增产品
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索产品名称"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option value="">全部题材</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option value="">全部状态</option>
          <option value="on">已上架</option>
          <option value="off">已下架</option>
        </select>
      </div>

      {sorted.length > 0 && (
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <span>
            共 {sorted.length} 个产品，第 {page} / {totalPages} 页
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />上一页
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一页<ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 表头列多，窄屏时横向滚动，避免「近期上新」「创建时间」这类标题被挤成两行 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          {/* white-space 可继承，thead 上加一次即可让所有表头单行显示 */}
          <thead className="bg-gray-50 border-b border-gray-200 whitespace-nowrap">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">海报</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort('name')}>
                <span className="inline-flex items-center gap-1">产品名称 <SortIcon field="name" /></span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">产品索引</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">产品类型</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">资源包大小</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">题材</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">动线 · Pico 4 UE</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">动线 · Pico Neo3</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">推荐</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">近期上新</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort('sortOrder')}>
                <span className="inline-flex items-center gap-1">排序 <SortIcon field="sortOrder" /></span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                <span className="inline-flex items-center gap-1">创建时间 <SortIcon field="createdAt" /></span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                  <span title={product.id} className="block max-w-[72px] truncate">{product.id}</span>
                </td>
                <td className="px-4 py-3"><img src={ossImg(product.poster, 100)} alt="" loading="lazy" decoding="async" className="w-9 h-12 rounded object-cover" /></td>
                <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={product.productIndex ?? ''}
                    onChange={(e) => updateLocal(product.id, { productIndex: e.target.value })}
                    onFocus={(e) => { editingRef.current = e.target.value }}
                    onBlur={(e) => { if (e.target.value !== editingRef.current) saveField(product.id, { productIndex: e.target.value }) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                    placeholder="—"
                    className="w-24 px-2 py-1 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={product.productSource ?? 0}
                    onChange={(e) => { const v = Number(e.target.value); updateLocal(product.id, { productSource: v }); saveField(product.id, { productSource: v }) }}
                    className="w-[88px] px-1.5 py-1 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {PRODUCT_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="relative w-24">
                    <input
                      type="text"
                      value={product.packageSize ?? ''}
                      onChange={(e) => updateLocal(product.id, { packageSize: e.target.value })}
                      onFocus={(e) => { editingRef.current = e.target.value }}
                      onBlur={(e) => { if (e.target.value !== editingRef.current) saveField(product.id, { packageSize: e.target.value.trim() }) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                      placeholder="—"
                      title={`只填数字，默认单位 ${PACKAGE_SIZE_UNIT}`}
                      className="w-full pl-2 pr-8 py-1 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                      {PACKAGE_SIZE_UNIT}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{getCategoryNames(product)}</td>
                {DEVICE_TYPES.map((dt) => {
                  const list = (product.dongxians || []).filter((d: any) => d.deviceType === dt.value)
                  return (
                    <td key={dt.value} className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {list.map((d: any) => (
                          <span
                            key={d.id}
                            title={`${d.sizeName} · ${deviceTypeLabel(d.deviceType)}`}
                            className={`text-xs px-1.5 py-0.5 rounded ${dt.value === 0 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}
                          >
                            {d.sizeName}
                          </span>
                        ))}
                        {list.length === 0 && <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                  )
                })}
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRecommend(product.id, !!product.isRecommended)}
                    title="点击切换是否推荐"
                    className={`text-xs px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${product.isRecommended ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    {product.isRecommended ? '是' : '否'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={!!product.isNew}
                    onChange={() => toggleNew(product.id, !!product.isNew)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-gray-900"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleShelf(product.id, product.isOnShelf)}
                    className={`text-xs px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${product.isOnShelf ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {product.isOnShelf ? '已上架' : '已下架'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={sortDraft[product.id] ?? String(product.sortOrder ?? 0)}
                    onChange={(e) => setSortDraft((prev) => ({ ...prev, [product.id]: e.target.value }))}
                    onBlur={() => commitSort(product.id, product.sortOrder ?? 0)}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                    title="数值越小越靠前，回车或点击别处保存"
                    className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{product.createdAt?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/products/${product.id}/edit?from=${page}`)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Pencil size={14} /></button>
                    <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无数据</div>}
      </div>
    </div>
  )
}
