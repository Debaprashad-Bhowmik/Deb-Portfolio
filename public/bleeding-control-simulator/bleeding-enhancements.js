(function () {
  const infoContent = {
    'Injury Severity': {
      title: 'Injury severity',
      body: 'Low, medium, and severe scenarios change the starting flow rate and the target pressure range the trainee must hold.',
    },
    'Treatment Mode': {
      title: 'Treatment mode',
      body: 'Direct pressure responds immediately, wound packing takes a short delay, and tourniquet mode requires enough pressure before strong flow reduction appears.',
    },
    'Pressure Applied': {
      title: 'Pressure applied',
      body: 'The target range is scenario-specific. Too little pressure leaves flow high; too much pressure can lower the training score.',
    },
    'Time Elapsed': {
      title: 'Time elapsed',
      body: 'This timer starts with the training run and resets with Reset Demo. It supports reassessment timing during the simulated scenario.',
    },
  }

  const metaItems = ['Mechanical Design', 'Fluid Flow', 'Sensor Feedback', 'Arduino Control', 'Training Interface']
  let activePopover = null
  let modelCoachTimer = null

  function normalizeTitle(text) {
    return text.replace(/\s+/g, ' ').trim()
  }

  function closeActivePopover() {
    if (!activePopover) return
    const { button, popover } = activePopover
    button.setAttribute('aria-expanded', 'false')
    popover.classList.remove('is-open')
    activePopover = null
  }

  function openPopover(button, popover) {
    if (activePopover?.popover === popover) {
      closeActivePopover()
      return
    }

    closeActivePopover()
    button.setAttribute('aria-expanded', 'true')
    popover.classList.add('is-open')
    activePopover = { button, popover }
  }

  function createInfoIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '14')
    svg.setAttribute('height', '14')
    svg.setAttribute('aria-hidden', 'true')
    svg.innerHTML = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/>'
    return svg
  }

  function enhanceInfoButtons() {
    document.querySelectorAll('.control-title').forEach((title) => {
      const titleText = normalizeTitle(title.childNodes[0]?.textContent || title.textContent || '')
      const content = infoContent[titleText]
      const group = title.closest('.control-group')

      if (!content || !group || group.querySelector('.control-info-button')) {
        return
      }

      const id = `control-info-${titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'control-info-button'
      button.setAttribute('aria-label', `${titleText} help`)
      button.setAttribute('aria-expanded', 'false')
      button.setAttribute('aria-describedby', id)
      button.appendChild(createInfoIcon())

      const popover = document.createElement('div')
      popover.id = id
      popover.className = 'control-info-popover'
      popover.setAttribute('role', 'tooltip')
      popover.innerHTML = `<strong>${content.title}</strong> <span>${content.body}</span>`

      button.addEventListener('click', (event) => {
        event.stopPropagation()
        openPopover(button, popover)
      })
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeActivePopover()
          button.focus()
        }
      })

      title.appendChild(button)
      group.appendChild(popover)
    })
  }

  function addMetaStrip() {
    const dashboard = document.querySelector('.dashboard')
    if (!dashboard || document.querySelector('.bleeding-demo-meta')) {
      return
    }

    const strip = document.createElement('section')
    strip.className = 'bleeding-demo-meta'
    strip.setAttribute('aria-label', 'Bleeding simulator engineering context')
    strip.innerHTML = `
      <div class="bleeding-demo-meta-list">
        ${metaItems.map((item) => `<span>${item}</span>`).join('')}
      </div>
      <div class="bleeding-demo-meta-status">Prototype demo linked</div>
    `
    dashboard.insertAdjacentElement('afterend', strip)
  }

  function createRotateIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '16')
    svg.setAttribute('height', '16')
    svg.setAttribute('aria-hidden', 'true')
    svg.innerHTML = '<path d="M3 12a9 9 0 1 0 3-6.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 4v6h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    return svg
  }

  function enhanceModelCoach() {
    const model = document.querySelector('.interactive-model')
    if (!model || model.querySelector('.bleeding-model-coach')) {
      return
    }

    const coach = document.createElement('div')
    coach.className = 'bleeding-model-coach'
    coach.innerHTML = `
      <div class="bleeding-model-coach-capsule" role="status" aria-live="polite">
        <span class="bleeding-model-coach-icon"></span>
        <span class="bleeding-model-coach-copy">
          <strong><span class="coach-desktop-copy">Drag to inspect</span><span class="coach-mobile-copy">Swipe to rotate</span></strong>
          <small><span class="coach-desktop-copy">Rotate the 3D model</span><span class="coach-mobile-copy">Explore every angle</span></small>
        </span>
        <span class="bleeding-model-coach-trace" aria-hidden="true"></span>
      </div>
      <button class="bleeding-model-coach-replay" type="button" aria-label="Show 3D interaction hint" title="Show 3D interaction hint"></button>
    `
    coach.querySelector('.bleeding-model-coach-icon').appendChild(createRotateIcon())
    coach.querySelector('.bleeding-model-coach-replay').appendChild(createRotateIcon())
    model.classList.add('has-interaction-coach')
    model.appendChild(coach)

    const replay = coach.querySelector('.bleeding-model-coach-replay')
    let pointerStart = null
    let coachPresented = false

    const clearCoachTimer = () => {
      if (modelCoachTimer !== null) {
        window.clearTimeout(modelCoachTimer)
        modelCoachTimer = null
      }
    }

    const collapseCoach = () => {
      clearCoachTimer()
      coach.classList.remove('is-expanded')
      coach.classList.add('is-collapsed')
    }

    const showCoach = () => {
      clearCoachTimer()
      coachPresented = true
      coach.classList.remove('is-collapsed')
      coach.classList.add('is-expanded')
      modelCoachTimer = window.setTimeout(collapseCoach, 4800)
    }

    model.addEventListener('pointerdown', (event) => {
      if (event.target.closest('.bleeding-model-coach-replay')) {
        return
      }
      pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY }
    })
    model.addEventListener('pointermove', (event) => {
      if (!pointerStart || pointerStart.id !== event.pointerId) {
        return
      }
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) >= 8) {
        pointerStart = null
        collapseCoach()
      }
    })
    model.addEventListener('pointerup', () => {
      pointerStart = null
    })
    model.addEventListener('pointercancel', () => {
      pointerStart = null
    })
    replay.addEventListener('pointerdown', (event) => {
      event.stopPropagation()
      showCoach()
    })
    replay.addEventListener('click', (event) => {
      event.stopPropagation()
      if (event.detail === 0) {
        showCoach()
      }
    })

    const visibilityWindow = window.parent !== window && window.frameElement ? window.parent : window
    const syncCoachVisibility = () => {
      const modelRect = model.getBoundingClientRect()
      const frameRect = window.frameElement?.getBoundingClientRect()
      const top = frameRect ? frameRect.top + modelRect.top : modelRect.top
      const bottom = top + modelRect.height
      const isMeaningfullyVisible = bottom > visibilityWindow.innerHeight * 0.22 && top < visibilityWindow.innerHeight * 0.78

      if (isMeaningfullyVisible && !coachPresented) {
        showCoach()
      } else if (!isMeaningfullyVisible && coach.classList.contains('is-expanded')) {
        collapseCoach()
      }
    }

    visibilityWindow.addEventListener('scroll', syncCoachVisibility, { passive: true })
    visibilityWindow.addEventListener('resize', syncCoachVisibility)
    window.setTimeout(syncCoachVisibility, 0)
  }

  function syncMobileComponentDock() {
    const model = document.querySelector('.interactive-model')
    const panel = model?.querySelector('.component-panel')
    const graphic = model?.closest('.system-graphic')

    if (!model || !panel || !graphic) {
      return
    }

    let dock = graphic.querySelector('.bleeding-mobile-component-dock')
    if (!dock) {
      dock = document.createElement('div')
      dock.className = 'bleeding-mobile-component-dock'
      dock.setAttribute('aria-live', 'polite')
      model.insertAdjacentElement('afterend', dock)
    }

    if (dock.lastPanelHtml !== panel.innerHTML) {
      dock.lastPanelHtml = panel.innerHTML
      dock.innerHTML = `<div class="component-panel bleeding-mobile-component-card">${panel.innerHTML}</div>`
    }
  }

  function enhanceSimulator() {
    enhanceInfoButtons()
    addMetaStrip()
    enhanceModelCoach()
    syncMobileComponentDock()
  }

  document.addEventListener('click', (event) => {
    if (!activePopover) return
    if (activePopover.button.contains(event.target) || activePopover.popover.contains(event.target)) {
      return
    }
    closeActivePopover()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeActivePopover()
    }
  })

  const observer = new MutationObserver(enhanceSimulator)
  observer.observe(document.documentElement, { childList: true, subtree: true })

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceSimulator)
  } else {
    enhanceSimulator()
  }
})()
