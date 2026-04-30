import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../api/endpoints'

interface User {
  id: string
  email: string
  name: string
  is_active: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isLoggedIn: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.login(email, password)
      const { access_token } = response.data

      // Save token to localStorage
      localStorage.setItem('access_token', access_token)

      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(access_token.split('.')[1]))
        set({
          token: access_token,
          isLoggedIn: true,
          isLoading: false,
          error: null,
          user: {
            id: payload.sub,
            email: payload.email,
            name: payload.email.split('@')[0],
            is_active: true,
          }
        })
      } catch {
        set({
          token: access_token,
          isLoggedIn: true,
          isLoading: false,
          error: null,
        })
      }
      return true
      
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed'
      set({ isLoading: false, error: message, isLoggedIn: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    set({
      user: null,
      token: null,
      isLoggedIn: false,
      error: null,
    })
  },

  setUser: (user: User) => set({ user }),
  clearError: () => set({ error: null }),
}),
    {
      name: 'auth-storage',
    }
  )
)