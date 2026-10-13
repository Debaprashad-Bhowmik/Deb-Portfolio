// Explanatory, illustrative obstacle scenario. No values below are runtime results.
export type ReplayPresentation = {
  accent: string; title: string; input: string; output: string; boundary: string;
  payload: [string, string][]; pins: string[]; memory: string; memoryMode: number;
  roles: number[]; prediction: string; learning: string;
}
export const replayPresentation: ReplayPresentation[] = [
  { accent:'#148e8d', title:'Turn the world into evidence.', input:'Environment observation', output:'Structured perception', boundary:'Observation is evidence, not permission to act.', payload:[['event','route_blocked'],['source','environment'],['provenance','observed']], pins:['Belief'], memory:'New observation enters recent context. No historical recall yet.', memoryMode:0, roles:[], prediction:'Observe first. No forecast has been requested.', learning:'Capture an observation; the action outcome is still unknown.' },
  { accent:'#148e8d', title:'Update one shared state.', input:'Structured observation', output:'Blackboard state update', boundary:'One reducer owns state updates; advisers cannot write it directly.', payload:[['event','observation_update'],['owner','Blackboard reducer'],['belief','route is blocked']], pins:['Belief','Goals'], memory:'Live state changes. Historical memory remains a separate source.', memoryMode:0, roles:[], prediction:'The world model will read the updated state through a snapshot.', learning:'Retain the observation’s source for later attribution.' },
  { accent:'#a86317', title:'Freeze a coherent thinking cycle.', input:'Current Blackboard state', output:'Immutable cycle snapshot', boundary:'Every adviser uses the same pinned state and version references.', payload:[['cycle','illustrative cycle'],['snapshot','immutable'],['versions','pinned together']], pins:['Belief','Goals','Candidates','Memory','World model','Policy','Skills'], memory:'Pin the memory version alongside state, policy and skills.', memoryMode:1, roles:[], prediction:'Pin the world-model version before asking for candidate forecasts.', learning:'Version references keep later advice and outcomes traceable.' },
  { accent:'#ad377b', title:'Recall relevant observed experience.', input:'Memory interface query', output:'Bounded historical evidence', boundary:'Predicted futures are never stored as observed history.', payload:[['query','similar blockage'],['recall','bounded evidence'],['source','observed history']], pins:['Memory','Belief'], memory:'Retrieve a relevant past event through the bounded recall interface.', memoryMode:2, roles:[0], prediction:'Historical evidence describes what happened, not what must happen next.', learning:'Keep provenance attached when evidence is recalled.' },
  { accent:'#b56017', title:'Predict what each option could do.', input:'Snapshot + supplied candidates', output:'Fresh candidate forecasts', boundary:'Dynamics predicts consequences; value and risk are judged separately.', payload:[['candidate','inspect blockage'],['forecast','possible outcomes'],['freshness','check snapshot pins']], pins:['World model','Candidates','Goals'], memory:'Recall may inform context; a forecast remains prospective evidence.', memoryMode:1, roles:[2], prediction:'Compare illustrative inspect / retry branches. Curves show alternatives, not scores.', learning:'Forecasts are proposals. Learning needs actual outcomes.' },
  { accent:'#ad377b', title:'Ask the past for advice.', input:'Retrieved historical evidence', output:'Role-tagged Past advice', boundary:'Scheduler, router, guard and freshness gates constrain the job.', payload:[['role','Past'],['evidence','observed history'],['output','historical advice']], pins:['Memory','Candidates','Policy'], memory:'Observed history travels with its evidence references into a Past job.', memoryMode:2, roles:[0], prediction:'Past advice is kept distinct from prospective advice.', learning:'An adviser’s recommendation is not an execution receipt.' },
  { accent:'#b56017', title:'Ask the future for advice.', input:'Candidate forecasts + uncertainty', output:'Role-tagged Future advice', boundary:'Future advice uses supplied candidates and the same cycle snapshot.', payload:[['role','Future'],['input','candidate forecasts'],['uncertainty','retained']], pins:['World model','Candidates','Policy'], memory:'Future advice does not become historical memory just by being generated.', memoryMode:1, roles:[2], prediction:'Prospective advice compares possible consequences while preserving uncertainty.', learning:'Compare advice with the outcome later; do not learn from predictions as facts.' },
  { accent:'#8053a8', title:'Decide how to decide.', input:'Meta context', output:'Cached arbitration guidance', boundary:'One optional meta level advises arbitration; it cannot command execution.', payload:[['role','Meta guidance'],['scope','arbitration advice'],['authority','advisory only']], pins:['Goals','Policy','Candidates'], memory:'Meta guidance can use context without rewriting original evidence.', memoryMode:1, roles:[3,4,5], prediction:'Guide how to weigh evidence and prospective advice.', learning:'Arbitration guidance is separate from a learned, released skill.' },
  { accent:'#718513', title:'Choose an available behavior.', input:'Coherent cycle + advice', output:'Merged typed selection', boundary:'Choose among supplied candidates. Selection still cannot authorize an action.', payload:[['candidate','inspect blockage'],['choice','typed selection'],['command','not authorized']], pins:['Candidates','Goals','Skills'], memory:'Relevant experience informs the choice; repeated clutter is not the goal.', memoryMode:2, roles:[1], prediction:'The illustrative choice is to inspect rather than repeat a blocked movement.', learning:'Keep the choice linked to its evidence for outcome attribution.' },
  { accent:'#148e8d', title:'Check the choice against now.', input:'Merged choice', output:'Current-state decision', boundary:'Validity and safety must hold now. Confidence alone grants no authority.', payload:[['checks','current validity'],['state','revalidate now'],['confidence','not permission']], pins:['Belief','Policy','Candidates'], memory:'Historical success cannot override current-state validity.', memoryMode:1, roles:[1], prediction:'Check whether the proposed action remains valid after conditions change.', learning:'Validation here checks an action, not promotion of a new skill.' },
  { accent:'#148e8d', title:'Admit one controlled command.', input:'Control-arbiter envelope', output:'Admitted execution command', boundary:'Arbiter → envelope → queue → admission → execution authority.', payload:[['owner','control arbiter'],['envelope','checked command'],['admission','required']], pins:['Belief','Policy','Skills'], memory:'Execution will produce observed feedback, not an assumed success.', memoryMode:0, roles:[], prediction:'Possible outcomes give way to what the environment actually reports.', learning:'Wait for the actual receipt before attributing an outcome.' },
  { accent:'#ad377b', title:'Turn an outcome into a proposal.', input:'Actual receipt + provenance', output:'Candidate learning artifact', boundary:'Independent validation gates promotion, restriction, rejection or rollback.', payload:[['source','actual receipt'],['artifact','candidate skill'],['release','independent validation']], pins:['Memory','Skills','Policy'], memory:'Observed experience supplies attribution and a possible reusable skill.', memoryMode:3, roles:[], prediction:'Compare expected consequences with actual receipts; retain uncertainty.', learning:'The illustration reaches a release gate. It does not claim a skill was promoted.' },
]

