import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')

  const loadData = async () => {
    const res = await api.categories.list()
    setCategories(res.data)
  }

  useEffect(() => { loadData() }, [])

  const openAdd = () => { setEditingId(null); setName(''); setShowDialog(true) }
  const openEdit = (cat: any) => { setEditingId(cat.id); setName(cat.name); setShowDialog(true) }

  const handleSave = async () => {
    if (!name.trim()) return
    if (editingId) {
      await api.categories.update(editingId, { name: name.trim() })
    } else {
      await api.categories.create({ name: name.trim() })
    }
    setShowDialog(false)
    loadData()
  }

  const handleDelete = async (cat: any) => {
    if (cat.productCount > 0) {
      alert(`该分类下有${cat.productCount}个产品，请先转移产品后再删除`)
      return
    }
    if (confirm('确定删除该分类？')) {
      try {
        await api.categories.delete(cat.id)
        loadData()
      } catch (e: any) {
        alert(e.message)
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">分类管理</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
          <Plus size={16} />新增分类
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">分类名称</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">产品数量</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">创建时间</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{cat.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                <td className="px-4 py-3 text-gray-600">{cat.productCount}</td>
                <td className="px-4 py-3 text-gray-500">{cat.createdAt?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(cat)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
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
            <h3 className="text-base font-semibold text-gray-900 mb-4">{editingId ? '编辑分类' : '新增分类'}</h3>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="分类名称（最多10字）" maxLength={10} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
