import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Box,
  BrainCircuit,
  Briefcase,
  Calculator,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  Code2,
  Clipboard,
  Cpu,
  Crosshair,
  Droplets,
  Eye,
  ExternalLink,
  FileText,
  Globe2,
  Image as ImageIcon,
  Layers,
  ListTodo,
  Mail,
  MapPin,
  Maximize2,
  Minus,
  MonitorUp,
  Moon,
  PanelTop,
  Quote,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  StickyNote,
  Sun,
  Users,
  Wind,
  X,
} from 'lucide-react'
import {
  contactLinks,
  engineScenarios,
  hvacOptions,
  supervisorFeedback,
  workCards,
  type EngineScenario,
  type HvacOption,
  type SupervisorFeedback,
  type WorkCard,
} from './data/portfolio'
import GmpHvacModel from './components/GmpHvacModel'
import CubeSatThermalViewer, {
  type ThermalAnchorKey,
  type ThermalAnchorMap,
  type ThermalAnchorPoint,
  type ThermalTelemetry,
} from './components/CubeSatThermalViewer'

import './App.css'

const revealVariants: Variants = {
  hidden: { opacity: 0.15, y: 18 },
  visible: { opacity: 1, y: 0 },
}

const engineeringCoreItems = [
  {
    id: 'summary',
    label: 'Summary',
    icon: BrainCircuit,
    support: 'Quick intro to who I am and what I do.',
    response:
      'Mechanical engineering student and AI systems builder focused on CAD, simulation, digital twins, predictive maintenance, medical training simulators, and AI-assisted engineering workflows.',
  },
  {
    id: 'build',
    label: 'What I Build',
    icon: Box,
    support: 'Interactive systems built around real engineering problems.',
    response:
      'I build interactive engineering systems: diesel-engine digital twins, CAD/mechanical artifacts, bleeding-control training simulators, HVAC design tools, CubeSat thermal simulations, and AI screenshot assistants.',
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Code2,
    support: 'Tools, platforms, and technical muscles.',
    response:
      'Python, MATLAB, AutoCAD, SolidWorks, COMSOL, Arduino, scikit-learn, sensor systems, simulation, technical documentation, and mechanical design.',
  },
  {
    id: 'workflow',
    label: 'Workflow',
    icon: Settings2,
    support: 'How physical systems become useful interfaces.',
    response:
      'Physical system -> model/simulation -> data -> AI/analysis -> interface -> validation -> documentation.',
  },
  {
    id: 'why',
    label: 'Why Me',
    icon: Sparkles,
    support: 'A bridge between mechanics, data, and product clarity.',
    response:
      'I bridge mechanical engineering, simulation, AI, and product-style interfaces. I can understand hardware, model system behavior, analyze data, and present technical work clearly.',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: PanelTop,
    support: 'The portfolio cases this site is built around.',
    response:
      'Explore Snipping GPT, BMT Diesel Engine Digital Twin, Coupling Bolt, Bleeding Control Simulator, GMP HVAC System, and CubeSat Thermal.',
  },
] as const

type EngineeringCoreItem = (typeof engineeringCoreItems)[number]
type CorePillId = EngineeringCoreItem['id']
type CoreMotionState = {
  x: number
  y: number
  strength: number
  tiltX: number
  tiltY: number
}

type CorePanelOrigin = {
  x: number
  y: number
  scaleX: number
  scaleY: number
  connectorX: number
  connectorY: number
  connectorLength: number
  connectorAngle: number
}

const neutralCoreMotion = engineeringCoreItems.reduce(
  (acc, item) => {
    acc[item.id] = { x: 0, y: 0, strength: 0, tiltX: 0, tiltY: 0 }
    return acc
  },
  {} as Record<CorePillId, CoreMotionState>,
)

const corePillMotionProfiles: Record<
  CorePillId,
  { floatX: number; floatY: number; rotate: number; duration: number; delay: number; centerShift: [number, number] }
> = {
  summary: { floatX: 4, floatY: 7, rotate: 1.1, duration: 7.2, delay: 0, centerShift: [0, 18] },
  build: { floatX: 7, floatY: 5, rotate: -1.4, duration: 8.4, delay: 0.6, centerShift: [24, 16] },
  skills: { floatX: 6, floatY: 6, rotate: 1.3, duration: 7.8, delay: 1.2, centerShift: [-26, 16] },
  workflow: { floatX: 5, floatY: 9, rotate: 1, duration: 9.2, delay: 0.2, centerShift: [24, -18] },
  why: { floatX: 7, floatY: 6, rotate: -1.2, duration: 8.8, delay: 0.9, centerShift: [-28, -18] },
  projects: { floatX: 5, floatY: 7, rotate: 1.2, duration: 7.6, delay: 1.5, centerShift: [0, -24] },
}

const coreRobotLookTargets: Record<CorePillId, { x: number; y: number; rotate: number }> = {
  summary: { x: 0, y: -8, rotate: -0.5 },
  build: { x: -10, y: -2, rotate: -1.3 },
  skills: { x: 10, y: -2, rotate: 1.3 },
  workflow: { x: -9, y: 6, rotate: -0.8 },
  why: { x: 9, y: 6, rotate: 0.8 },
  projects: { x: 0, y: 9, rotate: 0.4 },
}

const coreProjectLinks = [
  { title: 'Diesel Engine Digital Twin', meta: 'Synthetic telemetry, ML health scoring, RUL', href: '#digital-twin' },
  { title: 'Bleeding Control Simulator', meta: 'Sensor feedback, flow logic, training UI', href: '#bleeding-simulator' },
  { title: 'Snipping GPT', meta: 'Screenshot intent system for fast AI help', href: '#snipping-gpt' },
]

import { loadSplineViewerScript, getSplineSceneUrl } from './splinePreloader'

const splineRobotSceneUrl = getSplineSceneUrl()

const twinViewItems = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'telemetry', label: 'Telemetry', icon: MonitorUp },
  { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
  { id: 'simulation', label: 'Simulation', icon: Crosshair },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings2 },
] as const

const twinPipelineSteps = ['Digital Twin', 'Synthetic Telemetry', 'ML Training', 'Prediction', 'Maintenance Action'] as const
const dieselReportHref = '/reports/technical-report-wt3-b00907766.pdf'
const dieselPresentationHref = '/reports/digital-twin-wt3-presentation-debaprashad-bhowmik.pptx'

type TwinViewId = (typeof twinViewItems)[number]['id']
type DieselDrawer =
  | { type: 'specs' }
  | { type: 'factors' }
  | { type: 'workOrder' }
  | { type: 'telemetry'; label: string }
  | { type: 'report'; label: string }

type LiveTwinState = {
  id: string
  label: string
  summary: string
  health: number
  anomaly: number
  rul: number
  confidence: number
  onset: string
  metrics: EngineScenario['metrics']
  series: EngineScenario['series']
  sampleCount: number
  trainedSamples: number
  batchId: string
  loadVariation: string
  sensorNoise: string
  epoch: number
  validationAccuracy: number
  loss: number
  faultLabel: string
  channels: string[]
}

const thermalAnchorFallbacks: ThermalAnchorMap = {
  xFace: { x: 54, y: 36, visible: true },
  panel: { x: 42, y: 20, visible: true },
  battery: { x: 34, y: 38, visible: true },
  radio: { x: 58, y: 42, visible: true },
  nadir: { x: 52, y: 62, visible: true },
}

const thermalCalloutOffsets: Record<ThermalAnchorKey, { x: number; y: number }> = {
  xFace: { x: 14, y: -3 },
  panel: { x: -16, y: -4 },
  battery: { x: -14, y: 4 },
  radio: { x: 14, y: 12 },
  nadir: { x: -14, y: 16 },
}

const feedbackProofItems: Array<{ icon: LucideIcon; title: string; detail: string }> = [
  {
    icon: Briefcase,
    title: '3 engineering internships',
    detail: 'Hands-on experience in real projects.',
  },
  {
    icon: Users,
    title: 'Real feedback from supervisors',
    detail: 'Verified testimonials from industry leaders.',
  },
  {
    icon: CircuitBoard,
    title: 'CAD + AI + Mechanical Systems',
    detail: 'Bridging design, data, and intelligent solutions.',
  },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function createThermalCalloutPositions(anchors: ThermalAnchorMap): ThermalAnchorMap {
  return Object.fromEntries(
    (Object.keys(anchors) as ThermalAnchorKey[]).map((key) => {
      const offset = thermalCalloutOffsets[key]
      return [
        key,
        {
          x: clamp(anchors[key].x + offset.x, 9, 91),
          y: clamp(anchors[key].y + offset.y, 9, 86),
          visible: anchors[key].visible,
        },
      ]
    }),
  ) as ThermalAnchorMap
}

function SectionReveal({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      id={id}
      className={className}
      variants={reduceMotion ? undefined : revealVariants}
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.section>
  )
}

function Sparkline({
  data,
  stroke = '#4b7cff',
  fill = false,
}: {
  data: number[]
  stroke?: string
  fill?: boolean
}) {
  const width = 180
  const height = 62
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = Math.max(max - min, 1)
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width
      const y = height - ((value - min) / span) * (height - 10) - 5
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {fill && (
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={stroke}
          opacity="0.12"
        />
      )}
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function App() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    window.requestAnimationFrame(() => {
      document.querySelector(hash)?.scrollIntoView({ block: 'start' })
    })
  }, [])

  return (
    <>
      <MotionConfig reducedMotion="never">
      <div className="site-shell">
        <Header />
        <main>
          <Hero />
          <SnippingGPTSection />
          <DigitalTwinSection />
          <CouplingBoltSection />
          <BleedingSimulatorSection />
          <HvacSection />
          <CubeSatSection />
          <SupervisorFeedbackSection />
          <ClosingSection />
        </main>
      </div>
      </MotionConfig>
    </>
  )
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Debaprashad Bhowmik home">
        Debaprashad Bhowmik<span>.</span>
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#work">Work</a>
        <a href="#digital-twin">Experiments</a>
        <a href="#supervisor-feedback">Feedback</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="resume-link" href={contactLinks.resume} target="_blank" rel="noreferrer">
        Resume <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="hero-section">
      <div className="hero-grid">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">Hey, I'm Deb</p>
          <h1>
            <span>Mechanical systems,</span>
            <span>AI tools, and</span>
            <em>weird useful things.</em>
          </h1>
          <p className="lede">
            Mechanical engineering student at <strong className="hero-school">Dalhousie University</strong> and AI
            systems builder. I design CAD systems, build digital twins for heavy machinery, develop
            medical training simulators, optimize clean infrastructure, and ship AI-assisted tools
            that make complex work feel simple.
          </p>
          <div className="hero-credentials" aria-label="Education and location">
            <span className="hero-credential hero-credential-school">
              <img className="hero-dal-logo" src="/brand/dalhousie-university.png" alt="" aria-hidden="true" />
              Dalhousie University
            </span>
            <span className="hero-credential hero-credential-dark">
              <Settings2 size={18} aria-hidden="true" />
              Mechanical Engineering
            </span>
            <span className="hero-credential">
              <MapPin size={18} aria-hidden="true" />
              Halifax, NS
            </span>
          </div>
          <div className="micro-note">
            <span />
            Built for engineers, operators, students, and anyone staring at a hard screen.
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <EngineeringCore />
        </motion.div>
      </div>

      <SelectedWork />
    </section>
  )
}

