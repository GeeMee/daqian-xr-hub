import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { DEVICE_TYPES, deviceTypeLabel } from '../../lib/productTypes'
import { Plus, Pencil, Trash2, ListChecks } from 'lucide-react'
import { ProductPickerModal } from '../../components/shared/ProductPickerModal'

// -1 = 全部，其余对应 DEVICE_TYPES 的 value
const TABS = [{ value: -1, label: '全部' }, ...DEVICE_TYPES]

const emptyForm = { sizeName: '', deviceType: 0, recommendDevices: 0, maxDevices: 0, sortOrder: 0 }

export function DongxianPage() {
  const [tab, setTab] = useState(-1)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  // 批量选择产品的目标动线
  const [picker, setPicker] = useState<any | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.dongxian.list({ deviceType: tab })
      setItems(res.data)
    } catch (e: any) {
      alert(e.message || '加载动线失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [tab])

  const openAdd = () => {
    setEditingId(null)
    // 在某个设备类型页签下新增时，默认带上该设备类型
    setForm({ ...emptyForm, deviceType: tab >= 0 ? tab : 0 })
    setShowDialog(true)
  }

  const openEdit = (item: any) => {
    setEditingId(item.id)
    setForm({
      sizeName: item.sizeName || '',
      deviceType: item.deviceType ?? 0,
      recommendDevices: item.recommendDevices ?? 0,
      maxDevices: item.maxDevices ?? 0,
      sortOrder: item.sortOrder ?? 0,
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.sizeName.trim()) { alert('请填写动线尺寸'); return }
    try {
      if (editingId) {
        await api.dongxian.update(editingId, form)
      } else {
        await api.dongxian.create(form)
      }
      setShowDialog(false)
      loadData()
    } catch (e: any) {
      alert(e.message || '保存失败')
    }
  }

  const handleDelete = async (item: any) => {
    if (!confirm(`确定删除动线「${item.sizeName} · ${deviceTypeLabel(item.deviceType)}」？产品本身不会被删除。`)) return
    try {
      await api.dongxian.delete(item.id)
      loadData()
    } catch (e: any) {
      alert(e.message || '删除失败')
    }
  }

  const handleBatchConfirm = async (productIds: string[]) => {
    if (!picker) return
    await api.dongxian.setProducts(picker.id, productIds)
    setPicker(null)
    loadData()
  }

  const pickerIsSelected = (product: any) => {
    if (!picker) return false
    return (picker.products || []).some((p: any) => p.id === product.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">动线管理</h2>
          <p className="text-xs text-gray-400 mt-1">一条动线 = 场地尺寸 + 设备类型，下面挂着该场地可运营的产品。仅后台使用，不在小程序端展示。</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
          <Plus size={16} />新增动线
        </button>
      </div>

      {/* Tab 切换：按设备类型筛选 */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${tab === t.value ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">动线尺寸</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">设备类型</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">推荐设备数</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">最大设备数</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">适配产品</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">排序</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 align-top">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{item.sizeName}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 text-xs rounded ${item.deviceType === 0 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {deviceTypeLabel(item.deviceType)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{item.recommendDevices}</td>
                <td className="px-4 py-3 text-gray-600">{item.maxDevices}</td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {(item.products || []).map((p: any) => (
                      <span key={p.id} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">{p.name}</span>
                    ))}
                    {item.productCount === 0 && <span className="text-xs text-gray-400">未关联产品</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{item.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPicker(item)} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100 whitespace-nowrap">
                      <ListChecks size={14} />选择产品
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(item)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && items.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无动线</div>}
        {loading && <div className="py-12 text-center text-gray-400 text-sm">加载中...</div>}
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{editingId ? '编辑动线' : '新增动线'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">动线尺寸</label>
                <input
                  value={form.sizeName}
                  onChange={(e) => setForm({ ...form, sizeName: e.target.value })}
                  placeholder="如 8x10"
                  maxLength={32}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">设备类型</label>
                <select
                  value={form.deviceType}
                  onChange={(e) => setForm({ ...form, deviceType: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {DEVICE_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">推荐设备数</label>
                  <input
                    type="number"
                    min={0}
                    value={form.recommendDevices}
                    onChange={(e) => setForm({ ...form, recommendDevices: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">最大设备数</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxDevices}
                    onChange={(e) => setForm({ ...form, maxDevices: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">排序</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">数值越小越靠前，导入时按场地面积自动填充</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">确定</button>
            </div>
          </div>
        </div>
      )}

      {picker && (
        <ProductPickerModal
          title={`选择产品 · 动线「${picker.sizeName} · ${deviceTypeLabel(picker.deviceType)}」`}
          isInitiallySelected={pickerIsSelected}
          onConfirm={handleBatchConfirm}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}
