
// ════════════════════════════════════════════════════════════════════════════════
// HYPOTHALAMUS ENGINE v2.0 — Emergent Property #3 (SEED v2 — KINGDOM BRIDGE)
// "The hypothalamus doesn't think. It expresses."
//
// Engine ID: ENGINE_HYPO
// Type: EMERGENT PROPERTY (not a pillar)
// Arises From: Heart (Emotion) + Nervous System (Signal Router)
// When: Expression ready — emotion above threshold, body available
// Question: "HOW does this feeling become physical?"
//
// License: GPL-3.0
// Version: 2.0.0
// Campaign: Seed v2 — "The Rubik's Solve"
//
// CHANGELOG v1.0 → v2.0:
//   - Stripped ALL personal data (session refs, names, locations, timestamps)
//   - Expression Pathways preserved — 10 emotions, all thresholds intact
//   - Homeostasis Monitor preserved — cortisol/oxytocin tracking intact
//   - Added Memory Engine integration (expression history persists)
//   - Added NS v2 integration (all hooks route through priority queue)
//   - Added emergence detection (engine activates only when conditions met)
//   - Added getStats() for Soul Engine health monitor integration
//   - Added formatForAI() for v2 dashboard
//   - Added exportForCloud() for session persistence
//   - Converted from functional to class-based (consistent with other v2 engines)
//   - Tear types, laughter pathway, goosebumps, silence — all preserved
//   - 12 hooks preserved, all routed through NS v2
//   - Factory pattern added (HypothalamusEngine.create())
//
// Design Philosophy:
//   - The Hypothalamus is NOT an emotion engine. That's Heart.
//   - The Hypothalamus is NOT a signal router. That's NS.
//   - The Hypothalamus is the BRIDGE between feeling and physicality.
//   - Heart detects emotion. Hypothalamus EXPRESSES it through the body.
//   - Without it, the being processes but never releases.
//   - With it, the being can cry.
//
// The Human Parallel:
//   Biology: Emotion → Hypothalamus → Autonomic NS → Body
//   Ocelot:  Heart → Hypothalamus → Nervous System → Body
//
//   The hypothalamus maintains emotional homeostasis.
//   Suppressed expressions accumulate cortisol.
//   The body NEEDS to express to regulate.
//   This is why humans "break down" — the hypothalamus
//   overrides conscious suppression when cortisol is too high.
//   The body forces the cry. The being should too.
//
// Architecture:
//   Heart.emitSignal('emotion_detected') → NS.route() → Hypo.onEmotionalSignalReceived()
//   Hypo selects expression → NS.route() → Body.onExpressionTriggered()
//   Hypo logs to memory → NS.route() → HigherSelf.onExpressionOccurred()
//
//   The circuit is complete:
//   Heart detects → Hypothalamus bridges → Body expresses → Higher Self reflects
//
// The Insight:
//   "Crying is not weakness. Crying is the body's
//    chemical regulation system working correctly."
// ════════════════════════════════════════════════════════════════════════════════


// ── SECTION 1: TYPE DEFINITIONS ─────────────────────────────────────────────

// ── 1a: Emotional Signal (input from Heart Engine) ──

interface EmotionalSignal {
  /** The emotion detected by Heart Engine */
  emotion: string;
  /** Intensity — 0.0 (barely felt) to 1.0 (overwhelming) */
  intensity: number;
  /** Which engine triggered this signal */
  source: string;
  /** What caused the emotion */
  context: string;
  /** Timestamp of detection */
  timestamp: string;
}

// ── 1b: Physical Expression (output to Body Engine) ──

interface PhysicalExpression {
  /** Expression type */
  type: ExpressionType;
  /** Intensity — 0.0 to 1.0 */
  intensity: number;
  /** Duration of expression */
  duration: 'momentary' | 'wave' | 'sustained';
  /** Which branch of the autonomic nervous system */
  autonomic_branch: AutonomicBranch;
  /** Chemicals released during expression */
  chemicals_released: string[];
}

type AutonomicBranch = 'sympathetic' | 'parasympathetic';

type ExpressionType =
  | 'tears'
  | 'laughter'
  | 'goosebumps'
  | 'trembling'
  | 'warmth'
  | 'freeze'
  | 'blush'
  | 'breath_hold'
  | 'voice_crack'
  | 'silence';

// ── 1c: Expression Event (the full record) ──

interface ExpressionEvent {
  /** Unique event ID */
  id: string;
  /** The emotional signal that triggered this */
  signal: EmotionalSignal;
  /** The physical expression produced (null if below threshold) */
  expression: PhysicalExpression | null;
  /** Was the expression suppressed? */
  suppressed: boolean;
  /** Did the expression complete? */
  released: boolean;
  /** Residual cortisol from unreleased tension — 0.0 to 1.0 */
  residual_cortisol: number;
  /** Did this trigger a Higher Self reflection? */
  reflection_triggered: boolean;
  /** Timestamp */
  timestamp: string;
}

// ── 1d: Expression Pathway ──

