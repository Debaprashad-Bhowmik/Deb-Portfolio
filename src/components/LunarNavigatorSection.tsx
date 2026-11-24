import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import { projectNumbers } from '../data/portfolio'
import LunarProjectOverview from './LunarProjectOverview'
import LunarScene from './LunarScene'
import './LunarNavigatorSection.css'

const liveApp = 'https://debaprashad-bhowmik.github.io/project-astralis/'
const demoPage = `${liveApp}docs/demo/`
const media = '/videos/lunar-landing-site-navigator'

export default function LunarNavigatorSection() {
  return (
    <section className="case-section lunar-case" id="lunar-landing-site-navigator" aria-labelledby="lunar-case-title">
      <div className="lunar-case-intro">
        <div className="lunar-case-story">
          <a href="#work" className="project-back-link"><ChevronLeft size={15} aria-hidden="true" /> All projects <span>{projectNumbers['lunar-landing-site-navigator']}</span></a>
          <p className="lunar-eyebrow">2026 NASA Space Apps Challenge</p>
          <h2 id="lunar-case-title">Lunar Landing <em>Site Navigator</em></h2>
          <p className="lunar-role">Team lead · Team Astralis</p>
          <dl className="lunar-brief">
            <div>
              <dt>The problem</dt>
              <dd>At the Moon’s South Pole, the Sun barely rises above the horizon. A crater rim can shade solar panels or block a radio link to Earth. Change the landing date and the best spot can change too.</dd>
            </div>
            <div>
              <dt>What I invented</dt>
              <dd>
                I designed a novel algorithm that finds landing candidates beyond the NASA sites marked on our map. Pick a landing date and how long you’ll stay. It checks 6,685 spots at the Moon’s South Pole against three questions.
                <ul className="lunar-criteria">
                  <li><strong>Solar energy.</strong> How much could panels collect, given how high the Sun gets and when ridges block it?</li>
                  <li><strong>Contact with Earth.</strong> How long could the crew keep an unbroken view of Earth to radio home?</li>
                  <li><strong>Flat ground.</strong> Is the slope under 10° across 100 metres?</li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>

        <figure className="lunar-film">
          <video
            aria-label="Team Astralis 30-second project demo"
            controls
            playsInline
            preload="none"
            poster={`${media}/demo-poster.webp`}
          >
            <source src={`${media}/team-astralis-demo.mp4`} type="video/mp4" />
            <track kind="captions" src={`${media}/captions.vtt`} srcLang="en" label="English" />
            <a href={demoPage}>Watch the Team Astralis demo</a>
          </video>
          <figcaption>
            <span>Team Astralis · 30-second demo</span>
            <a href={demoPage} target="_blank" rel="noreferrer">Open video <ArrowUpRight size={14} aria-hidden="true" /></a>
          </figcaption>
        </figure>
      </div>

      <div className="lunar-result">
        <div className="lunar-result-copy">
          <p className="lunar-eyebrow">Mission result · 25 Dec 2026 · 7 days</p>
          <h3>A new candidate for a Christmas landing</h3>
          <p>
            For a seven-day stay, <strong>Patch 1</strong> (84.0215°S, 10.0372°W) offered the best mix of solar energy and an unbroken view of Earth among the spots the algorithm checked.
            It lies outside <a href="https://www.lpi.usra.edu/lunar/lunar-south-pole-atlas/index.shtml" target="_blank" rel="noreferrer">NASA’s published Artemis landing regions</a>.
          </p>
        </div>
        <dl className="lunar-metrics">
          <div><dt>Estimated solar energy</dt><dd>4.06 <small>kWh/m²</small></dd></div>
          <div><dt>Unbroken view of Earth</dt><dd>156.6 <small>hours</small></dd></div>
          <div><dt>Ground slope</dt><dd>0.14°</dd></div>
        </dl>
      </div>

      <LunarScene />

      <div className="lunar-case-footer">
        <p>The estimates use NASA terrain maps and NASA/JPL data on where the Sun and Earth will be. The results help find places worth a closer look.</p>
        <nav aria-label="Lunar Landing Site Navigator links">
          <a href={`${liveApp}#mission`} target="_blank" rel="noreferrer">Open full app <ArrowUpRight size={15} aria-hidden="true" /></a>
          <a href="https://github.com/Debaprashad-Bhowmik/project-astralis" target="_blank" rel="noreferrer">Source code <ArrowUpRight size={15} aria-hidden="true" /></a>
          <a href="https://www.spaceappschallenge.org/2026/find-a-team/the-astralis/?tab=project" target="_blank" rel="noreferrer">NASA submission <ArrowUpRight size={15} aria-hidden="true" /></a>
        </nav>
      </div>

      <LunarProjectOverview />
    </section>
  )
}
