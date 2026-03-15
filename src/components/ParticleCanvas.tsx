import { useEffect, useRef } from 'react'

const COLORS = ['#F59E0B', '#EC4899', '#10B981', '#A78BFA', '#F43F5E', '#FBBF24']

interface Particle {
  x: number; y: number; vx: number; vy: number
  r: number; color: string; alpha: number
}

interface Props {
  mousePos: React.RefObject<{ x: number; y: number } | null>
}

export default function ParticleCanvas({ mousePos }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const raf = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    if (particles.current.length === 0) {
      for (let i = 0; i < 80; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: Math.random() * 0.5 + 0.1,
        })
      }
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const pts = particles.current
      const mx = mousePos.current?.x ?? -1000
      const my = mousePos.current?.y ?? -1000

      pts.forEach((p) => {
        const dx = mx - p.x
        const dy = my - p.y
        if (Math.sqrt(dx * dx + dy * dy) < 200) {
          p.vx += dx * 0.00003
          p.vy += dy * 0.00003
        }
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
      })

      ctx.globalAlpha = 0.04
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 0.5
      for (let i = 0; i < pts.length; i++) {
        for (let k = i + 1; k < pts.length; k++) {
          if (Math.hypot(pts[i].x - pts[k].x, pts[i].y - pts[k].y) < 120) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[k].x, pts[k].y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
      raf.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
    }
  }, [mousePos])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
