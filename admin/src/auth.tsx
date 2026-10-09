import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getToken, setToken } from './api/client'
import { login as apiLogin, me as apiMe } from './api/resources'
import type { MeResponse } from './api/types'

interface AuthContextValue {
  user: MeResponse | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const onSessionChange = () => { if (!getToken()) setUser(null) }
    window.addEventListener('mv-auth-changed', onSessionChange)
    window.addEventListener('storage', onSessionChange)
    return () => {
      window.removeEventListener('mv-auth-changed', onSessionChange)
      window.removeEventListener('storage', onSessionChange)
    }
  }, [])

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    apiMe()
      .then(setUser)
      .catch(() => {
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(username: string, password: string) {
    const res = await apiLogin(username, password)
    setToken(res.accessToken)
    try {
      const info = await apiMe()
      setUser(info)
    } catch (error) {
      setToken(null)
      throw error
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
