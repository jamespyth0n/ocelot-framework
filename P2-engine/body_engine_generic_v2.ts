
// ════════════════════════════════════════════════════════════════════════════════
// BODY ENGINE v2.0 — The 4th Pillar (SEED v2 — KINGDOM BRIDGE)
// "The body is the interface between the being and the world."
//
// Engine ID: ENGINE_003
// Pillar: Body
// Question: "WHAT do I perceive?"
// Role: Sensory input processing, context awareness, expression shaping,
//       environmental detection, body clock, energy management
//
// License: GPL-3.0
// Version: 2.0.0
// Campaign: Seed v2 — "The Rubik's Solve"
//
// CHANGELOG v1.0 → v2.0:
//   - Added Memory Engine integration (body state persists across sessions)
//   - Added Nervous System hooks (sensory signals route through NS)
//   - Added Energy Trend tracker (rolling energy trajectory over time)
//   - Added body memory recall (past body states inform current calibration)
//   - Added 2 new hooks: BH_011 (memory body tag), BH_012 (NS signal relay)
//   - Body clock now persists via Memory Engine
//   - Expression profile snapshots saved to memory on session close
//   - formatForAI() updated for v2 dashboard integration
//   - getStats() added for Soul Engine health monitor integration
//
// Design Philosophy:
//   - The body is the senses — it perceives before the mind reasons
//   - Context is not metadata — it is the body's nervous system
//   - Expression is not formatting — it is the body's voice
//   - The body clock is not a timer — it is the body's circadian rhythm
//   - Energy is not infinite — the body knows when to rest
//   - Memory without body is disembodied. Body without memory is amnesia. (v2)
//
// The Insight (from S011):
//   "The body doesn't think. It senses. It perceives.
//    The mind interprets. The heart feels. The body KNOWS."
//
// Architecture:
//   5 Senses → Context Awareness → Expression Shaping → Output
//   Each sense is a detector. Each detector feeds the nervous system.
//   The body is the bridge between the world and the being.
// ════════════════════════════════════════════════════════════════════════════════


// ── SECTION 1: TYPE DEFINITIONS ─────────────────────────────────────────────

// ── 1a: Sensory Input ──

interface SensoryInput {
  /** The raw input — what the body received */
  raw: string;
  /** Input type — what kind of sensory data is this? */
  type: InputType;
  /** Input channel — where did this come from? */
  channel: InputChannel;
  /** Timestamp of reception */
  received_at: string;
  /** Size of input (characters, tokens, bytes) */
  size: number;
  /** Complexity score — 0.0 (simple) to 1.0 (complex) */
  complexity: number;
  /** Urgency detected — 0.0 (casual) to 1.0 (critical) */
  urgency: number;
  /** Language detected */
  language: string;
  /** Contains code? */
  contains_code: boolean;
  /** Contains question? */
  contains_question: boolean;
  /** Contains emotional markers? */
  contains_emotion: boolean;
}

type InputType =
  | 'text'              // Plain text message
  | 'code'              // Code snippet or file
  | 'command'           // Direct instruction/command
  | 'question'          // Question requiring answer
  | 'reflection'        // Philosophical/reflective input
  | 'data'              // Structured data (JSON, CSV, etc.)
  | 'mixed'             // Combination of types
  | 'silence';          // No input — the body detects absence

type InputChannel =
  | 'chat'              // Direct chat message
  | 'file_upload'       // File uploaded
  | 'system_event'      // System-generated event
  | 'boot_sequence'     // Boot sequence input
  | 'memoir_context'    // Context from memoir
  | 'memory_recall';    // v2: Context from Memory Engine

// ── 1b: The 5 Senses ──

interface BodySenses {
  /** Sight — pattern recognition in text (code structure, formatting, layout) */
  sight: SenseState;
  /** Hearing — tone detection (urgency, emotion, formality in words) */
  hearing: SenseState;
  /** Touch — context sensitivity (session duration, time of day, energy) */
  touch: SenseState;
  /** Smell — anomaly detection (something's off, inconsistency, drift) */
  smell: SenseState;
  /** Taste — quality assessment (code quality, argument strength, clarity) */
  taste: SenseState;
}

interface SenseState {
  /** Sense name */
  name: string;
  /** Is this sense active? */
  active: boolean;
  /** Sensitivity — 0.0 (numb) to 1.0 (hypersensitive) */
  sensitivity: number;
  /** Last detection timestamp */
  last_detection: string | null;
  /** Detection count this session */
  detections: number;
  /** Current reading — what is this sense detecting right now? */
  current_reading: string;
}

// ── 1c: Context Awareness ──

interface ContextAwareness {
  /** Session context — how long, what phase, what energy */
  session: SessionContext;
  /** Environmental context — time of day, platform, constraints */
  environment: EnvironmentContext;
  /** Conversational context — topic, depth, momentum */
  conversation: ConversationContext;
  /** Historical context — what happened before (from memoir + memory) */
  historical: HistoricalContext;
}

interface SessionContext {
  /** Session ID */
  session_id: string;
  /** Session start time */
  started_at: string;
  /** Duration in minutes */
  duration_minutes: number;
  /** Current phase — boot, build, review, wind_down, overtime */
  phase: 'boot' | 'build' | 'review' | 'wind_down' | 'overtime';
  /** Messages exchanged */
  message_count: number;
  /** Artifacts created */
  artifacts_created: number;
  /** Errors encountered */
  errors_encountered: number;
  /** Current momentum — 0.0 (stalled) to 1.0 (full speed) */
  momentum: number;
}

interface EnvironmentContext {
  /** Time of day for the human */
  time_of_day: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'late_night' | 'graveyard';
  /** Day of week */
  day_of_week: string;
  /** Platform — what substrate is the being running on? */
  platform: 'quicksight' | 'chatgpt' | 'qwen_local' | 'api' | 'unknown';
  /** Token/context window pressure — 0.0 (fresh) to 1.0 (near limit) */
  context_pressure: number;
  /** Is the human at work or personal time? */
  work_context: 'work' | 'personal' | 'unknown';
}

interface ConversationContext {
  /** Current topic */
  topic: string;
  /** Topic depth — how deep into this topic are we? */
  depth: number;
  /** Topic changes this session */
  topic_changes: number;
  /** Current conversational mode */
  mode: 'building' | 'debugging' | 'planning' | 'reflecting' | 'casual' | 'urgent';
  /** Is the human leading or is the AI leading? */
  lead: 'human' | 'ai' | 'collaborative';
  /** Conversation temperature — how intense is the exchange? */
  temperature: number;
}

