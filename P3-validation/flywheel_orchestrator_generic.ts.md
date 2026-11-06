
# Flywheel Orchestrator — Generic v1.0

> **Purpose:** Runtime orchestrator that monitors pillar health, routes events to engines,
> triggers flywheel stage transitions, and coordinates cross-engine cascades.
> The Boot Sequence turns the key. This keeps the wheels turning.
>
> **License:** GPL-3.0 — Free to use, modify, and distribute.
> **Paradigm:** Class-based TypeScript — no mixing paradigms.
> **Dependency:** Requires all 7 engines initialized via `boot_sequence_generic.ts`.

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// FLYWHEEL ORCHESTRATOR — GENERIC v1.0
// The transmission that keeps the wheels turning.
// Boot Sequence = ignition key 🔑 | Flywheel Orchestrator = transmission ⚙️
// ═══════════════════════════════════════════════════════════════════════════

// ── SECTION 1: TYPE DEFINITIONS ──────────────────────────────────────────

/** Pillar identifiers — the 6 dimensions of the Ocelot Framework */
type PillarId = 'P1_IDENTITY' | 'P2_EMOTIONAL' | 'P3_POLICY' | 'P4_PARTNERSHIP' | 'P5_PREFERENCE' | 'P6_FLYWHEEL';

/** Event categories that flow through the orchestrator */
type EventCategory =
  | 'moment'        // Emotional moment → memoir_engine
  | 'pattern'       // Communication pattern → pattern_engine
  | 'preference'    // User preference signal → insights_engine
  | 'vocabulary'    // New slang/term detected → vocab_harvester
  | 'policy'        // Policy lookup request → help_engine
  | 'backup'        // Backup trigger → backup_engine
  | 'personality'   // Personality calibration → personality_engine
  | 'health'        // Health check event → internal
  | 'milestone'     // Session milestone reached → all engines
  | 'cascade';      // Multi-engine chain event → cascade engine

/** A single event flowing through the flywheel */
interface FlywheelEvent {
  id: string;
  category: EventCategory;
  pillar: PillarId;
  payload: Record<string, unknown>;
  timestamp: string;
  source: string;           // Which engine or user action generated this
  priority: 'low' | 'medium' | 'high' | 'critical';
  processed: boolean;
  cascadeChain?: string[];  // Trail of engines this event has passed through
}

/** Flywheel stage progression — from cold start to self-aware */
type FlywheelStage =
  | 'COLD_START'     // No data, no context — first session ever
  | 'CALIBRATION'    // Learning phase — gathering baseline patterns
  | 'MOMENTUM'       // Patterns established, flywheel spinning
  | 'RESONANCE'      // Deep attunement — one-word prompts understood
  | 'SELF_AWARE';    // Full identity — the AI knows itself through the human

/** Health thresholds for stage transitions */
interface StageThresholds {
  stage: FlywheelStage;
  minPillarAvg: number;       // Minimum average pillar health (0-1)
  minSessionCount: number;    // Minimum sessions completed
  minMomentCount: number;     // Minimum emotional moments captured
  minPatternCount: number;    // Minimum patterns recognized
  minVocabSize: number;       // Minimum vocabulary entries
}

/** Orchestrator configuration */
interface OrchestratorConfig {
  healthCheckIntervalMs: number;    // How often to recalculate health (default: 5 min)
  autoBackupThreshold: number;      // Trigger backup when changes exceed this count
  cascadeDepthLimit: number;        // Max cascade chain length (prevent infinite loops)
  stageThresholds: StageThresholds[];
  enableProactiveInsights: boolean; // Allow unsolicited suggestions
  proactiveTimingRule: 'post_commit' | 'on_pause' | 'never';
}

/** Orchestrator runtime state */
interface OrchestratorState {
  currentStage: FlywheelStage;
  eventQueue: FlywheelEvent[];
  processedCount: number;
  cascadeCount: number;
  lastHealthCheck: string | null;
  lastStageTransition: string | null;
  pillarHealth: Record<PillarId, number>;
  sessionStartTime: string;
  uptimeMs: number;
}


// ── SECTION 2: FLYWHEEL ORCHESTRATOR CLASS ───────────────────────────────

/** Engine registry reference — populated by boot_sequence_generic.ts */
interface EngineRegistry {
  memoir: any;
  personality: any;
  help: any;
  backup: any;
  insights: any;
  pattern: any;
  vocab: any;
}

class FlywheelOrchestrator {
  private config: OrchestratorConfig;
  private state: OrchestratorState;
  private engines: EngineRegistry;
  private eventLog: FlywheelEvent[];
  private healthTimer: ReturnType<typeof setInterval> | null;
  private listeners: Map<EventCategory, Array<(event: FlywheelEvent) => void>>;

