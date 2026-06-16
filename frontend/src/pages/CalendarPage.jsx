import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getTransactions } from '../api/dashboard.js'
import DayDetailModal from '../components/DayDetailModal.jsx'
import TransactionFormModal from '../components/TransactionFormModal.jsx'
import './CalendarPage.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const fmt = (n) => Number(n).toLocaleString('ko-KR')

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-12
  const [txs, setTxs] = useState([])
  const [error, setError] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)
  const [form, setForm] = useState(null) // { mode, initial }
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(year)
  const pickerRef = useRef(null)

  const load = useCallback(() => {
    setError('')
    return getTransactions({ year, month })
      .then((d) => setTxs(d || []))
      .catch((e) => setError(e.message || '불러오지 못했어요.'))
  }, [year, month])

  useEffect(() => { load() }, [load])

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    if (!pickerOpen) return
    const onDown = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [pickerOpen])

  const byDay = useMemo(() => {
    const map = {}
    for (const t of txs) {
      const day = Number(t.date.slice(8, 10))
      if (!map[day]) map[day] = { income: 0, expense: 0, saving: 0, items: [] }
      if (t.type === 'INCOME') map[day].income += Number(t.amount)
      else if (t.type === 'EXPENSE') map[day].expense += Number(t.amount)
      else if (t.type === 'SAVING') map[day].saving += Number(t.amount)
      map[day].items.push(t)
    }
    return map
  }, [txs])

  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const goPrev = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12) } else setMonth((m) => m - 1)
  }
  const goNext = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1) } else setMonth((m) => m + 1)
  }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1) }

  const openPicker = () => { setPickerYear(year); setPickerOpen((v) => !v) }
  const pickMonth = (m) => { setYear(pickerYear); setMonth(m); setPickerOpen(false) }

  const isToday = (d) =>
    year === now.getFullYear() && month === now.getMonth() + 1 && d === now.getDate()

  const selectedDateStr = selectedDay
    ? `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null

  const handlePrevDay = () => {
    if (selectedDay === 1) {
      let newMonth = month - 1
      let newYear = year
      if (newMonth === 0) { newMonth = 12; newYear = year - 1 }
      const lastDay = new Date(newYear, newMonth, 0).getDate()
      setYear(newYear)
      setMonth(newMonth)
      setSelectedDay(lastDay)
    } else {
      setSelectedDay((d) => d - 1)
    }
  }

  const handleNextDay = () => {
    const lastDay = new Date(year, month, 0).getDate()
    if (selectedDay === lastDay) {
      let newMonth = month + 1
      let newYear = year
      if (newMonth === 13) { newMonth = 1; newYear = year + 1 }
      setYear(newYear)
      setMonth(newMonth)
      setSelectedDay(1)
    } else {
      setSelectedDay((d) => d + 1)
    }
  }

  return (
    <div className="calendar">
      <div className="cal-header">
        <button type="button" className="cal-nav" onClick={goPrev} aria-label="이전 달">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div className="cal-title-wrap" ref={pickerRef}>
          <button type="button" className="cal-title" onClick={openPicker}>
            {year}년 {month}월
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </button>

          {pickerOpen && (
            <div className="cal-picker">
              <div className="cal-picker-year">
                <button type="button" className="cal-nav sm" onClick={() => setPickerYear((y) => y - 1)} aria-label="이전 해">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <span>{pickerYear}년</span>
                <button type="button" className="cal-nav sm" onClick={() => setPickerYear((y) => y + 1)} aria-label="다음 해">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
              <div className="cal-picker-months">
                {MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`cal-picker-month${pickerYear === year && m === month ? ' active' : ''}`}
                    onClick={() => pickMonth(m)}
                  >
                    {m}월
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="button" className="cal-nav" onClick={goNext} aria-label="다음 달">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>

        <button type="button" className="cal-today" onClick={goToday}>오늘</button>
      </div>

      {error && <p className="cal-error">{error}</p>}

      <div className="cal-weekdays">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`cal-weekday${i === 0 ? ' sun' : ''}${i === 6 ? ' sat' : ''}`}>{w}</div>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((d, idx) => {
          if (d === null) return <div key={`e${idx}`} className="cal-cell empty" />
          const weekday = (firstWeekday + d - 1) % 7
          const data = byDay[d]
          return (
            <button
              type="button"
              key={d}
              className={`cal-cell${isToday(d) ? ' today' : ''}`}
              onClick={() => setSelectedDay(d)}
            >
              <span className={`cal-daynum${weekday === 0 ? ' sun' : ''}${weekday === 6 ? ' sat' : ''}`}>{d}</span>
              {data && (
                <span className="cal-entries">
                  {data.items.map((t) => (
                    <span key={t.id} className={`cal-entry ${t.type === 'INCOME' ? 'income' : t.type === 'SAVING' ? 'saving' : 'expense'}`}>
                      {t.title && <span className="ce-title">{t.title}</span>}
                      {t.paymentMethod && <span className="ce-pm">{t.paymentMethod}</span>}
                      <span className="ce-amt">{t.type === 'INCOME' ? '+' : ''}{fmt(t.amount)}</span>
                      <span className="ce-cat">{t.category}</span>
                    </span>
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selectedDateStr && !form && (
        <DayDetailModal
          dateStr={selectedDateStr}
          items={byDay[selectedDay]?.items || []}
          onClose={() => setSelectedDay(null)}
          onAdd={(dateStr) => setForm({ mode: 'create', initial: { date: dateStr } })}
          onEdit={(t) => setForm({ mode: 'edit', initial: t })}
          onPrev={handlePrevDay}
          onNext={handleNextDay}
        />
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
