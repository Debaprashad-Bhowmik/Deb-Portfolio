import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Film, Play, RotateCcw } from 'lucide-react'
import { brainMedia, type BrainMedia, type BrainMediaClip } from '../data/brainArchitecture'

export default function ArchitectureMediaGallery({ media }: { media: BrainMedia }) {
  const clips: readonly BrainMediaClip[] = media.clips?.length ? media.clips : media.videoSrc ? [{
    id: 'overview', title: 'Architecture overview', duration: '1:30', videoSrc: media.videoSrc,
    posterSrc: media.posterSrc, captionsSrc: media.captionsSrc,
    description: 'A tour of the software brain, its architecture diagrams and a recorded Minecraft prototype. Learning across games remains the research goal.',
  }] : []
  const [selectedId, setSelectedId] = useState(clips[0]?.id ?? 'overview')
  const selected = clips.find(clip => clip.id === selectedId) ?? clips[0]
  const videoRef = useRef<HTMLVideoElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const playerId = useId()
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const [posterFailed, setPosterFailed] = useState<string | null>(null)
  const [startedSource, setStartedSource] = useState<string | null>(null)
  const [rail, setRail] = useState({ overflow: false, previous: false, next: false })
  const hasVideo = Boolean(selected?.videoSrc && failedSource !== selected.videoSrc)
  const posterSrc = selected?.posterSrc ?? media.posterSrc ?? brainMedia.posterSrc

  useEffect(() => {
    const element = railRef.current
    if (!element) return
    const measure = () => setRail({
      overflow: element.scrollWidth > element.clientWidth + 2,
      previous: element.scrollLeft > 2,
      next: element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
    })
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    element.addEventListener('scroll', measure, { passive: true })
    return () => { observer.disconnect(); element.removeEventListener('scroll', measure) }
  }, [media])

  function chooseClip(clip: BrainMediaClip) {
    if (clip.id === selected?.id) return
    videoRef.current?.pause()
    setStartedSource(null)
    setSelectedId(clip.id)
  }

  function playSelected() {
    const video = videoRef.current
    if (!video) return
    video.focus()
    void video.play().catch(() => setStartedSource(null))
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % clips.length
    else if (event.key === 'ArrowLeft') next = (index + clips.length - 1) % clips.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = clips.length - 1
    else return
    event.preventDefault()
    chooseClip(clips[next])
    thumbRefs.current[next]?.focus()
    thumbRefs.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  function scrollRail(direction: number) {
    const element = railRef.current
    if (!element) return
    element.scrollBy({ left: direction * element.clientWidth * .8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  return (
    <figure className="brain-media" aria-label="Adaptive Cognitive Architecture video gallery">
      <div id={playerId} className="brain-media-frame">
        {hasVideo ? <>
          <video ref={videoRef} key={selected.videoSrc} controls playsInline preload="metadata" poster={posterSrc}
            aria-label={`${selected.title} video`}
            onPlay={() => setStartedSource(selected.videoSrc)} onError={() => setFailedSource(selected.videoSrc)}>
            <source src={selected.videoSrc} onError={() => setFailedSource(selected.videoSrc)} />
            {selected.captionsSrc && <track kind="captions" src={selected.captionsSrc} srcLang="en" label="English" />}
            Your browser cannot play this video.
          </video>
          {startedSource !== selected.videoSrc && <button type="button" className="brain-media-play" aria-label={`Play ${selected.title.toLowerCase()}`} onClick={playSelected}>
            <Play aria-hidden="true" fill="currentColor" strokeWidth={1.2} />
          </button>}
        </> : <>
          {posterFailed !== posterSrc && <img src={posterSrc} alt="Project video poster." onError={() => setPosterFailed(posterSrc)} />}
          {posterFailed === posterSrc && <div className="brain-poster-fallback">Past <ArrowRight aria-hidden="true" /> Present <ArrowRight aria-hidden="true" /> Future</div>}
          <div className="brain-media-note"><Film size={19} aria-hidden="true" /><span>
            {failedSource ? 'This video could not load' : 'Gameplay video coming soon'}
            <small>{failedSource ? 'Retry this video or select another film below.' : 'Concept illustration · footage to follow'}</small>
          </span>{failedSource && <button type="button" className="brain-media-retry" onClick={() => setFailedSource(null)}><RotateCcw size={15} aria-hidden="true" /> Retry</button>}</div>
        </>}
      </div>
      {clips.length > 1 && <div className="brain-media-gallery" role="group" aria-label="Choose a project video">
        <div ref={railRef} className="brain-media-thumbnails">
          {clips.map((clip, index) => <button type="button" key={clip.id} ref={element => { thumbRefs.current[index] = element }}
            className="brain-media-thumbnail" aria-pressed={selected.id === clip.id} aria-controls={playerId}
            aria-label={`Select ${clip.title}, ${clip.duration}`} onClick={() => chooseClip(clip)} onKeyDown={event => navigate(event, index)}>
            <span className="brain-media-thumbnail-image"><img src={clip.posterSrc ?? brainMedia.posterSrc} alt="" loading="lazy" />
              <span className="brain-media-thumbnail-play"><Play size={18} fill="currentColor" strokeWidth={1.2} aria-hidden="true" /></span>
              <span className="brain-media-duration">{clip.duration}</span>
            </span><span className="brain-media-thumbnail-title">{clip.title}</span>
          </button>)}
        </div>
        {rail.overflow && <div className="brain-media-rail-controls">
          <button type="button" aria-label="Scroll video thumbnails left" disabled={!rail.previous} onClick={() => scrollRail(-1)}><ChevronLeft aria-hidden="true" size={18} /></button>
          <button type="button" aria-label="Scroll video thumbnails right" disabled={!rail.next} onClick={() => scrollRail(1)}><ChevronRight aria-hidden="true" size={18} /></button>
        </div>}
      </div>}
      <figcaption aria-live="polite">{hasVideo ? selected.description : 'Designed for environments with observations, actions and feedback. The architecture explorer is available below.'}</figcaption>
    </figure>
  )
}
