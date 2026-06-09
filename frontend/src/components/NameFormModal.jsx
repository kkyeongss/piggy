import { useState } from 'react'
import Modal from './Modal.jsx'

/** 이름 하나만 입력받는 등록/수정 공용 모달 */
export default function NameFormModal({ title, label, initialValue = '', submitLabel = '저장', onSubmit, onClose }) {
  const [name, setName] = useState(initialValue)
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
      await onSubmit(name.trim())
      onClose()
    } catch (err) {
      setError(err.message || '저장에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nf-name">{label}</label>
          <input
            id="nf-name"
            className="input"
            type="text"
            maxLength={50}
            placeholder={label}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {error && <p className="form-message is-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '저장 중...' : submitLabel}
        </button>
      </form>
    </Modal>
  )
}
