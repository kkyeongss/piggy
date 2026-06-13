import { useState } from 'react'
import { login, socialLogin, SOCIAL_PROVIDERS } from '../api/auth.js'
import SignupModal from '../components/SignupModal.jsx'
import FindIdModal from '../components/FindIdModal.jsx'
import FindPasswordModal from '../components/FindPasswordModal.jsx'
import './LoginPage.css'

export default function LoginPage({ onLogin }) {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 'signup' | 'findId' | 'findPassword' | null
  const [openModal, setOpenModal] = useState(null)
  const closeModal = () => setOpenModal(null)

  const canSubmit = loginId.trim() && password.trim() && !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setError('')
    setSubmitting(true)
    try {
      await login(loginId.trim(), password)
      onLogin()
    } catch (err) {
      setError(err.message || '아이디 또는 비밀번호를 확인해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-header">
          <div className="login-logo">
            piggy<span className="login-logo-dot" />
          </div>
          <p className="login-subtitle">간편하게 가계부를 시작해요</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="loginId">아이디</label>
            <input
              id="loginId"
              className="input"
              type="text"
              autoComplete="username"
              placeholder="아이디를 입력하세요"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="form-message is-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <nav className="login-links" aria-label="계정 도움">
          <button type="button" onClick={() => setOpenModal('signup')}>
            회원가입
          </button>
          <span className="login-links-divider" aria-hidden="true" />
          <button type="button" onClick={() => setOpenModal('findId')}>
            아이디 찾기
          </button>
          <span className="login-links-divider" aria-hidden="true" />
          <button type="button" onClick={() => setOpenModal('findPassword')}>
            비밀번호 찾기
          </button>
        </nav>

        <div className="social-list">
          {SOCIAL_PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="social-btn"
              style={{ background: p.bg, color: p.color }}
              onClick={() => socialLogin(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

      </div>

      {openModal === 'signup' && <SignupModal onClose={closeModal} />}
      {openModal === 'findId' && <FindIdModal onClose={closeModal} />}
      {openModal === 'findPassword' && <FindPasswordModal onClose={closeModal} />}
    </div>
  )
}
