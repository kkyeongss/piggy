import './Sidebar.css'

export const MENU_ITEMS = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'transactions', label: '수입/지출 내역' },
  { key: 'calendar', label: '달력' },
  { key: 'categories', label: '카테고리/지출방법 관리' },
  { key: 'settings', label: '설정' },
]

export default function Sidebar({ active, onSelect, onCollapse }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <button type="button" className="sidebar-logo" onClick={() => onSelect('dashboard')} aria-label="대시보드로 이동">
          piggy<span className="sidebar-logo-dot" />
        </button>
        <button type="button" className="sidebar-collapse" aria-label="메뉴 접기" onClick={onCollapse}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      <nav className="sidebar-nav">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`sidebar-item${active === item.key ? ' active' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
