// 금액 포맷 (원)
export function won(value) {
  const n = Number(value ?? 0)
  return `${n.toLocaleString('ko-KR')}원`
}

// 오늘 날짜 (yyyy-MM-dd)
export function today() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// 카테고리 차트 색상 팔레트
export const CHART_COLORS = [
  '#3182f6', '#00c2b3', '#ff9f40', '#f06595',
  '#845ef7', '#20c997', '#fab005', '#5c7cfa',
]
