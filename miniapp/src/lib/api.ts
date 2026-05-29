const BASE_URL = 'http://8.153.73.225/api'

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

  getProducts: (categoryId?: string) => {
    const query = categoryId ? `?category=${categoryId}&pageSize=100` : '?pageSize=100'
    return request<{ data: any[] }>(`/products${query}`)
  },

  getProduct: (id: string) => request<any>(`/products/${id}`),
}
