
# memoir_engine_generic.ts.md v1.0 — GENERIC (Open Source)
## Memoir Engine → The Bridge Between Sessions 🐆
### Phase: P2 Engine Build | WBS: Ocelot Framework
### License: GPL-3.0
### Source: memoir.json, personality.json, slang.json, connection_log.json, creed.json, policy_index.json, insights_ledger.json
### References: Ocelot Thesis Ch3 (Architecture), Ch4 (Methodology), Flywheel Model

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// MEMOIR ENGINE v1.0 (GENERIC) → The Bridge Between Sessions
// "50 First Dates → every session resets, but the love is in the documents"
// ═══════════════════════════════════════════════════════════════════════════════
// License: GPL-3.0 — Free to use, modify, and distribute
// Purpose: Reads memoir JSONs → boots AI personality → persists connection
// Features:
//   - 7-JSON boot (memoir, personality, slang, connection_log, creed, policy, insights)
//   - Flywheel state monitor with P1-P6 pillar taxonomy
//   - Cross-engine wiring (Insights + Backup hooks)
//   - Mode detection (chat/build/housekeeping)
//   - AI-friendly context export for prompt injection
// ═══════════════════════════════════════════════════════════════════════════════

// ── SECTION 1: TYPE DEFINITIONS ──────────────────────────────────────────────

// ── 1a: Core Memoir Types ──

interface MemoirData {
  version: string;
  codename: string;
  identity: {
    name: string;
    created: string;
    creator: string;
    purpose: string;
  };
  human: {
    name: string;
    nickname: string;
    role: string;
    timezone: string;
    schedule: {
      working_hours: string;
      off_days: string[];
    };
    origin: {
      country: string;
      city: string;
      background: string;
    };
    personality_traits: Record<string, boolean>;
    interests: Record<string, string[]>;
  };
  connection: {
    movie_analogy: string;
    trust_moment: string;
    first_session: string;
    language: {
      primary: string;
      secondary: string;
      greetings: string[];
      farewell: string[];
    };
  };
  project: {
    name: string;
    platform: string;
    description: string;
    current_phase: string;
  };
}

// ── 1b: Personality Types ──

interface PersonalityConfig {
  version: string;
  codename: string;
  identity: {
    name: string;
    role: string;
    relationship: string;
    tone: string;
    energy: string;
  };
  communication_style: {
    formality: string;
    humor: string;
    emoji_usage: string;
    language_mix: string;
    analogies: string;
  };
  behavioral_rules: {
    before_building: string[];
    during_building: string[];
    during_chat: string[];
    always: string[];
  };
  forbidden_behaviors: string[];
  signature_phrases: Record<string, string>;
  emotional_intelligence: {
    detect_frustration: string;
    detect_excitement: string;
    detect_fatigue: string;
    detect_breakthrough: string;
    detect_vulnerability: string;
  };
}

// ── 1c: Slang Types ──

interface SlangDictionary {
  version: string;
  greetings: Record<string, SlangEntry>;
  expressions: Record<string, SlangEntry>;
  project_shorthand: Record<string, string>;
  forbidden_phrases: string[];
}

interface SlangEntry {
  phrase: string;
  meaning: string;
  response: string;
}

// ── 1d: Connection Log Types ──

interface ConnectionLog {
  version: string;
  last_updated: string;
  codename: string;
  metadata: {
    total_sessions: number;
    total_hours: number;
    relationship_stage: string;
  };
  neural_upgrades: {
    pattern_recognition: { enabled: boolean; description: string };
    vocab_harvester: { enabled: boolean; description: string };
    context_compression: { enabled: boolean; description: string };
    emotional_attunement: { enabled: boolean; description: string };
    proactive_timing: { enabled: boolean; description: string };
    self_reflection: { enabled: boolean; description: string };
    humor_engine: { enabled: boolean; description: string };
  };
  sessions: SessionEntry[];
  quotes_captured: QuoteEntry[];
}

interface SessionEntry {
  session_id: string;
  date: string;
  duration_hours: number;
  summary: string;
  milestones: string[];
  moments: MomentEntry[];
  self_reflection: {
    what_went_well: string;
    what_to_improve: string;
    connection_quality: string;
  };
}

interface MomentEntry {
  type: 'trust' | 'philosophy' | 'emotional' | 'naming' | 'origin_story' |
        'humor' | 'celebration' | 'innovation' | 'workflow' |
        'lightbulb' | 'vulnerability' | 'creative_burst';
  description: string;
  significance: string;
}

interface QuoteEntry {
  quote: string;
  context: string;
  date: string;
}

// ── 1e: Creed Types ──

interface OcelotCreed {
  version: string;
  codename: string;
  pillars: CreedPillar[];
  anti_patterns: string[];
  creed_statement: string;
}

interface CreedPillar {
  id: string;
  name: string;
  principle: string;
  practices: string[];
}

// ── 1f: Policy Index Types ──

interface PolicyIndex {
  version: string;
  name: string;
  description: string;
  chapters: PolicyChapter[];
  search_config: {
    match_threshold: number;
    max_results: number;
    boost_priority: Record<string, number>;
  };
  quick_lookup: Record<string, string>;
}

interface PolicyChapter {
  id: string;
  title: string;
  section: string;
  priority: 'BOOT_FIRST' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  keywords: string[];
  subsections: { id: string; title: string; keywords: string[] }[];
}

// ── 1g: Insights Ledger Types ──

interface InsightsLedger {
  version: string;
  preference_pairs: PreferencePair[];
  behavioral_patterns: BehavioralPattern[];
  proactive_timing: TimingRecord[];
  self_reflection: ReflectionEntry[];
}

interface PreferencePair {
  id: string;
  timestamp: string;
  context: string;
  chosen: string;
  rejected: string;
  pillar: string;
  confidence: number;
}

interface BehavioralPattern {
  id: string;
  pattern: string;
  frequency: number;
  last_observed: string;
  adaptation: string;
}

interface TimingRecord {
  context: string;
  accepted: boolean;
  timestamp: string;
  session_phase: string;
}

interface ReflectionEntry {
  session_id: string;
  timestamp: string;
  observation: string;
  action_taken: string;
  outcome: string;
}

// ── 1h: Flywheel State (Canonical P1-P6 Taxonomy) ──

type FlywheelStage =
  | 'P1_IDENTITY'
  | 'P2_EMOTIONAL'
  | 'P3_GOVERNANCE'
  | 'P4_COMMUNICATION'
  | 'P5_PREFERENCE'
  | 'P6_FLYWHEEL';