function EngineeringCore() {
  const reduceMotion = useReducedMotion()
  const stageRef = useRef<HTMLDivElement | null>(null)
  const pillRefs = useRef<Record<CorePillId, HTMLButtonElement | null>>({
    summary: null,
    build: null,
    skills: null,
    workflow: null,
    why: null,
    projects: null,
  })
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const frameRef = useRef<number | null>(null)
  const [hoveredId, setHoveredId] = useState<CorePillId | null>(null)
  const [magnetFocusId, setMagnetFocusId] = useState<CorePillId | null>(null)
  const [openId, setOpenId] = useState<CorePillId | null>(null)
  const [panelOrigin, setPanelOrigin] = useState<CorePanelOrigin | null>(null)
  const [magnetState, setMagnetState] = useState<Record<CorePillId, CoreMotionState>>(neutralCoreMotion)
  const openItem = openId ? engineeringCoreItems.find((item) => item.id === openId) : null
  const lookId = hoveredId ?? magnetFocusId ?? openId
  const robotLook = lookId ? coreRobotLookTargets[lookId] : { x: 0, y: 0, rotate: 0 }
  const robotStyle = {
    '--robot-look-x': `${reduceMotion ? 0 : robotLook.x}px`,
    '--robot-look-y': `${reduceMotion ? 0 : robotLook.y}px`,
    '--robot-look-rotate': `${reduceMotion ? 0 : robotLook.rotate}deg`,
  } as CSSProperties

  const closePanel = useCallback(() => {
    setOpenId(null)
    setPanelOrigin(null)
  }, [])

  const calculateMagnet = useCallback((clientX: number, clientY: number) => {
    let nearestId: CorePillId | null = null
    let nearestDistance = Number.POSITIVE_INFINITY
    const distances = new Map<CorePillId, { distance: number; dx: number; dy: number; relX: number; relY: number }>()

    engineeringCoreItems.forEach((item) => {
      const pill = pillRefs.current[item.id]
      if (!pill) return

      const rect = pill.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = clientX - centerX
      const dy = clientY - centerY
      const distance = Math.hypot(dx, dy)

      distances.set(item.id, {
        distance,
        dx,
        dy,
        relX: (clientX - rect.left) / rect.width - 0.5,
        relY: (clientY - rect.top) / rect.height - 0.5,
      })

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestId = item.id
      }
    })

    const next = {} as Record<CorePillId, CoreMotionState>
    engineeringCoreItems.forEach((item) => {
      const data = distances.get(item.id)
      if (!data) {
        next[item.id] = { x: 0, y: 0, strength: 0, tiltX: 0, tiltY: 0 }
        return
      }

      const radius = 320
      const rawStrength = Math.max(0, 1 - data.distance / radius)
      const nearestBoost = item.id === nearestId ? 1 : 0.28
      const easedStrength = Math.min(1, (1 - Math.pow(1 - rawStrength, 2)) * nearestBoost)
      const isNearest = item.id === nearestId
      const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

      next[item.id] = {
        x: clamp(data.dx * (isNearest ? 0.34 : 0.09) * easedStrength, isNearest ? -34 : -8, isNearest ? 34 : 8),
        y: clamp(data.dy * (isNearest ? 0.28 : 0.08) * easedStrength, isNearest ? -28 : -7, isNearest ? 28 : 7),
        strength: easedStrength,
        tiltX: clamp(-data.relY * 10 * easedStrength, -7, 7),
        tiltY: clamp(data.relX * 11 * easedStrength, -8, 8),
      }
    })

    setMagnetFocusId(nearestDistance < 320 ? nearestId : null)
    setMagnetState(next)
  }, [])

  const clearMagnet = useCallback(() => {
    pointerRef.current = null
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    setMagnetFocusId(null)
    setHoveredId(null)
    setMagnetState(neutralCoreMotion)
  }, [])

  const openPanelFromPill = useCallback((itemId: CorePillId, pill: HTMLButtonElement) => {
    const stage = stageRef.current
    const stageRect = stage?.getBoundingClientRect()
    const pillRect = pill.getBoundingClientRect()
    const isCompact = typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches

    if (!stageRect || isCompact) {
      setPanelOrigin(null)
      setOpenId(itemId)
      return
    }

    const finalWidth = Math.min(420, Math.max(280, stageRect.width - 112))
    const finalHeight = 260
    const finalLeft = stageRect.width - 54 - finalWidth
    const finalTop = 156
    const originCenterX = pillRect.left - stageRect.left + pillRect.width / 2
    const originCenterY = pillRect.top - stageRect.top + pillRect.height / 2
    const finalCenterX = finalLeft + finalWidth / 2
    const finalCenterY = finalTop + finalHeight / 2
    const connectorStartX = originCenterX
    const connectorStartY = originCenterY
    const connectorEndX = finalLeft + 34
    const connectorEndY = finalTop + 34
    const connectorDx = connectorEndX - connectorStartX
    const connectorDy = connectorEndY - connectorStartY

    setPanelOrigin({
      x: originCenterX - finalCenterX,
      y: originCenterY - finalCenterY,
      scaleX: Math.max(0.22, pillRect.width / finalWidth),
      scaleY: Math.max(0.24, pillRect.height / finalHeight),
      connectorX: connectorStartX,
      connectorY: connectorStartY,
      connectorLength: Math.hypot(connectorDx, connectorDy),
      connectorAngle: Math.atan2(connectorDy, connectorDx),
    })
    setOpenId(itemId)
  }, [])

  useEffect(() => {
    if (reduceMotion) return

    const scheduleMagnet = () => {
      if (frameRef.current !== null) return

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        const pointer = pointerRef.current
        if (pointer) {
          calculateMagnet(pointer.x, pointer.y)
        }
      })
    }

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return

      const stage = stageRef.current
      if (!stage) return

      const rect = stage.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom

      if (!inside) {
        clearMagnet()
        return
      }

      pointerRef.current = { x: event.clientX, y: event.clientY }
      scheduleMagnet()
    }

    window.addEventListener('pointermove', handleWindowPointerMove, true)
    window.addEventListener('pointerleave', clearMagnet)

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove, true)
      window.removeEventListener('pointerleave', clearMagnet)
    }
  }, [calculateMagnet, clearMagnet, reduceMotion])

  useEffect(() => {
    if (!openId) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('.core-command-panel, .core-pill')) return
      closePanel()
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [closePanel, openId])

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={stageRef}
      className={`engineering-core-stage spline-robot-stage${openId ? ' has-open-panel' : ''}`}
      aria-label="Interactive robot selector"
    >
      <div className="engineering-core-object spline-robot-object" style={robotStyle}>
        <div className="core-orbit-field" aria-hidden="true">
          <span />
          <span />
          <span />
          <i className="core-orbit-node core-orbit-node-one" />
          <i className="core-orbit-node core-orbit-node-two" />
          <i className="core-orbit-node core-orbit-node-three" />
          <i className="core-orbit-node core-orbit-node-four" />
        </div>

        <SplineRobotViewer />

        <AnimatePresence>
          {openItem ? (
            <motion.button
              className="core-panel-scrim"
              type="button"
              aria-label="Close command panel"
              onClick={closePanel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
            />
          ) : null}
        </AnimatePresence>

        <div className="core-front-face spline-pill-layer">
          {engineeringCoreItems.map((item, index) => {
            const motionProfile = corePillMotionProfiles[item.id]
            const magnetic = reduceMotion ? neutralCoreMotion[item.id] : magnetState[item.id]

            return (
              <MagneticCorePill
                key={item.id}
                item={item}
                index={index}
                motionProfile={motionProfile}
                magnetic={magnetic}
                reduceMotion={reduceMotion}
                isOpen={openId === item.id}
                isMuted={Boolean(openId && openId !== item.id)}
                isHovered={hoveredId === item.id}
                registerPill={(node) => {
                  pillRefs.current[item.id] = node
                }}
                onOpen={openPanelFromPill}
                onHoverChange={setHoveredId}
              />
            )
          })}
        </div>

        <AnimatePresence>
          {openItem && panelOrigin && !reduceMotion ? (
            <motion.i
              key={`${openItem.id}-connector`}
              className="core-panel-connector"
              aria-hidden="true"
              style={{
                left: panelOrigin.connectorX,
                top: panelOrigin.connectorY,
                width: panelOrigin.connectorLength,
                transform: `rotate(${panelOrigin.connectorAngle}rad)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {openItem ? (
            <motion.article
              key={openItem.id}
              id={`core-command-panel-${openItem.id}`}
              className="core-command-panel"
              role="dialog"
              aria-modal="false"
              aria-labelledby={`core-command-panel-title-${openItem.id}`}
              initial={
                panelOrigin && !reduceMotion
                  ? { opacity: 0.42, x: panelOrigin.x, y: panelOrigin.y, scaleX: panelOrigin.scaleX, scaleY: panelOrigin.scaleY }
                  : { opacity: 0, scale: 0.92, y: 18 }
              }
              animate={{ opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, scale: 1 }}
              exit={
                panelOrigin && !reduceMotion
                  ? { opacity: 0, x: panelOrigin.x, y: panelOrigin.y, scaleX: panelOrigin.scaleX, scaleY: panelOrigin.scaleY }
                  : { opacity: 0, scale: 0.9, y: 14 }
              }
              transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="core-command-panel-header">
                <div>
                  <span>{openItem.label}</span>
                  <h2 id={`core-command-panel-title-${openItem.id}`}>{openItem.support}</h2>
                </div>
                <button className="core-command-close" type="button" aria-label="Close panel" onClick={closePanel}>
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <CoreCommandPanelContent id={openItem.id} />
    </motion.article>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MagneticCorePill({
  item,
  index,
  motionProfile,
  magnetic,
  reduceMotion,
  isOpen,
  isMuted,
  isHovered,
  registerPill,
  onOpen,
  onHoverChange,
}: {
  item: EngineeringCoreItem
  index: number
  motionProfile: (typeof corePillMotionProfiles)[CorePillId]
  magnetic: CoreMotionState
  reduceMotion: boolean | null
  isOpen: boolean
  isMuted: boolean
  isHovered: boolean
  registerPill: (node: HTMLButtonElement | null) => void
  onOpen: (itemId: CorePillId, pill: HTMLButtonElement) => void
  onHoverChange: React.Dispatch<React.SetStateAction<CorePillId | null>>
}) {
  const Icon = item.icon
  const centerShift = isOpen ? motionProfile.centerShift : [0, 0]

  return (
    <div className={`core-pill-shell spline-robot-pill-${index}`}>
      <motion.div
        className="core-pill-idle"
        animate={
          reduceMotion
            ? { x: 0, y: 0, rotate: 0 }
            : {
                x: [0, motionProfile.floatX, -motionProfile.floatX * 0.45, 0],
                y: [0, -motionProfile.floatY, motionProfile.floatY * 0.38, 0],
                rotate: [0, motionProfile.rotate, -motionProfile.rotate * 0.7, 0],
              }
        }
        transition={{
          duration: motionProfile.duration,
          delay: motionProfile.delay,
          repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      >
        <motion.button
          ref={registerPill}
          className="core-pill"
          type="button"
          aria-expanded={isOpen}
          aria-pressed={isOpen}
          aria-controls={`core-command-panel-${item.id}`}
          onClick={(event) => onOpen(item.id, event.currentTarget)}
          onPointerEnter={() => onHoverChange(item.id)}
          onPointerLeave={() => onHoverChange((current) => (current === item.id ? null : current))}
          onFocus={() => onHoverChange(item.id)}
          onBlur={() => onHoverChange((current) => (current === item.id ? null : current))}
          animate={{
            x: magnetic.x + centerShift[0],
            y: magnetic.y + centerShift[1],
            opacity: isOpen ? 0.28 : isMuted ? 0.5 : 1,
            scale: isMuted ? 0.96 : isOpen ? 1.07 : isHovered || magnetic.strength > 0.06 ? 1.04 + magnetic.strength * 0.055 : 1,
            rotateX: magnetic.tiltX,
            rotateY: magnetic.tiltY,
            z: isMuted ? -18 : isOpen || isHovered ? 36 : magnetic.strength * 26,
          }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 23,
            mass: 0.62,
          }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          <motion.span
            className="core-pill-icon"
            animate={{
              rotate: isHovered ? (index % 2 === 0 ? -8 : 8) : magnetic.strength * (index % 2 === 0 ? -6 : 6),
              x: isHovered ? (index % 2 === 0 ? -1.5 : 1.5) : magnetic.x * 0.04,
            }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
          >
            <Icon size={18} aria-hidden="true" />
          </motion.span>
          {item.label}
        </motion.button>
      </motion.div>
    </div>
  )
}

function CoreCommandPanelContent({ id }: { id: CorePillId }) {
  if (id === 'summary') {
    return (
      <div className="core-panel-copy">
        <p>
          Mechanical engineering student and AI systems builder focused on CAD systems, digital twins,
          simulation-driven tools, and practical automation.
        </p>
        <div className="core-panel-stat-row">
          <span>CAD</span>
          <span>Simulation</span>
          <span>AI systems</span>
        </div>
      </div>
    )
  }

  if (id === 'build') {
    return (
      <div className="core-panel-card-grid">
        {[
          ['Mechanical Systems', 'CAD artifacts, training devices, clean infrastructure, and manufacturable parts.'],
          ['AI + Digital Twins', 'Synthetic telemetry, health scoring, anomaly logic, and predictive maintenance.'],
          ['Useful Web Tools', 'Interfaces that make engineering work easier to inspect, explain, and reuse.'],
        ].map(([title, copy]) => (
          <div className="core-mini-card" key={title}>
            <strong>{title}</strong>
            <p>{copy}</p>
          </div>
        ))}
      </div>
    )
  }

  if (id === 'skills') {
    const skills = [
      'Python',
      'MATLAB',
      'C++',
      'SolidWorks',
      'AutoCAD',
      'COMSOL',
      'Bluebeam',
      'Arduino',
      'Machine Learning',
      'CAD',
      'Simulation',
      'Technical Writing',
    ]

    return (
      <div className="core-skill-cloud">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    )
  }

  if (id === 'workflow') {
    const steps = ['Research', 'Model', 'Prototype', 'Test', 'Improve', 'Ship']

    return (
      <ol className="core-workflow-line">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    )
  }

  if (id === 'projects') {
    return (
      <div className="core-project-list">
        {coreProjectLinks.map((project) => (
          <a key={project.title} href={project.href}>
            <strong>{project.title}</strong>
            <span>{project.meta}</span>
          </a>
        ))}
      </div>
    )
  }

  return (
    <ul className="core-proof-list">
      {[
        'Mechanical engineering background with real co-op and internship work.',
        'Strong CAD, simulation, controls, and AI hybrid skillset.',
        'Builds practical tools that explain, diagnose, and support decisions.',
        'Turns complex technical work into interfaces people can actually use.',
      ].map((point) => (
        <li key={point}>
          <CheckCircle2 size={17} aria-hidden="true" />
          {point}
        </li>
      ))}
    </ul>
  )
}

function SplineRobotViewer() {
  const viewerRef = useRef<HTMLElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) {
      loadSplineViewerScript()
        .then(() => setStatus('ready'))
        .catch(() => setStatus('error'))
      return
    }

    const markReady = () => { setStatus('ready') }
    const markError = () => { setStatus('error') }

    viewer.addEventListener('load', markReady)
    viewer.addEventListener('error', markError)

    return () => {
      viewer.removeEventListener('load', markReady)
      viewer.removeEventListener('error', markError)
    }
  }, [])

  return (
    <div className={`spline-robot-viewer is-${status}`} aria-label="Interactive Spline robot model">
      {status === 'loading' && (
        <div className="spline-loader">
          <div className="spline-loader-spinner" />
        </div>
      )}
      {React.createElement('spline-viewer', {
        ref: viewerRef,
        url: splineRobotSceneUrl,
        loading: 'eager',
      })}
      <span className="spline-watermark-fog" aria-hidden="true" />
    </div>
  )
}

function SelectedWork() {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion()
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const activeCardId = hoveredCardId ?? selectedCardId

  const scrollWorkCards = useCallback(
    (direction: -1 | 1) => {
      const row = rowRef.current
      if (!row) return

      row.scrollBy({
        left: direction * Math.max(360, row.clientWidth * 0.72),
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    },
    [reduceMotion],
  )

  return (
    <div
      id="work"
      className={`selected-work ${activeCardId ? 'has-active-card' : ''}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setHoveredCardId(null)
          setSelectedCardId(null)
        }
      }}
    >
      <div className="selected-work-top">
        <div className="section-kicker">
          <span />
          Selected work
        </div>
        <div className="work-rail-actions" aria-label="Selected work rail controls">
          <button type="button" className="work-rail-arrow" aria-label="Show previous projects" onClick={() => scrollWorkCards(-1)}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="work-more-button" onClick={() => scrollWorkCards(1)}>
            See more projects
            <ChevronRight size={17} aria-hidden="true" />
          </button>
          <button type="button" className="work-rail-arrow" aria-label="Show more projects" onClick={() => scrollWorkCards(1)}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={rowRef} className="work-card-row" onMouseLeave={() => setHoveredCardId(null)}>
        {workCards.map((card) => (
          <ProjectCard
            key={card.id}
            card={card}
            isActive={activeCardId === card.id}
            isDimmed={activeCardId !== null && activeCardId !== card.id}
            onHover={setHoveredCardId}
            onSelect={setSelectedCardId}
          />
        ))}
      </div>
    </div>
  )
}

