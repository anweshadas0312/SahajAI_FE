import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '../types'
import { API_ENDPOINTS } from '../apiConfig'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: (googleToken: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  mockLogin: (role: 'admin' | 'user') => void
  dbConnected: boolean
  checkDbStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sahaj_token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [dbConnected, setDbConnected] = useState<boolean>(false)

  const checkDbStatus = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.DB_STATUS)
      if (res.ok) {
        const data = await res.json()
        setDbConnected(!!data.connected)
      } else {
        setDbConnected(false)
      }
    } catch {
      setDbConnected(false)
    }
  }

  const fetchCurrentUser = async (jwtToken: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user) {
          setUser(data.user)
          return true
        }
      }
    } catch (err) {
      console.warn('Failed to fetch user:', err)
    }
    return false
  }

  useEffect(() => {
    const init = async () => {
      await checkDbStatus()
      if (token) {
        const ok = await fetchCurrentUser(token)
        if (!ok) {
          // If token invalid, check if we have mock user cached
          const cached = localStorage.getItem('sahaj_cached_user')
          if (cached) {
            try {
              setUser(JSON.parse(cached))
            } catch {
              localStorage.removeItem('sahaj_token')
              setToken(null)
            }
          }
        }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()
      if (data.success && data.token) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('sahaj_token', data.token)
        localStorage.setItem('sahaj_cached_user', JSON.stringify(data.user))
        setDbConnected(true)
        return { success: true }
      }
      return { success: false, error: data.error || 'Login failed' }
    } catch (err) {
      return { success: false, error: 'Network or server error. You can use Demo Login below.' }
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (data.success && data.token) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('sahaj_token', data.token)
        localStorage.setItem('sahaj_cached_user', JSON.stringify(data.user))
        setDbConnected(true)
        return { success: true }
      }
      return { success: false, error: data.error || 'Registration failed' }
    } catch (err) {
      return { success: false, error: 'Connection error. Please try again or use Demo Login below.' }
    }
  }

  const loginWithGoogle = async (googleToken: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.GOOGLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      })
      const data = await res.json()
      if (data.success && data.token) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('sahaj_token', data.token)
        localStorage.setItem('sahaj_cached_user', JSON.stringify(data.user))
        setDbConnected(true)
        return { success: true }
      }
      return { success: false, error: data.error || 'Google login failed' }
    } catch (err) {
      return { success: false, error: 'Google authentication error. Please try again.' }
    }
  }

  const mockLogin = (role: 'admin' | 'user') => {
    const mockUser: User = {
      id: role === 'admin' ? 1 : 2,
      username: role === 'admin' ? 'Admin' : 'Sahaj Member',
      email: role === 'admin' ? 'admin@sahaj.ai' : 'user@sahaj.ai',
      role: role,
    }
    const dummyToken = `demo_token_${role}_${Date.now()}`
    setUser(mockUser)
    setToken(dummyToken)
    localStorage.setItem('sahaj_token', dummyToken)
    localStorage.setItem('sahaj_cached_user', JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('sahaj_token')
    localStorage.removeItem('sahaj_cached_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        loginWithGoogle,
        logout,
        mockLogin,
        dbConnected,
        checkDbStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