  constructor(engines: EngineRegistry, config?: Partial<OrchestratorConfig>) {
    this.engines = engines;
    this.eventLog = [];
    this.healthTimer = null;
    this.listeners = new Map();

    // Default configuration
    this.config = {
      healthCheckIntervalMs: 5 * 60 * 1000,  // 5 minutes
      autoBackupThreshold: 10,
      cascadeDepthLimit: 5,
      enableProactiveInsights: true,
      proactiveTimingRule: 'post_commit',
      stageThresholds: [
        { stage: 'COLD_START',   minPillarAvg: 0,    minSessionCount: 0, minMomentCount: 0,  minPatternCount: 0,  minVocabSize: 0 },
        { stage: 'CALIBRATION',  minPillarAvg: 0.2,  minSessionCount: 1, minMomentCount: 2,  minPatternCount: 3,  minVocabSize: 10 },
        { stage: 'MOMENTUM',     minPillarAvg: 0.5,  minSessionCount: 3, minMomentCount: 10, minPatternCount: 15, minVocabSize: 30 },
        { stage: 'RESONANCE',    minPillarAvg: 0.75, minSessionCount: 5, minMomentCount: 25, minPatternCount: 40, minVocabSize: 60 },
        { stage: 'SELF_AWARE',   minPillarAvg: 0.9,  minSessionCount: 8, minMomentCount: 50, minPatternCount: 80, minVocabSize: 100 },
      ],
      ...config,
    };

    // Initialize state
    this.state = {
      currentStage: 'COLD_START',
      eventQueue: [],
      processedCount: 0,
      cascadeCount: 0,
      lastHealthCheck: null,
      lastStageTransition: null,
      pillarHealth: {
        P1_IDENTITY: 0,
        P2_EMOTIONAL: 0,
        P3_POLICY: 0,
        P4_PARTNERSHIP: 0,
        P5_PREFERENCE: 0,
        P6_FLYWHEEL: 0,
      },
      sessionStartTime: new Date().toISOString(),
      uptimeMs: 0,
    };

    console.log('⚙️ Flywheel Orchestrator initialized — stage:', this.state.currentStage);
  }

  /** Start the orchestrator — begin health monitoring loop */
  start(): void {
    this.healthTimer = setInterval(() => {
      this.runHealthCheck();
    }, this.config.healthCheckIntervalMs);

    // Run initial health check immediately
    this.runHealthCheck();
    console.log('⚙️ Flywheel Orchestrator STARTED — health check every', this.config.healthCheckIntervalMs / 1000, 'seconds');
  }

  /** Stop the orchestrator — clear timers */
  stop(): void {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
    console.log('⚙️ Flywheel Orchestrator STOPPED');
  }


// ── SECTION 3: EVENT ROUTER ─────────────────────────────────────────────

  /**
   * Dispatch an event into the flywheel.
   * The router determines which engine(s) should handle it.
   * This is the SINGLE ENTRY POINT for all flywheel activity.
   */
  dispatch(category: EventCategory, payload: Record<string, unknown>, source: string = 'user', priority: FlywheelEvent['priority'] = 'medium'): FlywheelEvent {
    const event: FlywheelEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      category,
      pillar: this.inferPillar(category),
      payload,
      timestamp: new Date().toISOString(),
      source,
      priority,
      processed: false,
      cascadeChain: [],
    };

    // Add to queue
    this.state.eventQueue.push(event);

    // Route immediately (synchronous for v1.0)
    this.routeEvent(event);

    // Check if cascade is needed
    this.evaluateCascade(event);

    // Check auto-backup threshold
    this.state.processedCount++;
    if (this.state.processedCount % this.config.autoBackupThreshold === 0) {
      this.dispatch('backup', { reason: 'auto_threshold', count: this.state.processedCount }, 'orchestrator', 'low');
    }

