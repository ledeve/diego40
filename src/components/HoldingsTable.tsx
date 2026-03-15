import type { EnrichedCoin } from '../types'
import { formatNumber, formatPL } from '../utils/formatters'

interface Props {
  coins: EnrichedCoin[]
  totalInvested: number
  totalValue: number
  totalPL: number
  totalDollarPL: number
}

const headers = ['Asset', 'Units', 'Buy $', 'Invested', 'Now $', 'Value', 'P/L %', 'P/L $']

export default function HoldingsTable({ coins, totalInvested, totalValue, totalPL, totalDollarPL }: Props) {
  return (
    <div
      style={{
        animation: 'slideUp 0.6s ease 0.6s both',
        background: 'rgba(255,255,255,0.01)',
        border: '1px solid #111',
        borderRadius: 20,
        padding: 24,
        marginBottom: 28,
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>▦</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Full Holdings</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 700 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  padding: '10px 12px',
                  textAlign: h === 'Asset' ? 'left' : 'right',
                  color: '#333',
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  borderBottom: '1px solid #111',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {coins.map((c) => (
            <tr
              key={c.id}
              style={{ borderBottom: '1px solid #0a0a14', transition: 'background 0.2s', cursor: 'default' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ padding: '12px', textAlign: 'left' }}>
                <span style={{ marginRight: 6 }}>{c.icon}</span>
                <span style={{ color: c.color, fontWeight: 700 }}>{c.ticker}</span>
                <span style={{ color: '#333', marginLeft: 6, fontSize: 10 }}>{c.name}</span>
              </td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#888' }}>{c.units.toLocaleString()}</td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#888' }}>${formatNumber(c.initialPrice)}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>${formatNumber(c.initialValue)}</td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#888' }}>
                ${c.currentPrice != null ? formatNumber(c.currentPrice) : '—'}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700 }}>
                ${c.currentValue != null ? formatNumber(c.currentValue) : '—'}
              </td>
              <td
                style={{
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: 800,
                  color: (c.pl ?? 0) >= 0 ? '#00ff88' : '#ff4466',
                }}
              >
                {c.pl != null ? formatPL(c.pl) : '—'}
              </td>
              <td
                style={{
                  padding: '12px',
                  textAlign: 'right',
                  color: (c.dollarPL ?? 0) >= 0 ? '#00ff8888' : '#ff446688',
                }}
              >
                {c.dollarPL != null ? `${c.dollarPL >= 0 ? '+' : ''}$${formatNumber(c.dollarPL)}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #222' }}>
            <td colSpan={3} style={{ padding: '14px 12px', fontWeight: 900, color: '#fff', textAlign: 'left', fontSize: 12 }}>
              TOTAL
            </td>
            <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 900, color: '#fff' }}>
              ${formatNumber(totalInvested)}
            </td>
            <td />
            <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 900, color: '#fff' }}>
              ${formatNumber(totalValue)}
            </td>
            <td
              style={{
                padding: '14px 12px',
                textAlign: 'right',
                fontWeight: 900,
                color: totalPL >= 0 ? '#00ff88' : '#ff4466',
              }}
            >
              {formatPL(totalPL)}
            </td>
            <td
              style={{
                padding: '14px 12px',
                textAlign: 'right',
                fontWeight: 800,
                color: totalDollarPL >= 0 ? '#00ff8888' : '#ff446688',
              }}
            >
              {totalDollarPL >= 0 ? '+' : ''}${formatNumber(totalDollarPL)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
