import { useState } from 'react'
import Modal from './Modal.jsx'

export default function CategoryFormModal({ title, initialName = '', submitLabel = '저장', onSubmit, onClose }) {
  const [name, setName] = useState(initialName)
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

        {error && <p className="form-message is-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '저장 중...' : submitLabel}
        </button>
      </form>
    </Modal>
  )
}
