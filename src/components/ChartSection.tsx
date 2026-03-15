import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import type { EnrichedCoin, ChartTab } from '../types'
import { formatNumber, formatPL } from '../utils/formatters'

interface Props {
  coins: EnrichedCoin[]
  totalValue: number
  totalPL: number
  activeChart: ChartTab
  setActiveChart: (t: ChartTab) => void
}

const tabs: { key: ChartTab; icon: string; label: string }[] = [
  { key: 'alloc', icon: '◉', label: 'Allocation' },
  { key: 'pl', icon: '▮', label: 'P/L Breakdown' },
  { key: 'value', icon: '▤', label: 'Invested vs Value' },
]

export default function ChartSection({ coins, totalValue, totalPL, activeChart, setActiveChart }: Props) {
  const allocData = coins
    .filter((c) => (c.currentValue ?? 0) > 0)
    .map((c) => ({
      name: c.ticker,
      value: +(c.currentValue?.toFixed(2) ?? 0),
      color: c.color,
      pct: ((c.currentValue! / totalValue) * 100).toFixed(1),
    }))

  const plData = coins.map((c) => ({
    name: c.ticker,
    pl: c.pl ?? 0,
    fill: (c.pl ?? 0) >= 0 ? '#00ff88' : '#ff4466',
  }))

  const valueData = coins.map((c) => ({
    name: c.ticker,
    invested: c.initialValue,
    value: c.currentValue ?? 0,
    color: c.color,
  }))

  const tooltipStyle = { background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 11 }
  const axisStyle = { fill: '#444', fontSize: 9 }

  return (
    <div
      style={{
        animation: 'slideUp 0.6s ease 0.4s both',
        background: 'rgba(255,255,255,0.01)',
        border: '1px solid #111',
        borderRadius: 20,
        padding: 24,
        marginBottom: 28,
      }}
    >
      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <div
            key={t.key}
            className="chart-tab"
            onClick={() => setActiveChart(activeChart === t.key ? null : t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700,
              background: activeChart === t.key ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${activeChart === t.key ? '#A78BFA44' : '#1a1a2e'}`,
              color: activeChart === t.key ? '#A78BFA' : '#555',
              transition: 'all 0.3s ease',
            }}
          >
            {t.icon} {t.label}
          </div>
        ))}
      </div>

      {/* Allocation (default + when selected) */}
      {(!activeChart || activeChart === 'alloc') && (
        <div style={{ animation: 'chartFadeIn 0.4s ease', opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: activeChart === 'alloc' ? '1fr' : '1fr 1fr', gap: 16 }}>
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={allocData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    stroke="none"
                    animationDuration={800}
                  >
                    {allocData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 22, fontWeight: 900, fill: '#fff', fontFamily: "'Chakra Petch', monospace" }}
                  >
                    {'$' + formatNumber(totalValue)}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: 9,
                      fill: totalPL >= 0 ? '#00ff88' : '#ff4466',
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase' as const,
                    }}
                  >
                    {totalPL >= 0 ? '▲ ' + formatPL(totalPL) : '▼ ' + formatPL(totalPL)}
                  </text>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0]
                      return (
                        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: '8px 14px', fontSize: 11 }}>
                          <div style={{ color: d.payload.color, fontWeight: 700 }}>{d.name}</div>
                          <div style={{ color: '#aaa' }}>
                            ${formatNumber(d.value as number)} · {d.payload.pct}%
                          </div>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {allocData.map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block', boxShadow: `0 0 6px ${d.color}44` }} />
                    {d.name}{' '}
                    <span style={{ color: '#444' }}>{d.pct}%</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Default view also shows PL bar chart side by side */}
            {!activeChart && (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={plData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                    <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: '#1a1a2e' }} />
                    <YAxis tick={axisStyle} axisLine={{ stroke: '#1a1a2e' }} tickFormatter={(v) => v + '%'} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatPL(v), 'P/L']} />
                    <Bar dataKey="pl" radius={[6, 6, 0, 0]}>
                      {plData.map((d, i) => {
                        const coin = coins.find((c) => c.ticker === d.name)
                        return <Cell key={i} fill={coin ? coin.color + (d.pl >= 0 ? 'cc' : '99') : d.fill} fillOpacity={0.85} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* P/L Breakdown */}
      {activeChart === 'pl' && (
        <div style={{ animation: 'chartFadeIn 0.4s ease' }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={plData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" />
              <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} axisLine={{ stroke: '#1a1a2e' }} />
              <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={{ stroke: '#1a1a2e' }} tickFormatter={(v) => v + '%'} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatPL(v), 'P/L']} />
              <Bar dataKey="pl" radius={[6, 6, 0, 0]}>
                {plData.map((d, i) => {
                  const coin = coins.find((c) => c.ticker === d.name)
                  return <Cell key={i} fill={coin ? coin.color + (d.pl >= 0 ? 'cc' : '99') : d.fill} fillOpacity={0.85} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Invested vs Value */}
      {activeChart === 'value' && (
        <div style={{ animation: 'chartFadeIn 0.4s ease' }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={valueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" />
              <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: '#1a1a2e' }} />
              <YAxis tick={axisStyle} axisLine={{ stroke: '#1a1a2e' }} tickFormatter={(v) => '$' + v} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number, name: string) => ['$' + formatNumber(v), name === 'invested' ? 'Invested' : 'Current Value']}
              />
              <Bar dataKey="invested" radius={[6, 6, 0, 0]} fill="#555" fillOpacity={0.5} name="invested" />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="value">
                {coins.map((c, i) => (
                  <Cell key={i} fill={c.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
