const BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api'

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
    list: (params?: { search?: string; category?: string; status?: string; pageSize?: number }) => {
      const query = new URLSearchParams()
      if (params?.search) query.set('search', params.search)
      if (params?.category) query.set('category', params.category)
      if (params?.status) query.set('status', params.status)
      query.set('pageSize', String(params?.pageSize ?? 100))
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
    setProducts: (id: string, productIds: string[]) =>
      request<any>(`/categories/${id}/products`, { method: 'POST', body: JSON.stringify({ productIds }) }),
  },
  primaryCategories: {
    list: () => request<{ data: any[] }>('/primary-categories'),
    create: (data: any) => request<any>('/primary-categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/primary-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/primary-categories/${id}`, { method: 'DELETE' }),
    setProducts: (id: string, productIds: string[]) =>
      request<any>(`/primary-categories/${id}/products`, { method: 'POST', body: JSON.stringify({ productIds }) }),
  },
  dongxian: {
    // deviceType 传 0/1 按设备类型筛选，不传或传 -1 返回全部
    list: (params?: { deviceType?: number }) => {
      const query = new URLSearchParams()
      if (params?.deviceType !== undefined && params.deviceType >= 0) {
        query.set('deviceType', String(params.deviceType))
      }
      return request<{ data: any[] }>(`/dongxian?${query}`)
    },
    get: (id: string) => request<any>(`/dongxian/${id}`),
    create: (data: any) => request<any>('/dongxian', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/dongxian/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/dongxian/${id}`, { method: 'DELETE' }),
    setProducts: (id: string, productIds: string[]) =>
      request<any>(`/dongxian/${id}/products`, { method: 'POST', body: JSON.stringify({ productIds }) }),
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
  suggestions: {
    list: () => request<{ data: any[] }>('/suggestions'),
    update: (id: string, data: { reply?: string; status?: string }) =>
      request<{ success: boolean; data: any }>(`/suggestions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  admins: {
    list: () => request<{ data: any[] }>('/admins'),
    create: (data: { username: string; password: string; role: string }) =>
      request<any>('/admins', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { username?: string; password?: string; role?: string }) =>
      request<any>(`/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/admins/${id}`, { method: 'DELETE' }),
  },
  upload: (file: File, onProgress?: (percent: number) => void) => {
    return new Promise<{ url: string }>((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${BASE_URL}/upload`)
      const token = getToken()
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        if (xhr.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          window.location.href = '/login'
          reject(new Error('未登录'))
        } else if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error('Upload failed'))
        }
      }
      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.send(formData)
    })
  },
}
