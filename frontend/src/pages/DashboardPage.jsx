import { useCallback, useEffect, useState } from 'react'
import Donut from '../components/charts/Donut.jsx'
import LineChart from '../components/charts/LineChart.jsx'
import TransactionFormModal from '../components/TransactionFormModal.jsx'
import { getDashboard } from '../api/dashboard.js'
import { won, CHART_COLORS } from '../util/format.js'
import './DashboardPage.css'

const now = new Date()
const YEAR = now.getFullYear()
const MONTH = now.getMonth() + 1

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quickType, setQuickType] = useState(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await getDashboard(YEAR, MONTH)
      setData(res)
    } catch (err) {
      setError(err.message || '데이터를 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="dash-state">불러오는 중...</div>
  if (error) return <div className="dash-state is-error">{error}</div>
  if (!data) return null

  const categories = data.categoryExpenses ?? []
  const totalExpense = Number(data.totalExpense ?? 0)
  const catSegments = categories.map((c, i) => ({
    name: c.category,
    value: Number(c.amount),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const weekly = (data.weeklyExpenses ?? []).map((w) => ({ label: w.label, value: Number(w.amount) }))

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">대시보드</h1>
          <p className="dash-subtitle">{YEAR}년 {MONTH}월</p>
        </div>
        <div className="dash-actions">
          <button type="button" className="quick-btn income" onClick={() => setQuickType('INCOME')}>
            빠른 수입 입력
          </button>
          <button type="button" className="quick-btn expense" onClick={() => setQuickType('EXPENSE')}>
            빠른 지출 입력
          </button>
          <button type="button" className="quick-btn saving" onClick={() => setQuickType('SAVING')}>
            빠른 저축 입력
          </button>
        </div>
      </header>

      {/* 분류별 지출 */}
      <section className="card card-categories">
        <h2 className="card-title">분류별 지출</h2>
        <div className="cat-body">
          <div className="cat-chart">
            <Donut segments={catSegments} centerLabel="총 지출" centerSub={won(totalExpense)} tooltip />
          </div>
          <div className="cat-right">
            {categories.length > 0 && (
              <div className="cat-total">
                <span>합계</span>
                <span>{won(totalExpense)}</span>
              </div>
            )}
            <ul className="cat-list">
              {categories.length === 0 && <li className="cat-empty">이번 달 지출 내역이 없어요.</li>}
              {categories.map((c, i) => {
                const amt = Number(c.amount)
                const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0
                return (
                  <li key={c.category} className="cat-item">
                    <span className="cat-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="cat-name">{c.category}</span>
                    <span className="cat-pct">{pct}%</span>
                    <span className="cat-amt">{won(amt)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      <div className="card-row">
        {/* 현재 사용할 수 있는 금액 */}
        <section className="card card-center">
          <h2 className="card-title">현재 사용할 수 있는 금액</h2>
          <p className={`cash-amount${Number(data.availableCash) < 0 ? ' negative' : ''}`}>{won(data.availableCash)}</p>
          <p className="cash-note">전체 수입 − 전체 지출</p>
          <div className="income-section">
            <div className="income-section-header">
              <span>이번 달 수입</span>
              <span className="income-section-total">{won(data.totalIncome)}</span>
            </div>
            {(data.incomeBreakdown ?? []).length > 0 ? (
              <ul className="income-list">
                {(data.incomeBreakdown ?? []).map((c) => (
                  <li key={c.category} className="income-item">
                    <span className="income-name">{c.category}</span>
                    <span className="income-amt">+{won(c.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="savings-hint">이번 달 수입 내역이 없어요.</p>
            )}
          </div>
        </section>

        {/* 현재 모은 현금 */}
        <section className="card card-center">
          <h2 className="card-title">누적 저축</h2>
          <p className="cash-amount saving">{won(data.savingsTotal)}</p>
          <p className="cash-note">이번 달 저축: {won(data.totalSaving ?? 0)}</p>
          {(data.savingsBreakdown ?? []).length > 0 ? (
            <ul className="savings-list">
              {data.savingsBreakdown.map((s) => (
                <li key={s.category} className="savings-item">
                  <span className="savings-name">{s.category}</span>
                  <span className="savings-amt">{won(s.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="savings-hint">저축 카테고리를 추가하고 내역을 입력하면 여기에 표시돼요.</p>
          )}
        </section>

        {/* 주간 지출 추이 */}
        <section className="card">
          <div className="card-title-row">
            <h2 className="card-title">주간 지출 추이</h2>
            <span className="weekly-info-wrap">
              <svg className="weekly-info-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="weekly-tooltip">
                매월 1일부터 7일 단위로 집계<br />
                1주 1~7일 · 2주 8~14일<br />
                3주 15~21일 · 4주 22~28일<br />
                5주 29일~말일<br />
                전월 + 당월 2개월 표시
              </span>
            </span>
          </div>
          <p className="card-sub">전월·당월 주간 지출 합계</p>
          <LineChart points={weekly} />
        </section>
      </div>

      {quickType && (
        <TransactionFormModal mode="create" initial={{ type: quickType }} onClose={() => setQuickType(null)} onSaved={load} />
      )}
    </div>
  )
}
