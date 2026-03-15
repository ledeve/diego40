import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { portfolio } from './data/portfolio'
import { fetchPrices } from './utils/prices'
import { formatNumber, formatPL } from './utils/formatters'
import type { EnrichedCoin, PriceResponse, SortMode, ChartTab } from './types'
import ParticleCanvas from './components/ParticleCanvas'
import AnimatedNumber from './components/AnimatedNumber'
import CoinGrid from './components/CoinGrid'
import ChartSection from './components/ChartSection'
import HoldingsTable from './components/HoldingsTable'

export default function App() {
  const [prices, setPrices] = useState<PriceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [activeChart, setActiveChart] = useState<ChartTab>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [coinSort, setCoinSort] = useState<SortMode>('default')
  const mousePosRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2800)
    return () => clearTimeout(t)
  }, [])

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      const coinIds = portfolio.map((c) => c.id)
      const { prices: data, error: err } = await fetchPrices(coinIds)
      setPrices(data)
      setLastUpdate(new Date())
      setError(err)
    } catch {
      setError('All price sources failed.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const enrichedCoins: EnrichedCoin[] = useMemo(
    () =>
      portfolio.map((coin) => {
        const currentPrice = prices?.[coin.id]?.usd ?? null
        const initialValue = coin.initialPrice * coin.units
        const currentValue = currentPrice != null ? currentPrice * coin.units : null
        const pl = currentPrice != null ? ((currentPrice - coin.initialPrice) / coin.initialPrice) * 100 : null
        const dollarPL = currentValue != null ? currentValue - initialValue : null
        return { ...coin, currentPrice, initialValue, currentValue, pl, dollarPL }
      }),
    [prices]
  )

  const totalInvested = enrichedCoins.reduce((s, c) => s + c.initialValue, 0)
  const totalValue = enrichedCoins.reduce((s, c) => s + (c.currentValue || 0), 0)
  const totalPL = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
  const totalDollarPL = totalValue - totalInvested

  // --- Loading screen ---
  if (showSplash) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#050510',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: "'Chakra Petch', monospace",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            fontFamily: "'Orbitron', sans-serif",
            background: 'linear-gradient(135deg, #00ff88, #00ccff, #A78BFA, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'glitchIn 0.8s ease both',
          }}
        >
          DIEGO 40
        </div>
        <div style={{ fontSize: 12, color: '#333', letterSpacing: 6, marginTop: 8, animation: 'fadeUp 0.6s ease 0.4s both' }}>
          LOADING...
        </div>
        <div style={{ width: 200, height: 2, background: '#111', borderRadius: 1, marginTop: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #00ff88, #A78BFA)', animation: 'loadBar 2s ease both' }} />
        </div>
        <div style={{ fontSize: 9, color: '#222', marginTop: 12, animation: 'fadeUp 0.6s ease 1s both' }}>
          FETCHING LIVE PRICES FROM COINGECKO...
        </div>
      </div>
    )
  }

  // --- Main dashboard ---
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050510',
        color: '#e0e0e0',
        fontFamily: "'Chakra Petch', 'Courier New', monospace",
        padding: 0,
        margin: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <ParticleCanvas mousePos={mousePosRef} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 12, animation: 'slideUp 0.6s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <img
              src="/assets/diego.png"
              alt="Diego"
              style={{ width: 90, height: 90, borderRadius: '50%', border: '2px solid #222', objectFit: 'cover' }}
            />
            <h1
              style={{
                margin: 0,
                fontSize: 48,
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                background: 'linear-gradient(135deg, #00ff88, #00ccff, #A78BFA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'glowPulse 3s ease-in-out infinite',
              }}
            >
              DIEGO 40
            </h1>
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
            padding: '10px 0',
            borderTop: '1px solid #111',
            borderBottom: '1px solid #111',
            marginBottom: 24,
            animation: 'slideUp 0.6s ease 0.1s both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#444' }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                display: 'inline-block',
                background: error ? '#ff4466' : '#00ff88',
                boxShadow: `0 0 8px ${error ? '#ff4466' : '#00ff88'}`,
              }}
            />
            {error ? 'FALLBACK MODE' : 'LIVE · COINGECKO'}
          </div>
          <span style={{ color: '#1a1a2e' }}>|</span>
          <span style={{ fontSize: 10, color: '#333' }}>
            {lastUpdate ? lastUpdate.toLocaleTimeString() : 'SYNCING...'}
          </span>
          <span style={{ color: '#1a1a2e' }}>|</span>
          <span
            onClick={() => { if (!isLoading) refresh() }}
            style={{
              fontSize: 10,
              color: isLoading ? '#555' : '#A78BFA',
              cursor: isLoading ? 'wait' : 'pointer',
              letterSpacing: 1,
              padding: '2px 6px',
              borderRadius: 4,
              transition: 'all 0.2s',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'rgba(167,139,250,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {isLoading ? '⏳ SYNCING' : '⟳ REFRESH'}
          </span>
        </div>

        {/* Portfolio summary */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 48,
            marginBottom: 36,
            animation: 'slideUp 0.6s ease 0.2s both',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
              Invested
            </div>
            <AnimatedNumber target={totalInvested} prefix="$" color="#666" size={22} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
              Portfolio Value
            </div>
            <AnimatedNumber target={totalValue} prefix="$" color="#fff" size={36} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
              Total P/L
            </div>
            <AnimatedNumber target={totalPL} suffix="%" color={totalPL >= 0 ? '#00ff88' : '#ff4466'} size={22} />
            <div
              style={{
                fontSize: 11,
                color: totalDollarPL >= 0 ? '#00ff8866' : '#ff446666',
                marginTop: 2,
                fontFamily: "'Chakra Petch', monospace",
              }}
            >
              {totalDollarPL >= 0 ? '+' : ''}${formatNumber(totalDollarPL)}
            </div>
          </div>
        </div>

        {/* Ticker tape */}
        <div
          style={{
            overflow: 'hidden',
            padding: '8px 0',
            marginBottom: 28,
            borderTop: '1px solid #0f0f1f',
            borderBottom: '1px solid #0f0f1f',
          }}
        >
          <div style={{ display: 'flex', animation: 'ticker 25s linear infinite', width: 'max-content' }}>
            {[...enrichedCoins, ...enrichedCoins, ...enrichedCoins].map((c, i) => (
              <span
                key={i}
                style={{ marginRight: 36, fontSize: 11, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>{c.icon}</span>
                <span style={{ color: c.color, fontWeight: 700 }}>{c.ticker}</span>
                <span style={{ color: '#666' }}>${c.currentPrice != null ? formatNumber(c.currentPrice) : '—'}</span>
                <span style={{ color: (c.pl ?? 0) >= 0 ? '#00ff88' : '#ff4466', fontSize: 10 }}>
                  {c.pl != null ? formatPL(c.pl) : ''}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Coin tiles */}
        <CoinGrid coins={enrichedCoins} coinSort={coinSort} setCoinSort={setCoinSort} />

        {/* Charts */}
        <ChartSection
          coins={enrichedCoins}
          totalValue={totalValue}
          totalPL={totalPL}
          activeChart={activeChart}
          setActiveChart={setActiveChart}
        />

        {/* Holdings table */}
        <HoldingsTable
          coins={enrichedCoins}
          totalInvested={totalInvested}
          totalValue={totalValue}
          totalPL={totalPL}
          totalDollarPL={totalDollarPL}
        />

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 40, borderTop: '1px solid #0a0a14' }}>
          <div style={{ fontSize: 10, color: '#222', marginBottom: 8 }}>
            <a
              href="https://bscscan.com/address/0x69BE52aF50B44d8f94F9f5B41fc87f24e3a775D9#tokentxns"
              target="_blank"
              rel="noopener"
              style={{ color: '#333', textDecoration: 'none', marginRight: 16 }}
            >
              BscScan ↗
            </a>
            <a
              href="https://solscan.io/account/ErmXfQCkgVA5mtiG7PHqT8LwzHL5srFQjZBM3RbcTHCq#portfolio"
              target="_blank"
              rel="noopener"
              style={{ color: '#333', textDecoration: 'none' }}
            >
              SolScan ↗
            </a>
          </div>
          <div style={{ fontSize: 12, color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            With ❤️ from{' '}
            <img src="/assets/ekipa.png" alt="Ekipa" style={{ height: 48, opacity: 0.7 }} />
          </div>
          <div style={{ fontSize: 8, color: '#1a1a2e', marginTop: 6 }}>
            CoinGecko live feed · Not financial advice · DYOR · WAGMI (probably not)
          </div>
        </div>
      </div>
    </div>
  )
}
