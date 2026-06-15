import { useState, useEffect } from 'react'
import { api } from '../../lib/api'

export function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.suggestions
      .list()
      .then((res) => setSuggestions(res.data))
      .catch((e) => console.error('加载建议失败:', e))
      .finally(() => setLoading(false))
  }, [])

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
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-40">提交时间</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">建议内容</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suggestions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.createdAt?.slice(0, 16).replace('T', ' ')}</td>
                  <td className="px-4 py-3 text-gray-900 whitespace-pre-wrap break-words">{s.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {suggestions.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无建议</div>}
        </div>
      )}
    </div>
  )
}
