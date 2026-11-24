import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import './ProjectOverview.css'

export type ProjectOverviewTab = {
  id: string
  label: string
  copy: string
  features: { icon: LucideIcon; title: string; detail: string }[]
}

type Props = {
  id: string
  titleId: string
  title: ReactNode
  link: { href: string; label: string }
  tabLabel: string
  tabs: ProjectOverviewTab[]
  children: ReactNode
}

export default function ProjectOverview({ id, titleId, title, link, tabLabel, tabs, children }: Props) {
  const [active, setActive] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
    if (next === null) return
    event.preventDefault()
    setActive(next)
    buttons.current[next]?.focus()
  }

  return (
    <footer id={id} className="project-overview" aria-labelledby={titleId}>
      <div className="project-overview-heading">
        <h3 id={titleId}>{title}</h3>
        <a href={link.href}>{link.label} <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <div className="project-overview-panel">
        <div className="project-overview-tabs" role="tablist" aria-label={tabLabel}>
          {tabs.map((item, index) => (
            <button key={item.id} ref={node => { buttons.current[index] = node }}
              type="button" role="tab" id={`${id}-tab-${item.id}`} aria-controls={`${id}-panel-${item.id}`}
              aria-selected={index === active} tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)} onKeyDown={event => navigate(event, index)}>
              {item.label}
            </button>
          ))}
        </div>
        {tabs.map((tab, index) => (
          <div className="project-overview-body" key={tab.id} role="tabpanel" id={`${id}-panel-${tab.id}`}
            aria-labelledby={`${id}-tab-${tab.id}`} tabIndex={0} hidden={index !== active}>
            <p>{tab.copy}</p>
            <div className="project-overview-features" data-count={tab.features.length}>
              {tab.features.map(({ icon: Icon, title, detail }) => (
                <article key={title}>
                  <Icon size={27} strokeWidth={1.6} aria-hidden="true" />
                  <h4>{title}</h4>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
      {children}
    </footer>
  )
}
