const BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : 'http://8.153.73.225/api'

function request<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${path}`,
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

  getProducts: (opts?: { categoryId?: string; status?: 'on' | 'off' }) => {
    const params: string[] = ['pageSize=100']
    if (opts?.categoryId) params.push(`category=${opts.categoryId}`)
    if (opts?.status) params.push(`status=${opts.status}`)
    return request<{ data: any[] }>(`/products?${params.join('&')}`)
  },

  getUpcoming: () => request<{ recommended: any[]; all: any[] }>('/products/upcoming'),

  getProduct: (id: string) => request<any>(`/products/${id}`),
}
