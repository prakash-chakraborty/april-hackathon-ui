import { createContext, useContext, useState, useEffect } from 'react'
import { fetchMe } from '../api/client'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('rc_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    // grab user profile on mount / token change
    fetchMe()
      .then(setUser)
      .catch(() => {
        // token expired or bad, clear it
        localStorage.removeItem('rc_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  function login(accessToken) {
    localStorage.setItem('rc_token', accessToken)
    setToken(accessToken)
  }

  function logout() {
    localStorage.removeItem('rc_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