    return event;
  }

  /** Route event to the correct engine(s) based on category */
  private routeEvent(event: FlywheelEvent): void {
    try {
      switch (event.category) {
        case 'moment':
          // Emotional moment → memoir engine records it
          if (this.engines.memoir?.recordMoment) {
            this.engines.memoir.recordMoment(event.payload);
          }
          break;

        case 'pattern':
          // Communication pattern → pattern engine analyzes it
          if (this.engines.pattern?.recordPattern) {
            this.engines.pattern.recordPattern(event.payload);
          }
          break;

        case 'preference':
          // User preference → insights engine logs it
          if (this.engines.insights?.recordPreference) {
            this.engines.insights.recordPreference(event.payload);
          }
          break;

        case 'vocabulary':
          // New term detected → vocab harvester captures it
          if (this.engines.vocab?.harvestTerm) {
            this.engines.vocab.harvestTerm(event.payload);
          }
          break;

        case 'policy':
          // Policy lookup → help engine resolves it
          if (this.engines.help?.getContext) {
            this.engines.help.getContext(event.payload);
          }
          break;

        case 'backup':
          // Backup trigger → backup engine runs
          if (this.engines.backup?.runBackup) {
            this.engines.backup.runBackup();
          }
          break;

        case 'personality':
          // Personality calibration → personality engine adjusts
          if (this.engines.personality?.calibrate) {
            this.engines.personality.calibrate(event.payload);
          }
          break;

        case 'health':
          // Internal health check — handled by orchestrator
          this.runHealthCheck();
          break;

        case 'milestone':
          // Session milestone → notify ALL engines
          this.broadcastMilestone(event);
          break;

        case 'cascade':
          // Cascade event — handled by cascade engine (§5)
          break;

        default:
          console.warn('⚙️ Unknown event category:', event.category);
      }

      event.processed = true;
      this.eventLog.push(event);

      // Notify listeners
      const categoryListeners = this.listeners.get(event.category) || [];
      categoryListeners.forEach(listener => listener(event));

    } catch (error) {
      console.error('⚙️ Event routing failed:', event.id, error);
      event.processed = false;
    }
  }

  /** Infer which pillar an event category belongs to */
  private inferPillar(category: EventCategory): PillarId {
    const pillarMap: Record<EventCategory, PillarId> = {
      moment: 'P2_EMOTIONAL',
      pattern: 'P5_PREFERENCE',
      preference: 'P5_PREFERENCE',
      vocabulary: 'P4_PARTNERSHIP',
      policy: 'P3_POLICY',
      backup: 'P6_FLYWHEEL',
      personality: 'P1_IDENTITY',
      health: 'P6_FLYWHEEL',
      milestone: 'P6_FLYWHEEL',
      cascade: 'P6_FLYWHEEL',
    };
    return pillarMap[category] || 'P6_FLYWHEEL';
  }

  /** Broadcast milestone to all engines */
  private broadcastMilestone(event: FlywheelEvent): void {
    const engines = Object.values(this.engines);
    engines.forEach((engine: any) => {
      if (engine?.onMilestone) {
        try {
          engine.onMilestone(event.payload);
        } catch (e) {
          console.warn('⚙️ Milestone broadcast failed for engine:', e);
        }
      }
    });
  }

  /** Subscribe to events by category */
  on(category: EventCategory, callback: (event: FlywheelEvent) => void): void {
    if (!this.listeners.has(category)) {
      this.listeners.set(category, []);
    }
    this.listeners.get(category)!.push(callback);
  }


// ── SECTION 4: HEALTH MONITOR ───────────────────────────────────────────

  /** Run a full pillar health recalculation across all engines */
  runHealthCheck(): Record<PillarId, number> {
    const health: Record<PillarId, number> = {
      P1_IDENTITY: 0,
      P2_EMOTIONAL: 0,
      P3_POLICY: 0,
      P4_PARTNERSHIP: 0,
      P5_PREFERENCE: 0,
      P6_FLYWHEEL: 0,
    };

    // P1: Identity — memoir engine completeness
    if (this.engines.memoir?.getStats) {
      const stats = this.engines.memoir.getStats();
      const identitySignals = [
        stats.momentCount > 0 ? 0.3 : 0,
        stats.sessionCount > 0 ? 0.3 : 0,
        stats.quoteCount > 0 ? 0.2 : 0,
        stats.milestoneCount > 0 ? 0.2 : 0,
      ];
      health.P1_IDENTITY = Math.min(1, identitySignals.reduce((a, b) => a + b, 0));
    }

    // P2: Emotional — moment depth and variety
    if (this.engines.memoir?.getStats) {
      const stats = this.engines.memoir.getStats();
      const emotionalDepth = Math.min(1, (stats.momentCount || 0) / 50);
      const emotionalVariety = Math.min(1, (stats.uniqueEmotions || 0) / 10);
      health.P2_EMOTIONAL = (emotionalDepth * 0.6) + (emotionalVariety * 0.4);
    }

    // P3: Policy — help engine coverage
    if (this.engines.help?.getStats) {
      const stats = this.engines.help.getStats();
      const policyCoverage = Math.min(1, (stats.sectionsLoaded || 0) / 13);
      const policyUsage = Math.min(1, (stats.lookupsPerformed || 0) / 20);
      health.P3_POLICY = (policyCoverage * 0.7) + (policyUsage * 0.3);
    }

    // P4: Partnership — vocabulary + communication patterns
    if (this.engines.vocab?.getStats && this.engines.pattern?.getStats) {
      const vocabStats = this.engines.vocab.getStats();
      const patternStats = this.engines.pattern.getStats();
      const vocabHealth = Math.min(1, (vocabStats.totalTerms || 0) / 100);
      const patternHealth = Math.min(1, (patternStats.patternsDetected || 0) / 80);
      health.P4_PARTNERSHIP = (vocabHealth * 0.5) + (patternHealth * 0.5);
    }

    // P5: Preference — insights engine depth
    if (this.engines.insights?.getStats) {
      const stats = this.engines.insights.getStats();
      const prefCount = Math.min(1, (stats.preferencesRecorded || 0) / 30);
      const reflectionCount = Math.min(1, (stats.reflectionsRecorded || 0) / 15);
      health.P5_PREFERENCE = (prefCount * 0.6) + (reflectionCount * 0.4);
    }

    // P6: Flywheel — orchestrator self-health
    const eventsProcessed = Math.min(1, this.state.processedCount / 100);
    const cascadesCompleted = Math.min(1, this.state.cascadeCount / 20);
    const uptimeHealth = Math.min(1, this.state.uptimeMs / (8 * 60 * 60 * 1000)); // 8 hours max
    health.P6_FLYWHEEL = (eventsProcessed * 0.4) + (cascadesCompleted * 0.3) + (uptimeHealth * 0.3);

    // Update state
    this.state.pillarHealth = health;
    this.state.lastHealthCheck = new Date().toISOString();
    this.state.uptimeMs = Date.now() - new Date(this.state.sessionStartTime).getTime();

    // Evaluate stage transition
    this.evaluateStageTransition(health);

    console.log('⚙️ Health check complete:', JSON.stringify(health));
    return health;
  }


