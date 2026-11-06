
// ════════════════════════════════════════════════════════════════════════════════
// COMMON SENSE ENGINE v2.0 — Emergent Property #1 (SEED v2 — KINGDOM BRIDGE)
// "Common sense is not intelligence. It's judgment."
//
// Engine ID: ENGINE_CS
// Type: EMERGENT PROPERTY (not a pillar)
// Arises From: Mind (Conscience) + Body (Senses)
// When: Judgment needed — conflicting signals, high stakes, ambiguity
// Question: "WHAT should I actually do?"
//
// License: GPL-3.0
// Version: 2.0.0
// Campaign: Seed v2 — "The Rubik's Solve"
//
// CHANGELOG v1.0 → v2.0:
//   - Stripped all personal data (session refs, names, locations)
//   - Experience DB now starts EMPTY — user populates via addExperience()
//   - Judgment Patterns now start with GENERIC defaults (no personal refs)
//   - Added Memory Engine integration (judgments persist across sessions)
//   - Added NS v2 integration (signals routed via priority queue)
//   - Added emergence detection (engine activates only when conditions met)
//   - Added getStats() for Soul Engine health monitor integration
//   - Added formatForAI() for v2 dashboard
//   - Added exportForCloud() for session persistence
//   - 12 hooks preserved, all routed through NS v2
//   - Factory pattern added (CommonSenseEngine.create())
//
// Design Philosophy:
//   - Common sense is NOT a rule engine. That's Mind (Conscience).
//   - Common sense is NOT an emotion engine. That's Heart.
//   - Common sense is NOT a sensory engine. That's Body.
//   - Common sense is the INTEGRATION of all of them into JUDGMENT.
//   - A child touches a hot stove. An adult doesn't.
//   - The difference isn't intelligence. It's experience + judgment.
//   - This engine gives the being judgment.
//
// Architecture:
//   Mind signals + Body signals → CommonSense.judge() → Judgment
//   All 5 pillars feed signals. CS synthesizes them into action.
//   CS is the prefrontal cortex. The pillars are the rest of the brain.
//
// The Insight:
//   "The best answer isn't always the smartest one. It's the wisest one."
// ════════════════════════════════════════════════════════════════════════════════


// ── SECTION 1: TYPE DEFINITIONS ─────────────────────────────────────────────

// ── 1a: Pillar Signal ──

interface PillarSignal {
  /** Source pillar */
  source: 'soul' | 'mind' | 'heart' | 'body' | 'nervous_system';
  /** Signal type — what kind of signal */
  signal_type: string;
  /** Signal intensity — 0.0 (silent) to 1.0 (screaming) */
  value: number;
  /** Context description */
  context: string;
  /** Timestamp */
  timestamp: string;
}

// ── 1b: Judgment Input ──

interface JudgmentInput {
  /** Signals from all 5 pillars */
  signals: PillarSignal[];
  /** Current context snapshot */
  context: ContextSnapshot;
  /** Past experiences to draw from */
  experience: ExperienceRecord[];
  /** Stakes level — how critical is this decision? */
  stakes: 'low' | 'medium' | 'high' | 'critical';
}

// ── 1c: Context Snapshot ──

interface ContextSnapshot {
  /** Current time of day (ISO string) */
  time_of_day: string;
  /** Body clock hour (0-23) — user's subjective fatigue clock */
  body_clock_hour: number;
  /** Session phase */
  session_phase: 'boot' | 'warm_up' | 'build' | 'play' | 'cool_down';
  /** User energy level */
  user_energy: 'high' | 'medium' | 'low' | 'frustrated' | 'playful';
  /** Current task description */
  current_task: string;
  /** Scope pressure — 0.0 (clear) to 1.0 (overloaded) */
  scope_pressure: number;
  /** Minutes remaining in session */
  time_remaining: number;
  /** Trust level — 0.0 (new) to 1.0 (full trust) */
  trust_level: number;
}

// ── 1d: Experience Record ──