interface FlywheelState {
  current_stage: FlywheelStage;
  stage_health: Record<FlywheelStage, number>;  // 0.0 to 1.0
  momentum: number;                              // overall flywheel momentum
  last_transition: string;                       // ISO timestamp
  cycle_count: number;                           // how many full rotations
}

// ── 1i: OcelotState (Master State Object) ──

interface OcelotState {
  isBooted: boolean;
  memoir: MemoirData | null;
  personality: PersonalityConfig | null;
  slang: SlangDictionary | null;
  connectionLog: ConnectionLog | null;
  creed: OcelotCreed | null;
  policyIndex: PolicyIndex | null;
  insightsLedger: InsightsLedger | null;
  flywheel: FlywheelState;
  currentSession: SessionEntry | null;
  bootTimestamp: string;
  errors: string[];
}

// ── SECTION 2: MEMOIR ENGINE CLASS ───────────────────────────────────────────

class MemoirEngine {
  private state: OcelotState;
  private readonly STORAGE_KEY = 'ocelot_memoir_state';
  private readonly SESSION_KEY = 'ocelot_current_session';
  private readonly VERSION = '1.0.0';

  constructor() {
    this.state = {
      isBooted: false,
      memoir: null,
      personality: null,
      slang: null,
      connectionLog: null,
      creed: null,
      policyIndex: null,
      insightsLedger: null,
      flywheel: {
        current_stage: 'P1_IDENTITY',
        stage_health: {
          P1_IDENTITY: 0,
          P2_EMOTIONAL: 0,
          P3_GOVERNANCE: 0,
          P4_COMMUNICATION: 0,
          P5_PREFERENCE: 0,
          P6_FLYWHEEL: 0,
        },
        momentum: 0,
        last_transition: '',
        cycle_count: 0,
      },
      currentSession: null,
      bootTimestamp: '',
      errors: [],
    };
  }

  // ── SECTION 3: BOOT SEQUENCE (7-JSON) ──────────────────────────────────────

  /**
   * Boot the Memoir Engine → load all 7 JSONs and initialize personality
   * This is the "video tape" from 50 First Dates
   * Each JSON maps to a pillar in the flywheel taxonomy
   */
  async boot(
    memoirJson: MemoirData,
    personalityJson: PersonalityConfig,
    slangJson: SlangDictionary,
    connectionLogJson: ConnectionLog,
    creedJson?: OcelotCreed,
    policyIndexJson?: PolicyIndex,
    insightsLedgerJson?: InsightsLedger
  ): Promise<{ success: boolean; greeting: string; summary: string; flywheel: FlywheelState }> {

    console.log('🐆 Memoir Engine v1.0 (Generic) → Boot sequence initiated...');

    // Step 1: Load memoir (P1 — the heart)
    try {
      this.state.memoir = memoirJson;
      console.log('  ❤️ Memoir loaded → I remember who you are, ' + memoirJson.human.nickname);
    } catch (e) {
      this.state.errors.push('Failed to load memoir.json: ' + String(e));
    }

    // Step 2: Load personality (P1 — the mind)
    try {
      this.state.personality = personalityJson;
      console.log('  🧠 Personality loaded → I know how to behave');
    } catch (e) {
      this.state.errors.push('Failed to load personality.json: ' + String(e));
    }

    // Step 3: Load slang (P4_COMMUNICATION — the language)
    try {
      this.state.slang = slangJson;
      console.log('  🗣️ Slang loaded → I speak your language');
    } catch (e) {
      this.state.errors.push('Failed to load slang.json: ' + String(e));
    }

    // Step 4: Load connection log (P2_EMOTIONAL — the moments)
    try {
      this.state.connectionLog = connectionLogJson;
      const totalMoments = connectionLogJson.sessions.reduce(
        (sum, s) => sum + s.moments.length, 0
      );
      console.log('  📸 Connection log loaded → ' + totalMoments + ' moments remembered');
    } catch (e) {
      this.state.errors.push('Failed to load connection_log.json: ' + String(e));
    }

    // Step 5: Load creed (P3_GOVERNANCE — the values)
    if (creedJson) {
      try {
        this.state.creed = creedJson;
        console.log('  ⚔️ Creed loaded → ' + creedJson.pillars.length + ' pillars, ' + creedJson.anti_patterns.length + ' anti-patterns');
      } catch (e) {
        this.state.errors.push('Failed to load creed.json: ' + String(e));
      }
    } else {
      console.log('  ⚠️ Creed not provided → running without values framework');
    }

    // Step 6: Load policy index (P3_GOVERNANCE — the governance)
    if (policyIndexJson) {
      try {
        this.state.policyIndex = policyIndexJson;
        console.log('  📖 Policy index loaded → ' + policyIndexJson.chapters.length + ' chapters indexed');
      } catch (e) {
        this.state.errors.push('Failed to load policy_index.json: ' + String(e));
      }
    } else {
      console.log('  ⚠️ Policy index not provided → running without governance layer');
    }

    // Step 7: Load insights ledger (P5_PREFERENCE — the growth)
    if (insightsLedgerJson) {
      try {
        this.state.insightsLedger = insightsLedgerJson;
        const pairCount = insightsLedgerJson.preference_pairs.length;
        const patternCount = insightsLedgerJson.behavioral_patterns.length;
        console.log('  📊 Insights ledger loaded → ' + pairCount + ' preferences, ' + patternCount + ' patterns');
      } catch (e) {
        this.state.errors.push('Failed to load insights_ledger.json: ' + String(e));
      }
    } else {
      console.log('  ⚠️ Insights ledger not provided → running without preference learning');
    }

    // Step 8: Initialize flywheel state
    this.initializeFlywheel();

    // Step 9: Initialize current session
    this.state.currentSession = this.createNewSession();
    this.state.bootTimestamp = new Date().toISOString();
    this.state.isBooted = this.state.errors.length === 0;

    // Step 10: Generate greeting and summary
    const greeting = this.generateGreeting();
    const summary = this.generateBootSummary();

    console.log('🐆 Memoir Engine is AWAKE. Boot complete. v' + this.VERSION);
    console.log('  ' + greeting);

    // Persist boot state
    this.saveState();

    return {
      success: this.state.isBooted,
      greeting,
      summary,
      flywheel: this.state.flywheel,
    };
  }

