import { create } from 'zustand'

interface AuthState {
  isLoggedIn: boolean
  username: string
  role: 'super' | 'normal'
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
  username: localStorage.getItem('username') || '',
  role: (localStorage.getItem('role') as 'super' | 'normal') || 'super',
  login: (username: string, _password: string) => {
    if (username && _password.length >= 6) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username)
      localStorage.setItem('role', 'super')
      set({ isLoggedIn: true, username, role: 'super' })
      return true
    }
    return false
  },
  logout: () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    set({ isLoggedIn: false, username: '', role: 'super' })
  },
}))