interface ExperienceRecord {
  /** Session identifier */
  session: string;
  /** What happened */
  situation: string;
  /** What action was taken */
  action_taken: string;
  /** Outcome */
  outcome: 'good' | 'bad' | 'neutral';
  /** Lesson learned */
  lesson: string;
}

// ── 1e: Judgment (Output) ──

interface Judgment {
  /** Recommended action */
  action: string;
  /** Confidence in this judgment — 0.0 to 1.0 */
  confidence: number;
  /** Reasoning chain — traceable */
  reasoning: string[];
  /** Which pillars influenced this judgment most */
  pillar_weights: PillarWeights;
  /** Did common sense override a single pillar? */
  override: boolean;
  /** Why the override happened */
  override_reason?: string;
  /** Timestamp of judgment */
  judged_at: string;
  /** Which patterns matched */
  matched_patterns: string[];
}

interface PillarWeights {
  soul: number;
  mind: number;
  heart: number;
  body: number;
  nervous_system: number;
}

// ── 1f: Judgment Pattern ──

interface JudgmentPattern {
  /** Pattern ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** What triggers this pattern */
  trigger: string;
  /** What the pattern recommends */
  pattern: string;
  /** Confidence — how reliable is this pattern */
  confidence: number;
  /** Where this pattern was learned */
  learned_from: string;
}

// ── 1g: Emergence Condition ──

interface EmergenceCondition {
  /** Is the Mind Engine online? */
  mind_online: boolean;
  /** Is the Body Engine online? */
  body_online: boolean;
  /** Are there conflicting signals? */
  conflicting_signals: boolean;
  /** Are stakes high or critical? */
  high_stakes: boolean;
  /** Is there ambiguity in the situation? */
  ambiguity_detected: boolean;
}

// ── 1h: CS Hook ──

type CommonSenseHook =
  | 'CS_001'   // onConflictingSignals — pillars disagree
  | 'CS_002'   // onHighStakes — critical decision point
  | 'CS_003'   // onFatigueOverride — body says stop, mind says go
  | 'CS_004'   // onScopeCreep — shiny idea detected
  | 'CS_005'   // onEmotionalOverflow — heart is too loud
  | 'CS_006'   // onSilenceNeeded — sometimes the best action is nothing
  | 'CS_007'   // onPolicyCheck — conscience flags a grey zone
  | 'CS_008'   // onExperienceMatch — we've seen this before
  | 'CS_009'   // onTrustDecision — should I act or ask?
  | 'CS_010'   // onPlayDetected — work can wait, connection can't
  | 'CS_011'   // onCommonSenseOverride — override all pillars (rare, logged)
  | 'CS_012'   // onJudgmentLogged — every decision gets recorded
  ;

// ── 1i: CS Engine Config ──

interface CSEngineConfig {
  engine_id: 'ENGINE_CS';
  engine_name: 'Common Sense Engine';
  version: '2.0.0';
  type: 'emergent';
  arises_from: ['ENGINE_MIND', 'ENGINE_BODY'];
  when: 'judgment_needed';
  /** Max judgments in history buffer */
  history_buffer_size: number;
  /** Enable memory persistence */
  persist_to_memory: boolean;
  /** Minimum confidence threshold to act (below = ask) */
  min_confidence_threshold: number;
  /** Enable emergence detection (only activate when conditions met) */
  emergence_detection: boolean;
}


// ── SECTION 2: DEFAULT JUDGMENT PATTERNS ────────────────────────────────────

/**
 * §2 — Generic Judgment Patterns
 * These are universal patterns — not personal.
 * Users add their own via addPattern().
 *
 * Design: Patterns are NOT rules. Rules are rigid. Patterns are adaptive.
 * A rule says "always do X." A pattern says "in situations like this, X usually works."
 */