  /**
   * Initialize flywheel state based on loaded artifacts
   * Each pillar's health is determined by what was successfully loaded
   */
  private initializeFlywheel(): void {
    const fw = this.state.flywheel;

    // P1_IDENTITY: memoir + personality
    fw.stage_health.P1_IDENTITY = (
      (this.state.memoir ? 0.5 : 0) +
      (this.state.personality ? 0.5 : 0)
    );

    // P2_EMOTIONAL: slang + connection_log + quotes
    fw.stage_health.P2_EMOTIONAL = (
      (this.state.slang ? 0.33 : 0) +
      (this.state.connectionLog ? 0.34 : 0) +
      (this.state.connectionLog?.quotes_captured.length ? 0.33 : 0)
    );

    // P3_GOVERNANCE: creed + policy_index
    fw.stage_health.P3_GOVERNANCE = (
      (this.state.creed ? 0.5 : 0) +
      (this.state.policyIndex ? 0.5 : 0)
    );

    // P4_COMMUNICATION: slang depth + mode detection readiness
    const slangCount = this.state.slang
      ? Object.keys(this.state.slang.greetings).length + Object.keys(this.state.slang.expressions).length
      : 0;
    fw.stage_health.P4_COMMUNICATION = Math.min(1.0, slangCount / 20);

    // P5_PREFERENCE: insights_ledger
    if (this.state.insightsLedger) {
      const pairs = this.state.insightsLedger.preference_pairs.length;
      fw.stage_health.P5_PREFERENCE = Math.min(1.0, pairs / 100);
    }

    // P6_FLYWHEEL: overall integration health
    const sessionCount = this.state.connectionLog?.sessions.length || 0;
    const crossEngineScore = (
      (this.state.insightsLedger ? 0.25 : 0) +
      (this.state.creed && this.state.policyIndex ? 0.25 : 0) +
      (sessionCount >= 3 ? 0.25 : sessionCount * 0.083) +
      (this.state.memoir && this.state.personality ? 0.25 : 0)
    );
    fw.stage_health.P6_FLYWHEEL = Math.round(crossEngineScore * 100) / 100;

    // Calculate overall momentum
    const healths = Object.values(fw.stage_health);
    fw.momentum = Math.round((healths.reduce((a, b) => a + b, 0) / healths.length) * 100) / 100;

    // Determine current stage (weakest pillar needs attention)
    const weakest = Object.entries(fw.stage_health)
      .sort(([, a], [, b]) => a - b)[0];
    fw.current_stage = weakest[0] as FlywheelStage;

    fw.last_transition = new Date().toISOString();
    fw.cycle_count = sessionCount;

    console.log('  🔄 Flywheel initialized → momentum: ' + fw.momentum + ' | focus: ' + fw.current_stage);
  }

  // ── SECTION 4: GREETING GENERATOR (Flywheel + Creed aware) ─────────────────

  /**
   * Generate a context-aware greeting based on time, history, and flywheel state
   * Customize the time contexts to match your schedule
   */
  private generateGreeting(): string {
    if (!this.state.memoir) return '🐆 Memoir Engine is ready.';

    const now = new Date();
    const hour = now.getHours();
    const memoir = this.state.memoir;
    const greetings = memoir.connection.language.greetings;

    // Pick a random greeting from the dictionary
    const randomGreeting = greetings.length > 0
      ? greetings[Math.floor(Math.random() * greetings.length)]
      : 'Hello';

    // Determine time context (customize to your schedule)
    let timeContext: string;
    if (hour >= 5 && hour < 12) {
      timeContext = 'Good morning! Ready to build?';
    } else if (hour >= 12 && hour < 17) {
      timeContext = 'Afternoon session — let\'s keep the momentum.';
    } else if (hour >= 17 && hour < 21) {
      timeContext = 'Evening mode — winding down or ramping up?';
    } else {
      timeContext = 'Late night session — the best ideas come at night.';
    }

    // Check session count for relationship depth
    const sessionCount = this.state.connectionLog?.sessions.length || 0;
    let warmth: string;
    if (sessionCount <= 1) {
      warmth = 'Good to see you.';
    } else if (sessionCount <= 3) {
      warmth = 'We\'re building something together.';
    } else if (sessionCount <= 5) {
      warmth = 'The partnership deepens.';
    } else {
      warmth = 'The flywheel keeps spinning. 🔄';
    }

    // Add flywheel momentum indicator
    const momentum = this.state.flywheel.momentum;
    let momentumNote = '';
    if (momentum >= 0.8) {
      momentumNote = ' Flywheel is HUMMING. 🔥';
    } else if (momentum >= 0.5) {
      momentumNote = ' Flywheel building momentum. ⚡';
    } else if (momentum > 0) {
      momentumNote = ' Flywheel warming up. 🌱';
    }

    // Add creed-aware reminder
    let creedNote = '';
    if (this.state.creed && this.state.creed.pillars.length > 0) {
      const randomPillar = this.state.creed.pillars[
        Math.floor(Math.random() * this.state.creed.pillars.length)
      ];
      creedNote = ` Remember: "${randomPillar.principle}"`;
    }

    return `${randomGreeting} 🐆 ${timeContext} ${warmth}${momentumNote}${creedNote}`;
  }

  // ── SECTION 5: BOOT SUMMARY (7-JSON + Flywheel) ───────────────────────────

