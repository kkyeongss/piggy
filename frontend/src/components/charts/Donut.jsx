import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { won } from '../../util/format.js'

// segments: [{ value, color, name? }]
export default function Donut({ segments = [], size = 168, thickness = 22, centerLabel, centerSub, tooltip = false }) {
  const data = segments.filter((s) => Number(s.value) > 0)
  const hasData = data.length > 0
  const inner = size / 2 - thickness
  const outer = size / 2

  const pieData = hasData ? data : [{ name: '', value: 1, color: 'var(--bg-subtle)' }]

  return (
    <div className="donut-wrap" style={{ position: 'relative', width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={inner}
          outerRadius={outer}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          paddingAngle={tooltip && data.length > 1 ? 1.5 : 0}
          isAnimationActive
        >
          {pieData.map((s, i) => (
            <Cell key={i} fill={s.color} />
          ))}
        </Pie>
        {tooltip && hasData && (
          <Tooltip
            formatter={(value, name) => [won(value), name || '금액']}
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 13,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
            itemStyle={{ color: 'var(--text-primary)' }}
          />
        )}
      </PieChart>
      {(centerLabel || centerSub) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            pointerEvents: 'none',
          }}
        >
          {centerLabel && (
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{centerLabel}</span>
          )}
          {centerSub && (
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{centerSub}</span>
          )}
        </div>
      )}
    </div>
  )
}
