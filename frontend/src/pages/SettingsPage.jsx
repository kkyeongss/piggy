import { useState } from 'react'
import { getTheme, setTheme } from '../util/theme.js'
import './SettingsPage.css'

export default function SettingsPage({ onLogout }) {
  const [dark, setDark] = useState(getTheme() === 'dark')

  const toggleDark = async () => {
    const next = !dark
    setDark(next)
    const theme = next ? 'dark' : 'light'
    setTheme(theme)
    await fetch('/api/auth/me/theme', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    })
  }

  return (
    <div className="settings">
      <h1 className="settings-title">설정</h1>

      <section className="settings-group">
        <h2 className="settings-group-title">화면</h2>
        <div className="settings-card">
          <div className="setting-row">
            <div className="setting-label">
              <span className="setting-name">다크 모드</span>
              <span className="setting-desc">어두운 테마로 전환해요</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={dark} onChange={toggleDark} />
              <span className="switch-track"><span className="switch-thumb" /></span>
            </label>
          </div>
        </div>
      </section>

      <section className="settings-group">
        <h2 className="settings-group-title">정보</h2>
        <div className="settings-card">
          <div className="setting-row">
            <span className="setting-name">앱 이름</span>
            <span className="setting-value">piggy</span>
          </div>
          <div className="setting-row">
            <span className="setting-name">버전</span>
            <span className="setting-value">0.1.0</span>
          </div>
        </div>
      </section>

      <section className="settings-group">
        <h2 className="settings-group-title">계정</h2>
        <div className="settings-card">
          <div className="setting-row">
            <span className="setting-name">로그아웃</span>
            <button type="button" className="btn-logout" onClick={onLogout}>로그아웃</button>
          </div>
        </div>
      </section>
    </div>
  )
}