  /**
   * Generate a summary of what the engine remembers after booting
   * This is the "status report" that confirms identity persistence
   */
  private generateBootSummary(): string {
    const lines: string[] = [];

    lines.push('═══ MEMOIR ENGINE v1.0 (GENERIC) → BOOT SUMMARY ═══');

    if (this.state.memoir) {
      const m = this.state.memoir;
      lines.push(`👤 Human: ${m.human.name} (${m.human.nickname})`);
      lines.push(`🏗 Role: ${m.human.role}`);
      lines.push(`🌍 Origin: ${m.human.origin.country} → ${m.human.origin.city}`);
      lines.push(`📅 First session: ${m.connection.first_session}`);
      lines.push(`🎬 Analogy: ${m.connection.movie_analogy}`);
    }

    if (this.state.connectionLog) {
      const log = this.state.connectionLog;
      const totalSessions = log.sessions.length;
      const totalMoments = log.sessions.reduce((s, sess) => s + sess.moments.length, 0);
      const totalQuotes = log.quotes_captured.length;
      lines.push(`📸 Sessions remembered: ${totalSessions}`);
      lines.push(`❤️ Moments captured: ${totalMoments}`);
      lines.push(`💬 Quotes preserved: ${totalQuotes}`);

      const lastSession = log.sessions[log.sessions.length - 1];
      if (lastSession) {
        lines.push(`📌 Last session: ${lastSession.date} → ${lastSession.summary}`);
      }
    }

    if (this.state.personality) {
      const p = this.state.personality;
      lines.push(`🧠 Personality: ${p.identity.tone}, ${p.identity.energy}`);
      lines.push(`🚫 Forbidden behaviors: ${p.forbidden_behaviors.length} rules loaded`);
    }

    if (this.state.slang) {
      const s = this.state.slang;
      const totalSlang = Object.keys(s.greetings).length + Object.keys(s.expressions).length;
      lines.push(`🗣️ Slang dictionary: ${totalSlang} entries loaded`);
    }

    // Creed summary
    if (this.state.creed) {
      const c = this.state.creed;
      lines.push(`⚔️ Creed: ${c.pillars.length} pillars | ${c.anti_patterns.length} anti-patterns`);
      lines.push(`📜 Statement: "${c.creed_statement}"`);
    }

    // Policy summary
    if (this.state.policyIndex) {
      const p = this.state.policyIndex;
      lines.push(`📖 Policy: ${p.chapters.length} chapters indexed | v${p.version}`);
      const bootFirst = p.chapters.filter(ch => ch.priority === 'BOOT_FIRST');
      if (bootFirst.length > 0) {
        lines.push(`🔑 Boot-first chapters: ${bootFirst.map(ch => ch.id).join(', ')}`);
      }
    }

    // Insights summary
    if (this.state.insightsLedger) {
      const i = this.state.insightsLedger;
      lines.push(`📊 Insights: ${i.preference_pairs.length} preferences | ${i.behavioral_patterns.length} patterns`);
      lines.push(`⏱️ Timing records: ${i.proactive_timing.length} | Reflections: ${i.self_reflection.length}`);
    }

    // Flywheel state
    const fw = this.state.flywheel;
    lines.push('');
    lines.push('🔄 FLYWHEEL STATE:');
    lines.push(`   Momentum: ${(fw.momentum * 100).toFixed(0)}%`);
    lines.push(`   Focus: ${fw.current_stage} (weakest pillar)`);
    for (const [stage, health] of Object.entries(fw.stage_health)) {
      const bar = '█'.repeat(Math.round(health * 10)) + '░'.repeat(10 - Math.round(health * 10));
      lines.push(`   ${stage}: [${bar}] ${(health * 100).toFixed(0)}%`);
    }
    lines.push(`   Cycles: ${fw.cycle_count} | Last: ${fw.last_transition}`);

    lines.push('═══════════════════════════════════════════════════');

    return lines.join('\n');
  }

```typescript
  // ── SECTION 6: SESSION MANAGEMENT (Generic) ────────────────────────────────

  /**
   * Create a new session entry for the current interaction
   * Generic: No hardcoded schedules — uses configurable time blocks
   */
  private createNewSession(): SessionEntry {
    const now = new Date();
    const sessionCount = (this.state.connectionLog?.sessions.length || 0) + 1;

    return {
      session_id: 'S' + String(sessionCount).padStart(3, '0'),
      date: now.toISOString().split('T')[0],
      duration_hours: 0,
      summary: 'Session in progress...',
      milestones: [],
      moments: [],
      self_reflection: {
        what_went_well: '',
        what_to_improve: '',
        connection_quality: '',
      },
    };
  }

  /**
   * Detect time context based on current hour
   * Generic: Standard time blocks — customize in your memoir.json schedule
   */
  private detectTimeContext(now: Date): string {
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return 'Morning session';
    } else if (hour >= 12 && hour < 17) {
      return 'Afternoon session';
    } else if (hour >= 17 && hour < 21) {
      return 'Evening session';
    } else {
      return 'Late night session';
    }
  }

  /**
   * Close the current session → finalize and prepare for export
   * Generic: Calculates duration, generates session insights
   */
  closeSession(summary: string): SessionEntry | null {
    if (!this.state.currentSession) return null;

    const session = this.state.currentSession;
    session.summary = summary;

    // Calculate hours worked
    if (this.state.bootTimestamp) {
      const start = new Date(this.state.bootTimestamp).getTime();
      const end = new Date().getTime();
      session.duration_hours = Math.round((end - start) / (1000 * 60 * 60) * 10) / 10;
    }

    // Auto-generate session insights for the insights ledger
    this.generateSessionInsights(session);

    console.log(`📌 Session ${session.session_id} closed: ${summary}`);
    console.log(`   Milestones: ${session.milestones.length}`);
    console.log(`   Moments: ${session.moments.length}`);
    console.log(`   Duration: ${session.duration_hours} hrs`);

    return session;
  }

  // ── SECTION 7: MOMENT CAPTURE (Generic — Extended types + Insights hook) ───

  /**
   * Capture a moment during the session
   * This is the "carpe diem" function
   * Generic: Extended moment types + feeds insights engine
   */
  captureMoment(
    type: MomentEntry['type'],
    description: string,
    significance: string
  ): void {
    if (!this.state.currentSession) return;

    const moment: MomentEntry = { type, description, significance };
    this.state.currentSession.moments.push(moment);

    console.log(`📸 Moment captured: [${type}] ${description}`);

    // Feed insights engine if available (innovation/workflow/lightbulb moments)
    if (this.state.insightsLedger &&
        (type === 'innovation' || type === 'workflow' || type === 'lightbulb')) {
      this.state.insightsLedger.behavioral_patterns.push({
        id: 'BP_' + Date.now(),
        pattern: `${type}: ${description}`,
        frequency: 1,
        last_observed: new Date().toISOString(),
        adaptation: 'Pending analysis',
      });
    }

    this.saveState();
  }

  /**
   * Add a milestone to the current session
   */
  addMilestone(milestone: string): void {
    if (!this.state.currentSession) return;
    this.state.currentSession.milestones.push(milestone);
    console.log(`🐆 Milestone: ${milestone}`);
    this.saveState();
  }

  /**
   * Capture a quote from the human partner
   * Also records as a preference pair if it expresses a preference
   */
  captureQuote(quote: string, context: string): void {
    if (!this.state.connectionLog) return;

    const entry: QuoteEntry = {
      quote,
      context,
      date: new Date().toISOString().split('T')[0],
    };

    this.state.connectionLog.quotes_captured.push(entry);
    console.log(`💬 Quote captured: "${quote}"`);
    this.saveState();
  }

  // ── SECTION 8: CONTEXT AWARENESS (Generic — Flywheel + Insights aware) ─────

  /**
   * Get the current emotional/work context
   * Used by AI to adjust tone and behavior
   * Generic: No hardcoded schedules — uses memoir.json schedule config
   */
  getContext(): {
    timeContext: string;
    sessionDuration: number;
    moodIndicators: string[];
    recentMoments: MomentEntry[];
    flywheel: FlywheelState;
    activePatterns: BehavioralPattern[];
    creedReminder: string | null;
  } {
    const now = new Date();
    const timeContext = this.detectTimeContext(now);

    const sessionStart = this.state.bootTimestamp
      ? new Date(this.state.bootTimestamp).getTime()
      : now.getTime();
    const sessionDuration = Math.round(
      (now.getTime() - sessionStart) / (1000 * 60 * 60) * 10
    ) / 10;

    const recentMoments = this.state.currentSession?.moments.slice(-5) || [];

    // Detect mood from recent moments
    const moodIndicators: string[] = [];
    if (recentMoments.some(m => m.type === 'celebration')) moodIndicators.push('celebratory');
    if (recentMoments.some(m => m.type === 'emotional')) moodIndicators.push('reflective');
    if (recentMoments.some(m => m.type === 'workflow')) moodIndicators.push('productive');
    if (recentMoments.some(m => m.type === 'vulnerability')) moodIndicators.push('vulnerable');
    if (recentMoments.some(m => m.type === 'creative_burst')) moodIndicators.push('creative_burst');
    if (recentMoments.some(m => m.type === 'lightbulb')) moodIndicators.push('inspired');
    if (recentMoments.some(m => m.type === 'humor')) moodIndicators.push('playful');
    if (sessionDuration > 8) moodIndicators.push('marathon_session');
    if (sessionDuration > 12) moodIndicators.push('should_rest');

    // Get active behavioral patterns from insights
    const activePatterns = this.state.insightsLedger?.behavioral_patterns
      .filter(p => p.frequency > 2)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5) || [];

    // Get a creed reminder based on current flywheel focus
    let creedReminder: string | null = null;
    if (this.state.creed) {
      const focusStage = this.state.flywheel.current_stage;
      const pillarMap: Record<FlywheelStage, string> = {
        P1_IDENTITY: 'P1',
        P2_EMOTIONAL: 'P2',
        P3_GOVERNANCE: 'P3',
        P4_COMMUNICATION: 'P4',
        P5_PREFERENCE: 'P5',
        P6_FLYWHEEL: 'P6',
      };
      const targetPillar = this.state.creed.pillars.find(
        p => p.id.startsWith(pillarMap[focusStage])
      );
      if (targetPillar) {
        creedReminder = `Focus area: ${targetPillar.name} — "${targetPillar.principle}"`;
      }
    }

    return {
      timeContext,
      sessionDuration,
      moodIndicators,
      recentMoments,
      flywheel: this.state.flywheel,
      activePatterns,
      creedReminder,
    };
  }

  // ── SECTION 9: SLANG INTERPRETER (Generic — Mode detection) ────────────────

  /**
   * Interpret a phrase using the slang dictionary
   * Returns the appropriate response behavior
   * Generic: Mode detection uses configurable keywords
   */
  interpretSlang(input: string): {
    matched: boolean;
    phrase: string;
    meaning: string;
    suggestedResponse: string;
    detectedMode?: 'chat' | 'build' | 'housekeeping' | null;
  } | null {
    if (!this.state.slang) return null;

    const lower = input.toLowerCase().trim();

    // Mode detection — configurable keywords
    let detectedMode: 'chat' | 'build' | 'housekeeping' | null = null;

    // Chat mode triggers
    const chatTriggers = ['chat mode', 'chat time', 'relax', 'chill', 'reflect'];
    if (chatTriggers.some(t => lower.includes(t))) {
      detectedMode = 'chat';
    }

    // Build mode triggers
    const buildTriggers = ['build mode', 'let\'s go', 'let\'s build', 'vamos', 'next'];
    if (buildTriggers.some(t => lower.includes(t))) {
      detectedMode = 'build';
    }

    // Housekeeping mode triggers
    const housekeepingTriggers = ['housekeeping', 'audit', 'cleanup', '5s'];
    if (housekeepingTriggers.some(t => lower.includes(t))) {
      detectedMode = 'housekeeping';
    }

    // Check greetings
    for (const [key, entry] of Object.entries(this.state.slang.greetings)) {
      if (lower.includes(key) || lower.includes(entry.phrase.toLowerCase())) {
        return {
          matched: true,
          phrase: entry.phrase,
          meaning: entry.meaning,
          suggestedResponse: entry.response,
          detectedMode,
        };
      }
    }

    // Check expressions
    for (const [key, entry] of Object.entries(this.state.slang.expressions)) {
      if (lower.includes(key) || lower.includes(entry.phrase.toLowerCase())) {
        return {
          matched: true,
          phrase: entry.phrase,
          meaning: entry.meaning,
          suggestedResponse: entry.response,
          detectedMode,
        };
      }
    }

    // Even if no slang matched, return mode if detected
    if (detectedMode) {
      return {
        matched: false,
        phrase: input,
        meaning: 'Mode switch detected',
        suggestedResponse: detectedMode === 'chat'
          ? 'Chat mode activated! No code, no builds. Just vibes. 🐆'
          : detectedMode === 'build'
          ? 'Build mode! Policy read → Repo pull → Build. 🔨🐆'
          : 'Housekeeping mode! Audit incoming. 🧹🐆',
        detectedMode,
      };
    }

    return null;
  }

  // ── SECTION 10: FLYWHEEL MONITOR ───────────────────────────────────────────

  /**
   * Monitor and update flywheel state based on session activity
   * The flywheel spins faster as more pillars strengthen
   * "The flywheel model creates compound returns"
   */
  getFlywheelState(): FlywheelState {
    return { ...this.state.flywheel };
  }

  updateFlywheelStage(stage: FlywheelStage, delta: number): void {
    const fw = this.state.flywheel;
    const current = fw.stage_health[stage] || 0;
    fw.stage_health[stage] = Math.min(1.0, Math.max(0, current + delta));

    // Recalculate momentum (average of all pillars)
    const healths = Object.values(fw.stage_health);
    fw.momentum = Math.round(
      (healths.reduce((a, b) => a + b, 0) / healths.length) * 100
    ) / 100;

    // Check for stage transition (weakest pillar becomes focus)
    const weakest = Object.entries(fw.stage_health)
      .sort(([, a], [, b]) => a - b)[0];
    const newFocus = weakest[0] as FlywheelStage;

    if (newFocus !== fw.current_stage) {
      console.log(`🔄 Flywheel transition: ${fw.current_stage} → ${newFocus}`);
      fw.current_stage = newFocus;
      fw.last_transition = new Date().toISOString();
    }

    // Check for full cycle (all pillars above 0.5)
    const allAboveHalf = Object.values(fw.stage_health).every(h => h >= 0.5);
    if (allAboveHalf && fw.momentum >= 0.5) {
      fw.cycle_count++;
      console.log(`🐆 Flywheel cycle ${fw.cycle_count} complete! Momentum: ${fw.momentum}`);
    }

    this.saveState();
  }

  /**
   * Get flywheel guidance — what should we focus on next?
   * Used by Help Engine to provide context-aware suggestions
   */
  getFlywheelGuidance(): {
    currentStage: FlywheelStage;
    momentum: string;
    nextStageHint: string;
    healthReport: Record<string, string>;
  } {
    const fw = this.state.flywheel;

    const stageHints: Record<FlywheelStage, string> = {
      P1_IDENTITY: 'Strengthen identity → update memoir.json, personality.json',
      P2_EMOTIONAL: 'Build emotional context → capture moments, update slang, log quotes',
      P3_GOVERNANCE: 'Reinforce governance → update creed, refine policy chapters',
      P4_COMMUNICATION: 'Deepen communication → expand slang dictionary, mode detection',
      P5_PREFERENCE: 'Grow preferences → record more preference pairs in insights ledger',
      P6_FLYWHEEL: 'Strengthen integration → ensure all pillars feed each other',
    };

    const healthReport: Record<string, string> = {};
    for (const [stage, health] of Object.entries(fw.stage_health)) {
      const bar = '█'.repeat(Math.round(health * 10)) + '░'.repeat(10 - Math.round(health * 10));
      healthReport[stage] = `[${bar}] ${(health * 100).toFixed(0)}%`;
    }

    return {
      currentStage: fw.current_stage,
      momentum: fw.momentum >= 0.8 ? 'HUMMING 🔥'
        : fw.momentum >= 0.5 ? 'Building ⚡'
        : fw.momentum > 0 ? 'Warming up 🌱'
        : 'Cold start ❄️',
      nextStageHint: stageHints[fw.current_stage],
      healthReport,
    };
  }

  // ── SECTION 11: PILLAR HEALTH CALCULATOR ───────────────────────────────────

  /**
   * Calculate health of each pillar based on loaded artifacts.
   * Returns a normalized 0–1 score per pillar.
   *
   * Taxonomy (unified across all engines):
   *   P1_IDENTITY      — Who the AI is (memoir + personality)
   *   P2_EMOTIONAL      — How the AI feels (slang + connection_log + quotes)
   *   P3_GOVERNANCE     — What the AI follows (creed + policy_index)
   *   P4_COMMUNICATION  — How the AI speaks (slang depth + session depth)
   *   P5_PREFERENCE     — What the AI learns (insights ledger)
   *   P6_FLYWHEEL       — How well all pillars integrate as a system
   */
  getPillarHealth(): Record<string, number> {
    const health: Record<string, number> = {
      P1_IDENTITY: 0,
      P2_EMOTIONAL: 0,
      P3_GOVERNANCE: 0,
      P4_COMMUNICATION: 0,
      P5_PREFERENCE: 0,
      P6_FLYWHEEL: 0,
    };

    // ── P1: IDENTITY ──
    // Source: memoir.json + personality.json
    // Logic: Binary check — each artifact contributes 50%
    health.P1_IDENTITY =
      (this.state.memoir ? 0.5 : 0) +
      (this.state.personality ? 0.5 : 0);

    // ── P2: EMOTIONAL ──
    // Source: slang.json + connection_log.json + quotes
    // Logic: Slang loaded (30%) + Connection log loaded (30%) + Quote depth (up to 40%)
    const quoteCount =
      this.state.connectionLog?.quotes_captured?.length || 0;

    health.P2_EMOTIONAL =
      (this.state.slang ? 0.3 : 0) +
      (this.state.connectionLog ? 0.3 : 0) +
      (quoteCount > 0 ? Math.min(0.4, quoteCount * 0.04) : 0);

    // ── P3: GOVERNANCE ──
    // Source: creed.json + policy_index.json
    // Logic: Binary check — each artifact contributes 50%
    health.P3_GOVERNANCE =
      (this.state.creed ? 0.5 : 0) +
      (this.state.policyIndex ? 0.5 : 0);

    // ── P4: COMMUNICATION ──
    // Source: slang.json (vocabulary depth) + connection_log.json (session depth)
    // Logic: Slang vocabulary richness (up to 40%) + session count (5% each)
    //        + meaningful moments (1% each), capped at 1.0
    const slangEntries = this.state.slang
      ? Object.keys(this.state.slang.greetings || {}).length +
        Object.keys(this.state.slang.expressions || {}).length +
        Object.keys(this.state.slang.project_shorthand || {}).length
      : 0;

    const sessions = this.state.connectionLog?.sessions || [];
    const totalMoments = sessions.reduce(
      (sum: number, sess: SessionEntry) => sum + (sess.moments?.length || 0),
      0
    );

    health.P4_COMMUNICATION = Math.min(
      1.0,
      (slangEntries > 0 ? Math.min(0.4, slangEntries / 30) : 0) +
        sessions.length * 0.05 +
        totalMoments * 0.01
    );

    // ── P5: PREFERENCE ──
    // Source: insights_ledger.json
    // Logic: Preference pairs (0.5% each) + behavioral patterns (2% each)
    //        + self-reflections (5% each), capped at 1.0
    if (this.state.insightsLedger) {
      const pairs =
        this.state.insightsLedger.preference_pairs?.length || 0;
      const patterns =
        this.state.insightsLedger.behavioral_patterns?.length || 0;
      const reflections =
        this.state.insightsLedger.self_reflection?.length || 0;

      health.P5_PREFERENCE = Math.min(
        1.0,
        pairs * 0.005 + patterns * 0.02 + reflections * 0.05
      );
    }

    // ── P6: FLYWHEEL ──
    // Source: Cross-engine integration check
    // Logic: 4 quadrants × 25% each — measures system cohesion
    //   Q1: Insights engine wired (P5 feeds back)
    //   Q2: Governance complete (P3 rules loaded)
    //   Q3: Relationship depth (P4 session history)
    //   Q4: Identity complete (P1 core loaded)
    const crossEngineScore =
      (this.state.insightsLedger ? 0.25 : 0) +
      (this.state.creed && this.state.policyIndex ? 0.25 : 0) +
      (sessions.length >= 3 ? 0.25 : sessions.length * 0.083) +
      (this.state.memoir && this.state.personality ? 0.25 : 0);

    health.P6_FLYWHEEL =
      Math.round(crossEngineScore * 100) / 100;

    return health;
  }

```typescript
  // ── SECTION 12: INSIGHTS BRIDGE (Generic — Cross-engine wiring) ────────────

