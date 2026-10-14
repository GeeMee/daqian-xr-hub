import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Plus, Pencil, Trash2, ListChecks, MessageSquareText } from 'lucide-react'
import { ProductPickerModal } from '../../components/shared/ProductPickerModal'
import { RichTextEditor } from '../../components/shared/RichTextEditor'

type TabKey = 'theme' | 'primary'

const TAB_LABELS: Record<TabKey, string> = { theme: '题材', primary: '一级分类' }

export function CategoriesPage() {
  const [tab, setTab] = useState<TabKey>('theme')
  const [items, setItems] = useState<any[]>([])

  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')

  // 批量选择产品的目标（题材或一级分类）
  const [picker, setPicker] = useState<any | null>(null)

  // 温馨提示模板编辑（仅一级分类）
  const [tplEditing, setTplEditing] = useState<any | null>(null)
  const [tplValue, setTplValue] = useState('')
  const [tplSaving, setTplSaving] = useState(false)

  const openTplEdit = (item: any) => {
    setTplValue(item.noticeTemplate || '')
    setTplEditing(item)
  }

  const handleTplSave = async () => {
    if (!tplEditing) return
    setTplSaving(true)
    try {
      await api.primaryCategories.update(tplEditing.id, { noticeTemplate: tplValue })
      setTplEditing(null)
      loadData()
    } catch (e: any) {
      alert(e.message || '保存失败')
    } finally {
      setTplSaving(false)
    }
  }

  const apiFor = (t: TabKey) => (t === 'theme' ? api.categories : api.primaryCategories)

  const loadData = async () => {
    const res = await apiFor(tab).list()
    setItems(res.data)
  }

  useEffect(() => { loadData() }, [tab])

  const openAdd = () => { setEditingId(null); setName(''); setShowDialog(true) }
  const openEdit = (item: any) => { setEditingId(item.id); setName(item.name); setShowDialog(true) }

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      if (editingId) {
        await apiFor(tab).update(editingId, { name: name.trim() })
      } else {
        await apiFor(tab).create({ name: name.trim() })
      }
      setShowDialog(false)
      loadData()
    } catch (e: any) {
      alert(e.message || '保存失败')
    }
  }

  const handleDelete = async (item: any) => {
    const label = TAB_LABELS[tab]
    if (item.productCount > 0) {
      alert(`该${label}下有${item.productCount}个产品，请先转移产品后再删除`)
      return
    }
    if (confirm(`确定删除该${label}？`)) {
      try {
        await apiFor(tab).delete(item.id)
        loadData()
      } catch (e: any) {
        alert(e.message)
      }
    }
  }

  const handleBatchConfirm = async (productIds: string[]) => {
    if (!picker) return
    await apiFor(tab).setProducts(picker.id, productIds)
    setPicker(null)
    loadData()
  }

  const pickerIsSelected = (product: any) => {
    if (!picker) return false
    return tab === 'theme'
      ? (product.categories || []).some((c: any) => c.id === picker.id)
      : product.productType === picker.name
  }

  const label = TAB_LABELS[tab]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">题材管理</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
          <Plus size={16} />新增{label}
        </button>
      </div>

      {/* Tab 切换：题材 / 一级分类 */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {(['theme', 'primary'] as TabKey[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{label}名称</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">产品数量</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">创建时间</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{item.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-600">{item.productCount}</td>
                <td className="px-4 py-3 text-gray-500">{item.createdAt?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPicker(item)} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100">
                      <ListChecks size={14} />批量选择产品
                    </button>
                    {tab === 'primary' && (
                      <button onClick={() => openTplEdit(item)} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100">
                        <MessageSquareText size={14} />温馨提示模板
                      </button>
                    )}
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(item)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无数据</div>}
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{editingId ? `编辑${label}` : `新增${label}`}</h3>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`${label}名称（最多10字）`} maxLength={10} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">确定</button>
            </div>
          </div>
        </div>
      )}

      {tplEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-1">温馨提示模板 · {tplEditing.name}</h3>
            <p className="text-xs text-gray-400 mb-4">新建产品选择「{tplEditing.name}」大类时，将自动带入此模板作为产品的温馨提示；特殊产品可在产品编辑页单独修改，不影响此模板。</p>
            <div className="max-h-[60vh] overflow-y-auto">
              <RichTextEditor value={tplValue} onChange={setTplValue} placeholder="观演须知、注意事项等，可用【】标注小标题" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setTplEditing(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleTplSave} disabled={tplSaving} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">{tplSaving ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}

      {picker && (
        <ProductPickerModal
          title={`批量选择产品 · ${label}「${picker.name}」`}
          isInitiallySelected={pickerIsSelected}
          onConfirm={handleBatchConfirm}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}
