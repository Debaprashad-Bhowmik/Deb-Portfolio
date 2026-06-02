import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { RotateCcw } from 'lucide-react'

type CoachState = 'hidden' | 'expanded' | 'collapsed'

type UseModelInteractionCoachOptions = {
  containerRef: RefObject<HTMLElement | null>
  ready: boolean
  autoCollapseMs?: number
  dragThreshold?: number
}

type ModelInteractionCoachProps = {
  state: CoachState
  theme: 'light' | 'dark'
  placement?: 'lower-left' | 'lower-center'
  onReplay: () => void
}

export function useModelInteractionCoach({
  containerRef,
  ready,
  autoCollapseMs = 4800,
  dragThreshold = 8,
}: UseModelInteractionCoachOptions) {
  const [state, setState] = useState<CoachState>('hidden')
  const [visible, setVisible] = useState(false)
  const presentedRef = useRef(false)
  const collapseTimerRef = useRef<number | null>(null)
  const pointerStartRef = useRef<{ id: number; x: number; y: number } | null>(null)

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current !== null) {
      window.clearTimeout(collapseTimerRef.current)
      collapseTimerRef.current = null
    }
  }, [])

  const collapse = useCallback(() => {
    clearCollapseTimer()
    setState((current) => (current === 'hidden' && !presentedRef.current ? current : 'collapsed'))
  }, [clearCollapseTimer])

  const showCoach = useCallback(() => {
    clearCollapseTimer()
    setState('expanded')
    collapseTimerRef.current = window.setTimeout(collapse, autoCollapseMs)
  }, [autoCollapseMs, clearCollapseTimer, collapse])

  const replay = useCallback(() => {
    presentedRef.current = true
    showCoach()
  }, [showCoach])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      {
        rootMargin: '-22% 0px -22% 0px',
        threshold: 0.01,
      },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef])

  useEffect(() => {
    if (!ready || !visible || presentedRef.current) return
    presentedRef.current = true
    showCoach()
  }, [ready, showCoach, visible])

  useEffect(() => {
    if (!visible && presentedRef.current) {
      collapse()
    }
  }, [collapse, visible])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onPointerDown = (event: PointerEvent) => {
      pointerStartRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    }

    const onPointerMove = (event: PointerEvent) => {
      const start = pointerStartRef.current
      if (!start || start.id !== event.pointerId) return
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) >= dragThreshold) {
        pointerStartRef.current = null
        collapse()
      }
    }

    const clearPointer = (event: PointerEvent) => {
      if (pointerStartRef.current?.id === event.pointerId) {
        pointerStartRef.current = null
      }
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', clearPointer)
    container.addEventListener('pointercancel', clearPointer)

    return () => {
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', clearPointer)
      container.removeEventListener('pointercancel', clearPointer)
    }
  }, [collapse, containerRef, dragThreshold])

  useEffect(() => clearCollapseTimer, [clearCollapseTimer])

  return { state, replay }
}

export default function ModelInteractionCoach({
  state,
  theme,
  placement = 'lower-left',
  onReplay,
}: ModelInteractionCoachProps) {
  if (state === 'hidden') return null

  return (
    <div
      className={`model-interaction-coach is-${state} is-${placement}`}
      data-theme={theme}
      aria-live="polite"
    >
      {state === 'expanded' ? (
        <div className="model-coach-capsule" role="status">
          <span className="model-coach-icon" aria-hidden="true">
            <RotateCcw size={16} />
          </span>
          <span className="model-coach-copy">
            <strong>
              <span className="model-coach-desktop-copy">Drag to inspect</span>
              <span className="model-coach-mobile-copy">Swipe to rotate</span>
            </strong>
            <small>
              <span className="model-coach-desktop-copy">Rotate the 3D model</span>
              <span className="model-coach-mobile-copy">Explore every angle</span>
            </small>
          </span>
          <span className="model-coach-trace" aria-hidden="true" />
        </div>
      ) : (
        <button
          className="model-coach-replay"
          type="button"
          aria-label="Show 3D interaction hint"
          title="Show 3D interaction hint"
          onPointerDownCapture={(event) => {
            event.stopPropagation()
            onReplay()
          }}
          onClick={(event) => {
            event.stopPropagation()
            if (event.detail === 0) {
              onReplay()
            }
          }}
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