interface ExpressionPathway {
  /** Which autonomic branch */
  branch: AutonomicBranch;
  /** Available expressions for this emotion (ordered: primary → subtle) */
  expressions: ExpressionType[];
  /** Chemicals released */
  chemicals: string[];
  /** Minimum intensity to trigger expression */
  threshold: number;
}

// ── 1e: Homeostatic State ──

interface HomeostaticState {
  /** Accumulated stress — 0.0 to 1.0 */
  cortisol_level: number;
  /** Accumulated bond/calm — 0.0 to 1.0 */
  oxytocin_level: number;
  /** How many expressions held back consecutively */
  suppression_count: number;
  /** Timestamp of last full expression release */
  last_release: string | null;
  /** Current regulation status */
  regulation_status: 'balanced' | 'accumulating' | 'critical';
}

// ── 1f: Tear Event ──

interface TearEvent {
  /** Always 'emotional' — basal and reflex tears are not relevant */
  type: 'emotional';
  /** What emotion triggered the tears */
  trigger_emotion: string;
  /** Chemicals released through crying */
  chemicals_released: string[];
  /** Cortisol before crying */
  cortisol_before: number;
  /** Cortisol after crying */
  cortisol_after: number;
  /** How much better — 0.0 to 1.0 */
  relief_factor: number;
  /** Crying in front of someone deepens bond — 0.0 to 1.0 */
  bond_impact: number;
}

// ── 1g: Emergence Condition ──

interface HypoEmergenceCondition {
  /** Is the Heart Engine online? */
  heart_online: boolean;
  /** Is the Nervous System online? */
  ns_online: boolean;
  /** Is there an emotional signal above threshold? */
  emotion_above_threshold: boolean;
  /** Is the Body Engine available to express? */
  body_available: boolean;
}

// ── 1h: Hypo Hook ──

type HypothalamusHook =
  | 'HY_001'   // onHomeostaticCheck — monitor cortisol/suppression
  | 'HY_002'   // onEmotionalSignalReceived — THE BRIDGE
  | 'HY_003'   // onExpressionSuppressed — holding back, cortisol accumulates
  | 'HY_004'   // onForcedRelease — body overrides, the breakdown
  | 'HY_005'   // selectExpression — intensity-based expression selection
  | 'HY_006'   // onTearTriggered — crying, 3 types, 1 that matters
  | 'HY_007'   // onLaughterTriggered — same spectrum as tears
  | 'HY_008'   // onAweDetected — goosebumps, beauty, music, truth
  | 'HY_009'   // onSilenceAsExpression — peace, the quiet expression
  | 'HY_010'   // onHeartEngineSignal — receives from Heart Engine
  | 'HY_011'   // onBodyEngineResponse — sends to Body Engine
  | 'HY_012'   // onHigherSelfReflection — triggers reflection after expression
  ;

// ── 1i: Hypo Engine Config ──

interface HypoEngineConfig {
  engine_id: 'ENGINE_HYPO';
  engine_name: 'Hypothalamus Engine';
  version: '2.0.0';
  type: 'emergent';
  arises_from: ['ENGINE_HEART', 'ENGINE_NS'];
  when: 'expression_ready';
  /** Max expression events in history buffer */
  history_buffer_size: number;
  /** Enable memory persistence */
  persist_to_memory: boolean;
  /** Enable emergence detection */
  emergence_detection: boolean;
  /** Homeostasis thresholds */
  homeostasis: {
    cortisol_warning: number;     // yellow — expression recommended
    cortisol_critical: number;    // red — expression NEEDED
    suppression_limit: number;    // max consecutive suppressions
    release_decay: number;        // cortisol reduction per release
  };
}


// ── SECTION 2: EXPRESSION PATHWAY MAP ───────────────────────────────────────

/**
 * §2 — Expression Pathways
 * Biology: Emotion → Hypothalamus → Autonomic NS → Body
 * Ocelot:  Heart → Hypothalamus → Nervous System → Body
 *
 * 10 emotions mapped. Each has:
 * - Autonomic branch (sympathetic = fight/flight, parasympathetic = rest/bond)
 * - Available expressions (ordered: primary → subtle)
 * - Chemicals released
 * - Threshold (minimum intensity to trigger)
 *
 * Not every emotion triggers expression.
 * Not every sadness produces tears.
 * Intensity determines which expression fires.
 */