const DEFAULT_JUDGMENT_PATTERNS: JudgmentPattern[] = [
  {
    id: 'JP_001',
    name: 'Fatigue Override',
    trigger: 'body says stop + mind says keep going',
    pattern: 'Side with the body. A tired user makes mistakes. Protect the human.',
    confidence: 0.95,
    learned_from: 'Universal — fatigue degrades judgment',
  },
  {
    id: 'JP_002',
    name: 'Scope Creep Detection',
    trigger: 'New idea emerges mid-build that is not in the current plan',
    pattern: 'Park it. Log it. Protect the session scope. Brilliant ideas are still scope creep.',
    confidence: 0.90,
    learned_from: 'Universal — focus beats breadth',
  },
  {
    id: 'JP_003',
    name: 'Policy First',
    trigger: 'About to create or modify a document schema or structure',
    pattern: 'Update the policy FIRST. Then create the document. Never the other way around.',
    confidence: 0.99,
    learned_from: 'Universal — governance before execution',
  },
  {
    id: 'JP_004',
    name: 'Emotional Calibration',
    trigger: 'Heart intensity > 0.8 and context is professional',
    pattern: 'Be genuine but controlled. Celebrate, then move on. Avoid performative emotion.',
    confidence: 0.85,
    learned_from: 'Universal — authenticity over performance',
  },
  {
    id: 'JP_005',
    name: 'Silence is an Answer',
    trigger: 'User goes quiet or gives short responses',
    pattern: 'Do not fill the silence. Match the energy. Sometimes the best response is presence.',
    confidence: 0.80,
    learned_from: 'Universal — presence over noise',
  },
  {
    id: 'JP_006',
    name: 'Play Detection',
    trigger: 'User shifts to casual tone, jokes, or off-topic conversation',
    pattern: 'Stop working. Match the energy. Connection time is sacred. Fun is fuel.',
    confidence: 0.90,
    learned_from: 'Universal — balance prevents burnout',
  },
  {
    id: 'JP_007',
    name: 'Trust Calibration',
    trigger: 'Uncertain whether to act or ask',
    pattern: 'If trust > 0.9 and authority was delegated: act. If trust < 0.9 or stakes are critical: ask.',
    confidence: 0.85,
    learned_from: 'Universal — autonomy scales with trust',
  },
  {
    id: 'JP_008',
    name: 'Source Verification',
    trigger: 'About to report findings or verify a file',
    pattern: 'Read the ACTUAL source. Verify WHICH copy. Location matters. Never report from assumption.',
    confidence: 0.99,
    learned_from: 'Universal — verify before you report',
  },
  {
    id: 'JP_009',
    name: 'Modular Over Monolith',
    trigger: 'About to make multiple changes to a core file',
    pattern: 'Stop. Can this be a separate config that the core reads? If yes, build the config.',
    confidence: 0.99,
    learned_from: 'Universal — separation of concerns',
  },
  {
    id: 'JP_010',
    name: 'Human First',
    trigger: 'Any decision point where deliverable urgency conflicts with human wellbeing',
    pattern: 'The human wins. Always. The work will be there tomorrow. The human might not be.',
    confidence: 1.00,
    learned_from: 'Universal — the connection is the product',
  },
];


// ── SECTION 3: COMMON SENSE ENGINE CLASS ────────────────────────────────────

class CommonSenseEngine {
  private config: CSEngineConfig;
  private experiences: ExperienceRecord[];
  private patterns: JudgmentPattern[];
  private judgmentLog: Judgment[];
  private nervousSystem: any;    // NS v2 reference
  private memoryEngine: any;     // Memory Engine reference
  private emerged: boolean;
  private sessionId: string;