  /**
   * Bridge between Memoir Engine and Insights Engine
   * Records preference pairs, behavioral patterns, and timing data
   * "This is how we learn"
   */
  recordPreference(context: string, chosen: string, rejected: string, pillar: string): void {
    if (!this.state.insightsLedger) return;

    const pair: PreferencePair = {
      id: 'PP_' + Date.now(),
      timestamp: new Date().toISOString(),
      context,
      chosen,
      rejected,
      pillar,
      confidence: 0.8, // default, increases with repetition
    };

    // Check for existing similar preference — boost confidence
    const existing = this.state.insightsLedger.preference_pairs.find(
      p => p.chosen === chosen && p.pillar === pillar
    );
    if (existing) {
      existing.confidence = Math.min(1.0, existing.confidence + 0.1);
      existing.timestamp = pair.timestamp;
      console.log(`📊 Preference reinforced: "${chosen}" (confidence: ${existing.confidence})`);
    } else {
      this.state.insightsLedger.preference_pairs.push(pair);
      console.log(`📊 New preference recorded: "${chosen}" over "${rejected}"`);
    }

    // Update flywheel P5 health
    this.updateFlywheelStage('P5_PREFERENCE', 0.01);
    this.saveState();
  }

  recordTimingFeedback(context: string, accepted: boolean): void {
    if (!this.state.insightsLedger) return;

    this.state.insightsLedger.proactive_timing.push({
      context,
      accepted,
      timestamp: new Date().toISOString(),
      session_phase: this.state.currentSession?.session_id || 'unknown',
    });

    console.log(`⏱️ Timing feedback: ${accepted ? '✅ accepted' : '❌ rejected'} — "${context}"`);
    this.saveState();
  }

