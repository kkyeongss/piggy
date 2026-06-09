import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts'
import { won } from '../../util/format.js'

// 금액 라벨: 1만 이상이면 만 단위 축약, 0은 숨김
function compact(v) {
  const n = Number(v || 0)
  if (n === 0) return ''
  if (n >= 10000) {
    const man = n / 10000
    return (Number.isInteger(man) ? man : Math.round(man * 10) / 10) + '만'
  }
  return n.toLocaleString('ko-KR')
}

// points: [{ label, value }]
export default function LineChart({ points = [], height = 210 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 18, right: 10, left: 6, bottom: 0 }}>
        <defs>
          <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fill: '#8b95a1' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-38}
          textAnchor="end"
          height={46}
        />
        <YAxis hide domain={[0, 'dataMax']} />
        <Tooltip
          formatter={(value) => [won(value), '지출']}
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 13,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}
          labelStyle={{ color: 'var(--text-secondary)', fontWeight: 700 }}
          itemStyle={{ color: 'var(--text-primary)' }}
          cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--primary)"
          strokeWidth={2.5}
          fill="url(#lc-fill)"
          dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive
        >
          <LabelList dataKey="value" position="top" formatter={compact}
            style={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-secondary)' }} />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  )
}