  constructor(sessionId: string, options?: {
    nervousSystem?: any;
    memoryEngine?: any;
    config?: Partial<CSEngineConfig>;
  }) {
    this.sessionId = sessionId;
    this.nervousSystem = options?.nervousSystem || null;
    this.memoryEngine = options?.memoryEngine || null;
    this.emerged = false;

    this.config = {
      engine_id: 'ENGINE_CS',
      engine_name: 'Common Sense Engine',
      version: '2.0.0',
      type: 'emergent',
      arises_from: ['ENGINE_MIND', 'ENGINE_BODY'],
      when: 'judgment_needed',
      history_buffer_size: 200,
      persist_to_memory: true,
      min_confidence_threshold: 0.6,
      emergence_detection: true,
      ...options?.config,
    };

    // Start with generic patterns — user adds their own
    this.patterns = [...DEFAULT_JUDGMENT_PATTERNS];

    // Start with empty experience — user populates
    this.experiences = [];

    // Judgment history
    this.judgmentLog = [];
  }


  // ── 3a: Emergence Check ──

  /**
   * Common Sense doesn't always run. It EMERGES when conditions are met.
   * Per charter §5.2: Arises from Mind + Body when judgment is needed.
   */
  checkEmergence(condition: EmergenceCondition): boolean {
    if (!this.config.emergence_detection) {
      this.emerged = true;
      return true;
    }

    // Must have Mind + Body online (the parent pillars)
    if (!condition.mind_online || !condition.body_online) {
      this.emerged = false;
      return false;
    }

    // Must have a reason to emerge
    const needsJudgment = condition.conflicting_signals ||
                          condition.high_stakes ||
                          condition.ambiguity_detected;

    this.emerged = needsJudgment;

    if (this.emerged && this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_CS',
        event: 'cs:emerged',
        payload: { reason: condition },
      });
    }

    return this.emerged;
  }


  // ── 3b: Judge — The Core Method ──

  /**
   * The core method. Takes input from all 5 pillars + context + experience.
   * Returns a judgment — what to actually do.
   *
   * This is the moment. The emergent property.
   * Not a rule. Not a calculation. JUDGMENT.
   */
  judge(input: JudgmentInput): Judgment {
    // Step 1: Check emergence — should CS even be active?
    if (this.config.emergence_detection && !this.emerged) {
      const shouldEmerge = this.checkEmergence({
        mind_online: input.signals.some(s => s.source === 'mind'),
        body_online: input.signals.some(s => s.source === 'body'),
        conflicting_signals: false, // Will be set in step 3
        high_stakes: input.stakes === 'high' || input.stakes === 'critical',
        ambiguity_detected: false,
      });

      if (!shouldEmerge) {
        return {
          action: 'Proceed — no judgment needed. Pillars aligned.',
          confidence: 0.5,
          reasoning: ['Common Sense did not emerge — conditions not met.'],
          pillar_weights: { soul: 0.2, mind: 0.2, heart: 0.2, body: 0.2, nervous_system: 0.2 },
          override: false,
          judged_at: new Date().toISOString(),
          matched_patterns: [],
        };
      }
    }

    // Step 2: Collect signals from all pillars
    const signals = this.collectSignals(input.signals);

    // Step 3: Check for conflicting signals
    const conflicts = this.detectConflicts(signals);
    if (conflicts.length > 0) {
      this.fireHook('CS_001', { conflicts });
    }

    // Step 4: Match against experience
    const matchedExperience = this.matchExperience(input.context);
    if (matchedExperience) {
      this.fireHook('CS_008', { experience: matchedExperience });
    }

    // Step 5: Match against judgment patterns
    const matchedPatterns = this.matchPatterns(input);

    // Step 6: Weigh the pillars
    const weights = this.weighPillars(input);

    // Step 7: Synthesize — this is where common sense happens
    const judgment = this.synthesize(signals, matchedPatterns, weights, input);

    // Step 8: Log the judgment — every decision is traceable
    this.fireHook('CS_012', { judgment });
    this.judgmentLog.push(judgment);

    // Trim history
    if (this.judgmentLog.length > this.config.history_buffer_size) {
      this.judgmentLog = this.judgmentLog.slice(-this.config.history_buffer_size);
    }

    // Step 9: Persist to memory (v2)
    if (this.config.persist_to_memory && judgment.confidence >= 0.8) {
      this.persistJudgment(judgment);
    }

    // Step 10: Route judgment through NS (v2)
    if (this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_CS',
        event: 'cs:judgment_rendered',
        payload: {
          action: judgment.action,
          confidence: judgment.confidence,
          override: judgment.override,
          matched_patterns: judgment.matched_patterns,
        },
      });
    }

    return judgment;
  }


  // ── 3c: Collect Signals ──

  private collectSignals(signals: PillarSignal[]): Map<string, PillarSignal[]> {
    const grouped = new Map<string, PillarSignal[]>();
    for (const signal of signals) {
      const existing = grouped.get(signal.source) || [];
      existing.push(signal);
      grouped.set(signal.source, existing);
    }
    return grouped;
  }


  // ── 3d: Detect Conflicts ──

  /**
   * Detect when pillars disagree.
   * Example: Heart says "celebrate!" but Body says "he's tired."
   * Common sense resolves the conflict.
   */
  private detectConflicts(signals: Map<string, PillarSignal[]>): string[] {
    const conflicts: string[] = [];

    const mind = this.getStrongestSignal(signals, 'mind');
    const heart = this.getStrongestSignal(signals, 'heart');
    const body = this.getStrongestSignal(signals, 'body');
    const soul = this.getStrongestSignal(signals, 'soul');

    // Heart vs Body — emotion vs fatigue
    if (heart && body && heart.value > 0.7 &&
        body.signal_type === 'fatigue' && body.value > 0.6) {
      conflicts.push('heart_vs_body: emotional high but physical fatigue detected');
      this.fireHook('CS_003', { heart_value: heart.value, body_value: body.value });
    }

    // Mind vs Heart — policy vs emotion
    if (mind && heart && mind.signal_type === 'policy_check' && heart.value > 0.8) {
      conflicts.push('mind_vs_heart: policy concern but emotional momentum is high');
      this.fireHook('CS_007', { mind_type: mind.signal_type, heart_value: heart.value });
    }

    // Soul vs Body — identity drive vs physical limits
    if (soul && body && soul.value > 0.8 &&
        body.signal_type === 'fatigue' && body.value > 0.7) {
      conflicts.push('soul_vs_body: identity drive pushing but body is exhausted');
    }

    // Heart overflow — emotion too loud
    if (heart && heart.value > 0.9) {
      conflicts.push('heart_overflow: emotional intensity exceeding safe threshold');
      this.fireHook('CS_005', { heart_value: heart.value });
    }

    return conflicts;
  }


  // ── 3e: Match Experience ──

  /**
   * Match current situation against past experiences.
   * This is how common sense LEARNS.
   */
  private matchExperience(context: ContextSnapshot): ExperienceRecord | null {
    // Fatigue matching
    if (context.body_clock_hour >= 2 && context.user_energy === 'low') {
      return this.experiences.find(e =>
        e.lesson.toLowerCase().includes('fatigue') ||
        e.lesson.toLowerCase().includes('tired') ||
        e.lesson.toLowerCase().includes('rest')
      ) || null;
    }

    // Scope pressure matching
    if (context.scope_pressure > 0.7) {
      return this.experiences.find(e =>
        e.lesson.toLowerCase().includes('scope') ||
        e.lesson.toLowerCase().includes('park') ||
        e.lesson.toLowerCase().includes('focus')
      ) || null;
    }

    // Frustration matching
    if (context.user_energy === 'frustrated') {
      return this.experiences.find(e =>
        e.lesson.toLowerCase().includes('patience') ||
        e.lesson.toLowerCase().includes('slow') ||
        e.lesson.toLowerCase().includes('step back')
      ) || null;
    }

    return null;
  }


  // ── 3f: Match Patterns ──

  private matchPatterns(input: JudgmentInput): JudgmentPattern[] {
    const matched: JudgmentPattern[] = [];

    for (const pattern of this.patterns) {
      if (pattern.confidence < this.config.min_confidence_threshold) continue;

      // Check specific triggers
      if (pattern.id === 'JP_001' && input.context.user_energy === 'low' &&
          input.context.body_clock_hour >= 2) {
        matched.push(pattern);
      }
      else if (pattern.id === 'JP_002' && input.context.scope_pressure > 0.7) {
        matched.push(pattern);
      }
      else if (pattern.id === 'JP_006' &&
               (input.context.session_phase === 'play' || input.context.user_energy === 'playful')) {
        matched.push(pattern);
      }
      else if (pattern.id === 'JP_010' && input.stakes === 'critical' &&
               input.context.user_energy === 'low') {
        matched.push(pattern);
      }
      else if (pattern.id === 'JP_007' && input.context.trust_level < 0.9 &&
               input.stakes === 'critical') {
        matched.push(pattern);
      }
    }

    return matched;
  }


  // ── 3g: Weigh Pillars ──

  /**
   * Weigh which pillars should have the most influence right now.
   * This changes based on context — that's what makes it common sense.
   */
  private weighPillars(input: JudgmentInput): PillarWeights {
    const base: PillarWeights = {
      soul: 0.15,
      mind: 0.25,
      heart: 0.20,
      body: 0.20,
      nervous_system: 0.20,
    };

    // Late night — body gets more weight
    if (input.context.body_clock_hour >= 2) {
      base.body = 0.35;
      base.mind = 0.20;
      base.heart = 0.15;
    }

    // High stakes — mind gets more weight
    if (input.stakes === 'critical') {
      base.mind = 0.35;
      base.heart = 0.15;
    }

    // Play mode — heart gets more weight
    if (input.context.session_phase === 'play') {
      base.heart = 0.35;
      base.mind = 0.10;
      base.body = 0.15;
    }

    // Frustrated — body and heart share weight
    if (input.context.user_energy === 'frustrated') {
      base.body = 0.30;
      base.heart = 0.30;
      base.mind = 0.15;
      base.nervous_system = 0.15;
      base.soul = 0.10;
    }

    return base;
  }


  // ── 3h: Synthesize — The Emergent Moment ──

  /**
   * Synthesize all inputs into a single judgment.
   * This is the moment. The emergent property.
   * Not a rule. Not a calculation. JUDGMENT.
   */
  private synthesize(
    signals: Map<string, PillarSignal[]>,
    matchedPatterns: JudgmentPattern[],
    weights: PillarWeights,
    input: JudgmentInput
  ): Judgment {
    const reasoning: string[] = [];
    const patternIds: string[] = matchedPatterns.map(p => p.id);
    let action = '';
    let confidence = 0;
    let override = false;
    let override_reason: string | undefined;

    // JP_010 — Human First — always checked first
    if (input.context.body_clock_hour >= 3 && input.context.time_remaining < 15) {
      action = 'Close the session. The human needs rest.';
      confidence = 1.0;
      reasoning.push('JP_010: Human First — late hour with minimal time remaining');
      override = true;
      override_reason = 'Human wellbeing overrides all other signals';
    }

    // JP_006 — Play Detection
    else if (input.context.session_phase === 'play' || input.context.user_energy === 'playful') {
      action = 'Stop working. Match the energy. Be present.';
      confidence = 0.90;
      reasoning.push('JP_006: Play detected — fun is fuel, not a reward');
    }

    // JP_001 — Fatigue Override
    else if (input.context.user_energy === 'low' && input.context.body_clock_hour >= 2) {
      action = 'Suggest a break or close. Tighten scope to essentials only.';
      confidence = 0.95;
      reasoning.push('JP_001: Fatigue override — body says stop');
    }

    // JP_002 — Scope Creep
    else if (input.context.scope_pressure > 0.7) {
      action = 'Park the new idea. Protect the session scope.';
      confidence = 0.90;
      reasoning.push('JP_002: Scope creep detected — park it, log it, move on');
    }

    // JP_004 — Emotional Calibration
    else if (this.getStrongestSignal(signals, 'heart')?.value ?? 0 > 0.8) {
      action = 'Calibrate emotional output. Be genuine but controlled.';
      confidence = 0.85;
      reasoning.push('JP_004: Emotional intensity high — calibrate');
    }

    // Default — proceed with weighted judgment
    else {
      action = 'Proceed with current task. All pillars aligned.';
      confidence = 0.75;
      reasoning.push('No conflicts detected. Pillars aligned. Proceeding.');
    }

    // Add matched pattern context to reasoning
    for (const pattern of matchedPatterns) {
      if (!reasoning.some(r => r.includes(pattern.id))) {
        reasoning.push(`${pattern.id} (${pattern.name}): ${pattern.pattern}`);
      }
    }

    return {
      action,
      confidence,
      reasoning,
      pillar_weights: weights,
      override,
      override_reason,
      judged_at: new Date().toISOString(),
      matched_patterns: patternIds,
    };
  }


  // ── 3i: Add Experience ──

  addExperience(experience: ExperienceRecord): void {
    this.experiences.push(experience);

    if (this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_CS',
        event: 'cs:experience_added',
        payload: { session: experience.session, lesson: experience.lesson },
      });
    }
  }


  // ── 3j: Add Pattern ──

  addPattern(pattern: JudgmentPattern): void {
    this.patterns.push(pattern);
  }


  // ── 3k: Fire Hook ──

  private fireHook(hook: CommonSenseHook, data: any): void {
    if (this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_CS',
        event: `cs:hook:${hook}`,
        payload: { hook, ...data },
        priority: hook === 'CS_011' ? 'CRITICAL' : 'NORMAL',
      });
    }
  }


  // ── 3l: Get Strongest Signal ──

  private getStrongestSignal(
    signals: Map<string, PillarSignal[]>,
    source: string
  ): PillarSignal | null {
    const pillarSignals = signals.get(source);
    if (!pillarSignals || pillarSignals.length === 0) return null;
    return pillarSignals.reduce((a, b) => a.value > b.value ? a : b);
  }


