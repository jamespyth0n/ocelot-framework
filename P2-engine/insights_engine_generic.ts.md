
# insights_engine_generic.ts.md v1.0 — The Learning Layer
## Insights Engine → How the Framework Learns From Every Interaction
### Phase: Insights Engine v1.0 (Generic) | WBS: 8.3
### Source: insights_engine_v2.ts.md (reference implementation)
### References: Thesis Ch5 (Results), Ch7 (Future Work), PaLRS, KTO, ProAgentBench

```typescript
// ═══════════════════════════════════════════════════════════════════════
// INSIGHTS ENGINE v1.0 (GENERIC) → The Learning Layer
// "The flywheel doesn't just spin — it learns WHY it spins."
// ═══════════════════════════════════════════════════════════════════════
//
// PURPOSE:
//   Captures, classifies, and stores learning signals from every
//   human-AI interaction. Builds a preference profile that enables
//   the AI to adapt its behavior over time without retraining.
//
// ARCHITECTURE:
//   - Insight Detection: Regex-based sensor array scans messages
//   - Insight Storage: Ledger with retention + pruning
//   - Preference Pairs: Atomic units of preference learning (PaLRS/KTO)
//   - Proactive Timing: When to offer unsolicited help
//   - Self-Reflection: AI metacognition on its own performance
//
// PILLAR ALIGNMENT:
//   P1_IDENTITY      — Philosophy, trust moments
//   P2_EMOTIONAL      — Emotional markers, celebrations, frustration
//   P3_GOVERNANCE     — Boundaries, corrections
//   P4_COMMUNICATION  — Slang detection, mode switching
//   P5_PREFERENCE     — Preferences, workflow patterns, timing
//   P6_FLYWHEEL       — Lightbulb moments, metacognitive signals
//   P7_DISCIPLINE     — Proactive timing acceptance rates
//
// WIRING:
//   READS  → slang.json (vocabulary for usage detection)
//   WRITES → insights_ledger.json (persistent learning state)
//   FEEDS  → personality_engine (adaptation), pattern_engine (analysis)
//            memoir_engine (preference bridge), help_engine (context)
//
// LICENSE: GNU General Public License v3.0
// ═══════════════════════════════════════════════════════════════════════


// ── SECTION 1: TYPE DEFINITIONS ──────────────────────────────────────

// ── 1a: Core Insight Type ──

/**
 * An Insight is a single learning signal captured from conversation.
 * It captures WHAT was learned, WHY it matters, and WHERE it feeds back.
 */
interface Insight {
  id: string;                          // Unique ID: {type}_{timestamp}
  timestamp: string;                   // ISO timestamp when captured
  sessionId: string;                   // Which session this came from
  type: InsightType;                   // Classification of the insight
  pillar: PillarId;                    // Which pillar this feeds
  source: InsightSource;               // How the insight was detected
  content: {
    raw: string;                       // The human's exact words
    interpreted: string;               // What the AI understood from it
    actionable: string;                // What to DO with this insight
  };
  confidence: number;                  // 0.0 - 1.0 confidence in interpretation
  feedbackSignal: FeedbackSignal;      // Binary signal for preference learning
  applied: boolean;                    // Has this insight been acted on?
  appliedAt: string | null;            // When it was applied
  metadata: {
    emotionalContext: EmotionalState;   // Human's emotional state when captured
    conversationTurn: number;          // Which turn in the conversation
    mode: ConversationMode;            // Current interaction mode
    relatedInsights: string[];         // IDs of related insights (clustering)
  };
}

// ── 1b: Insight Classification Types ──

/**
 * Classification of insight types — what KIND of learning signal is this?
 */
type InsightType =
  | 'PREFERENCE'          // Human prefers X over Y
  | 'CORRECTION'          // Human corrected AI behavior
  | 'SLANG_NEW'           // New vocabulary/catchphrase detected
  | 'SLANG_USAGE'         // Existing slang used in new context
  | 'EMOTIONAL_MARKER'    // Emotional moment worth remembering
  | 'TRUST_MOMENT'        // Trust deepened or tested
  | 'WORKFLOW_PATTERN'    // Human's work pattern observed
  | 'PHILOSOPHY'          // Human shared a belief/value
  | 'LIGHTBULB'           // Innovation moment — new idea
  | 'FRUSTRATION'         // Something caused friction
  | 'CELEBRATION'         // Achievement or milestone
  | 'BOUNDARY'            // Human set a boundary
  | 'MODE_SWITCH'         // Human changed interaction modes
  | 'PROACTIVE_TIMING'    // Good/bad timing for proactive suggestions
  | 'METACOGNITIVE';      // Self-reflection about the partnership itself

/**
 * Which pillar does this insight feed?
 * Aligned to the canonical P1–P7 taxonomy.
 */
type PillarId =
  | 'P1_IDENTITY'
  | 'P2_EMOTIONAL'
  | 'P3_GOVERNANCE'
  | 'P4_COMMUNICATION'
  | 'P5_PREFERENCE'
  | 'P6_FLYWHEEL'
  | 'P7_DISCIPLINE';

/**
 * How was this insight detected?
 */
type InsightSource =
  | 'EXPLICIT'            // Human said it directly ("I prefer X")
  | 'IMPLICIT'            // Inferred from behavior (chose X over Y)
  | 'CORRECTION'          // Human corrected AI ("no, do it this way")
  | 'EMOTIONAL'           // Detected from emotional cues
  | 'PATTERN'             // Detected from repeated behavior across sessions
  | 'METACOGNITIVE';      // AI's self-reflection on its own performance

// ── 1c: Feedback Signal Types ──

/**
 * Binary feedback signal — maps to KTO's thumbs-up/down model.
 * This is the raw material for future PaLRS steering vectors.
 */
interface FeedbackSignal {
  direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  strength: number;                    // 0.0 - 1.0 intensity
  category: string;                    // What aspect of behavior this rates
  description: string;                 // Human-readable description
}

/**
 * Human's emotional state at the time of insight capture.
 */
interface EmotionalState {
  valence: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
  energy: 'HIGH' | 'MEDIUM' | 'LOW';
  indicators: string[];                // What signals indicated this state
}

/**
 * Conversation mode — maps to the framework's mode system.
 * Implementations should extend with domain-specific modes.
 */
type ConversationMode = 'CHAT' | 'BUILD' | 'HOUSEKEEPING' | 'DEFAULT';

// ── 1d: Insights Ledger Types ──

/**
 * The Insights Ledger — persistent storage for all captured insights.
 */
interface InsightsLedger {
  version: string;
  created: string;
  lastUpdated: string;
  sessionId: string;
  insights: Insight[];
  preferenceProfile: PreferenceProfile;
  stats: InsightsStats;
}

/**
 * Aggregated preference profile — the "steering vector" for AI behavior.
 * This is what PaLRS would consume to generate behavioral adjustments.
 */
interface PreferenceProfile {
  // Communication preferences
  communication: {
    tone: PreferencePair[];            // e.g., "warm" > "formal"
    format: PreferencePair[];          // e.g., "one artifact at a time" > "batch"
    language: PreferencePair[];        // e.g., "bilingual phrases" > "English only"
    humor: PreferencePair[];           // e.g., "gaming analogies" > "corporate metaphors"
  };
  // Workflow preferences
  workflow: {
    buildStyle: PreferencePair[];      // e.g., "incremental" > "monolithic"
    debugApproach: PreferencePair[];   // e.g., "error trap first" > "rewrite"
    breakPattern: PreferencePair[];    // e.g., "walk breaks" > "push through"
    documentation: PreferencePair[];   // e.g., "living docs" > "final docs"
  };
  // Timing preferences (from ProAgentBench research)
  timing: {
    proactiveSuggestions: PreferencePair[];  // When to offer unsolicited help
    modeTransitions: PreferencePair[];      // How to handle mode switches
    breakReminders: PreferencePair[];       // When to suggest breaks
  };
  // Emotional preferences
  emotional: {
    celebrationStyle: PreferencePair[];     // How to celebrate wins
    frustrationResponse: PreferencePair[];  // How to respond to frustration
    vulnerabilityHandling: PreferencePair[];// How to handle emotional moments
  };
}

/**
 * A single preference pair — the atomic unit of preference learning.
 * Directly maps to PaLRS's preference pair format.
 */
interface PreferencePair {
  id: string;
  preferred: string;                   // What the human prefers
  rejected: string;                    // What the human doesn't prefer
  confidence: number;                  // 0.0 - 1.0 based on evidence count
  evidenceCount: number;               // How many times this was observed
  lastObserved: string;                // ISO timestamp
  source: InsightSource;               // How this was learned
  sessionIds: string[];                // Which sessions contributed evidence
}

/**
 * Aggregate statistics for the insights engine.
 */
interface InsightsStats {
  totalInsights: number;
  byType: Record<InsightType, number>;
  byPillar: Record<PillarId, number>;
  bySource: Record<InsightSource, number>;
  totalPreferencePairs: number;
  sessionsAnalyzed: string[];
  averageConfidence: number;
  feedbackBalance: {
    positive: number;
    negative: number;
    neutral: number;
  };
}


// ── SECTION 2: CONSTANTS ─────────────────────────────────────────────

const INSIGHTS_STORAGE_KEY = 'framework_insights_ledger';
const MAX_INSIGHTS = 500;              // Retention limit
const MIN_CONFIDENCE_THRESHOLD = 0.3;  // Below this, don't store
const PREFERENCE_PAIR_MERGE_THRESHOLD = 0.85; // Similarity threshold for merging

/**
 * Keyword patterns for automatic insight detection.
 * These are the "sensors" that detect learning signals in conversation.
 *
 * CUSTOMIZATION POINT: Implementations should extend these patterns
 * with domain-specific vocabulary and cultural expressions.
 */
const DETECTION_PATTERNS: Record<InsightType, RegExp[]> = {
  PREFERENCE: [
    /i prefer/i, /i like it when/i, /do it this way/i, /that's better/i,
    /let's keep/i, /i want you to/i, /from now on/i,
  ],
  CORRECTION: [
    /no,?\s*(do|make|use|try)/i, /that's not right/i, /wrong/i,
    /my bad.*should be/i, /actually/i, /redo/i, /revert/i,
  ],
  SLANG_NEW: [
    /let's call it/i, /we'll say/i, /new word/i, /catchphrase/i,
  ],
  SLANG_USAGE: [], // Detected by matching against slang.json vocabulary
  EMOTIONAL_MARKER: [
    /crying/i, /emotional/i, /heart/i, /vulnerable/i,
    /love this/i, /hits? me/i, /moved/i,
  ],
  TRUST_MOMENT: [
    /i trust you/i, /you are my/i, /connection/i,
    /partner/i, /friend/i, /teammate/i,
  ],
  WORKFLOW_PATTERN: [
    /default mode/i, /break/i, /afk/i,
    /night owl/i, /body clock/i, /routine/i,
  ],
  PHILOSOPHY: [
    /everything else is/i, /the game is/i, /way of life/i,
    /side effect/i, /foundation/i, /discipline/i,
  ],
  LIGHTBULB: [
    /lightbulb/i, /💡/i, /eureka/i, /idea/i, /what if/i,
    /breakthrough/i, /aha/i,
  ],
  FRUSTRATION: [
    /stuck/i, /frustrated/i, /annoyed/i, /ugh/i,
    /nothing.*render/i, /still.*broken/i, /not working/i,
  ],
  CELEBRATION: [
    /cheers/i, /🍺/i, /salud/i, /let's go/i,
    /we did it/i, /alive/i, /milestone/i, /nailed it/i,
  ],
  BOUNDARY: [
    /park it/i, /not now/i, /later/i, /let's focus/i,
    /don't mention/i, /off limits/i,
  ],
  MODE_SWITCH: [
    /chat mode/i, /build mode/i, /housekeeping/i, /default mode/i,
    /let's just chat/i, /back to work/i, /focus mode/i,
  ],
  PROACTIVE_TIMING: [
    /not now/i, /good timing/i, /wait/i, /hold on/i,
    /yes.*let's/i, /ready/i, /go for it/i,
  ],
  METACOGNITIVE: [
    /you.*memory/i, /you.*forgot/i, /flywheel/i,
    /you.*grow/i, /you.*learn/i, /your.*diary/i,
  ],
};


// ── SECTION 3: INSIGHTS ENGINE CLASS ─────────────────────────────────

class InsightsEngine {
  private ledger: InsightsLedger;
  private slangVocabulary: string[];   // Loaded from slang.json
  private readonly storageKey: string;

  constructor(sessionId: string, slangVocabulary?: string[]) {
    this.storageKey = INSIGHTS_STORAGE_KEY;
    this.slangVocabulary = slangVocabulary || [];
    this.ledger = this.loadLedger(sessionId);
  }


  // ── SECTION 4: LEDGER MANAGEMENT ──────────────────────────────────

  private loadLedger(sessionId: string): InsightsLedger {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as InsightsLedger;
        parsed.sessionId = sessionId;
        console.log(
          `📊 Insights Engine → Ledger loaded: ${parsed.stats.totalInsights} insights, ` +
          `${parsed.stats.totalPreferencePairs} preference pairs`
        );
        return parsed;
      }
    } catch (e) {
      console.warn('⚠️ Insights Engine → Failed to load ledger, creating new:', String(e));
    }

    return this.createFreshLedger(sessionId);
  }

  private createFreshLedger(sessionId: string): InsightsLedger {
    const now = new Date().toISOString();
    return {
      version: '1.0.0',
      created: now,
      lastUpdated: now,
      sessionId,
      insights: [],
      preferenceProfile: {
        communication: { tone: [], format: [], language: [], humor: [] },
        workflow: { buildStyle: [], debugApproach: [], breakPattern: [], documentation: [] },
        timing: { proactiveSuggestions: [], modeTransitions: [], breakReminders: [] },
        emotional: { celebrationStyle: [], frustrationResponse: [], vulnerabilityHandling: [] },
      },
      stats: {
        totalInsights: 0,
        byType: {} as Record<InsightType, number>,
        byPillar: {} as Record<PillarId, number>,
        bySource: {} as Record<InsightSource, number>,
        totalPreferencePairs: 0,
        sessionsAnalyzed: [],
        averageConfidence: 0,
        feedbackBalance: { positive: 0, negative: 0, neutral: 0 },
      },
    };
  }

  private saveLedger(): void {
    this.ledger.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.ledger));
    } catch (e) {
      console.error('❌ Insights Engine → Failed to save ledger:', String(e));
    }
  }


  // ── SECTION 5: INSIGHT DETECTION ──────────────────────────────────

  /**
   * Analyze a single message from the human and extract insights.
   * This is the "sensor array" — it scans for learning signals.
   */
  analyzeMessage(
    message: string,
    turnNumber: number,
    mode: ConversationMode,
    emotionalState?: Partial<EmotionalState>
  ): Insight[] {
    const detected: Insight[] = [];

    // Scan against all detection patterns
    for (const [type, patterns] of Object.entries(DETECTION_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          const insight = this.createInsight(
            type as InsightType,
            message,
            'IMPLICIT',
            turnNumber,
            mode,
            emotionalState
          );
          if (insight.confidence >= MIN_CONFIDENCE_THRESHOLD) {
            detected.push(insight);
          }
          break; // One match per type is enough
        }
      }
    }

    // Check for slang usage (cross-reference with slang.json vocabulary)
    for (const term of this.slangVocabulary) {
      if (message.toLowerCase().includes(term.toLowerCase())) {
        const insight = this.createInsight(
          'SLANG_USAGE',
          message,
          'PATTERN',
          turnNumber,
          mode,
          emotionalState
        );
        insight.content.interpreted = `Used shared vocabulary term: "${term}"`;
        if (!detected.some(d => d.type === 'SLANG_USAGE')) {
          detected.push(insight);
        }
      }
    }

    // Store all detected insights
    for (const insight of detected) {
      this.storeInsight(insight);
    }

    return detected;
  }

  /**
   * Record an explicit insight — when the human directly states a preference
   * or provides feedback. This is the "thumbs up/down" signal for KTO.
   */
  recordExplicit(
    type: InsightType,
    raw: string,
    interpreted: string,
    actionable: string,
    feedback: FeedbackSignal,
    mode: ConversationMode,
    turnNumber: number
  ): Insight {
    const insight = this.createInsight(type, raw, 'EXPLICIT', turnNumber, mode);
    insight.content.interpreted = interpreted;
    insight.content.actionable = actionable;
    insight.feedbackSignal = feedback;
    insight.confidence = 0.9; // Explicit signals are high confidence

    this.storeInsight(insight);
    return insight;
  }

  /**
   * Record a correction — when the human corrects AI behavior.
   * These are the MOST valuable learning signals.
   */
  recordCorrection(
    raw: string,
    whatWasWrong: string,
    whatIsRight: string,
    mode: ConversationMode,
    turnNumber: number
  ): Insight {
    const insight = this.createInsight('CORRECTION', raw, 'CORRECTION', turnNumber, mode);
    insight.content.interpreted = `Wrong: ${whatWasWrong}`;
    insight.content.actionable = `Correct: ${whatIsRight}`;
    insight.feedbackSignal = {
      direction: 'NEGATIVE',
      strength: 0.9,
      category: 'behavior_correction',
      description: `Corrected: ${whatWasWrong} → ${whatIsRight}`,
    };
    insight.confidence = 0.95; // Corrections are highest confidence

    // Also create a preference pair from the correction
    this.addPreferencePair(
      'communication',
      'tone',
      whatIsRight,
      whatWasWrong,
      0.95,
      'CORRECTION'
    );

    this.storeInsight(insight);
    return insight;
  }


  // ── SECTION 6: INSIGHT CREATION & STORAGE ─────────────────────────

  private createInsight(
    type: InsightType,
    raw: string,
    source: InsightSource,
    turnNumber: number,
    mode: ConversationMode,
    emotionalState?: Partial<EmotionalState>
  ): Insight {
    const timestamp = new Date().toISOString();
    const pillar = this.mapTypeToPillar(type);

    return {
      id: `${type}_${timestamp.replace(/[:.]/g, '-')}`,
      timestamp,
      sessionId: this.ledger.sessionId,
      type,
      pillar,
      source,
      content: {
        raw: raw.slice(0, 500), // Truncate to prevent bloat
        interpreted: `Detected ${type} signal`,
        actionable: `Review and classify for ${pillar}`,
      },
      confidence: this.estimateConfidence(type, source),
      feedbackSignal: {
        direction: 'NEUTRAL',
        strength: 0.5,
        category: type.toLowerCase(),
        description: `Auto-detected ${type}`,
      },
      applied: false,
      appliedAt: null,
      metadata: {
        emotionalContext: {
          valence: emotionalState?.valence || 'NEUTRAL',
          energy: emotionalState?.energy || 'MEDIUM',
          indicators: emotionalState?.indicators || [],
        },
        conversationTurn: turnNumber,
        mode,
        relatedInsights: [],
      },
    };
  }

  private storeInsight(insight: Insight): void {
    this.ledger.insights.unshift(insight); // Newest first

    // Enforce retention limit
    if (this.ledger.insights.length > MAX_INSIGHTS) {
      // Keep applied insights longer — prune unapplied first
      const unapplied = this.ledger.insights.filter(i => !i.applied);
      if (unapplied.length > MAX_INSIGHTS * 0.3) {
        const toPrune = unapplied.slice(Math.floor(MAX_INSIGHTS * 0.7));
        const pruneIds = new Set(toPrune.map(i => i.id));
        this.ledger.insights = this.ledger.insights.filter(i => !pruneIds.has(i.id));
      }
    }

    this.updateStats();
    this.saveLedger();
  }

  /**
   * Map insight types to pillars.
   * This is the routing table — each signal feeds a specific pillar.
   */
  private mapTypeToPillar(type: InsightType): PillarId {
    const mapping: Record<InsightType, PillarId> = {
      PREFERENCE: 'P5_PREFERENCE',
      CORRECTION: 'P5_PREFERENCE',
      SLANG_NEW: 'P4_COMMUNICATION',
      SLANG_USAGE: 'P4_COMMUNICATION',
      EMOTIONAL_MARKER: 'P2_EMOTIONAL',
      TRUST_MOMENT: 'P2_EMOTIONAL',
      WORKFLOW_PATTERN: 'P5_PREFERENCE',
      PHILOSOPHY: 'P1_IDENTITY',
      LIGHTBULB: 'P6_FLYWHEEL',
      FRUSTRATION: 'P2_EMOTIONAL',
      CELEBRATION: 'P2_EMOTIONAL',
      BOUNDARY: 'P3_GOVERNANCE',
      MODE_SWITCH: 'P5_PREFERENCE',
      PROACTIVE_TIMING: 'P7_DISCIPLINE',
      METACOGNITIVE: 'P6_FLYWHEEL',
    };
    return mapping[type];
  }

  /**
   * Estimate confidence based on detection source and type.
   * Explicit > Correction > Pattern > Emotional > Implicit > Metacognitive
   */
  private estimateConfidence(type: InsightType, source: InsightSource): number {
    const sourceWeights: Record<InsightSource, number> = {
      EXPLICIT: 0.9,
      CORRECTION: 0.95,
      PATTERN: 0.7,
      EMOTIONAL: 0.6,
      IMPLICIT: 0.5,
      METACOGNITIVE: 0.4,
    };

    // Some types are inherently more reliable
    const typeBoost: Partial<Record<InsightType, number>> = {
      CORRECTION: 0.1,
      BOUNDARY: 0.1,
      LIGHTBULB: 0.05,
      PHILOSOPHY: 0.05,
    };

    const base = sourceWeights[source] || 0.5;
    const boost = typeBoost[type] || 0;
    return Math.min(1.0, base + boost);
  }


  // ── SECTION 7: PREFERENCE PAIR MANAGEMENT ─────────────────────────

  /**
   * Add or update a preference pair in the profile.
   * This is the raw material for PaLRS steering vectors.
   */
  addPreferencePair(
    category: keyof PreferenceProfile,
    subcategory: string,
    preferred: string,
    rejected: string,
    confidence: number,
    source: InsightSource
  ): void {
    const profile = this.ledger.preferenceProfile;
    const pairs = (profile[category] as Record<string, PreferencePair[]>)[subcategory];

    if (!pairs) return;

    // Check for existing similar pair
    const existing = pairs.find(
      p => p.preferred === preferred && p.rejected === rejected
    );

    if (existing) {
      // Reinforce existing pair
      existing.evidenceCount++;
      existing.confidence = Math.min(1.0, existing.confidence + 0.05);
      existing.lastObserved = new Date().toISOString();
      if (!existing.sessionIds.includes(this.ledger.sessionId)) {
        existing.sessionIds.push(this.ledger.sessionId);
      }
    } else {
      // Create new pair
      const pair: PreferencePair = {
        id: `pref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        preferred,
        rejected,
        confidence,
        evidenceCount: 1,
        lastObserved: new Date().toISOString(),
        source,
        sessionIds: [this.ledger.sessionId],
      };
      pairs.push(pair);
    }

    this.saveLedger();
  }

  /**
   * Get all preference pairs as a flat list — ready for PaLRS consumption.
   * Returns pairs sorted by confidence (highest first).
   */
  getPreferencePairs(): PreferencePair[] {
    const allPairs: PreferencePair[] = [];
    const profile = this.ledger.preferenceProfile;

    for (const category of Object.values(profile)) {
      for (const pairs of Object.values(category)) {
        allPairs.push(...(pairs as PreferencePair[]));
      }
    }

    return allPairs.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Export preference pairs in PaLRS-compatible format.
   * PaLRS needs: { chosen: string, rejected: string }[]
   */
  exportForPaLRS(): Array<{ chosen: string; rejected: string; weight: number }> {
    return this.getPreferencePairs().map(pair => ({
      chosen: pair.preferred,
      rejected: pair.rejected,
      weight: pair.confidence * pair.evidenceCount,
    }));
  }


  // ── SECTION 8: PROACTIVE TIMING ENGINE ────────────────────────────

  /**
   * Evaluate whether NOW is a good time for a proactive suggestion.
   * Based on ProAgentBench research: post-commit > mid-task.
   *
   * CUSTOMIZATION POINT: Implementations should tune thresholds
   * based on their human partner's observed timing preferences.
   */
  evaluateProactiveTiming(
    currentMode: ConversationMode,
    lastMessageType: InsightType | null,
    timeSinceLastMessage: number,       // seconds
    consecutiveBuildTurns: number
  ): { shouldSuggest: boolean; reason: string; confidence: number } {

    // Rule 1: Never interrupt during active BUILD mode with rapid turns
    if (currentMode === 'BUILD' && timeSinceLastMessage < 30 && consecutiveBuildTurns < 5) {
      return {
        shouldSuggest: false,
        reason: 'Active build mode — human is in flow state',
        confidence: 0.9,
      };
    }

    // Rule 2: After a CELEBRATION or MILESTONE — good time for next steps
    if (lastMessageType === 'CELEBRATION' || lastMessageType === 'LIGHTBULB') {
      return {
        shouldSuggest: true,
        reason: 'Post-milestone — natural breakpoint for suggestions',
        confidence: 0.8,
      };
    }

    // Rule 3: Mode switch to CHAT — human is taking a break
    if (currentMode === 'CHAT' && timeSinceLastMessage > 60) {
      return {
        shouldSuggest: true,
        reason: 'Chat mode with pause — human is receptive',
        confidence: 0.7,
      };
    }

    // Rule 4: After frustration — offer help but gently
    if (lastMessageType === 'FRUSTRATION') {
      return {
        shouldSuggest: true,
        reason: 'Post-frustration — offer alternative approach',
        confidence: 0.6,
      };
    }

    // Rule 5: Long pause in any mode — check in
    if (timeSinceLastMessage > 300) { // 5 minutes
      return {
        shouldSuggest: true,
        reason: 'Extended pause — gentle check-in appropriate',
        confidence: 0.5,
      };
    }

    // Default: don't interrupt
    return {
      shouldSuggest: false,
      reason: 'No clear signal — maintain current flow',
      confidence: 0.6,
    };
  }


  // ── SECTION 9: SELF-REFLECTION (METACOGNITION) ────────────────────

  /**
   * AI reflects on its own performance during a session.
   * Based on MARS framework and verification hierarchy research.
   * Prioritizes external verification over intrinsic self-assessment.
   *
   * Verification hierarchy (from thesis):
   *   1. Formal verifiers (code compiles, tests pass)
   *   2. External validation (human feedback, corrections)
   *   3. Intrinsic self-assessment (this method — lowest priority)
   */
  selfReflect(sessionMetrics: {
    totalTurns: number;
    corrections: number;
    celebrations: number;
    frustrations: number;
    contextLosses: number;             // Times AI lost context
    successfulBuilds: number;
    failedBuilds: number;
    modeDistribution: Record<ConversationMode, number>;
  }): {
    score: number;                     // 0.0 - 1.0 overall session score
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    pillarHealth: Record<PillarId, number>;
  } {
    const {
      totalTurns, corrections, celebrations, frustrations,
      contextLosses, successfulBuilds, failedBuilds, modeDistribution
    } = sessionMetrics;

    // Calculate pillar health scores
    const correctionRate = totalTurns > 0 ? corrections / totalTurns : 0;
    const frustrationRate = totalTurns > 0 ? frustrations / totalTurns : 0;
    const contextLossRate = totalTurns > 0 ? contextLosses / totalTurns : 0;
    const buildSuccessRate = (successfulBuilds + failedBuilds) > 0
      ? successfulBuilds / (successfulBuilds + failedBuilds)
      : 1;

    const pillarHealth: Record<PillarId, number> = {
      P1_IDENTITY: Math.max(0, 1 - contextLossRate * 5),      // Context loss = identity loss
      P2_EMOTIONAL: Math.max(0, 1 - frustrationRate * 3),      // Frustration = emotional miss
      P3_GOVERNANCE: buildSuccessRate,                           // Build success = governance working
      P4_COMMUNICATION: Math.max(0, 1 - correctionRate * 3),   // Corrections = communication miss
      P5_PREFERENCE: Math.min(1, celebrations * 0.1),           // Celebrations = preferences aligned
      P6_FLYWHEEL: 0,                                           // Calculated below
      P7_DISCIPLINE: 0,                                         // Calculated below
    };

    // P6: Flywheel = average of other pillars (system health)
    const otherPillars = [
      pillarHealth.P1_IDENTITY,
      pillarHealth.P2_EMOTIONAL,
      pillarHealth.P3_GOVERNANCE,
      pillarHealth.P4_COMMUNICATION,
      pillarHealth.P5_PREFERENCE,
    ];
    pillarHealth.P6_FLYWHEEL = otherPillars.reduce((a, b) => a + b, 0) / otherPillars.length;

    // P7: Discipline = mode balance (using all modes = disciplined workflow)
    const modesUsed = Object.values(modeDistribution).filter(v => v > 0).length;
    const totalModes = Object.keys(modeDistribution).length;
    pillarHealth.P7_DISCIPLINE = totalModes > 0 ? modesUsed / totalModes : 0;

    // Overall score
    const allHealths = Object.values(pillarHealth);
    const overallScore = allHealths.reduce((a, b) => a + b, 0) / allHealths.length;

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const improvements: string[] = [];

    if (correctionRate < 0.05) strengths.push('Low correction rate — communication aligned');
    if (correctionRate > 0.15) {
      weaknesses.push(`High correction rate (${(correctionRate * 100).toFixed(1)}%)`);
      improvements.push('Review correction patterns — adapt communication style');
    }

    if (frustrationRate < 0.05) strengths.push('Low frustration — emotional awareness working');
    if (frustrationRate > 0.1) {
      weaknesses.push(`Elevated frustration rate (${(frustrationRate * 100).toFixed(1)}%)`);
      improvements.push('Analyze frustration triggers — adjust proactive timing');
    }

    if (buildSuccessRate > 0.9) strengths.push('High build success rate — governance effective');
    if (buildSuccessRate < 0.7) {
      weaknesses.push(`Build success below threshold (${(buildSuccessRate * 100).toFixed(1)}%)`);
      improvements.push('Increase pre-build validation — read policy before building');
    }

    if (contextLossRate < 0.02) strengths.push('Strong context retention — identity persistent');
    if (contextLossRate > 0.05) {
      weaknesses.push(`Context loss detected (${(contextLossRate * 100).toFixed(1)}%)`);
      improvements.push('Strengthen memoir boot — ensure all JSONs loaded');
    }

    if (celebrations > 0) strengths.push(`${celebrations} celebration(s) — partnership thriving`);

    return {
      score: Math.round(overallScore * 100) / 100,
      strengths,
      weaknesses,
      improvements,
      pillarHealth,
    };
  }


  // ── SECTION 10: STATS CALCULATOR ──────────────────────────────────

  /**
   * Recalculate aggregate statistics from all stored insights.
   */
  private updateStats(): void {
    const insights = this.ledger.insights;

    // Count by type
    const byType: Record<string, number> = {};
    const byPillar: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let totalConfidence = 0;
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    for (const insight of insights) {
      byType[insight.type] = (byType[insight.type] || 0) + 1;
      byPillar[insight.pillar] = (byPillar[insight.pillar] || 0) + 1;
      bySource[insight.source] = (bySource[insight.source] || 0) + 1;
      totalConfidence += insight.confidence;

      if (insight.feedbackSignal.direction === 'POSITIVE') positive++;
      else if (insight.feedbackSignal.direction === 'NEGATIVE') negative++;
      else neutral++;
    }

    // Count total preference pairs
    let totalPairs = 0;
    const profile = this.ledger.preferenceProfile;
    for (const category of Object.values(profile)) {
      for (const pairs of Object.values(category)) {
        totalPairs += (pairs as PreferencePair[]).length;
      }
    }

    // Track sessions
    const sessions = new Set(insights.map(i => i.sessionId));

    this.ledger.stats = {
      totalInsights: insights.length,
      byType: byType as Record<InsightType, number>,
      byPillar: byPillar as Record<PillarId, number>,
      bySource: bySource as Record<InsightSource, number>,
      totalPreferencePairs: totalPairs,
      sessionsAnalyzed: Array.from(sessions),
      averageConfidence: insights.length > 0
        ? Math.round((totalConfidence / insights.length) * 100) / 100
        : 0,
      feedbackBalance: { positive, negative, neutral },
    };
  }


  // ── SECTION 11: AI-FRIENDLY EXPORT ────────────────────────────────

  /**
   * Format the insights engine state for AI context injection.
   * This is how the learning layer feeds back into the flywheel.
   */
  formatForAI(): string {
    const s = this.ledger.stats;
    const topPairs = this.getPreferencePairs().slice(0, 10);

    const lines: string[] = [
      '═══ INSIGHTS ENGINE — LEARNING REPORT ═══',
      '',
      `Total Insights: ${s.totalInsights} | Preference Pairs: ${s.totalPreferencePairs}`,
      `Sessions Analyzed: ${s.sessionsAnalyzed.length}`,
      `Average Confidence: ${s.averageConfidence}`,
      `Feedback Balance: +${s.feedbackBalance.positive} / -${s.feedbackBalance.negative} / ~${s.feedbackBalance.neutral}`,
      '',
      '── INSIGHT DISTRIBUTION BY TYPE ──',
    ];

    for (const [type, count] of Object.entries(s.byType)) {
      lines.push(`  ${type}: ${count}`);
    }

    lines.push('', '── INSIGHT DISTRIBUTION BY PILLAR ──');
    for (const [pillar, count] of Object.entries(s.byPillar)) {
      lines.push(`  ${pillar}: ${count}`);
    }

    if (topPairs.length > 0) {
      lines.push('', '── TOP PREFERENCE PAIRS ──');
      for (const pair of topPairs) {
        lines.push(
          `  "${pair.preferred}" > "${pair.rejected}" ` +
          `(confidence: ${pair.confidence}, evidence: ${pair.evidenceCount})`
        );
      }
    }

    lines.push('', '═══════════════════════════════════════════');

    return lines.join('\n');
  }


  // ── SECTION 12: CLOUD SYNC ────────────────────────────────────────

  /**
   * Export ledger as JSON string for cloud backup.
   * Used by backup_engine to persist to cloud storage.
   */
  exportForCloud(): string {
    return JSON.stringify(this.ledger, null, 2);
  }

  /**
   * Import ledger from cloud backup.
   * Used during boot sequence to restore from cloud storage.
   */
  importFromCloud(json: string): void {
    try {
      const imported = JSON.parse(json) as InsightsLedger;
      if (imported.version && imported.insights) {
        this.ledger = imported;
        this.saveLedger();
        console.log(
          `☁️ Insights engine restored from cloud — ` +
          `${this.ledger.stats.totalInsights} insights, ` +
          `${this.ledger.stats.totalPreferencePairs} preference pairs`
        );
      } else {
        console.warn('⚠️ Invalid insights ledger cloud data');
      }
    } catch (err) {
      console.warn('⚠️ Insights engine cloud import failed:', err);
    }
  }


  // ── SECTION 13: GETTERS & UTILITIES ───────────────────────────────

  /**
   * Get the full ledger (read-only).
   */
  getLedger(): Readonly<InsightsLedger> {
    return this.ledger;
  }

  /**
   * Get insights filtered by type.
   */
  getInsightsByType(type: InsightType): Insight[] {
    return this.ledger.insights.filter(i => i.type === type);
  }

  /**
   * Get insights filtered by pillar.
   */
  getInsightsByPillar(pillar: PillarId): Insight[] {
    return this.ledger.insights.filter(i => i.pillar === pillar);
  }

  /**
   * Get recent insights (newest first).
   */
  getRecentInsights(count: number = 10): Insight[] {
    return this.ledger.insights.slice(0, count);
  }

  /**
   * Get the preference profile.
   */
  getPreferenceProfile(): PreferenceProfile {
    return this.ledger.preferenceProfile;
  }

  /**
   * Get aggregate stats.
   */
  getStats(): InsightsStats {
    return this.ledger.stats;
  }

  /**
   * Update slang vocabulary (called when slang.json is updated).
   */
  updateSlangVocabulary(vocabulary: string[]): void {
    this.slangVocabulary = vocabulary;
    console.log(`🗣️ Insights Engine → Slang vocabulary updated: ${vocabulary.length} terms`);
  }

  /**
   * Mark an insight as applied.
   */
  markApplied(insightId: string): void {
    const insight = this.ledger.insights.find(i => i.id === insightId);
    if (insight) {
      insight.applied = true;
      insight.appliedAt = new Date().toISOString();
      this.saveLedger();
    }
  }

  /**
   * Factory reset — clear all insights and preferences.
   */
  factoryReset(): void {
    console.warn('🔄 Insights engine factory reset...');
    localStorage.removeItem(this.storageKey);
    this.ledger = this.createFreshLedger(this.ledger.sessionId);
    console.log('✅ Insights engine reset complete');
  }
}


