export type WorkCard = {
  id: string
  number: string
  title: string
  kicker: string
  summary: string
  details: string[]
  tags: string[]
  image: string
  imageAlt: string
  accent: string
  imagePosition?: string
  variant: 'snip' | 'engine' | 'bolt' | 'medical' | 'hvac' | 'thermal'
}

export const workCards: WorkCard[] = [
  {
    id: 'snipping-gpt',
    number: '01',
    title: 'Snipping GPT',
    kicker: 'AI assistant tool',
    summary: 'Screenshot assistant for fast technical screen summaries.',
    details: ['Capture and annotate screen regions', 'Intent presets for summaries, answers, and procedures', 'Built around low-friction engineering review workflows'],
    tags: ['Browser extension', 'Intent UI', 'Capture flow'],
    image: '/work-cards/snipping-gpt.png',
    imageAlt: 'Snipping GPT dark interface card with captured engineering drawing and AI summary panel',
    accent: '#78a6ff',
    imagePosition: '50% 54%',
    variant: 'snip',
  },
  {
    id: 'digital-twin',
    number: '02',
    title: 'BMT Diesel Engine Digital Twin',
    kicker: 'Predict. Monitor. Optimize.',
    summary: 'Digital twin for diesel health and maintenance signals.',
    details: ['Synthetic sensor streams for unavailable field data', 'Fault-mode scenarios with health and RUL signals', 'Dashboard patterns for operators and maintenance planning'],
    tags: ['Telemetry', 'Fault modes', 'Maintenance AI'],
    image: '/work-cards/diesel-digital-twin.png',
    imageAlt: 'Diesel engine digital twin card with engine render, health ring, and telemetry panels',
    accent: '#27c58b',
    imagePosition: '50% 47%',
    variant: 'engine',
  },
  {
    id: 'coupling-bolt',
    number: '03',
    title: 'Coupling Bolt',
    kicker: 'Precision. Strength. Standard.',
    summary: 'Mechanical drawing and manufacturable bolt design.',
    details: ['AutoCAD drawing package and dimensions', 'Thread, fit, material, and manufacturing constraints', 'Clear visual review flow for technical communication'],
    tags: ['AutoCAD', 'Tolerances', 'Manufacturable'],
    image: '/work-cards/coupling-bolt.png',
    imageAlt: 'Coupling bolt card with a metal fastener over mechanical blueprint drawings',
    accent: '#6f7b84',
    imagePosition: '50% 54%',
    variant: 'bolt',
  },
  {
    id: 'bleeding-simulator',
    number: '04',
    title: 'Bleeding Control Simulator',
    kicker: 'Clinical training hardware',
    summary: 'Training simulator with pressure, flow, and feedback.',
    details: ['Arduino-based sensor and indicator loop', 'Pressure and flow feedback for repeatable training', 'Hardware/software interface for clinical practice'],
    tags: ['Sensors', 'Flow loop', 'Feedback UI'],
    image: '/work-cards/bleeding-control-simulator.png',
    imageAlt: 'Bleeding control simulator card with training arm, tubes, pump, Arduino controller, and pressure UI',
    accent: '#9b1f22',
    imagePosition: '50% 56%',
    variant: 'medical',
  },
  {
    id: 'gmp-hvac',
    number: '05',
    title: 'GMP HVAC System',
    kicker: 'Clean air. Controlled.',
    summary: 'Cleanroom HVAC concept for airflow and pressure control.',
    details: ['Cleanroom airflow and ACH reasoning', 'HEPA and pressure cascade comparison', 'Recommendation logic tied to cost and compliance'],
    tags: ['HEPA', 'Pressure cascade', 'Compliance'],
    image: '/work-cards/gmp-hvac-system.png',
    imageAlt: 'GMP HVAC system card with cleanroom model and glowing airflow paths',
    accent: '#5ecdf1',
    imagePosition: '50% 55%',
    variant: 'hvac',
  },
  {
    id: 'cubesat-thermal',
    number: '06',
    title: 'CubeSat Thermal',
    kicker: 'Simulate. Stabilize. Survive.',
    summary: 'Thermal viewer for CubeSat orbit conditions.',
    details: ['Component-level thermal field visualization', 'Sunlight and eclipse orbit controls', 'COMSOL-style temperature reasoning in a browser interface'],
    tags: ['COMSOL', 'Orbit analysis', 'Thermal model'],
    image: '/work-cards/cubesat-thermal.png',
    imageAlt: 'CubeSat thermal card with satellite model, heat map grid, and temperature legend',
    accent: '#4b7cff',
    imagePosition: '50% 57%',
    variant: 'thermal',
  },
]