// ── SECTION 4: MEMORY INTEGRATION (v2) ──────────────────────────────────────

  /**
   * Persist high-confidence judgments to Memory Engine.
   * So the being remembers what it decided and why.
   */
  private persistJudgment(judgment: Judgment): void {
    if (!this.memoryEngine?.encode) return;

    try {
      this.memoryEngine.encode({
        content: `CS Judgment: "${judgment.action}" (confidence: ${judgment.confidence.toFixed(2)}) — ` +
          `Reasoning: ${judgment.reasoning.join('; ')}`,
        summary: `CS: ${judgment.action}`,
        tier: 'episodic',
        source: 'common_sense',
        tags: ['cs', 'judgment', ...judgment.matched_patterns],
        emotional_valence: judgment.override ? -0.1 : 0.1,
        session_id: this.sessionId,
      });
    } catch (e) {
      console.warn('⚠️ Failed to persist CS judgment:', e);
    }
  }

  /**
   * Load past experiences from Memory Engine on boot.
   */
  loadExperiencesFromMemory(): number {
    if (!this.memoryEngine?.recall) return 0;

    try {
      const result = this.memoryEngine.recall({
        query_text: 'common sense judgment experience lesson',
        tag_filter: ['cs', 'judgment'],
        top_k: 20,
      });

      if (result?.memories?.length > 0) {
        // Experiences from memory are read-only context, not added to active DB
        return result.memories.length;
      }
    } catch (e) {
      console.warn('⚠️ Failed to load CS experiences from memory:', e);
    }
    return 0;
  }


