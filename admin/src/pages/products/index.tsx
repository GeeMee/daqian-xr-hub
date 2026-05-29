import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Search, Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

type SortField = 'name' | 'createdAt' | 'sortOrder'
type SortDir = 'asc' | 'desc'

export function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('sortOrder')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const loadData = async () => {
    const [prodRes, catRes] = await Promise.all([
      api.products.list({ search, category: categoryFilter, status: statusFilter }),
      api.categories.list(),
    ])
    setProducts(prodRes.data)
    setCategories(catRes.data)
  }

  useEffect(() => { loadData() }, [search, categoryFilter, statusFilter])

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

  const toggleShelf = async (id: string, current: boolean) => {
    try {
      await api.products.update(id, { isOnShelf: !current })
    } catch (e: any) {
      alert(e.message || '操作失败')
    }
    loadData()
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

  const getCategoryName = (catId: string) => categories.find((c) => c.id === catId)?.name || '-'

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
          <option value="">全部分类</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option value="">全部状态</option>
          <option value="on">已上架</option>
          <option value="off">已下架</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">海报</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort('name')}>
                <span className="inline-flex items-center gap-1">产品名称 <SortIcon field="name" /></span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">分类</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">推荐</th>
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
            {sorted.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 text-xs font-mono">{product.id}</td>
                <td className="px-4 py-3"><img src={product.poster} alt="" className="w-9 h-12 rounded object-cover" /></td>
                <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                <td className="px-4 py-3 text-gray-600">{getCategoryName(product.categoryId)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${product.isRecommended ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
                    {product.isRecommended ? '是' : '否'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleShelf(product.id, product.isOnShelf)}
                    className={`text-xs px-2 py-0.5 rounded cursor-pointer ${product.isOnShelf ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {product.isOnShelf ? '已上架' : '已下架'}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500">{product.sortOrder}</td>
                <td className="px-4 py-3 text-gray-500">{product.createdAt?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/products/${product.id}/edit`)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Pencil size={14} /></button>
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
