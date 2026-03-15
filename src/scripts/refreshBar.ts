const INTERVAL = 60

export function initRefreshBar() {
  const mainContainer = document.querySelector('[style*="max-width"]')
  if (!mainContainer) {
    setTimeout(initRefreshBar, 200)
    return
  }

  const children = mainContainer.children
  let tickerEl: Element | null = null
  for (let i = 0; i < children.length; i++) {
    const s = (children[i] as HTMLElement).getAttribute('style') || ''
    if (s.indexOf('overflow') !== -1 && s.indexOf('hidden') !== -1 && children[i].querySelector('[style*="ticker"]')) {
      tickerEl = children[i]
      break
    }
  }
  if (!tickerEl) {
    setTimeout(initRefreshBar, 200)
    return
  }

  const bar = document.createElement('div')
  bar.id = 'refresh-bar-container'
  bar.innerHTML =
    '<span id="refresh-label">next update</span><div id="refresh-bar-track"><div id="refresh-bar-fill"></div></div><span id="refresh-countdown">60s</span>'
  tickerEl.parentNode!.insertBefore(bar, tickerEl)

  const fill = document.getElementById('refresh-bar-fill')!
  const countdown = document.getElementById('refresh-countdown')!
  let start = Date.now()

  function clickRefresh() {
    const spans = document.querySelectorAll('span')
    for (let k = 0; k < spans.length; k++) {
      const txt = spans[k].textContent!.trim()
      if (txt === '⟳ REFRESH') {
        spans[k].click()
        break
      }
    }
  }

  function update() {
    const elapsed = (Date.now() - start) / 1000
    const remaining = Math.max(0, INTERVAL - elapsed)
    const pct = remaining / INTERVAL
    fill.style.transform = 'scaleX(' + pct + ')'
    fill.className = remaining <= 10 ? 'critical' : remaining <= 20 ? 'depleting' : ''
    countdown.textContent = Math.ceil(remaining) + 's'
    if (remaining <= 0) {
      clickRefresh()
      start = Date.now()
    }
    requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

const sparkleColors = ['#A78BFA', '#00ff88', '#00ccff', '#F59E0B', '#EC4899', '#FBBF24']
let sparkleThrottle = 0

export function initSparkleTrail() {
  document.addEventListener('mousemove', (e) => {
    const now = Date.now()
    if (now - sparkleThrottle < 50) return
    sparkleThrottle = now
    const s = document.createElement('div')
    s.className = 'sparkle'
    const size = Math.random() * 4 + 2
    const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)]
    s.style.cssText = `left:${e.clientX - size / 2}px;top:${e.clientY - size / 2}px;width:${size}px;height:${size}px;background:${color};box-shadow:0 0 ${size * 2}px ${color};`
    document.body.appendChild(s)
    setTimeout(() => s.remove(), 600)
  })
}
