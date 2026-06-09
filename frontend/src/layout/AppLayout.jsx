import { useState } from 'react'
import Sidebar, { MENU_ITEMS } from '../components/Sidebar.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import ManagementPage from '../pages/ManagementPage.jsx'
import CalendarPage from '../pages/CalendarPage.jsx'
import HistoryPage from '../pages/HistoryPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import './AppLayout.css'

export default function AppLayout() {
  const [active, setActive] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const label = MENU_ITEMS.find((m) => m.key === active)?.label

  return (
    <div className={`app-layout${collapsed ? ' collapsed' : ''}`}>
      <Sidebar active={active} onSelect={setActive} onCollapse={() => setCollapsed(true)} />

      {collapsed && (
        <button type="button" className="sidebar-open" aria-label="메뉴 열기" onClick={() => setCollapsed(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      )}

      <main className="app-content">
        {active === 'dashboard' && <DashboardPage />}
        {active === 'categories' && <ManagementPage />}
        {active === 'calendar' && <CalendarPage />}
        {active === 'transactions' && <HistoryPage />}
        {active === 'settings' && <SettingsPage />}
        {active !== 'dashboard' && active !== 'categories' && active !== 'calendar' && active !== 'transactions' && active !== 'settings' && (
          <div className="app-placeholder">
            <p className="app-placeholder-title">{label}</p>
            <p className="app-placeholder-desc">곧 만들 화면이에요.</p>
          </div>
        )}
      </main>
    </div>
  )
}