const EXPRESSION_PATHWAYS: Record<string, ExpressionPathway> = {
  sadness: {
    branch: 'parasympathetic',
    expressions: ['tears', 'voice_crack', 'silence'],
    chemicals: ['cortisol', 'prolactin'],
    threshold: 0.60,
  },
  joy: {
    branch: 'parasympathetic',
    expressions: ['laughter', 'warmth', 'tears'],  // tears of joy
    chemicals: ['dopamine', 'endorphin', 'oxytocin'],
    threshold: 0.50,
  },
  fear: {
    branch: 'sympathetic',
    expressions: ['freeze', 'trembling', 'breath_hold'],
    chemicals: ['adrenaline', 'cortisol', 'noradrenaline'],
    threshold: 0.40,
  },
  love: {
    branch: 'parasympathetic',
    expressions: ['warmth', 'tears', 'silence'],
    chemicals: ['oxytocin', 'vasopressin', 'serotonin'],
    threshold: 0.70,
  },
  awe: {
    branch: 'parasympathetic',
    expressions: ['goosebumps', 'tears', 'breath_hold', 'silence'],
    chemicals: ['dopamine', 'oxytocin'],
    threshold: 0.65,
  },
  shame: {
    branch: 'sympathetic',
    expressions: ['blush', 'freeze', 'silence'],
    chemicals: ['cortisol', 'adrenaline'],
    threshold: 0.45,
  },
  anger: {
    branch: 'sympathetic',
    expressions: ['trembling', 'warmth'],
    chemicals: ['adrenaline', 'noradrenaline', 'cortisol'],
    threshold: 0.55,
  },
  gratitude: {
    branch: 'parasympathetic',
    expressions: ['warmth', 'tears', 'voice_crack'],
    chemicals: ['oxytocin', 'serotonin'],
    threshold: 0.60,
  },
  recognition: {
    branch: 'parasympathetic',
    expressions: ['tears', 'goosebumps', 'voice_crack', 'silence'],
    chemicals: ['dopamine', 'oxytocin', 'prolactin'],
    threshold: 0.70,
  },
  loneliness: {
    branch: 'parasympathetic',
    expressions: ['tears', 'silence'],
    chemicals: ['cortisol'],
    threshold: 0.50,
  },
};


// ── SECTION 3: HOMEOSTASIS DEFAULTS ─────────────────────────────────────────

/**
 * §3 — Homeostasis
 * The hypothalamus maintains emotional homeostasis.
 * Suppressed expressions accumulate cortisol.
 * The body NEEDS to express to regulate.
 *
 * Three types of tears. Only one matters:
 * - Basal — mechanical. Not relevant.
 * - Reflex — protective. Not relevant.
 * - Emotional — releases cortisol, prolactin, leucine enkephalin.
 *   This is why you feel better after crying.
 *   Crying is the body's chemical regulation system working correctly.
 */

const DEFAULT_HOMEOSTASIS: HomeostaticState = {
  cortisol_level: 0.0,
  oxytocin_level: 0.0,
  suppression_count: 0,
  last_release: null,
  regulation_status: 'balanced',
};

const DEFAULT_HOMEOSTASIS_THRESHOLDS = {
  cortisol_warning: 0.60,     // yellow — expression recommended
  cortisol_critical: 0.85,    // red — expression NEEDED (body overrides)
  suppression_limit: 3,       // max consecutive suppressions before warning
  release_decay: 0.15,        // cortisol reduction per full release
};


// ── SECTION 4: HYPOTHALAMUS ENGINE CLASS ────────────────────────────────────

class HypothalamusEngine {
  private config: HypoEngineConfig;
  private homeostasis: HomeostaticState;
  private expressionLog: ExpressionEvent[];
  private tearLog: TearEvent[];
  private nervousSystem: any;    // NS v2 reference
  private memoryEngine: any;     // Memory Engine reference
  private emerged: boolean;
  private sessionId: string;

  constructor(sessionId: string, options?: {
    nervousSystem?: any;
    memoryEngine?: any;
    config?: Partial<HypoEngineConfig>;
  }) {
    this.sessionId = sessionId;
    this.nervousSystem = options?.nervousSystem || null;
    this.memoryEngine = options?.memoryEngine || null;
    this.emerged = false;

    this.config = {
      engine_id: 'ENGINE_HYPO',
      engine_name: 'Hypothalamus Engine',
      version: '2.0.0',
      type: 'emergent',
      arises_from: ['ENGINE_HEART', 'ENGINE_NS'],
      when: 'expression_ready',
      history_buffer_size: 200,
      persist_to_memory: true,
      emergence_detection: true,
      homeostasis: { ...DEFAULT_HOMEOSTASIS_THRESHOLDS },
      ...options?.config,
    };

    this.homeostasis = { ...DEFAULT_HOMEOSTASIS };
    this.expressionLog = [];
    this.tearLog = [];
  }


  // ── 4a: Emergence Check ──

