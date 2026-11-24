import { CalendarDays, Clock3, Footprints, Globe2, MapPin, Mountain, Radio, SlidersHorizontal, Sun, Timer } from 'lucide-react'
import ProjectOverview, { type ProjectOverviewTab } from './ProjectOverview'

const tabs: ProjectOverviewTab[] = [
  {
    id: 'overview', label: 'Overview',
    copy: 'I led Team Astralis and designed a novel algorithm to find places to land at the Moon’s South Pole for a particular mission. For a seven-day stay starting on Christmas Day 2026, it found Patch 1 outside NASA’s published Artemis landing regions.',
    features: [
      { icon: CalendarDays, title: 'Choose a mission', detail: 'Pick when to land and how long to stay.' },
      { icon: SlidersHorizontal, title: 'Check 6,685 spots', detail: 'Look for flat ground, solar energy and a clear view of Earth.' },
      { icon: MapPin, title: 'Compare the top spots', detail: 'See which spot works best for power, radio contact or a mix of both.' },
      { icon: Footprints, title: 'Walk the surface', detail: 'Fly down from orbit and look around in 3D.' },
    ],
  },
  {
    id: 'mission', label: 'Mission',
    copy: 'Try a seven-day stay starting December 25, 2026. The Sun sits low at the South Pole, so the same ridge can cast a shadow at one time and leave a spot in sunlight at another. Changing the date or length of your stay can change which spot comes out on top.',
    features: [
      { icon: CalendarDays, title: 'Landing day', detail: 'Begin the example mission on Christmas Day.' },
      { icon: Clock3, title: 'Time on the Moon', detail: 'The example covers seven days from landing.' },
      { icon: MapPin, title: 'Find the top spots', detail: 'Press Landing Suggestions to run the search for those dates.' },
    ],
  },
  {
    id: 'checks', label: 'Site checks',
    copy: 'The algorithm uses maps of the Moon’s terrain and the positions of the Sun and Earth. It filters out steep ground first, then compares the spots that remain for solar energy and uninterrupted Earth view.',
    features: [
      { icon: Mountain, title: 'Flat ground', detail: 'Check that the slope is under 10° across 100 metres.' },
      { icon: Sun, title: 'Solar energy', detail: 'Estimate how much panels could collect as the Sun changes angle and ridges cast shadows.' },
      { icon: Radio, title: 'Radio contact', detail: 'Find the longest stretch with a clear view of Earth for direct radio contact.' },
    ],
  },
  {
    id: 'results', label: 'Results',
    copy: 'Three spots led the Christmas mission for different reasons. Patch 1 gave the best mix of solar energy and an unbroken view of Earth. The search surfaced it as a new candidate outside NASA’s published Artemis landing regions.',
    features: [
      { icon: Radio, title: 'Patch 569', detail: 'Best for radio contact. Earth stayed in view all seven days.' },
      { icon: Sun, title: 'Patch 961', detail: 'Best for power. It offered the most estimated solar energy.' },
      { icon: MapPin, title: 'Patch 1', detail: 'Best balance. It offered 156.6 hours of unbroken Earth view and a slope of just 0.14°.' },
    ],
  },
  {
    id: 'explore', label: 'Explore',
    copy: 'Start in orbit to see the Moon, switch to the Moon Map to look for a site, then open Surface to see the terrain at ground level. Each view uses the same mission clock.',
    features: [
      { icon: Globe2, title: 'See the whole Moon', detail: 'Rotate the view and zoom in on the South Pole.' },
      { icon: Footprints, title: 'Look around on foot', detail: 'Drag to look. Use WASD or the on-screen arrows to walk.' },
      { icon: Timer, title: 'Play the time-lapse', detail: 'Watch the light and view of Earth change over your stay.' },
    ],
  },
]

export default function LunarProjectOverview() {
  return (
    <ProjectOverview id="lunar-walkthrough" titleId="lunar-walkthrough-title"
      title={<>How we found <em>a place to land.</em></>}
      link={{ href: '#lunar-explorer-title', label: 'Back to the navigator' }}
      tabLabel="Lunar project overview" tabs={tabs}>
      <div className="bolt-footer-strip" aria-label="Lunar Landing Site Navigator project metadata">
        <b>Lunar South Pole</b><i aria-hidden="true" />
        <b>Mission planning</b><i aria-hidden="true" />
        <b>Terrain analysis</b><i aria-hidden="true" />
        <b>3D simulation</b>
        <span><i aria-hidden="true" />Interactive demo</span>
      </div>
    </ProjectOverview>
  )
}