export type SupervisorFeedback = {
  id: string
  company: string
  companyLogo: string
  companyLogoAlt: string
  quote: string
  personName: string
  personTitle: string
  organization: string
  portrait: string
  tags: string[]
}

export const supervisorFeedback: SupervisorFeedback[] = [
  {
    id: 'ips',
    company: 'IPS-Integrated Project Services',
    companyLogo: '/testimonials/ips-logo.png',
    companyLogoAlt: 'IPS-Integrated Project Services logo',
    quote:
      'Debaprashad gained a decent amount of exposure to the consulting engineering world through his co-op term at IPS. He was able to sit in design and construction meetings, perform HVAC calculations and review equipment shop drawings. Debaprashad displayed exceptional communication skills throughout his term, and gained a substantial amount of knowledge and experience from this co-op term.',
    personName: 'Danial Fazal, P.Eng',
    personTitle: 'Group Lead, Mechanical Engineering',
    organization: 'IPS-Integrated Project Services',
    portrait: '/testimonials/danial-fazal.png',
    tags: ['HVAC Calculations', 'Shop Drawings', 'Communication', 'Design Meetings'],
  },
  {
    id: 'trimac',
    company: 'TriMac Engineering',
    companyLogo: '/testimonials/trimac-logo.png',
    companyLogoAlt: 'TriMac Engineering logo',
    quote:
      'It was a pleasure working with Debaprashad for his second engineering co-op work term through summer 2024. Deb demonstrated himself to be a quick learner, able to take instruction and complete tasks as required. Deb showed enthusiasm and good work ethic while performing the duties of his position. Deb learned a lot through this work term experience. We wish him well as he continues his studies.',
    personName: 'Joel MacNeil, P.Eng',
    personTitle: 'Owner',
    organization: 'TriMac Engineering',
    portrait: '/testimonials/joel-macneil.png',
    tags: ['Quick Learner', 'Work Ethic', 'AutoCAD', 'Mechanical Drawings'],
  },
  {
    id: 'bmt',
    company: 'BMT Canada',
    companyLogo: '/testimonials/bmt-logo.png',
    companyLogoAlt: 'BMT Canada logo',
    quote:
      "Deb took on one of the hardest tasks of the term: building and training a machine learning model for predictive maintenance. He was able to get results in a very short amount of time. When we couldn't help him with providing data, he came up with his own solution. He built a virtual twin of the diesel engine and simulated data. That was very impressive. Overall, Deb showed a strong mix of curiosity, independence, and problem-solving skill which made a real impact during his term.",
    personName: 'Treena Scurlock, P.Eng',
    personTitle: 'Principal Marine Systems Engineering Consultant',
    organization: 'BMT Canada',
    portrait: '/testimonials/treena-scurlock.png',
    tags: ['Machine Learning', 'Predictive Maintenance', 'Digital Twin', 'Problem Solving'],
  },
]

export type EngineScenario = {
  id: string
  label: string
  summary: string
  health: number
  anomaly: number
  rul: number
  recommendation: string
  metrics: {
    exhaustTemp: string
    fuelRate: string
    vibration: string
    coolant: string
  }
  series: {
    exhaust: number[]
    fuel: number[]
    vibration: number[]
    health: number[]
  }
}

