import { useState } from 'react'
import Modal from './Modal.jsx'

/** 삭제 등 위험 동작 확인 다이얼로그 */
export default function ConfirmDialog({ title = '삭제', message, confirmLabel = '삭제', onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    setError('')
    setSubmitting(true)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message || '처리에 실패했어요.')
      setSubmitting(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="modal-desc">{message}</p>
      {error && <p className="form-message is-error">{error}</p>}
      <div className="confirm-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
          취소
        </button>
        <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={submitting}>
          {submitting ? '삭제 중...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
