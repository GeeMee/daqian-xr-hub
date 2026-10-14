import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-500',
  viewed: 'bg-blue-50 text-blue-600',
  replied: 'bg-emerald-50 text-emerald-600',
}
const STATUS_LABEL: Record<string, string> = {
  pending: '暂未查阅',
  viewed: '已查阅',
  replied: '已答复',
}

export function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<string | null>(null)
  const [editing, setEditing] = useState<any | null>(null)
  const [replyText, setReplyText] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.suggestions
      .list()
      .then((res) => setSuggestions(res.data))
      .catch((e) => console.error('加载建议失败:', e))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openReply = (s: any) => {
    setEditing(s)
    setReplyText(s.reply || '')
  }

  const patchLocal = (updated: any) => {
    setSuggestions((list) => list.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)))
  }

  const markViewed = async (s: any) => {
    if (s.status !== 'pending') return
    try {
      const res = await api.suggestions.update(s.id, { status: 'viewed' })
      patchLocal(res.data)
    } catch (e: any) {
      alert(e.message || '操作失败')
    }
  }

  const saveReply = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const res = await api.suggestions.update(editing.id, { reply: replyText.trim() })
      patchLocal(res.data)
      setEditing(null)
    } catch (e: any) {
      alert(e.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">建议箱</h2>
        <span className="text-sm text-gray-500">共 {suggestions.length} 条</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">加载中...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-36">提交时间</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">建议内容</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-40">图片</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-36">联系方式</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">状态</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-28">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suggestions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.createdAt?.slice(0, 16).replace('T', ' ')}</td>
                  <td className="px-4 py-3 text-gray-900 whitespace-pre-wrap break-words">
                    {s.content}
                    {s.reply && (
                      <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 rounded-md px-2 py-1.5 whitespace-pre-wrap break-words">
                        <span className="font-medium">回复：</span>{s.reply}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(s.images || []).map((url: string) => (
                        <img
                          key={url}
                          src={ossImg(url, 120)}
                          alt=""
                          loading="lazy"
                          onClick={() => setPreview(url)}
                          className="w-12 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:opacity-80"
                        />
                      ))}
                      {(!s.images || s.images.length === 0) && <span className="text-gray-300">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.contact || <span className="text-gray-300">-</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs whitespace-nowrap ${STATUS_STYLE[s.status] || STATUS_STYLE.pending}`}>
                      {s.statusLabel || STATUS_LABEL[s.status] || STATUS_LABEL.pending}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openReply(s)} className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
                        {s.reply ? '编辑回复' : '回复'}
                      </button>
                      {s.status === 'pending' && (
                        <button onClick={() => markViewed(s)} className="text-blue-500 hover:text-blue-700 text-xs">标记已查阅</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {suggestions.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无建议</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => !saving && setEditing(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-3">回复建议</h3>
            <div className="text-sm text-gray-500 whitespace-pre-wrap break-words bg-gray-50 rounded-lg px-3 py-2 mb-3 max-h-32 overflow-auto">{editing.content}</div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="输入回复内容，用户可在小程序「我的建议」中查看（最多 500 字）"
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">保存后状态将变为「已答复」；清空回复则回到「已查阅」。</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditing(null)} disabled={saving} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={saveReply} disabled={saving} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">{saving ? '保存中...' : '保存回复'}</button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8" onClick={() => setPreview(null)}>
          <img src={ossImg(preview, 1200)} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  )
}