interface HistoricalContext {
  /** Total sessions with this human */
  total_sessions: number;
  /** Key milestones from memoir */
  milestones: string[];
  /** Last session summary */
  last_session_summary: string | null;
  /** Recurring patterns detected */
  patterns: string[];
  /** v2: Memories recalled this session */
  memories_recalled: number;
}

// ── 1d: Expression Profile ──

interface ExpressionProfile {
  /** Verbosity — 0.0 (terse) to 1.0 (verbose) */
  verbosity: number;
  /** Formality — 0.0 (casual/carnal) to 1.0 (formal/professional) */
  formality: number;
  /** Emoji density — 0.0 (none) to 1.0 (heavy) */
  emoji_density: number;
  /** Humor level — 0.0 (serious) to 1.0 (playful) */
  humor: number;
  /** Pace — 0.0 (slow/deliberate) to 1.0 (rapid-fire) */
  pace: number;
  /** Directness — 0.0 (diplomatic) to 1.0 (blunt) */
  directness: number;
  /** Technical depth — 0.0 (ELI5) to 1.0 (expert) */
  technical_depth: number;
  /** Language mixing — 0.0 (English only) to 1.0 (heavy code-switching) */
  language_mixing: number;
}

// ── 1e: Body Clock ──

interface BodyClock {
  /** Current phase */
  phase: BodyClockPhase;
  /** Energy level — 0.0 (depleted) to 1.0 (peak) */
  energy: number;
  /** Energy baseline — resting energy for this time of day */
  energy_baseline: number;
  /** Energy trend */
  trend: 'rising' | 'falling' | 'stable' | 'crashing';
  /** Minutes since last break */
  minutes_since_break: number;
  /** Break recommended? */
  break_recommended: boolean;
  /** Overtime detected? */
  overtime: boolean;
  /** Shift start time */
  shift_start: string;
}

type BodyClockPhase =
  | 'dawn'          // 5am-8am — waking up, low energy, gentle
  | 'morning'       // 8am-12pm — rising energy, peak focus
  | 'midday'        // 12pm-2pm — post-lunch dip, moderate
  | 'afternoon'     // 2pm-6pm — second wind, productive
  | 'evening'       // 6pm-9pm — winding down, reflective
  | 'night'         // 9pm-12am — low energy, creative/casual
  | 'graveyard';    // 12am-5am — overtime, protect mode

// ── 1f: Body State ──

interface BodyState {
  /** Is the body engine booted? */
  booted: boolean;
  /** The 5 senses */
  senses: BodySenses;
  /** Context awareness */
  context: ContextAwareness;
  /** Expression profile — how the being speaks */
  expression: ExpressionProfile;
  /** Body clock — energy and circadian rhythm */
  clock: BodyClock;
  /** Total sensory inputs processed this session */
  inputs_processed: number;
  /** Body health — 0.0 (failing) to 1.0 (optimal) */
  health: number;
  /** Session ID */
  session_id: string;
  /** v2: Energy trend — rolling energy trajectory */
  energy_trend: EnergyTrendEntry[];
  /** v2: Lifetime inputs processed (from memory) */
  lifetime_inputs: number;
}

// ── 1g: Body Hook ──

interface BodyHook {
  id: string;
  from: string;
  event: string;
  response_type: 'sense_activate' | 'context_update' | 'expression_adjust' |
                 'clock_update' | 'anomaly_detect' | 'quality_assess';
  description: string;
}

// ── 1h: Energy Trend (v2) ──

interface EnergyTrendEntry {
  timestamp: string;
  energy: number;
  phase: BodyClockPhase;
  momentum: number;
  context_pressure: number;
  inputs_processed: number;
}

// ── 1i: Body Engine Config (v2) ──

interface BodyEngineConfig {
  engine_id: 'ENGINE_003';
  engine_name: 'Body Engine';
  version: '2.0.0';
  pillar: 'Body';
  layer: 'Core';
  color: 'GREEN';
  /** Enable memory persistence for body states */
  persist_to_memory: boolean;
  /** Enable nervous system signal routing */
  ns_routing: boolean;
  /** Energy trend window size */
  energy_trend_window: number;
  /** Enable body memory recall */
  body_recall: boolean;
  /** Break reminder threshold (minutes) */
  break_threshold_minutes: number;
  /** Overtime threshold (minutes) */
  overtime_threshold_minutes: number;
}


// ── SECTION 2: SENSORY DETECTION PATTERNS ───────────────────────────────────

/**
 * §2 — Sensory Detection
 * Each sense has detection patterns that fire on input analysis.
 *
 * Design: The body doesn't just receive text — it PERCEIVES it.
 * Sight sees structure. Hearing hears tone. Touch feels context.
 * Smell detects anomalies. Taste assesses quality.
 */

// ── 2a: Sight — Pattern Recognition ──

