import type { EnrichedCoin, SortMode } from '../types'
import CoinTile from './CoinTile'

interface Props {
  coins: EnrichedCoin[]
  coinSort: SortMode
  setCoinSort: (s: SortMode) => void
}

const sortOptions: { key: SortMode; label: string; icon: string }[] = [
  { key: 'default', label: 'Default', icon: '◈' },
  { key: 'pl-desc', label: 'Best first', icon: '▲' },
  { key: 'pl-asc', label: 'Worst first', icon: '▼' },
]

export default function CoinGrid({ coins, coinSort, setCoinSort }: Props) {
  const best = coins.reduce((a, b) => ((b.pl ?? -Infinity) > (a.pl ?? -Infinity) ? b : a), coins[0])
  const worst = coins.reduce((a, b) => ((b.pl ?? Infinity) < (a.pl ?? Infinity) ? b : a), coins[0])

  const sorted =
    coinSort === 'pl-desc'
      ? [...coins].sort((a, b) => (b.pl ?? -Infinity) - (a.pl ?? -Infinity))
      : coinSort === 'pl-asc'
        ? [...coins].sort((a, b) => (a.pl ?? -Infinity) - (b.pl ?? -Infinity))
        : coins

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>⬡</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>Your Coins</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 }}>
            Sort by
          </span>
          <div style={{ width: 1, height: 14, background: '#1a1a2e', marginRight: 2 }} />
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setCoinSort(opt.key)}
              style={{
                padding: '5px 14px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 700,
                background: coinSort === opt.key ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${coinSort === opt.key ? '#A78BFA55' : '#1a1a2e'}`,
                color: coinSort === opt.key ? '#A78BFA' : '#555',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: "'Chakra Petch', monospace",
                letterSpacing: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 8 }}>{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
          marginBottom: 36,
        }}
      >
        {sorted.map((coin, i) => (
          <CoinTile
            key={coin.id}
            asset={coin}
            index={i}
            isBest={coin.id === best?.id}
            isWorst={coin.id === worst?.id}
          />
        ))}
      </div>
    </>
  )
}
