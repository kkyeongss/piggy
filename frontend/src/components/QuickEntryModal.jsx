import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { createTransaction } from '../api/dashboard.js'
import { getCategories, getMethods } from '../api/management.js'
import { today } from '../util/format.js'

export default function QuickEntryModal({ type, onClose, onCreated }) {
  const isIncome = type === 'INCOME'
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [date, setDate] = useState(today())
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
    return () => {
      alive = false
    }
  }, [])

  // 거래 타입(수입/지출)에 맞는 카테고리만
  const typedCategories = categories.filter((c) => c.type === type)

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
    try {
      await createTransaction({ type, amount: numericAmount, category, title, paymentMethod, memo, date })
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.message || '저장에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={isIncome ? '빠른 수입 입력' : '빠른 지출 입력'} onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="qe-amount">금액</label>
          <input id="qe-amount" className="input" type="text" inputMode="numeric"
            placeholder="0" value={amount ? Number(amount).toLocaleString('ko-KR') : ''}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} />
        </div>

        <div className="field">
          <label htmlFor="qe-title">제목 (선택)</label>
          <input id="qe-title" className="input" type="text" maxLength={100}
            placeholder={isIncome ? '예: 6월 급여' : '예: 스타벅스, 마트 장보기'}
            value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="qe-category">카테고리 (분류)</label>
          <select id="qe-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
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
          <label htmlFor="qe-method">{isIncome ? '입금 수단 (선택)' : '카드/결제수단 (선택)'}</label>
          <select id="qe-method" className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">선택 안 함</option>
            {methods.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="qe-date">날짜</label>
          <input id="qe-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="qe-memo">메모 (선택)</label>
          <input id="qe-memo" className="input" type="text" maxLength={255}
            placeholder="메모" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>

        {error && <p className="form-message is-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '저장 중...' : isIncome ? '수입 추가' : '지출 추가'}
        </button>
      </form>
    </Modal>
  )
}