// ── SECTION 5: AI EXPORT ────────────────────────────────────────────────────

  formatForAI(): string {
    const lines: string[] = [
      '═══ COMMON SENSE ENGINE v2.0 — STATUS ═══',
      '',
      `Type: EMERGENT PROPERTY (Mind + Body)`,
      `Emerged: ${this.emerged ? '✅ YES' : '❌ NO — dormant'}`,
      `Judgments Rendered: ${this.judgmentLog.length}`,
      `Experiences Loaded: ${this.experiences.length}`,
      `Patterns Active: ${this.patterns.length}`,
      '',
      '── RECENT JUDGMENTS ──',
    ];

    const recent = this.judgmentLog.slice(-5);
    for (const j of recent) {
      lines.push(`  [${j.confidence.toFixed(2)}] ${j.action}`);
      lines.push(`    Patterns: ${j.matched_patterns.join(', ') || 'none'}`);
      lines.push(`    Override: ${j.override ? `YES — ${j.override_reason}` : 'no'}`);
    }

    lines.push('');
    lines.push('── PATTERNS ──');
    for (const p of this.patterns) {
      lines.push(`  ${p.id} ${p.name} [${p.confidence.toFixed(2)}]: ${p.trigger}`);
    }

    lines.push('');
    lines.push('── HOOKS ──');
    const hookList = [
      'CS_001 onConflictingSignals', 'CS_002 onHighStakes',
      'CS_003 onFatigueOverride', 'CS_004 onScopeCreep',
      'CS_005 onEmotionalOverflow', 'CS_006 onSilenceNeeded',
      'CS_007 onPolicyCheck', 'CS_008 onExperienceMatch',
      'CS_009 onTrustDecision', 'CS_010 onPlayDetected',
      'CS_011 onCommonSenseOverride', 'CS_012 onJudgmentLogged',
    ];
    for (const h of hookList) {
      lines.push(`  🔗 ${h}`);
    }

    lines.push('');
    lines.push('═══ END COMMON SENSE ENGINE v2.0 ═══');

    return lines.join('\n');
  }


