import Modal from './Modal.jsx'
import { won } from '../util/format.js'
import './DayDetailModal.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function DayDetailModal({ dateStr, items = [], onClose, onAdd, onEdit, onPrev, onNext }) {
  const d = new Date(dateStr)
  const dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`

  const title = (
    <span className="day-title-nav">
      <button type="button" className="day-nav-btn" onClick={onPrev} aria-label="이전 날">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <span>{dateLabel}</span>
      <button type="button" className="day-nav-btn" onClick={onNext} aria-label="다음 날">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
      </button>
    </span>
  )

  const income = items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const expense = items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  const saving = items.filter((t) => t.type === 'SAVING').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <Modal title={title} onClose={onClose} wide>
      <div className="day-summary">
        <div className="day-summary-row">
          <span className="day-summary-label">수입</span>
          <span className="day-summary-value income">+{won(income)}</span>
        </div>
        <div className="day-summary-row">
          <span className="day-summary-label">지출</span>
          <span className="day-summary-value expense">-{won(expense)}</span>
        </div>
        <div className="day-summary-row">
          <span className="day-summary-label">저축</span>
          <span className="day-summary-value saving">{won(saving)}</span>
        </div>
        {onAdd && (
          <button type="button" className="btn btn-primary day-add" onClick={() => onAdd(dateStr)}>
            + 추가
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="day-empty">이 날의 내역이 없어요.</p>
      ) : (
        <ul className="day-tx-list">
          {items.map((t) => {
            const clickable = Boolean(onEdit)
            const typeClass = t.type === 'INCOME' ? 'income' : t.type === 'SAVING' ? 'saving' : 'expense'
            const prefix = t.type === 'INCOME' ? '+' : ''
            return (
              <li
                key={t.id}
                className={`day-tx${clickable ? ' clickable' : ''}`}
                onClick={clickable ? () => onEdit(t) : undefined}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={clickable ? (e) => { if (e.key === 'Enter') onEdit(t) } : undefined}
              >
                <div className="day-tx-left">
                  <div className="day-tx-top">
                    <span className={`day-tx-type-badge ${typeClass}`}>
                      {t.type === 'INCOME' ? '수입' : t.type === 'SAVING' ? '저축' : '지출'}
                    </span>
                    <span className="day-tx-cat">{t.category}</span>
                  </div>
                  {t.title && <span className="day-tx-title">{t.title}</span>}
                  {t.memo && <span className="day-tx-memo">{t.memo}</span>}
                </div>
                <div className="day-tx-right">
                  <span className={`day-tx-amt ${typeClass}`}>
                    {prefix}{won(t.amount)}
                  </span>
                  {t.paymentMethod && <span className="day-tx-pm">{t.paymentMethod}</span>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {onEdit && items.length > 0 && <p className="day-hint">내역을 누르면 수정할 수 있어요.</p>}
    </Modal>
  )
}
