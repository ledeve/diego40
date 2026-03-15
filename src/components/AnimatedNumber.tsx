import { useState, useEffect, useRef } from 'react'
import { formatNumber } from '../utils/formatters'

interface Props {
  target: number | null
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
  color?: string
  size?: number
}

export default function AnimatedNumber({
  target,
  prefix = '',
  suffix = '',
  duration = 1500,
  decimals = 2,
  color = '#fff',
  size = 32,
}: Props) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (target == null) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(target * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 900,
        color,
        fontFamily: "'Chakra Petch', monospace",
      }}
    >
      {prefix}
      {formatNumber(display, decimals)}
      {suffix}
    </span>
  )
}