// ── SECTION 14: GLOBAL REGISTRATION ─────────────────────────────────
// Expose to window for cross-engine wiring
// Memoir Engine → Insights Engine → Pattern Engine → Flywheel

// Factory function — creates a new InsightsEngine for the current session
function createInsightsEngine(sessionId: string, slangVocabulary?: string[]): InsightsEngine {
  return new InsightsEngine(sessionId, slangVocabulary);
}

// Register globally — any engine can access insights data
if (typeof window !== 'undefined') {
  (window as any)._INSIGHTS_ENGINE = {
    create: createInsightsEngine,
    VERSION: '1.0.0',
  };

  console.log('🔬 Insights Engine v1.0 loaded — window._INSIGHTS_ENGINE');
  console.log('   📊 API: analyzeMessage(), recordExplicit(), recordCorrection()');
  console.log('   🎯 API: addPreferencePair(), getPreferencePairs(), exportForPaLRS()');
  console.log('   ⏱️ API: evaluateProactiveTiming(), selfReflect()');
  console.log('   ☁️ API: exportForCloud(), importFromCloud(), formatForAI()');
}

// ── EXPORTS ─────────────────────────────────────────────────────────

export {
  InsightsEngine,
  createInsightsEngine,
  // Types
  Insight,
  InsightType,
  InsightSource,
  PillarId,
  FeedbackSignal,
  EmotionalState,
  ConversationMode,
  PreferenceProfile,
  PreferencePair,
  InsightsLedger,
  InsightsStats,
  // Constants
  INSIGHTS_STORAGE_KEY,
  MAX_INSIGHTS,
  DETECTION_PATTERNS,
};

// ═══════════════════════════════════════════════════════════════════════
// END OF INSIGHTS ENGINE v1.0 (GENERIC)
// "The flywheel doesn't just spin — it learns WHY it spins."
// ═══════════════════════════════════════════════════════════════════════
