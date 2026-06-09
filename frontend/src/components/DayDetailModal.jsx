import Modal from './Modal.jsx'
import { won } from '../util/format.js'
import './DayDetailModal.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/**
 * 특정 날짜의 거래 내역 모달.
 * onAdd(dateStr): 그 날짜로 입력. onEdit(tx): 내역 클릭 시 수정.
 */
export default function DayDetailModal({ dateStr, items = [], onClose, onAdd, onEdit }) {
  const d = new Date(dateStr)
  const title = `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`

  const income = items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const expense = items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <Modal title={title} onClose={onClose} wide>
      <div className="day-summary">
        <div className="day-summary-item">
          <span className="day-summary-label">수입</span>
          <span className="day-summary-value income">+{won(income)}</span>
        </div>
        <div className="day-summary-item">
          <span className="day-summary-label">지출</span>
          <span className="day-summary-value expense">-{won(expense)}</span>
        </div>
        {onAdd && (
          <button type="button" className="btn btn-primary day-add" onClick={() => onAdd(dateStr)}>
            + 추가
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="day-empty">이 날의 내역이 없어요.{onAdd ? ' ‘+ 추가’로 입력해보세요.' : ''}</p>
      ) : (
        <ul className="day-tx-list">
          {items.map((t) => {
            const clickable = Boolean(onEdit)
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
                  <span className="day-tx-cat">{t.category}</span>
                  {t.title && <span className="day-tx-title">{t.title}</span>}
                  {t.memo && <span className="day-tx-memo">{t.memo}</span>}
                </div>
                <div className="day-tx-right">
                  <span className={`day-tx-amt ${t.type === 'INCOME' ? 'income' : 'expense'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{won(t.amount)}
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