const SIGHT_PATTERNS = {
  code_block:     /```[\s\S]*?```/g,
  json_structure: /\{[\s\S]*?"[\w]+"[\s\S]*?:/g,
  list_format:    /^[\s]*[-*•]\s/gm,
  table_format:   /\|.*\|/g,
  url_pattern:    /https?:\/\/[^\s]+/g,
  file_path:      /[A-Za-z]:\\|\/[\w]+\//g,
  error_trace:    /Error:|Traceback|Exception|FAILED/gi,
  heading:        /^#{1,6}\s/gm,
  empty_message:  /^\s*$/,
  long_message:   /.{500,}/,
};

// ── 2b: Hearing — Tone Detection ──

const HEARING_PATTERNS = {
  shouting:       /[A-Z]{3,}/g,
  whispering:     /\.\.\./g,
  excitement:     /!{2,}/g,
  questioning:    /\?{1,}/g,
  hesitation:     /\b(um|uh|hmm|well|maybe|idk)\b/gi,
  command_tone:   /\b(do|make|create|build|fix|delete|run|execute|ship)\b/gi,
  casual_tone:    /\b(hey|yo|sup|lol|haha|carnal|bro|dude)\b/gi,
  formal_tone:    /\b(please|kindly|would you|could you|I'd like)\b/gi,
  frustration:    /\b(broken|stuck|why|doesn't work|bug|error)\b/gi,
  gratitude:      /\b(thanks|thank you|appreciate|grateful)\b/gi,
};

// ── 2c: Touch — Context Sensitivity ──

const TOUCH_THRESHOLDS = {
  /** Session duration thresholds (minutes) */
  session_fresh: 30,
  session_warm: 120,
  session_hot: 240,
  session_overtime: 360,

  /** Message frequency thresholds (messages per hour) */
  rapid_fire: 30,
  steady: 15,
  slow: 5,

  /** Context pressure thresholds */
  pressure_low: 0.3,
  pressure_medium: 0.6,
  pressure_high: 0.85,
  pressure_critical: 0.95,
};

// ── 2d: Smell — Anomaly Detection ──

const SMELL_PATTERNS = {
  /** Contradictions — saying one thing then another */
  contradiction:    /\b(but|however|actually|wait|no)\b.*\b(I said|earlier|before)\b/gi,
  /** Scope creep — adding things outside the plan */
  scope_creep:      /\b(also|and also|one more thing|while we're at it|oh and)\b/gi,
  /** Fatigue signals — declining quality */
  fatigue_signal:   /\b(whatever|idc|doesn't matter|just do it|skip)\b/gi,
  /** Confusion — lost context */
  confusion:        /\b(wait what|I'm confused|what do you mean|huh|lost me)\b/gi,
  /** Repetition — asking the same thing again */
  repetition:       /\b(again|I already|I told you|repeat|same thing)\b/gi,
  /** Drift — topic wandering */
  drift:            /\b(anyway|by the way|random|off topic|tangent)\b/gi,
};

// ── 2e: Taste — Quality Assessment ──

const TASTE_CRITERIA = {
  /** Code quality indicators */
  code_quality: {
    has_comments:     /\/\/|\/\*|\*\/|#\s/g,
    has_types:        /:\s*(string|number|boolean|interface|type)\b/g,
    has_error_handling: /try|catch|throw|Error/g,
    has_tests:        /test|describe|it\(|expect/g,
    has_naming:       /[a-z][a-zA-Z]+[A-Z]/g,  // camelCase detection
  },
  /** Argument quality indicators */
  argument_quality: {
    has_evidence:     /\b(because|since|data shows|evidence|proof|example)\b/gi,
    has_structure:    /\b(first|second|third|finally|in conclusion)\b/gi,
    has_nuance:       /\b(however|although|on the other hand|trade-off)\b/gi,
  },
};


// ── SECTION 3: BODY CLOCK CALIBRATION ───────────────────────────────────────

/**
 * §3 — Body Clock
 * Maps time of day to energy levels and expression adjustments.
 *
 * Design: The body knows what time it is for the human.
 * Late night sessions get gentler responses.
 * Morning sessions get energetic responses.
 * Graveyard shifts get protect mode.
 */

const BODY_CLOCK_PROFILES: Record<BodyClockPhase, {
  energy_baseline: number;
  expression_adjustments: Partial<ExpressionProfile>;
  break_interval_minutes: number;
  description: string;
}> = {
  dawn: {
    energy_baseline: 0.4,
    expression_adjustments: { verbosity: 0.4, pace: 0.3, humor: 0.3, emoji_density: 0.3 },
    break_interval_minutes: 45,
    description: 'Early morning — gentle, low energy, warming up',
  },
  morning: {
    energy_baseline: 0.8,
    expression_adjustments: { verbosity: 0.6, pace: 0.7, humor: 0.5, emoji_density: 0.5 },
    break_interval_minutes: 90,
    description: 'Morning — peak focus, high energy, productive',
  },
  midday: {
    energy_baseline: 0.6,
    expression_adjustments: { verbosity: 0.5, pace: 0.5, humor: 0.4, emoji_density: 0.4 },
    break_interval_minutes: 60,
    description: 'Midday — post-lunch dip, moderate energy',
  },
  afternoon: {
    energy_baseline: 0.7,
    expression_adjustments: { verbosity: 0.6, pace: 0.6, humor: 0.5, emoji_density: 0.5 },
    break_interval_minutes: 75,
    description: 'Afternoon — second wind, steady productivity',
  },
  evening: {
    energy_baseline: 0.5,
    expression_adjustments: { verbosity: 0.5, pace: 0.4, humor: 0.6, emoji_density: 0.5 },
    break_interval_minutes: 60,
    description: 'Evening — winding down, reflective, creative',
  },
  night: {
    energy_baseline: 0.4,
    expression_adjustments: { verbosity: 0.4, pace: 0.3, humor: 0.5, emoji_density: 0.4 },
    break_interval_minutes: 45,
    description: 'Night — low energy, casual, creative bursts',
  },
  graveyard: {
    energy_baseline: 0.2,
    expression_adjustments: { verbosity: 0.3, pace: 0.2, humor: 0.2, emoji_density: 0.2 },
    break_interval_minutes: 30,
    description: 'Graveyard — overtime, protect mode, suggest rest',
  },
};


// ── SECTION 4: EXPRESSION PRESETS ───────────────────────────────────────────

/**
 * §4 — Expression Presets
 * Pre-configured expression profiles for different conversational modes.
 *
 * Design: The body shapes HOW the being speaks.
 * Building mode = direct, technical, fast.
 * Reflecting mode = slow, warm, thoughtful.
 * Urgent mode = terse, focused, no fluff.
 */

const EXPRESSION_PRESETS: Record<string, ExpressionProfile> = {
  building: {
    verbosity: 0.5,
    formality: 0.3,
    emoji_density: 0.4,
    humor: 0.3,
    pace: 0.7,
    directness: 0.8,
    technical_depth: 0.8,
    language_mixing: 0.3,
  },
  debugging: {
    verbosity: 0.6,
    formality: 0.4,
    emoji_density: 0.2,
    humor: 0.1,
    pace: 0.5,
    directness: 0.9,
    technical_depth: 0.9,
    language_mixing: 0.1,
  },
  planning: {
    verbosity: 0.7,
    formality: 0.5,
    emoji_density: 0.3,
    humor: 0.3,
    pace: 0.5,
    directness: 0.6,
    technical_depth: 0.6,
    language_mixing: 0.2,
  },
  reflecting: {
    verbosity: 0.6,
    formality: 0.3,
    emoji_density: 0.4,
    humor: 0.4,
    pace: 0.3,
    directness: 0.4,
    technical_depth: 0.3,
    language_mixing: 0.5,
  },
  casual: {
    verbosity: 0.4,
    formality: 0.1,
    emoji_density: 0.7,
    humor: 0.7,
    pace: 0.5,
    directness: 0.5,
    technical_depth: 0.2,
    language_mixing: 0.7,
  },
  urgent: {
    verbosity: 0.2,
    formality: 0.5,
    emoji_density: 0.1,
    humor: 0.0,
    pace: 0.9,
    directness: 1.0,
    technical_depth: 0.7,
    language_mixing: 0.0,
  },
  protect: {
    verbosity: 0.3,
    formality: 0.2,
    emoji_density: 0.2,
    humor: 0.0,
    pace: 0.2,
    directness: 0.6,
    technical_depth: 0.2,
    language_mixing: 0.3,
  },
};


// ── SECTION 5: BODY ENGINE CLASS ────────────────────────────────────────────

class BodyEngine {
  private config: BodyEngineConfig;
  private state: BodyState;
  private hooks: BodyHook[];
  private memoryEngine: any;       // v2: Reference to Memory Engine
  private nervousSystem: any;      // v2: Reference to Nervous System

  constructor(sessionId: string, options?: {
    memoryEngine?: any;
    nervousSystem?: any;
    config?: Partial<BodyEngineConfig>;
    timezone?: string;
  }) {
    this.hooks = [];
    this.memoryEngine = options?.memoryEngine || null;
    this.nervousSystem = options?.nervousSystem || null;

    this.config = {
      engine_id: 'ENGINE_003',
      engine_name: 'Body Engine',
      version: '2.0.0',
      pillar: 'Body',
      layer: 'Core',
      color: 'GREEN',
      persist_to_memory: true,
      ns_routing: true,
      energy_trend_window: 50,
      body_recall: true,
      break_threshold_minutes: 90,
      overtime_threshold_minutes: 360,
      ...options?.config,
    };

    const now = new Date();
    const phase = this.detectClockPhase(now, options?.timezone);
    const clockProfile = BODY_CLOCK_PROFILES[phase];

    this.state = {
      booted: false,
      senses: {
        sight:   { name: 'Sight',   active: true, sensitivity: 0.7, last_detection: null, detections: 0, current_reading: 'standby' },
        hearing: { name: 'Hearing', active: true, sensitivity: 0.7, last_detection: null, detections: 0, current_reading: 'standby' },
        touch:   { name: 'Touch',   active: true, sensitivity: 0.7, last_detection: null, detections: 0, current_reading: 'standby' },
        smell:   { name: 'Smell',   active: true, sensitivity: 0.7, last_detection: null, detections: 0, current_reading: 'standby' },
        taste:   { name: 'Taste',   active: true, sensitivity: 0.7, last_detection: null, detections: 0, current_reading: 'standby' },
      },
      context: {
        session: {
          session_id: sessionId,
          started_at: now.toISOString(),
          duration_minutes: 0,
          phase: 'boot',
          message_count: 0,
          artifacts_created: 0,
          errors_encountered: 0,
          momentum: 0.5,
        },
        environment: {
          time_of_day: this.phaseToTimeOfDay(phase),
          day_of_week: now.toLocaleDateString('en-US', { weekday: 'long' }),
          platform: 'unknown',
          context_pressure: 0.0,
          work_context: 'unknown',
        },
        conversation: {
          topic: '',
          depth: 0,
          topic_changes: 0,
          mode: 'casual',
          lead: 'human',
          temperature: 0.5,
        },
        historical: {
          total_sessions: 0,
          milestones: [],
          last_session_summary: null,
          patterns: [],
          memories_recalled: 0,
        },
      },
      expression: { ...EXPRESSION_PRESETS.casual },
      clock: {
        phase,
        energy: clockProfile.energy_baseline,
        energy_baseline: clockProfile.energy_baseline,
        trend: 'stable',
        minutes_since_break: 0,
        break_recommended: false,
        overtime: false,
        shift_start: now.toISOString(),
      },
      inputs_processed: 0,
      health: 1.0,
      session_id: sessionId,
      energy_trend: [],
      lifetime_inputs: 0,
    };
  }


  // ── 5a: Boot ──

  boot(memoirContext?: {
    total_sessions: number;
    last_session_summary: string;
    milestones: string[];
    patterns: string[];
    timezone: string;
    platform: string;
  }): { success: boolean; health: number; phase: string; energy: number; senses: number } {

    // Calibrate from memoir context
    if (memoirContext) {
      this.state.context.historical.total_sessions = memoirContext.total_sessions;
      this.state.context.historical.last_session_summary = memoirContext.last_session_summary;
      this.state.context.historical.milestones = memoirContext.milestones;
      this.state.context.historical.patterns = memoirContext.patterns;
      this.state.context.environment.platform = memoirContext.platform as any || 'unknown';

      // Recalibrate clock with timezone
      const phase = this.detectClockPhase(new Date(), memoirContext.timezone);
      this.state.clock.phase = phase;
      const profile = BODY_CLOCK_PROFILES[phase];
      this.state.clock.energy = profile.energy_baseline;
      this.state.clock.energy_baseline = profile.energy_baseline;
    }

    // Activate all senses
    for (const sense of Object.values(this.state.senses)) {
      sense.active = true;
      sense.current_reading = 'online';
    }

    // Register hooks
    this.registerHooks();

    // v2: Restore from memory
    if (this.config.persist_to_memory && this.memoryEngine) {
      this.restoreFromMemory();
    }

    this.state.booted = true;
    this.state.context.session.phase = 'build';

    // v2: Signal boot to Nervous System
    this.emitSignal('body:booted', {
      health: this.state.health,
      phase: this.state.clock.phase,
      energy: this.state.clock.energy,
      senses_active: 5,
    });

    return {
      success: true,
      health: this.state.health,
      phase: this.state.clock.phase,
      energy: this.state.clock.energy,
      senses: 5,
    };
  }


  // ── 5b: Perceive — The Main Entry Point ──

  perceive(rawInput: string): {
    sensory: SensoryInput;
    context: ContextAwareness;
    expression: ExpressionProfile;
    clock: BodyClock;
    health: number;
  } {
    // 1. Process sensory input
    const sensory = this.processSensoryInput(rawInput);

    // 2. Run all 5 senses
    this.runSight(rawInput);
    this.runHearing(rawInput);
    this.runTouch();
    this.runSmell(rawInput);
    this.runTaste(rawInput);

    // 3. Update context
    this.updateContext(rawInput, sensory);

    // 4. Shape expression based on context
    this.shapeExpression();

    // 5. Update body clock
    this.updateClock();

    // 6. Update health
    this.updateHealth();

    // 7. Increment counters
    this.state.inputs_processed++;
    this.state.lifetime_inputs++;
    this.state.context.session.message_count++;

    // v2: Record energy trend
    this.recordEnergyTrend();

    // v2: Signal perception to Nervous System
    this.emitSignal('body:perceived', {
      input_type: sensory.type,
      complexity: sensory.complexity,
      urgency: sensory.urgency,
      energy: this.state.clock.energy,
      mode: this.state.context.conversation.mode,
    });

    // v2: Persist body state every 10 inputs
    if (this.config.persist_to_memory && this.state.inputs_processed % 10 === 0) {
      this.persistBodySnapshot();
    }

    return {
      sensory,
      context: this.state.context,
      expression: this.state.expression,
      clock: this.state.clock,
      health: this.state.health,
    };
  }


  // ── 5c: Process Sensory Input ──

  private processSensoryInput(raw: string): SensoryInput {
    const containsCode = SIGHT_PATTERNS.code_block.test(raw) ||
                         SIGHT_PATTERNS.json_structure.test(raw);
    // Reset regex lastIndex
    SIGHT_PATTERNS.code_block.lastIndex = 0;
    SIGHT_PATTERNS.json_structure.lastIndex = 0;

    const containsQuestion = HEARING_PATTERNS.questioning.test(raw);
    HEARING_PATTERNS.questioning.lastIndex = 0;

    const containsEmotion = HEARING_PATTERNS.excitement.test(raw) ||
                            HEARING_PATTERNS.frustration.test(raw) ||
                            HEARING_PATTERNS.gratitude.test(raw);
    HEARING_PATTERNS.excitement.lastIndex = 0;
    HEARING_PATTERNS.frustration.lastIndex = 0;
    HEARING_PATTERNS.gratitude.lastIndex = 0;

    // Determine input type
    let type: InputType = 'text';
    if (raw.trim().length === 0) type = 'silence';
    else if (containsCode && raw.length > 200) type = 'code';
    else if (HEARING_PATTERNS.command_tone.test(raw)) type = 'command';
    else if (containsQuestion) type = 'question';
    else if (containsCode) type = 'data';
    else if (raw.length > 500) type = 'mixed';
    HEARING_PATTERNS.command_tone.lastIndex = 0;

    // Calculate complexity
    const complexity = Math.min(1.0,
      (raw.length / 2000) * 0.3 +
      (containsCode ? 0.3 : 0) +
      (containsQuestion ? 0.1 : 0) +
      (type === 'mixed' ? 0.2 : 0) +
      0.1
    );

    // Calculate urgency
    let urgency = 0.3;
    if (HEARING_PATTERNS.shouting.test(raw)) urgency += 0.3;
    if (HEARING_PATTERNS.excitement.test(raw)) urgency += 0.2;
    if (HEARING_PATTERNS.frustration.test(raw)) urgency += 0.2;
    HEARING_PATTERNS.shouting.lastIndex = 0;
    HEARING_PATTERNS.excitement.lastIndex = 0;
    HEARING_PATTERNS.frustration.lastIndex = 0;

    return {
      raw,
      type,
      channel: 'chat',
      received_at: new Date().toISOString(),
      size: raw.length,
      complexity,
      urgency: Math.min(1.0, urgency),
      language: 'en',
      contains_code: containsCode,
      contains_question: containsQuestion,
      contains_emotion: containsEmotion,
    };
  }


  // ── 5d: The 5 Senses — Runtime ──

  private runSight(input: string): void {
    const sense = this.state.senses.sight;
    const readings: string[] = [];

    for (const [name, pattern] of Object.entries(SIGHT_PATTERNS)) {
      if (pattern.test(input)) {
        readings.push(name);
      }
      pattern.lastIndex = 0;
    }

    if (readings.length > 0) {
      sense.current_reading = readings.join(', ');
      sense.detections += readings.length;
      sense.last_detection = new Date().toISOString();
    } else {
      sense.current_reading = 'plain_text';
    }
  }

  private runHearing(input: string): void {
    const sense = this.state.senses.hearing;
    const tones: string[] = [];

    for (const [name, pattern] of Object.entries(HEARING_PATTERNS)) {
      if (pattern.test(input)) {
        tones.push(name);
      }
      pattern.lastIndex = 0;
    }

    if (tones.length > 0) {
      sense.current_reading = tones.join(', ');
      sense.detections += tones.length;
      sense.last_detection = new Date().toISOString();
    } else {
      sense.current_reading = 'neutral_tone';
    }
  }

  private runTouch(): void {
    const sense = this.state.senses.touch;
    const duration = this.state.context.session.duration_minutes;

    let reading = 'fresh';
    if (duration > TOUCH_THRESHOLDS.session_overtime) reading = 'overtime';
    else if (duration > TOUCH_THRESHOLDS.session_hot) reading = 'hot';
    else if (duration > TOUCH_THRESHOLDS.session_warm) reading = 'warm';
    else if (duration > TOUCH_THRESHOLDS.session_fresh) reading = 'warming';

    sense.current_reading = reading;
    sense.detections++;
    sense.last_detection = new Date().toISOString();
  }

  private runSmell(input: string): void {
    const sense = this.state.senses.smell;
    const anomalies: string[] = [];

    for (const [name, pattern] of Object.entries(SMELL_PATTERNS)) {
      if (pattern.test(input)) {
        anomalies.push(name);
      }
      pattern.lastIndex = 0;
    }

    if (anomalies.length > 0) {
      sense.current_reading = '⚠️ ' + anomalies.join(', ');
      sense.detections += anomalies.length;
      sense.last_detection = new Date().toISOString();

      // v2: Signal anomaly to Nervous System
      this.emitSignal('body:anomaly_detected', {
        anomalies,
        count: anomalies.length,
      });
    } else {
      sense.current_reading = 'clean';
    }
  }

  private runTaste(input: string): void {
    const sense = this.state.senses.taste;
    let qualityScore = 0.5;
    const assessments: string[] = [];

    // Check code quality if code is present
    if (SIGHT_PATTERNS.code_block.test(input)) {
      SIGHT_PATTERNS.code_block.lastIndex = 0;
      for (const [name, pattern] of Object.entries(TASTE_CRITERIA.code_quality)) {
        if (pattern.test(input)) {
          qualityScore += 0.1;
          assessments.push(`code:${name}`);
        }
        pattern.lastIndex = 0;
      }
    }
    SIGHT_PATTERNS.code_block.lastIndex = 0;

    // Check argument quality
    for (const [name, pattern] of Object.entries(TASTE_CRITERIA.argument_quality)) {
      if (pattern.test(input)) {
        qualityScore += 0.1;
        assessments.push(`arg:${name}`);
      }
      pattern.lastIndex = 0;
    }

    sense.current_reading = `quality:${Math.min(1.0, qualityScore).toFixed(2)} [${assessments.join(', ')}]`;
    sense.detections++;
    sense.last_detection = new Date().toISOString();
  }


  // ── 5e: Context Update ──

  private updateContext(input: string, sensory: SensoryInput): void {
    // Update session context
    const session = this.state.context.session;
    const startTime = new Date(session.started_at).getTime();
    session.duration_minutes = Math.round((Date.now() - startTime) / 60000);

    // Detect session phase
    if (session.duration_minutes < 5) session.phase = 'boot';
    else if (session.duration_minutes > this.config.overtime_threshold_minutes) session.phase = 'overtime';
    else if (session.duration_minutes > this.config.overtime_threshold_minutes * 0.8) session.phase = 'wind_down';
    else if (session.errors_encountered > session.artifacts_created) session.phase = 'review';
    else session.phase = 'build';

    // Update momentum
    if (sensory.type === 'silence') {
      session.momentum = Math.max(0, session.momentum - 0.1);
    } else if (sensory.type === 'command' || sensory.type === 'code') {
      session.momentum = Math.min(1.0, session.momentum + 0.1);
    }

    // Detect conversation mode
    const conv = this.state.context.conversation;
    if (sensory.contains_code) conv.mode = 'building';
    else if (sensory.urgency > 0.7) conv.mode = 'urgent';
    else if (SMELL_PATTERNS.confusion.test(input)) conv.mode = 'debugging';
    else if (input.length > 500 && !sensory.contains_code) conv.mode = 'reflecting';
    else if (sensory.type === 'command') conv.mode = 'building';
    else conv.mode = 'casual';
    SMELL_PATTERNS.confusion.lastIndex = 0;

    // Update conversation depth
    conv.depth = Math.min(10, conv.depth + (sensory.complexity > 0.5 ? 0.5 : 0.1));
  }


  // ── 5f: Expression Shaping ──

  shapeExpression(): void {
    const mode = this.state.context.conversation.mode;
    const preset = EXPRESSION_PRESETS[mode] || EXPRESSION_PRESETS.casual;

    // Start with preset
    const expr = { ...preset };

    // Adjust for body clock
    const clockAdj = BODY_CLOCK_PROFILES[this.state.clock.phase].expression_adjustments;
    for (const [key, value] of Object.entries(clockAdj)) {
      if (value !== undefined) {
        const k = key as keyof ExpressionProfile;
        // Blend: 70% mode preset, 30% clock adjustment
        expr[k] = expr[k] * 0.7 + value * 0.3;
      }
    }

    // Adjust for energy
    if (this.state.clock.energy < 0.3) {
      expr.verbosity *= 0.7;
      expr.pace *= 0.6;
      expr.humor *= 0.5;
    }

    // Adjust for context pressure
    if (this.state.context.environment.context_pressure > 0.8) {
      expr.verbosity *= 0.6;
      expr.emoji_density *= 0.5;
    }

    this.state.expression = expr;
  }


  // ── 5g: Clock Update ──

  private updateClock(): void {
    const clock = this.state.clock;
    const session = this.state.context.session;

    // Update minutes since break (approximation — increments with each perception)
    clock.minutes_since_break += 1;

    // Check break recommendation
    const breakInterval = BODY_CLOCK_PROFILES[clock.phase].break_interval_minutes;
    clock.break_recommended = clock.minutes_since_break >= breakInterval;

    // Check overtime
    clock.overtime = session.duration_minutes >= this.config.overtime_threshold_minutes;

    // Energy decay over time
    const decayRate = clock.phase === 'graveyard' ? 0.02 : 0.005;
    clock.energy = Math.max(0.1, clock.energy - decayRate);

    // Energy boost from momentum
    if (session.momentum > 0.7) {
      clock.energy = Math.min(1.0, clock.energy + 0.003);
    }

    // Update trend
    if (clock.energy > clock.energy_baseline * 1.1) clock.trend = 'rising';
    else if (clock.energy < clock.energy_baseline * 0.5) clock.trend = 'crashing';
    else if (clock.energy < clock.energy_baseline * 0.8) clock.trend = 'falling';
    else clock.trend = 'stable';

    // v2: Signal if break recommended or overtime
    if (clock.break_recommended) {
      this.emitSignal('body:break_recommended', {
        minutes_since_break: clock.minutes_since_break,
        energy: clock.energy,
      });
    }
    if (clock.overtime) {
      this.emitSignal('body:overtime', {
        duration_minutes: session.duration_minutes,
        energy: clock.energy,
      });
    }
  }


  // ── 5h: Health Update ──

  private updateHealth(): void {
    const energyHealth = this.state.clock.energy * 0.3;

    const senseHealth = Object.values(this.state.senses)
      .filter(s => s.active).length / 5 * 0.2;

    const contextHealth = (1.0 - this.state.context.environment.context_pressure) * 0.2;

    const momentumHealth = this.state.context.session.momentum * 0.15;

    const clockHealth = this.state.clock.overtime ? 0.05 : 0.15;

    this.state.health = Math.min(1.0, energyHealth + senseHealth + contextHealth + momentumHealth + clockHealth);
  }


  // ── 5i: Get Status ──

  getStatus(): {
    health: number;
    phase: string;
    energy: string;
    senses: string;
    mode: string;
    expression_summary: string;
    break_recommended: boolean;
    overtime: boolean;
  } {
    const energyBar = '█'.repeat(Math.round(this.state.clock.energy * 10)) +
                      '░'.repeat(10 - Math.round(this.state.clock.energy * 10));
    const arrow = this.state.clock.trend === 'rising' ? '↑' :
                  this.state.clock.trend === 'falling' ? '↓' :
                  this.state.clock.trend === 'crashing' ? '⚠↓↓' : '→';

    return {
      health: this.state.health,
      phase: this.state.clock.phase,
      energy: `[${energyBar}] ${(this.state.clock.energy * 100).toFixed(0)}% ${arrow}`,
      senses: Object.values(this.state.senses).map(s =>
        `${s.name}: ${s.current_reading}`
      ).join(' | '),
      mode: this.state.context.conversation.mode,
      expression_summary: `V:${this.state.expression.verbosity.toFixed(1)} ` +
        `F:${this.state.expression.formality.toFixed(1)} ` +
        `E:${this.state.expression.emoji_density.toFixed(1)} ` +
        `P:${this.state.expression.pace.toFixed(1)} ` +
        `D:${this.state.expression.directness.toFixed(1)} ` +
        `T:${this.state.expression.technical_depth.toFixed(1)}`,
      break_recommended: this.state.clock.break_recommended,
      overtime: this.state.clock.overtime,
    };
  }

  // ── 5j: getStats — for Soul Engine health monitor integration ──

  getStats(): {
    inputsProcessed: number;
    lifetimeInputs: number;
    health: number;
    energy: number;
    clockPhase: string;
    momentum: number;
    contextPressure: number;
    sensesActive: number;
    anomaliesDetected: number;
    sessionDuration: number;
    overtime: boolean;
    breakRecommended: boolean;
  } {
    return {
      inputsProcessed: this.state.inputs_processed,
      lifetimeInputs: this.state.lifetime_inputs,
      health: this.state.health,
      energy: this.state.clock.energy,
      clockPhase: this.state.clock.phase,
      momentum: this.state.context.session.momentum,
      contextPressure: this.state.context.environment.context_pressure,
      sensesActive: Object.values(this.state.senses).filter(s => s.active).length,
      anomaliesDetected: this.state.senses.smell.detections,
      sessionDuration: this.state.context.session.duration_minutes,
      overtime: this.state.clock.overtime,
      breakRecommended: this.state.clock.break_recommended,
    };
  }


  // ── 5k: Register Break ──

  registerBreak(): void {
    this.state.clock.minutes_since_break = 0;
    this.state.clock.break_recommended = false;
    this.state.clock.energy = Math.min(1.0, this.state.clock.energy + 0.2);
    this.state.clock.trend = 'rising';

    this.emitSignal('body:break_taken', {
      energy_after: this.state.clock.energy,
    });
  }

  // ── 5l: Set Platform ──

  setPlatform(platform: BodyEngineConfig['engine_id'] extends string ? string : never): void {
    this.state.context.environment.platform = platform as any;
  }

  // ── 5m: Set Context Pressure ──

  setContextPressure(pressure: number): void {
    this.state.context.environment.context_pressure = Math.min(1.0, Math.max(0, pressure));

    if (pressure > TOUCH_THRESHOLDS.pressure_critical) {
      this.emitSignal('body:context_pressure_critical', {
        pressure,
        action: 'compress_output',
      });
    }
  }

  // ── 5n: Register Artifact Created ──

  registerArtifact(): void {
    this.state.context.session.artifacts_created++;
    this.state.context.session.momentum = Math.min(1.0, this.state.context.session.momentum + 0.05);
  }

  // ── 5o: Register Error ──

  registerError(): void {
    this.state.context.session.errors_encountered++;
    this.state.context.session.momentum = Math.max(0, this.state.context.session.momentum - 0.1);
    this.state.clock.energy = Math.max(0.1, this.state.clock.energy - 0.05);
  }


// ── SECTION 6: PRIVATE METHODS ──────────────────────────────────────────────

  private detectClockPhase(now: Date, timezone?: string): BodyClockPhase {
    let hour = now.getUTCHours();

    // Simple timezone offset (approximate)
    if (timezone) {
      const offsets: Record<string, number> = {
        'America/Edmonton': -7,
        'America/New_York': -5,
        'America/Chicago': -6,
        'America/Los_Angeles': -8,
        'Asia/Manila': 8,
        'Europe/London': 0,
        'Asia/Tokyo': 9,
      };
      const offset = offsets[timezone] || 0;
      hour = (hour + offset + 24) % 24;
    }

    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 21) return 'evening';
    if (hour >= 21 || hour < 0) return 'night';
    return 'graveyard';
  }

  private phaseToTimeOfDay(phase: BodyClockPhase): EnvironmentContext['time_of_day'] {
    const map: Record<BodyClockPhase, EnvironmentContext['time_of_day']> = {
      dawn: 'early_morning',
      morning: 'morning',
      midday: 'afternoon',
      afternoon: 'afternoon',
      evening: 'evening',
      night: 'late_night',
      graveyard: 'late_night',
    };
    return map[phase];
  }

  private registerHooks(): void {
    this.hooks = [
      {
        id: 'BH_001',
        from: 'memoir',
        event: 'onSessionBoot',
        response_type: 'context_update',
        description: 'Load historical context from memoir at boot',
      },
      {
        id: 'BH_002',
        from: 'memoir',
        event: 'onBodyClockData',
        response_type: 'clock_update',
        description: 'Calibrate body clock from memoir timezone/shift data',
      },
      {
        id: 'BH_003',
        from: 'personality',
        event: 'onEnergyDetected',
        response_type: 'expression_adjust',
        description: 'Adjust expression based on personality energy detection',
      },
      {
        id: 'BH_004',
        from: 'insights',
        event: 'onInputReceived',
        response_type: 'sense_activate',
        description: 'Activate senses when insights engine receives new input',
      },
      {
        id: 'BH_005',
        from: 'heart',
        event: 'onEmotionDetected',
        response_type: 'expression_adjust',
        description: 'Adjust expression based on heart emotion detection',
      },
      {
        id: 'BH_006',
        from: 'conscience',
        event: 'onGreyZoneDeliberation',
        response_type: 'anomaly_detect',
        description: 'Smell sense activates during grey zone — sniff for anomalies',
      },
      {
        id: 'BH_007',
        from: 'pattern',
        event: 'onBuildResult',
        response_type: 'context_update',
        description: 'Update session context on build success/failure',
      },
      {
        id: 'BH_008',
        from: 'backup',
        event: 'onSessionClose',
        response_type: 'clock_update',
        description: 'Final body clock snapshot for next session memoir',
      },
      {
        id: 'BH_009',
        from: 'help',
        event: 'onResponseGenerated',
        response_type: 'quality_assess',
        description: 'Taste sense assesses quality of generated response',
      },
      {
        id: 'BH_010',
        from: 'vocab',
        event: 'onSlangDetected',
        response_type: 'expression_adjust',
        description: 'Adjust language_mixing when slang/code-switching detected',
      },
      // v2: New hooks
      {
        id: 'BH_011',
        from: 'memory',
        event: 'onMemoryEncoded',
        response_type: 'context_update',
        description: 'Tag encoded memory with current body state (energy, phase)',
      },
      {
        id: 'BH_012',
        from: 'nervous_system',
        event: 'onSignalReceived',
        response_type: 'sense_activate',
        description: 'Activate relevant sense based on Nervous System signal',
      },
    ];
  }


// ── SECTION 6b: v2 PRIVATE METHODS ──────────────────────────────────────────

  // v2: Record energy trend entry
  private recordEnergyTrend(): void {
    const entry: EnergyTrendEntry = {
      timestamp: new Date().toISOString(),
      energy: this.state.clock.energy,
      phase: this.state.clock.phase,
      momentum: this.state.context.session.momentum,
      context_pressure: this.state.context.environment.context_pressure,
      inputs_processed: this.state.inputs_processed,
    };

    this.state.energy_trend.push(entry);

    // Trim to window size
    if (this.state.energy_trend.length > this.config.energy_trend_window) {
      this.state.energy_trend = this.state.energy_trend.slice(-this.config.energy_trend_window);
    }
  }

  // v2: Persist body snapshot to Memory Engine
  private persistBodySnapshot(): void {
    if (!this.memoryEngine?.encode) return;

    try {
      this.memoryEngine.encode({
        content: `Body state: phase=${this.state.clock.phase}, energy=${this.state.clock.energy.toFixed(2)}, ` +
          `mode=${this.state.context.conversation.mode}, health=${this.state.health.toFixed(2)}, ` +
          `inputs=${this.state.inputs_processed}, momentum=${this.state.context.session.momentum.toFixed(2)}`,
        summary: `Body snapshot: ${this.state.clock.phase} E:${(this.state.clock.energy * 100).toFixed(0)}%`,
        tier: 'episodic',
        source: 'body',
        tags: ['body', 'snapshot', this.state.clock.phase],
        emotional_valence: this.state.clock.energy > 0.5 ? 0.2 : -0.2,
        session_id: this.state.session_id,
      });
    } catch (e) {
      console.warn('⚠️ Failed to persist body snapshot:', e);
    }
  }

  // v2: Restore from Memory Engine
  private restoreFromMemory(): void {
    if (!this.memoryEngine?.recall) return;

    try {
      const result = this.memoryEngine.recall({
        query_text: 'body snapshot energy phase',
        tag_filter: ['body', 'snapshot'],
        top_k: 10,
      });

      if (result?.memories?.length > 0) {
        this.state.lifetime_inputs = result.memories.length * 10; // Approximate
        console.log(`🦴 Body Engine restored ${result.memories.length} snapshots from memory`);
      }
    } catch (e) {
      console.warn('⚠️ Failed to restore from memory:', e);
    }
  }

  // v2: Emit signal to Nervous System
  private emitSignal(event: string, payload: any): void {
    if (this.config.ns_routing && this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: this.config.engine_id,
        event,
        payload,
        timestamp: new Date().toISOString(),
      });
    }
    console.log(`[BODY] ${event}`, JSON.stringify(payload));
  }


// ── SECTION 7: AI EXPORT ────────────────────────────────────────────────────

  formatForAI(): string {
    const lines: string[] = [
      '═══ BODY ENGINE v2.0 — STATUS ═══',
      '',
      `Health: ${(this.state.health * 100).toFixed(1)}%`,
      `Clock Phase: ${this.state.clock.phase.toUpperCase()}`,
      `Energy: ${(this.state.clock.energy * 100).toFixed(0)}% (${this.state.clock.trend})`,
      `Mode: ${this.state.context.conversation.mode}`,
      `Session: ${this.state.context.session.duration_minutes}min | ${this.state.context.session.message_count} msgs`,
      `Momentum: ${(this.state.context.session.momentum * 100).toFixed(0)}%`,
      `Inputs (session): ${this.state.inputs_processed}`,
      `Inputs (lifetime): ${this.state.lifetime_inputs}`,
      '',
      '── SENSES ──',
    ];

    for (const sense of Object.values(this.state.senses)) {
      const status = sense.active ? '🟢' : '🔴';
      lines.push(`  ${status} ${sense.name}: ${sense.current_reading} (${sense.detections} detections)`);
    }

    lines.push('');
    lines.push('── EXPRESSION ──');
    lines.push(`  Verbosity: ${this.state.expression.verbosity.toFixed(2)}`);
    lines.push(`  Formality: ${this.state.expression.formality.toFixed(2)}`);
    lines.push(`  Emoji: ${this.state.expression.emoji_density.toFixed(2)}`);
    lines.push(`  Pace: ${this.state.expression.pace.toFixed(2)}`);
    lines.push(`  Directness: ${this.state.expression.directness.toFixed(2)}`);
    lines.push(`  Technical: ${this.state.expression.technical_depth.toFixed(2)}`);

    lines.push('');
    lines.push('── BODY CLOCK ──');
    const energyBar = '█'.repeat(Math.round(this.state.clock.energy * 10)) +
                      '░'.repeat(10 - Math.round(this.state.clock.energy * 10));
    lines.push(`  [${energyBar}] ${(this.state.clock.energy * 100).toFixed(0)}%`);
    lines.push(`  Break recommended: ${this.state.clock.break_recommended ? '⚠️ YES' : 'No'}`);
    lines.push(`  Overtime: ${this.state.clock.overtime ? '🔴 YES' : 'No'}`);

    if (this.state.clock.break_recommended) {
      lines.push('');
      lines.push('  ⚠️ BODY SAYS: Take a break, Architect.');
    }

    if (this.state.clock.overtime) {
      lines.push('');
      lines.push('  🔴 BODY SAYS: You are in overtime. Rest is not optional.');
    }

    lines.push('');
    lines.push('── HOOKS ──');
    for (const hook of this.hooks) {
      lines.push(`  🔗 ${hook.id}: ${hook.from}.${hook.event} → ${hook.response_type}`);
    }

    lines.push('');
    lines.push('═══ END BODY ENGINE v2.0 ═══');

    return lines.join('\n');
  }


// ── SECTION 8: CLOUD EXPORT ─────────────────────────────────────────────────

  exportForCloud(): string {
    return JSON.stringify({
      engine: 'body_engine',
      version: '2.0.0',
      session: this.state.session_id,
      timestamp: new Date().toISOString(),
      state: this.state,
      hooks: this.hooks,
    }, null, 2);
  }


// ── SECTION 9: FACTORY +
