const BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://daqianxr-admin.daqianmijing.com/api'
const DEFAULT_TIMEOUT = 8000
const SORT_TIMEOUT = 5000

function request<T>(path: string, timeout = DEFAULT_TIMEOUT): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${path}`,
      timeout,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else {
          reject(new Error(`Request failed: ${res.statusCode}`))
        }
      },
      fail: (err) => reject(err),
    })
  })
}

function postRequest<T>(url: string, data: any, timeout = DEFAULT_TIMEOUT): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'POST',
      timeout,
      header: { 'Content-Type': 'application/json' },
      data,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else {
          reject(new Error(`Request failed: ${res.statusCode}`))
        }
      },
      fail: (err) => reject(err),
    })
  })
}

export const api = {
  getHomeData: () => request<{
    banners: any[]
    recommended: any[]
    recent: any[]
  }>('/products/home'),

  getCategories: () => request<{ data: any[] }>('/categories'),

  getPrimaryCategories: () => request<{ data: any[] }>('/primary-categories'),

  getProducts: (opts?: { categoryId?: string; status?: 'on' | 'off' }) => {
    const params: string[] = ['pageSize=100']
    if (opts?.categoryId) params.push(`category=${opts.categoryId}`)
    if (opts?.status) params.push(`status=${opts.status}`)
    return request<{ data: any[] }>(`/products?${params.join('&')}`)
  },

  getUpcoming: () => request<{ recommended: any[]; all: any[] }>('/products/upcoming'),

  getProduct: (id: string) => request<any>(`/products/${id}`),

  getSortList: (type: number) =>
    request<{ data: string[] }>(`/products/sort-list?type=${type}`, SORT_TIMEOUT).then((res) => res.data || []),

  submitSuggestion: (payload: { content: string; images?: string[]; contact?: string }) =>
    postRequest<{ success: boolean; id: string }>(`${BASE_URL}/suggestions`, payload),

  // 按本地保存的 id 查询自己提交的建议状态
  getMySuggestions: (ids: string[]) =>
    request<{ data: any[] }>(`/suggestions/status?ids=${encodeURIComponent(ids.join(','))}`).then((res) => res.data || []),

  uploadSuggestionImage: (filePath: string) =>
    new Promise<string>((resolve, reject) => {
      uni.uploadFile({
        url: `${BASE_URL}/suggestions/upload`,
        filePath,
        name: 'file',
        timeout: 30000,
        success: (res) => {
          if (res.statusCode === 200) {
            try {
              resolve((JSON.parse(res.data) as { url: string }).url)
            } catch {
              reject(new Error('上传结果解析失败'))
            }
          } else {
            reject(new Error(`上传失败: ${res.statusCode}`))
          }
        },
        fail: (err) => reject(err),
      })
    }),
}
