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
      </section>

      <div className="card-row">
        {/* 현재 사용할 수 있는 금액 */}
        <section className="card card-center">
          <h2 className="card-title">현재 사용할 수 있는 금액</h2>
          <p className={`cash-amount${Number(data.availableCash) < 0 ? ' negative' : ''}`}>{won(data.availableCash)}</p>
          <p className="cash-note">전체 현금에서 저축액을 뺀 금액</p>
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
          <h2 className="card-title">주간 지출 추이</h2>
          <p className="card-sub">이번 달 주간 지출 합계</p>
          <LineChart points={weekly} />
        </section>
      </div>

      {quickType && (
        <TransactionFormModal mode="create" initial={{ type: quickType }} onClose={() => setQuickType(null)} onSaved={load} />
      )}
    </div>
  )
}
