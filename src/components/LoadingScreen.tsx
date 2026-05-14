import { useEffect, useRef, useState, useCallback } from 'react'
import { startModelPreload } from '../enginePreloader'
import { waitForSplineScene } from '../splinePreloader'
import { waitForAllScenes } from '../sceneReadiness'
import './LoadingScreen.css'

const MIN_DISPLAY_MS = 3000 // Minimum time to show the loading screen for UX

/* ─── Pill category data ─── */
const orbitPills = [
  { label: 'CAD', icon: 'compass' },
  { label: 'AI TOOLS', icon: 'brain' },
  { label: 'SIMULATION', icon: 'wave' },
  { label: 'DIGITAL TWIN', icon: 'layers' },
  { label: 'THERMAL', icon: 'flame' },
  { label: 'BIOMEDICAL', icon: 'heart' },
] as const

/* ─── SVG icons for each pill ─── */
function PillIcon({ type }: { type: string }) {
  switch (type) {
    case 'compass':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'brain':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.4 2.1-1.1 2.9A4 4 0 0 1 16 12a4 4 0 0 1-1.5 3.1A4 4 0 0 1 12 22" />
          <path d="M12 2a4 4 0 0 0-4 4c0 1.1.4 2.1 1.1 2.9A4 4 0 0 0 8 12a4 4 0 0 0 1.5 3.1A4 4 0 0 0 12 22" />
          <path d="M12 2v20" />
        </svg>
      )
    case 'wave':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12c1.5-3 3-5 5-5s3.5 5 5 5 3.5-5 5-5 3.5 2 5 5" />
        </svg>
      )
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,2 2,7 12,12 22,7" />
          <polyline points="2,17 12,22 22,17" />
          <polyline points="2,12 12,17 22,12" />
        </svg>
      )
    case 'flame':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
          <path d="M12 6v4m0 0v4m0-4h4m-4 0H8" strokeWidth="1.5" />
        </svg>
      )
    default:
      return null
  }
}

/* ─── Corner blueprint sketch SVGs ─── */
function SketchTopLeft() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="170" height="150" stroke="#3a3a3a" strokeWidth="0.5" strokeDasharray="2 4" />
      <circle cx="90" cy="85" r="55" stroke="#3a3a3a" strokeWidth="0.6" />
      <circle cx="90" cy="85" r="35" stroke="#3a3a3a" strokeWidth="0.4" />
      <circle cx="90" cy="85" r="15" stroke="#3a3a3a" strokeWidth="0.5" fill="none" />
      <circle cx="90" cy="85" r="5" fill="#3a3a3a" opacity="0.3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1={90 + 15 * Math.cos((angle * Math.PI) / 180)}
          y1={85 + 15 * Math.sin((angle * Math.PI) / 180)}
          x2={90 + 50 * Math.cos((angle * Math.PI) / 180)}
          y2={85 + 50 * Math.sin((angle * Math.PI) / 180)}
          stroke="#3a3a3a"
          strokeWidth="0.4"
        />
      ))}
      <line x1="15" y1="170" x2="175" y2="170" stroke="#3a3a3a" strokeWidth="0.3" />
      <text x="85" y="178" fontSize="6" fill="#3a3a3a" textAnchor="middle" fontFamily="monospace">Ø110</text>
      <line x1="190" y1="15" x2="190" y2="155" stroke="#3a3a3a" strokeWidth="0.3" />
      <text x="195" y="88" fontSize="6" fill="#3a3a3a" fontFamily="monospace" transform="rotate(90, 195, 88)">150</text>
      <text x="14" y="20" fontSize="5" fill="#3a3a3a" fontFamily="monospace">Ø48</text>
      <text x="140" y="20" fontSize="5" fill="#3a3a3a" fontFamily="monospace">2x Ø9</text>
    </svg>
  )
}