export const engineScenarios: EngineScenario[] = [
  {
    id: 'healthy',
    label: 'Healthy',
    summary: 'Stable load response with low vibration and no clustered residual drift.',
    health: 94,
    anomaly: 8,
    rul: 1260,
    recommendation: 'Continue normal inspection cadence. Keep the current sensor baseline as the reference window.',
    metrics: {
      exhaustTemp: '468 deg C',
      fuelRate: '194 g/kWh',
      vibration: '2.1 mm/s',
      coolant: '88 deg C',
    },
    series: {
      exhaust: [452, 456, 455, 460, 462, 458, 464, 466, 461, 468, 466, 470],
      fuel: [198, 196, 195, 194, 196, 193, 194, 192, 194, 193, 191, 194],
      vibration: [1.8, 2.0, 1.9, 2.1, 2.0, 2.2, 2.1, 2.0, 2.1, 2.0, 2.2, 2.1],
      health: [96, 95, 96, 95, 95, 94, 95, 94, 94, 94, 93, 94],
    },
  },
  {
    id: 'turbo',
    label: 'Turbo Fouling',
    summary: 'Rising exhaust temperature and fuel burn indicate reduced compressor efficiency.',
    health: 92,
    anomaly: 18,
    rul: 612,
    recommendation: 'Inspect and clean the turbocharger, verify EGR operation, and schedule service within 120 hours.',
    metrics: {
      exhaustTemp: '482 deg C',
      fuelRate: '198 g/kWh',
      vibration: '2.4 mm/s',
      coolant: '88 deg C',
    },
    series: {
      exhaust: [458, 462, 459, 468, 471, 466, 475, 478, 474, 480, 481, 482],
      fuel: [194, 196, 195, 197, 198, 196, 199, 198, 197, 199, 198, 198],
      vibration: [2.0, 2.1, 2.0, 2.3, 2.1, 2.4, 2.2, 2.4, 2.3, 2.5, 2.4, 2.4],
      health: [91, 92, 90, 93, 91, 92, 93, 91, 92, 91, 92, 92],
    },
  },
  {
    id: 'coolant',
    label: 'Coolant Leak',
    summary: 'Coolant temperature and pressure residuals diverge under sustained load.',
    health: 64,
    anomaly: 74,
    rul: 220,
    recommendation: 'Reduce load, inspect coolant circuit, and verify pump/seal integrity before redeployment.',
    metrics: {
      exhaustTemp: '504 deg C',
      fuelRate: '203 g/kWh',
      vibration: '2.5 mm/s',
      coolant: '103 deg C',
    },
    series: {
      exhaust: [460, 464, 468, 472, 481, 484, 491, 495, 498, 501, 504, 504],
      fuel: [194, 196, 197, 198, 199, 201, 201, 202, 204, 203, 204, 203],
      vibration: [2.0, 2.0, 2.1, 2.2, 2.3, 2.2, 2.4, 2.5, 2.4, 2.6, 2.5, 2.5],
      health: [93, 88, 84, 80, 76, 73, 70, 68, 66, 65, 64, 64],
    },
  },
  {
    id: 'injector',
    label: 'Injector Misfire',
    summary: 'Combustion imbalance produces vibration spikes and fuel-rate instability.',
    health: 58,
    anomaly: 82,
    rul: 165,
    recommendation: 'Flag cylinder balance test. Inspect injector timing and nozzle condition.',
    metrics: {
      exhaustTemp: '489 deg C',
      fuelRate: '224 g/kWh',
      vibration: '5.8 mm/s',
      coolant: '91 deg C',
    },
    series: {
      exhaust: [465, 473, 462, 488, 470, 493, 474, 501, 478, 496, 484, 489],
      fuel: [198, 206, 200, 217, 204, 221, 207, 224, 209, 226, 214, 224],
      vibration: [2.1, 3.8, 2.7, 5.4, 3.2, 5.8, 3.6, 6.1, 4.0, 5.7, 4.3, 5.8],
      health: [91, 84, 78, 72, 68, 65, 63, 61, 60, 58, 57, 58],
    },
  },
  {
    id: 'drift',
    label: 'Sensor Drift',
    summary: 'Signals remain physically plausible but residual error grows over time.',
    health: 76,
    anomaly: 54,
    rul: 520,
    recommendation: 'Run drift compensation, compare redundant channels, and recalibrate before labeling a fault.',
    metrics: {
      exhaustTemp: '481 deg C',
      fuelRate: '199 g/kWh',
      vibration: '2.4 mm/s',
      coolant: '96 deg C',
    },
    series: {
      exhaust: [452, 456, 458, 461, 464, 466, 469, 473, 475, 478, 480, 481],
      fuel: [195, 196, 196, 197, 198, 198, 199, 199, 200, 200, 201, 199],
      vibration: [2.0, 2.1, 2.1, 2.2, 2.1, 2.2, 2.3, 2.3, 2.3, 2.4, 2.4, 2.4],
      health: [94, 92, 90, 88, 86, 84, 82, 80, 79, 78, 77, 76],
    },
  },
]

