import './ManageList.css'

/**
 * 이름 목록 + 행별 수정/삭제 (체크박스 대신 호버 시 노출되는 아이콘 버튼)
 * tabs 가 주어지면 제목 아래 세그먼트 토글 표시 (예: 지출/수입)
 */
export default function ManageList({
  title,
  addLabel,
  items,
  emptyText,
  onAdd,
  onEdit,
  onDelete,
  tabs,
  activeTab,
  onTabChange,
}) {
  return (
    <section className="manage-panel">
      <div className="manage-head">
        <h2 className="manage-title">{title}</h2>
        <button type="button" className="manage-add" onClick={onAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {addLabel}
        </button>
      </div>

      {tabs && (
        <div className="manage-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`manage-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => onTabChange(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <ul className="manage-list">
        {items.length === 0 && <li className="manage-empty">{emptyText}</li>}
        {items.map((item) => (
          <li key={item.id} className="manage-row">
            <span className="manage-name">
              {item.name}
              {item.savings && <span className="manage-badge">저축</span>}
            </span>
            <span className="manage-row-actions">
              <button type="button" className="row-btn" aria-label="수정" onClick={() => onEdit(item)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </svg>
              </button>
              <button type="button" className="row-btn danger" aria-label="삭제" onClick={() => onDelete(item)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