function SketchTopRight() {
  return (
    <svg viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="50" width="140" height="40" stroke="#3a3a3a" strokeWidth="0.5" rx="2" />
      <rect x="30" y="40" width="30" height="60" stroke="#3a3a3a" strokeWidth="0.5" />
      <rect x="120" y="35" width="25" height="70" stroke="#3a3a3a" strokeWidth="0.5" />
      <circle cx="42" cy="70" r="12" stroke="#3a3a3a" strokeWidth="0.4" />
      <circle cx="42" cy="70" r="6" stroke="#3a3a3a" strokeWidth="0.3" />
      <line x1="20" y1="120" x2="160" y2="120" stroke="#3a3a3a" strokeWidth="0.3" />
      <text x="90" y="128" fontSize="5" fill="#3a3a3a" textAnchor="middle" fontFamily="monospace">300</text>
      <line x1="120" y1="25" x2="145" y2="25" stroke="#3a3a3a" strokeWidth="0.3" />
      <text x="132" y="22" fontSize="5" fill="#3a3a3a" textAnchor="middle" fontFamily="monospace">Ø32</text>
      <line x1="10" y1="70" x2="170" y2="70" stroke="#3a3a3a" strokeWidth="0.2" strokeDasharray="6 3 1 3" />
      <text x="5" y="140" fontSize="5" fill="#3a3a3a" fontFamily="monospace">M12</text>
    </svg>
  )
}

function SketchBottomLeft() {
  return (
    <svg viewBox="0 0 190 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="20" width="120" height="90" stroke="#3a3a3a" strokeWidth="0.5" />
      <rect x="50" y="40" width="80" height="50" stroke="#3a3a3a" strokeWidth="0.4" />
      <circle cx="90" cy="65" r="22" stroke="#3a3a3a" strokeWidth="0.5" />
      <circle cx="90" cy="65" r="10" stroke="#3a3a3a" strokeWidth="0.4" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1={50 + i * 10}
          y1={40}
          x2={50 + i * 10 + 20}
          y2={90}
          stroke="#3a3a3a"
          strokeWidth="0.2"
        />
      ))}
      <rect x="20" y="110" width="140" height="30" stroke="#3a3a3a" strokeWidth="0.5" />
      <line x1="60" y1="110" x2="60" y2="140" stroke="#3a3a3a" strokeWidth="0.3" />
      <line x1="120" y1="110" x2="120" y2="140" stroke="#3a3a3a" strokeWidth="0.3" />
      <line x1="20" y1="155" x2="160" y2="155" stroke="#3a3a3a" strokeWidth="0.3" />
      <text x="90" y="163" fontSize="5" fill="#3a3a3a" textAnchor="middle" fontFamily="monospace">500</text>
      <line x1="5" y1="20" x2="5" y2="140" stroke="#3a3a3a" strokeWidth="0.3" />
      <text x="8" y="175" fontSize="5" fill="#3a3a3a" fontFamily="monospace">Ø52</text>
      <text x="8" y="185" fontSize="5" fill="#3a3a3a" fontFamily="monospace">R22</text>
    </svg>
  )
}

function SketchBottomRight() {
  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="90" r="70" stroke="#3a3a3a" strokeWidth="0.5" />
      <circle cx="90" cy="90" r="50" stroke="#3a3a3a" strokeWidth="0.4" />
      <circle cx="90" cy="90" r="18" stroke="#3a3a3a" strokeWidth="0.5" />
      <circle cx="90" cy="90" r="8" fill="#3a3a3a" opacity="0.2" />
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180
        return (
          <path
            key={angle}
            d={`M ${90 + 20 * Math.cos(rad)} ${90 + 20 * Math.sin(rad)} Q ${90 + 45 * Math.cos(rad + 0.4)} ${90 + 45 * Math.sin(rad + 0.4)} ${90 + 65 * Math.cos(rad + 0.15)} ${90 + 65 * Math.sin(rad + 0.15)}`}
            stroke="#3a3a3a"
            strokeWidth="0.5"
            fill="none"
          />
        )
      })}
      <text x="155" y="20" fontSize="5" fill="#3a3a3a" fontFamily="monospace">Ø92</text>
      <text x="155" y="170" fontSize="5" fill="#3a3a3a" fontFamily="monospace">Ø11</text>
    </svg>
  )
}

