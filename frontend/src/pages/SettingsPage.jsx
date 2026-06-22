import { useState } from 'react'
import { getTheme, setTheme } from '../util/theme.js'
import './SettingsPage.css'

const RESET_ITEMS = [
  { target: 'income-transactions',  name: '수입 내역',     desc: '등록된 모든 수입 거래를 삭제해요' },
  { target: 'expense-transactions', name: '지출 내역',     desc: '등록된 모든 지출 거래를 삭제해요' },
  { target: 'saving-transactions',  name: '저축 내역',     desc: '등록된 모든 저축 거래를 삭제해요' },
  { target: 'income-categories',    name: '수입 카테고리', desc: '등록된 수입 카테고리를 모두 삭제해요' },
  { target: 'expense-categories',   name: '지출 카테고리', desc: '등록된 지출 카테고리를 모두 삭제해요' },
  { target: 'saving-categories',    name: '저축 카테고리', desc: '등록된 저축 카테고리를 모두 삭제해요' },
  { target: 'payment-methods',      name: '지출방법',      desc: '등록된 결제수단을 모두 삭제해요' },
  { target: 'all',                  name: '전체 초기화',   desc: '모든 거래·카테고리·지출방법을 삭제해요', danger: true },
]

export default function SettingsPage({ onLogout }) {
  const [dark, setDark] = useState(getTheme() === 'dark')
  const [confirming, setConfirming] = useState(null)
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState(null)

  const handleReset = async (target) => {
    setResetting(true)
    try {
      const res = await fetch(`/api/reset/${target}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error()
      setConfirming(null)
      setResetDone(target)
      setTimeout(() => setResetDone(null), 2000)
    } catch {
      alert('초기화에 실패했어요. 다시 시도해주세요.')
    } finally {
      setResetting(false)
    }
  }

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
        <h2 className="settings-group-title">데이터 초기화</h2>
        <div className="settings-card">
          {RESET_ITEMS.map((item) => (
            <div key={item.target} className={`setting-row${item.danger ? ' reset-row-danger' : ''}`}>
              <div className="setting-label">
                <span className="setting-name">{item.name}</span>
                <span className="setting-desc">{item.desc}</span>
              </div>
              {resetDone === item.target ? (
                <span className="reset-done">삭제됨</span>
              ) : confirming === item.target ? (
                <div className="reset-confirm">
                  <button type="button" className="btn-reset-cancel" onClick={() => setConfirming(null)}>취소</button>
                  <button type="button" className={`btn-reset-ok${item.danger ? ' danger' : ''}`}
                    onClick={() => handleReset(item.target)} disabled={resetting}>
                    {resetting ? '삭제 중…' : '삭제'}
                  </button>
                </div>
              ) : (
                <button type="button" className={`btn-reset${item.danger ? ' danger' : ''}`}
                  onClick={() => setConfirming(item.target)}>
                  초기화
                </button>
              )}
            </div>
          ))}
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
