import { useCallback, useEffect, useMemo, useState } from 'react'
import { getTransactions } from '../api/dashboard.js'
import TransactionFormModal from '../components/TransactionFormModal.jsx'
import { won } from '../util/format.js'
import './HistoryPage.css'

const WEEK = ['일', '월', '화', '수', '목', '금', '토']
const TYPE_TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'INCOME', label: '수입' },
  { key: 'EXPENSE', label: '지출' },
]

function dayLabel(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEK[d.getDay()]})`
}

export default function HistoryPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [txs, setTxs] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(null) // { mode, initial }

  const load = useCallback(() => {
    setError('')
    return getTransactions({ year, month })
      .then((d) => setTxs(d || []))
      .catch((e) => setError(e.message || '불러오지 못했어요.'))
  }, [year, month])

  useEffect(() => { load() }, [load])

  const { income, expense, groups } = useMemo(() => {
    let inc = 0
    let exp = 0
    for (const t of txs) {
      if (t.type === 'INCOME') inc += Number(t.amount)
      else exp += Number(t.amount)
    }
    const filtered = typeFilter === 'ALL' ? txs : txs.filter((t) => t.type === typeFilter)
    const map = new Map()
    for (const t of filtered) {
      if (!map.has(t.date)) map.set(t.date, [])
      map.get(t.date).push(t)
    }
    const dates = [...map.keys()].sort((a, b) => (a < b ? 1 : -1))
    const grouped = dates.map((date) => {
      const items = map.get(date).slice().sort((a, b) => b.id - a.id)
      const dayInc = items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
      const dayExp = items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
      return { date, items, dayInc, dayExp }
    })
    return { income: inc, expense: exp, groups: grouped }
  }, [txs, typeFilter])

  const goPrev = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12) } else setMonth((m) => m - 1)
  }
  const goNext = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1) } else setMonth((m) => m + 1)
  }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1) }

  // 전체/지출 → 지출, 수입 → 수입 으로 추가 폼 기본값 결정
  const openAdd = () => setForm({ mode: 'create', initial: { type: typeFilter === 'INCOME' ? 'INCOME' : 'EXPENSE' } })

  return (
    <div className="history">
      <div className="hist-top">
        <div className="hist-monthnav">
          <button type="button" className="hist-nav" onClick={goPrev} aria-label="이전 달">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="hist-month">{year}년 {month}월</span>
          <button type="button" className="hist-nav" onClick={goNext} aria-label="다음 달">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
          <button type="button" className="hist-today" onClick={goToday}>오늘</button>
        </div>
        <button type="button" className="hist-add" onClick={openAdd}>
          + 내역 추가
        </button>
      </div>

      <div className="hist-summary">
        <div className="hist-sum-item">
          <span className="hist-sum-label">수입</span>
          <span className="hist-sum-value income">+{won(income)}</span>
        </div>
        <div className="hist-sum-divider" />
        <div className="hist-sum-item">
          <span className="hist-sum-label">지출</span>
          <span className="hist-sum-value expense">-{won(expense)}</span>
        </div>
        <div className="hist-sum-divider" />
        <div className="hist-sum-item">
          <span className="hist-sum-label">합계</span>
          <span className="hist-sum-value">{won(income - expense)}</span>
        </div>
      </div>

      <div className="hist-filter">
        {TYPE_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`hist-filter-tab${typeFilter === t.key ? ' active' : ''}`}
            onClick={() => setTypeFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="hist-error">{error}</p>}

      {groups.length === 0 ? (
        <div className="hist-empty">
          <p>이 달의 내역이 없어요.</p>
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            + 내역 추가
          </button>
        </div>
      ) : (
        <div className="hist-list">
          {groups.map((g) => (
            <section key={g.date} className="hist-day">
              <div className="hist-day-head">
                <span className="hist-day-date">{dayLabel(g.date)}</span>
                <span className="hist-day-sum">
                  {g.dayInc > 0 && <span className="income">+{won(g.dayInc)}</span>}
                  {g.dayExp > 0 && <span className="expense">-{won(g.dayExp)}</span>}
                </span>
              </div>
              <ul className="hist-rows">
                {g.items.map((t) => (
                  <li
                    key={t.id}
                    className="hist-row"
                    role="button"
                    tabIndex={0}
                    onClick={() => setForm({ mode: 'edit', initial: t })}
                    onKeyDown={(e) => { if (e.key === 'Enter') setForm({ mode: 'edit', initial: t }) }}
                  >
                    <div className="hist-row-left">
                      <span className="hist-row-cat">{t.category}</span>
                      {t.title && <span className="hist-row-title">{t.title}</span>}
                      {t.memo && <span className="hist-row-memo">{t.memo}</span>}
                    </div>
                    <div className="hist-row-right">
                      <span className={`hist-row-amt ${t.type === 'INCOME' ? 'income' : 'expense'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{won(t.amount)}
                      </span>
                      {t.paymentMethod && <span className="hist-row-pm">{t.paymentMethod}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {form && (
        <TransactionFormModal
          mode={form.mode}
          initial={form.initial}
          onClose={() => setForm(null)}
          onSaved={() => { load(); setForm(null) }}
        />
      )}
    </div>
  )
}
