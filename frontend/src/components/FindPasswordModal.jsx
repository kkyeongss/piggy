import { useState } from 'react'
import Modal from './Modal.jsx'
import { findPassword, resetPassword } from '../api/auth.js'

export default function FindPasswordModal({ onClose }) {
  // 'verify' → 'reset' → 'done'
  const [step, setStep] = useState('verify')
  const [form, setForm] = useState({ loginId: '', name: '', phone: '' })
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleVerify = async (e) => {
    e.preventDefault()
    const { loginId, name, phone } = form
    if (!loginId || !name || !phone) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await findPassword(loginId, name, phone.replace(/-/g, ''))
      setStep('reset')
    } catch (err) {
      setError(err.message || '일치하는 정보를 찾지 못했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('새 비밀번호를 입력해주세요.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await resetPassword(form.loginId, form.name, form.phone.replace(/-/g, ''), password)
      setStep('done')
    } catch (err) {
      setError(err.message || '비밀번호 변경에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'done') {
    return (
      <Modal title="비밀번호 변경 완료" onClose={onClose}>
        <p className="modal-desc">새 비밀번호로 변경됐어요. 이제 로그인할 수 있어요.</p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          확인
        </button>
      </Modal>
    )
  }

  if (step === 'reset') {
    return (
      <Modal title="새 비밀번호 설정" onClose={onClose}>
        <p className="modal-desc">본인 확인이 완료됐어요. 새 비밀번호를 입력해주세요.</p>
        <form className="modal-form" onSubmit={handleReset}>
          <div className="field">
            <label htmlFor="rp-password">새 비밀번호</label>
            <input id="rp-password" className="input" type="password" autoComplete="new-password"
              placeholder="새 비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="rp-passwordConfirm">새 비밀번호 확인</label>
            <input id="rp-passwordConfirm" className="input" type="password" autoComplete="new-password"
              placeholder="새 비밀번호 다시 입력" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
          </div>

          {error && <p className="form-message is-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </Modal>
    )
  }

  return (
    <Modal title="비밀번호 찾기" onClose={onClose}>
      <p className="modal-desc">아이디, 이름, 핸드폰 번호로 본인 확인 후 비밀번호를 재설정할 수 있어요.</p>
      <form className="modal-form" onSubmit={handleVerify}>
        <div className="field">
          <label htmlFor="fp-loginId">아이디</label>
          <input id="fp-loginId" className="input" type="text" autoComplete="username"
            placeholder="아이디" value={form.loginId} onChange={update('loginId')} />
        </div>
        <div className="field">
          <label htmlFor="fp-name">이름</label>
          <input id="fp-name" className="input" type="text" autoComplete="name"
            placeholder="이름" value={form.name} onChange={update('name')} />
        </div>
        <div className="field">
          <label htmlFor="fp-phone">핸드폰 번호</label>
          <input id="fp-phone" className="input" type="tel" inputMode="numeric" autoComplete="tel"
            placeholder="01000000000" value={form.phone} onChange={update('phone')} />
        </div>

        {error && <p className="form-message is-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '확인 중...' : '다음'}
        </button>
      </form>
    </Modal>
  )
}