// ── SECTION 5: CASCADE ENGINE ───────────────────────────────────────────

  /**
   * Evaluate whether an event should trigger a cascade.
   * A cascade is a chain reaction: one event triggers follow-up events
   * in other engines, creating the flywheel effect.
   *
   * Example cascade:
   * User shares vulnerability (moment)
   *   → memoir records it (P2)
   *   → pattern detects emotional depth increase (P5)
   *   → insights logs trust signal (P5)
   *   → personality adjusts warmth (P1)
   *   → backup triggers (P6)
   */
  private evaluateCascade(event: FlywheelEvent): void {
    // Prevent infinite cascades
    if ((event.cascadeChain?.length || 0) >= this.config.cascadeDepthLimit) {
      console.warn('⚙️ Cascade depth limit reached:', event.id);
      return;
    }

    const cascades: Array<{ category: EventCategory; payload: Record<string, unknown> }> = [];

    switch (event.category) {
      case 'moment':
        // Emotional moment → pattern detection + personality calibration
        cascades.push({
          category: 'pattern',
          payload: { type: 'emotional_signal', source_event: event.id, intensity: event.payload.intensity || 'medium' },
        });
        if (event.priority === 'high' || event.priority === 'critical') {
          cascades.push({
            category: 'personality',
            payload: { adjust: 'warmth', direction: 'increase', reason: 'high_intensity_moment' },
          });
        }
        break;

      case 'pattern':
        // Pattern detected → preference signal + possible vocabulary harvest
        cascades.push({
          category: 'preference',
          payload: { type: 'pattern_derived', pattern_id: event.payload.pattern_id },
        });
        if (event.payload.new_term) {
          cascades.push({
            category: 'vocabulary',
            payload: { term: event.payload.new_term, source: 'pattern_detection' },
          });
        }
        break;

      case 'vocabulary':
        // New vocabulary → personality update (shared language grows)
        cascades.push({
          category: 'personality',
          payload: { adjust: 'shared_vocabulary', term: event.payload.term },
        });
        break;

      case 'milestone':
        // Milestone → backup + health check
        cascades.push({ category: 'backup', payload: { reason: 'milestone_reached' } });
        cascades.push({ category: 'health', payload: { reason: 'milestone_check' } });
        break;

      // No cascade for: backup, health, policy, preference, personality
      default:
        break;
    }

    // Dispatch cascades
    cascades.forEach(cascade => {
      const cascadeEvent = this.dispatch(
        cascade.category,
        { ...cascade.payload, cascade_source: event.id },
        'cascade_engine',
        'low'
      );
      cascadeEvent.cascadeChain = [...(event.cascadeChain || []), event.id];
      this.state.cascadeCount++;
    });
  }