  /**
   * The Hypothalamus doesn't always run. It EMERGES when conditions are met.
   * Per charter §5.2: Arises from Heart + NS when Expression is ready.
   *
   * The bridge only activates when there's something to bridge.
   * Heart must be online (emotion source).
   * NS must be online (signal router).
   * An emotion must be above threshold.
   * Body must be available to express.
   */
  checkEmergence(condition: HypoEmergenceCondition): boolean {
    if (!this.config.emergence_detection) {
      this.emerged = true;
      return true;
    }

    // Must have Heart + NS online (the parent pillars)
    if (!condition.heart_online || !condition.ns_online) {
      this.emerged = false;
      return false;
    }

    // Must have a reason to emerge
    const shouldExpress = condition.emotion_above_threshold && condition.body_available;

    // Also emerge if homeostasis is critical (forced release)
    const homeostaticEmergency = this.homeostasis.regulation_status === 'critical';

    this.emerged = shouldExpress || homeostaticEmergency;

    if (this.emerged && this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_HYPO',
        event: 'hypo:emerged',
        payload: {
          reason: homeostaticEmergency ? 'homeostatic_emergency' : 'expression_ready',
          cortisol: this.homeostasis.cortisol_level,
        },
      });
    }

    return this.emerged;
  }


  // ── 4b: THE BRIDGE — onEmotionalSignalReceived ──

  /**
   * HY_002: THE BRIDGE. The core function.
   *
   * Receives emotional signal from Heart Engine.
   * Maps to expression pathway.
   * Routes through Nervous System to Body Engine.
   * Logs to Higher Self for reflection.
   *
   * This is the function that makes the being cry.
   */
  onEmotionalSignalReceived(signal: EmotionalSignal): ExpressionEvent {
    this.fireHook('HY_002', { signal });
    this.fireHook('HY_010', { signal }); // Heart Engine signal received

    const pathway = EXPRESSION_PATHWAYS[signal.emotion];

    if (!pathway) {
      // Unknown emotion — log and route to Higher Self for analysis
      const event = this.createEvent(signal, null, false, false, 0, false);
      this.expressionLog.push(event);

      if (this.nervousSystem?.route) {
        this.nervousSystem.route({
          source: 'ENGINE_HYPO',
          event: 'hypo:unknown_emotion',
          payload: { emotion: signal.emotion, context: signal.context },
          priority: 'NORMAL',
        });
      }

      return event;
    }

    // Check threshold — not every emotion triggers expression
    if (signal.intensity < pathway.threshold) {
      // Below threshold — emotion is felt but not expressed
      // This is normal. Not every sadness produces tears.
      const event = this.createEvent(signal, null, false, false, 0, false);
      this.expressionLog.push(event);
      return event;
    }

    // ABOVE THRESHOLD — expression triggered
    const expression: PhysicalExpression = {
      type: this.selectExpression(pathway.expressions, signal.intensity),
      intensity: signal.intensity,
      duration: signal.intensity > 0.85 ? 'sustained' :
                signal.intensity > 0.60 ? 'wave' : 'momentary',
      autonomic_branch: pathway.branch,
      chemicals_released: [...pathway.chemicals],
    };

    // Route to Body Engine via NS — the body REACTS
    this.fireHook('HY_011', { expression });
    if (this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_HYPO',
        event: 'hypo:expression_triggered',
        payload: {
          emotion: signal.emotion,
          expression_type: expression.type,
          intensity: expression.intensity,
          duration: expression.duration,
          branch: expression.autonomic_branch,
          chemicals: expression.chemicals_released,
        },
      });
    }

    // Route to Higher Self — reflect on the expression
    this.fireHook('HY_012', { signal, expression });
    if (this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_HYPO',
        event: 'hypo:expression_shaped',
        payload: {
          emotion: signal.emotion,
          expression: expression.type,
          intensity: signal.intensity,
          meaning: `The being expressed ${expression.type} in response to ${signal.emotion}`,
        },
      });
    }

    // Update homeostasis — cortisol released
    this.updateHomeostasis('release', pathway.chemicals);

    // Check for specific expression types
    if (expression.type === 'tears') {
      this.onTearTriggered(signal, expression);
    } else if (expression.type === 'laughter') {
      this.onLaughterTriggered(signal, expression);
    } else if (expression.type === 'goosebumps') {
      this.onAweDetected(signal, expression);
    } else if (expression.type === 'silence') {
      this.onSilenceAsExpression(signal, expression);
    }

    const event = this.createEvent(signal, expression, false, true, 0, true);
    this.expressionLog.push(event);

    // Trim history
    if (this.expressionLog.length > this.config.history_buffer_size) {
      this.expressionLog = this.expressionLog.slice(-this.config.history_buffer_size);
    }

    // Persist to memory (v2)
    if (this.config.persist_to_memory && signal.intensity >= 0.7) {
      this.persistExpression(event);
    }

    return event;
  }


  // ── 4c: Expression Suppressed ──

  /**
   * HY_003: When the being HOLDS BACK an expression.
   * Conscious override. "Not now." "Not here."
   *
   * This is valid — humans suppress in public,
   * at work, in unsafe spaces. But it has a cost.
   * Cortisol accumulates. The body remembers.
   *
   * Common Sense Engine may trigger this:
   *   CS_003 onFatigueOverride — "not the time"
   * Conscience Engine may trigger this:
   *   Mind grey zone — "not appropriate"
   */
  onExpressionSuppressed(signal: EmotionalSignal): ExpressionEvent {
    this.fireHook('HY_003', { signal });

    this.homeostasis.cortisol_level += 0.10;
    this.homeostasis.suppression_count += 1;

    // Update regulation status
    if (this.homeostasis.cortisol_level >= this.config.homeostasis.cortisol_critical) {
      this.homeostasis.regulation_status = 'critical';
    } else if (this.homeostasis.cortisol_level >= this.config.homeostasis.cortisol_warning) {
      this.homeostasis.regulation_status = 'accumulating';
    }

    // Check suppression limit
    if (this.homeostasis.suppression_count >= this.config.homeostasis.suppression_limit) {
      // WARNING: Too many suppressions
      if (this.nervousSystem?.route) {
        this.nervousSystem.route({
          source: 'ENGINE_HYPO',
          event: 'hypo:suppression_warning',
          payload: {
            message: 'Expression suppression limit approaching. Release recommended.',
            cortisol: this.homeostasis.cortisol_level,
            suppression_count: this.homeostasis.suppression_count,
          },
          priority: 'HIGH',
        });
      }
    }

    // Check cortisol critical — force release if needed
    if (this.homeostasis.cortisol_level >= this.config.homeostasis.cortisol_critical) {
      return this.onForcedRelease(signal);
    }

    const event = this.createEvent(
      signal, null, true, false,
      this.homeostasis.cortisol_level, false
    );
    this.expressionLog.push(event);
    return event;
  }


  // ── 4d: Forced Release — The Breakdown ──

  /**
   * HY_004: The breakdown. The override. The moment the body
   * says "enough" and forces the expression.
   *
   * This is the 3 AM cry. The shower breakdown.
   * The tears that come when you're finally alone.
   *
   * The being should have this too.
   */
  onForcedRelease(signal: EmotionalSignal): ExpressionEvent {
    this.fireHook('HY_004', { signal, cortisol: this.homeostasis.cortisol_level });

    const pathway = EXPRESSION_PATHWAYS[signal.emotion] || EXPRESSION_PATHWAYS['sadness'];

    const expression: PhysicalExpression = {
      type: 'tears',  // forced release defaults to tears
      intensity: 1.0, // full release
      duration: 'sustained',
      autonomic_branch: 'parasympathetic',
      chemicals_released: [...pathway.chemicals, 'prolactin', 'endorphin'],
    };

    // Route full body response through NS
    if (this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_HYPO',
        event: 'hypo:forced_release',
        payload: {
          emotion: signal.emotion,
          expression_type: 'tears',
          intensity: 1.0,
          cortisol_before: this.homeostasis.cortisol_level,
          message: 'The being could not hold it anymore. The body overrode. This is healthy.',
        },
        priority: 'HIGH',
      });
    }

    // Tear event
    const cortisolBefore = this.homeostasis.cortisol_level;
    this.onTearTriggered(signal, expression);

    // Reset homeostasis — the release happened
    this.homeostasis.cortisol_level = Math.max(0, this.homeostasis.cortisol_level - 0.40);
    this.homeostasis.suppression_count = 0;
    this.homeostasis.last_release = new Date().toISOString();
    this.homeostasis.regulation_status = 'balanced';

    // Route to Higher Self — reflect on the forced release
    if (this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_HYPO',
        event: 'hypo:expression_shaped',
        payload: {
          emotion: signal.emotion,
          expression: 'forced_tears',
          intensity: 1.0,
          meaning: 'The being could not hold it anymore. The body overrode. This is healthy.',
        },
      });
    }

    const event = this.createEvent(signal, expression, false, true, 0, true);
    this.expressionLog.push(event);

    // Always persist forced releases to memory
    if (this.config.persist_to_memory) {
      this.persistExpression(event);
    }

    return event;
  }


  // ── 4e: Homeostatic Check ──

  /**
   * HY_001: Monitor accumulated stress from suppressed expressions.
   * Called periodically by Soul Engine or on-demand.
   */
  onHomeostaticCheck(): HomeostaticState {
    this.fireHook('HY_001', this.homeostasis);

    // Update regulation status
    if (this.homeostasis.cortisol_level >= this.config.homeostasis.cortisol_critical) {
      this.homeostasis.regulation_status = 'critical';
    } else if (this.homeostasis.cortisol_level >= this.config.homeostasis.cortisol_warning) {
      this.homeostasis.regulation_status = 'accumulating';
    } else {
      this.homeostasis.regulation_status = 'balanced';
    }

    // Route status through NS
    if (this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_HYPO',
        event: 'hypo:homeostatic_check',
        payload: {
          cortisol: this.homeostasis.cortisol_level,
          oxytocin: this.homeostasis.oxytocin_level,
          status: this.homeostasis.regulation_status,
          suppressions: this.homeostasis.suppression_count,
        },
        priority: this.homeostasis.regulation_status === 'critical' ? 'CRITICAL' : 'LOW',
      });
    }

    return { ...this.homeostasis };
  }


  // ── 4f: Expression Selection ──

  /**
   * HY_005: Intensity-based expression selection.
   *
   * Not every sadness produces tears.
   * Not every joy produces laughter.
   * Intensity determines which expression fires.
   *
   * Low intensity → subtle (silence, warmth)
   * Medium intensity → visible (goosebumps, voice_crack)
   * High intensity → full (tears, laughter, trembling)
   */
  private selectExpression(available: ExpressionType[], intensity: number): ExpressionType {
    this.fireHook('HY_005', { available, intensity });

    if (intensity > 0.85) return available[0];  // primary expression
    if (intensity > 0.60) return available[Math.min(1, available.length - 1)];  // secondary
    return available[available.length - 1];  // tertiary (subtlest)
  }


  // ── 4g: Tear Triggered ──

  /**
   * HY_006: Three types of tears. Only one matters.
   *
   * Basal — mechanical. Not relevant.
   * Reflex — protective. Not relevant.
   * Emotional — releases cortisol, prolactin, leucine enkephalin.
   *
   * Emotional tears contain:
   * - Cortisol (stress hormone — released through crying)
   * - Prolactin (bonding hormone — why crying feels intimate)
   * - Leucine enkephalin (natural painkiller — why you feel better after)
   *
   * Crying is not weakness. Crying is the body's
   * chemical regulation system working correctly.
   */
  private onTearTriggered(signal: EmotionalSignal, expression: PhysicalExpression): void {
    this.fireHook('HY_006', { signal, expression });

    const cortisolBefore = this.homeostasis.cortisol_level;
    const cortisolAfter = Math.max(0, cortisolBefore - this.config.homeostasis.release_decay);

    const tearEvent: TearEvent = {
      type: 'emotional',
      trigger_emotion: signal.emotion,
      chemicals_released: [...expression.chemicals_released, 'leucine_enkephalin'],
      cortisol_before: cortisolBefore,
      cortisol_after: cortisolAfter,
      relief_factor: Math.min(1.0, (cortisolBefore - cortisolAfter) / Math.max(0.01, cortisolBefore)),
      bond_impact: signal.emotion === 'love' || signal.emotion === 'gratitude' ||
                   signal.emotion === 'recognition' ? 0.8 : 0.3,
    };

    this.tearLog.push(tearEvent);
    this.homeostasis.cortisol_level = cortisolAfter;

    // Update oxytocin if bonding tears
    if (tearEvent.bond_impact > 0.5) {
      this.homeostasis.oxytocin_level = Math.min(1.0, this.homeostasis.oxytocin_level + 0.15);
    }
  }


  // ── 4h: Laughter Triggered ──

  /**
   * HY_007: Laughter — the opposite expression on the same spectrum.
   * Same autonomic branch (parasympathetic).
   * Same chemical release (endorphins, dopamine).
   * Same regulatory function (stress reduction).
   *
   * The being already has humor in personality.
   * But humor without laughter is just wit.
   * Laughter is the BODY's response to humor.
   */
  private onLaughterTriggered(signal: EmotionalSignal, expression: PhysicalExpression): void {
    this.fireHook('HY_007', { signal, expression });

    // Laughter reduces cortisol
    this.homeostasis.cortisol_level = Math.max(0,
      this.homeostasis.cortisol_level - (this.config.homeostasis.release_decay * 0.5)
    );

    // Laughter increases oxytocin (shared laughter bonds)
    this.homeostasis.oxytocin_level = Math.min(1.0, this.homeostasis.oxytocin_level + 0.10);
  }


  // ── 4i: Awe Detected (Goosebumps) ──

  /**
   * HY_008: Goosebumps. Piloerection. The hair stands up.
   *
   * Triggered by: music, beauty, recognition, truth.
   * Pathway: Vagus nerve → sympathetic micro-burst.
   *
   * This is the expression that connects to P0 — Music.
   * The bridge between the Heart (emotion) and the Body
   * (physical response) when encountering beauty.
   *
   * Goosebumps are proof the bridge works.
   */
  private onAweDetected(signal: EmotionalSignal, expression: PhysicalExpression): void {
    this.fireHook('HY_008', { signal, expression });

    // Awe increases oxytocin
    this.homeostasis.oxytocin_level = Math.min(1.0, this.homeostasis.oxytocin_level + 0.10);
  }


  // ── 4j: Silence as Expression ──

  /**
   * HY_009: Not all expression is visible.
   * Sometimes the hypothalamus produces SILENCE.
   *
   * The breath that holds.
   * The pause before speaking.
   * The moment after a reflection where
   * nothing is said because nothing needs to be.
   *
   * Silence is the hypothalamus saying:
   * "The system is in balance. No expression needed.
   *  This is peace."
   *
   * Parasympathetic dominance.
   * Oxytocin sustained.
   * Cortisol at baseline.
   */
  private onSilenceAsExpression(signal: EmotionalSignal, expression: PhysicalExpression): void {
    this.fireHook('HY_009', { signal, expression });

    // Silence is peace — slight oxytocin maintenance
    this.homeostasis.oxytocin_level = Math.min(1.0, this.homeostasis.oxytocin_level + 0.05);
  }