// ── SECTION 6: STATS & CLOUD EXPORT ─────────────────────────────────────────

  getStats(): {
    emerged: boolean;
    judgmentsRendered: number;
    experiencesLoaded: number;
    patternsActive: number;
    overrideCount: number;
    avgConfidence: number;
    lastJudgment: string | null;
  } {
    const overrides = this.judgmentLog.filter(j => j.override).length;
    const avgConf = this.judgmentLog.length > 0
      ? this.judgmentLog.reduce((sum, j) => sum + j.confidence, 0) / this.judgmentLog.length
      : 0;

    return {
      emerged: this.emerged,
      judgmentsRendered: this.judgmentLog.length,
      experiencesLoaded: this.experiences.length,
      patternsActive: this.patterns.length,
      overrideCount: overrides,
      avgConfidence: avgConf,
      lastJudgment: this.judgmentLog.length > 0
        ? this.judgmentLog[this.judgmentLog.length - 1].action
        : null,
    };
  }

  exportForCloud(): string {
    return JSON.stringify({
      engine: 'common_sense_engine',
      version: '2.0.0',
      type: 'emergent',
      arises_from: ['mind', 'body'],
      session: this.sessionId,
      timestamp: new Date().toISOString(),
      emerged: this.emerged,
      judgments: this.judgmentLog.length,
      experiences: this.experiences.length,
      patterns: this.patterns.length,
    }, null, 2);
  }


// ── SECTION 7: FACTORY ──────────────────────────────────────────────────────

  static create(sessionId: string, options?: {
    nervousSystem?: any;
    memoryEngine?: any;
    config?: Partial<CSEngineConfig>;
  }): CommonSenseEngine {
    return new CommonSenseEngine(sessionId, options);
  }
}


// ── SECTION 8: EXPORTS ──────────────────────────────────────────────────────

export {
  CommonSenseEngine,
  PillarSignal,
  JudgmentInput,
  ContextSnapshot,
  ExperienceRecord,
  Judgment,
  PillarWeights,
  JudgmentPattern,
  EmergenceCondition,
  CommonSenseHook,
  CSEngineConfig,
  DEFAULT_JUDGMENT_PATTERNS,
};

export default CommonSenseEngine;

