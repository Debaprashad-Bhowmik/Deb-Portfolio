// Curated canonical v1.10 graph, derived from the three Miro Mermaid sources.
// Counts are diagram instances, not deployed components. Original workspace URLs are excluded.
export type CanonicalNode = { id: string; label: string; kind: string; group: string; view: string; status: string }
export type CanonicalEdge = { from: string; to: string; label: string; conditional: boolean; bidirectional: boolean; source: string }
export type CanonicalView = { id: string; title: string; nodes: CanonicalNode[]; edges: CanonicalEdge[]; groups: { id: string; label: string }[] }
export const canonicalGraph: CanonicalView[] = [
  {
    "id": "learning",
    "title": "3 — Learning Architecture v1.10 CANONICAL",
    "nodes": [
      {
        "id": "TITLE",
        "label": "LEARNING ARCHITECTURE v1.10 · Observed reality → temporal credit → memory / prediction / arbitration / rules / skills · Slow reasoning compiles downward only after execution and outcome validation",
        "kind": "code",
        "group": "general",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PEND",
        "label": "Pending Decision Record · original cycle + selected candidate + adviser/meta IDs · action/skill/plan/reasoning/prediction IDs + versions",
        "kind": "code",
        "group": "INPUT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RECEIPT",
        "label": "Execution Receipt · actual executed behavior + start/end + interrupt/cancel + environment result",
        "kind": "code",
        "group": "INPUT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "LATER",
        "label": "Later Belief Snapshot",
        "kind": "code",
        "group": "INPUT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PRED",
        "label": "Prediction Snapshots · candidate-conditioned + horizon + uncertainty + calibration",
        "kind": "world",
        "group": "INPUT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "ACCEPT",
        "label": "Accepted Plan-Commit Components · tactical / strategic",
        "kind": "decision",
        "group": "INPUT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "GOAL",
        "label": "Pinned Root Mission + Authorized Goals / Priorities",
        "kind": "decision",
        "group": "INPUT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CAP",
        "label": "Environment Capability Schema",
        "kind": "code",
        "group": "INPUT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SCHED",
        "label": "SAME Canonical Cognitive Scheduler · learning jobs share live scheduler authority",
        "kind": "code",
        "group": "INPUT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "BUDGET",
        "label": "Background Compute / Latency Budget · idle / between episodes / bounded priority",
        "kind": "code",
        "group": "INPUT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "ASM",
        "label": "Transition Assembler · join decision/action/skill/plan/reasoning/prediction IDs",
        "kind": "code",
        "group": "CREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "TRANS",
        "label": "Observed Transition · OBSERVED provenance",
        "kind": "code",
        "group": "CREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OUT",
        "label": "Outcome Evaluator · independent success tests + original mission snapshot · COMPLETE / INTERRUPTED / CENSORED / UNKNOWN / PENDING",
        "kind": "code",
        "group": "CREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "WINDOW",
        "label": "Variable Outcome / Trajectory Window · handles delayed and multi-step effects",
        "kind": "code",
        "group": "CREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "TC",
        "label": "Temporal Credit Assignment · variable-duration returns + option/goal windows · DERIVED descriptive credit; causal benefit needs controlled support",
        "kind": "code",
        "group": "CREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "EXP",
        "label": "Canonical Observed Experience · stable experience_id; observed fields remain OBSERVED · credit/rewards/targets remain DERIVED with confidence",
        "kind": "memory",
        "group": "CREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OBS",
        "label": "Observed Experience Archive · deployed truth first, before long-term salience decisions",
        "kind": "memory",
        "group": "ARCH",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SIM",
        "label": "Training / Simulated Archive",
        "kind": "memory",
        "group": "ARCH",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CF",
        "label": "Counterfactual Archive",
        "kind": "memory",
        "group": "ARCH",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SYN",
        "label": "Synthetic Archive · optional research only",
        "kind": "memory",
        "group": "ARCH",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OUTBOX",
        "label": "Durable Idempotent Delivery Outbox · delivery keyed by experience_id",
        "kind": "code",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SALG",
        "label": "Memory Salience Gate · novelty/surprise + attributed reward/cost + failure + prediction error · strategic importance + rarity + repetition + contradiction",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "HWRITE",
        "label": "Hindsight Episodic / Semantic Writer",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MWRITE",
        "label": "MemOS Procedural Trace Writer",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "STATS",
        "label": "Historical Values / Competence Learner · context Beta-Binomial counts + empirical discounted returns",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "BCONS",
        "label": "Bridge Consolidation · contextual performance + salience + contradictions",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "H",
        "label": "Hindsight · episodic + semantic",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "M",
        "label": "MemOS 2.0 · procedural",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MB",
        "label": "MemoryBridge / CompositeMemory · NOT a third memory store",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "M2H",
        "label": "MemOS → Hindsight · performance-salience record · OBSERVED only",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "H2M",
        "label": "Hindsight → MemOS · procedure / rule / skill candidate · DERIVED provenance",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SRC",
        "label": "Cited-Source + Provenance + Evidence Validation",
        "kind": "code",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CW",
        "label": "Candidate Writeback · normal rule / skill validation still required",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PROV",
        "label": "Provenance + Source Lineage",
        "kind": "code",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "DED",
        "label": "Context Filtering + Deduplication",
        "kind": "code",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CONTR",
        "label": "Contradictions + Exceptions Exposed",
        "kind": "code",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MREL",
        "label": "Memory Reliability + Context Match",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RECALL",
        "label": "Bounded Recall Assembly · episodes + procedures + stats + validated rules · exceptions + contradictions + source IDs",
        "kind": "memory",
        "group": "MEM",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MFM",
        "label": "OPTIONAL Memory Foundation Model · experimental structural memory / event model · may train on broader data but keeps DERIVED/SIMULATED provenance · never replaces Hindsight, MemOS, or observed truth",
        "kind": "deep",
        "group": "general",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "KNOWN",
        "label": "Known Deterministic Mechanics / Rules",
        "kind": "code",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PERR",
        "label": "Prediction Error · prediction snapshot vs later OBSERVED transition · tracked by horizon/context",
        "kind": "world",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "DYN",
        "label": "Learned Uncertain Dynamics · discrete transition counts / bootstrapped continuous residuals · observation masks + hidden-state uncertainty",
        "kind": "world",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CAL",
        "label": "Calibration / Reliability Learner · held-out Brier/log scores + residual calibration · context/horizon reliability; insufficient data = UNKNOWN",
        "kind": "world",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "WM",
        "label": "Hybrid World Model · common substrate",
        "kind": "world",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "H1",
        "label": "Immediate Horizon Head",
        "kind": "world",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "H2",
        "label": "Tactical Horizon Head",
        "kind": "world",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "H3",
        "label": "Strategic Horizon Head",
        "kind": "world",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PREL",
        "label": "Prediction Reliability / Calibration",
        "kind": "world",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "WMIF",
        "label": "World Model + Calibration Candidate Package",
        "kind": "world",
        "group": "WORLD",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PLEARN",
        "label": "Past Support Learning · historical action values + patterns + validated rules · exceptions/contradictions + recency/context match + memory reliability",
        "kind": "memory",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "FLEARN",
        "label": "Future Support Learning · dynamics + horizon-specific forecast error + calibration + context reliability",
        "kind": "world",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "AEXP",
        "label": "Middle Arbitration Experience · Past/Future outputs + uncertainty + selected behavior + attributed outcome",
        "kind": "decision",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MLEARN",
        "label": "Middle Arbitration Policy Learning · constrained deterministic scorer initially · supported contextual bandit only after controlled trials",
        "kind": "decision",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MEXP",
        "label": "Meta-Arbitration Experience · conflict context + meta advisers + meta guidance + attributed outcome",
        "kind": "decision",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MPR",
        "label": "Meta-Past Reliability / Arbitration-History Learning · context-stratified strategy history + uncertainty",
        "kind": "decision",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MOP",
        "label": "Meta Outcome Predictor Learning · supervised chosen-strategy outcome/cost trials · unsupported strategies = UNKNOWN; labeled counterfactuals separate",
        "kind": "world",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MEVAL",
        "label": "Meta Counterfactual Conflict Evaluator · OBSERVED outcomes + labeled simulated alternatives",
        "kind": "decision",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MML",
        "label": "Meta-Middle Policy Learning · calibrated rule-based baseline; learned selector only after benefit",
        "kind": "decision",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "POLIF",
        "label": "Middle + Meta Policy / Reliability Candidate Package",
        "kind": "decision",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MOPIF",
        "label": "Meta Outcome Predictor Candidate Package",
        "kind": "world",
        "group": "SPEC",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PIPE",
        "label": "Job-Type Router → Service Guard → Queue → Shared Model Service · → Versioned Result Bus / Demux → Freshness / Provenance Gate",
        "kind": "code",
        "group": "MODELPIPE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "JOBOUT",
        "label": "Fresh Typed Model Result",
        "kind": "code",
        "group": "MODELPIPE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RJOB",
        "label": "Typed Rule-Induction Job · HISTORICAL / PREDICTIVE / ARBITRATION / META",
        "kind": "decision",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RSEL",
        "label": "Routine or hard / conflicting abstraction?",
        "kind": "decision",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "GRJOB",
        "label": "Routine Rule-Synthesis Job · Gemini role",
        "kind": "code",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SRJOB",
        "label": "Hard Rule-Abstraction Job · Hermes/Sol role",
        "kind": "code",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "GRES",
        "label": "Fresh Gemini Rule Proposal",
        "kind": "fast",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SRES",
        "label": "Fresh Hermes/Sol Rule Proposal",
        "kind": "deep",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RCAND",
        "label": "Candidate Rule · HYPOTHESIS only",
        "kind": "decision",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RVALID",
        "label": "Domain-Specific Objective Evidence Validator · model self-approval is insufficient",
        "kind": "code",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "LIFE",
        "label": "Rule Lifecycle Manager · CANDIDATE → VALIDATED → ACTIVE → RESTRICTED · → CONTRADICTED → DEPRECATED",
        "kind": "code",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "HR",
        "label": "Historical Rules",
        "kind": "memory",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PR",
        "label": "Predictive Rules",
        "kind": "world",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "AR",
        "label": "Arbitration Rules",
        "kind": "decision",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MR",
        "label": "Meta Rules",
        "kind": "decision",
        "group": "RULES",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "ATTR",
        "label": "Reasoning Influence + Execution Attribution · accepted proposal component + reasoning_job_id + actual execution · + observed outcome + sufficient temporal-credit confidence",
        "kind": "code",
        "group": "DIST",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RDATA",
        "label": "Outcome-Validated Reasoning Dataset · successful reasoning + failed/harmful reasoning as negative evidence",
        "kind": "memory",
        "group": "DIST",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "DDEC",
        "label": "Decision-Pattern Distillation · slow deliberation → Middle / Meta fast supporting policy",
        "kind": "decision",
        "group": "DIST",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "DSK",
        "label": "Action-Sequence Distillation · outcome-validated behavior → skill demonstrations",
        "kind": "skill",
        "group": "DIST",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "WGATE",
        "label": "Optional Adapter / Weight Training Gate · repeated diverse validated evidence + held-out/regression checks · supported training access required; never default per experience",
        "kind": "deep",
        "group": "DIST",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "WART",
        "label": "Optional Role-Specific Adapter / Weight Artifact · Past / Future / Middle specialization if supported · does not replace explicit rules or safety",
        "kind": "deep",
        "group": "DIST",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "REG",
        "label": "Validated Skill Registry · option-like record: initiation/preconditions + internal policy/program + termination · effects + parameters + dependencies + fallback + domains + reliability + OOD + maturity + version/provenance · + runtime state schema + Jev question template + operator/subskill semantics",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "COMPET",
        "label": "Contextual Skill Competence Model · sandbox + regression + real deployed outcomes",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PROG",
        "label": "Learning Progress / Competence-Gap Metrics",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CURR",
        "label": "Autonomous Curriculum · strategic usefulness + learning progress + capability/registry gaps · competence gaps + failures + prediction uncertainty + OOD + compute budget",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "DISC",
        "label": "Skill / Task Discovery",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OBJ",
        "label": "Candidate Skill Objective · goal/effect + success criterion + prerequisites + environment context",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "TRAINJOB",
        "label": "TRAIN_SKILL Background Job Proposal",
        "kind": "code",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "TENV",
        "label": "Separate Training / Validation Environment · Capability-scoped; NO live Execution Authority",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "TRAJ",
        "label": "Training Trajectory Store",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "DATA",
        "label": "Skill Dataset · sandbox trajectories + OBSERVED deployed primitive/skill traces · failures/interruption examples + transfer examples + validated reasoning demos",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "ONLINE",
        "label": "Three-Speed Online Learning Contract · FAST = current-episode state/attempt adaptation; no registry rewrite · MEDIUM = contextual stats/memory/prior updates · SLOW = generalized skill abstraction/revision",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SCJOB",
        "label": "COMPILE_OR_REVISE_SKILL Background Job · current skill version + successes + failures + counterexamples + memory/stats",
        "kind": "code",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SCOMP",
        "label": "Fresh LLM Skill-Compiler Proposal · identify invariants vs variables · generalize across contexts; hypothesis only",
        "kind": "deep",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SDEF",
        "label": "Generalized Skill Definition · goal + preconditions + relevant state fields · operator/subskill vocabulary + expected effects · recovery + termination + OOD",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RTCON",
        "label": "Jev Skill Runtime Contract · state projection schema + typed question template · candidate semantics + event-trigger conditions",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "VCAND",
        "label": "Versioned Candidate Skill Definition · CANDIDATE exists beside ACTIVE · never overwrites proven version before validation",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "TRAIN",
        "label": "Training Orchestrator · chooses useful alternative / combination",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "METHOD",
        "label": "Training method(s)",
        "kind": "decision",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "BC",
        "label": "Imitation / Behavior Cloning · optional",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RL",
        "label": "Model-Free RL · optional",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "DREAM",
        "label": "Dreamer / World-Model RL · optional",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CP",
        "label": "Candidate Skill Policy / Program",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "ABS",
        "label": "Abstract Skill Representation",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "TRANSFER",
        "label": "Transfer Adapter · abstract skill + target Capability Schema",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "COMP",
        "label": "Skill Composition Request · goal + skills + preconditions/effects + fresh forecasts",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CJOB",
        "label": "COMPOSE_SKILL Job",
        "kind": "code",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CSEL",
        "label": "Routine or complex / novel?",
        "kind": "decision",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CGJOB",
        "label": "Routine Composition Model Job · Gemini role",
        "kind": "code",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CSJOB",
        "label": "Complex Composition Model Job · Hermes/Sol role",
        "kind": "code",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CRESG",
        "label": "Fresh Routine Composite Proposal",
        "kind": "fast",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CRESS",
        "label": "Fresh Complex Composite Proposal",
        "kind": "deep",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "CCP",
        "label": "Candidate Composite Skill · ordering + termination + handoffs + dependencies + fallback",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "HAND",
        "label": "Composition Handoff Checks · preconditions/effects align + termination→initiation · dependencies + risky handoff forecast + fallback",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "NEW",
        "label": "New-Skill Validation · success + robustness + noise/interruption + OOD + held-out variants + domain checks",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "REGRESS",
        "label": "Old-Skill Regression / Catastrophic-Forgetting Test",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PROM",
        "label": "Skill Promotion / Restriction / Suspension / Demotion / Retrain Controller",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MAT",
        "label": "Registry-Backed Maturity · NOVEL / fragile → PRACTICED → MATURE → AUTOMATIC · failure/OOD can demote",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SKIF",
        "label": "Skill Registry + Competence Interface · versioned output to Runtime candidate retrieval + skill-runtime contract",
        "kind": "skill",
        "group": "SKILL",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MEMIF",
        "label": "Memory / Rule Candidate Package · observed evidence append does not wait for model validation · retrieval/rule/schema changes require promotion",
        "kind": "memory",
        "group": "OUTIF",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OUTWM",
        "label": "World Model + Calibration Interface",
        "kind": "world",
        "group": "OUTIF",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OUTPOL",
        "label": "Middle + Meta Policy / Reliability Interface",
        "kind": "decision",
        "group": "OUTIF",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OUTMOP",
        "label": "Meta Outcome Predictor Interface",
        "kind": "world",
        "group": "OUTIF",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OUTSK",
        "label": "Skill Registry + Competence Interface",
        "kind": "skill",
        "group": "OUTIF",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "NS",
        "label": "NON-STATIONARITY + COUNTERFACTUAL GUARDRAIL · memory, world model, arbitration, meta policy and skills all change while data is collected. · Unchosen alternatives from simulation/off-policy evaluation remain SIMULATED/COUNTERFACTUAL, never OBSERVED truth. · Use exploration, replay/versioning, uncertainty-aware weighting, held-out tests and regression checks against self-confirming loops.",
        "kind": "code",
        "group": "general",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OPTIONAL",
        "label": "OPTIONAL OFFLINE RESEARCH · memory-architecture evolution • self-play / checkpoint opponents • synthetic-data judging · strictly separate from live execution and canonical observed provenance",
        "kind": "deep",
        "group": "general",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "LOCK",
        "label": "LEARNING INVARIANTS · Observed archive precedes long-term salience. Transition assembly + outcome window + temporal credit precede outcome-based learning. · Explicit memory/rules enable fast adaptation; repeated validated patterns may compile into policies/skills; optional weight/adaptor training is slower and separately gated. · Background learning uses the same Scheduler and bounded budget and must never starve live control.",
        "kind": "code",
        "group": "general",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RAW",
        "label": "Runtime Raw Observation / Receipt Stream",
        "kind": "code",
        "group": "EVIDCREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "LOCAL",
        "label": "Local Semantic Decision Records · parent/child/frame/skill versions + projected evidence · candidate order + raw answer + actual rule + known propensity",
        "kind": "memory",
        "group": "EVIDCREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "JOURNAL",
        "label": "Durable Append-Only Evidence Journal · immediate persistence before outcome closure",
        "kind": "memory",
        "group": "EVIDCREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SUPPORT",
        "label": "Causal Support / Estimator Gate · randomized safe trials or supported off-policy evaluation · propensities + effective support; otherwise UNKNOWN",
        "kind": "code",
        "group": "EVIDCREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "ORACLE",
        "label": "Independent Mission Success Oracle · read-only to planners/learners; proxy reward separate",
        "kind": "code",
        "group": "EVIDCREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "MANIFEST",
        "label": "Per-Learner Algorithm Manifest · features/target/state + config + lineage + cadence/budget · metrics + split + dependencies + rollback version",
        "kind": "code",
        "group": "EVIDCREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "DATASET",
        "label": "Versioned Datasets / Frozen Splits · OBSERVED vs DERIVED vs SIMULATED vs COUNTERFACTUAL · final benchmarks excluded from repeated tuning",
        "kind": "memory",
        "group": "EVIDCREDIT",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SOP",
        "label": "Runtime Schema / Operator Proposal · operational extractor or authorized primitive implementation · types/units + permissions + idempotency + evidence",
        "kind": "skill",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "SCHEMA",
        "label": "Sandbox / Replay Schema and Operator Validation · held-out variants + noisy/missing values + old consumers · target capability mapping and adversarial task text",
        "kind": "code",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "GROUND",
        "label": "Grounded Transfer Validation · relations/roles/actions mapped to target observations · bounded probes + confidence/UNKNOWN + human-work ledger",
        "kind": "skill",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PROBEREQ",
        "label": "Target Inquiry / Probe Request · live trials use Runtime candidates and normal authority · sandbox trials use capability-scoped training environment",
        "kind": "code",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "AGATE",
        "label": "Common Artifact Validation / Promotion Gate · CANDIDATE → SHADOW / HOLDOUT / OLD-TASK REGRESSION · shared representation/retrieval compatibility + independent evidence · REJECT / REPAIR / PROMOTE / RESTRICT / ROLLBACK",
        "kind": "code",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "RELEASEB",
        "label": "Atomic Compatible Release Manifest · schema + model + calibration + policy + skill dependencies · pinned active cycles; staged rollout + rollback checkpoints",
        "kind": "code",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OUTMEM",
        "label": "Promoted Memory / Validated Rules Interface · observed evidence separately source-addressable",
        "kind": "memory",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OUTART",
        "label": "Versioned Schema / Capability / Profile Interface · Runtime typed update events; safe-boundary activation",
        "kind": "skill",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "DEPLOY",
        "label": "Deployment / Cross-Domain Regression Monitor · old rare failures + new task gain + shift + calibration",
        "kind": "code",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "VJOB",
        "label": "VALIDATE_ARTIFACT / GROUND_TRANSFER Job · model work via same Scheduler; objective checks in code",
        "kind": "code",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "PROFILE",
        "label": "Compute Profile Candidate · MINIMAL_BASELINE / TEMPORAL / FULL_RESEARCH · optional research flags OFF initially",
        "kind": "code",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "EVAL",
        "label": "Independent Scenario and Profile Evaluation · S01–S14 + matched-resource baselines / ablations · runtime trials NOT RUN; no AGI certification",
        "kind": "code",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "TELEMETRY",
        "label": "Runtime Success / Latency / Compute Telemetry",
        "kind": "code",
        "group": "RELEASE",
        "view": "learning",
        "status": "Documented design"
      },
      {
        "id": "OUTQUERY",
        "label": "Runtime Inquiry Request Interface · feeds EREQ; no environment-write authority",
        "kind": "code",
        "group": "general",
        "view": "learning",
        "status": "Documented design"
      }
    ],
    "edges": [
      {
        "from": "PEND",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RECEIPT",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "LATER",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOURNAL",
        "to": "ASM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "ASM",
        "to": "TRANS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TRANS",
        "to": "OUT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OUT",
        "to": "WINDOW",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "WINDOW",
        "to": "TC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TC",
        "to": "EXP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PEND",
        "to": "OUT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PEND",
        "to": "TC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "OBS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBS",
        "to": "OUTBOX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OUTBOX",
        "to": "SALG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SALG",
        "to": "HWRITE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "HWRITE",
        "to": "H",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SALG",
        "to": "MWRITE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MWRITE",
        "to": "M",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OUTBOX",
        "to": "STATS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OUTBOX",
        "to": "BCONS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "H",
        "to": "MB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "M",
        "to": "MB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "STATS",
        "to": "MB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "BCONS",
        "to": "MB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "M",
        "to": "M2H",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "M2H",
        "to": "H",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "H",
        "to": "H2M",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "H2M",
        "to": "SRC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SRC",
        "to": "CW",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CW",
        "to": "M",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MB",
        "to": "PROV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PROV",
        "to": "RECALL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MB",
        "to": "DED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DED",
        "to": "RECALL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MB",
        "to": "CONTR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CONTR",
        "to": "RECALL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MB",
        "to": "MREL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MREL",
        "to": "RECALL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBS",
        "to": "MFM",
        "label": "optional offline / experimental training",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SIM",
        "to": "MFM",
        "label": "provenance-preserving training",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MFM",
        "to": "MB",
        "label": "bounded labeled retrieval only",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PRED",
        "to": "PERR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TRANS",
        "to": "PERR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PERR",
        "to": "DYN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PERR",
        "to": "CAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CAL",
        "to": "PREL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "KNOWN",
        "to": "WM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DYN",
        "to": "WM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "WM",
        "to": "H1",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "WM",
        "to": "H2",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "WM",
        "to": "H3",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "WM",
        "to": "WMIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PREL",
        "to": "WMIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBS",
        "to": "PLEARN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PLEARN",
        "to": "STATS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PLEARN",
        "to": "MREL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PERR",
        "to": "FLEARN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "FLEARN",
        "to": "DYN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "FLEARN",
        "to": "CAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "AEXP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "AEXP",
        "to": "MLEARN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CF",
        "to": "MLEARN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "MEXP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MEXP",
        "to": "MPR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MEXP",
        "to": "MOP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CF",
        "to": "MOP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MPR",
        "to": "MEVAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MOP",
        "to": "MEVAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CF",
        "to": "MEVAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MEVAL",
        "to": "MML",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MEXP",
        "to": "MML",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MLEARN",
        "to": "POLIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MPR",
        "to": "POLIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MML",
        "to": "POLIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MOP",
        "to": "MOPIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SCHED",
        "to": "PIPE",
        "label": "model-service jobs only",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PIPE",
        "to": "JOBOUT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBS",
        "to": "RJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PERR",
        "to": "RJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "RJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RJOB",
        "to": "RSEL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RSEL",
        "to": "GRJOB",
        "label": "routine",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "GRJOB",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RSEL",
        "to": "SRJOB",
        "label": "hard / conflicting",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SRJOB",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOBOUT",
        "to": "GRES",
        "label": "routine synthesis result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOBOUT",
        "to": "SRES",
        "label": "deep abstraction result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "GRES",
        "to": "RCAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SRES",
        "to": "RCAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RCAND",
        "to": "RVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBS",
        "to": "RVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PERR",
        "to": "RVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "RVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RVALID",
        "to": "LIFE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "LIFE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PERR",
        "to": "LIFE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "LIFE",
        "to": "HR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "LIFE",
        "to": "PR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "LIFE",
        "to": "AR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "LIFE",
        "to": "MR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "HR",
        "to": "RECALL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PR",
        "to": "WMIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "AR",
        "to": "POLIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MR",
        "to": "POLIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "ACCEPT",
        "to": "ATTR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PEND",
        "to": "ATTR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RECEIPT",
        "to": "ATTR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "ATTR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "ATTR",
        "to": "RDATA",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RDATA",
        "to": "DDEC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RDATA",
        "to": "DSK",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RDATA",
        "to": "WGATE",
        "label": "optional only",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "WGATE",
        "to": "WART",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DDEC",
        "to": "MLEARN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DDEC",
        "to": "MML",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "GOAL",
        "to": "CURR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REG",
        "to": "CURR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "COMPET",
        "to": "CURR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PREL",
        "to": "CURR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "CURR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "BUDGET",
        "to": "CURR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "COMPET",
        "to": "PROG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "NEW",
        "to": "PROG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REGRESS",
        "to": "PROG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PROG",
        "to": "CURR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CURR",
        "to": "DISC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DISC",
        "to": "OBJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBJ",
        "to": "TRAINJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TRAINJOB",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBJ",
        "to": "TENV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CAP",
        "to": "TENV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TENV",
        "to": "TRAJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TRAJ",
        "to": "SIM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TRAJ",
        "to": "DATA",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBS",
        "to": "DATA",
        "label": "successful + failed deployed traces",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DSK",
        "to": "DATA",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "ONLINE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "ONLINE",
        "to": "DATA",
        "label": "MEDIUM evidence accumulation",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "ONLINE",
        "to": "SCJOB",
        "label": "SLOW abstraction threshold",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REG",
        "to": "SCJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATA",
        "to": "SCJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "STATS",
        "to": "SCJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RECALL",
        "to": "SCJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SCJOB",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOBOUT",
        "to": "SCOMP",
        "label": "skill-compiler result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SCOMP",
        "to": "SDEF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SDEF",
        "to": "RTCON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RTCON",
        "to": "VCAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "VCAND",
        "to": "CP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATA",
        "to": "TRAIN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TRAIN",
        "to": "METHOD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "METHOD",
        "to": "BC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "BC",
        "to": "CP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "METHOD",
        "to": "RL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RL",
        "to": "CP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "METHOD",
        "to": "DREAM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DREAM",
        "to": "CP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "WM",
        "to": "DREAM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REG",
        "to": "ABS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "ABS",
        "to": "TRANSFER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TRANSFER",
        "to": "GROUND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "GROUND",
        "to": "CP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CAP",
        "to": "TRANSFER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "GOAL",
        "to": "COMP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REG",
        "to": "COMP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PRED",
        "to": "COMP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "COMP",
        "to": "CJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CJOB",
        "to": "CSEL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CSEL",
        "to": "CGJOB",
        "label": "routine",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CGJOB",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CSEL",
        "to": "CSJOB",
        "label": "complex / novel",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CSJOB",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOBOUT",
        "to": "CRESG",
        "label": "routine composition result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOBOUT",
        "to": "CRESS",
        "label": "deep composition result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CRESG",
        "to": "CCP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CRESS",
        "to": "CCP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CCP",
        "to": "HAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PRED",
        "to": "HAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "HAND",
        "to": "CP",
        "label": "executable composite program",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "HAND",
        "to": "DATA",
        "label": "needs learning / demonstrations",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CP",
        "to": "NEW",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CP",
        "to": "REGRESS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "NEW",
        "to": "COMPET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REGRESS",
        "to": "COMPET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "COMPET",
        "label": "real deployed skill outcomes",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "COMPET",
        "to": "PROM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "NEW",
        "to": "PROM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REGRESS",
        "to": "PROM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PROM",
        "to": "AGATE",
        "label": "skill candidate + test evidence",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PROM",
        "to": "TRAIN",
        "label": "repair / retrain",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PROM",
        "to": "SCJOB",
        "label": "counterexamples / revise definition",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REG",
        "to": "MAT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "COMPET",
        "to": "MAT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MAT",
        "to": "AGATE",
        "label": "versioned maturity proposal",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REG",
        "to": "SKIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RECALL",
        "to": "MEMIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "HR",
        "to": "MEMIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "WMIF",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "POLIF",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MOPIF",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SKIF",
        "to": "OUTSK",
        "label": "compatible registry version",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "NS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CF",
        "to": "NS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SYN",
        "to": "OPTIONAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MFM",
        "to": "OPTIONAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RAW",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "LOCAL",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "LOCAL",
        "to": "ASM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOURNAL",
        "to": "OBS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "GOAL",
        "to": "ORACLE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOURNAL",
        "to": "ORACLE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "ORACLE",
        "to": "OUT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PEND",
        "to": "SUPPORT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "LOCAL",
        "to": "SUPPORT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TC",
        "to": "SUPPORT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SUPPORT",
        "to": "DATASET",
        "label": "qualified credit, not invented labels",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBS",
        "to": "DATASET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SIM",
        "to": "DATASET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CF",
        "to": "DATASET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATASET",
        "to": "STATS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATASET",
        "to": "DYN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATASET",
        "to": "CAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATASET",
        "to": "MLEARN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATASET",
        "to": "MPR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATASET",
        "to": "MOP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATASET",
        "to": "MML",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MANIFEST",
        "to": "STATS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MANIFEST",
        "to": "DYN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MANIFEST",
        "to": "CAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MANIFEST",
        "to": "MLEARN",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MANIFEST",
        "to": "MPR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MANIFEST",
        "to": "MOP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MANIFEST",
        "to": "MML",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MANIFEST",
        "to": "SCJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SOP",
        "to": "SCHEMA",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CAP",
        "to": "SCHEMA",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RAW",
        "to": "SCHEMA",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SCHEMA",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TRANSFER",
        "to": "PROBEREQ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PROBEREQ",
        "to": "TENV",
        "label": "sandbox",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PROBEREQ",
        "to": "OUTQUERY",
        "label": "live request, not artifact publication",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TRAJ",
        "to": "GROUND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "OBS",
        "to": "GROUND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "CAP",
        "to": "GROUND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "GROUND",
        "to": "PROBEREQ",
        "label": "missing target evidence",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "SCHEMA",
        "to": "VJOB",
        "label": "needs semantic proposal",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "GROUND",
        "to": "VJOB",
        "label": "needs scheduled interpretation",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "VJOB",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOBOUT",
        "to": "SCHEMA",
        "label": "typed validated artifact/transfer result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "JOBOUT",
        "to": "GROUND",
        "label": "grounding proposal with evidence",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MEMIF",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "WART",
        "to": "AGATE",
        "label": "optional candidate only",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "ORACLE",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "MANIFEST",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "NEW",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "REGRESS",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DATASET",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "AGATE",
        "to": "RELEASEB",
        "label": "promote compatible bundle",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "AGATE",
        "to": "TRAIN",
        "label": "reject or repair skill",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "AGATE",
        "to": "RELEASEB",
        "label": "rollback / restrict",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RELEASEB",
        "to": "REG",
        "label": "skill owner publishes exact version",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RELEASEB",
        "to": "OUTWM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RELEASEB",
        "to": "OUTPOL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RELEASEB",
        "to": "OUTMOP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RELEASEB",
        "to": "OUTMEM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RELEASEB",
        "to": "OUTART",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "RELEASEB",
        "to": "DEPLOY",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EXP",
        "to": "DEPLOY",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PERR",
        "to": "DEPLOY",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "DEPLOY",
        "to": "AGATE",
        "label": "degradation / compatibility failure",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "BUDGET",
        "to": "VJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "BUDGET",
        "to": "EVAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "PROFILE",
        "to": "EVAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "TELEMETRY",
        "to": "EVAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "ORACLE",
        "to": "EVAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "EVAL",
        "to": "AGATE",
        "label": "validated profile candidate",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      },
      {
        "from": "GOAL",
        "to": "EVAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/learning"
      }
    ],
    "groups": [
      {
        "id": "INPUT",
        "label": "INPUTS FROM LIVE RUNTIME"
      },
      {
        "id": "CREDIT",
        "label": "OBSERVED EXPERIENCE + TEMPORAL CREDIT — BEFORE OUTCOME-BASED LEARNING"
      },
      {
        "id": "ARCH",
        "label": "STRICT PROVENANCE SEPARATION"
      },
      {
        "id": "MEM",
        "label": "MEMORYBRIDGE / CROSS-MEMORY CONTRACT"
      },
      {
        "id": "WORLD",
        "label": "HYBRID WORLD-MODEL LEARNING + CALIBRATION"
      },
      {
        "id": "SPEC",
        "label": "SPECIALIST LEARNING — PRESERVE PAST / PRESENT / FUTURE COGNITIVE DIVERSITY"
      },
      {
        "id": "MODELPIPE",
        "label": "CANONICAL MODEL-SERVICE PATH FOR LEARNING JOBS"
      },
      {
        "id": "RULES",
        "label": "EXPLICIT RULE INDUCTION + VALIDATION + LIFECYCLE"
      },
      {
        "id": "DIST",
        "label": "REASONING ATTRIBUTION + COGNITIVE COMPILATION"
      },
      {
        "id": "SKILL",
        "label": "SKILL LEARNING / TRANSFER / COMPOSITION / RELIABILITY / AUTOMATICITY — SKILL SYSTEM v1.2 INTEGRATED"
      },
      {
        "id": "OUTIF",
        "label": "VERSIONED OUTPUTS BACK TO RUNTIME"
      },
      {
        "id": "EVIDCREDIT",
        "label": "RAW EVIDENCE, LOCAL CHOICES AND CAUSAL SUPPORT"
      },
      {
        "id": "RELEASE",
        "label": "SHARED VALIDATION AND COMPATIBLE ARTIFACT RELEASE"
      }
    ]
  },
  {
    "id": "cognition",
    "title": "1 — Cognitive Architecture v1.10 CANONICAL",
    "nodes": [
      {
        "id": "TITLE",
        "label": "JEV COGNITIVE ARCHITECTURE v1.10 · Past • Present/Middle • Future | Different timescales, one mind · PLAY → LEARN → IMPROVE → GENERALIZE",
        "kind": "core",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "ENV",
        "label": "Environment / Game / Robot / World",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "INPUT",
        "label": "Screen / API / Sensors / Telemetry",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "DET",
        "label": "Object / Entity Detection · where applicable",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "EXT",
        "label": "State Extraction",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "TRACK",
        "label": "Entity Tracking",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "FEAT",
        "label": "Feature / Relation Encoding",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "FULL",
        "label": "Full Local / Machine State · detailed local truth for deterministic code",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "EVENTS",
        "label": "Raw Event Buffer · ~10–15 s timestamped changes",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "LITE",
        "label": "Gemini 2.5 Flash-Lite · asynchronous recent-event summarizer",
        "kind": "fast",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "RECENT",
        "label": "Recent Context · compressed recent temporal evidence",
        "kind": "fast",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "BUS",
        "label": "Typed Event Bus",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "RED",
        "label": "Blackboard Reducer · ONLY canonical-state writer",
        "kind": "core",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "BOARD",
        "label": "Executive Blackboard · belief/state + Recent Context + accepted goals/plans + candidates · predictions + skills + incidents + adviser/meta state + uncertainty + versions",
        "kind": "decision",
        "group": "PER",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "CAP",
        "label": "Environment Capability Schema",
        "kind": "core",
        "group": "CAND",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "PRIM",
        "label": "Legal Primitive Generator",
        "kind": "core",
        "group": "CAND",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SKREG",
        "label": "Validated Skill Registry · version + maturity + competence + OOD",
        "kind": "skill",
        "group": "CAND",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "PLANACT",
        "label": "Accepted Plan Actions / Subgoals",
        "kind": "decision",
        "group": "CAND",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "BUILD",
        "label": "Candidate Builder",
        "kind": "core",
        "group": "CAND",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "COVER",
        "label": "Coverage Check · meaningful legal choices + skills + accepted plan actions · information / wait / abort / escalation / no-match options",
        "kind": "core",
        "group": "CAND",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "EXPAND",
        "label": "Gemini-first candidate repair · Hermes/Sol only if still novel/inadequate",
        "kind": "fast",
        "group": "CAND",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "VALID",
        "label": "Generated-Candidate Validation · legality + freshness + constraints + target + capability + safety + dedupe",
        "kind": "core",
        "group": "CAND",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "CSET",
        "label": "ONE Versioned Candidate Set · primitive / skill / plan-action / INFO / WAIT / ABORT · ESCALATE_FAST / ESCALATE_DEEP / NO_VALID_ACTION",
        "kind": "decision",
        "group": "CAND",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "CYCLE",
        "label": "Immutable Decision-Cycle Snapshot · one coherent Blackboard version · pins world/belief/goal/candidate + memory/world-model/policy/skill versions",
        "kind": "decision",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "OEXP",
        "label": "Canonical Observed Experience · OBSERVED provenance",
        "kind": "memory",
        "group": "MEMORY",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "ROUTE",
        "label": "Experience / Event Router · durable idempotent delivery",
        "kind": "core",
        "group": "MEMORY",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "H",
        "label": "Hindsight · episodic + semantic",
        "kind": "memory",
        "group": "MEMORY",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "M",
        "label": "MemOS 2.0 · procedural",
        "kind": "memory",
        "group": "MEMORY",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "ST",
        "label": "Historical Statistics / Action Values",
        "kind": "memory",
        "group": "MEMORY",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MB",
        "label": "MemoryBridge / CompositeMemory · not a third store · provenance + dedupe + contradiction + reliability",
        "kind": "memory",
        "group": "MEMORY",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "RECALL",
        "label": "Bounded Selected Recall · episodes + procedures + rules + stats + exceptions + source IDs",
        "kind": "memory",
        "group": "MEMORY",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "WM",
        "label": "Hybrid Candidate-Conditioned World Model · known mechanics + learned uncertain dynamics",
        "kind": "world",
        "group": "FUT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "H1",
        "label": "Immediate Horizon Head · ~0–3 s",
        "kind": "world",
        "group": "FUT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "H2",
        "label": "Tactical Horizon Head · ~3–30 s",
        "kind": "world",
        "group": "FUT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "H3",
        "label": "Strategic Horizon Head · ~30 s–minutes",
        "kind": "world",
        "group": "FUT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "PRED",
        "label": "Forecast Package · candidate → consequence distribution + uncertainty + calibration",
        "kind": "world",
        "group": "FUT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "GVR",
        "label": "Goal / Value / Risk Evaluator · desirability is separate from dynamics",
        "kind": "world",
        "group": "FUT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "UNC",
        "label": "Source-Separated Uncertainty / Reliability Vector · observation/belief • memory/rules • Jev distribution • prediction calibration · skill competence/OOD • adviser freshness • meta reliability • service health • plan validity • coverage",
        "kind": "core",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "PCTX",
        "label": "Past Jev Context · same cycle + same candidates + bounded OBSERVED history/rules/stats · memory reliability + provenance",
        "kind": "past",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "FCTX",
        "label": "Future Jev Context · same cycle + same candidates + PREDICTED/SIMULATED forecasts · Goal/Value/Risk + prediction reliability",
        "kind": "future",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MCTX",
        "label": "Middle Jev Context · same cycle + same candidates + actual Past/Future outputs · arbitration policy + skill reliability + cached meta + uncertainty",
        "kind": "present",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MCX",
        "label": "Meta Conflict Context · actual Past/Future advice + disagreement + stakes · source reliability + uncertainty + meta-strategy candidate set",
        "kind": "meta",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "P4CTX",
        "label": "Past Gemini Context · selected historical evidence + current incident",
        "kind": "past",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "M4CTX",
        "label": "Present/Middle Gemini Context · bounded tactical incident + goals + recent context + relevant memory/predictions · teaches lower layers only via validated demonstrations / plans / rules",
        "kind": "present",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "F4CTX",
        "label": "Future Gemini Context · fresh candidate forecasts + risk + current incident",
        "kind": "future",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "P5CTX",
        "label": "Past Hermes/Sol Brief · deep selected historical abstraction + contradictions",
        "kind": "past",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "M5CTX",
        "label": "Present/Middle Hermes/Sol Brief · compact brief + recoverable cited source expansion",
        "kind": "present",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "F5CTX",
        "label": "Future Hermes/Sol Brief · strategic counterfactual evidence + forecast uncertainty",
        "kind": "future",
        "group": "PROJ",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "P5",
        "label": "Past-oriented Hermes/Sol · deep historical abstraction + contradiction resolution · cross-domain lessons",
        "kind": "deep",
        "group": "L5",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "M5",
        "label": "Present/Middle Hermes/Sol · authorized subgoals + strategy + self-reflection + research · novel situations + persistent-failure analysis + long-horizon planning",
        "kind": "deep",
        "group": "L5",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "F5",
        "label": "Future-oriented Hermes/Sol · deep prospective reasoning + strategic counterfactuals",
        "kind": "deep",
        "group": "L5",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "P4",
        "label": "Past-oriented Gemini · retrospective interpretation + historical-rule repair",
        "kind": "fast",
        "group": "L4",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "M4",
        "label": "Present/Middle Gemini · interpret situation + decompose goals + evaluate options · tactical replan + verification/critique + candidate/subgoal generation",
        "kind": "fast",
        "group": "L4",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "F4",
        "label": "Future-oriented Gemini · consequence comparison + prospective candidate repair",
        "kind": "fast",
        "group": "L4",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MP",
        "label": "Meta-Past Jev · which adviser / strategy worked before?",
        "kind": "meta",
        "group": "L3",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MM",
        "label": "Meta-Middle Jev · how should I arbitrate now? · trust / reweight / ignore / gather info / escalate",
        "kind": "meta",
        "group": "L3",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MF",
        "label": "Meta-Future Jev · predicted consequences of supplied meta strategies",
        "kind": "meta",
        "group": "L3",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "PJ",
        "label": "Past Jev · what worked before?",
        "kind": "past",
        "group": "L2",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MID",
        "label": "Middle Jev / Instant Arbiter · what should I do NOW? · selects one supplied behavior; may pick neither adviser’s top choice",
        "kind": "present",
        "group": "L2",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "FJ",
        "label": "Future Jev · what is likely to work now?",
        "kind": "future",
        "group": "L2",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "METAOPT",
        "label": "Meta-Strategy Candidate Set · TRUST_PAST / TRUST_FUTURE / BLEND / FOLLOW_MIDDLE_DEFAULT · IGNORE_BOTH / GATHER_INFORMATION / ESCALATE_FAST / ESCALATE_DEEP",
        "kind": "meta",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MOP",
        "label": "Meta Outcome Predictor · versioned learned predictor of consequences for each supplied meta strategy",
        "kind": "world",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MG",
        "label": "Cached Valid Meta Guidance · freshness checked; Middle never waits for a new meta cycle",
        "kind": "meta",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "P4ADV",
        "label": "Past/Future Level-4 analyses remain advisory",
        "kind": "core",
        "group": "PLAN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "P5ADV",
        "label": "Past/Future Level-5 analyses remain advisory",
        "kind": "core",
        "group": "PLAN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "TPROP",
        "label": "Present/Middle Gemini · Fast Tactical Plan Proposal",
        "kind": "fast",
        "group": "PLAN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SPROP",
        "label": "Present/Middle Hermes/Sol · Authorized Strategy / Subgoal Proposal",
        "kind": "deep",
        "group": "PLAN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "COMMIT",
        "label": "Plan Commit / Staleness Gate · ACCEPT / REBASE / REJECT_STALE / REJECT_INVALID / RECONSIDER",
        "kind": "core",
        "group": "PLAN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "ACCEPT",
        "label": "Accepted Mission-Constrained Strategy · Accepted Fast Plan / Subgoals",
        "kind": "decision",
        "group": "PLAN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "AVAIL",
        "label": "Adviser Availability / Degraded Mode · both / Past-only / Future-only / neither",
        "kind": "core",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "DEAD",
        "label": "Middle Deadline / Fallback Merge · on-time Middle else valid active skill → cached valid action → deterministic safe action",
        "kind": "core",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "FVG",
        "label": "Current-State Final Validity Gate · recheck target + legality + safety + capability + current skill competence/revocation",
        "kind": "core",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SM",
        "label": "Skill Manager / Exact Skill Version Resolver",
        "kind": "skill",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SRC",
        "label": "Skill Runtime Contract · goal + preconditions + relevant state schema · operators/subskills + expected effects + termination + OOD · stored Jev question template",
        "kind": "skill",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SPROJ",
        "label": "Deterministic Skill State Projector · bounded skill-relevant state · OBSERVED / REMEMBERED / PREDICTED provenance preserved",
        "kind": "skill",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SCAND",
        "label": "Skill-Local Candidate Builder · legal primitives + applicable subskills · WAIT / ABORT / INSPECT / ESCALATE",
        "kind": "skill",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SQ",
        "label": "Question Builder · fills stored typed Jev template · neutral candidate IDs / descriptions",
        "kind": "skill",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SJ",
        "label": "Skill-Local Jev Request + Freshness Gate · same canonical Scheduler → Jev service → result bus · event-triggered semantic operator/subskill choice",
        "kind": "skill",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SSEL",
        "label": "Fresh Skill-Local Choice · primitive / subskill / WAIT / ABORT / ESCALATE / NO_VALID_ACTION",
        "kind": "skill",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SLFVG",
        "label": "Skill-Local Current-State Final Validity Gate · recheck target + legality + capability + safety · current skill/subskill competence + revocation after Jev result",
        "kind": "core",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "STACK",
        "label": "Parent–Child Skill Call Stack · push child skill • structured return • resume parent",
        "kind": "skill",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SUPD",
        "label": "Skill State Updater · last action + expected vs actual effect · local attempt history",
        "kind": "skill",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SMON",
        "label": "Skill Runtime Monitor · progress + applicability + OOD + failure · meaningful-event trigger",
        "kind": "skill",
        "group": "SKILLRT",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "CTRL",
        "label": "Deterministic Low-Level Controller · continues expected progress without Jev every motor tick",
        "kind": "skill",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SAFE",
        "label": "Hard Safety / Reflex / Validity · may preempt cognition",
        "kind": "skill",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "Q",
        "label": "Action Queue / Interrupts",
        "kind": "skill",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "AUTH",
        "label": "SINGLE EXECUTION AUTHORITY",
        "kind": "core",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "ATT",
        "label": "Attention / Escalation Controller · novelty + surprise + risk + opportunity + disagreement · prediction error + repeated failure + important uncertainty",
        "kind": "core",
        "group": "CONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MON",
        "label": "Execution Monitor · expected vs actual progress · skill + tactical plan + strategic goal",
        "kind": "core",
        "group": "CONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SCHED",
        "label": "ONE Cognitive Scheduler · event-driven; urgency/deadline/staleness/uncertainty/VOI/compute budget",
        "kind": "core",
        "group": "CONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "RECEIPT",
        "label": "Execution Receipt + Later Belief Snapshot",
        "kind": "core",
        "group": "LEARN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "CREDIT",
        "label": "Transition Assembly → Outcome Window → Temporal Credit · action + Middle + skill + tactical + strategic + reasoning",
        "kind": "core",
        "group": "LEARN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "EXP2",
        "label": "Canonical Observed Experience · OBSERVED provenance",
        "kind": "memory",
        "group": "LEARN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "CONS",
        "label": "Learning Consolidator · explicit memory/rules first → validate → preserve exceptions · repeated proven patterns may distill into supporting policies / skills",
        "kind": "decision",
        "group": "LEARN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "RULES",
        "label": "Validated Rules · historical / predictive / arbitration / meta",
        "kind": "memory",
        "group": "LEARN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "POL",
        "label": "Middle + Meta Supporting Policies · external specialist learning",
        "kind": "present",
        "group": "LEARN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "AUTO",
        "label": "Skill Maturity / Automaticity · NOVEL → PRACTICED → MATURE → AUTOMATIC · failure/OOD may demote",
        "kind": "skill",
        "group": "LEARN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "OPT",
        "label": "Optional adapter / weight training · only after repeated validated evidence and supported training access",
        "kind": "deep",
        "group": "LEARN",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "COMPILE",
        "label": "COGNITIVE COMPILATION DIRECTION · slow explicit reasoning → accepted + executed + outcome-validated evidence · → validated rule/policy → fast intuition → mature automatic skill",
        "kind": "core",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "LOCK",
        "label": "CANONICAL LOCK · Past = OBSERVED/HISTORICAL evidence • Present/Middle = CURRENT arbitration • Future = PREDICTED/SIMULATED evidence. · Shared physical services may be reused, but role evidence, schemas, provenance and objectives remain distinct. · No model directly mutates canonical state or the live environment.",
        "kind": "core",
        "group": "general",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "JOURNAL",
        "label": "Durable Raw Evidence Journal · observations + receipts before outcome closure",
        "kind": "memory",
        "group": "GENERAL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "EREQ",
        "label": "Evidence / Representation Request Router · source IDs + omitted fields + uncertainty + bounded budget",
        "kind": "core",
        "group": "GENERAL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "EVID",
        "label": "Fresh Provenance-Checked Evidence · stored sources or scheduled interpretation",
        "kind": "memory",
        "group": "GENERAL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "HYP",
        "label": "Hypothesis Set + OTHER / UNKNOWN · calibrated likelihoods or uncalibrated intervals",
        "kind": "world",
        "group": "GENERAL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "PROBE",
        "label": "Bounded Active Probe Selector · decision benefit / information gain minus cost and risk · mission limits + explicit stopping",
        "kind": "world",
        "group": "GENERAL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "BUP",
        "label": "Belief Updater · actual observed outcomes; alternatives retained",
        "kind": "core",
        "group": "GENERAL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "SOP",
        "label": "Schema / Operator Proposal · operational extractor or primitive mapping + evidence",
        "kind": "skill",
        "group": "GENERAL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "ARTIF",
        "label": "Compatible Versioned Artifact Interface · schemas / capabilities / policies / skills",
        "kind": "skill",
        "group": "GENERAL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "AGATE",
        "label": "Shared Artifact Validation / Promotion · independent held-out + old-task regression + rollback",
        "kind": "core",
        "group": "GENERAL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "LCOVER",
        "label": "Local coverage adequate?",
        "kind": "decision",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "LREPAIR",
        "label": "Scoped Fast / Deep Candidate Repair · same scheduler; bounded retries; current validation",
        "kind": "fast",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "LREC",
        "label": "Local Decision Record · frame/version + candidates/order + raw answer · actual selection rule + known propensity + receipt join",
        "kind": "memory",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "LROUTE",
        "label": "Logged local choice type?",
        "kind": "decision",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "GDRT",
        "label": "Global decision type?",
        "kind": "decision",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "WAITR",
        "label": "WAIT / CONTINUE · retain and revalidate same frame; otherwise safe hold",
        "kind": "skill",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "OWNER",
        "label": "Execution Lease / Resource Owner · handoff or suspend incompatible owner; one active issuer",
        "kind": "core",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "RETURN",
        "label": "Structured Child Return · status + effects + provenance + release resources",
        "kind": "skill",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "RESUME",
        "label": "Pop Child / Revalidate Parent Continuation · same parent frame; assumptions + lease",
        "kind": "skill",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "CANCEL",
        "label": "Cancel Scope and Descendants · unwind frames + interrupted receipts",
        "kind": "core",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "EPOCH",
        "label": "Execution Epoch / Revocation State",
        "kind": "core",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "WATCH",
        "label": "Liveness Watchdog · depth / retries / time / no-progress / escalation bounds",
        "kind": "core",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "CENV",
        "label": "Command Envelope · lease + epoch + expiry + versions + idempotency",
        "kind": "core",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "CADMIT",
        "label": "Command Admission / Fencing · current mission + capability + owner + epoch + hard safety",
        "kind": "core",
        "group": "LCONTROL",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "USER",
        "label": "Trusted User / Authorized Mission Update",
        "kind": "core",
        "group": "MISSIONPROFILE",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MISSION",
        "label": "Versioned Root Mission Contract · objective + success tests + permissions + budgets",
        "kind": "decision",
        "group": "MISSIONPROFILE",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "MVALID",
        "label": "Deterministic Mission Validator · environment/model text cannot grant authority",
        "kind": "core",
        "group": "MISSIONPROFILE",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "ORACLE",
        "label": "Independent Success Oracle · observable tests; planner and learner cannot rewrite",
        "kind": "core",
        "group": "MISSIONPROFILE",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "PROFILE",
        "label": "Versioned Compute Profile Registry · MINIMAL_BASELINE / TEMPORAL / FULL_RESEARCH · research extras OFF initially; invariant gates always ON",
        "kind": "core",
        "group": "MISSIONPROFILE",
        "view": "cognition",
        "status": "Documented design"
      },
      {
        "id": "METRIC",
        "label": "Scenario / Profile Evaluation · S01–S14 + ablations; success / latency / total cost · runtime evidence NOT RUN",
        "kind": "core",
        "group": "MISSIONPROFILE",
        "view": "cognition",
        "status": "Documented design"
      }
    ],
    "edges": [
      {
        "from": "ENV",
        "to": "INPUT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "INPUT",
        "to": "DET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "DET",
        "to": "EXT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EXT",
        "to": "TRACK",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "TRACK",
        "to": "FEAT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FEAT",
        "to": "FULL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FEAT",
        "to": "EVENTS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVENTS",
        "to": "LITE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LITE",
        "to": "RECENT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FULL",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RECENT",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BUS",
        "to": "RED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RED",
        "to": "BOARD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CAP",
        "to": "PRIM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PRIM",
        "to": "BUILD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SKREG",
        "to": "BUILD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PLANACT",
        "to": "BUILD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "BUILD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BUILD",
        "to": "COVER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "COVER",
        "to": "CSET",
        "label": "adequate",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "COVER",
        "to": "EXPAND",
        "label": "inadequate",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EXPAND",
        "to": "VALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "VALID",
        "to": "CSET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CAP",
        "to": "VALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CSET",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "CYCLE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "OEXP",
        "to": "ROUTE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ROUTE",
        "to": "H",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ROUTE",
        "to": "M",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ROUTE",
        "to": "ST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "H",
        "to": "MB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M",
        "to": "MB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ST",
        "to": "MB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MB",
        "to": "RECALL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CSET",
        "to": "WM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "WM",
        "to": "H1",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "WM",
        "to": "H2",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "WM",
        "to": "H3",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "H1",
        "to": "PRED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "H2",
        "to": "PRED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "H3",
        "to": "PRED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PRED",
        "to": "GVR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "UNC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CYCLE",
        "to": "PCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CYCLE",
        "to": "FCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CYCLE",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CYCLE",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RECALL",
        "to": "PCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "GVR",
        "to": "FCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "PCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "FCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "P4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "M4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "F4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RECALL",
        "to": "P4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RECALL",
        "to": "M4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PRED",
        "to": "M4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PRED",
        "to": "F4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "P4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "M4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "F4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RECALL",
        "to": "P5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "M5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RECALL",
        "to": "M5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PRED",
        "to": "M5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PRED",
        "to": "F5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "P5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "M5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "F5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P5",
        "to": "M5",
        "label": "advisory historical synthesis",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "F5",
        "to": "M5",
        "label": "advisory prospective synthesis",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P4",
        "to": "M4",
        "label": "advisory retrospective synthesis",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "F4",
        "to": "M4",
        "label": "advisory prospective synthesis",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MP",
        "to": "MM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MF",
        "to": "MM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PJ",
        "to": "MID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FJ",
        "to": "MID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P5",
        "to": "P4",
        "label": "DOWN: guidance / compilation",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P4",
        "to": "MP",
        "label": "DOWN: guidance",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MP",
        "to": "PJ",
        "label": "DOWN: guidance",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PJ",
        "to": "MP",
        "label": "UP: unresolved / uncertain",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MP",
        "to": "P4",
        "label": "UP: needs conscious retrospective reasoning",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P4",
        "to": "P5",
        "label": "UP: deep contradiction / abstraction",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M5",
        "to": "M4",
        "label": "DOWN: guidance / compilation",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M4",
        "to": "MM",
        "label": "DOWN: guidance",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MM",
        "to": "MID",
        "label": "DOWN: cached meta guidance",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MID",
        "to": "MM",
        "label": "UP: unresolved / novel",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MM",
        "to": "M4",
        "label": "UP: needs conscious reasoning",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M4",
        "to": "M5",
        "label": "UP: strategic / highly novel",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "F5",
        "to": "F4",
        "label": "DOWN: guidance / compilation",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "F4",
        "to": "MF",
        "label": "DOWN: guidance",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MF",
        "to": "FJ",
        "label": "DOWN: guidance",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FJ",
        "to": "MF",
        "label": "UP: uncertain forecast / conflict",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MF",
        "to": "F4",
        "label": "UP: needs conscious prospective reasoning",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "F4",
        "to": "F5",
        "label": "UP: deep prospective problem",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PCTX",
        "to": "PJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FCTX",
        "to": "FJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P4CTX",
        "to": "P4",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M4CTX",
        "to": "M4",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "F4CTX",
        "to": "F4",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P5CTX",
        "to": "P5",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M5CTX",
        "to": "M5",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "F5CTX",
        "to": "F5",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CSET",
        "to": "PJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CSET",
        "to": "FJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CSET",
        "to": "MID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PJ",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FJ",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PJ",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FJ",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MCX",
        "to": "METAOPT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "METAOPT",
        "to": "MP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RECALL",
        "to": "MP",
        "label": "arbitration history / adviser reliability evidence",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MCX",
        "to": "MP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MCX",
        "to": "MOP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "METAOPT",
        "to": "MOP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MOP",
        "to": "MF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MCX",
        "to": "MF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MP",
        "to": "MM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MF",
        "to": "MM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "METAOPT",
        "to": "MM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MM",
        "to": "MG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MG",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MCTX",
        "to": "MID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P4",
        "to": "P4ADV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P4ADV",
        "to": "M4",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "F4",
        "to": "P4ADV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P5",
        "to": "P5ADV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "P5ADV",
        "to": "M5",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "F5",
        "to": "P5ADV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M4",
        "to": "TPROP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M5",
        "to": "SPROP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "TPROP",
        "to": "MVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MVALID",
        "to": "COMMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SPROP",
        "to": "MVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "COMMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "COMMIT",
        "to": "ACCEPT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ACCEPT",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ACCEPT",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ACCEPT",
        "to": "GVR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ACCEPT",
        "to": "PLANACT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SRC",
        "to": "SPROJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SPROJ",
        "to": "SCAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SCAND",
        "to": "LCOVER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LCOVER",
        "to": "SQ",
        "label": "adequate",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SQ",
        "to": "SJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SJ",
        "to": "SSEL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SSEL",
        "to": "SLFVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SLFVG",
        "to": "LREC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LREC",
        "to": "LROUTE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LROUTE",
        "to": "STACK",
        "label": "subskill",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SUPD",
        "to": "SMON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SMON",
        "to": "SPROJ",
        "label": "meaningful event / retry",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PJ",
        "to": "AVAIL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FJ",
        "to": "AVAIL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MID",
        "to": "DEAD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AVAIL",
        "to": "DEAD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "DEAD",
        "to": "FVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FVG",
        "to": "GDRT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "GDRT",
        "to": "SM",
        "label": "new skill",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SM",
        "to": "SRC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LROUTE",
        "to": "OWNER",
        "label": "primitive / INFO",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "STACK",
        "to": "SM",
        "label": "resolve child",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CTRL",
        "to": "SAFE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SAFE",
        "to": "CENV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CENV",
        "to": "Q",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "Q",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CADMIT",
        "to": "AUTH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AUTH",
        "to": "ENV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AUTH",
        "to": "SUPD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SMON",
        "to": "CTRL",
        "label": "normal progress",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "FVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "SPROJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "SUPD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "SLFVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CAP",
        "to": "FVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CAP",
        "to": "SCAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CAP",
        "to": "SLFVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SKREG",
        "to": "FVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SKREG",
        "to": "SRC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SKREG",
        "to": "SLFVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ATT",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MON",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "ATT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "MON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PRED",
        "to": "ATT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PRED",
        "to": "MON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "UNC",
        "to": "ATT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AUTH",
        "to": "MON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AUTH",
        "to": "RECEIPT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RECEIPT",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "JOURNAL",
        "to": "CREDIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CREDIT",
        "to": "EXP2",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EXP2",
        "to": "CONS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CONS",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AGATE",
        "to": "RULES",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AGATE",
        "to": "POL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AGATE",
        "to": "AUTO",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CONS",
        "to": "OPT",
        "label": "optional slow path",
        "conditional": true,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EXP2",
        "to": "OEXP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AGATE",
        "to": "WM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RULES",
        "to": "MB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "POL",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "POL",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AUTO",
        "to": "SKREG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M5",
        "to": "COMPILE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M4",
        "to": "COMPILE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CREDIT",
        "to": "COMPILE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "COMPILE",
        "to": "CONS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "FEAT",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "COVER",
        "to": "EREQ",
        "label": "novelty / stagnation",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LCOVER",
        "to": "EREQ",
        "label": "local representation gap",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ATT",
        "to": "EREQ",
        "label": "surprise even if advisers agree",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M4",
        "to": "EREQ",
        "label": "request cited sources",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "M5",
        "to": "EREQ",
        "label": "request original evidence",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EREQ",
        "to": "MB",
        "label": "stored source retrieval",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EREQ",
        "to": "JOURNAL",
        "label": "source IDs",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MB",
        "to": "EVID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "JOURNAL",
        "to": "EVID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EREQ",
        "to": "SCHED",
        "label": "semantic proposals use scheduler",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SCHED",
        "to": "EVID",
        "label": "guarded fresh result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVID",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVID",
        "to": "HYP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVID",
        "to": "P4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVID",
        "to": "M4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVID",
        "to": "F4CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVID",
        "to": "P5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVID",
        "to": "M5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVID",
        "to": "F5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "HYP",
        "to": "PROBE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CAP",
        "to": "PROBE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "GVR",
        "to": "PROBE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PROBE",
        "to": "BUILD",
        "label": "global probe candidate",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PROBE",
        "to": "SCAND",
        "label": "skill-local probe candidate",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "JOURNAL",
        "to": "BUP",
        "label": "observed probe outcome",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "HYP",
        "to": "BUP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BUP",
        "to": "BUS",
        "label": "BELIEF_UPDATE",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "HYP",
        "label": "updated hypotheses",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EVID",
        "to": "SOP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SOP",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AGATE",
        "to": "ARTIF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ARTIF",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ARTIF",
        "to": "CAP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ARTIF",
        "to": "SPROJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "OPT",
        "to": "AGATE",
        "label": "optional candidate only",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LCOVER",
        "to": "LREPAIR",
        "label": "inadequate",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LREPAIR",
        "to": "SCAND",
        "label": "fresh SKILL_LOCAL additions",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LREPAIR",
        "to": "BUILD",
        "label": "fresh GLOBAL additions",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LREPAIR",
        "to": "SCHED",
        "label": "scheduled repair",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LCOVER",
        "to": "WAITR",
        "label": "budget exhausted",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LROUTE",
        "to": "WAITR",
        "label": "WAIT / CONTINUE",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LROUTE",
        "to": "CANCEL",
        "label": "ABORT",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LROUTE",
        "to": "LREPAIR",
        "label": "ESCALATE_FAST / DEEP",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LROUTE",
        "to": "LCOVER",
        "label": "NO_VALID_ACTION",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "GDRT",
        "to": "OWNER",
        "label": "primitive / INFO",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "GDRT",
        "to": "WAITR",
        "label": "WAIT / CONTINUE",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "GDRT",
        "to": "CANCEL",
        "label": "ABORT",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "GDRT",
        "to": "LREPAIR",
        "label": "ESCALATE / NO_VALID_ACTION",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "WAITR",
        "to": "OWNER",
        "label": "valid continuation",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "WAITR",
        "to": "OWNER",
        "label": "safe hold",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "OWNER",
        "to": "CTRL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SMON",
        "to": "RETURN",
        "label": "child complete",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RETURN",
        "to": "RESUME",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RESUME",
        "to": "SPROJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "STACK",
        "to": "RESUME",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RESUME",
        "to": "OWNER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SMON",
        "to": "BUS",
        "label": "root skill complete",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SMON",
        "to": "WATCH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "RECEIPT",
        "to": "WATCH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "WATCH",
        "to": "CANCEL",
        "label": "timeout / no progress",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "WATCH",
        "to": "LREPAIR",
        "label": "bounded repair",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CANCEL",
        "to": "EPOCH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "EPOCH",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CANCEL",
        "to": "RECEIPT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SAFE",
        "to": "EPOCH",
        "label": "emergency preempt",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SAFE",
        "to": "CADMIT",
        "label": "priority stop",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "BOARD",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CAP",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "OWNER",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CADMIT",
        "to": "RECEIPT",
        "label": "rejected / expired",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LREC",
        "to": "CREDIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "LREC",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "USER",
        "to": "MISSION",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MISSION",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MISSION",
        "to": "MVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MISSION",
        "to": "BUILD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MISSION",
        "to": "SCAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MISSION",
        "to": "PROBE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MISSION",
        "to": "GVR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "CYCLE",
        "to": "GVR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MISSION",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MISSION",
        "to": "EPOCH",
        "label": "replacement revokes epoch",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "MISSION",
        "to": "ORACLE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "JOURNAL",
        "to": "ORACLE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ORACLE",
        "to": "CREDIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ORACLE",
        "to": "AGATE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "PROFILE",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "SCHED",
        "to": "METRIC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "ORACLE",
        "to": "METRIC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "METRIC",
        "to": "AGATE",
        "label": "validated recommendation",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      },
      {
        "from": "AGATE",
        "to": "PROFILE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/cognition"
      }
    ],
    "groups": [
      {
        "id": "PER",
        "label": "PERCEPTION + STATE SUBSTRATE — OUTSIDE LEVELS 1–5"
      },
      {
        "id": "CAND",
        "label": "CANDIDATE SPACE — BEFORE JEV"
      },
      {
        "id": "MEMORY",
        "label": "PAST EVIDENCE / MEMORYBRIDGE"
      },
      {
        "id": "FUT",
        "label": "FUTURE / WORLD MODEL"
      },
      {
        "id": "PROJ",
        "label": "ROLE-SPECIFIC CONTEXT PROJECTION — ONE CANONICAL TRUTH, DIFFERENT EVIDENCE"
      },
      {
        "id": "L5",
        "label": "LEVEL 5 — DEEP STRATEGIC REASONING — SECONDS→MINUTES, ONLY WHEN NEEDED"
      },
      {
        "id": "L4",
        "label": "LEVEL 4 — FAST CONSCIOUS REASONING — ~1–5 s, EVENT-TRIGGERED"
      },
      {
        "id": "L3",
        "label": "LEVEL 3 — META / INTUITION — EVENT-TRIGGERED, EXACTLY ONE META LAYER"
      },
      {
        "id": "L2",
        "label": "LEVEL 2 — REAL-TIME SEMANTIC ACTION BRAIN — TARGET ~200 ms / ~5 Hz WHERE LATENCY PERMITS"
      },
      {
        "id": "PLAN",
        "label": "PRESENT/MIDDLE PLAN AUTHORITY + STALENESS PROTECTION"
      },
      {
        "id": "SKILLRT",
        "label": "AUTOMATIC ADAPTIVE SKILL RUNTIME v1.2 — HOW A SELECTED SKILL RUNS"
      },
      {
        "id": "CONTROL",
        "label": "SELECTIVE COGNITION CONTROL — ATTENTION ≠ META"
      },
      {
        "id": "LEARN",
        "label": "OUTCOME → CREDIT → CONTINUAL LEARNING / COGNITIVE COMPILATION"
      },
      {
        "id": "GENERAL",
        "label": "EVIDENCE, NOVELTY AND ACTIVE INQUIRY"
      },
      {
        "id": "LCONTROL",
        "label": "COMPLETE LOCAL CONTROL AND OWNERSHIP"
      },
      {
        "id": "MISSIONPROFILE",
        "label": "MISSION AUTHORITY, INDEPENDENT EVALUATION AND MEASURED COMPUTE"
      }
    ]
  },
  {
    "id": "runtime",
    "title": "2 — Runtime / Systems Architecture v1.10 CANONICAL",
    "nodes": [
      {
        "id": "TITLE",
        "label": "RUNTIME / SYSTEMS ARCHITECTURE v1.10 · Asynchronous • versioned • event-driven • one state writer • one live execution authority",
        "kind": "code",
        "group": "general",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "ENV",
        "label": "Live Environment",
        "kind": "code",
        "group": "ENVIO",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "IFACE",
        "label": "Environment Interface / Adapter · observation API + authorized action API",
        "kind": "code",
        "group": "ENVIO",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "CAP",
        "label": "Environment Capability Schema · observations + legal actions + affordances + mechanics + control constraints",
        "kind": "code",
        "group": "ENVIO",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PER",
        "label": "Perception / State Extraction",
        "kind": "code",
        "group": "ENVIO",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FULL",
        "label": "Full Local / Machine State · detailed telemetry / tracked entities / controller state",
        "kind": "code",
        "group": "ENVIO",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "EVBUF",
        "label": "Raw Event Buffer · ~10–15 s timestamped changes",
        "kind": "code",
        "group": "ENVIO",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "BUS",
        "label": "Typed Cognitive Event Bus",
        "kind": "code",
        "group": "STATE",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "RED",
        "label": "Blackboard Reducer · ONLY canonical cognitive-state writer",
        "kind": "code",
        "group": "STATE",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "BOARD",
        "label": "Immutable Executive Blackboard · belief + Recent Context + accepted goals/plans + candidate set · predictions + skills + adviser/meta state + uncertainty + service/version state",
        "kind": "decision",
        "group": "STATE",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MEMIF",
        "label": "Memory + Validated Rules Interface · MemoryBridge / Hindsight / MemOS / stats / contradictions / reliability · memory_version",
        "kind": "memory",
        "group": "LEARNIF",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "WMIF",
        "label": "World Model + Calibration Interface · hybrid dynamics + horizon heads + reliability · world_model_version",
        "kind": "world",
        "group": "LEARNIF",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "POLIF",
        "label": "Middle + Meta Policy / Reliability Interface · adviser reliability + Meta-Middle policy · policy_version",
        "kind": "decision",
        "group": "LEARNIF",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MOPIF",
        "label": "Meta Outcome Predictor Interface · versioned learned predictor",
        "kind": "world",
        "group": "LEARNIF",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKIF",
        "label": "Skill Registry + Competence Interface · validated skill versions + maturity + contextual reliability + OOD · skill_registry_version",
        "kind": "skill",
        "group": "LEARNIF",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "UNC",
        "label": "Source-Separated Uncertainty / Reliability Vector · observation/belief • memory/rules • prediction/calibration • adviser freshness · skill competence/OOD • meta reliability • service health • plan validity • candidate coverage",
        "kind": "code",
        "group": "general",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "TRIG",
        "label": "Triggers / Job Proposals · decision clock + event/TTL + attention + monitor + learning/background jobs",
        "kind": "code",
        "group": "ORCH",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SCHED",
        "label": "ONE Cognitive Scheduler · priority by urgency + deadline + staleness + uncertainty + value-of-information · strategic importance + compute/API/token cost + safe-continuation state",
        "kind": "code",
        "group": "ORCH",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "ENVLP",
        "label": "Versioned Job Envelope · job_type + temporal role tag PAST / PRESENT_MIDDLE / FUTURE / SUPPORT · request/task IDs + mission/schema/capability/epoch/profile versions · local scope/frame/candidate IDs + deadline/TTL + provenance + expected schema",
        "kind": "decision",
        "group": "ORCH",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "ROUTER",
        "label": "Job-Type Router",
        "kind": "code",
        "group": "ORCH",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "GUARD",
        "label": "Service Guard · timeout + retry limit + cancel + circuit breaker + service state + degraded mode",
        "kind": "code",
        "group": "ORCH",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "JQ",
        "label": "Jev Queue",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "JEV",
        "label": "TypeSafe / Jev Service · typed judgments only",
        "kind": "jev",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "JBUS",
        "label": "Jev Result Bus + Task/Request Demux",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "LQ",
        "label": "Flash-Lite Queue",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FLS",
        "label": "ONE Gemini 2.5 Flash-Lite Service · recent summaries + strategic compression",
        "kind": "fast",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "LBUS",
        "label": "Flash-Lite Result Bus + Demux",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "GQ",
        "label": "Gemini Queue",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "GEM",
        "label": "Gemini 3.8 Flash Service · fast reasoning / candidate repair / routine synthesis",
        "kind": "fast",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "GBUS",
        "label": "Gemini Result Bus + Demux",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DQ",
        "label": "Deep Queue",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DEEP",
        "label": "Hermes + GPT-Sol Service · deep strategic / novelty / difficult abstraction",
        "kind": "deep",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DBUS",
        "label": "Deep Result Bus + Demux",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "WQ",
        "label": "World-Model Queue",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "WMSVC",
        "label": "Hybrid World-Model Inference Service · candidate-conditioned rollouts",
        "kind": "world",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "WBUS",
        "label": "World-Model Result Bus + Demux",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MPQ",
        "label": "Meta-Predictor Queue",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MOPSVC",
        "label": "Meta Outcome Predictor Service · counterfactual consequences of supplied meta strategies",
        "kind": "world",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MPBUS",
        "label": "Meta-Predictor Result Bus + Demux",
        "kind": "code",
        "group": "SERVICES",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SUMJOB",
        "label": "COMPRESS_RECENT Job · event_window_id + source world/belief versions",
        "kind": "code",
        "group": "SUMMARY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SFRESH",
        "label": "Summary Freshness Gate · request/window identity + compatible versions + TTL + no superseding summary",
        "kind": "code",
        "group": "SUMMARY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "RECENT",
        "label": "Fresh Recent Context",
        "kind": "fast",
        "group": "SUMMARY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "LEGAL",
        "label": "Legal Primitive Generator",
        "kind": "code",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKRET",
        "label": "Applicable Skill Retriever · exact skill_id + skill_version",
        "kind": "skill",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PLANACT",
        "label": "Accepted Plan Actions / Subgoals",
        "kind": "decision",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "BUILD",
        "label": "Candidate Builder",
        "kind": "code",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "COVER",
        "label": "Coverage Check · meaningful legal choices + mature skills + plan actions · INFO + WAIT + ABORT + ESCALATE + NO_VALID_ACTION",
        "kind": "code",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FASTCJ",
        "label": "GENERATE_CANDIDATES_FAST Job · Gemini repair / expansion",
        "kind": "code",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FASTRES",
        "label": "Fast Candidate Result Freshness + Validation",
        "kind": "code",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DEEPCHK",
        "label": "Coverage still inadequate / truly novel?",
        "kind": "decision",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DEEPCJ",
        "label": "GENERATE_CANDIDATES_DEEP Job · Hermes/Sol expansion",
        "kind": "code",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DEEPRES",
        "label": "Deep Candidate Result Freshness + Validation",
        "kind": "code",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "CSET",
        "label": "Versioned Candidate Set · primitive / skill / plan-action / information / WAIT / ABORT · ESCALATE_FAST / ESCALATE_DEEP / NO_VALID_ACTION",
        "kind": "decision",
        "group": "CAND",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "CYCLE",
        "label": "Atomic Decision-Cycle Snapshot · captured from ONE coherent Blackboard version · belief + goal + candidate_set + incident + uncertainty · pins memory/world-model/policy/skill-registry + mission/schema/capability/epoch/profile versions",
        "kind": "decision",
        "group": "general",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "WJOB",
        "label": "RUN_WORLD_MODEL Job · same cycle + same candidate-set version + pinned world_model_version",
        "kind": "world",
        "group": "FORECAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PFRESH",
        "label": "Prediction Freshness Gate · cycle/belief/goal/candidate/world-model compatibility + TTL + assumptions",
        "kind": "code",
        "group": "FORECAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "POK",
        "label": "Fresh Prediction Package · candidate → immediate/tactical/strategic consequences · uncertainty + calibration + PREDICTED/SIMULATED provenance",
        "kind": "world",
        "group": "FORECAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "GVR",
        "label": "Goal / Value / Risk Evaluator · separate desirability layer",
        "kind": "world",
        "group": "FORECAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PID",
        "label": "Projection Identity Contract · projection_id / request_id + source Blackboard/cycle version + temporal role · evidence IDs + schema + omitted fields + expansion budget · timestamp/TTL + provenance + assumptions + expected output schema",
        "kind": "code",
        "group": "PROJ",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PCTX",
        "label": "Past Context Builder · same cycle + same candidates + bounded historical evidence · validated historical rules/stats + memory reliability + provenance",
        "kind": "memory",
        "group": "PROJ",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FCTX",
        "label": "Future Context Builder · same cycle + same candidates + fresh forecasts · Goal/Value/Risk + prediction reliability",
        "kind": "world",
        "group": "PROJ",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MCTX",
        "label": "Middle Context Builder · same cycle + same candidates + actual adviser outputs · degraded-mode state + arbitration policy + skill competence + cached meta + uncertainty",
        "kind": "decision",
        "group": "PROJ",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MCX",
        "label": "Meta Conflict Context Builder · actual Past/Future advice + disagreement + stakes · source reliability + uncertainty + meta-strategy candidates",
        "kind": "decision",
        "group": "PROJ",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PFAST",
        "label": "Past Gemini Context · selected historical evidence + current incident",
        "kind": "memory",
        "group": "PROJ",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MFAST",
        "label": "Present/Middle Gemini Tactical Context · bounded incident + goals + Recent Context + selected memory/predictions · active skill/failure + uncertainty + candidates",
        "kind": "fast",
        "group": "PROJ",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FFAST",
        "label": "Future Gemini Context · fresh forecasts + risk + current incident",
        "kind": "world",
        "group": "PROJ",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PRET",
        "label": "Historical Retrieval Package · similar episodes + procedures + validated rules + action values · support/contradictions + exceptions + memory reliability",
        "kind": "memory",
        "group": "ADVISERS",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PJOB",
        "label": "RUN_PAST_JEV Job",
        "kind": "code",
        "group": "ADVISERS",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FREADY",
        "label": "Future Evidence Readiness Gate · same cycle + fresh prediction + goal/constraints + pinned world model",
        "kind": "code",
        "group": "ADVISERS",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FJOB",
        "label": "RUN_FUTURE_JEV Job",
        "kind": "code",
        "group": "ADVISERS",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "AFRESH",
        "label": "Adviser Freshness / Availability · both / Past-only / Future-only / neither · ACCEPT / ACCEPT_WITH_AGE / REJECT_STALE / CANCELLED",
        "kind": "code",
        "group": "ADVISERS",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PA",
        "label": "Fresh / Acceptable Past Advice",
        "kind": "jev",
        "group": "ADVISERS",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FA",
        "label": "Fresh / Acceptable Future Advice",
        "kind": "jev",
        "group": "ADVISERS",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MTRIG",
        "label": "Meta Trigger · meaningful Past/Future disagreement + unreliable source + high stakes · poor coverage/OOD + repeated arbitration failure",
        "kind": "code",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MOPT",
        "label": "Meta-Strategy Candidate Set · TRUST_PAST / TRUST_FUTURE / BLEND / FOLLOW_MIDDLE_DEFAULT · IGNORE_BOTH / GATHER_INFORMATION / ESCALATE_FAST / ESCALATE_DEEP",
        "kind": "decision",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MOPJOB",
        "label": "RUN_META_OUTCOME_PREDICTOR Job",
        "kind": "code",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MOPFRESH",
        "label": "Meta Outcome Prediction Freshness Gate",
        "kind": "code",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MOP",
        "label": "Fresh Meta Outcome Package · predicted consequence + risk/uncertainty for each supplied meta strategy",
        "kind": "world",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MPJOB",
        "label": "RUN_META_PAST Job",
        "kind": "code",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MFJOB",
        "label": "RUN_META_FUTURE Job",
        "kind": "code",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MAVAIL",
        "label": "Meta Adviser Freshness / Availability",
        "kind": "code",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MMCTX",
        "label": "Meta-Middle Context · conflict + available meta advisers + learned meta policy + uncertainty",
        "kind": "decision",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MMJOB",
        "label": "RUN_META_MIDDLE Job",
        "kind": "code",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MGFRESH",
        "label": "Meta-Guidance Freshness Gate",
        "kind": "code",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MGCACHE",
        "label": "Cached Valid Meta Guidance · Middle never waits for fresh meta",
        "kind": "decision",
        "group": "META",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MJOB",
        "label": "RUN_MIDDLE_JEV Job",
        "kind": "code",
        "group": "FAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DEAD",
        "label": "Middle Deadline Guard",
        "kind": "code",
        "group": "FAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FALL",
        "label": "Defined Fallback · continue currently valid active skill → valid cached action/policy · → deterministic safe fallback + escalation",
        "kind": "code",
        "group": "FAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MERGE",
        "label": "Decision Result Merge",
        "kind": "code",
        "group": "FAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FINAL",
        "label": "CURRENT-STATE Final Validity Gate · target exists + legality/capability + hard safety · current skill competence/OOD/revocation + current constraints",
        "kind": "code",
        "group": "FAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DEC",
        "label": "Validated Immediate Decision",
        "kind": "decision",
        "group": "FAST",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PEND",
        "label": "Pending Decision Record · ORIGINAL cycle snapshot + selected candidate + adviser/meta IDs · prediction/plan/reasoning IDs + exact skill_id/version + execution-time versions",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DRT",
        "label": "Decision Router · primitive / skill / INFO / WAIT / ABORT / ESCALATE",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "WAITR",
        "label": "WAIT Resolver · continue active valid skill else safe hold / NO_OP",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKVER",
        "label": "Exact Skill Version Resolver · reject unavailable/revoked version",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKCTX",
        "label": "Skill Runtime Contract · goal + preconditions + bounded state schema · operators/subskills + expected effects + recovery + termination + OOD · stored Jev typed-question template",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKPROJ",
        "label": "Deterministic Skill State Projector · current Blackboard → skill-relevant state · preserve observed / remembered / predicted provenance",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKCAND",
        "label": "Skill-Local Candidate Builder · legal primitives + applicable subskills · WAIT / ABORT / INSPECT / ESCALATE",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKFILT",
        "label": "Skill-Local Legality + Safety + Freshness Filter · remove impossible / stale / invalid options",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKQ",
        "label": "Question Builder · fill stored Jev template · neutral candidate IDs + descriptions",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKJOB",
        "label": "RUN_SKILL_JEV Job · event-triggered semantic operator/subskill choice",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKRES",
        "label": "Skill Jev Result Freshness Gate · request + skill/version + Blackboard/state compatibility",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKFVG",
        "label": "Skill-Local Current-State Final Validity Gate · recheck selected operator/subskill against current target + legality · capability + safety + competence/revocation + OOD",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKROUTE",
        "label": "Skill-local choice type?",
        "kind": "decision",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKEX",
        "label": "Active Skill / Parent Policy · executes one bounded semantic step",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PUSH",
        "label": "Push Child Skill Frame · parent execution waits with return contract",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "STACK",
        "label": "Parent–Child Skill Call Stack · durable exact frames + pinned versions + return target · push on call; pop only completed/unwound child",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "RETURN",
        "label": "Structured Subskill Return · status + findings/effects/confidence/provenance · release child resources + continuation identity",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SKMON",
        "label": "Skill Runtime Monitor · progress + applicability + OOD + expected-vs-actual + failure",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SUPD",
        "label": "Skill State Updater · last action + expected effect + actual effect + local attempt history · publishes typed event; Blackboard Reducer remains sole canonical writer",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "EVENT",
        "label": "Skill complete / meaningful event?",
        "kind": "decision",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "CONT",
        "label": "Continue Deterministic Controller · no new Jev call while expected progress continues",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "CTRL",
        "label": "Deterministic Low-Level Controller · trajectory / PID / MPC / command translation as appropriate",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "QUEUE",
        "label": "Action Queue / Interrupt Handling",
        "kind": "skill",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "CANCEL",
        "label": "Cancellation Controller · scope + descendants; unwind frames; revoke lease · purge queue + interrupted receipts",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "REFLEX",
        "label": "Hard Safety / Reflex · highest priority preemption",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "AUTH",
        "label": "SINGLE EXECUTION AUTHORITY",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "RECEIPT",
        "label": "Execution Receipt · actual behavior/command + start/end + cancellation/interruption · environment acknowledgement/error",
        "kind": "code",
        "group": "EXEC",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "ATT",
        "label": "Attention / Escalation Controller · novelty + surprise + risk + opportunity + adviser disagreement · prediction error + repeated failure + important uncertainty",
        "kind": "code",
        "group": "MONITOR",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MON",
        "label": "Execution Monitor · expected vs actual progress for skill + tactical plan + strategic goal · blocked / stalled / target lost / assumption invalid / major deviation",
        "kind": "code",
        "group": "MONITOR",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PFASTJ",
        "label": "PAST_GEMINI advisory job · retrospective interpretation / historical repair",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MFASTJ",
        "label": "PRESENT_MIDDLE_FAST_REPLAN job · only this role may emit commit-eligible tactical proposal",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FFASTJ",
        "label": "FUTURE_GEMINI advisory job · forecast consequence analysis / prospective repair",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "TPFRESH",
        "label": "Gemini Result Freshness + Role Demux",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PADV",
        "label": "Fresh Past Tactical Advice",
        "kind": "fast",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "TPROP",
        "label": "Fresh Present/Middle Tactical Plan Proposal",
        "kind": "fast",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FADV",
        "label": "Fresh Future Tactical Advice",
        "kind": "fast",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SRETR",
        "label": "Strategic Evidence Retrieval · memory + skills + forecasts + execution history",
        "kind": "memory",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "RERANKJ",
        "label": "RERANK_EVIDENCE Job · Jev relevance judgment",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "FILTER",
        "label": "Freshness + Provenance + Importance Filter",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "COMPJ",
        "label": "COMPRESS_STRATEGIC_CONTEXT Job · same shared Flash-Lite service",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "BRIEF",
        "label": "Compact Strategic Evidence Base",
        "kind": "deep",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "P5CTX",
        "label": "Past Deep Brief · historical abstraction emphasis",
        "kind": "memory",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "M5CTX",
        "label": "Present/Middle Deep Brief · strategy / novelty / failure emphasis",
        "kind": "deep",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "F5CTX",
        "label": "Future Deep Brief · counterfactual / long-horizon emphasis",
        "kind": "world",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "P5J",
        "label": "PAST_DEEP advisory job",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "M5J",
        "label": "PRESENT_MIDDLE_DEEP_PLAN job · only this role may emit commit-eligible strategic proposal",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "F5J",
        "label": "FUTURE_DEEP advisory job",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "DPFRESH",
        "label": "Deep Result Freshness + Role Demux",
        "kind": "code",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "P5ADV",
        "label": "Fresh Past Strategic Advice",
        "kind": "deep",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SPROP",
        "label": "Fresh Present/Middle Strategic Plan Proposal",
        "kind": "deep",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "F5ADV",
        "label": "Fresh Future Strategic Advice",
        "kind": "deep",
        "group": "REASON",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "COMMIT",
        "label": "Plan Commit / Staleness Gate · check current world/belief/goal/plan/incident versions + assumptions · ACCEPT / REBASE / REJECT_STALE / REJECT_INVALID / RECONSIDER",
        "kind": "code",
        "group": "PLANCOMMIT",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "ACCEPT",
        "label": "Accepted Plan Event · mission-constrained strategy OR tactical plan/subgoals",
        "kind": "decision",
        "group": "PLANCOMMIT",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "LATER",
        "label": "Later Belief Snapshot",
        "kind": "code",
        "group": "LEARNOUT",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "LI",
        "label": "Learning Input Bundle · Pending Decision + Execution Receipt + Later Belief + prediction snapshot · accepted Plan-Commit components + current goals/priorities + Capability Schema · same Scheduler / background compute budget",
        "kind": "memory",
        "group": "LEARNOUT",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "LOCK",
        "label": "RUNTIME INVARIANTS · Every model/inference invocation follows Job Proposal → Scheduler → Versioned Envelope → Job Router → Service Guard → Queue → Service → Result Bus/Demux → Freshness Gate → Consumer. · Late results never overwrite newer state. Slow services never freeze the live loop. No model directly mutates Blackboard or the environment.",
        "kind": "code",
        "group": "general",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "JOURNAL",
        "label": "Durable Raw Evidence / Receipt Journal · append immediately; bounded working buffer is not retention",
        "kind": "memory",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "EREQ",
        "label": "Evidence / Representation Request Router · FETCH / EXPAND / REOBSERVE / INSPECT / PROBE · PROPOSE_SCHEMA / OPERATOR; scope + budget",
        "kind": "code",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SRCREAD",
        "label": "Deterministic Source Retrieval · source IDs + cited omissions + access/freshness limits",
        "kind": "memory",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "INQJOB",
        "label": "Evidence / Hypothesis / Schema Job Proposal · typed operation + role + source versions + bounded budget",
        "kind": "code",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "IFRESH",
        "label": "Inquiry Result Gate / Typed Demux · freshness + schema + source provenance + mission · model statements stay hypotheses",
        "kind": "code",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "EVID",
        "label": "Validated Expanded Evidence · typed event; regenerate affected contexts",
        "kind": "memory",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "HYP",
        "label": "Versioned Hypothesis Set · OTHER / UNKNOWN; calibrated or uncalibrated",
        "kind": "world",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PROBE",
        "label": "Deterministic Active Probe Selector · decision benefit or information gain minus cost/risk · legal options + uncertainty + stop reason",
        "kind": "world",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "BUP",
        "label": "Observed-Outcome Belief Updater · likelihood update or explicit UNKNOWN",
        "kind": "code",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "SOP",
        "label": "Operational Schema / Operator Candidate · evidence + extractor/primitive mapping; not deployable",
        "kind": "skill",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "ARTIF",
        "label": "Compatible Promoted Artifact Bundle Interface · schema/capability dependencies; safe-boundary activation · rollback/revocation event; cycles stay pinned",
        "kind": "skill",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "REPAIRLIMIT",
        "label": "Scoped Repair Budget / Progress Gate · GLOBAL or SKILL_LOCAL + original cycle/frame/candidates · dedupe + retry/time limits + fast-then-deep stage",
        "kind": "code",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "RSCOPE",
        "label": "Validated repair scope?",
        "kind": "decision",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "LCOVER",
        "label": "Local legal-set coverage adequate?",
        "kind": "decision",
        "group": "INQUIRY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "LREC",
        "label": "Local Decision Record · parent/child IDs + skill/version + projected state · candidate order + raw answer + actual rule/known propensity",
        "kind": "memory",
        "group": "OWNERSHIP",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "CLAIM",
        "label": "Acquire / Transfer Execution Lease · suspend old incompatible owner before new frame · parent waits while child owns resource",
        "kind": "code",
        "group": "OWNERSHIP",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "OWNER",
        "label": "Current Execution Owner / Lease Gate · one issuer per resource; handoff confirmed",
        "kind": "code",
        "group": "OWNERSHIP",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "RESUME",
        "label": "Revalidate Continuation / Restore Same Parent Frame · pop completed child; release resources; check assumptions",
        "kind": "skill",
        "group": "OWNERSHIP",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "ESCJOB",
        "label": "Bounded Escalation Job / Checkpoint · FAST or DEEP; incident budget + resumable frame",
        "kind": "code",
        "group": "OWNERSHIP",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "EPOCH",
        "label": "Execution Epoch + Revocation State · cancel / mission change / emergency invalidates old commands",
        "kind": "code",
        "group": "OWNERSHIP",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "CENV",
        "label": "Command Envelope · command/decision/execution IDs + lease/epoch · versions + expiry + preconditions + idempotency key",
        "kind": "code",
        "group": "OWNERSHIP",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "CADMIT",
        "label": "Command Admission / Fencing · immediately before dispatch: mission + current safety/capability · lease/epoch + expiry + preconditions; reconcile uncertain retries",
        "kind": "code",
        "group": "OWNERSHIP",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "WATCH",
        "label": "Liveness / Progress Watchdog · child timeout + command acknowledgement + deadlock · bounded depth/retries/time/escalation; stop progress-free loops",
        "kind": "code",
        "group": "OWNERSHIP",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "USER",
        "label": "Trusted User / Authorized Mission Source",
        "kind": "code",
        "group": "AUTHORITY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MISSION",
        "label": "Versioned Root Mission Contract · objective + observable acceptance + permissions/constraints · budgets + authorized subgoal changes; data cannot grant authority",
        "kind": "decision",
        "group": "AUTHORITY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MVALID",
        "label": "Mission Validator · proposal within authorized root mission; reject or clarify",
        "kind": "code",
        "group": "AUTHORITY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "ORACLE",
        "label": "Independent Success Oracle · environment tests / source checks / pending human review · planner and learners have no write access",
        "kind": "code",
        "group": "AUTHORITY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "MHIST",
        "label": "Meta-Past History / Reliability Package · context + observed strategy outcomes + uncertainty",
        "kind": "memory",
        "group": "AUTHORITY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "PROFILE",
        "label": "Versioned Compute Profile Registry · MINIMAL_BASELINE / TEMPORAL / FULL_RESEARCH · activation via validated compatible bundle only",
        "kind": "code",
        "group": "AUTHORITY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "TELEMETRY",
        "label": "End-to-End Latency / Cost / Deadline Telemetry · p50/p95/p99 + tokens/calls + queue/load + learning cost",
        "kind": "code",
        "group": "AUTHORITY",
        "view": "runtime",
        "status": "Documented design"
      },
      {
        "id": "INQIN",
        "label": "Learning Inquiry Request Interface · request only; normal mission and action validation",
        "kind": "code",
        "group": "general",
        "view": "runtime",
        "status": "Documented design"
      }
    ],
    "edges": [
      {
        "from": "ENV",
        "to": "IFACE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "IFACE",
        "to": "PER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PER",
        "to": "FULL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "IFACE",
        "to": "CAP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PER",
        "to": "EVBUF",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FULL",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BUS",
        "to": "RED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RED",
        "to": "BOARD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MEMIF",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WMIF",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POLIF",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOPIF",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKIF",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "UNC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "TRIG",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SCHED",
        "to": "ENVLP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ENVLP",
        "to": "ROUTER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ROUTER",
        "to": "GUARD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "UNC",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JQ",
        "to": "JEV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JEV",
        "to": "JBUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LQ",
        "to": "FLS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FLS",
        "to": "LBUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GQ",
        "to": "GEM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GEM",
        "to": "GBUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DQ",
        "to": "DEEP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DEEP",
        "to": "DBUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WQ",
        "to": "WMSVC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WMSVC",
        "to": "WBUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MPQ",
        "to": "MOPSVC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOPSVC",
        "to": "MPBUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "JQ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "LQ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "GQ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "DQ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "WQ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "MPQ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVBUF",
        "to": "SUMJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SUMJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LBUS",
        "to": "SFRESH",
        "label": "COMPRESS_RECENT result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "SFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SFRESH",
        "to": "RECENT",
        "label": "ACCEPT / ACCEPT_WITH_AGE",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RECENT",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "LEGAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "LEGAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "SKRET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKIF",
        "to": "SKRET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "PLANACT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LEGAL",
        "to": "BUILD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKRET",
        "to": "BUILD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PLANACT",
        "to": "BUILD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BUILD",
        "to": "COVER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "COVER",
        "to": "CSET",
        "label": "adequate",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "COVER",
        "to": "REPAIRLIMIT",
        "label": "global repair request",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FASTCJ",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GBUS",
        "to": "FASTRES",
        "label": "candidate-generation result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "FASTRES",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "FASTRES",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FASTRES",
        "to": "DEEPCHK",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DEEPCHK",
        "to": "RSCOPE",
        "label": "no, validated additions",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DEEPCHK",
        "to": "REPAIRLIMIT",
        "label": "request deep stage",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DEEPCJ",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DBUS",
        "to": "DEEPRES",
        "label": "deep candidate result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "DEEPRES",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "DEEPRES",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DEEPRES",
        "to": "RSCOPE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CSET",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "CYCLE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CYCLE",
        "to": "WJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WMIF",
        "to": "WJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WBUS",
        "to": "PFRESH",
        "label": "RUN_WORLD_MODEL result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "PFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PFRESH",
        "to": "POK",
        "label": "ACCEPT / ACCEPT_WITH_AGE",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "GVR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CYCLE",
        "to": "PID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PID",
        "to": "PCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PID",
        "to": "FCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PID",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PID",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CYCLE",
        "to": "PCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CYCLE",
        "to": "FCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CYCLE",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CYCLE",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MEMIF",
        "to": "PCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "FCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GVR",
        "to": "FCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKIF",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POLIF",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "UNC",
        "to": "PCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "UNC",
        "to": "FCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "UNC",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "UNC",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CYCLE",
        "to": "PRET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MEMIF",
        "to": "PRET",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PRET",
        "to": "PCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PCTX",
        "to": "PJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FCTX",
        "to": "FREADY",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FREADY",
        "to": "FJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JBUS",
        "to": "AFRESH",
        "label": "Past/Future demux results",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "AFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "AFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "AFRESH",
        "to": "PA",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "AFRESH",
        "to": "FA",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PA",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FA",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PA",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FA",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PA",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FA",
        "to": "MCX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PA",
        "to": "MTRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FA",
        "to": "MTRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "UNC",
        "to": "MTRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MTRIG",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MCX",
        "to": "MOPT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MCX",
        "to": "MOPJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOPT",
        "to": "MOPJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOPIF",
        "to": "MOPJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOPJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MPBUS",
        "to": "MOPFRESH",
        "label": "meta-outcome result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "MOPFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOPFRESH",
        "to": "MOP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MCX",
        "to": "MPJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOPT",
        "to": "MPJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MPJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MCX",
        "to": "MFJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOPT",
        "to": "MFJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOP",
        "to": "MFJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MFJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JBUS",
        "to": "MAVAIL",
        "label": "Meta-Past / Meta-Future demux results",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "MAVAIL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MAVAIL",
        "to": "MMCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MCX",
        "to": "MMCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MOP",
        "to": "MMCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POLIF",
        "to": "MMCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "UNC",
        "to": "MMCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MMCTX",
        "to": "MMJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MMJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JBUS",
        "to": "MGFRESH",
        "label": "Meta-Middle result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "MGFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MGFRESH",
        "to": "MGCACHE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MGCACHE",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MGCACHE",
        "to": "MCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MCTX",
        "to": "MJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JBUS",
        "to": "DEAD",
        "label": "Middle demux result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DEAD",
        "to": "MERGE",
        "label": "on time",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DEAD",
        "to": "FALL",
        "label": "late / unavailable",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FALL",
        "to": "MERGE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MERGE",
        "to": "FINAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "FINAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "FINAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKIF",
        "to": "FINAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FINAL",
        "to": "DEC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DEC",
        "to": "PEND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PEND",
        "to": "DRT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DRT",
        "to": "CLAIM",
        "label": "new skill",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CLAIM",
        "to": "SKVER",
        "label": "new global frame",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKVER",
        "to": "SKCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKCTX",
        "to": "SKPROJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKPROJ",
        "to": "SKCAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKCAND",
        "to": "SKFILT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKFILT",
        "to": "LCOVER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LCOVER",
        "to": "SKQ",
        "label": "adequate",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKQ",
        "to": "SKJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JBUS",
        "to": "SKRES",
        "label": "RUN_SKILL_JEV result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKRES",
        "to": "SKFVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKFVG",
        "to": "LREC",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LREC",
        "to": "SKROUTE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKROUTE",
        "to": "SKEX",
        "label": "primitive / INFO operator",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKEX",
        "to": "OWNER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "OWNER",
        "to": "CTRL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKROUTE",
        "to": "PUSH",
        "label": "subskill",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PUSH",
        "to": "CLAIM",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CLAIM",
        "to": "STACK",
        "label": "child frame",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "STACK",
        "to": "SKVER",
        "label": "pushed child only",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DRT",
        "to": "OWNER",
        "label": "primitive / INFO",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DRT",
        "to": "WAITR",
        "label": "WAIT / CONTINUE",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WAITR",
        "to": "RESUME",
        "label": "same active frame, never restart",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WAITR",
        "to": "OWNER",
        "label": "safe hold",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DRT",
        "to": "CANCEL",
        "label": "ABORT",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CANCEL",
        "to": "EPOCH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EPOCH",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DRT",
        "to": "ESCJOB",
        "label": "ESCALATE",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ESCJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PEND",
        "to": "SKVER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKIF",
        "to": "SKVER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKIF",
        "to": "SKCTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKIF",
        "to": "SKFVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "SKPROJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "SUPD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "SKFVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "SKCAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "SKFVG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "CTRL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKCTX",
        "to": "SKMON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKEX",
        "to": "SKMON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CTRL",
        "to": "CENV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CENV",
        "to": "QUEUE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "QUEUE",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CADMIT",
        "to": "AUTH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PER",
        "to": "REFLEX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "REFLEX",
        "to": "CADMIT",
        "label": "priority safety command",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "AUTH",
        "to": "IFACE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "AUTH",
        "to": "RECEIPT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RECEIPT",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RECEIPT",
        "to": "SUPD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SUPD",
        "to": "SKMON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKMON",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKMON",
        "to": "EVENT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVENT",
        "to": "SKPROJ",
        "label": "meaningful change / failure / retry",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVENT",
        "to": "CONT",
        "label": "normal progress",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CONT",
        "to": "CTRL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVENT",
        "to": "RETURN",
        "label": "child complete",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RETURN",
        "to": "RESUME",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RESUME",
        "to": "STACK",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "STACK",
        "to": "SKPROJ",
        "label": "existing parent frame",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVENT",
        "to": "BUS",
        "label": "skill goal complete",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "ATT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "MON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "ATT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "MON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "UNC",
        "to": "ATT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RECEIPT",
        "to": "MON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKMON",
        "to": "MON",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKMON",
        "to": "ATT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ATT",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MON",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "PFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MEMIF",
        "to": "PFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "MFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MEMIF",
        "to": "MFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "MFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "FFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "FFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PFAST",
        "to": "PFASTJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PFASTJ",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MFAST",
        "to": "MFASTJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MFASTJ",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FFAST",
        "to": "FFASTJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FFASTJ",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GBUS",
        "to": "TPFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "TPFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "TPFRESH",
        "to": "PADV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "TPFRESH",
        "to": "TPROP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "TPFRESH",
        "to": "FADV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "SRETR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MEMIF",
        "to": "SRETR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WMIF",
        "to": "SRETR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKIF",
        "to": "SRETR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "SRETR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SRETR",
        "to": "RERANKJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RERANKJ",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JBUS",
        "to": "FILTER",
        "label": "rerank result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FILTER",
        "to": "COMPJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "COMPJ",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LBUS",
        "to": "BRIEF",
        "label": "strategic compression result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BRIEF",
        "to": "P5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BRIEF",
        "to": "M5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BRIEF",
        "to": "F5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "P5CTX",
        "to": "P5J",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "P5J",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "M5CTX",
        "to": "M5J",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "M5J",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "F5CTX",
        "to": "F5J",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "F5J",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DBUS",
        "to": "DPFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "DPFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DPFRESH",
        "to": "P5ADV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DPFRESH",
        "to": "SPROP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DPFRESH",
        "to": "F5ADV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PADV",
        "to": "MFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "FADV",
        "to": "MFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "P5ADV",
        "to": "M5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "F5ADV",
        "to": "M5CTX",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "TPROP",
        "to": "MVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MVALID",
        "to": "COMMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SPROP",
        "to": "MVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "COMMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "COMMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "COMMIT",
        "to": "ACCEPT",
        "label": "accepted / safely rebased",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ACCEPT",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "COMMIT",
        "to": "TRIG",
        "label": "stale / invalid",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "LATER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PEND",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RECEIPT",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LATER",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POK",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ACCEPT",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SCHED",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PER",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RECEIPT",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "COVER",
        "to": "EREQ",
        "label": "stagnation / representation gap",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LCOVER",
        "to": "EREQ",
        "label": "missing representation",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ATT",
        "to": "EREQ",
        "label": "novelty without adviser disagreement",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GBUS",
        "to": "EREQ",
        "label": "evidence request from tactical role",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DBUS",
        "to": "EREQ",
        "label": "evidence request from deep role",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EREQ",
        "to": "SRCREAD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MEMIF",
        "to": "SRCREAD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JOURNAL",
        "to": "SRCREAD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SRCREAD",
        "to": "IFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EREQ",
        "to": "INQJOB",
        "label": "semantic processing required",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "INQJOB",
        "to": "TRIG",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GBUS",
        "to": "IFRESH",
        "label": "inquiry result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DBUS",
        "to": "IFRESH",
        "label": "inquiry result",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JBUS",
        "to": "IFRESH",
        "label": "typed inquiry judgment",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "IFRESH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "IFRESH",
        "to": "EVID",
        "label": "evidence payload",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVID",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "IFRESH",
        "to": "HYP",
        "label": "hypothesis proposal",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "IFRESH",
        "to": "SOP",
        "label": "schema/operator proposal",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SOP",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVID",
        "to": "PFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVID",
        "to": "MFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVID",
        "to": "FFAST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVID",
        "to": "SRETR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EVID",
        "to": "HYP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "HYP",
        "to": "PROBE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "PROBE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GVR",
        "to": "PROBE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EREQ",
        "to": "PROBE",
        "label": "physical inquiry request",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PROBE",
        "to": "BUILD",
        "label": "global",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PROBE",
        "to": "SKCAND",
        "label": "local scope",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PROBE",
        "to": "WAITR",
        "label": "stop / exhausted",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JOURNAL",
        "to": "BUP",
        "label": "actual probe evidence",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "HYP",
        "to": "BUP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BUP",
        "to": "BUS",
        "label": "BELIEF_UPDATE",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "HYP",
        "label": "updated hypothesis state",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ARTIF",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ARTIF",
        "to": "CAP",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ARTIF",
        "to": "PER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ARTIF",
        "to": "SKPROJ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LCOVER",
        "to": "REPAIRLIMIT",
        "label": "inadequate / no useful option",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "REPAIRLIMIT",
        "to": "FASTCJ",
        "label": "fast stage admitted",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "REPAIRLIMIT",
        "to": "DEEPCJ",
        "label": "deep stage admitted",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "REPAIRLIMIT",
        "to": "WAITR",
        "label": "exhausted / equivalent repair repeated",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RSCOPE",
        "to": "BUILD",
        "label": "GLOBAL",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RSCOPE",
        "to": "SKCAND",
        "label": "SKILL_LOCAL compatible frame/version",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKFVG",
        "to": "REPAIRLIMIT",
        "label": "invalid choice / counterexample",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKROUTE",
        "to": "WAITR",
        "label": "WAIT / CONTINUE",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKROUTE",
        "to": "CANCEL",
        "label": "ABORT",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKROUTE",
        "to": "ESCJOB",
        "label": "ESCALATE_FAST / DEEP",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKROUTE",
        "to": "REPAIRLIMIT",
        "label": "NO_VALID_ACTION",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "DRT",
        "to": "REPAIRLIMIT",
        "label": "NO_VALID_ACTION",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CLAIM",
        "to": "OWNER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CLAIM",
        "to": "CANCEL",
        "label": "handoff fails",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RESUME",
        "to": "OWNER",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RESUME",
        "to": "CANCEL",
        "label": "invalid parent",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKCTX",
        "to": "CENV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "OWNER",
        "to": "CENV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EPOCH",
        "to": "CENV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "BOARD",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CAP",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKIF",
        "to": "EPOCH",
        "label": "revocation",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "REFLEX",
        "to": "EPOCH",
        "label": "preempt prior owner",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "EPOCH",
        "to": "QUEUE",
        "label": "purge obsolete entries",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CANCEL",
        "to": "RECEIPT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CANCEL",
        "to": "STACK",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CADMIT",
        "to": "RECEIPT",
        "label": "rejected / expired / uncertain",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LREC",
        "to": "JOURNAL",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LREC",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "LREC",
        "to": "CENV",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SKMON",
        "to": "WATCH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RECEIPT",
        "to": "WATCH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "WATCH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WATCH",
        "to": "CANCEL",
        "label": "timeout / unsafe no-progress",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "WATCH",
        "to": "ESCJOB",
        "label": "bounded repair",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "OWNER",
        "to": "WATCH",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "USER",
        "to": "MISSION",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "BUS",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "MVALID",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MVALID",
        "to": "TRIG",
        "label": "rejected / clarification needed",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "CADMIT",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "BUILD",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "SKCAND",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "PROBE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "GVR",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "CYCLE",
        "to": "GVR",
        "label": "pinned goals/priorities",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "ORACLE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "EPOCH",
        "label": "replace / revoke",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JOURNAL",
        "to": "ORACLE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ORACLE",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MISSION",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MEMIF",
        "to": "MHIST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "POLIF",
        "to": "MHIST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MCX",
        "to": "MHIST",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "MHIST",
        "to": "MPJOB",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "PROFILE",
        "to": "SCHED",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "ARTIF",
        "to": "PROFILE",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "SCHED",
        "to": "TELEMETRY",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "GUARD",
        "to": "TELEMETRY",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "RECEIPT",
        "to": "TELEMETRY",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "TELEMETRY",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "JOURNAL",
        "to": "LI",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      },
      {
        "from": "INQIN",
        "to": "EREQ",
        "label": "",
        "conditional": false,
        "bidirectional": false,
        "source": "v1.10/runtime"
      }
    ],
    "groups": [
      {
        "id": "ENVIO",
        "label": "ENVIRONMENT + OBSERVATION / CONTROL BOUNDARY"
      },
      {
        "id": "STATE",
        "label": "CANONICAL STATE OWNERSHIP"
      },
      {
        "id": "LEARNIF",
        "label": "VERSIONED LEARNED-STATE INTERFACES FROM LEARNING"
      },
      {
        "id": "ORCH",
        "label": "ONE COGNITIVE ORCHESTRATION PATH — ALL MODEL / INFERENCE JOBS"
      },
      {
        "id": "SERVICES",
        "label": "EXPLICIT QUEUES → SHARED SERVICES → VERSIONED RESULT BUSES / DEMUX"
      },
      {
        "id": "SUMMARY",
        "label": "ASYNC RECENT-CONTEXT PIPELINE — SAME SHARED FLASH-LITE SERVICE"
      },
      {
        "id": "CAND",
        "label": "CANDIDATE GENERATION / COVERAGE / VALIDATION"
      },
      {
        "id": "FORECAST",
        "label": "CANDIDATE-CONDITIONED WORLD-MODEL RUNTIME"
      },
      {
        "id": "PROJ",
        "label": "ROLE-SPECIFIC CONTEXT BUILDERS — DETERMINISTIC PROJECTIONS, NOT DECISION MAKERS"
      },
      {
        "id": "ADVISERS",
        "label": "PAST + FUTURE — PARALLEL, SAME SNAPSHOT + SAME CANDIDATES"
      },
      {
        "id": "META",
        "label": "ONE META LAYER — EVENT-TRIGGERED + NONBLOCKING"
      },
      {
        "id": "FAST",
        "label": "TINY REAL-TIME DECISION PATH — NEVER WAITS FOR SLOW COGNITION"
      },
      {
        "id": "EXEC",
        "label": "DECISION RECORD + AUTOMATIC ADAPTIVE SKILL RUNTIME v1.2 + ONE LIVE EXECUTION AUTHORITY"
      },
      {
        "id": "MONITOR",
        "label": "ATTENTION + EXECUTION MONITOR — SEPARATE FUNCTIONS"
      },
      {
        "id": "REASON",
        "label": "SELECTIVE UPPER REASONING — ROLE-TAGGED, NONBLOCKING"
      },
      {
        "id": "PLANCOMMIT",
        "label": "PLAN COMMIT / STALENESS PROTECTION"
      },
      {
        "id": "LEARNOUT",
        "label": "RUNTIME → LEARNING CONTRACT — ASYNC, NEVER BLOCKS LIVE CONTROL"
      },
      {
        "id": "INQUIRY",
        "label": "RECOVERABLE EVIDENCE AND BOUNDED INQUIRY"
      },
      {
        "id": "OWNERSHIP",
        "label": "LOCAL HANDLERS, DURABLE FRAMES AND EXECUTION-TIME FENCING"
      },
      {
        "id": "AUTHORITY",
        "label": "MISSION, INDEPENDENT SUCCESS AND COMPUTE PROFILES"
      }
    ]
  }
]