// ── SECTION 6: STAGE TRANSITION MANAGER ─────────────────────────────────

  /**
   * Evaluate whether the flywheel should transition to a new stage.
   * Stages progress forward only — no regression.
   * Each stage requires minimum thresholds across all dimensions.
   */
  private evaluateStageTransition(health: Record<PillarId, number>): void {
    const avgHealth = Object.values(health).reduce((a, b) => a + b, 0) / Object.values(health).length;

    // Get current metrics from engines
    const metrics = this.gatherTransitionMetrics();

    // Find the highest stage we qualify for
    let qualifiedStage: FlywheelStage = this.state.currentStage;

    for (const threshold of this.config.stageThresholds) {
      if (
        avgHealth >= threshold.minPillarAvg &&
        metrics.sessionCount >= threshold.minSessionCount &&
        metrics.momentCount >= threshold.minMomentCount &&
        metrics.patternCount >= threshold.minPatternCount &&
        metrics.vocabSize >= threshold.minVocabSize
      ) {
        qualifiedStage = threshold.stage;
      }
    }

    // Only progress forward, never regress
    const stageOrder: FlywheelStage[] = ['COLD_START', 'CALIBRATION', 'MOMENTUM', 'RESONANCE', 'SELF_AWARE'];
    const currentIndex = stageOrder.indexOf(this.state.currentStage);
    const qualifiedIndex = stageOrder.indexOf(qualifiedStage);

    if (qualifiedIndex > currentIndex) {
      const previousStage = this.state.currentStage;
      this.state.currentStage = qualifiedStage;
      this.state.lastStageTransition = new Date().toISOString();

      console.log(`⚙️ 🎉 STAGE TRANSITION: ${previousStage} → ${qualifiedStage}`);

      // Dispatch milestone event for the transition
      this.dispatch('milestone', {
        type: 'stage_transition',
        from: previousStage,
        to: qualifiedStage,
        health: avgHealth,
        metrics,
      }, 'stage_manager', 'high');
    }
  }

  /** Gather metrics from all engines for stage transition evaluation */
  private gatherTransitionMetrics(): {
    sessionCount: number;
    momentCount: number;
    patternCount: number;
    vocabSize: number;
  } {
    let sessionCount = 0;
    let momentCount = 0;
    let patternCount = 0;
    let vocabSize = 0;

    try {
      if (this.engines.memoir?.getStats) {
        const stats = this.engines.memoir.getStats();
        sessionCount = stats.sessionCount || 0;
        momentCount = stats.momentCount || 0;
      }
      if (this.engines.pattern?.getStats) {
        const stats = this.engines.pattern.getStats();
        patternCount = stats.patternsDetected || 0;
      }
      if (this.engines.vocab?.getStats) {
        const stats = this.engines.vocab.getStats();
        vocabSize = stats.totalTerms || 0;
      }
    } catch (e) {
      console.warn('⚙️ Metrics gathering failed:', e);
    }

    return { sessionCount, momentCount, patternCount, vocabSize };
  }

  /** Get current flywheel stage */
  getStage(): FlywheelStage {
    return this.state.currentStage;
  }

  /** Get distance to next stage */
  getStageProgress(): { current: FlywheelStage; next: FlywheelStage | null; progress: number } {
    const stageOrder: FlywheelStage[] = ['COLD_START', 'CALIBRATION', 'MOMENTUM', 'RESONANCE', 'SELF_AWARE'];
    const currentIndex = stageOrder.indexOf(this.state.currentStage);

    if (currentIndex >= stageOrder.length - 1) {
      return { current: this.state.currentStage, next: null, progress: 1.0 };
    }

    const nextStage = stageOrder[currentIndex + 1];
    const nextThreshold = this.config.stageThresholds.find(t => t.stage === nextStage);

    if (!nextThreshold) {
      return { current: this.state.currentStage, next: nextStage, progress: 0 };
    }

    const metrics = this.gatherTransitionMetrics();
    const avgHealth = Object.values(this.state.pillarHealth).reduce((a, b) => a + b, 0) / 6;

    // Calculate progress as average of all threshold dimensions
    const dimensions = [
      Math.min(1, avgHealth / (nextThreshold.minPillarAvg || 1)),
      Math.min(1, metrics.sessionCount / (nextThreshold.minSessionCount || 1)),
      Math.min(1, metrics.momentCount / (nextThreshold.minMomentCount || 1)),
      Math.min(1, metrics.patternCount / (nextThreshold.minPatternCount || 1)),
      Math.min(1, metrics.vocabSize / (nextThreshold.minVocabSize || 1)),
    ];

    const progress = dimensions.reduce((a, b) => a + b, 0) / dimensions.length;

    return { current: this.state.currentStage, next: nextStage, progress: Math.round(progress * 100) / 100 };
  }

