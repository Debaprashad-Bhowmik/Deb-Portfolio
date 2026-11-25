export const parts = {
  bag: {
    title: 'Fluid bag',
    description: 'A surgical bag hangs from a stand and feeds simulated blood to the pump.',
    detail: 'The team used the bag supplied with the prosthetic kit.',
    center: [-4.45, 2.48, -1.35],
    span: 4.0,
  },
  pump: {
    title: 'Diaphragm pump',
    description: 'The 12 V pump draws fluid from the bag and sends it through the tubing to the arm.',
    detail: 'The Arduino switches the pump through a relay.',
    center: [-4.38, 0.72, 1.42],
    span: 3.1,
  },
  transducer: {
    title: 'Pressure transducer',
    description: 'A branch in the supply line lets the transducer measure pressure inside the tubing.',
    detail: 'This is a separate measurement from the pressure applied to the arm.',
    center: [-2.92, 0.88, 1.48],
    span: 2.9,
  },
  flow: {
    title: 'Flow sensor',
    description: 'An inline sensor measures how quickly fluid moves toward the prosthetic.',
    detail: 'The team checked its readings against a known volume collected over time.',
    center: [-1.91, 0.65, 1.5],
    span: 2.8,
  },
  arm: {
    title: 'Practice arm',
    description: 'The translucent prosthetic has a shoulder, elbow, and hand. Simulated fluid runs through an internal line to the practice site.',
    detail: 'The team used it to support direct pressure, wound packing, and tourniquet practice.',
    center: [-0.25, 1.05, -0.36],
    span: 8.55,
  },
  pads: {
    title: 'Five pressure pads',
    description: 'Five thin-film sensors held against the arm measure pressure around the practice site.',
    detail: 'The final prototype used a clear wrap to secure and protect the sensors.',
    center: [-0.17, 1.42, -0.08],
    span: 3.15,
  },
  controller: {
    title: 'Arduino and LEDs',
    description: 'The Arduino reads the sensor signals, sends data to the laptop, and switches the pump. LEDs show the training state at a glance.',
    detail: 'The laptop receives the readings over a USB serial connection.',
    center: [2.63, 0.48, 1.55],
    span: 4.8,
  },
  screen: {
    title: 'Instructor display',
    description: 'The MATLAB interface plots applied pressure, internal pressure, and flow so the instructor can see the response as it happens.',
    detail: 'The numbers on this 3D screen follow the web demo below.',
    center: [3.26, 1.25, -1.65],
    span: 4.15,
  },
} as const

export type PartId = keyof typeof parts

export const views = {
  overview: {
    title: 'Full system',
    heading: 'From pump to feedback',
    description: 'The pump moves fluid through the practice arm. Sensors track the response and send it to the instructor’s screen.',
    parts: Object.keys(parts) as PartId[],
  },
  fluid: {
    title: 'Fluid path',
    heading: 'Follow the simulated blood',
    description: 'The bag feeds the pump. After the pump, a pressure branch and an inline flow sensor measure the supply before it reaches the arm.',
    parts: ['bag', 'pump', 'transducer', 'flow', 'arm'] as PartId[],
  },
  sensors: {
    title: 'Sensor network',
    heading: 'See what the sensors measure',
    description: 'The tubing sensors measure internal pressure and flow. Five pads on the arm measure pressure applied at the practice site.',
    parts: ['transducer', 'flow', 'pads', 'controller'] as PartId[],
  },
  feedback: {
    title: 'Feedback display',
    heading: 'See the readings reach the instructor',
    description: 'The Arduino sends sensor readings to the laptop. The LEDs provide immediate feedback, while the screen shows how each reading changes over time.',
    parts: ['controller', 'screen'] as PartId[],
  },
} as const

export type ViewId = keyof typeof views
export type Telemetry = {
  pressure: number
  flow: number
  status: string
}