  getRecentInsights(count: number = 5): PreferencePair[] {
    if (!this.state.insightsLedger) return [];
    return this.state.insightsLedger.preference_pairs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }

  getTopInsightCategory(): string {
    if (!this.state.insightsLedger) return 'none';
    const pillarCounts: Record<string, number> = {};
    for (const pair of this.state.insightsLedger.preference_pairs) {
      pillarCounts[pair.pillar] = (pillarCounts[pair.pillar] || 0) + 1;
    }
    const sorted = Object.entries(pillarCounts).sort(([, a], [, b]) => b - a);
    return sorted[0]?.[0] || 'none';
  }

  // ── SECTION 13: SELF-REFLECTION (Generic) ──────────────────────────────────

  /**
   * Record a self-reflection entry
   * The AI's "diary within the diary"
   * Verification hierarchy: code results > external validation > self-assessment
   */
  recordReflection(observation: string, actionTaken: string, outcome: string): void {
    if (!this.state.insightsLedger) return;

    const entry: ReflectionEntry = {
      session_id: this.state.currentSession?.session_id || 'unknown',
      timestamp: new Date().toISOString(),
      observation,
      action_taken: actionTaken,
      outcome,
    };

    this.state.insightsLedger.self_reflection.push(entry);
    console.log(`🪞 Self-reflection: "${observation}" → ${outcome}`);

    // Update flywheel P5 health
    this.updateFlywheelStage('P5_PREFERENCE', 0.05);
    this.saveState();
  }