/* ─── DB Core SVG ─── */
function DBCoreSVG() {
  const tickCount = 60
  const boltAngles = [0, 45, 90, 135, 180, 225, 270, 315]

  return (
    <svg viewBox="0 0 200 200" className="db-core-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="metalRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c0c8d0" />
          <stop offset="30%" stopColor="#e8ecf0" />
          <stop offset="50%" stopColor="#9aa4b0" />
          <stop offset="70%" stopColor="#dde2e8" />
          <stop offset="100%" stopColor="#a8b0b8" />
        </linearGradient>
        <linearGradient id="metalRing2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b0b8c4" />
          <stop offset="40%" stopColor="#d8dce4" />
          <stop offset="60%" stopColor="#a0a8b4" />
          <stop offset="100%" stopColor="#c8d0d8" />
        </linearGradient>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4b8bff" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#3366cc" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#1a3366" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="innerFace" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#1a2640" />
          <stop offset="60%" stopColor="#111c33" />
          <stop offset="100%" stopColor="#0d1520" />
        </radialGradient>
        <filter id="blueGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="db-outer-ring">
        <circle cx="100" cy="100" r="92" fill="none" stroke="url(#metalRing)" strokeWidth="6" />
        <circle cx="100" cy="100" r="95" fill="none" stroke="#c8ccd4" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="89" fill="none" stroke="#b8bcc4" strokeWidth="0.5" />
      </g>

      <g className="db-outer-ring-2">
        <circle cx="100" cy="100" r="80" fill="none" stroke="url(#metalRing2)" strokeWidth="5" />
        <circle cx="100" cy="100" r="82.5" fill="none" stroke="#d0d4dc" strokeWidth="0.3" />
        <circle cx="100" cy="100" r="77.5" fill="none" stroke="#bcc0c8" strokeWidth="0.3" />
      </g>

      <g className="db-ticks">
        {Array.from({ length: tickCount }).map((_, i) => {
          const angle = (i * 360) / tickCount
          const rad = (angle * Math.PI) / 180
          const isMajor = i % 5 === 0
          const innerR = isMajor ? 72 : 74
          const outerR = 77
          return (
            <line
              key={`tick-${i}`}
              x1={100 + innerR * Math.cos(rad)}
              y1={100 + innerR * Math.sin(rad)}
              x2={100 + outerR * Math.cos(rad)}
              y2={100 + outerR * Math.sin(rad)}
              stroke={isMajor ? '#555e6a' : '#8890a0'}
              strokeWidth={isMajor ? 1.2 : 0.5}
            />
          )
        })}
      </g>

      <g className="db-bolts">
        {boltAngles.map((angle) => {
          const rad = (angle * Math.PI) / 180
          const bx = 100 + 85 * Math.cos(rad)
          const by = 100 + 85 * Math.sin(rad)
          return (
            <g key={`bolt-${angle}`}>
              <circle cx={bx} cy={by} r="3.5" fill="#a8b0b8" stroke="#8890a0" strokeWidth="0.5" />
              <line x1={bx - 1.8} y1={by} x2={bx + 1.8} y2={by} stroke="#666e78" strokeWidth="0.6" />
              <line x1={bx} y1={by - 1.8} x2={bx} y2={by + 1.8} stroke="#666e78" strokeWidth="0.6" />
            </g>
          )
        })}
      </g>

      <circle cx="100" cy="100" r="69" fill="none" stroke="#4b8bff" strokeWidth="1" opacity="0.5" filter="url(#blueGlow)" className="db-core-glow" />
      <circle cx="100" cy="100" r="66" fill="url(#innerFace)" />
      <circle cx="100" cy="100" r="66" fill="url(#coreGlow)" className="db-core-glow" />
      <circle cx="100" cy="100" r="66" fill="none" stroke="#3366cc" strokeWidth="0.5" opacity="0.4" />
      <circle cx="100" cy="100" r="58" fill="none" stroke="#4b7cff" strokeWidth="0.3" opacity="0.2" />

      <g className="db-letters">
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
          fontSize="36"
          fontWeight="600"
          fill="#e8ecf4"
          letterSpacing="3"
        >
          DB
        </text>
      </g>
    </svg>
  )
}

