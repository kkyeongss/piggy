import { useState } from 'react'
import Modal from './Modal.jsx'

/** 카테고리 등록/수정: 이름 + '저축으로 집계' 여부 */
export default function CategoryFormModal({ title, initialName = '', initialSavings = false, submitLabel = '저장', onSubmit, onClose }) {
  const [name, setName] = useState(initialName)
  const [savings, setSavings] = useState(initialSavings)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(name.trim(), savings)
      onClose()
    } catch (err) {
      setError(err.message || '저장에 실패했어요.')
      setSubmitting(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="cf-name">카테고리 이름</label>
          <input id="cf-name" className="input" type="text" maxLength={50}
            placeholder="카테고리 이름" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <label className="check-row">
          <input type="checkbox" checked={savings} onChange={(e) => setSavings(e.target.checked)} />
          <span className="check-text">
            저축으로 집계
            <em>‘현재 모은 현금’에 합산돼요</em>
          </span>
        </label>

        {error && <p className="form-message is-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '저장 중...' : submitLabel}
        </button>
      </form>
    </Modal>
  )
}
