import { useState } from 'react'
import { mockAdmins } from '../../mock/data'
import type { Admin } from '../../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ username: '', phone: '', password: '', role: 'normal' as 'super' | 'normal' })

  const openAdd = () => { setEditingId(null); setForm({ username: '', phone: '', password: '', role: 'normal' }); setShowDialog(true) }
  const openEdit = (admin: Admin) => {
    setEditingId(admin.id)
    setForm({ username: admin.username, phone: admin.phone, password: '', role: admin.role })
    setShowDialog(true)
  }

  const handleSave = () => {
    if (!form.username || !form.phone) return
    if (!editingId && !form.password) return
    if (editingId) {
      setAdmins(admins.map((a) => a.id === editingId ? { ...a, username: form.username, phone: form.phone, role: form.role } : a))
    } else {
      const newAdmin: Admin = {
        id: `a-${Date.now()}`,
        username: form.username,
        phone: form.phone,
        role: form.role,
        permissions: [],
        lastLoginAt: '-',
      }
      setAdmins([...admins, newAdmin])
    }
    setShowDialog(false)
  }

  const handleDelete = (admin: Admin) => {
    if (admin.role === 'super') {
      alert('超级管理员不可删除')
      return
    }
    if (confirm('确定删除该管理员？')) {
      setAdmins(admins.filter((a) => a.id !== admin.id))
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">用户名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">手机号</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">角色</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">最后登录</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{admin.username}</td>
                <td className="px-4 py-3 text-gray-600">{admin.phone}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${admin.role === 'super' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                    {admin.role === 'super' ? '超级管理员' : '普通管理员'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{admin.lastLoginAt}</td>
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

      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{editingId ? '编辑管理员' : '新增管理员'}</h3>
            <div className="space-y-3">
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="用户名" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="手机号" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? '留空则不修改密码' : '密码'} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'super' | 'normal' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="normal">普通管理员</option>
                <option value="super">超级管理员</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
