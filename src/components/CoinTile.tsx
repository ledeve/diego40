import { useState, useRef } from 'react'
import type { EnrichedCoin } from '../types'
import AnimatedNumber from './AnimatedNumber'
import { formatNumber, formatPL } from '../utils/formatters'

interface Props {
  asset: EnrichedCoin
  index: number
  isBest: boolean
  isWorst: boolean
}

export default function CoinTile({ asset: c, index, isBest, isWorst }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const plColor = (c.pl ?? 0) >= 0 ? '#00ff88' : '#ff4466'

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const mx = (e.clientX - rect.left) / rect.width - 0.5
    const my = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: my * -15, y: mx * 15 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        handleMouseMove(e)
        setHovered(true)
      }}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 })
        setHovered(false)
      }}
      onClick={() => setFlipped(!flipped)}
      style={{
        perspective: 800,
        cursor: 'pointer',
        animation: `cardEntrance 0.6s ease ${index * 0.12}s both`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: 220,
          position: 'relative',
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)`,
          transition: flipped
            ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)'
            : 'transform 0.15s ease',
        }}
      >
        {/* Front face */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: `linear-gradient(145deg, ${c.color}11 0%, #0d0d1a 50%, ${c.color}08 100%), #0d0d1a`,
            border: `1px solid ${isBest ? '#00ff8866' : isWorst ? '#ff446666' : hovered ? c.color + '66' : '#1a1a2e'}`,
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            boxShadow: isBest
              ? '0 0 20px #00ff8844, 0 0 40px #00ff8822, inset 0 0 20px #00ff8808'
              : isWorst
                ? '0 0 20px #ff446644, 0 0 40px #ff446622, inset 0 0 20px #ff446608'
                : hovered
                  ? `0 0 30px ${c.color}22, inset 0 0 30px ${c.color}05`
                  : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
        >
          {hovered && (
            <div
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${c.color}20 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 32, marginBottom: 4, filter: hovered ? 'none' : 'grayscale(0.3)' }}>
                {c.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: c.color, letterSpacing: 0.5 }}>
                {c.ticker}
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{c.name}</div>
            </div>

            <div
              style={{
                padding: '3px 8px',
                borderRadius: 20,
                fontSize: 9,
                fontWeight: 700,
                background: c.chain === 'SOL' ? 'rgba(153,69,255,0.15)' : 'rgba(243,186,47,0.15)',
                color: c.chain === 'SOL' ? '#9945FF' : '#F3BA2F',
                border: `1px solid ${c.chain === 'SOL' ? '#9945FF33' : '#F3BA2F33'}`,
              }}
            >
              {c.chain}
            </div>

            {isBest && (
              <div
                style={{
                  marginTop: 4,
                  padding: '2px 6px',
                  borderRadius: 10,
                  fontSize: 7,
                  fontWeight: 800,
                  background: 'rgba(0,255,136,0.12)',
                  color: '#00ff88',
                  border: '1px solid #00ff8833',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  animation: 'glowPulse 2s ease-in-out infinite',
                }}
              >
                ↑ TOP GAINER
              </div>
            )}
            {isWorst && (
              <div
                style={{
                  marginTop: 4,
                  padding: '2px 6px',
                  borderRadius: 10,
                  fontSize: 7,
                  fontWeight: 800,
                  background: 'rgba(255,68,102,0.12)',
                  color: '#ff4466',
                  border: '1px solid #ff446633',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  animation: 'glowPulse 2s ease-in-out infinite',
                }}
              >
                ↓ TOP LOSER
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <AnimatedNumber
                target={c.currentPrice}
                prefix="$"
                color="#fff"
                size={24}
                duration={800}
                decimals={
                  c.currentPrice != null && c.currentPrice < 0.01
                    ? 6
                    : c.currentPrice != null && c.currentPrice < 1
                      ? 4
                      : 2
                }
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: plColor,
                  fontFamily: "'Chakra Petch', monospace",
                }}
              >
                {c.pl != null ? formatPL(c.pl) : '—'}
              </span>
            </div>

            {/* Invested vs Now bars */}
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 8, color: '#555', width: 28, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0 }}>In</span>
                <div style={{ flex: 1, height: 4, background: '#1a1a2e', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 2,
                      width: `${c.currentValue != null ? Math.round((c.initialValue / Math.max(c.initialValue, c.currentValue)) * 100) : 100}%`,
                      background: c.color + '88',
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: 8, color: '#555', fontFamily: "'Chakra Petch', monospace", flexShrink: 0 }}>
                  ${formatNumber(c.initialValue)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 8, color: '#555', width: 28, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0 }}>Now</span>
                <div style={{ flex: 1, height: 4, background: '#1a1a2e', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 2,
                      width: `${c.initialValue > 0 && c.currentValue != null ? Math.round((c.currentValue / Math.max(c.initialValue, c.currentValue)) * 100) : 0}%`,
                      background: `linear-gradient(90deg, ${plColor}cc, ${plColor})`,
                      boxShadow: `0 0 6px ${plColor}44`,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: 8, color: plColor, fontFamily: "'Chakra Petch', monospace", fontWeight: 700, flexShrink: 0 }}>
                  ${c.currentValue != null ? formatNumber(c.currentValue) : '—'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, color: '#333' }}>
            tap to flip →
          </div>
        </div>

        {/* Back face */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(145deg, #0d0d1a 0%, ${c.color}15 100%), #0d0d1a`,
            border: `1px solid ${c.color}44`,
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: c.color, marginBottom: 8 }}>
              {c.icon} {c.ticker} — INTEL
            </div>
            <div style={{ fontSize: 11, color: '#777', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>
              "{c.bio}"
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(
                [
                  ['Units', c.units.toLocaleString()],
                  ['Buy Price', '$' + formatNumber(c.initialPrice)],
                  ['Invested', '$' + formatNumber(c.initialValue)],
                  ['Now Worth', '$' + formatNumber(c.currentValue)],
                  ['Dollar P/L', (c.dollarPL != null && c.dollarPL >= 0 ? '+' : '') + '$' + formatNumber(c.dollarPL)],
                  ['Chain', c.chain],
                ] as [string, string][]
              ).map(([label, val], i) => (
                <div key={i}>
                  <div style={{ fontSize: 8, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', fontFamily: "'Chakra Petch', monospace" }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 9, color: '#333', textAlign: 'right' }}>← tap to flip back</div>
        </div>
      </div>
    </div>
  )
}
