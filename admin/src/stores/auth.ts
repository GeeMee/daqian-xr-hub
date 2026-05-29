import { create } from 'zustand'
import { api } from '../lib/api'

interface AuthState {
  isLoggedIn: boolean
  username: string
  token: string
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: !!localStorage.getItem('token'),
  username: localStorage.getItem('username') || '',
  token: localStorage.getItem('token') || '',
  login: async (username: string, password: string) => {
    try {
      const res = await api.auth.login(username, password)
      localStorage.setItem('token', res.token)
      localStorage.setItem('username', res.username)
      set({ isLoggedIn: true, username: res.username, token: res.token })
      return true
    } catch {
      return false
    }
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    set({ isLoggedIn: false, username: '', token: '' })
  },
  checkAuth: () => {
    return !!get().token
  },
}))