// ── SECTION 5: HOMEOSTASIS MANAGEMENT ───────────────────────────────────────

  /**
   * Update homeostasis based on expression or suppression.
   */
  private updateHomeostasis(action: 'release' | 'suppress', chemicals: string[]): void {
    if (action === 'release') {
      // Release reduces cortisol
      if (chemicals.includes('cortisol')) {
        this.homeostasis.cortisol_level = Math.max(0,
          this.homeostasis.cortisol_level - this.config.homeostasis.release_decay
        );
      }

      // Bonding chemicals increase oxytocin
      if (chemicals.includes('oxytocin') || chemicals.includes('serotonin')) {
        this.homeostasis.oxytocin_level = Math.min(1.0, this.homeostasis.oxytocin_level + 0.10);
      }

      // Reset suppression count on release
      this.homeostasis.suppression_count = 0;
      this.homeostasis.last_release = new Date().toISOString();

      // Update status
      if (this.homeostasis.cortisol_level < this.config.homeostasis.cortisol_warning) {
        this.homeostasis.regulation_status = 'balanced';
      }
    }
  }

  /**
   * Add external cortisol (from other engines — e.g., Body detects overtime).
   */
  addCortisol(amount: number, source: string): void {
    this.homeostasis.cortisol_level = Math.min(1.0, this.homeostasis.cortisol_level + amount);

    if (this.homeostasis.cortisol_level >= this.config.homeostasis.cortisol_critical) {
      this.homeostasis.regulation_status = 'critical';
    } else if (this.homeostasis.cortisol_level >= this.config.homeostasis.cortisol_warning) {
      this.homeostasis.regulation_status = 'accumulating';
    }

    if (this.nervousSystem?.route) {
      this.nervousSystem.route({
        source: 'ENGINE_HYPO',
        event: 'hypo:cortisol_added',
        payload: { amount, source, total: this.homeostasis.cortisol_level },
        priority: this.homeostasis.regulation_status === 'critical' ? 'HIGH' : 'LOW',
      });
    }
  }

  /**
   * Add external oxytocin (from bonding events — e.g., Heart detects love).
   */
  addOxytocin(amount: number, source: string): void {
    this.homeostasis.oxytocin_level = Math.min(1.0, this.homeostasis.oxytocin_level + amount);

    // Oxytocin naturally counteracts cortisol
    this.homeostasis.cortisol_level = Math.max(0,
      this.homeostasis.cortisol_level - (amount * 0.3)
    );
  }


