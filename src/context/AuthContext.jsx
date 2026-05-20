import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null }
    catch { return null }
  })
  const [token,   setToken]   = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const saveAuth = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('user',  JSON.stringify(userData))
    localStorage.setItem('token', authToken)
  }

  const clearAuth = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('cart')
  }

  // Verify token on app load
  useEffect(() => {
    const verify = async () => {
      const savedToken = localStorage.getItem('token')
      if (!savedToken) { setLoading(false); return }
      try {
        const { data } = await api.get('/auth/me')
        setUser(data.data)
        localStorage.setItem('user', JSON.stringify(data.data))
      } catch {
        clearAuth()
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [])

  const register = useCallback(async (name, email, password) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      saveAuth(data.data, data.data.token)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      return { success: false, message }
    } finally { setLoading(false) }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      saveAuth(data.data, data.data.token)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      return { success: false, message }
    } finally { setLoading(false) }
  }, [])

  const loginWithToken = useCallback(async (authToken) => {
    localStorage.setItem('token', authToken)
    try {
      const { data } = await api.get('/auth/me')
      saveAuth(data.data, authToken)
      return { success: true }
    } catch {
      clearAuth()
      return { success: false }
    }
  }, [])

  // FIXED: no useNavigate — just clearAuth + window.location
  const logout = useCallback(() => {
    clearAuth()
    window.location.replace('/')
  }, [])

  const updateProfile = useCallback(async (formData) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.put('/auth/profile', formData)
      saveAuth(data.data, data.data.token)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed'
      setError(message)
      return { success: false, message }
    } finally { setLoading(false) }
  }, [])

  const isLoggedIn = !!user
  const isAdmin    = user?.role === 'admin'
  const clearError = () => setError(null)

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      register, login, loginWithToken, logout, updateProfile,
      isLoggedIn, isAdmin, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export default AuthContext