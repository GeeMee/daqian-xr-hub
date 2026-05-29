const BASE_URL = import.meta.env.PROD ? 'http://8.153.73.225/api' : 'http://localhost:3000/api'

function getToken() {
  return localStorage.getItem('token') || ''
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    window.location.href = '/login'
    throw new Error('未登录')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '登录失败' }))
        throw new Error(err.error || '登录失败')
      }
      return res.json() as Promise<{ token: string; username: string }>
    },
  },
  products: {
    list: (params?: { search?: string; category?: string; status?: string }) => {
      const query = new URLSearchParams()
      if (params?.search) query.set('search', params.search)
      if (params?.category) query.set('category', params.category)
      if (params?.status) query.set('status', params.status)
      query.set('pageSize', '100')
      return request<{ data: any[]; total: number }>(`/products?${query}`)
    },
    get: (id: string) => request<any>(`/products/${id}`),
    create: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request<{ data: any[] }>('/categories'),
    create: (data: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/categories/${id}`, { method: 'DELETE' }),
  },
  banners: {
    list: () => request<{ data: any[] }>('/banners'),
    create: (data: any) => request<any>('/banners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/banners/${id}`, { method: 'DELETE' }),
  },
  settings: {
    get: () => request<any>('/settings'),
    update: (data: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', headers, body: formData })
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
      throw new Error('未登录')
    }
    if (!res.ok) throw new Error('Upload failed')
    return res.json() as Promise<{ url: string }>
  },
}
