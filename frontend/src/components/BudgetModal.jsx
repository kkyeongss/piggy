import { useState } from 'react'
import Modal from './Modal.jsx'
import { setBudget } from '../api/dashboard.js'

export default function BudgetModal({ initial = 0, onClose, onSaved }) {
  const [amount, setAmount] = useState(initial ? String(initial) : '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numeric = Number(amount)
    if (amount === '' || numeric < 0) {
      setError('예산 금액을 올바르게 입력해주세요.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await setBudget(numeric)
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message || '저장에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="월 예산 설정" onClose={onClose}>
      <p className="modal-desc">한 달 지출 예산을 설정하면 소진율이 표시돼요.</p>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="bg-amount">월 예산</label>
          <input id="bg-amount" className="input" type="text" inputMode="numeric"
            placeholder="0" value={amount ? Number(amount).toLocaleString('ko-KR') : ''}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} />
        </div>
        {error && <p className="form-message is-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '저장 중...' : '저장'}
        </button>
      </form>
    </Modal>
  )
}