export type HvacOption = {
  id: string
  label: string
  note: string
  description: string
  ach: string
  pressure: string
  energy: string
  capex: string
  opex: string
  scores: {
    compliance: number
    flexibility: number
    energy: number
    time: number
    cost: number
  }
  bullets: string[]
  recommendation: string
}

export const hvacOptions: HvacOption[] = [
  {
    id: 'dedicated',
    label: 'Dedicated New System',
    note: '$300k / over cap',
    description: 'A separate HVAC system for the fill-line segment with the highest isolation and control, but it exceeds the $200k project cap.',
    ach: '20+ ACH',
    pressure: 'Lowest risk',
    energy: 'Isolated',
    capex: '$300k',
    opex: 'Higher',
    scores: {
      compliance: 94,
      flexibility: 70,
      energy: 58,
      time: 38,
      cost: 28,
    },
    bullets: ['Separate air handling path', 'Dedicated HEPA filtration', 'Strongest contamination control', 'Requires added ductwork, wiring, and space'],
    recommendation: 'Technically strongest, but rejected for this project because the estimated $300k cost exceeded the $200k budget cap.',
  },
  {
    id: 'modify',
    label: 'Modify Existing',
    note: '$150k / feasible',
    description: 'A retrofit path that reuses existing capacity while adding components and controls for the fill-line clean area.',
    ach: '20 ACH',
    pressure: 'Medium risk',
    energy: 'Shared load',
    capex: '$150k',
    opex: 'Moderate',
    scores: {
      compliance: 78,
      flexibility: 86,
      energy: 72,
      time: 68,
      cost: 62,
    },
    bullets: ['Reuse viable infrastructure', 'Add filtration and controls', 'Shorter install window than new system', 'Higher integration and interference risk'],
    recommendation: 'Within budget at roughly $150k, but it carries more operational risk because the existing HVAC system must absorb the added load.',
  },
  {
    id: 'enhance',
    label: 'Enhance Existing',
    note: '$100k / recommended',
    description: 'The memorandum recommendation: optimize and upgrade existing components and controls to serve the fill line within the budget cap.',
    ach: '20 ACH',
    pressure: 'Validated path',
    energy: 'Efficient',
    capex: '$100k',
    opex: 'Lowest',
    scores: {
      compliance: 82,
      flexibility: 72,
      energy: 88,
      time: 84,
      cost: 92,
    },
    bullets: ['Upgrade and optimize existing components', 'Verify added 6,667 CFM load', 'Improve controls, sensors, and monitoring', 'Commission and document performance'],
    recommendation: 'Recommended in the memorandum because it meets compliance intent, preserves operations, and stays well below the $200k budget cap.',
  },
]

export const contactLinks = {
  email: 'debaprashadbhowmik5314@gmail.com',
  phone: '902-802-0129',
  linkedin: 'https://www.linkedin.com/in/debaprashad-bhowmik-74598a274/',
  github: 'https://github.com/debaprashadbhowmik',
  resume: '/Debaprashad-Bhowmik-Resume.pdf',
}
