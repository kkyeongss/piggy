import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { createTransaction, updateTransaction, deleteTransaction } from '../api/dashboard.js'
import { getCategories, getMethods } from '../api/management.js'
import { today } from '../util/format.js'
import './TransactionFormModal.css'

/**
 * 거래 입력/수정 공통 모달. 대시보드·달력 등 어디서나 재사용.
 * - mode: 'create' | 'edit'
 * - initial: 프리필 값 ({ type, amount, category, title, paymentMethod, memo, date, id })
 *   달력에서 날짜 클릭 → { date } 만 넘기면 그 날짜로 생성
 *   내역 클릭 → 전체 거래 객체를 넘기면 수정
 */
export default function TransactionFormModal({ mode = 'create', initial = {}, onClose, onSaved, onDeleted }) {
  const isEdit = mode === 'edit'

  const [type, setType] = useState(initial.type || 'EXPENSE')
  const [amount, setAmount] = useState(initial.amount != null ? String(initial.amount) : '')
  const [title, setTitle] = useState(initial.title || '')
  const [category, setCategory] = useState(initial.category || '')
  const [paymentMethod, setPaymentMethod] = useState(initial.paymentMethod || '')
  const [date, setDate] = useState(initial.date || today())
  const [memo, setMemo] = useState(initial.memo || '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const [categories, setCategories] = useState([])
  const [methods, setMethods] = useState([])

  useEffect(() => {
    let alive = true
    Promise.all([getCategories(), getMethods()])
      .then(([c, m]) => {
        if (alive) {
          setCategories(c || [])
          setMethods(m || [])
        }
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const isIncome = type === 'INCOME'
  const typedCategories = categories.filter((c) => c.type === type)

  const changeType = (t) => {
    if (t === type) return
    setType(t)
    setCategory('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numericAmount = Number(amount)
    if (!amount || numericAmount <= 0) {
      setError('금액을 올바르게 입력해주세요.')
      return
    }
    if (!category) {
      setError('카테고리를 선택해주세요.')
      return
    }
    setError('')
    setSubmitting(true)
    const payload = { type, amount: numericAmount, category, title, paymentMethod, memo, date }
    try {
      if (isEdit) await updateTransaction(initial.id, payload)
      else await createTransaction(payload)
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message || '저장에 실패했어요.')
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await deleteTransaction(initial.id)
      ;(onDeleted || onSaved)?.()
      onClose()
    } catch (err) {
      setError(err.message || '삭제에 실패했어요.')
      setSubmitting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <Modal title={isEdit ? '내역 수정' : '내역 입력'} onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="type-toggle">
          <button type="button" className={`type-tab${!isIncome ? ' active expense' : ''}`} onClick={() => changeType('EXPENSE')}>
            지출
          </button>
          <button type="button" className={`type-tab${isIncome ? ' active income' : ''}`} onClick={() => changeType('INCOME')}>
            수입
          </button>
        </div>

        <div className="field">
          <label htmlFor="tf-amount">금액</label>
          <input id="tf-amount" className="input" type="text" inputMode="numeric"
            placeholder="0" value={amount ? Number(amount).toLocaleString('ko-KR') : ''}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} />
        </div>

        <div className="field">
          <label htmlFor="tf-title">제목 (선택)</label>
          <input id="tf-title" className="input" type="text" maxLength={100}
            placeholder={isIncome ? '예: 6월 급여' : '예: 스타벅스, 마트 장보기'}
            value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="tf-category">카테고리 (분류)</label>
          <select id="tf-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">선택하세요</option>
            {typedCategories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {typedCategories.length === 0 && (
            <p className="field-note">
              등록된 {isIncome ? '수입' : '지출'} 카테고리가 없어요. ‘카테고리/지출방법 관리’에서 먼저 등록해주세요.
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="tf-method">{isIncome ? '입금 수단 (선택)' : '카드/결제수단 (선택)'}</label>
          <select id="tf-method" className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">선택 안 함</option>
            {methods.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="tf-date">날짜</label>
          <input id="tf-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="tf-memo">메모 (선택)</label>
          <input id="tf-memo" className="input" type="text" maxLength={255}
            placeholder="메모" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>

        {error && <p className="form-message is-error">{error}</p>}

        {isEdit && confirmingDelete ? (
          <div className="form-delete-confirm">
            <span className="form-delete-text">이 내역을 삭제할까요?</span>
            <div className="form-delete-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmingDelete(false)} disabled={submitting}>취소</button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        ) : (
          <div className="form-actions">
            {isEdit && (
              <button type="button" className="btn btn-ghost btn-delete" onClick={() => setConfirmingDelete(true)} disabled={submitting}>
                삭제
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '저장 중...' : isEdit ? '수정' : isIncome ? '수입 추가' : '지출 추가'}
            </button>
          </div>
        )}
      </form>
    </Modal>
  )
}
