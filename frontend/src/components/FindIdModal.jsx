import { useState } from 'react'
import Modal from './Modal.jsx'
import { findId } from '../api/auth.js'

export default function FindIdModal({ onClose }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null) // { loginId } 형태로 응답 가정

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !phone) {
      setError('이름과 핸드폰 번호를 입력해주세요.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const data = await findId(name, phone.replace(/-/g, ''))
      setResult(data ?? {})
    } catch (err) {
      setError(err.message || '일치하는 정보를 찾지 못했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <Modal title="아이디 찾기" onClose={onClose}>
        <p className="modal-desc">입력하신 정보와 일치하는 아이디예요.</p>
        <div className="result-box">{result.loginId ?? '확인된 아이디가 없어요.'}</div>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          확인
        </button>
        <style>{`.result-box{padding:16px;border-radius:12px;background:var(--bg-subtle);
          font-size:18px;font-weight:700;text-align:center;color:var(--text-primary);margin:8px 0 12px;}`}</style>
      </Modal>
    )
  }

  return (
    <Modal title="아이디 찾기" onClose={onClose}>
      <p className="modal-desc">가입 시 등록한 이름과 핸드폰 번호로 아이디를 찾을 수 있어요.</p>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="fi-name">이름</label>
          <input id="fi-name" className="input" type="text" autoComplete="name"
            placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="fi-phone">핸드폰 번호</label>
          <input id="fi-phone" className="input" type="tel" inputMode="numeric" autoComplete="tel"
            placeholder="01000000000" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        {error && <p className="form-message is-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '찾는 중...' : '아이디 찾기'}
        </button>
      </form>
    </Modal>
  )
}