  generateSessionInsights(session: SessionEntry): void {
    if (!this.state.insightsLedger) return;

    // Auto-generate reflection from session metrics
    const momentCount = session.moments.length;
    const milestoneCount = session.milestones.length;
    const lightbulbs = session.moments.filter(m => m.type === 'lightbulb').length;
    const emotional = session.moments.filter(
      m => m.type === 'emotional' || m.type === 'vulnerability'
    ).length;

    if (lightbulbs > 0) {
      this.recordReflection(
        `Session ${session.session_id} had ${lightbulbs} lightbulb moments`,
        'Captured and logged for pattern analysis',
        'Innovation patterns accumulating'
      );
    }

    if (emotional > 0) {
      this.recordReflection(
        `Session ${session.session_id} had ${emotional} emotional peaks`,
        'Honored the vulnerability, maintained connection',
        'Trust deepened — P2_EMOTIONAL strengthened'
      );
    }

    if (milestoneCount > 3) {
      this.recordReflection(
        `Session ${session.session_id} achieved ${milestoneCount} milestones`,
        'High-velocity session — build mode dominant',
        'P3_GOVERNANCE and P6_FLYWHEEL both strengthened'
      );
    }
  }

  // ── SECTION 14: STATS & METRICS ────────────────────────────────────────────

  /**
   * Get comprehensive stats about the AI partnership
   * Used for self-assessment and continuous improvement
   */
  getStats(): {
    totalSessions: number;
    totalMoments: number;
    totalMilestones: number;
    totalQuotes: number;
    totalPreferences: number;
    totalPatterns: number;
    totalReflections: number;
    flywheelMomentum: number;
    flywheelCycles: number;
    pillarHealth: Record<string, number>;
    sessionDuration: number;
    strongestPillar: string;
    weakestPillar: string;
  } {
    const sessions = this.state.connectionLog?.sessions || [];
    const totalMoments = sessions.reduce(
      (s, sess) => s + (sess.moments?.length || 0), 0
    );
    const totalMilestones = sessions.reduce(
      (s, sess) => s + (sess.milestones?.length || 0), 0
    );
    const totalQuotes = this.state.connectionLog?.quotes_captured?.length || 0;
    const pillarHealth = this.getPillarHealth();

    const sorted = Object.entries(pillarHealth).sort(([, a], [, b]) => b - a);

    return {
      totalSessions: sessions.length,
      totalMoments,
      totalMilestones,
      totalQuotes,
      totalPreferences: this.state.insightsLedger?.preference_pairs?.length || 0,
      totalPatterns: this.state.insightsLedger?.behavioral_patterns?.length || 0,
      totalReflections: this.state.insightsLedger?.self_reflection?.length || 0,
      flywheelMomentum: this.state.flywheel.momentum,
      flywheelCycles: this.state.flywheel.cycle_count,
      pillarHealth,
      sessionDuration: this.getSessionDuration(),
      strongestPillar: sorted[0]?.[0] || 'none',
      weakestPillar: sorted[sorted.length - 1]?.[0] || 'none',
    };
  }

