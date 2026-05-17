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

  function enhanceSimulator() {
    enhanceInfoButtons()
    addMetaStrip()
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
