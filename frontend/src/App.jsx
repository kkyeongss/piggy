import { useState, useEffect } from 'react'
import AppLayout from './layout/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { setTheme } from './util/theme.js'

export default function App() {
  const [authChecked, setAuthChecked] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async r => {
        if (r.ok) {
          const data = await r.json()
          if (data.theme) setTheme(data.theme)
          setLoggedIn(true)
        } else {
          setLoggedIn(false)
        }
        setAuthChecked(true)
      })
      .catch(() => {
        setLoggedIn(false)
        setAuthChecked(true)
      })
  }, [])

  if (!authChecked) return null

  return loggedIn
    ? <AppLayout onLogout={() => setLoggedIn(false)} />
    : <LoginPage onLogin={() => setLoggedIn(true)} />
}