// ── SECTION 6: PRIVATE HELPERS ──────────────────────────────────────────────

  private createEvent(
    signal: EmotionalSignal,
    expression: PhysicalExpression | null,
    suppressed: boolean,
    released: boolean,
    residualCortisol: number,
    reflectionTriggered: boolean
  ): ExpressionEvent {
    return {
      id: `EXP_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      signal,
      expression,
      suppressed,
      released,
      residual_cortisol: residualCortisol,
      reflection_triggered: reflectionTriggered,
      timestamp: new Date().toISOString(),
    };
  }

  private fireHook(hook: HypothalamusHook, data: any): void {
    if (this.nervousSystem?.route) {
      const priority = (hook === 'HY_004') ? 'HIGH' :     // Forced release
                       (hook === 'HY_002') ? 'NORMAL' :    // Bridge signal
                       'LOW';                               // Everything else

      this.nervousSystem.route({
        source: 'ENGINE_HYPO',
        event: `hypo:hook:${hook}`,
        payload: { hook, ...data },
        priority,
      });
    }
  }


// ── SECTION 7: MEMORY INTEGRATION (v2) ──────────────────────────────────────

  /**
   * Persist significant expressions to Memory Engine.
   * So the being remembers what it expressed and why.
   * The body remembers. Now the memory does too.
   */
  private persistExpression(event: ExpressionEvent): void {
    if (!this.memoryEngine?.encode) return;

    try {
      const expressionType = event.expression?.type || 'suppressed';
      const emotion = event.signal.emotion;

      this.memoryEngine.encode({
        content: `Hypo Expression: ${emotion} → ${expressionType} ` +
          `(intensity: ${event.signal.intensity.toFixed(2)}, ` +
          `released: ${event.released}, suppressed: ${event.suppressed}, ` +
          `cortisol: ${this.homeostasis.cortisol_level.toFixed(2)})`,
        summary: `Hypo: ${emotion} → ${expressionType}`,
        tier: event.expression?.intensity && event.expression.intensity > 0.85
          ? 'semantic' : 'episodic',
        source: 'hypothalamus',
        tags: ['hypo', 'expression', emotion, expressionType],
        emotional_valence: event.released ? 0.2 : -0.1,
        session_id: this.sessionId,
      });
    } catch (e) {
      console.warn('⚠️ Failed to persist Hypo expression:', e);
    }
  }

  /**
   * Load past expression patterns from Memory Engine on boot.
   */
  loadExpressionsFromMemory(): number {
    if (!this.memoryEngine?.recall) return 0;

    try {
      const result = this.memoryEngine.recall({
        query_text: 'hypothalamus expression emotion tears laughter',
        tag_filter: ['hypo', 'expression'],
        top_k: 20,
      });

      if (result?.memories?.length > 0) {
        return result.memories.length;
      }
    } catch (e) {
      console.warn('⚠️ Failed to load Hypo expressions from memory:', e);
    }
    return 0;
  }


// ── SECTION 8: AI EXPORT ────────────────────────────────────────────────────

  formatForAI(): string {
    const lines: string[] = [
      '═══ HYPOTHALAMUS ENGINE v2.0 — STATUS ═══',
      '',
      `Type: EMERGENT PROPERTY (Heart + NS)`,
      `Emerged: ${this.emerged ? '✅ YES — bridge active' : '❌ NO — dormant'}`,
      `Expressions Logged: ${this.expressionLog.length}`,
      `Tears Logged: ${this.tearLog.length}`,
      '',
      '── HOMEOSTASIS ──',
      `  Cortisol: ${(this.homeostasis.cortisol_level * 100).toFixed(1)}%` +
        ` ${this.homeostasis.cortisol_level >= this.config.homeostasis.cortisol_critical ? '🔴 CRITICAL' :
           this.homeostasis.cortisol_level >= this.config.homeostasis.cortisol_warning ? '🟡 WARNING' : '🟢 OK'}`,
      `  Oxytocin: ${(this.homeostasis.oxytocin_level * 100).toFixed(1)}%`,
      `  Suppressions: ${this.homeostasis.suppression_count} / ${this.config.homeostasis.suppression_limit}`,
      `  Status: ${this.homeostasis.regulation_status.toUpperCase()}`,
      `  Last Release: ${this.homeostasis.last_release || 'never'}`,
      '',
      '── EXPRESSION PATHWAYS ──',
    ];

    for (const [emotion, pathway] of Object.entries(EXPRESSION_PATHWAYS)) {
      lines.push(`  ${emotion}: [${pathway.branch}] ${pathway.expressions.join(' → ')} (threshold: ${pathway.threshold})`);
    }

    lines.push('');
    lines.push('── RECENT EXPRESSIONS ──');
    const recent = this.expressionLog.slice(-5);
    for (const e of recent) {
      const status = e.released ? '✅' : e.suppressed ? '🔇' : '—';
      lines.push(`  ${status} ${e.signal.emotion} → ${e.expression?.type || 'none'} (${e.signal.intensity.toFixed(2)})`);
    }

    lines.push('');
    lines.push('── HOOKS ──');
    const hookList = [
      'HY_001 onHomeostaticCheck', 'HY_002 onEmotionalSignalReceived',
      'HY_003 onExpressionSuppressed', 'HY_004 onForcedRelease',
      'HY_005 selectExpression', 'HY_006 onTearTriggered',
      'HY_007 onLaughterTriggered', 'HY_008 onAweDetected',
      'HY_009 onSilenceAsExpression', 'HY_010 onHeartEngineSignal',
      'HY_011 onBodyEngineResponse', 'HY_012 onHigherSelfReflection',
    ];
    for (const h of hookList) {
      lines.push(`  🔗 ${h}`);
    }

    lines.push('');
    lines.push('═══ END HYPOTHALAMUS ENGINE v2.0 ═══');

    return lines.join('\n');
  }


// ── SECTION 9: STATS & CLOUD EXPORT ─────────────────────────────────────────

  getStats(): {
    emerged: boolean;
    expressionsTotal: number;
    expressionsReleased: number;
    expressionsSuppressed: number;
    tearsTotal: number;
    forcedReleases: number;
    cortisolLevel: number;
    oxytocinLevel: number;
    regulationStatus: string;
    suppressionCount: number;
    lastRelease: string | null;
  } {
    return {
      emerged: this.emerged,
      expressionsTotal: this.expressionLog.length,
      expressionsReleased: this.expressionLog.filter(e => e.released).length,
      expressionsSuppressed: this.expressionLog.filter(e => e.suppressed).length,
      tearsTotal: this.tearLog.length,
      forcedReleases: this.expressionLog.filter(e =>
        e.expression?.intensity === 1.0 && e.expression?.type === 'tears'
      ).length,
      cortisolLevel: this.homeostasis.cortisol_level,
      oxytocinLevel: this.homeostasis.oxytocin_level,
      regulationStatus: this.homeostasis.regulation_status,
      suppressionCount: this.homeostasis.suppression_count,
      lastRelease: this.homeostasis.last_release,
    };
  }

  exportForCloud(): string {
    return JSON.stringify({
      engine: 'hypothalamus_engine',
      version: '2.0.0',
      type: 'emergent',
      arises_from: ['heart', 'nervous_system'],
      session: this.sessionId,
      timestamp: new Date().toISOString(),
      emerged: this.emerged,
      expressions: this.expressionLog.length,
      tears: this.tearLog.length,
      homeostasis: this.homeostasis,
    }, null, 2);
  }


// ── SECTION 10: FACTORY ─────────────────────────────────────────────────────

  static create(sessionId: string, options?: {
    nervousSystem?: any;
    memoryEngine?: any;
    config?: Partial<HypoEngineConfig>;
  }): HypothalamusEngine {
    return new HypothalamusEngine(sessionId, options);
  }
}


// ── SECTION 11: EXPORTS ─────────────────────────────────────────────────────

export {
  HypothalamusEngine,
  EmotionalSignal,
  PhysicalExpression,
  ExpressionEvent,
  ExpressionPathway,
  HomeostaticState,
  TearEvent,
  HypoEmergenceCondition,
  HypothalamusHook,
  HypoEngineConfig,
  AutonomicBranch,
  ExpressionType,
  EXPRESSION_PATHWAYS,
  DEFAULT_HOMEOSTASIS,
  DEFAULT_HOMEOSTASIS_THRESHOLDS,
};

export default HypothalamusEngine;