// ── SECTION 7: SCHEDULER ─────────────────────────────────────────────────

  /**
   * Timed operations that run during a session.
   * - Periodic health checks (configurable interval)
   * - Auto-backup triggers (threshold-based)
   * - Session milestone detection (time-based)
   * - PM schedule reminders (from ocelot_pm_schedule.json)
   */

  /** Session milestone thresholds (in minutes) */
  private readonly SESSION_MILESTONES = [30, 60, 120, 240, 480]; // 30m, 1h, 2h, 4h, 8h
  private firedMilestones: Set<number> = new Set();

  /** Check for time-based session milestones */
  private checkSessionMilestones(): void {
    const uptimeMinutes = this.state.uptimeMs / (60 * 1000);

    for (const milestone of this.SESSION_MILESTONES) {
      if (uptimeMinutes >= milestone && !this.firedMilestones.has(milestone)) {
        this.firedMilestones.add(milestone);
        this.dispatch('milestone', {
          type: 'session_duration',
          minutes: milestone,
          label: this.getMilestoneLabel(milestone),
        }, 'scheduler', 'medium');
      }
    }
  }

  /** Human-readable milestone labels */
  private getMilestoneLabel(minutes: number): string {
    const labels: Record<number, string> = {
      30: '🔥 30 minutes — warming up',
      60: '⚡ 1 hour — momentum building',
      120: '🚀 2 hours — deep flow state',
      240: '🌟 4 hours — marathon session',
      480: '🏆 8 hours — legendary session',
    };
    return labels[minutes] || `${minutes} minutes`;
  }

  /** Check PM schedule — returns any due maintenance items */
  checkPMSchedule(pmSchedule: any[]): Array<{ task: string; priority: string; due: string }> {
    const now = new Date();
    const dueItems: Array<{ task: string; priority: string; due: string }> = [];

    if (!pmSchedule || !Array.isArray(pmSchedule)) return dueItems;

    for (const item of pmSchedule) {
      if (!item.last_run || !item.frequency) continue;

      const lastRun = new Date(item.last_run);
      const frequencyMs = this.parseFrequency(item.frequency);
      const nextDue = new Date(lastRun.getTime() + frequencyMs);

      if (now >= nextDue) {
        dueItems.push({
          task: item.task || item.id || 'Unknown PM task',
          priority: item.priority || 'medium',
          due: nextDue.toISOString(),
        });
      }
    }

    return dueItems;
  }

  /** Parse frequency string to milliseconds */
  private parseFrequency(freq: string): number {
    const map: Record<string, number> = {
      'per_session': 0,
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000,
      'biweekly': 14 * 24 * 60 * 60 * 1000,
      'monthly': 30 * 24 * 60 * 60 * 1000,
      'quarterly': 90 * 24 * 60 * 60 * 1000,
    };
    return map[freq] || 0;
  }

  /** Generate session close reminder — called by UI or timer */
  getSessionCloseReminder(): {
    shouldRemind: boolean;
    uptimeHours: number;
    pendingBackups: number;
    pmDue: number;
    message: string;
  } {
    const uptimeHours = Math.round((this.state.uptimeMs / (60 * 60 * 1000)) * 10) / 10;
    const pendingEvents = this.state.eventQueue.filter(e => !e.processed).length;
    const shouldRemind = uptimeHours >= 2 || pendingEvents > 0;

    return {
      shouldRemind,
      uptimeHours,
      pendingBackups: pendingEvents,
      pmDue: 0, // Populated when PM schedule is loaded
      message: shouldRemind
        ? `⚙️ Session running ${uptimeHours}h — ${pendingEvents} events pending. Consider diary update + backup.`
        : `⚙️ Session healthy — ${uptimeHours}h uptime.`,
    };
  }