// Curated from canonical Notion pages 03, 11, 30 and 31 (v1.10).
// Snippets are explanatory pseudocode, not production APIs or observed execution.
export type ReplayContract = {
  context: [string, string, string]; contextNote: string;
  judgment: [string, string, string]; judgmentNote: string;
  record: [string, string][]; code: string[];
}
export const replayContracts: ReplayContract[] = [
  {
    context:['Sensor/API','Extract','Track'],
    contextNote:'Extract entities and features into live structured state. Recent-event summaries run beside this path; they do not replace it.',
    judgment:['Observed','Encoded','Evidence'], judgmentNote:'Perception supplies facts. It does not select a behavior or grant permission.',
    record:[['source','Environment adapter'],['evidence','OBSERVED'],['state','Structured features'],['outcome','Not known yet']],
    code:['const event = observe();','const state = encode(event);','emit({','  kind: "observation",','  provenance: "OBSERVED",','  state','});'],
  },
  {
    context:['Event bus','Reducer','Blackboard'],
    contextNote:'Typed events converge on one state writer. Advisers publish results; the reducer decides how canonical state changes.',
    judgment:['Event','Reduce','Publish'], judgmentNote:'This is deterministic state handling, not an AI vote. Live beliefs and recent context remain distinct.',
    record:[['event','Observation update'],['writer','Blackboard reducer'],['belief','Route blocked'],['history','Source retained']],
    code:['const update = typed(event);','const next = reduce(','  blackboard, update',' );','publish(next);','// one canonical writer'],
  },
  {
    context:['Live state','Pin versions','Cycle'],
    contextNote:'The cycle pins memory, world model, policy and skill-registry versions. An adviser cannot silently mix newer learning into an older decision.',
    judgment:['Snapshot','Same pins','Advisers'], judgmentNote:'Past and Future read the same immutable cycle but use different evidence sources.',
    record:[['cycle_id','Shared decision cycle'],['memory_version','Pinned'],['world_model_version','Pinned'],['policy / skills','Pinned together']],
    code:['const cycle = freeze({','  state: blackboard,','  memory_version,','  world_model_version,','  policy_version,','  skill_registry_version','});'],
  },
  {
    context:['Query','Bound recall','Evidence'],
    contextNote:'Recall returns relevant history, validated rules and reliability context. A generated forecast cannot masquerade as an observed event.',
    judgment:['History','Reliability','Past'], judgmentNote:'What actually worked before? Similarity alone does not prove that the old action is valid now.',
    record:[['evidence_ids','Linked observed events'],['memory_version','Cycle-pinned'],['reliability','Kept with source'],['provenance','Observed ≠ simulated']],
    code:['const history = recall({','  query: "blocked route",','  version:','    cycle.memory_version,','  bounded: true','});','retain(history.provenance);'],
  },
  {
    context:['Candidates','Dynamics','Freshness'],
    contextNote:'Predict distributions for supplied actions across immediate, tactical and strategic horizons. Check model and cycle compatibility before use.',
    judgment:['Consequences','Value / risk','Future'], judgmentNote:'The world model predicts what happens. A separate goal/value/risk layer judges whether that outcome is desirable.',
    record:[['prediction_id','Forecast linkage'],['candidate_set','Supplied options'],['model_version','Cycle-pinned'],['uncertainty','Retained by horizon']],
    code:['const forecast = predict({','  cycle, candidates,','  horizons: [','    "now", "tactical",','    "strategic"','  ]','});','checkFreshness(forecast);'],
  },
  {
    context:['Past job','Guard','Fresh result'],
    contextNote:'Historical evidence enters a role-tagged scheduled job. The result is routed to its consumer only after freshness checks.',
    judgment:['History','Rules','Past advice'], judgmentNote:'Past ranks supplied behaviors using historical outcomes, validated rules and memory reliability.',
    record:[['reasoning_job_id','Scheduled request'],['role','PAST'],['evidence_ids','Historical support'],['consumer','Action arbitration']],
    code:['const job = schedule({','  role: "PAST",','  cycle, candidates,','  evidence: history','});','acceptFresh(job.result);'],
  },
  {
    context:['Forecasts','Value / risk','Advice'],
    contextNote:'Future consumes forecasts, goals and prediction reliability. Its prospective recommendation stays separate from historical evidence.',
    judgment:['Forecast','Risk','Future advice'], judgmentNote:'Which supplied behavior has the strongest prospective value? Keep uncertainty attached; advice cannot invent a missing action.',
    record:[['role','FUTURE'],['prediction_id','Candidate forecast'],['goal context','Same pinned cycle'],['confidence','Not execution authority']],
    code:['const job = schedule({','  role: "FUTURE",','  cycle, candidates,','  forecasts, valueRisk,','  reliability','});','acceptFresh(job.result);'],
  },
  {
    context:['Conflict','Meta strategy','Cache gate'],
    contextNote:'Compatible cached guidance can advise arbitration. Exactly one meta layer exists; missing guidance must not block Middle indefinitely.',
    judgment:['Meta-Past','Meta-Future','Meta-Middle'], judgmentNote:'Meta-Past examines arbitration history; Meta-Future predicts strategy effects; Meta-Middle chooses how to decide, not a motor command.',
    record:[['meta candidates','Separate strategy set'],['context','Adviser conflict'],['guidance','Fresh / compatible cache'],['authority','Advisory only']],
    code:['const strategies = [','  "TRUST_PAST",','  "BLEND_OR_REWEIGHT",','  "GATHER_INFORMATION",','  "ESCALATE_FAST"',' ];','guideArbitration(strategies);'],
  },
  {
    context:['Advice','Middle','Merge'],
    contextNote:'Merge fresh adviser output with deadline/fallback results. Both paths still pass the same final current-state validity gate.',
    judgment:['Past advice','Future advice','Middle'], judgmentNote:'Middle uses goals, uncertainty, skill reliability and valid meta guidance. It may choose a third supplied candidate that neither adviser ranked first.',
    record:[['candidate order','Stored with set version'],['raw answer','Typed judgment'],['selection rule','Recorded separately'],['command','Not authorized yet']],
    code:['const choice = select({','  cycle, candidates,','  past, future, meta,','  degradedMode','});','assertSupplied(choice);','recordSelection(choice);'],
  },
  {
    context:['Choice','Current state','Validity'],
    contextNote:'Recheck target, legality, capability, constraints, competence and compatible versions against now, including timeout/fallback selections.',
    judgment:['Target','Constraints','Valid now?'], judgmentNote:'A high-confidence judgment or historical success cannot bypass hard validity. A stale or invalid choice returns to repair or safe hold.',
    record:[['decision_id','Selection linkage'],['target / legality','Current-state checks'],['capability / safety','Hard constraints'],['on invalid','Repair / safe hold']],
    code:['const valid = revalidate({','  choice, currentState,','  capability, constraints,','  skillStatus, versions','});','if (!valid) safeHold();'],
  },
  {
    context:['Envelope','Admission','Authority'],
    contextNote:'Dispatch checks owner lease, execution epoch, expiry and current constraints. Cancellation or revocation invalidates stale queued commands.',
    judgment:['Owner lease','Epoch / expiry','Dispatch'], judgmentNote:'Only the single Execution Authority writes to the environment. An uncertain physical effect must be reconciled before retrying.',
    record:[['command_id','Idempotency linkage'],['owner / epoch','Active control scope'],['expiry / versions','Admission checks'],['receipt','Actual result required']],
    code:['const command = envelope({','  action_id, ownerLease,','  execution_epoch,','  versions, expiry','});','if (admit(command)) {','  execute(command);','}'],
  },
  {
    context:['Receipt','Attribution','Candidate'],
    contextNote:'Journal raw receipts first; join them into outcome windows later. Missing, censored or pending outcomes never automatically count as failures.',
    judgment:['Observed','Derived credit','Validate'], judgmentNote:'Observed receipts and derived credit stay distinct. The compiler proposes a skill; independent evaluation decides whether it may be released.',
    record:[['receipt / action','Joined lineage'],['closure','May remain PENDING'],['credit','DERIVED, not raw fact'],['artifact','Candidate until validated']],
    code:['journal.append(receipt);','const outcome = attribute({','  receipt, decision','});','const skill = propose(outcome);','validateIndependently(skill);','// promote / reject / rollback'],
  },
]