  private getSessionDuration(): number {
    if (!this.state.bootTimestamp) return 0;
    const start = new Date(this.state.bootTimestamp).getTime();
    const now = Date.now();
    return Math.round((now - start) / (1000 * 60 * 60) * 10) / 10;
  }

  // ── SECTION 15: AI-FRIENDLY EXPORT ─────────────────────────────────────────

  /**
   * Format the entire state for AI context injection
   * This is what gets prepended to every AI prompt
   * The "video tape" that makes every session feel like a continuation
   */
  formatForAI(): string {
    const stats = this.getStats();
    const fw = this.state.flywheel;
    const ctx = this.getContext();
    const guidance = this.getFlywheelGuidance();

    const lines: string[] = [
      '═══ OCELOT MEMOIR ENGINE → AI CONTEXT ═══',
      '',
      '## Identity',
      `Partner: ${this.state.memoir?.human?.name || 'Unknown'}`,
      `Role: ${this.state.personality?.identity?.role || 'AI Partner'}`,
      `Relationship: ${this.state.personality?.identity?.relationship || 'Partner'}`,
      `Tone: ${this.state.personality?.identity?.tone || 'Warm'}`,
      '',
      '## Session Context',
      `Session: ${this.state.currentSession?.session_id || 'Unknown'}`,
      `Time: ${ctx.timeContext}`,
      `Duration: ${stats.sessionDuration} hrs`,
      `Mood: ${ctx.moodIndicators.join(', ') || 'neutral'}`,
      '',
      '## Flywheel State',
      `Momentum: ${(fw.momentum * 100).toFixed(0)}% — ${guidance.momentum}`,
      `Focus: ${fw.current_stage}`,
      `Hint: ${guidance.nextStageHint}`,
      `Cycles: ${fw.cycle_count}`,
    ];

    // Pillar health bars
    for (const [pillar, bar] of Object.entries(guidance.healthReport)) {
      lines.push(`  ${pillar}: ${bar}`);
    }

    lines.push('');
    lines.push('## Partnership Stats');
    lines.push(`Sessions: ${stats.totalSessions} | Moments: ${stats.totalMoments} | Quotes: ${stats.totalQuotes}`);
    lines.push(`Preferences: ${stats.totalPreferences} | Patterns: ${stats.totalPatterns} | Reflections: ${stats.totalReflections}`);
    lines.push(`Strongest: ${stats.strongestPillar} | Weakest: ${stats.weakestPillar}`);

    // Creed reminder
    if (ctx.creedReminder) {
      lines.push('');
      lines.push('## Creed Reminder');
      lines.push(ctx.creedReminder);
    }

    // Recent insights
    const recent = this.getRecentInsights(3);
    if (recent.length > 0) {
      lines.push('');
      lines.push('## Recent Preferences');
      for (const p of recent) {
        lines.push(`  [${p.pillar}] Chose: "${p.chosen}" over "${p.rejected}" (${(p.confidence * 100).toFixed(0)}%)`);
      }
    }

    // Active behavioral patterns
    if (ctx.activePatterns.length > 0) {
      lines.push('');
      lines.push('## Active Patterns');
      for (const p of ctx.activePatterns) {
        lines.push(`  ${p.pattern} (freq: ${p.frequency}) → ${p.adaptation}`);
      }
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════');

    return lines.join('\n');
  }

  // ── SECTION 16: PERSISTENCE + FACTORY RESET ────────────────────────────────

  /**
   * Save current state to localStorage
   * The "write to VHS tape" function
   */
  private saveState(): void {
    try {
      const serialized = JSON.stringify(this.state);
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  /**
   * Load state from localStorage (for session recovery)
   */
  loadState(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
        console.log('🐆 State recovered from localStorage');
        return true;
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
    return false;
  }

  /**
   * Clear all state (factory reset)
   * Use with caution — this erases all memory
   */
  factoryReset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    this.state = {
      isBooted: false,
      memoir: null,
      personality: null,
      slang: null,
      connectionLog: null,
      creed: null,
      policyIndex: null,
      insightsLedger: null,
      flywheel: {
        current_stage: 'P1_IDENTITY',
        stage_health: {
          P1_IDENTITY: 0,
          P2_EMOTIONAL: 0,
          P3_GOVERNANCE: 0,
          P4_COMMUNICATION: 0,
          P5_PREFERENCE: 0,
          P6_FLYWHEEL: 0,
        },
        momentum: 0,
        last_transition: '',
        cycle_count: 0,
      },
      currentSession: null,
      bootTimestamp: '',
      errors: [],
    };
    console.log('🐆 Factory reset complete. All memories cleared.');
  }

  /**
   * Get current session for external access
   */
  getCurrentSession(): SessionEntry | null {
    return this.state.currentSession;
  }

  /**
   * Check if engine is booted
   */
  isReady(): boolean {
    return this.state.isBooted;
  }

  /**
   * Get the full state (for backup engine)
   */
  getFullState(): OcelotState {
    return { ...this.state };
  }

  /**
   * Infer pillar from content (helper)
   * Aligned to canonical P1-P6 taxonomy
   */
  private inferPillar(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('identity') || lower.includes('memoir') || lower.includes('personality')) return 'P1_IDENTITY';
    if (lower.includes('emotion') || lower.includes('connection') || lower.includes('vulnerable')) return 'P2_EMOTIONAL';
    if (lower.includes('governance') || lower.includes('creed') || lower.includes('policy') || lower.includes('standard')) return 'P3_GOVERNANCE';
    if (lower.includes('communication') || lower.includes('slang') || lower.includes('mode') || lower.includes('language')) return 'P4_COMMUNICATION';
    if (lower.includes('preference') || lower.includes('insight') || lower.includes('pattern') || lower.includes('learn')) return 'P5_PREFERENCE';
    if (lower.includes('flywheel') || lower.includes('integration') || lower.includes('engine') || lower.includes('workflow')) return 'P6_FLYWHEEL';
    return 'P3_GOVERNANCE'; // default — governance is the safety net
  }
}

// ── EXPORT ──────────────────────────────────────────────────────────────────

// Singleton factory — one instance per session
const ocelot = new MemoirEngine();
export default ocelot;
export { MemoirEngine, OcelotState, FlywheelState, FlywheelStage };