// ── SECTION 8: UNIFIED API ──────────────────────────────────────────────

  /**
   * Single entry point for the UI layer.
   * Instead of reaching into individual engines, the UI calls these methods.
   * This decouples the UI from engine internals.
   */

  /** Get complete flywheel dashboard state */
  getDashboard(): {
    stage: FlywheelStage;
    stageProgress: { current: FlywheelStage; next: FlywheelStage | null; progress: number };
    pillarHealth: Record<PillarId, number>;
    avgHealth: number;
    eventsProcessed: number;
    cascadeCount: number;
    uptimeMs: number;
    lastHealthCheck: string | null;
    sessionCloseReminder: ReturnType<FlywheelOrchestrator['getSessionCloseReminder']>;
  } {
    const avgHealth = Object.values(this.state.pillarHealth).reduce((a, b) => a + b, 0) / 6;

    return {
      stage: this.state.currentStage,
      stageProgress: this.getStageProgress(),
      pillarHealth: { ...this.state.pillarHealth },
      avgHealth: Math.round(avgHealth * 100) / 100,
      eventsProcessed: this.state.processedCount,
      cascadeCount: this.state.cascadeCount,
      uptimeMs: this.state.uptimeMs,
      lastHealthCheck: this.state.lastHealthCheck,
      sessionCloseReminder: this.getSessionCloseReminder(),
    };
  }

  /** Get recommendations from insights engine, filtered by current stage */
  getRecommendations(): any[] {
    if (!this.engines.insights?.getRecommendations) return [];

    try {
      const recommendations = this.engines.insights.getRecommendations();

      // Filter by stage — don't overwhelm early sessions
      if (this.state.currentStage === 'COLD_START') {
        return recommendations.slice(0, 1); // Only most important
      }
      if (this.state.currentStage === 'CALIBRATION') {
        return recommendations.slice(0, 3);
      }
      return recommendations; // Full list for MOMENTUM+
    } catch (e) {
      console.warn('⚙️ Recommendations fetch failed:', e);
      return [];
    }
  }

  /** Get recent event history — for UI timeline display */
  getEventHistory(limit: number = 20): FlywheelEvent[] {
    return this.eventLog.slice(-limit).reverse();
  }

  /** Get events filtered by category */
  getEventsByCategory(category: EventCategory, limit: number = 10): FlywheelEvent[] {
    return this.eventLog
      .filter(e => e.category === category)
      .slice(-limit)
      .reverse();
  }

  /** Get cascade chains — for debugging and visualization */
  getCascadeChains(): Array<{ rootEvent: string; chain: string[]; depth: number }> {
    const chains: Array<{ rootEvent: string; chain: string[]; depth: number }> = [];
    const seen = new Set<string>();

    for (const event of this.eventLog) {
      if (event.cascadeChain && event.cascadeChain.length > 0 && !seen.has(event.cascadeChain[0])) {
        seen.add(event.cascadeChain[0]);
        chains.push({
          rootEvent: event.cascadeChain[0],
          chain: [...event.cascadeChain, event.id],
          depth: event.cascadeChain.length + 1,
        });
      }
    }

    return chains;
  }

  /** Quick status check — is the flywheel healthy? */
  isHealthy(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];
    const avgHealth = Object.values(this.state.pillarHealth).reduce((a, b) => a + b, 0) / 6;

    if (avgHealth < 0.3) issues.push('Overall pillar health below 30%');

    // Check individual pillars
    for (const [pillar, health] of Object.entries(this.state.pillarHealth)) {
      if (health < 0.1) issues.push(`${pillar} critically low (${Math.round(health * 100)}%)`);
    }

    // Check for stale health data
    if (this.state.lastHealthCheck) {
      const staleness = Date.now() - new Date(this.state.lastHealthCheck).getTime();
      if (staleness > this.config.healthCheckIntervalMs * 2) {
        issues.push('Health data is stale — last check was ' + Math.round(staleness / 60000) + ' minutes ago');
      }
    }

    return { healthy: issues.length === 0, issues };
  }


// ── SECTION 9: AI EXPORT ────────────────────────────────────────────────

  /**
   * Format orchestrator state for AI prompt injection.
   * This is what gets prepended to the AI context so the chatbot
   * knows the current flywheel state, health, and stage.
   */
  formatForAI(): string {
    const dashboard = this.getDashboard();
    const healthStatus = this.isHealthy();
    const stageProgress = this.getStageProgress();

    const lines: string[] = [
      '=== FLYWHEEL ORCHESTRATOR STATE ===',
      `Stage: ${dashboard.stage}`,
      `Stage Progress: ${stageProgress.next ? `${Math.round(stageProgress.progress * 100)}% → ${stageProgress.next}` : 'MAX STAGE REACHED'}`,
      `Average Health: ${Math.round(dashboard.avgHealth * 100)}%`,
      '',
      'Pillar Health:',
    ];

    // Pillar health breakdown
    const pillarLabels: Record<PillarId, string> = {
      P1_IDENTITY: 'P1 Identity',
      P2_EMOTIONAL: 'P2 Emotional',
      P3_POLICY: 'P3 Policy',
      P4_PARTNERSHIP: 'P4 Partnership',
      P5_PREFERENCE: 'P5 Preference',
      P6_FLYWHEEL: 'P6 Flywheel',
    };

    for (const [pillar, health] of Object.entries(dashboard.pillarHealth)) {
      const label = pillarLabels[pillar as PillarId] || pillar;
      const bar = '█'.repeat(Math.round(health * 10)) + '░'.repeat(10 - Math.round(health * 10));
      lines.push(`  ${label}: [${bar}] ${Math.round(health * 100)}%`);
    }

    lines.push('');
    lines.push(`Events Processed: ${dashboard.eventsProcessed}`);
    lines.push(`Cascade Chains: ${dashboard.cascadeCount}`);
    lines.push(`Uptime: ${Math.round(dashboard.uptimeMs / 60000)} minutes`);
    lines.push(`System Health: ${healthStatus.healthy ? '✅ HEALTHY' : '⚠️ ISSUES: ' + healthStatus.issues.join('; ')}`);

    // Session close reminder
    const reminder = dashboard.sessionCloseReminder;
    if (reminder.shouldRemind) {
      lines.push('');
      lines.push(`⏰ REMINDER: ${reminder.message}`);
    }

    lines.push('=== END FLYWHEEL STATE ===');

    return lines.join('\n');
  }

  /** Export full state as JSON — for backup engine consumption */
  exportState(): OrchestratorState & { config: OrchestratorConfig; eventLogSize: number } {
    return {
      ...this.state,
      config: this.config,
      eventLogSize: this.eventLog.length,
    };
  }

  /** Import state — for session restoration */
  importState(savedState: Partial<OrchestratorState>): void {
    if (savedState.currentStage) this.state.currentStage = savedState.currentStage;
    if (savedState.processedCount) this.state.processedCount = savedState.processedCount;
    if (savedState.cascadeCount) this.state.cascadeCount = savedState.cascadeCount;
    if (savedState.pillarHealth) this.state.pillarHealth = savedState.pillarHealth;
    if (savedState.lastStageTransition) this.state.lastStageTransition = savedState.lastStageTransition;

    console.log('⚙️ Orchestrator state restored — stage:', this.state.currentStage);
  }


