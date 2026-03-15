import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/animations.css'
import { initRefreshBar, initSparkleTrail } from './scripts/refreshBar'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Vanilla JS enhancements (DOM-based, run after mount)
initSparkleTrail()
setTimeout(initRefreshBar, 500)