/* ─── Main Loading Screen Component ─── */
export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [isExiting, setIsExiting] = useState(false)
  const [containerReady, setContainerReady] = useState(false)
  const orbitContainerRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<(HTMLDivElement | null)[]>([])
  const barFillRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>((null))
  const angleRef = useRef(0)
  const modelLoadedRef = useRef(false)
  const startTimeRef = useRef(Date.now())
  const exitedRef = useRef(false)
  const containerSizeRef = useRef({ cx: 0, cy: 0, r: 0 })

  // Direct DOM progress bar update — zero React re-renders
  const setBarWidth = useCallback((pct: number) => {
    const el = barFillRef.current
    if (el) el.style.width = `${pct}%`
  }, [])

  // Position pills using cached container dimensions — zero React re-renders
  const updatePillPositions = useCallback((orbitAngle: number) => {
    const { cx, cy, r } = containerSizeRef.current
    if (r === 0) return

    for (let i = 0; i < orbitPills.length; i++) {
      const pill = pillRefs.current[i]
      if (!pill) continue

      const baseAngle = -90 + (i * 360) / orbitPills.length
      const rad = ((baseAngle + orbitAngle) * Math.PI) / 180

      pill.style.left = `${cx + r * Math.cos(rad)}px`
      pill.style.top = `${cy + r * Math.sin(rad)}px`
    }
  }, [])

  // Measure container once and cache
  const measureContainer = useCallback(() => {
    const container = orbitContainerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    containerSizeRef.current = { cx, cy, r: Math.min(cx, cy) * 0.74 }
  }, [])

  // Trigger exit
  const triggerExit = useCallback(() => {
    if (exitedRef.current) return
    exitedRef.current = true
    setBarWidth(100)
    setIsExiting(true)
    setTimeout(onComplete, 600)
  }, [onComplete, setBarWidth])

  // Preload model — deferred 300ms so CSS entry animations play smooth
  useEffect(() => {
    startTimeRef.current = Date.now()
    let progressRAF: number
    let progressValue = 0

    // Simulated progress via direct DOM — zero React re-renders
    const tickProgress = () => {
      if (modelLoadedRef.current || progressValue >= 90) return
      const increment = Math.max(0.3, (90 - progressValue) * 0.02)
      progressValue = Math.min(progressValue + increment, 90)
      setBarWidth(progressValue)
      progressRAF = requestAnimationFrame(tickProgress)
    }

    // Defer heavy Three.js work so initial CSS animations are buttery
    const preloadDelay = setTimeout(() => {
      progressRAF = requestAnimationFrame(tickProgress)

      const allLoaded = Promise.all([
        startModelPreload(),
        waitForSplineScene(),
        waitForAllScenes(),
      ])

      allLoaded.then(() => {
        modelLoadedRef.current = true
        cancelAnimationFrame(progressRAF)
        setBarWidth(95)

        const elapsed = Date.now() - startTimeRef.current
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
        setTimeout(() => {
          setBarWidth(100)
          setTimeout(triggerExit, 300)
        }, remaining)
      }).catch(() => {
        modelLoadedRef.current = true
        cancelAnimationFrame(progressRAF)
        const elapsed = Date.now() - startTimeRef.current
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
        setTimeout(triggerExit, remaining)
      })
    }, 300)

    const safetyTimer = setTimeout(() => {
      if (!modelLoadedRef.current) {
        cancelAnimationFrame(progressRAF)
        triggerExit()
      }
    }, 12000)

    return () => {
      clearTimeout(preloadDelay)
      cancelAnimationFrame(progressRAF)
      clearTimeout(safetyTimer)
    }
  }, [triggerExit, setBarWidth])

  // Measure container + start orbit
  useEffect(() => {
    measureContainer()
    setContainerReady(true)

    const speed = 360 / 25
    let lastTime = performance.now()

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now
      angleRef.current = (angleRef.current + speed * dt) % 360
      updatePillPositions(angleRef.current)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [measureContainer, updatePillPositions])

  // Handle window resize
  useEffect(() => {
    const onResize = () => measureContainer()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measureContainer])

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className={`loading-overlay${isExiting ? ' exit' : ''}`} role="status" aria-label="Loading portfolio">
      <div className="loading-blueprint-grid" />

      <div className="loading-corner-sketch sketch-top-left"><SketchTopLeft /></div>
      <div className="loading-corner-sketch sketch-top-right"><SketchTopRight /></div>
      <div className="loading-corner-sketch sketch-bottom-left"><SketchBottomLeft /></div>
      <div className="loading-corner-sketch sketch-bottom-right"><SketchBottomRight /></div>

      <div className="loading-identity">
        <h1 className="loading-name">DEBAPRASHAD BHOWMIK</h1>
        <p className="loading-tagline">MECHANICAL SYSTEMS &nbsp;•&nbsp; AI TOOLS &nbsp;•&nbsp; WEIRD USEFUL THINGS</p>
      </div>

      <div className="loading-center-zone" ref={orbitContainerRef}>
        <div className="loading-orbit-guides">
          <div className="orbit-guide-ring orbit-guide-ring-1" />
          <div className="orbit-guide-ring orbit-guide-ring-2" />
          <div className="orbit-node orbit-node-1" />
          <div className="orbit-node orbit-node-2" />
          <div className="orbit-node orbit-node-3" />
          <div className="orbit-node orbit-node-4" />
        </div>

        <div className="loading-db-core">
          <DBCoreSVG />
        </div>

        {/* Pills always in DOM — CSS animation handles reveal timing */}
        {containerReady && orbitPills.map((pill, i) => {
          const baseAngle = -90 + (i * 360) / orbitPills.length
          const rad = (baseAngle * Math.PI) / 180
          const { cx, cy, r } = containerSizeRef.current
          const initX = cx + r * Math.cos(rad)
          const initY = cy + r * Math.sin(rad)

          return (
            <div
              key={pill.label}
              ref={(el) => { pillRefs.current[i] = el }}
              className="orbit-pill-abs"
              style={{
                left: `${initX}px`,
                top: `${initY}px`,
                opacity: 0,
                animation: `pillFadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${1.0 + i * 0.08}s forwards`,
              }}
            >
              <span className="orbit-pill-icon">
                <PillIcon type={pill.icon} />
              </span>
              <span className="orbit-pill-label">{pill.label}</span>
            </div>
          )
        })}
      </div>

      <div className="loading-quote">
        <p className="loading-quote-text">
          <span className="loading-quote-mark">&ldquo;</span>
          I'm obsessed with building things right —
          <br />
          because details decide everything.
          <span className="loading-quote-mark-end">&rdquo;</span>
        </p>
        <p className="loading-quote-author">— Deb</p>
      </div>

      <div className="loading-bar-container">
        <div className="loading-bar-track">
          <div className="loading-bar-fill" ref={barFillRef} />
        </div>
        <p className="loading-bar-text">PREPARING ENGINEERING WORKSPACE...</p>
      </div>
    </div>
  )
}