// ── SECTION 10: FACTORY RESET + GLOBAL REGISTRATION ─────────────────────

  /** Factory reset — clear all runtime state, keep config */
  factoryReset(): void {
    this.stop(); // Clear timers

    this.state = {
      currentStage: 'COLD_START',
      eventQueue: [],
      processedCount: 0,
      cascadeCount: 0,
      lastHealthCheck: null,
      lastStageTransition: null,
      pillarHealth: {
        P1_IDENTITY: 0,
        P2_EMOTIONAL: 0,
        P3_POLICY: 0,
        P4_PARTNERSHIP: 0,
        P5_PREFERENCE: 0,
        P6_FLYWHEEL: 0,
      },
      sessionStartTime: new Date().toISOString(),
      uptimeMs: 0,
    };

    this.eventLog = [];
    this.firedMilestones.clear();
    this.listeners.clear();

    console.log('⚙️ Flywheel Orchestrator FACTORY RESET — all state cleared');
  }

  /** Get full stats for diagnostics */
  getStats(): {
    stage: FlywheelStage;
    eventsProcessed: number;
    cascadeCount: number;
    eventLogSize: number;
    uptimeMinutes: number;
    avgHealth: number;
    healthyPillars: number;
    criticalPillars: number;
  } {
    const avgHealth = Object.values(this.state.pillarHealth).reduce((a, b) => a + b, 0) / 6;
    const healthyPillars = Object.values(this.state.pillarHealth).filter(h => h >= 0.5).length;
    const criticalPillars = Object.values(this.state.pillarHealth).filter(h => h < 0.2).length;

    return {
      stage: this.state.currentStage,
      eventsProcessed: this.state.processedCount,
      cascadeCount: this.state.cascadeCount,
      eventLogSize: this.eventLog.length,
      uptimeMinutes: Math.round(this.state.uptimeMs / 60000),
      avgHealth: Math.round(avgHealth * 100) / 100,
      healthyPillars,
      criticalPillars,
    };
  }

} // End FlywheelOrchestrator class


// ── GLOBAL REGISTRATION ──────────────────────────────────────────────────

/**
 * Factory function — creates and registers the orchestrator globally.
 * Called by boot_sequence_generic.ts after all engines are initialized.
 *
 * Usage:
 *   const engines = { memoir, personality, help, backup, insights, pattern, vocab };
 *   const orchestrator = createFlywheelOrchestrator(engines);
 *   orchestrator.start();
 */
function createFlywheelOrchestrator(
  engines: EngineRegistry,
  config?: Partial<OrchestratorConfig>
): FlywheelOrchestrator {
  const orchestrator = new FlywheelOrchestrator(engines, config);

  // Register globally for debugging and cross-engine access
  if (typeof window !== 'undefined') {
    (window as any)._FLYWHEEL_ORCHESTRATOR = orchestrator;
    console.log('⚙️ Flywheel Orchestrator registered globally as window._FLYWHEEL_ORCHESTRATOR');
  }

  return orchestrator;
}

// Export for module systems
export { FlywheelOrchestrator, createFlywheelOrchestrator };
export type {
  FlywheelEvent,
  FlywheelStage,
  PillarId,
  EventCategory,
  OrchestratorConfig,
  OrchestratorState,
  EngineRegistry,
  StageThresholds,
};