const ProjectCard = React.memo(function ProjectCard({
  card,
  isActive,
  isDimmed,
  onHover,
  onSelect,
}: {
  card: WorkCard
  isActive: boolean
  isDimmed: boolean
  onHover: (cardId: string) => void
  onSelect: (cardId: string) => void
}) {
  return (
    <article
      className={`project-card project-card-${card.variant} ${isActive ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
      style={{ '--project-accent': card.accent } as CSSProperties}
      tabIndex={0}
      aria-label={`${card.number}. ${card.title}`}
      aria-expanded={isActive}
      onMouseEnter={() => onHover(card.id)}
      onFocus={() => onSelect(card.id)}
      onClick={() => onSelect(card.id)}
    >
      <div className="project-media">
        <img src={card.image} alt={card.imageAlt} style={{ objectPosition: card.imagePosition ?? '50% 50%' }} />
      </div>
      <div className="project-card-body">
        <span className="project-number">{card.number}</span>
        <div className="project-card-heading">
          <h2>{card.title}</h2>
          <p>{card.kicker}</p>
        </div>
        <p className="project-summary">{card.summary}</p>
        <ul className="project-details">
          {card.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <div className="tag-row">
          {card.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <a className="project-cta" href={`#${card.id}`} onClick={(event) => event.stopPropagation()}>
          View Project
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
       </div>
    </article>
  )
})

type SnipAction = 'Explain' | 'Steps' | 'Custom' | 'Summary' | 'Bug' | 'Answer'
type SnipWindowId = 'notes' | 'article' | 'calculator' | 'error' | 'image' | 'todo' | 'files' | 'tools'
type SnipTargetId = SnipWindowId | 'taskbar' | 'desktop'
type SelectionBox = {
  x: number
  y: number
  width: number
  height: number
}
type SelectionDragStart = {
  x: number
  y: number
  snipId?: SnipTargetId
}
type SnipBotPosition = {
  x: number
  y: number
}
type SnipBotDragStart = {
  clientX: number
  clientY: number
  position: SnipBotPosition
  hasMoved: boolean
}
type SnipTarget = {
  id: SnipTargetId
  name: string
  icon: LucideIcon
}
type SnipWindowTarget = SnipTarget & {
  id: SnipWindowId
  initialOpen: boolean
}
type SnipWindowState = {
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  z: number
}
type SnipClientRect = {
  top: number
  right: number
  bottom: number
  left: number
}
type ResponseCardState = {
  target: SnipTarget | null
  action: SnipAction
  text: string
  status?: 'copied' | 'saved'
}
type SnipInfoTabId = 'overview' | 'capture' | 'actions' | 'privacy' | 'notes'

const snipActions: SnipAction[] = ['Explain', 'Steps', 'Custom', 'Summary', 'Bug', 'Answer']

const snipWindowTargets: SnipWindowTarget[] = [
  { id: 'notes', name: 'Notes App', icon: StickyNote, initialOpen: true },
  { id: 'article', name: 'Browser Article', icon: Globe2, initialOpen: true },
  { id: 'calculator', name: 'Calculator', icon: Calculator, initialOpen: true },
  { id: 'error', name: 'Error Popup', icon: AlertTriangle, initialOpen: true },
  { id: 'image', name: 'Image Preview', icon: ImageIcon, initialOpen: true },
  { id: 'todo', name: 'To-Do List', icon: ListTodo, initialOpen: true },
  { id: 'files', name: 'My Files', icon: FileText, initialOpen: false },
  { id: 'tools', name: 'Tools', icon: Settings2, initialOpen: false },
]

const snipTargets: SnipTarget[] = [
  ...snipWindowTargets,
  { id: 'taskbar', name: 'Taskbar', icon: PanelTop },
  { id: 'desktop', name: 'Desktop Workspace', icon: MonitorUp },
]

const snipTaskbarWindows: SnipWindowId[] = ['notes', 'files', 'tools', 'image']

const snipCalculatorKeys = [
  'C',
  '/',
  '*',
  'Del',
  '7',
  '8',
  '9',
  '-',
  '4',
  '5',
  '6',
  '+',
  '1',
  '2',
  '3',
  '=',
  '0',
  '.',
  '00',
  '%',
]

const initialSnipWindowStates: Record<SnipWindowId, SnipWindowState> = snipWindowTargets.reduce(
  (states, target, index) => ({
    ...states,
    [target.id]: {
      isOpen: target.initialOpen,
      isMinimized: false,
      isMaximized: false,
      z: 8 + index,
    },
  }),
  {} as Record<SnipWindowId, SnipWindowState>,
)

const snipActionPositions: Record<SnipAction, { x: number; y: number }> = {
  Explain: { x: 0, y: -118 },
  Steps: { x: 126, y: -42 },
  Custom: { x: -126, y: -42 },
  Summary: { x: -128, y: 68 },
  Bug: { x: 0, y: 124 },
  Answer: { x: 128, y: 68 },
}

const snipInfoTabs: Array<{
  id: SnipInfoTabId
  label: string
  body: string
  features: Array<{ title: string; detail: string; icon: LucideIcon }>
}> = [
  {
    id: 'overview',
    label: 'Overview',
    body:
      'Snipping GPT is a screenshot-first assistant concept: select anything visible on your screen, choose the kind of help you need, and receive an AI-style response without leaving the page.',
    features: [
      { title: 'Screen First', detail: 'Built around visible desktop context.', icon: MonitorUp },
      { title: 'AI Answers', detail: 'Summaries, explanations, and direct help.', icon: Sparkles },
      { title: 'Fast Intent', detail: 'Six pills turn captures into actions.', icon: Crosshair },
      { title: 'Demo Safe', detail: 'Frontend-only hard-coded responses.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'capture',
    label: 'Capture Flow',
    body:
      'The demo uses real DOM cards inside a fake desktop. Dragging creates a selection rectangle, compares overlap against each object, and selects the best matching target.',
    features: [
      { title: 'Drag Select', detail: 'Crop box follows pointer movement.', icon: Crosshair },
      { title: 'Overlap Logic', detail: 'Bounding boxes choose the target.', icon: Layers },
      { title: 'DOM Objects', detail: 'Every item is selectable markup.', icon: PanelTop },
      { title: 'Mobile Tap', detail: 'Small screens use tap-first cards.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    body:
      'After selection, SnipBot reveals action pills for Explain, Steps, Custom, Summary, Bug, and Answer. Each pill maps to a deterministic response for the selected object.',
    features: [
      { title: 'Explain', detail: 'Turn confusing content into plain words.', icon: BrainCircuit },
      { title: 'Steps', detail: 'Convert context into next actions.', icon: ListTodo },
      { title: 'Bug Help', detail: 'Surface likely issues and fixes.', icon: AlertTriangle },
      { title: 'Answer', detail: 'Respond from selected context only.', icon: Clipboard },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy',
    body:
      'This portfolio demo does not use screenshots, OCR, AI APIs, or backend calls. It simulates the product behavior with local React state and hard-coded copy.',
    features: [
      { title: 'No API', detail: 'No model request is made.', icon: CheckCircle2 },
      { title: 'No OCR', detail: 'Nothing is read from images.', icon: Eye },
      { title: 'Local State', detail: 'Interactions stay in the browser.', icon: Settings2 },
      { title: 'Transparent', detail: 'Responses are predefined.', icon: FileText },
    ],
  },
  {
    id: 'notes',
    label: 'Notes',
    body:
      'This is a demo of the real software. The real app would use an API key from your favorite AI model to understand what you capture on screen and respond instantly with useful answers.',
    features: [
      { title: 'Copy', detail: 'Response text can be copied.', icon: Clipboard },
      { title: 'Save', detail: 'Save is represented as demo feedback.', icon: Save },
      { title: 'Reset', detail: 'Escape clears the current state.', icon: X },
      { title: 'Move Bot', detail: 'SnipBot can be repositioned.', icon: Camera },
    ],
  },
]

const responses: Record<SnipTargetId, Record<SnipAction, string>> = {
  notes: {
    Summary:
      'This note contains a product launch plan with tasks for landing page completion, pricing review, demo preparation, and beta user invitations.',
    Explain:
      'The note is organizing a launch workflow. It separates marketing, pricing, product demo, and user outreach into clear next actions.',
    Steps:
      '1. Finalize the landing page. 2. Review pricing. 3. Prepare the demo. 4. Invite beta users. 5. Confirm launch readiness.',
    Answer: 'The main goal of this note is to prepare a product launch.',
    Bug: 'Potential issue: the note has tasks but no owners, deadlines, or priority levels.',
    Custom:
      'Ask a custom question such as: turn this into a schedule, assign priorities, or rewrite it professionally.',
  },
  article: {
    Summary:
      'This article explains that better sleep supports memory, creativity, focus, and overall well-being.',
    Explain:
      'The selected article argues that consistent sleep helps the brain recover, process information, and perform better during the day.',
    Steps:
      '1. Keep a consistent sleep schedule. 2. Reduce screen time before bed. 3. Keep the room dark. 4. Avoid caffeine late. 5. Track sleep quality.',
    Answer: 'The article is mainly about how sleep improves health and performance.',
    Bug: 'Potential issue: the article gives general claims but does not include sources or data.',
    Custom: 'Ask for a simpler explanation, bullet summary, or social media caption.',
  },
  calculator: {
    Summary: 'The calculator shows that 18% of 240 equals 43.2.',
    Explain: 'To calculate 18% of 240, convert 18% to 0.18 and multiply by 240.',
    Steps: '1. Convert 18% to 0.18. 2. Multiply 0.18 x 240. 3. Result = 43.2.',
    Answer: '18% of 240 is 43.2.',
    Bug: 'No calculation issue detected. The result is correct.',
    Custom: 'Ask for a formula, percentage explanation, or another calculation.',
  },
  error: {
    Summary: 'This popup shows an application error with code 500.',
    Explain:
      'A 500 error usually means the server failed while processing the request. The issue is likely backend-related, not the user’s device.',
    Steps:
      '1. Retry the request. 2. Check server logs. 3. Confirm API status. 4. Validate request payload. 5. Add better error handling.',
    Answer: 'This is likely an internal server error.',
    Bug: 'Detected bug: request failed with Code 500. Recommended fix: inspect backend logs and API response handling.',
    Custom: 'Ask for debugging steps, user-friendly error copy, or a developer ticket.',
  },
  image: {
    Summary: 'This image shows a scenic mountain lake landscape.',
    Explain:
      'The image contains mountains, water, warm lighting, and a calm outdoor setting. It could be used as a hero image or visual background.',
    Steps: '1. Identify subject. 2. Describe composition. 3. Extract mood. 4. Suggest use case. 5. Generate alt text.',
    Answer: 'This is a landscape image of a mountain lake.',
    Bug: 'Potential issue: image metadata is limited. Add descriptive alt text for accessibility.',
    Custom: 'Ask for alt text, caption ideas, color palette, or design usage.',
  },
  todo: {
    Summary: 'This to-do list contains tasks for building and launching a product page.',
    Explain:
      'The list combines design, copywriting, checkout testing, email preparation, and documentation updates.',
    Steps:
      '1. Design the landing page. 2. Write the product copy. 3. Test checkout. 4. Prepare launch email. 5. Update documentation.',
    Answer: 'The list is focused on preparing a product launch workflow.',
    Bug: 'Potential issue: tasks are not prioritized and some items are unchecked without deadlines.',
    Custom: 'Ask to prioritize this list, turn it into a timeline, or create subtasks.',
  },
  files: {
    Summary: 'The file explorer shows portfolio documents, screenshots, exports, and project notes.',
    Explain:
      'This simulated file app groups useful work artifacts into a small desktop-style explorer so SnipBot can answer questions about visible files.',
    Steps:
      '1. Open My Files. 2. Pick the visible folder or document. 3. Capture the area with SnipBot. 4. Choose Summary, Steps, or Answer.',
    Answer: 'The visible files are organized around portfolio assets, technical reports, screenshots, and project exports.',
    Bug: 'Potential issue: the file list is a demo view, so it does not expose real local files or hidden folders.',
    Custom: 'Ask for a file summary, folder cleanup plan, or what artifact to open next.',
  },
  tools: {
    Summary: 'The tools panel shows simulated utilities for OCR, PDF export, annotations, and quick capture.',
    Explain:
      'This is a mock tool shelf for the Snipping GPT concept. It makes the monitor feel like a usable workspace without connecting to real system tools.',
    Steps:
      '1. Choose a utility. 2. Capture the relevant app area. 3. Ask SnipBot for an action. 4. Use the returned response as guidance.',
    Answer: 'The tools are capture, OCR, annotation, export, and settings utilities.',
    Bug: 'Potential issue: tools are represented as frontend demo buttons and do not perform real OCR or export operations.',
    Custom: 'Ask which tool to use, how to automate a capture workflow, or how to organize the utilities.',
  },
  taskbar: {
    Summary: 'The taskbar contains Start, app shortcuts, SnipBot capture, and system status.',
    Explain:
      'The taskbar is the control strip for the simulated computer. It restores apps, opens the start menu, and starts capture mode.',
    Steps:
      '1. Open Start or an app shortcut. 2. Restore the needed window. 3. Use SnipBot capture. 4. Select an action pill.',
    Answer: 'The taskbar is used for app switching, launching, and capture access.',
    Bug: 'Potential issue: if too many shortcuts are active on a small screen, the taskbar may need horizontal scrolling.',
    Custom: 'Ask for a cleaner taskbar layout, shortcut priorities, or a workflow explanation.',
  },
  desktop: {
    Summary: 'The desktop is a simulated workspace with open apps, shortcuts, and a capture assistant.',
    Explain:
      'This area represents the screen context Snipping GPT would inspect. Empty-space captures return a desktop-level answer instead of doing nothing.',
    Steps:
      '1. Click SnipBot. 2. Drag over any visible region. 3. Release to create the capture. 4. Pick an answer type.',
    Answer: 'This is the Snipping GPT simulated desktop environment.',
    Bug: 'Potential issue: empty desktop captures can be broad, so a tighter crop gives a more specific answer.',
    Custom: 'Ask for a tour of the workspace, a suggested next action, or a UI critique.',
  },
}

function getOverlapArea(a: SnipClientRect, b: SnipClientRect) {
  const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return xOverlap * yOverlap
}

function getSnipTargetById(id?: string) {
  return snipTargets.find((target) => target.id === id) ?? null
}

function formatSnipCalcValue(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, '')
}

function evaluateSnipCalcExpression(expression: string) {
  const percentMatch = expression.match(/^\s*(\d+(?:\.\d+)?)%\s+of\s+(\d+(?:\.\d+)?)\s*$/i)
  if (percentMatch) {
    const percent = Number(percentMatch[1])
    const base = Number(percentMatch[2])
    return formatSnipCalcValue((percent / 100) * base)
  }

  const tokens = expression.match(/\d+(?:\.\d+)?|[+\-*/]/g)
  if (!tokens || tokens.length < 3) return null

  let total = Number(tokens[0])
  for (let index = 1; index < tokens.length - 1; index += 2) {
    const operator = tokens[index]
    const next = Number(tokens[index + 1])
    if (!Number.isFinite(next)) return null

    if (operator === '+') total += next
    if (operator === '-') total -= next
    if (operator === '*') total *= next
    if (operator === '/') {
      if (next === 0) return null
      total /= next
    }
  }

  return Number.isFinite(total) ? formatSnipCalcValue(total) : null
}

function SnippingGPTSection() {
  const screenRef = useRef<HTMLDivElement | null>(null)
  const dragStartRef = useRef<SelectionDragStart | null>(null)
  const snipBotDragStartRef = useRef<SnipBotDragStart | null>(null)
  const snipBotWasDraggedRef = useRef(false)
  const snipPointerActiveRef = useRef(false)
  const suppressNextScreenClickRef = useRef(false)
  const [isSnipMode, setIsSnipMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isSnipBotDragging, setIsSnipBotDragging] = useState(false)
  const [snipBotPosition, setSnipBotPosition] = useState<SnipBotPosition>({ x: 52, y: 78 })
  const [hasInteractedWithSnipBot, setHasInteractedWithSnipBot] = useState(false)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<SnipTarget | null>(null)
  const [showPills, setShowPills] = useState(false)
  const [selectedAction, setSelectedAction] = useState<SnipAction | null>(null)
  const [responseCard, setResponseCard] = useState<ResponseCardState | null>(null)
  const [activeSnipInfoTabId, setActiveSnipInfoTabId] = useState<SnipInfoTabId>('overview')
  const [snipWindowStates, setSnipWindowStates] = useState<Record<SnipWindowId, SnipWindowState>>(
    initialSnipWindowStates,
  )
  const [, setSnipZCounter] = useState(18)
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [calculatorExpression, setCalculatorExpression] = useState('18% of 240')
  const [calculatorResult, setCalculatorResult] = useState('= 43.2')
  const [todoChecked, setTodoChecked] = useState([true, true, false, false, false])
  const [errorRetryState, setErrorRetryState] = useState<'error' | 'retrying' | 'resolved'>('error')
  const activeSnipInfoTab = snipInfoTabs.find((tab) => tab.id === activeSnipInfoTabId) ?? snipInfoTabs[0]

  const resetDemo = useCallback(() => {
    dragStartRef.current = null
    snipBotDragStartRef.current = null
    snipBotWasDraggedRef.current = false
    snipPointerActiveRef.current = false
    suppressNextScreenClickRef.current = false
    setIsSnipMode(false)
    setIsDragging(false)
    setIsSnipBotDragging(false)
    setSelectionBox(null)
    setSelectedTarget(null)
    setShowPills(false)
    setSelectedAction(null)
    setResponseCard(null)
    setIsStartMenuOpen(false)
  }, [])

  const selectTarget = useCallback((target: SnipTarget) => {
    setHasInteractedWithSnipBot(true)
    setSelectedTarget(target)
    setShowPills(true)
    setSelectedAction(null)
    setResponseCard(null)
    setIsSnipMode(false)
    setIsDragging(false)
    setSelectionBox(null)
  }, [])

  const captureTargetById = useCallback(
    (id: SnipTargetId) => {
      const target = getSnipTargetById(id)
      if (!target) return

      suppressNextScreenClickRef.current = true
      selectTarget(target)
    },
    [selectTarget],
  )

  const handleKeyboardCapture = useCallback(
    (event: React.KeyboardEvent<HTMLElement>, id: SnipTargetId) => {
      if (!isSnipMode || (event.key !== 'Enter' && event.key !== ' ')) return

      event.preventDefault()
      event.stopPropagation()
      captureTargetById(id)
    },
    [captureTargetById, isSnipMode],
  )

  const bringSnipWindowToFront = useCallback((id: SnipWindowId) => {
    setSnipZCounter((current) => {
      const next = current + 1
      setSnipWindowStates((states) => ({
        ...states,
        [id]: {
          ...states[id],
          z: next,
        },
      }))
      return next
    })
  }, [])

  const restoreSnipWindow = useCallback(
    (id: SnipWindowId) => {
      setIsStartMenuOpen(false)
      setSnipZCounter((current) => {
        const next = current + 1
        setSnipWindowStates((states) => ({
          ...states,
          [id]: {
            ...states[id],
            isOpen: true,
            isMinimized: false,
            z: next,
          },
        }))
        return next
      })
    },
    [],
  )

  const minimizeSnipWindow = useCallback((id: SnipWindowId) => {
    setSnipWindowStates((states) => ({
      ...states,
      [id]: {
        ...states[id],
        isMinimized: true,
      },
    }))
  }, [])

  const closeSnipWindow = useCallback((id: SnipWindowId) => {
    setSnipWindowStates((states) => ({
      ...states,
      [id]: {
        ...states[id],
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
      },
    }))
  }, [])

  const toggleMaximizeSnipWindow = useCallback(
    (id: SnipWindowId) => {
      bringSnipWindowToFront(id)
      setSnipWindowStates((states) => ({
        ...states,
        [id]: {
          ...states[id],
          isMaximized: !states[id].isMaximized,
        },
      }))
    },
    [bringSnipWindowToFront],
  )

  const getScreenPointFromClient = useCallback((clientX: number, clientY: number) => {
    const screen = screenRef.current
    if (!screen) return { x: 0, y: 0 }

    const rect = screen.getBoundingClientRect()
    return {
      x: clamp(clientX - rect.left, 0, rect.width),
      y: clamp(clientY - rect.top, 0, rect.height),
    }
  }, [])

  const getScreenPoint = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => getScreenPointFromClient(event.clientX, event.clientY),
    [getScreenPointFromClient],
  )

  const getTargetFromSelection = useCallback((box: SelectionBox) => {
    const screen = screenRef.current
    if (!screen) return null

    const screenRect = screen.getBoundingClientRect()
    const selectionRect = {
      top: screenRect.top + box.y,
      right: screenRect.left + box.x + box.width,
      bottom: screenRect.top + box.y + box.height,
      left: screenRect.left + box.x,
    }

    let bestTarget: SnipTarget | null = null
    let bestArea = 0

    screen.querySelectorAll<HTMLElement>('[data-snip-id]').forEach((node) => {
      const target = getSnipTargetById(node.dataset.snipId)
      if (!target) return

      const area = getOverlapArea(selectionRect, node.getBoundingClientRect())
      if (area > bestArea) {
        bestArea = area
        bestTarget = target
      }
    })

    return bestArea > 0 ? bestTarget : null
  }, [])

  const handleScreenPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isSnipMode || event.button !== 0) return

      const interactiveTarget = event.target instanceof HTMLElement
        ? event.target.closest('.snipbot-button, .snip-action-pill, .snip-response-card button')
        : null
      if (interactiveTarget) return

      const point = getScreenPoint(event)
      const snipId = event.target instanceof HTMLElement
        ? (event.target.closest<HTMLElement>('[data-snip-id]')?.dataset.snipId as SnipTargetId | undefined)
        : undefined
      snipPointerActiveRef.current = true
      suppressNextScreenClickRef.current = false
      dragStartRef.current = { ...point, snipId }
      setIsDragging(true)
      setSelectionBox({ x: point.x, y: point.y, width: 0, height: 0 })
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [getScreenPoint, isSnipMode],
  )

  const handleScreenPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !dragStartRef.current) return

      const point = getScreenPoint(event)
      const start = dragStartRef.current
      setSelectionBox({
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        width: Math.abs(point.x - start.x),
        height: Math.abs(point.y - start.y),
      })
    },
    [getScreenPoint, isDragging],
  )

  const updateSnipBotPosition = useCallback((clientX: number, clientY: number) => {
    const screen = screenRef.current
    const start = snipBotDragStartRef.current
    if (!screen || !start) return

    const rect = screen.getBoundingClientRect()
    const radius = 46
    const startX = (start.position.x / 100) * rect.width
    const startY = (start.position.y / 100) * rect.height
    const nextX = clamp(startX + clientX - start.clientX, radius, rect.width - radius)
    const nextY = clamp(startY + clientY - start.clientY, radius, rect.height - radius)

    setSnipBotPosition({
      x: (nextX / rect.width) * 100,
      y: (nextY / rect.height) * 100,
    })
  }, [])

  const handleScreenPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !dragStartRef.current) return

      const hasDragArea = selectionBox ? selectionBox.width * selectionBox.height > 64 : false
      const overlappedTarget = hasDragArea && selectionBox ? getTargetFromSelection(selectionBox) : null
      const clickedTarget = getSnipTargetById(dragStartRef.current.snipId)
      const desktopTarget = getSnipTargetById('desktop')
      const nextTarget = overlappedTarget ?? clickedTarget ?? desktopTarget

      dragStartRef.current = null
      snipPointerActiveRef.current = false
      setIsDragging(false)
      setSelectionBox(null)

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      suppressNextScreenClickRef.current = true
      window.setTimeout(() => {
        suppressNextScreenClickRef.current = false
      }, 180)
      if (nextTarget) selectTarget(nextTarget)
    },
    [getTargetFromSelection, isDragging, selectTarget, selectionBox],
  )

  const handleScreenMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (snipPointerActiveRef.current || !isSnipMode || event.button !== 0) return

      const interactiveTarget = event.target instanceof HTMLElement
        ? event.target.closest('.snipbot-button, .snip-action-pill, .snip-response-card button')
        : null
      if (interactiveTarget) return

      const point = getScreenPointFromClient(event.clientX, event.clientY)
      const snipId = event.target instanceof HTMLElement
        ? (event.target.closest<HTMLElement>('[data-snip-id]')?.dataset.snipId as SnipTargetId | undefined)
        : undefined
      suppressNextScreenClickRef.current = false
      dragStartRef.current = { ...point, snipId }
      setIsDragging(true)
      setSelectionBox({ x: point.x, y: point.y, width: 0, height: 0 })
    },
    [getScreenPointFromClient, isSnipMode],
  )

  const handleScreenMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (snipPointerActiveRef.current || !isDragging || !dragStartRef.current) return

      const point = getScreenPointFromClient(event.clientX, event.clientY)
      const start = dragStartRef.current
      setSelectionBox({
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        width: Math.abs(point.x - start.x),
        height: Math.abs(point.y - start.y),
      })
    },
    [getScreenPointFromClient, isDragging],
  )

  const handleScreenMouseUp = useCallback(() => {
    if (snipPointerActiveRef.current || !isDragging || !dragStartRef.current) return

    const hasDragArea = selectionBox ? selectionBox.width * selectionBox.height > 64 : false
    const overlappedTarget = hasDragArea && selectionBox ? getTargetFromSelection(selectionBox) : null
    const clickedTarget = getSnipTargetById(dragStartRef.current.snipId)
    const desktopTarget = getSnipTargetById('desktop')
    const nextTarget = overlappedTarget ?? clickedTarget ?? desktopTarget

    dragStartRef.current = null
    setIsDragging(false)
    setSelectionBox(null)
    suppressNextScreenClickRef.current = true
    window.setTimeout(() => {
      suppressNextScreenClickRef.current = false
    }, 180)
    if (nextTarget) selectTarget(nextTarget)
  }, [getTargetFromSelection, isDragging, selectTarget, selectionBox])

  const handleSnipBotPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return

    event.stopPropagation()
    setHasInteractedWithSnipBot(true)
    snipBotWasDraggedRef.current = false
    snipBotDragStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      position: snipBotPosition,
      hasMoved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleSnipBotPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const start = snipBotDragStartRef.current
    if (!start) return

    event.stopPropagation()
    const distance = Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY)
    if (!start.hasMoved && distance < 6) return

    start.hasMoved = true
    snipBotWasDraggedRef.current = true
    setIsSnipBotDragging(true)
    setIsDragging(false)
    setSelectionBox(null)
    updateSnipBotPosition(event.clientX, event.clientY)
  }

  const handleSnipBotPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    snipBotDragStartRef.current = null
    setIsSnipBotDragging(false)
  }

  const handleSnipBotPointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    snipBotDragStartRef.current = null
    snipBotWasDraggedRef.current = false
    setIsSnipBotDragging(false)
  }

  const handleTargetKeyDown = (event: React.KeyboardEvent<HTMLElement>, target: SnipTarget) => {
    if (!isSnipMode) return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    event.stopPropagation()
    suppressNextScreenClickRef.current = true
    selectTarget(target)
  }

  const handleScreenClickCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (suppressNextScreenClickRef.current) {
        suppressNextScreenClickRef.current = false
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (!isSnipMode) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('.snipbot-button, .snip-action-pill')) return

      event.preventDefault()
      event.stopPropagation()
    },
    [isSnipMode],
  )

  const handleSnipBotClick = () => {
    setHasInteractedWithSnipBot(true)
    if (isSnipMode || selectedTarget || showPills || responseCard) {
      resetDemo()
      return
    }

    setIsSnipMode(true)
  }

  const openResponse = (action: SnipAction) => {
    setSelectedAction(action)
    setResponseCard({
      target: selectedTarget,
      action,
      text: selectedTarget ? responses[selectedTarget.id][action] : 'Select something first.',
    })
  }

  const copyResponse = async () => {
    if (!responseCard) return

    try {
      await navigator.clipboard?.writeText(responseCard.text)
    } catch {
      // Demo-only fallback: still show confirmation even if clipboard permissions are unavailable.
    }

    setResponseCard({ ...responseCard, status: 'copied' })
  }

  const saveResponse = () => {
    if (!responseCard) return

    setResponseCard({ ...responseCard, status: 'saved' })
  }

  const handleCalculatorKey = (key: string) => {
    if (key === 'C') {
      setCalculatorExpression('0')
      setCalculatorResult('')
      return
    }

    if (key === 'Del') {
      setCalculatorExpression((value) => {
        const next = value.slice(0, -1).trim()
        return next.length > 0 ? next : '0'
      })
      setCalculatorResult('')
      return
    }

    if (key === '=') {
      const result = evaluateSnipCalcExpression(calculatorExpression)
      setCalculatorResult(result ? `= ${result}` : 'Check input')
      return
    }

    setCalculatorResult('')
    setCalculatorExpression((value) => {
      const shouldReplace = value === '0' || value === '18% of 240'
      const isOperator = ['+', '-', '*', '/'].includes(key)
      if (key === '%' && /^\d+(?:\.\d+)?$/.test(value)) return `${value}% of 240`
      if (shouldReplace && !isOperator && key !== '%') return key
      if (isOperator) return `${value.replace(/\s+[+\-*/]\s*$/, '')} ${key} `
      return `${value}${key}`
    })
  }

  const toggleTodoItem = (index: number) => {
    setTodoChecked((items) => items.map((checked, itemIndex) => (itemIndex === index ? !checked : checked)))
  }

  const retryError = () => {
    setErrorRetryState('retrying')
    window.setTimeout(() => setErrorRetryState('resolved'), 520)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetDemo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetDemo])

  return (
    <SectionReveal id="snipping-gpt" className="case-section snipping-section">
      <div className="snip-demo-heading">
        <p className="eyebrow">Work / Snipping GPT</p>
        <h2>Experience <span>Snipping GPT</span></h2>
        <p>Click SnipBot, drag over any object, then choose an action.</p>
      </div>

      <div className="snip-demo" aria-label="Interactive Snipping GPT demo">
        <div className="snip-monitor">
          <div className="snip-monitor-bezel">
            <span className="snip-webcam" aria-hidden="true" />
            <div
              ref={screenRef}
              className={`snip-screen ${isSnipMode ? 'is-snip-mode' : ''} ${isDragging ? 'is-selecting' : ''}`}
              data-snip-context="desktop"
              onPointerDown={handleScreenPointerDown}
              onPointerMove={handleScreenPointerMove}
              onPointerUp={handleScreenPointerUp}
              onMouseDown={handleScreenMouseDown}
              onMouseMove={handleScreenMouseMove}
              onMouseUp={handleScreenMouseUp}
              onClickCapture={handleScreenClickCapture}
            >
              <div className="snip-desktop-glow" aria-hidden="true" />
              <div className="snip-screen-topbar" aria-hidden="true">
                <span className="snip-system-mark">Snipping GPT Desktop</span>
                <span className="snip-status-tray">
                  <i />
                  <i />
                  <i />
                  10:24 AM
                </span>
              </div>
              <div className="snip-desktop-icons" aria-label="Desktop shortcuts">
                <button
                  type="button"
                  data-snip-id="files"
                  onClick={() => restoreSnipWindow('files')}
                  onKeyDown={(event) => handleKeyboardCapture(event, 'files')}
                >
                  <FileText size={20} aria-hidden="true" />
                  My Files
                </button>
                <button
                  type="button"
                  data-snip-id="tools"
                  onClick={() => restoreSnipWindow('tools')}
                  onKeyDown={(event) => handleKeyboardCapture(event, 'tools')}
                >
                  <Settings2 size={20} aria-hidden="true" />
                  Tools
                </button>
              </div>

              <div className="snip-desktop-grid">
                {snipWindowTargets.map((target) => {
                  const Icon = target.icon
                  const isSelected = selectedTarget?.id === target.id
                  const windowState = snipWindowStates[target.id]
                  if (!windowState.isOpen || windowState.isMinimized) return null

                  return (
                    <article
                      key={target.id}
                      className={`snip-object snip-object-${target.id} ${isSelected ? 'is-selected' : ''} ${
                        windowState.isMaximized ? 'is-maximized' : ''
                      }`}
                      data-snip-id={target.id}
                      role="group"
                      tabIndex={isSnipMode ? 0 : -1}
                      aria-label={isSnipMode ? `Capture ${target.name}` : `${target.name} window`}
                      style={{ zIndex: windowState.z }}
                      onPointerDown={() => {
                        if (!isSnipMode) bringSnipWindowToFront(target.id)
                      }}
                      onKeyDown={(event) => handleTargetKeyDown(event, target)}
                    >
                      <div className="snip-window-bar">
                        <span className={`snip-window-icon snip-window-icon-${target.id}`}>
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <strong>{target.name}</strong>
                        <div className="snip-window-controls">
                          <button
                            type="button"
                            aria-label={`Minimize ${target.name}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              minimizeSnipWindow(target.id)
                            }}
                          >
                            <Minus size={11} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`${windowState.isMaximized ? 'Restore' : 'Maximize'} ${target.name}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleMaximizeSnipWindow(target.id)
                            }}
                          >
                            <Maximize2 size={11} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Close ${target.name}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              closeSnipWindow(target.id)
                            }}
                          >
                            <X size={11} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <SnipObjectContent
                        id={target.id}
                        calculatorExpression={calculatorExpression}
                        calculatorResult={calculatorResult}
                        onCalculatorKey={handleCalculatorKey}
                        todoChecked={todoChecked}
                        onToggleTodo={toggleTodoItem}
                        errorRetryState={errorRetryState}
                        onRetryError={retryError}
                      />
                    </article>
                  )
                })}
              </div>

              {isDragging && selectionBox ? (
                <div
                  className="snip-selection-box"
                  style={{
                    left: selectionBox.x,
                    top: selectionBox.y,
                    width: selectionBox.width,
                    height: selectionBox.height,
                  }}
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              ) : null}

              {responseCard ? (
                <aside className="snip-response-card" aria-live="polite" aria-label="SnipBot Response">
                  <div className="snip-response-title">
                    <Sparkles size={18} aria-hidden="true" />
                    <strong>SnipBot Response</strong>
                  </div>
                  <dl>
                    <div>
                      <dt>Selected</dt>
                      <dd>{responseCard.target?.name ?? 'Nothing selected'}</dd>
                    </div>
                    <div>
                      <dt>Action</dt>
                      <dd>{responseCard.action}</dd>
                    </div>
                  </dl>
                  <p>{responseCard.text}</p>
                  {responseCard.status ? (
                    <small className="snip-response-status">
                      {responseCard.status === 'copied' ? 'Copied response' : 'Saved locally'}
                    </small>
                  ) : null}
                  <div className="snip-response-actions">
                    <button type="button" onClick={copyResponse}>
                      <Clipboard size={15} aria-hidden="true" />
                      Copy
                    </button>
                    <button type="button" onClick={saveResponse}>
                      <Save size={15} aria-hidden="true" />
                      Save
                    </button>
                    <button type="button" onClick={() => setResponseCard(null)}>
                      <X size={15} aria-hidden="true" />
                      Close
                    </button>
                  </div>
                </aside>
              ) : null}

              <div
                className={`snipbot-cluster ${showPills ? 'is-open' : ''} ${isSnipBotDragging ? 'is-dragging is-repositioning' : ''}`}
                style={{
                  '--snipbot-x': `${snipBotPosition.x}%`,
                  '--snipbot-y': `${snipBotPosition.y}%`,
                } as CSSProperties}
              >
                {!hasInteractedWithSnipBot ? (
                  <div className="snipbot-hint" role="status">
                    Click SnipBot to start
                  </div>
                ) : null}
                {showPills
                  ? snipActions.map((action, index) => {
                      const position = snipActionPositions[action]
                      return (
                        <button
                          key={action}
                          type="button"
                          className="snip-action-pill"
                          aria-label={`${action} selected object`}
                          aria-pressed={selectedAction === action}
                          style={{
                            '--pill-x': `${position.x}px`,
                            '--pill-y': `${position.y}px`,
                            '--pill-delay': `${index * 34}ms`,
                          } as CSSProperties}
                          onClick={() => openResponse(action)}
                        >
                          {action}
                        </button>
                      )
                    })
                  : null}
                <button
                  type="button"
                  className={`snipbot-button ${isSnipMode ? 'is-active' : ''}`}
                  aria-label={isSnipMode ? 'Reset Snipping GPT demo' : 'Start SnipBot selection mode'}
                  onPointerDown={handleSnipBotPointerDown}
                  onPointerMove={handleSnipBotPointerMove}
                  onPointerUp={handleSnipBotPointerUp}
                  onPointerCancel={handleSnipBotPointerCancel}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (snipBotWasDraggedRef.current) {
                      snipBotWasDraggedRef.current = false
                      return
                    }

                    handleSnipBotClick()
                  }}
                >
                  <Camera size={34} aria-hidden="true" />
                </button>
              </div>
              {isStartMenuOpen ? (
                <div className="snip-start-menu" data-snip-id="desktop" aria-label="Start menu">
                  <strong>Start</strong>
                  <button
                    type="button"
                    onClick={() => restoreSnipWindow('files')}
                    onKeyDown={(event) => handleKeyboardCapture(event, 'files')}
                  >
                    <FileText size={15} aria-hidden="true" />
                    My Files
                  </button>
                  <button
                    type="button"
                    onClick={() => restoreSnipWindow('tools')}
                    onKeyDown={(event) => handleKeyboardCapture(event, 'tools')}
                  >
                    <Settings2 size={15} aria-hidden="true" />
                    Tools
                  </button>
                  <button
                    type="button"
                    onClick={() => restoreSnipWindow('notes')}
                    onKeyDown={(event) => handleKeyboardCapture(event, 'notes')}
                  >
                    <StickyNote size={15} aria-hidden="true" />
                    Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => restoreSnipWindow('image')}
                    onKeyDown={(event) => handleKeyboardCapture(event, 'image')}
                  >
                    <ImageIcon size={15} aria-hidden="true" />
                    Image Preview
                  </button>
                  <button
                    type="button"
                    onKeyDown={(event) => handleKeyboardCapture(event, 'desktop')}
                    onClick={() => {
                      setIsStartMenuOpen(false)
                      setIsSnipMode(true)
                      setHasInteractedWithSnipBot(true)
                    }}
                  >
                    <Camera size={15} aria-hidden="true" />
                    SnipBot Capture
                  </button>
                </div>
              ) : null}

              <div className="snip-taskbar" data-snip-id="taskbar" aria-label="Snipping GPT taskbar">
                <button
                  type="button"
                  className="snip-taskbar-start"
                  aria-label="Open Start menu"
                  aria-expanded={isStartMenuOpen}
                  onClick={() => setIsStartMenuOpen((isOpen) => !isOpen)}
                  onKeyDown={(event) => handleKeyboardCapture(event, 'taskbar')}
                >
                  <PanelTop size={15} aria-hidden="true" />
                  Start
                </button>
                <div className="snip-taskbar-apps" aria-label="Pinned apps">
                  {snipTaskbarWindows.map((id) => {
                    const target = snipWindowTargets.find((item) => item.id === id)
                    if (!target) return null
                    const Icon = target.icon
                    const state = snipWindowStates[id]

                    return (
                      <button
                        key={id}
                        type="button"
                        aria-label={`Open ${target.name}`}
                        aria-pressed={state.isOpen && !state.isMinimized}
                        onClick={() => restoreSnipWindow(id)}
                        onKeyDown={(event) => handleKeyboardCapture(event, 'taskbar')}
                      >
                        <Icon size={15} aria-hidden="true" />
                        <span>{target.name}</span>
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  className="snip-taskbar-capture"
                  aria-label="Start SnipBot capture"
                  aria-pressed={isSnipMode}
                  onKeyDown={(event) => handleKeyboardCapture(event, 'taskbar')}
                  onClick={() => {
                    setIsStartMenuOpen(false)
                    setHasInteractedWithSnipBot(true)
                    setSelectedTarget(null)
                    setShowPills(false)
                    setResponseCard(null)
                    setIsSnipMode(true)
                  }}
                >
                  <Camera size={15} aria-hidden="true" />
                  Capture
                </button>
                <span className="snip-taskbar-status">10:24 AM</span>
              </div>
            </div>
          </div>
          <div className="snip-monitor-neck" aria-hidden="true" />
          <div className="snip-monitor-base" aria-hidden="true" />
        </div>
        <div className="snip-overview-card">
          <div className="snip-overview-tabs" role="tablist" aria-label="Snipping GPT details">
            {snipInfoTabs.map((tab) => (
              <button
                key={tab.id}
                id={`snip-info-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeSnipInfoTab.id === tab.id}
                aria-controls="snip-info-panel"
                onClick={() => setActiveSnipInfoTabId(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div
            id="snip-info-panel"
            className="snip-overview-body"
            role="tabpanel"
            aria-labelledby={`snip-info-tab-${activeSnipInfoTab.id}`}
          >
            <p>{activeSnipInfoTab.body}</p>
            <i aria-hidden="true" />
            <div className="snip-overview-features">
              {activeSnipInfoTab.features.map((feature) => {
                const FeatureIcon = feature.icon

                return (
                  <article key={feature.title}>
                    <FeatureIcon size={28} aria-hidden="true" />
                    <b>{feature.title}</b>
                    <span>{feature.detail}</span>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
        <div className="snip-footer-strip" aria-label="Snipping GPT project metadata">
          <b>AI Assistant</b>
          <i aria-hidden="true" />
          <b>Screen Capture</b>
          <i aria-hidden="true" />
          <b>Contextual Answers</b>
          <i aria-hidden="true" />
          <b>Frontend Demo</b>
          <span>
            <i aria-hidden="true" />
            Hard-coded demo responses
          </span>
        </div>
      </div>
    </SectionReveal>
  )
}

function SnipObjectContent({
  id,
  calculatorExpression,
  calculatorResult,
  onCalculatorKey,
  todoChecked,
  onToggleTodo,
  errorRetryState,
  onRetryError,
}: {
  id: SnipWindowId
  calculatorExpression: string
  calculatorResult: string
  onCalculatorKey: (key: string) => void
  todoChecked: boolean[]
  onToggleTodo: (index: number) => void
  errorRetryState: 'error' | 'retrying' | 'resolved'
  onRetryError: () => void
}) {
  if (id === 'notes') {
    return (
      <div className="snip-note-page">
        <h3>Product Launch Plan</h3>
        <ul>
          <li>Finalize landing page</li>
          <li>Review pricing</li>
          <li>Prepare demo</li>
          <li>Invite beta users</li>
        </ul>
        <small>Today, 9:41 AM</small>
      </div>
    )
  }

  if (id === 'article') {
    return (
      <div className="snip-article-page">
        <h3>The Science of Better Sleep</h3>
        <p>
          Sleep plays a vital role in improving memory, creativity, focus, and overall well-being.
          A consistent sleep schedule helps the brain recover and perform better every day.
        </p>
        <span>healthliving.com</span>
      </div>
    )
  }

  if (id === 'calculator') {
    return (
      <div className="snip-calculator-face">
        <div className="snip-calc-display">
          <span>{calculatorExpression}</span>
          <strong>{calculatorResult}</strong>
        </div>
        <div className="snip-calc-keys" aria-label="Calculator keypad">
          {snipCalculatorKeys.map((key) => (
            <button
              type="button"
              key={key}
              className={key === '=' ? 'is-equals' : ''}
              onClick={() => onCalculatorKey(key)}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (id === 'error') {
    const message = {
      error: 'Something went wrong while processing your request. Code: 500',
      retrying: 'Retrying request and checking server status...',
      resolved: 'Retry complete. API is reachable, but logs should still be reviewed.',
    }[errorRetryState]

    return (
      <div className="snip-error-card">
        <div>
          <AlertTriangle size={25} aria-hidden="true" />
          <h3>Application Error</h3>
        </div>
        <p aria-live="polite">{message}</p>
        <button type="button" onClick={onRetryError}>
          {errorRetryState === 'resolved' ? 'Checked' : 'Try Again'}
        </button>
      </div>
    )
  }

  if (id === 'image') {
    return (
      <div className="snip-image-card">
        <div className="snip-landscape">
          <img
            src="/snipping-gpt/mountain-lake.jpg"
            alt="Photorealistic mountain lake landscape at golden hour"
          />
        </div>
        <p>Mountain Lake <span aria-hidden="true">/</span> 1536 x 1024</p>
      </div>
    )
  }

  if (id === 'files') {
    return (
      <div className="snip-files-page">
        {[
          ['Project brief', 'Snipping-GPT-demo.md', '12 KB'],
          ['Screenshots', 'capture-set', '8 files'],
          ['Reports', 'technical-memo.pdf', '644 KB'],
          ['Exports', 'portfolio-card.png', '312 KB'],
        ].map(([label, name, size]) => (
          <button type="button" key={name}>
            <FileText size={15} aria-hidden="true" />
            <span>
              <b>{label}</b>
              <small>{name}</small>
            </span>
            <i>{size}</i>
          </button>
        ))}
      </div>
    )
  }

  if (id === 'tools') {
    return (
      <div className="snip-tools-page">
        {[
          ['Capture', 'Region screenshot'],
          ['OCR', 'Read visible text'],
          ['Annotate', 'Draw and mark up'],
          ['Export', 'Save response'],
          ['Settings', 'Privacy controls'],
          ['History', 'Recent captures'],
        ].map(([label, detail]) => (
          <button type="button" key={label}>
            <Settings2 size={15} aria-hidden="true" />
            <b>{label}</b>
            <span>{detail}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="snip-todo-page">
      {[
        'Design new landing page',
        'Write product description',
        'Test checkout flow',
        'Prepare launch email',
        'Update help documentation',
      ].map((item, index) => (
        <button type="button" key={item} onClick={() => onToggleTodo(index)}>
          <span className={todoChecked[index] ? 'is-checked' : ''} aria-hidden="true" />
          {item}
        </button>
      ))}
    </div>
  )
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{trend}</small>
    </div>
  )
}

function DigitalTwinSection() {
  const [scenarioId, setScenarioId] = useState('turbo')
  const [activeTwinView, setActiveTwinView] = useState<TwinViewId>('overview')
  const [drawer, setDrawer] = useState<DieselDrawer | null>(null)
  const [liveTick, setLiveTick] = useState(0)
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')
  const [alertThreshold, setAlertThreshold] = useState(62)
  const [autoRetrain, setAutoRetrain] = useState(true)
  const shouldReduceMotion = useReducedMotion()
  const scenario = engineScenarios.find((item) => item.id === scenarioId) ?? engineScenarios[0]
  const liveState = useMemo(() => getLiveTwinState(scenario, liveTick), [scenario, liveTick])
  const scenarioIconMap: Record<string, LucideIcon> = {
    healthy: CheckCircle2,
    turbo: Activity,
    coolant: Droplets,
    injector: Cpu,
    drift: Settings2,
  }
  const telemetryRows = useMemo(() => getEngineTelemetryRows(liveState), [liveState])
  const contributingFactors = useMemo(() => getEngineFactors(scenario), [scenario])
  const activeStep = getTwinPipelineStep(activeTwinView)
  const scenarioButtons = (
    <div className="diesel-scenario-grid">
      {engineScenarios.map((item) => {
        const ScenarioIcon = scenarioIconMap[item.id] ?? Activity
        return (
          <button
            type="button"
            key={item.id}
            aria-pressed={scenario.id === item.id}
            onClick={() => {
              setScenarioId(item.id)
              setLiveTick((tick) => tick + 1)
            }}
          >
            <ScenarioIcon size={18} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveTick((tick) => tick + 1)
    }, shouldReduceMotion ? 3600 : 1600)

    return () => window.clearInterval(interval)
  }, [shouldReduceMotion])

  useEffect(() => {
    if (!drawer) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawer(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawer])

  const renderOverview = () => (
    <>
      <div className="diesel-health-card live-card">
        <p>Health Score</p>
        <div className="diesel-gauge" style={{ '--health': liveState.health } as CSSProperties}>
          <strong>{liveState.health}%</strong>
          <span>{liveState.health >= 80 ? 'Healthy' : liveState.health >= 65 ? 'Watch' : 'Critical'}</span>
          <small className="gauge-min">0</small>
          <small className="gauge-max">100</small>
        </div>
      </div>

      <div className="diesel-rul-card live-card">
        <p>Remaining Useful Life</p>
        <strong>{liveState.rul}</strong>
        <span>Hours</span>
        <Sparkline data={liveState.series.health} stroke="#25c878" fill />
        <small>+/- {Math.max(24, Math.round(liveState.rul * 0.08))} hrs confidence</small>
      </div>

      <div className="diesel-anomaly-card live-card">
        <p>Anomaly Score</p>
        <strong>{liveState.anomaly}<span>/100</span></strong>
        <em>{liveState.anomaly < 30 ? 'Low' : liveState.anomaly < 68 ? 'Elevated' : 'High'}</em>
        <Sparkline data={liveState.series.exhaust} stroke="#27d17f" />
        <div className="anomaly-scale"><span>0</span><span>100</span></div>
      </div>

      <div className="diesel-telemetry-card live-card">
        <div className="telemetry-title-row">
          <p>Key Telemetry</p>
          <span><i />Actual</span>
          <span><i />Predicted</span>
        </div>
        <div className="telemetry-time-row" aria-hidden="true">
          <span>-60m</span>
          <span>-45m</span>
          <span>-30m</span>
          <span>-15m</span>
          <span>Now</span>
        </div>
        {telemetryRows.map((row) => (
          <div className="diesel-telemetry-row" key={row.label}>
            <div>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
            <Sparkline data={row.data} stroke="#4d82ff" />
            <button
              type="button"
              aria-label={`Open ${row.label} telemetry detail`}
              onClick={() => setDrawer({ type: 'telemetry', label: row.label })}
            >
              <ArrowUpRight size={13} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="diesel-scenario-panel">
        <p>Scenario Simulation</p>
        {scenarioButtons}
      </div>

      <div className="diesel-prediction-panel">
        <p>Prediction & Recommendation</p>
        <div className="prediction-grid">
          <div className="prediction-primary">
            <Activity size={30} aria-hidden="true" />
            <span>Prediction from ML trained on digital-twin-generated telemetry</span>
            <strong>{scenario.id === 'healthy' ? 'No fault cluster detected' : `${scenario.label} likely`}</strong>
            <div className="prediction-meta">
              <span>Confidence <b>{liveState.confidence}%</b></span>
              <span>Estimated onset <b>{liveState.onset}</b></span>
            </div>
          </div>

          <div className="factor-card">
            <strong>Top Contributing Factors</strong>
            {contributingFactors.map((factor) => (
              <div className="factor-row" key={factor.label}>
                <span>{factor.label}</span>
                <i style={{ '--factor': factor.score } as CSSProperties} />
                <b>{factor.score.toFixed(2)}</b>
              </div>
            ))}
            <button type="button" className="inline-action" onClick={() => setDrawer({ type: 'factors' })}>
              View all factors <ArrowUpRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="action-card">
            <strong>Recommended Actions</strong>
            {getEngineActions(scenario).map((action) => (
              <span key={action}><CheckCircle2 size={15} aria-hidden="true" />{action}</span>
            ))}
            <button type="button" onClick={() => setDrawer({ type: 'workOrder' })}>
              Create Work Order <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  )

  const renderTwinView = () => {
    if (activeTwinView === 'overview') {
      return renderOverview()
    }

    if (activeTwinView === 'telemetry') {
      return (
        <div className="diesel-view-panel telemetry-view">
          <div className="view-panel-header">
            <p>Live Telemetry Stream</p>
            <h3>Sensor data updates in real time from the simulated digital twin.</h3>
            <span>Batch {liveState.batchId} · {liveState.sampleCount.toLocaleString()} generated samples</span>
          </div>
          <div className="telemetry-expanded-grid">
            {telemetryRows.map((row) => (
              <button type="button" className="telemetry-expanded-card" key={row.label} onClick={() => setDrawer({ type: 'telemetry', label: row.label })}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
                <Sparkline data={row.data} stroke="#4d82ff" fill />
                <small>Residual within trained envelope · click for channel detail</small>
              </button>
            ))}
          </div>
          <div className="data-source-strip">
            <span>Source</span>
            <b>Physics twin simulation</b>
            <span>Channels</span>
            <b>{liveState.channels.length}</b>
            <span>Load variation</span>
            <b>{liveState.loadVariation}</b>
            <span>Sensor noise</span>
            <b>{liveState.sensorNoise}</b>
          </div>
        </div>
      )
    }

    if (activeTwinView === 'diagnostics') {
      return (
        <div className="diesel-view-panel diagnostics-view">
          <div className="view-panel-header">
            <p>ML Diagnostics</p>
            <h3>Model inference is trained on digital-twin-generated telemetry, then validated against fault labels.</h3>
            <span>Epoch {liveState.epoch} · validation accuracy {liveState.validationAccuracy.toFixed(1)}%</span>
          </div>
          <div className="diagnostics-grid">
            <div className="ml-training-card">
              <strong>Training Run</strong>
              <div className="training-progress" style={{ '--progress': liveState.validationAccuracy / 100 } as CSSProperties}>
                <span />
              </div>
              <dl>
                <div><dt>Training samples</dt><dd>{liveState.trainedSamples.toLocaleString()}</dd></div>
                <div><dt>Loss</dt><dd>{liveState.loss.toFixed(3)}</dd></div>
                <div><dt>Fault label</dt><dd>{liveState.faultLabel}</dd></div>
              </dl>
              <Sparkline data={liveState.series.health} stroke="#f4c34f" />
            </div>
            <div className="factor-card diagnostics-factors">
              <strong>Feature Importance</strong>
              {contributingFactors.map((factor) => (
                <div className="factor-row" key={factor.label}>
                  <span>{factor.label}</span>
                  <i style={{ '--factor': factor.score } as CSSProperties} />
                  <b>{factor.score.toFixed(2)}</b>
                </div>
              ))}
              <button type="button" className="inline-action" onClick={() => setDrawer({ type: 'factors' })}>
                Open factor analysis <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            </div>
            <div className="confusion-card">
              <strong>Confusion Matrix</strong>
              <div className="matrix-grid" aria-label="Mock confusion matrix">
                {[96, 2, 1, 1, 4, 89, 5, 2, 2, 5, 87, 6, 1, 2, 4, 93].map((value, index) => (
                  <span key={index} style={{ '--heat': value / 100 } as CSSProperties}>{value}</span>
                ))}
              </div>
              <p>The classifier separates thermal, fuel, vibration, and sensor-drift patterns before recommending maintenance action.</p>
            </div>
          </div>
        </div>
      )
    }

    if (activeTwinView === 'simulation') {
      return (
        <div className="diesel-view-panel simulation-view">
          <div className="view-panel-header">
            <p>Digital Twin Data Generation</p>
            <h3>Select a scenario to generate synthetic telemetry and retrain the predictive model.</h3>
            <span>{liveState.batchId} streaming · {liveState.sampleCount.toLocaleString()} samples generated</span>
          </div>
          <div className="simulation-stack">
            <div className="diesel-scenario-panel embedded">
              <p>Fault Scenario</p>
              {scenarioButtons}
            </div>
            <div className="simulation-metrics-grid">
              <div><span>Generated samples</span><strong>{liveState.sampleCount.toLocaleString()}</strong></div>
              <div><span>Sensor channels</span><strong>{liveState.channels.length}</strong></div>
              <div><span>Noise model</span><strong>{liveState.sensorNoise}</strong></div>
              <div><span>Fault label</span><strong>{liveState.faultLabel}</strong></div>
            </div>
            <div className="ml-flow-card">
              <strong>Training Loop</strong>
              <p>Digital twin telemetry is labeled, split, trained, and pushed into the inference panel.</p>
              <div className="training-progress" style={{ '--progress': liveState.validationAccuracy / 100 } as CSSProperties}>
                <span />
              </div>
              <dl>
                <div><dt>Epoch</dt><dd>{liveState.epoch}</dd></div>
                <div><dt>Validation accuracy</dt><dd>{liveState.validationAccuracy.toFixed(1)}%</dd></div>
                <div><dt>RUL estimate</dt><dd>{liveState.rul} hrs</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )
    }

    if (activeTwinView === 'reports') {
      return (
        <div className="diesel-view-panel reports-view">
          <div className="view-panel-header">
            <p>Reports</p>
            <h3>Maintenance-ready outputs generated from the current trained model state.</h3>
            <span>Latest inference: {scenario.id === 'healthy' ? 'normal operation' : scenario.label}</span>
          </div>
          <div className="report-grid">
            <a className="report-card report-card-link" href={dieselReportHref} target="_blank" rel="noreferrer">
              <FileText size={22} aria-hidden="true" />
              <strong>WT3 Technical Report</strong>
              <p>Diesel Engine Simulation for Machine Learning-Based Predictive Maintenance</p>
              <span>Open PDF <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
            <a className="report-card report-card-link" href={dieselPresentationHref} target="_blank" rel="noreferrer">
              <MonitorUp size={22} aria-hidden="true" />
              <strong>Digital Twin Presentation</strong>
              <p>Work Term 3 slide deck covering the model, pipeline, outputs, and results.</p>
              <span>Open PPTX <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
            {['Maintenance Summary', 'Telemetry Export', 'Model Validation Report'].map((label) => (
              <button type="button" key={label} className="report-card" onClick={() => setDrawer({ type: 'report', label })}>
                <FileText size={22} aria-hidden="true" />
                <strong>{label}</strong>
                <span>Open mock report <ArrowUpRight size={14} aria-hidden="true" /></span>
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="diesel-view-panel settings-view">
        <div className="view-panel-header">
          <p>Settings</p>
          <h3>Adjust the mock inference layer without changing the underlying portfolio data.</h3>
          <span>All controls are local UI state for demonstration.</span>
        </div>
        <div className="settings-grid">
          <div>
            <span>Anomaly alert threshold</span>
            <strong>{alertThreshold}/100</strong>
            <input type="range" min="30" max="90" value={alertThreshold} onChange={(event) => setAlertThreshold(Number(event.currentTarget.value))} />
          </div>
          <div>
            <span>Unit system</span>
            <div className="settings-button-row">
              <button type="button" aria-pressed={unitSystem === 'metric'} onClick={() => setUnitSystem('metric')}>Metric</button>
              <button type="button" aria-pressed={unitSystem === 'imperial'} onClick={() => setUnitSystem('imperial')}>Imperial</button>
            </div>
          </div>
          <div>
            <span>Auto retrain</span>
            <button type="button" className="wide-setting-button" aria-pressed={autoRetrain} onClick={() => setAutoRetrain((value) => !value)}>
              {autoRetrain ? 'Enabled' : 'Paused'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderDrawerContent = () => {
    if (!drawer) return null

    if (drawer.type === 'specs') {
      return (
        <>
          <p className="drawer-kicker">Engine Specifications</p>
          <h3>CAT C32 diesel engine model</h3>
          <dl className="drawer-spec-grid">
            <div><dt>Configuration</dt><dd>In-line diesel engine assembly</dd></div>
            <div><dt>Use case</dt><dd>Marine propulsion / heavy machinery</dd></div>
            <div><dt>Telemetry channels</dt><dd>{liveState.channels.join(', ')}</dd></div>
            <div><dt>Model asset</dt><dd>CAT_C32_1417KW_Engine.glb</dd></div>
          </dl>
        </>
      )
    }

    if (drawer.type === 'factors') {
      return (
        <>
          <p className="drawer-kicker">Factor Analysis</p>
          <h3>{scenario.label} inference contributors</h3>
          <div className="drawer-factor-list">
            {contributingFactors.map((factor) => (
              <div className="factor-row" key={factor.label}>
                <span>{factor.label}</span>
                <i style={{ '--factor': factor.score } as CSSProperties} />
                <b>{factor.score.toFixed(2)}</b>
              </div>
            ))}
          </div>
          <p>These mock weights represent how strongly each telemetry feature influenced the current prediction.</p>
        </>
      )
    }

    if (drawer.type === 'telemetry') {
      const row = telemetryRows.find((item) => item.label === drawer.label) ?? telemetryRows[0]
      return (
        <>
          <p className="drawer-kicker">Telemetry Channel</p>
          <h3>{row.label}</h3>
          <strong className="drawer-large-value">{row.value}</strong>
          <Sparkline data={row.data} stroke="#4d82ff" fill />
          <p>Live channel data is generated by the digital twin, streamed into the training set, and compared against the trained model residual envelope.</p>
        </>
      )
    }

    if (drawer.type === 'workOrder') {
      return (
        <>
          <p className="drawer-kicker">Mock Work Order</p>
          <h3>{scenario.id === 'healthy' ? 'Continue monitoring' : `Service request: ${scenario.label}`}</h3>
          <dl className="drawer-spec-grid">
            <div><dt>Priority</dt><dd>{liveState.anomaly > alertThreshold ? 'High' : 'Monitor'}</dd></div>
            <div><dt>Confidence</dt><dd>{liveState.confidence}%</dd></div>
            <div><dt>RUL</dt><dd>{liveState.rul} hours</dd></div>
            <div><dt>Generated from</dt><dd>{liveState.batchId}</dd></div>
          </dl>
          <p>{scenario.recommendation}</p>
        </>
      )
    }

    return (
      <>
        <p className="drawer-kicker">Report Preview</p>
        <h3>{drawer.label}</h3>
        <p>This mock report packages the live telemetry stream, ML training state, scenario label, current prediction, and recommended maintenance actions.</p>
        <dl className="drawer-spec-grid">
          <div><dt>Scenario</dt><dd>{scenario.label}</dd></div>
          <div><dt>Samples</dt><dd>{liveState.sampleCount.toLocaleString()}</dd></div>
          <div><dt>Validation</dt><dd>{liveState.validationAccuracy.toFixed(1)}%</dd></div>
          <div><dt>Anomaly</dt><dd>{liveState.anomaly}/100</dd></div>
        </dl>
      </>
    )
  }

  return (
    <SectionReveal id="digital-twin" className="case-section dark-section digital-twin-section">
      <div className="diesel-case-layout">
        <aside className="diesel-story">
          <p className="diesel-project-kicker">
            <span aria-hidden="true" />
            Project 02
          </p>
          <h2>BMT Diesel Engine Digital Twin</h2>
          <p className="diesel-subtitle">Predict. Monitor. Optimize.</p>
          <p className="diesel-lede">
            A high-fidelity digital twin of the BMT diesel engine that simulates real-world
            behavior, ingests live telemetry, and predicts failures before they happen.
          </p>

          <div className="diesel-capability-pills" aria-label="Digital twin capabilities">
            {[
              'Physics-Based Model',
              'Live Telemetry',
              'Anomaly Detection',
              'RUL Estimation',
              'Scenario Simulation',
              'Prescriptive AI',
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <dl className="diesel-meta-list">
            <div>
              <dt>Role</dt>
              <dd>Marine Engineering Intern</dd>
            </div>
            <div>
              <dt>Domain</dt>
              <dd>Heavy Machinery / Marine</dd>
            </div>
            <div>
              <dt>Technologies</dt>
              <dd>Python, Modelica, FastAPI, InfluxDB, React, Three.js, PyTorch</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>2024</dd>
            </div>
          </dl>

          <div className="diesel-resource-links" aria-label="Digital twin project resources">
            <a className="diesel-report-link" href={dieselReportHref} target="_blank" rel="noreferrer">
              <FileText size={16} aria-hidden="true" />
              WT3 Technical Report
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a className="diesel-report-link" href={dieselPresentationHref} target="_blank" rel="noreferrer">
              <MonitorUp size={16} aria-hidden="true" />
              Digital Twin Presentation
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>

          <div className="engine-about-card">
            <div className="engine-about-copy">
              <strong>About the Engine</strong>
              <p>
                4-stroke inline 6 marine diesel engine used in propulsion systems, modeled as the
                physical asset behind the digital twin.
              </p>
              <button type="button" className="inline-action" onClick={() => setDrawer({ type: 'specs' })}>
                View specifications <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>

        <div className="diesel-console" aria-label="Interactive BMT diesel engine digital twin dashboard">
          <div className="diesel-console-header">
            <div>
              <span>BMT Diesel Engine Digital Twin</span>
              <b><i aria-hidden="true" />Live</b>
            </div>
            <p><i aria-hidden="true" />Last updated: 2 sec ago</p>
          </div>

          <div className="twin-pipeline-strip" aria-label="Digital twin machine learning workflow">
            {twinPipelineSteps.map((step, index) => (
              <span key={step} data-active={index <= activeStep}>
                <i aria-hidden="true">{index + 1}</i>
                {step}
              </span>
            ))}
          </div>

          <div className="diesel-console-grid">
            <nav className="diesel-console-rail" aria-label="Digital twin views">
              {twinViewItems.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  aria-pressed={activeTwinView === id}
                  onClick={() => setActiveTwinView(id)}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className={`engine-model-card ${activeTwinView === 'overview' ? '' : 'is-hidden'}`}>
              <EngineModelViewer scenarioId={scenario.id} />
              <div className="engine-rotate-hint">
                <RotateCcw size={18} aria-hidden="true" />
                <span>Rotate<br />Drag to rotate</span>
              </div>
              <div className="engine-stage-dots" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            {renderTwinView()}
          </div>
        </div>
      </div>

      <div className="diesel-footer-strip">
        <span>Real-time data. Physics you can trust. Decisions you can act on.</span>
        <b>Digital Twin</b>
        <b>Predictive Maintenance</b>
        <b>Operational Intelligence</b>
        <span><i aria-hidden="true" />Built for reliability at sea</span>
      </div>

      {drawer && (
        <div className="diesel-drawer-backdrop" role="presentation" onClick={() => setDrawer(null)}>
          <aside className="diesel-drawer" role="dialog" aria-modal="true" aria-label="Diesel digital twin detail panel" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="drawer-close-button" aria-label="Close detail panel" onClick={() => setDrawer(null)}>
              <X size={18} aria-hidden="true" />
            </button>
            {renderDrawerContent()}
          </aside>
        </div>
      )}
    </SectionReveal>
  )
}

function getTwinPipelineStep(view: TwinViewId) {
  const steps: Record<TwinViewId, number> = {
    overview: 4,
    telemetry: 1,
    diagnostics: 2,
    simulation: 2,
    reports: 4,
    settings: 0,
  }

  return steps[view]
}

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function formatLiveMetric(metric: string, delta: number) {
  const match = metric.match(/^(-?\d+(?:\.\d+)?)\s*(.*)$/)
  if (!match) return metric

  const baseValue = Number(match[1])
  const unit = match[2]
  const decimals = match[1].includes('.') ? 1 : 0
  const nextValue = Math.max(0, baseValue + delta)

  return `${nextValue.toFixed(decimals)} ${unit}`.trim()
}

function shiftLiveSeries(data: number[], tick: number, amplitude: number, min = -Infinity, max = Infinity) {
  return data.map((value, index) => {
    const wave = Math.sin(tick * 0.64 + index * 0.72) * amplitude
    const pulse = Math.cos(tick * 0.21 + index * 0.36) * amplitude * 0.38
    return Number(clampValue(value + wave + pulse, min, max).toFixed(2))
  })
}

function getLiveTwinState(scenario: EngineScenario, liveTick: number): LiveTwinState {
  const scenarioIndex = Math.max(0, engineScenarios.findIndex((item) => item.id === scenario.id))
  const wave = Math.sin(liveTick * 0.72 + scenarioIndex * 1.24)
  const slowWave = Math.cos(liveTick * 0.27 + scenarioIndex)
  const health = Math.round(clampValue(scenario.health + wave * 1.3 + slowWave * 0.5, 0, 100))
  const anomaly = Math.round(clampValue(scenario.anomaly + wave * 2.4 - slowWave * 0.8, 0, 100))
  const rul = Math.max(0, Math.round(scenario.rul - liveTick * 0.08 + wave * 5.5))
  const isHealthy = scenario.id === 'healthy'
  const confidence = Math.round(
    clampValue(isHealthy ? 94 + slowWave * 1.1 : 100 - anomaly * 0.32 + wave * 1.4, 72, 98),
  )
  const onset = isHealthy
    ? 'No fault window'
    : scenario.id === 'turbo'
      ? `${Math.max(96, Math.round(120 + wave * 8))} +/- 30 hrs`
      : `${Math.max(48, Math.round(rul * 0.3 + wave * 8))} +/- 30 hrs`
  const sampleCount = 18420 + scenarioIndex * 2850 + liveTick * 86
  const validationAccuracy = clampValue(97.6 - anomaly * 0.12 + slowWave * 0.9, 78, 98.6)

  return {
    id: scenario.id,
    label: scenario.label,
    summary: scenario.summary,
    health,
    anomaly,
    rul,
    confidence,
    onset,
    metrics: {
      exhaustTemp: formatLiveMetric(scenario.metrics.exhaustTemp, wave * 3.6 + slowWave * 1.2),
      fuelRate: formatLiveMetric(scenario.metrics.fuelRate, wave * 1.9),
      vibration: formatLiveMetric(scenario.metrics.vibration, wave * 0.12 + slowWave * 0.08),
      coolant: formatLiveMetric(scenario.metrics.coolant, wave * 1.6 - slowWave * 0.6),
    },
    series: {
      exhaust: shiftLiveSeries(scenario.series.exhaust, liveTick, 3.2),
      fuel: shiftLiveSeries(scenario.series.fuel, liveTick, 1.7),
      vibration: shiftLiveSeries(scenario.series.vibration, liveTick, 0.18, 0),
      health: shiftLiveSeries(scenario.series.health, liveTick, 1.1, 0, 100),
    },
    sampleCount,
    trainedSamples: Math.max(0, sampleCount - 2400),
    batchId: `DT-${scenario.id.toUpperCase()}-${String(240 + (liveTick % 760)).padStart(3, '0')}`,
    loadVariation: `+/- ${(4.5 + Math.abs(wave) * 2.4).toFixed(1)}%`,
    sensorNoise: `${(0.8 + Math.abs(slowWave) * 0.7).toFixed(1)}% RMS`,
    epoch: 80 + (liveTick % 40),
    validationAccuracy,
    loss: clampValue(0.42 - validationAccuracy / 310 + anomaly / 420 + Math.abs(wave) * 0.018, 0.04, 0.28),
    faultLabel: isHealthy ? 'normal-operation' : `fault-${scenario.id}`,
    channels: ['EGT', 'Boost', 'Fuel rail', 'Vibration', 'Coolant', 'Load', 'RPM', 'Residual'],
  }
}

function getEngineTelemetryRows(source: { id: string; metrics: EngineScenario['metrics']; series: EngineScenario['series'] }) {
  const boostPressure =
    source.id === 'turbo' ? '2.41 bar' : source.id === 'coolant' ? '2.17 bar' : source.id === 'injector' ? '2.32 bar' : '2.54 bar'
  const fuelRail =
    source.id === 'injector' ? '1176 bar' : source.id === 'turbo' ? '1098 bar' : source.id === 'coolant' ? '1042 bar' : '1118 bar'

  return [
    { label: 'Exhaust Temp.', value: source.metrics.exhaustTemp, data: source.series.exhaust },
    { label: 'Boost Pressure', value: boostPressure, data: source.series.fuel.map((value) => value / 82) },
    { label: 'Fuel Rail Pressure', value: fuelRail, data: source.series.fuel.map((value) => value * 5.15) },
    { label: 'Vibration (RMS)', value: source.metrics.vibration, data: source.series.vibration },
    { label: 'Coolant Temp.', value: source.metrics.coolant, data: source.series.health },
  ]
}

function getEngineFactors(scenario: EngineScenario) {
  if (scenario.id === 'healthy') {
    return [
      { label: 'Residual Stability', score: 0.18 },
      { label: 'Vibration Drift', score: 0.11 },
      { label: 'Thermal Deviation', score: 0.09 },
      { label: 'Fuel Rate Change', score: 0.06 },
    ]
  }

  if (scenario.id === 'coolant') {
    return [
      { label: 'Coolant Temp. Residual', score: 0.74 },
      { label: 'Pressure Decay', score: 0.61 },
      { label: 'Thermal Gradient', score: 0.44 },
      { label: 'Load Sensitivity', score: 0.28 },
    ]
  }

  if (scenario.id === 'injector') {
    return [
      { label: 'Cylinder Imbalance', score: 0.82 },
      { label: 'Fuel Rail Instability', score: 0.59 },
      { label: 'Vibration Spike', score: 0.53 },
      { label: 'EGT Spread', score: 0.37 },
    ]
  }

  if (scenario.id === 'drift') {
    return [
      { label: 'Sensor Residual Trend', score: 0.54 },
      { label: 'Channel Disagreement', score: 0.46 },
      { label: 'Baseline Shift', score: 0.35 },
      { label: 'Physical Plausibility', score: 0.18 },
    ]
  }

  return [
    { label: 'Exhaust Temp. Deviation', score: 0.62 },
    { label: 'Boost Pressure Deviation', score: 0.48 },
    { label: 'Airflow Reduction', score: 0.31 },
    { label: 'EGR Inefficiency', score: 0.22 },
  ]
}

function getEngineActions(scenario: EngineScenario) {
  if (scenario.id === 'healthy') {
    return ['Maintain normal inspection cadence', 'Preserve current telemetry baseline', 'Re-run model after next duty cycle']
  }

  if (scenario.id === 'coolant') {
    return ['Inspect coolant circuit and pump seals', 'Reduce sustained load until verified', 'Pressure-test before redeployment']
  }

  if (scenario.id === 'injector') {
    return ['Run cylinder balance test', 'Inspect injector timing and nozzles', 'Schedule service before high-load run']
  }

  if (scenario.id === 'drift') {
    return ['Compare redundant sensor channels', 'Run drift compensation routine', 'Recalibrate before fault labeling']
  }

  return ['Inspect and clean turbocharger', 'Check intake air filter condition', 'Verify EGR valve operation', 'Schedule maintenance within 120 hrs']
}

function EngineModelViewer({ scenarioId }: { scenarioId: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const scenarioRef = useRef(scenarioId)

  useEffect(() => {
    scenarioRef.current = scenarioId
  }, [scenarioId])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const container = mount
    let cancelled = false
    let cleanup = () => {}
    let visible = true
    let rafId = 0

    async function setupScene() {
      // These resolve instantly from module cache (preloader already imported them)
      const THREE = await import('three')
      if (cancelled) return

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.55))
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 250)
      camera.position.set(0, 0.92, 7.65)
      camera.lookAt(0, 0, 0)

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
      keyLight.position.set(4, 4, 5)
      scene.add(keyLight)
      const rimLight = new THREE.DirectionalLight(0x4b7cff, 1.8)
      rimLight.position.set(-4, 2.5, -2)
      scene.add(rimLight)
      scene.add(new THREE.HemisphereLight(0x9fbfff, 0x05090c, 1.25))

      const grid = new THREE.GridHelper(7, 18, 0x314250, 0x17212a)
      grid.position.y = -1.05
      grid.material.opacity = 0.32
      grid.material.transparent = true
      scene.add(grid)

      const modelRoot = new THREE.Group()
      const lockedPitch = -0.04
      const turntableSpeed = 0.115
      modelRoot.rotation.set(lockedPitch, -0.54, 0)
      scene.add(modelRoot)

      const resize = () => {
        const width = Math.max(container.clientWidth, 320)
        const height = Math.max(container.clientHeight, 260)
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }

      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)

      const pointer = {
        dragging: false,
        x: 0,
      }

      const onPointerDown = (event: PointerEvent) => {
        pointer.dragging = true
        pointer.x = event.clientX
        container.setPointerCapture(event.pointerId)
      }

      const onPointerMove = (event: PointerEvent) => {
        if (!pointer.dragging) return
        const dx = event.clientX - pointer.x
        pointer.x = event.clientX
        modelRoot.rotation.y += dx * 0.006
        modelRoot.rotation.x = lockedPitch
        modelRoot.rotation.z = 0
      }

      const endPointerDrag = (event: PointerEvent) => {
        pointer.dragging = false
        if (container.hasPointerCapture(event.pointerId)) {
          container.releasePointerCapture(event.pointerId)
        }
      }

      container.addEventListener('pointerdown', onPointerDown)
      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerup', endPointerDrag)
      container.addEventListener('pointercancel', endPointerDrag)

      const material = new THREE.MeshStandardMaterial({
        color: 0x9da4a6,
        emissive: 0x111417,
        emissiveIntensity: 0.18,
        metalness: 0.84,
        roughness: 0.38,
        envMapIntensity: 0.85,
        side: THREE.DoubleSide,
      })
      const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x141b20,
        emissive: 0x090c0e,
        emissiveIntensity: 0.14,
        metalness: 0.74,
        roughness: 0.46,
        side: THREE.DoubleSide,
      })

      // Use the pre-loaded GLTF from the loading screen, or fall back to loading from scratch
      const { getPreloadedGLTF, getPreloadPromise } = await import('./enginePreloader')

      let gltf = getPreloadedGLTF()
      if (!gltf) {
        // Preload may still be in progress — await it
        const promise = getPreloadPromise()
        if (promise) {
          gltf = await promise
        }
      }

      if (gltf && !cancelled) {
        // Clone the preloaded scene so we can apply our own materials
        const object = gltf.scene.clone(true)
        object.traverse((child) => {
          if ('isMesh' in child && child.isMesh) {
            const mesh = child as import('three').Mesh
            if (mesh.geometry && !mesh.geometry.getAttribute('normal')) {
              mesh.geometry.computeVertexNormals()
            }
            mesh.material = mesh.name.toLowerCase().includes('rubber') ? darkMaterial : material
            mesh.castShadow = false
            mesh.receiveShadow = false
          }
        })

        const assetPivot = new THREE.Group()
        assetPivot.add(object)
        assetPivot.rotation.set(0, 0, 0)
        assetPivot.updateMatrixWorld(true)

        const orientedBox = new THREE.Box3().setFromObject(assetPivot)
        const orientedSize = new THREE.Vector3()
        const orientedCenter = new THREE.Vector3()
        orientedBox.getSize(orientedSize)
        orientedBox.getCenter(orientedCenter)
        assetPivot.position.sub(orientedCenter)

        const maxAxis = Math.max(orientedSize.x, orientedSize.y, orientedSize.z, 1)
        const modelShell = new THREE.Group()
        modelShell.scale.setScalar(2.64 / maxAxis)
        modelShell.add(assetPivot)
        modelRoot.add(modelShell)
        container.classList.add('is-loaded')
      } else if (!cancelled) {
        // Fallback: load from scratch (shouldn't happen normally)
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js')
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/')
        dracoLoader.setDecoderConfig({ type: 'js' })
        const loader = new GLTFLoader()
        loader.setDRACOLoader(dracoLoader)
        loader.load(
          '/models/CAT_C32_1417KW_Engine-optimized.glb',
          (loadedGltf) => {
            const object = loadedGltf.scene
            if (cancelled) return
            object.traverse((child) => {
              if ('isMesh' in child && child.isMesh) {
                const mesh = child as import('three').Mesh
                if (mesh.geometry && !mesh.geometry.getAttribute('normal')) {
                  mesh.geometry.computeVertexNormals()
                }
                mesh.material = mesh.name.toLowerCase().includes('rubber') ? darkMaterial : material
                mesh.castShadow = false
                mesh.receiveShadow = false
              }
            })

            const assetPivot = new THREE.Group()
            assetPivot.add(object)
            assetPivot.rotation.set(0, 0, 0)
            assetPivot.updateMatrixWorld(true)

            const orientedBox = new THREE.Box3().setFromObject(assetPivot)
            const orientedSize = new THREE.Vector3()
            const orientedCenter = new THREE.Vector3()
            orientedBox.getSize(orientedSize)
            orientedBox.getCenter(orientedCenter)
            assetPivot.position.sub(orientedCenter)

            const maxAxis = Math.max(orientedSize.x, orientedSize.y, orientedSize.z, 1)
            const modelShell = new THREE.Group()
            modelShell.scale.setScalar(2.64 / maxAxis)
            modelShell.add(assetPivot)
            modelRoot.add(modelShell)
            container.classList.add('is-loaded')
          },
          undefined,
          () => {
            container.classList.add('is-model-error')
          },
        )
      }

      const clock = new THREE.Clock()
      function animate() {
        if (cancelled) return
        if (!visible) return
        const delta = Math.min(clock.getDelta(), 0.05)
        const elapsed = clock.elapsedTime
        if (!pointer.dragging) {
          modelRoot.rotation.y += delta * turntableSpeed
        }
        modelRoot.rotation.x = lockedPitch
        modelRoot.rotation.z = 0

        const alertPulse = scenarioRef.current === 'healthy' ? 0 : (Math.sin(elapsed * 3) + 1) / 2
        rimLight.intensity = scenarioRef.current === 'healthy' ? 1.35 : 1.75 + alertPulse * 0.35
        rimLight.color.set(scenarioRef.current === 'coolant' ? 0x4dbbff : scenarioRef.current === 'injector' ? 0xff735f : 0x4b7cff)
        renderer.render(scene, camera)
        rafId = window.requestAnimationFrame(animate)
      }

      rafId = window.requestAnimationFrame(animate)

      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting
          if (visible && !cancelled) {
            rafId = window.requestAnimationFrame(animate)
          }
        },
        { rootMargin: '200px' },
      )
      visibilityObserver.observe(container)

      cleanup = () => {
        cancelled = true
        window.cancelAnimationFrame(rafId)
        visibilityObserver.disconnect()
        resizeObserver.disconnect()
        container.removeEventListener('pointerdown', onPointerDown)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerup', endPointerDrag)
        container.removeEventListener('pointercancel', endPointerDrag)
        renderer.dispose()
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
      }
    }

    setupScene()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  return (
    <div className="engine-model-viewer" ref={mountRef} data-engine-model="CAT C32 1417KW GLB" aria-label="3D diesel engine model. Drag to rotate.">
      <div className="model-loading">Loading CAT diesel engine</div>
      <div className="model-error">Engine model could not be loaded.</div>
    </div>
  )
}

function CouplingBoltSection() {
  const reviewTabs = [
    {
      id: 'overview',
      label: 'Overview',
      copy:
        'The coupling bolt connects two components with a controlled gap using a precision shoulder and relief features. The design supports load transfer, ease of assembly, and long-term reliability in demanding industrial environments.',
      features: [
        { icon: Crosshair, title: 'Precision Fit', detail: 'Controlled tolerances for reliable performance.' },
        { icon: CheckCircle2, title: 'Strength', detail: 'High-strength steel for heavy-load applications.' },
        { icon: Box, title: 'Manufacturable', detail: 'Designed for standard processes and tools.' },
        { icon: Settings2, title: 'Serviceable', detail: 'Easy assembly, maintenance friendly.' },
      ],
    },
    {
      id: 'dimensions',
      label: 'Dimensions',
      copy:
        'The geometry is organized around the fitted shank, head flats, thread envelope, relief transitions, and matching heavy hex nut so the component can be inspected from both assembly and manufacturing views.',
      features: [
        { icon: Crosshair, title: '2.497 in Shank', detail: 'Bearing diameter called out for shaft alignment.' },
        { icon: Layers, title: '3.500 in Head OD', detail: 'Head profile balances clearance and engagement.' },
        { icon: Box, title: '2 1/4-8 UNC', detail: 'External thread matches the heavy hex nut.' },
        { icon: RotateCcw, title: 'Assembly Length', detail: 'Rod and nut stack-up reserved for service access.' },
      ],
    },
    {
      id: 'tolerances',
      label: 'Tolerances',
      copy:
        'Tolerance choices protect the functional surfaces first: the fitted shank controls alignment, the thread controls engagement, and relief/chamfer features reduce stress risers and assembly damage.',
      features: [
        { icon: CheckCircle2, title: '+/- .001 in', detail: 'Critical shank tolerance for bearing fit.' },
        { icon: Crosshair, title: 'Thread Class', detail: 'UNC engagement checked against nut fit.' },
        { icon: Activity, title: 'Relief Radii', detail: 'Transitions reduce local stress concentration.' },
        { icon: FileText, title: 'Inspection Ready', detail: 'Callouts map directly to drawing review.' },
      ],
    },
    {
      id: 'material',
      label: 'Material & Process',
      copy:
        'Material selection and process notes are framed around strength, corrosion exposure, manufacturability, surface finish, and the practical inspection information needed for shop-floor communication.',
      features: [
        { icon: Box, title: 'ASTM A193 B6', detail: 'Stainless fastener material for high-load duty.' },
        { icon: Layers, title: 'ASTM A194 2H', detail: 'Matching heavy hex nut specification.' },
        { icon: Settings2, title: 'Ra <= 3.2 um', detail: 'Surface finish note for machined faces.' },
        { icon: FileText, title: 'WT2 Source', detail: 'Technical memorandum supports design notes.' },
      ],
    },
    {
      id: 'notes',
      label: 'Notes',
      copy:
        'The viewer is designed as a communication artifact: rotate the model, compare blueprint/measurement views, inspect exploded assembly logic, and open the WT2 memorandum for the source report.',
      features: [
        { icon: RotateCcw, title: '3D Review', detail: 'Interactive model supports visual inspection.' },
        { icon: Crosshair, title: 'Callouts', detail: 'Annotations stay tied to modeled features.' },
        { icon: CheckCircle2, title: 'Design Intent', detail: 'Accurate fit, strong joint, maintainable assembly.' },
        { icon: FileText, title: 'Report Linked', detail: 'WT2 technical memorandum available below.' },
      ],
    },
  ]
  const [activeReviewTabId, setActiveReviewTabId] = useState(reviewTabs[0].id)
  const activeReviewTab = reviewTabs.find((tab) => tab.id === activeReviewTabId) ?? reviewTabs[0]

  return (
    <SectionReveal id="coupling-bolt" className="case-section light-section bolt-section">
      <div className="bolt-layout">
        <div className="case-intro">
          <p className="eyebrow">03 / Mechanical design</p>
          <h2>Coupling Bolt</h2>
          <p>
            A precision fastener component designed for high-load mechanical connections. The
            interactive viewer shows 3D inspection, measurement thinking, blueprint overlays,
            exploded assembly behavior, and manufacturing notes in one polished artifact.
          </p>
          <dl className="spec-list">
            <div>
              <dt>Type</dt>
              <dd>Custom fastener</dd>
            </div>
            <div>
              <dt>Standard</dt>
              <dd>ASME / ISO aligned</dd>
            </div>
            <div>
              <dt>Material</dt>
              <dd>ASTM A193 B6 / A194 2H</dd>
            </div>
            <div>
              <dt>Thread</dt>
              <dd>2 1/4-8 UNC</dd>
            </div>
            <div>
              <dt>Design intent</dt>
              <dd>High strength, accurate fit, serviceable</dd>
            </div>
          </dl>
          <div className="case-actions">
            <a className="button primary" href="/coupling-bolt/coupling-bolt.html" target="_blank" rel="noreferrer">
              View Full Design <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              className="button ghost"
              href="/reports/technical-memorandum-wt2.pdf"
              target="_blank"
              rel="noreferrer"
            >
              WT2 Technical Report <FileText size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="bolt-artifact-column">
          <div className="artifact-viewer bolt-embedded-viewer">
            <iframe
              src="/coupling-bolt/coupling-bolt.html?embed=portfolio"
              title="Interactive Coupling Bolt 3D viewer"
              loading="lazy"
            />
          </div>

          <div className="bolt-review-card" aria-label="Coupling bolt design review">
            <div className="bolt-review-tabs" role="tablist" aria-label="Coupling bolt review panels">
              {reviewTabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  role="tab"
                  aria-selected={activeReviewTabId === tab.id}
                  onClick={() => setActiveReviewTabId(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="bolt-review-body" role="tabpanel">
              <p>{activeReviewTab.copy}</p>
              <div className="bolt-review-divider" aria-hidden="true" />
              <div className="bolt-review-features">
                {activeReviewTab.features.map((feature) => {
                  const FeatureIcon = feature.icon
                  return (
                    <article key={feature.title}>
                      <FeatureIcon size={28} aria-hidden="true" />
                      <b>{feature.title}</b>
                      <span>{feature.detail}</span>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bolt-footer-strip" aria-label="Coupling bolt project metadata">
        <b>Mechanical Design</b>
        <i aria-hidden="true" />
        <b>AI Systems</b>
        <i aria-hidden="true" />
        <b>Simulation</b>
        <i aria-hidden="true" />
        <b>Automation</b>
        <i aria-hidden="true" />
        <b>Clean Infrastructure</b>
        <span>
          <i aria-hidden="true" />
          WT2 report linked
        </span>
      </div>
    </SectionReveal>
  )
}

const bleedingArtifactLinks: Array<{
  icon: LucideIcon
  title: string
  kind: string
  summary: string
  href: string
}> = [
  {
    icon: FileText,
    title: 'Final Design Report',
    kind: 'PDF report',
    summary: 'Full Team 09 design record covering requirements, prototype design, testing, and validation.',
    href: '/reports/bleeding-control-simulator-final-design-report.pdf',
  },
  {
    icon: PanelTop,
    title: 'Capstone Poster',
    kind: 'Poster deck',
    summary: 'Presentation poster summarizing the simulator architecture, prototype evidence, and outcomes.',
    href: '/reports/bleeding-control-simulator-capstone-poster.pptx',
  },
  {
    icon: MonitorUp,
    title: 'Final Presentation',
    kind: 'Slide deck',
    summary: 'Final capstone presentation for the bleeding control simulator project and prototype review.',
    href: '/reports/bleeding-control-simulator-final-presentation.pptx',
  },
]

function BleedingSimulatorSection() {
  const simulatorStartedAt = useMemo(() => Date.now(), [])
  const capabilityCards = [
    {
      icon: Droplets,
      label: 'Fluid path',
      copy: 'Reservoir, pump, tubing, wound module, and return loop mapped as a visible training system.',
    },
    {
      icon: Activity,
      label: 'Sensor feedback',
      copy: 'Pressure, flow rate, simulated loss, and trainee response update inside the simulator interface.',
    },
    {
      icon: Cpu,
      label: 'Controller logic',
      copy: 'Arduino-style state logic turns treatment inputs into clear coaching and performance signals.',
    },
    {
      icon: MonitorUp,
      label: 'Instructor view',
      copy: 'Live charts, intervention modes, and repeatable scenarios make the prototype easier to teach with.',
    },
  ]

  return (
    <SectionReveal id="bleeding-simulator" className="case-section clinical-section advanced-bleeding-section">
      <div className="case-intro two-column bleeding-case-intro">
        <div>
          <p className="eyebrow">04 / Medical engineering</p>
          <h2>Bleeding Control Simulator</h2>
          <p className="case-kicker">Clinical training device / sensing / control feedback</p>
          <div className="bleeding-actions">
            <a
              className="bleeding-primary-action"
              href="/bleeding-control-simulator-full/index.html"
              target="_blank"
              rel="noreferrer"
            >
              Open simulator
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a className="bleeding-secondary-action" href="#contact">
              Discuss build
            </a>
          </div>
        </div>
        <div className="bleeding-summary-card">
          <p>
            A portable first-aid training simulator that combines a prosthetic wound module,
            recirculating fluid loop, pressure and flow sensing, controller logic, and a live
            instructor dashboard.
          </p>
          <div className="bleeding-summary-metrics">
            <span>
              <strong>3</strong>
              treatment modes
            </span>
            <span>
              <strong>Live</strong>
              pressure + flow telemetry
            </span>
            <span>
              <strong>Closed</strong>
              feedback loop
            </span>
          </div>
        </div>
      </div>

      <div className="bleeding-artifact-panel" aria-label="Bleeding control simulator capstone files">
        <div className="bleeding-artifact-copy">
          <span className="eyebrow">Capstone deliverables</span>
          <h3>Report, poster, and final presentation</h3>
        </div>
        <div className="bleeding-artifact-grid">
          {bleedingArtifactLinks.map(({ icon: Icon, title, kind, summary, href }) => (
            <a className="bleeding-artifact-card" href={href} target="_blank" rel="noreferrer" key={title}>
              <span className="bleeding-artifact-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="bleeding-artifact-kind">{kind}</span>
              <strong>{title}</strong>
              <p>{summary}</p>
              <span className="bleeding-artifact-open">
                Open artifact
                <ArrowUpRight size={15} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="bleeding-embed-shell">
        <div className="bleeding-embed-toolbar">
          <div>
            <span className="eyebrow">Interactive build</span>
            <h3>Simulator console</h3>
          </div>
          <div className="bleeding-toolbar-tags" aria-label="Simulator features">
            <span>3D system</span>
            <span>Live telemetry</span>
            <span>Training feedback</span>
          </div>
        </div>
        <iframe
          title="Bleeding Control Simulator interactive demo"
          src={`/bleeding-control-simulator/index.html?embed=portfolio&startedAt=${simulatorStartedAt}`}
          loading="lazy"
          onLoad={(event) => {
            const frame = event.currentTarget
            const syncHeight = () => {
              const doc = frame.contentDocument
              if (!doc) {
                return
              }

              frame.style.height = '0px'
              const nextHeight = Math.max(doc.body.scrollHeight, 980)
              if (nextHeight) {
                frame.style.height = `${nextHeight}px`
              }
            }

            syncHeight()
            window.setTimeout(syncHeight, 500)
            window.setTimeout(syncHeight, 1200)
          }}
        />
      </div>

      <div className="bleeding-evidence-grid">
        {capabilityCards.map(({ icon: Icon, label, copy }) => (
          <article className="bleeding-evidence-card" key={label}>
            <Icon size={22} aria-hidden="true" />
            <h3>{label}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </SectionReveal>
  )
}

const hvacMemoDefaults = {
  floorArea: 2000,
  ceilingHeight: 10,
  ach: 20,
  existingCapacity: 25000,
  budgetCap: 200000,
}

const hvacReportHref = '/GMP-HVAC-Technical-Memorandum.pdf'

const hvacDecisionCards = [
  {
    id: 'dedicated',
    cost: 300000,
    status: 'Over budget',
    note: 'Best isolation, highest scope',
  },
  {
    id: 'modify',
    cost: 150000,
    status: 'Within cap',
    note: 'Useful infrastructure, more integration risk',
  },
  {
    id: 'enhance',
    cost: 100000,
    status: 'Recommended',
    note: 'Lowest cost path with validation work',
  },
]

const hvacComplianceTargets = [
  ['HEPA filtration', '99.97% at 0.3 micron'],
  ['Cleanliness', 'Class 100,000 / ISO 8'],
  ['Temperature', '15-25 deg C target band'],
  ['Humidity', '35-65% RH target band'],
  ['Airflow', 'Unidirectional over fill line'],
  ['Verification', 'Commission, test, train, monitor'],
]

const hvacWorkflowSteps = [
  'Review GMP standards',
  'Calculate airflow requirement',
  'Compare system options',
  'Recommend enhancement path',
  'Commission and monitor',
]

const hvacScoreLabels: Record<string, string> = {
  compliance: 'Compliance',
  flexibility: 'Flexibility',
  energy: 'Energy efficiency',
  time: 'Install time',
  cost: 'Budget fit',
}

const formatHvacNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

function HvacSection() {
  const recommendedOption = hvacOptions.find((item) => item.id === 'enhance') ?? hvacOptions[0]
  const [optionId, setOptionId] = useState<HvacOption['id']>(recommendedOption.id)
  const [ach, setAch] = useState(hvacMemoDefaults.ach)
  const option = hvacOptions.find((item) => item.id === optionId) ?? hvacOptions[0]
  const roomVolume = hvacMemoDefaults.floorArea * hvacMemoDefaults.ceilingHeight
  const requiredCfm = Math.round((roomVolume * ach) / 60)
  const capacityShare = Math.round((requiredCfm / hvacMemoDefaults.existingCapacity) * 100)
  const activeDecision = hvacDecisionCards.find((item) => item.id === option.id) ?? hvacDecisionCards[0]

  return (
    <SectionReveal id="gmp-hvac" className="case-section light-section hvac-section">
      <div className="hvac-hero">
        <div className="case-intro hvac-copy">
          <a className="hvac-breadcrumb" href="#work">
            <span>Project 05</span>
            <i aria-hidden="true">/</i>
            Work
            <i aria-hidden="true">/</i>
            GMP HVAC System
          </a>
          <h2>GMP HVAC System</h2>
          <p className="hvac-subtitle">Clean air. Controlled.</p>
          <p>
            Designing a GMP-compliant fill-line HVAC strategy around ISO 8 cleanliness,
            HEPA filtration, existing 25,000 CFM capacity, and a $200k implementation cap.
          </p>
          <div className="hvac-hero-actions">
            <a className="button primary" href="#hvac-learning">Project overview</a>
            <a className="hvac-text-link" href="#hvac-tradeoff">
              View case study
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a className="hvac-report-link" href={hvacReportHref} target="_blank" rel="noreferrer">
              <FileText size={16} aria-hidden="true" />
              Technical report
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
          <div className="hvac-memo-strip" aria-label="Technical memorandum constraints">
            <span>20 ACH</span>
            <span>6,667 CFM</span>
            <span>$200k cap</span>
          </div>
        </div>
        <GmpHvacModel activeOption={option.id} />
      </div>

      <div className="hvac-option-zone" aria-label="HVAC design comparison">
        <p className="hvac-control-kicker">Compare HVAC design options</p>
        <div className="option-tabs" aria-label="HVAC options">
          {hvacOptions.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={option.id === item.id}
              onClick={() => setOptionId(item.id)}
            >
              <Wind size={18} aria-hidden="true" />
              <span>{item.label}</span>
              <small>{item.note}</small>
            </button>
          ))}
        </div>
      </div>

      <div id="hvac-learning" className="hvac-dashboard">
        <div className="option-summary">
          <span className="hvac-panel-kicker">Selected strategy</span>
          <h3>{option.label}</h3>
          <p>{option.description}</p>
          <ul>
            {option.bullets.map((bullet) => (
              <li key={bullet}>
                <CheckCircle2 size={15} aria-hidden="true" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="hvac-analysis-panel">
          <div className="hvac-stats">
            <MetricCard label="Air changes" value={option.ach} trend="fill-line target" />
            <MetricCard label="Risk posture" value={option.pressure} trend="implementation" />
            <MetricCard label="Energy behavior" value={option.energy} trend="system load" />
            <MetricCard label="CAPEX" value={option.capex} trend={activeDecision.status} />
            <MetricCard label="OPEX" value={option.opex} trend="relative" />
          </div>
          <div className="score-panel">
            {Object.entries(option.scores).map(([key, value]) => (
              <div key={key} className="score-row">
                <span>{hvacScoreLabels[key] ?? key}</span>
                <div>
                  <i style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="compliance-card">
          <span className="hvac-panel-kicker">Compliance & performance</span>
          <h3>{activeDecision.status}</h3>
          <p>{option.recommendation}</p>
          <div className="compliance-list">
            {hvacComplianceTargets.map(([label, value]) => (
              <span key={label}>
                <b>{label}</b>
                <em>{value}</em>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hvac-learning-grid">
        <div className="hvac-learning-card hvac-sizing-card">
          <span className="hvac-panel-kicker">Airflow sizing</span>
          <h3>CFM = Room volume x ACH / 60</h3>
          <p>
            The memorandum fill-line area uses a 2,000 sq ft room, 10 ft ceiling,
            and a 20 ACH baseline.
          </p>
          <div className="hvac-slider-row">
            <label htmlFor="hvac-ach">Air changes per hour</label>
            <strong>{ach} ACH</strong>
            <input
              id="hvac-ach"
              type="range"
              min="12"
              max="35"
              step="1"
              value={ach}
              onChange={(event) => setAch(Number(event.target.value))}
            />
          </div>
          <div className="hvac-sizing-results">
            <MetricCard label="Room volume" value={`${formatHvacNumber(roomVolume)} ft3`} trend="area x height" />
            <MetricCard label="Required air" value={`${formatHvacNumber(requiredCfm)} CFM`} trend={`${capacityShare}% of existing capacity`} />
            <MetricCard label="Existing system" value={`${formatHvacNumber(hvacMemoDefaults.existingCapacity)} CFM`} trend="central HVAC capacity" />
          </div>
        </div>

        <div id="hvac-tradeoff" className="hvac-learning-card hvac-decision-card">
          <span className="hvac-panel-kicker">Decision tradeoff</span>
          <h3>
            Why <span className="hvac-decision-title-highlight">"Enhance Existing"</span> won
          </h3>
          <p>
            Each option was measured against the $200k budget cap, cleanroom risk,
            installation complexity, and ability to keep the facility operating.
          </p>
          <div className="hvac-budget-track" aria-label="Budget cap comparison">
            <span style={{ left: `${(hvacMemoDefaults.budgetCap / 300000) * 100}%` }}>$200k cap</span>
          </div>
          <div className="hvac-decision-options">
            {hvacDecisionCards.map((item) => {
              const linkedOption = hvacOptions.find((entry) => entry.id === item.id) ?? hvacOptions[0]
              const width = Math.min((item.cost / 300000) * 100, 100)
              return (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={option.id === item.id}
                  onClick={() => setOptionId(linkedOption.id)}
                >
                  <span>
                    <b>{linkedOption.label}</b>
                    <em>{item.note}</em>
                  </span>
                  <strong>${formatHvacNumber(item.cost / 1000)}k</strong>
                  <i style={{ width: `${width}%` }} />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="hvac-workflow-strip" aria-label="Project workflow">
        {hvacWorkflowSteps.map((step, index) => (
          <span key={step}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            {step}
          </span>
        ))}
      </div>
    </SectionReveal>
  )
}

function CubeSatSection() {
  const [sunlight, setSunlight] = useState(true)
  const [orbitCycle, setOrbitCycle] = useState(45)
  const [thermalAnchors, setThermalAnchors] = useState<ThermalAnchorMap>(thermalAnchorFallbacks)

  const thermal = useMemo<ThermalTelemetry>(() => {
    const radians = ((orbitCycle - 45) / 45) * Math.PI
    const conditionOffset = sunlight ? 0 : -47
    const xFace = 68.4 + Math.sin(radians) * 3.8 + conditionOffset
    const panel = 62.1 + (Math.cos(radians * 0.55) - 1) * 2.2 + (sunlight ? 0 : -58)
    const battery = 44.7 + (Math.sin(radians + 0.7) - Math.sin(0.7)) * 2.4 + (sunlight ? 0 : -24)
    const radio = 39.2 + (Math.cos(radians + 0.4) - Math.cos(0.4)) * 2.8 + (sunlight ? 0 : -20)
    const nadir = -18.7 + (Math.sin(radians - 0.6) - Math.sin(-0.6)) * 3.3 + (sunlight ? 0 : -9)
    const peak = sunlight ? 72.6 : Math.max(xFace, panel, battery, radio, nadir)
    const cold = sunlight ? -28.4 : Math.min(xFace, panel, battery, radio, nadir)
    return { xFace, panel, battery, radio, nadir, peak, cold }
  }, [orbitCycle, sunlight])

  const updateThermalAnchors = (anchors: ThermalAnchorMap) => {
    setThermalAnchors(anchors)
  }
  const thermalCallouts = useMemo(() => createThermalCalloutPositions(thermalAnchors), [thermalAnchors])

  return (
    <SectionReveal id="cubesat-thermal" className="case-section thermal-section">
      <div className="thermal-layout">
        <div className="case-intro thermal-copy">
          <a className="back-link" href="#work">All projects</a>
          <p className="eyebrow">06 / Thermal simulation</p>
          <h2>CubeSat Thermal<span>.</span></h2>
          <p className="thermal-subtitle">Simulate. Stabilize. Survive.</p>
          <p>
            A Project 06 simulation piece based on my thermal subsystem work with the Dalhousie
            Space Systems Lab MANTIS CubeSat program. The interface turns COMSOL and MATLAB-style
            thermal reasoning into an inspectable SolidWorks-inspired virtual twin.
          </p>
          <div className="thermal-tags">
            <span>COMSOL</span>
            <span>MATLAB</span>
            <span>SolidWorks twin</span>
          </div>
          <div className="thermal-mission-note">
            <span>MANTIS context</span>
            <p>
              CSA CUBICS mission work around multispectral imaging, edge computing, and thermal
              dissipation constraints.
            </p>
          </div>
        </div>

        <div className={`cubesat-scene ${sunlight ? 'is-sunlit' : 'is-eclipse'}`}>
          <div className="orbit-lines" />
          <CubeSatThermalViewer
            sunlight={sunlight}
            orbitMinutes={orbitCycle}
            thermal={thermal}
            onAnchorUpdate={updateThermalAnchors}
          />
          <ThermalLeaderLines anchors={thermalAnchors} callouts={thermalCallouts} />
          <ThermalCallout className="temp-x" label="+X face" value={thermal.xFace} position={thermalCallouts.xFace} />
          <ThermalCallout className="temp-panel" label="Solar panel" value={thermal.panel} position={thermalCallouts.panel} />
          <ThermalCallout className="temp-battery" label="Battery module" value={thermal.battery} position={thermalCallouts.battery} />
          <ThermalCallout className="temp-radio" label="Radio stack" value={thermal.radio} position={thermalCallouts.radio} />
          <ThermalCallout className="temp-nadir" label="-Z face (nadir)" value={thermal.nadir} position={thermalCallouts.nadir} />
          <div className="temperature-legend">
            <span>Temperature (&deg;C)</span>
            <div>
              <i />
              <small>80</small>
              <small>60</small>
              <small>40</small>
              <small>20</small>
              <small>0</small>
              <small>-20</small>
              <small>-40</small>
            </div>
          </div>
          <div className="temperature-range-card">
            <span>Temperature range</span>
            <strong>{thermal.cold.toFixed(1)}&deg;C <em>to</em> {thermal.peak.toFixed(1)}&deg;C</strong>
            <small>Within operational limits <i /></small>
          </div>
          <div className="thermal-controls">
            <div className="thermal-toggle" aria-label="Orbit condition">
              <button type="button" aria-pressed={sunlight} onClick={() => setSunlight(true)}>
                <Sun size={16} aria-hidden="true" />
                Sunlight
              </button>
              <button type="button" aria-pressed={!sunlight} onClick={() => setSunlight(false)}>
                <Moon size={16} aria-hidden="true" />
                Eclipse
              </button>
            </div>
            <label className="orbit-slider">
              <span>Orbit cycle</span>
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={orbitCycle}
                onChange={(event) => setOrbitCycle(Number(event.currentTarget.value))}
              />
              <div className="orbit-ticks">
                <span>0 min</span>
                <span>22 min</span>
                <strong>{orbitCycle} min</strong>
                <span>67 min</span>
                <span>90 min</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="thermal-bottom-grid">
        <div className="thermal-insight-card">
          <h3>Thermal model insights</h3>
          <ThermalMetricRow label="Peak temperature" detail="Generated +X face solar exposure case" value={`${thermal.peak.toFixed(1)}&deg;C`} data={[42, 54, 58, 72, 61, 70, 60, 72]} color="#ff7d55" />
          <ThermalMetricRow label="Cold spot" detail="Nadir face in eclipse most critical" value={`${thermal.cold.toFixed(1)}&deg;C`} data={[-18, -24, -21, -28, -19, -25, -23, -22]} color="#4d82ff" />
          <ThermalMetricRow label="Thermal gradient" detail="Max delta across structure" value={`${(thermal.peak - thermal.cold).toFixed(1)}&deg;C`} data={[72, 86, 82, 92, 81, 100, 88, 91]} color="#8d62ff" />
          <ThermalMetricRow label="Heater duty cycle" detail="Average power required to maintain > 0&deg;C" value="18.7%" data={[8, 10, 9, 14, 12, 18, 15, 17]} color="#44b99a" />
        </div>

        <div className="thermal-model-card">
          <div className="model-highlights">
            <h3>Model highlights</h3>
            <ul>
              <li><CheckCircle2 size={15} aria-hidden="true" />Generated orbital thermal profile with component-level nodes</li>
              <li><CheckCircle2 size={15} aria-hidden="true" />Mesh colors update from the active temperature field</li>
              <li><CheckCircle2 size={15} aria-hidden="true" />Structured for future COMSOL and MATLAB profile imports</li>
              <li><CheckCircle2 size={15} aria-hidden="true" />Built around thermal subsystem design decisions</li>
            </ul>
          </div>
          <div className="orbit-plot" aria-hidden="true">
            <span />
          </div>
          <blockquote>
            Good thermal design is not about adding more heaters. It is about understanding every watt, every orbit.
            <cite>Debaprashad Bhowmik <span>Mechanical engineer</span></cite>
          </blockquote>
        </div>
      </div>
    </SectionReveal>
  )
}

function ThermalCallout({
  className,
  label,
  position,
  value,
}: {
  className: string
  label: string
  position?: ThermalAnchorPoint
  value: number
}) {
  const style = position
    ? ({
        '--thermal-left': `${position.x}%`,
        '--thermal-top': `${position.y}%`,
        top: `var(--thermal-top)`,
        right: 'auto',
        bottom: 'auto',
        left: `var(--thermal-left)`,
        opacity: position.visible ? 1 : 0,
        pointerEvents: position.visible ? 'auto' : 'none',
      } as CSSProperties)
    : undefined

  return (
    <div className={`thermal-callout ${className}`} style={style}>
      <span>{label}</span>
      <strong>{value.toFixed(1)}&deg;C</strong>
    </div>
  )
}

function ThermalLeaderLines({ anchors, callouts }: { anchors: ThermalAnchorMap; callouts: ThermalAnchorMap }) {
  const lines: Array<{ key: ThermalAnchorKey; start: ThermalAnchorPoint; end: ThermalAnchorPoint }> = [
    { key: 'xFace', start: callouts.xFace, end: anchors.xFace },
    { key: 'panel', start: callouts.panel, end: anchors.panel },
    { key: 'battery', start: callouts.battery, end: anchors.battery },
    { key: 'radio', start: callouts.radio, end: anchors.radio },
    { key: 'nadir', start: callouts.nadir, end: anchors.nadir },
  ]

  return (
    <svg className="thermal-leader-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {lines.map(({ key, start, end }) => (
        <g key={key} opacity={end.visible ? 1 : 0}>
          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
          <circle cx={end.x} cy={end.y} r="0.45" />
        </g>
      ))}
    </svg>
  )
}

function ThermalMetricRow({
  label,
  detail,
  value,
  data,
  color,
}: {
  label: string
  detail: string
  value: string
  data: number[]
  color: string
}) {
  return (
    <div className="thermal-metric-row">
      <Box size={21} aria-hidden="true" />
      <span><strong>{label}</strong>{detail}</span>
      <b dangerouslySetInnerHTML={{ __html: value }} />
      <Sparkline data={data} stroke={color} />
    </div>
  )
}

type FeedbackCardPosition = 'active' | 'left' | 'right'

function SupervisorFeedbackSection() {
  const defaultFeedbackIndex = Math.max(
    supervisorFeedback.findIndex((item) => item.id === 'trimac'),
    0,
  )
  const [activeIndex, setActiveIndex] = useState(defaultFeedbackIndex)
  const activeFeedback = supervisorFeedback[activeIndex]

  const moveFeedback = (direction: -1 | 1) => {
    setActiveIndex((currentIndex) => (
      (currentIndex + direction + supervisorFeedback.length) % supervisorFeedback.length
    ))
  }

  const getCardPosition = (index: number): FeedbackCardPosition => {
    const offset = (index - activeIndex + supervisorFeedback.length) % supervisorFeedback.length

    if (offset === 0) return 'active'
    if (offset === 1) return 'right'
    return 'left'
  }

  return (
    <SectionReveal id="supervisor-feedback" className="feedback-section">
      <div className="feedback-intro">
        <p className="eyebrow">Why me</p>
        <h2>What My Supervisors Noticed</h2>
        <p>
          Feedback from engineering environments where I contributed to real projects, solved
          problems, and delivered results.
        </p>
      </div>

      <div className="feedback-stage" aria-label="Supervisor feedback carousel">
        <div className="feedback-orbit" aria-hidden="true" />
        <button
          className="feedback-arrow feedback-arrow-left"
          type="button"
          aria-label="Show previous feedback"
          onClick={() => moveFeedback(-1)}
        >
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
        <div className="feedback-card-deck">
          {supervisorFeedback.map((item, index) => (
            <SupervisorFeedbackCard
              key={item.id}
              item={item}
              position={getCardPosition(index)}
              isFeatured={item.id === activeFeedback.id}
            />
          ))}
        </div>
        <button
          className="feedback-arrow feedback-arrow-right"
          type="button"
          aria-label="Show next feedback"
          onClick={() => moveFeedback(1)}
        >
          <ChevronRight size={26} aria-hidden="true" />
        </button>
      </div>

      <div className="feedback-dots" aria-label="Choose featured feedback">
        {supervisorFeedback.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Show feedback from ${item.company}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <div className="feedback-proof-strip" aria-label="Feedback credibility highlights">
        {feedbackProofItems.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.title} className="feedback-proof-item">
              <Icon size={42} strokeWidth={1.8} aria-hidden="true" />
              <span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </span>
            </div>
          )
        })}
      </div>
    </SectionReveal>
  )
}

function SupervisorFeedbackCard({
  isFeatured,
  item,
  position,
}: {
  isFeatured: boolean
  item: SupervisorFeedback
  position: FeedbackCardPosition
}) {
  return (
    <article className={`feedback-card is-${position}`}>
      <div className="feedback-card-top">
        <span className="feedback-company-lockup">
          <img className="feedback-company-logo" src={item.companyLogo} alt={item.companyLogoAlt} />
          <span>{item.company}</span>
        </span>
        {isFeatured ? <span className="feedback-featured-badge">Featured</span> : null}
      </div>
      <Quote className="feedback-quote-icon" size={30} strokeWidth={3} aria-hidden="true" />
      <blockquote>{item.quote}</blockquote>
      <footer className="feedback-person">
        <img src={item.portrait} alt={item.personName} />
        <span>
          <strong>{item.personName}</strong>
          <small>{item.personTitle}</small>
          <small>{item.organization}</small>
        </span>
      </footer>
      <div className="feedback-tags">
        {item.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  )
}

function ClosingSection() {
  return (
    <SectionReveal id="contact" className="closing-section">
      <div id="about" className="closing-grid">
        <div>
          <p className="eyebrow">Available for engineering + AI systems work</p>
          <h2>Want to build something weirdly useful?</h2>
        </div>
        <div>
          <p>
            Debaprashad Bhowmik works across mechanical design, simulation, predictive maintenance,
            clean infrastructure, and AI-assisted engineering tools.
          </p>
          <div className="contact-actions">
            <a className="button primary" href={`mailto:${contactLinks.email}`}>
              <Mail size={17} aria-hidden="true" />
              Email
            </a>
            <a className="button ghost" href={contactLinks.linkedin} target="_blank" rel="noreferrer">
              <ExternalLink size={17} aria-hidden="true" />
              LinkedIn
            </a>
            <a className="button ghost" href={contactLinks.github} target="_blank" rel="noreferrer">
              <Code2 size={17} aria-hidden="true" />
              GitHub
            </a>
            <a className="button ghost" href={contactLinks.resume} target="_blank" rel="noreferrer">
              <FileText size={17} aria-hidden="true" />
              Resume
            </a>
          </div>
        </div>
      </div>
      <footer className="site-footer">
        <span>Based in Halifax, Canada</span>
        <strong>Mechanical design</strong>
        <strong>AI systems</strong>
        <strong>Simulation</strong>
        <strong>Automation</strong>
        <strong>Clean infrastructure</strong>
      </footer>
    </SectionReveal>
  )
}

export default App
