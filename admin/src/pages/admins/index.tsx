import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { Admin } from '../../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

function formatLastLogin(value?: string | null) {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '-'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', role: 'normal' as 'super' | 'normal' })

  const loadAdmins = async () => {
    try {
      const res = await api.admins.list()
      setAdmins(res.data)
    } catch (e) {
      console.error('加载管理员失败:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAdmins() }, [])

  const openAdd = () => { setEditingId(null); setForm({ username: '', password: '', role: 'normal' }); setShowDialog(true) }
  const openEdit = (admin: Admin) => {
    setEditingId(admin.id)
    setForm({ username: admin.username, password: '', role: admin.role })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.username.trim()) { alert('请输入账号'); return }
    if (!editingId && !form.password.trim()) { alert('请输入密码'); return }
    setSaving(true)
    try {
      if (editingId) {
        await api.admins.update(editingId, { username: form.username.trim(), password: form.password.trim() || undefined, role: form.role })
      } else {
        await api.admins.create({ username: form.username.trim(), password: form.password.trim(), role: form.role })
      }
      setShowDialog(false)
      await loadAdmins()
    } catch (e: any) {
      alert(e.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`确定删除管理员「${admin.username}」？`)) return
    try {
      await api.admins.delete(admin.id)
      await loadAdmins()
    } catch (e: any) {
      alert(e.message || '删除失败')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">管理员账号管理</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
          <Plus size={16} />新增管理员
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">账号</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">角色</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">最后登录</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">暂无管理员，点击右上角新增</td></tr>
            ) : admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{admin.username}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${admin.role === 'super' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                    {admin.role === 'super' ? '超级管理员' : '普通管理员'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatLastLogin(admin.lastLoginAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(admin)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(admin)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">新增的管理员可直接用「账号 + 密码」登录后台。</p>

      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{editingId ? '编辑管理员' : '新增管理员'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">账号</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="登录账号" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">密码</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? '留空则不修改密码' : '登录密码'} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">角色</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'super' | 'normal' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="normal">普通管理员</option>
                  <option value="super">超级管理员</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">{saving ? '保存中...' : '确定'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
