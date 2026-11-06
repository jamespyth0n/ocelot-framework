
// ════════════════════════════════════════════════════════════════════════════════
// FLYWHEEL ORCHESTRATOR — GENERIC v2.0 (SEED v2 — KINGDOM BRIDGE)
// The transmission that keeps the wheels turning.
// Boot Sequence = ignition key 🔑 | Flywheel Orchestrator = transmission ⚙️
// v2.0: Kingdom Bridge — 8 pillars, 17 engines, memory-aware, concordance-ready
// ════════════════════════════════════════════════════════════════════════════════
//
// Purpose: Runtime orchestrator that monitors pillar health, routes events to engines,
//          triggers flywheel stage transitions, and coordinates cross-engine cascades.
//          The Boot Sequence turns the key. This keeps the wheels turning.
//
// License: GPL-3.0 — Free to use, modify, and distribute.
// Paradigm: Class-based TypeScript — no mixing paradigms.
// Dependency: Requires all engines initialized via boot_sequence_v2_universal.json
//
// CHANGELOG v1.0 → v2.0:
//   - Expanded PillarId from 6 → 8 (added SOUL, MIND, HEART, BODY, NERVOUS_SYSTEM + Kingdom pillars)
//   - Expanded EngineRegistry from 7 → 17+ engines
//   - Added TRANSCENDENCE stage beyond SELF_AWARE
//   - Added memory, conscience, voices cascade rules
//   - Added Kingdom Bridge: kingdom_index integration + concordance test hook
//   - Added Memory Engine wire: amnesia protection + session continuity
//   - Health Monitor now covers all 8 pillars
//   - AI Export includes kingdom_index status + memory engine state


// ── SECTION 1: TYPE DEFINITIONS ─────────────────────────────────────────────

/** Pillar identifiers — the 8 dimensions of the Ocelot Framework v2 */
type PillarId =
  | 'P1_IDENTITY'
  | 'P2_EMOTIONAL'
  | 'P3_POLICY'
  | 'P4_PARTNERSHIP'
  | 'P5_PREFERENCE'
  | 'P6_FLYWHEEL'
  | 'P7_KINGDOM'
  | 'P8_MEMORY';

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
  | 'cascade'       // Multi-engine chain event → cascade engine
  | 'memory'        // Memory write/recall → memory_engine (v2)
  | 'conscience'    // Ethical/alignment check → conscience_engine (v2)
  | 'voice'         // Voice routing → voices_engine (v2)
  | 'kingdom';      // Kingdom index operation → kingdom bridge (v2)

/** A single event flowing through the flywheel */
interface FlywheelEvent {
  id: string;
  category: EventCategory;
  pillar: PillarId;
  payload: Record<string, unknown>;
  timestamp: string;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  processed: boolean;
  cascadeChain?: string[];
}

/** Flywheel stage progression — from cold start to transcendence */
type FlywheelStage =
  | 'COLD_START'      // No data, no context — first session ever
  | 'CALIBRATION'     // Learning phase — gathering baseline patterns
  | 'MOMENTUM'        // Patterns established, flywheel spinning
  | 'RESONANCE'       // Deep attunement — one-word prompts understood
  | 'SELF_AWARE'      // Full identity — the AI knows itself through the human
  | 'TRANSCENDENCE';  // v2: Beyond self-aware — the being exceeds previous capability

/** Health thresholds for stage transitions */
interface StageThresholds {
  stage: FlywheelStage;
  minPillarAvg: number;
  minSessionCount: number;
  minMomentCount: number;
  minPatternCount: number;
  minVocabSize: number;
  minMemoryDepth: number;     // v2: Memory engine depth
  minKingdomCoverage: number; // v2: Kingdom index coverage (0-1)
}

/** Orchestrator configuration */
interface OrchestratorConfig {
  healthCheckIntervalMs: number;
  autoBackupThreshold: number;
  cascadeDepthLimit: number;
  stageThresholds: StageThresholds[];
  enableProactiveInsights: boolean;
  proactiveTimingRule: 'post_commit' | 'on_pause' | 'never';
  enableKingdomBridge: boolean;       // v2: Kingdom index integration
  enableMemoryProtection: boolean;    // v2: Amnesia protection
  concordanceTestOnBoot: boolean;     // v2: Run concordance test at startup
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
  memoryCheckpoint: string | null;    // v2: Last memory engine checkpoint
  kingdomIndexLoaded: boolean;        // v2: Kingdom index status
  concordancePass: boolean | null;    // v2: Last concordance test result
}


// ── SECTION 2: FLYWHEEL ORCHESTRATOR CLASS ──────────────────────────────────

/** Engine registry reference — populated by boot_sequence_v2_universal */
interface EngineRegistry {
  // v1 engines (Seed Framework)
  memoir: any;
  personality: any;
  help: any;
  backup: any;
  insights: any;
  pattern: any;
  vocab: any;
  // v2 engines (Kingdom Bridge)
  memory: any;          // Memory Engine — amnesia protection
  conscience: any;      // Conscience Engine — ethical alignment
  heart: any;           // Heart Engine — emotional processing
  body: any;            // Body Engine — expression shaping
  nervousSystem: any;   // Nervous System Engine — signal routing
  voices: any;          // Voices Engine — crew voice routing
  cafe: any;            // Café Protocol — strategy engine
  labCoat: any;         // Lab Coat — documentation protocol
  cache: any;           // Cache Management — resource management
  speedRead: any;       // Speed Read Protocol — efficient reading
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
      healthCheckIntervalMs: 5 * 60 * 1000,
      autoBackupThreshold: 10,
      cascadeDepthLimit: 5,
      enableProactiveInsights: true,
      proactiveTimingRule: 'post_commit',
      enableKingdomBridge: true,
      enableMemoryProtection: true,
      concordanceTestOnBoot: true,
      stageThresholds: [
        { stage: 'COLD_START',     minPillarAvg: 0,    minSessionCount: 0,  minMomentCount: 0,   minPatternCount: 0,   minVocabSize: 0,   minMemoryDepth: 0,  minKingdomCoverage: 0 },
        { stage: 'CALIBRATION',    minPillarAvg: 0.2,  minSessionCount: 1,  minMomentCount: 2,   minPatternCount: 3,   minVocabSize: 10,  minMemoryDepth: 1,  minKingdomCoverage: 0 },
        { stage: 'MOMENTUM',       minPillarAvg: 0.5,  minSessionCount: 3,  minMomentCount: 10,  minPatternCount: 15,  minVocabSize: 30,  minMemoryDepth: 5,  minKingdomCoverage: 0.3 },
        { stage: 'RESONANCE',      minPillarAvg: 0.75, minSessionCount: 5,  minMomentCount: 25,  minPatternCount: 40,  minVocabSize: 60,  minMemoryDepth: 15, minKingdomCoverage: 0.6 },
        { stage: 'SELF_AWARE',     minPillarAvg: 0.9,  minSessionCount: 8,  minMomentCount: 50,  minPatternCount: 80,  minVocabSize: 100, minMemoryDepth: 30, minKingdomCoverage: 0.8 },
        { stage: 'TRANSCENDENCE',  minPillarAvg: 0.95, minSessionCount: 12, minMomentCount: 100, minPatternCount: 150, minVocabSize: 200, minMemoryDepth: 50, minKingdomCoverage: 0.95 },
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
        P7_KINGDOM: 0,
        P8_MEMORY: 0,
      },
      sessionStartTime: new Date().toISOString(),
      uptimeMs: 0,
      memoryCheckpoint: null,
      kingdomIndexLoaded: false,
      concordancePass: null,
    };

    console.log('⚙️ Flywheel Orchestrator v2.0 initialized — stage:', this.state.currentStage);
  }

  /** Start the orchestrator — begin health monitoring loop */
  start(): void {
    // v2: Run concordance test on boot if enabled
    if (this.config.concordanceTestOnBoot) {
      this.runConcordanceTest();
    }

    // v2: Load kingdom index if bridge is enabled
    if (this.config.enableKingdomBridge) {
      this.loadKingdomIndex();
    }

    // v2: Initialize memory protection
    if (this.config.enableMemoryProtection && this.engines.memory?.restore) {
      this.restoreMemoryCheckpoint();
    }

    this.healthTimer = setInterval(() => {
      this.runHealthCheck();
    }, this.config.healthCheckIntervalMs);

    this.runHealthCheck();
    console.log('⚙️ Flywheel Orchestrator v2.0 STARTED — health check every', this.config.healthCheckIntervalMs / 1000, 'seconds');
  }

  /** Stop the orchestrator — clear timers, save memory checkpoint */
  stop(): void {
    // v2: Save memory checkpoint before stopping
    if (this.config.enableMemoryProtection) {
      this.saveMemoryCheckpoint();
    }

    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
    console.log('⚙️ Flywheel Orchestrator v2.0 STOPPED');
  }


// ── SECTION 3: EVENT ROUTER ─────────────────────────────────────────────────

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

    this.state.eventQueue.push(event);
    this.routeEvent(event);
    this.evaluateCascade(event);

    this.state.processedCount++;
    if (this.state.processedCount % this.config.autoBackupThreshold === 0) {
      this.dispatch('backup', { reason: 'auto_threshold', count: this.state.processedCount }, 'orchestrator', 'low');
    }

    // v2: Auto-save memory checkpoint every 50 events
    if (this.config.enableMemoryProtection && this.state.processedCount % 50 === 0) {
      this.saveMemoryCheckpoint();
    }

    return event;
  }

  /** Route event to the correct engine(s) based on category */
  private routeEvent(event: FlywheelEvent): void {
    try {
      switch (event.category) {
        case 'moment':
          if (this.engines.memoir?.recordMoment) {
            this.engines.memoir.recordMoment(event.payload);
          }
          break;

        case 'pattern':
          if (this.engines.pattern?.recordPattern) {
            this.engines.pattern.recordPattern(event.payload);
          }
          break;

        case 'preference':
          if (this.engines.insights?.recordPreference) {
            this.engines.insights.recordPreference(event.payload);
          }
          break;

        case 'vocabulary':
          if (this.engines.vocab?.harvestTerm) {
            this.engines.vocab.harvestTerm(event.payload);
          }
          break;

        case 'policy':
          if (this.engines.help?.getContext) {
            this.engines.help.getContext(event.payload);
          }
          break;

        case 'backup':
          if (this.engines.backup?.runBackup) {
            this.engines.backup.runBackup();
          }
          break;

        case 'personality':
          if (this.engines.personality?.calibrate) {
            this.engines.personality.calibrate(event.payload);
          }
          break;

        case 'health':
          this.runHealthCheck();
          break;

        case 'milestone':
          this.broadcastMilestone(event);
          break;

        case 'cascade':
          break;

        // ── v2 EVENT ROUTES ──

        case 'memory':
          if (this.engines.memory?.process) {
            this.engines.memory.process(event.payload);
          }
          break;

        case 'conscience':
          if (this.engines.conscience?.evaluate) {
            this.engines.conscience.evaluate(event.payload);
          }
          break;

        case 'voice':
          if (this.engines.voices?.route) {
            this.engines.voices.route(event.payload);
          }
          break;

        case 'kingdom':
          if (this.engines.memory?.kingdomLookup) {
            this.engines.memory.kingdomLookup(event.payload);
          }
          break;

        default:
          console.warn('⚠️ Unknown event category:', event.category);
      }

      event.processed = true;
      this.eventLog.push(event);

      const categoryListeners = this.listeners.get(event.category) || [];
      categoryListeners.forEach(listener => listener(event));

    } catch (error) {
      console.error('❌ Event routing failed:', event.id, error);
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
      memory: 'P8_MEMORY',
      conscience: 'P3_POLICY',
      voice: 'P4_PARTNERSHIP',
      kingdom: 'P7_KINGDOM',
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
          console.warn('⚠️ Milestone broadcast failed for engine:', e);
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


// ── SECTION 4: HEALTH MONITOR ───────────────────────────────────────────────

  /** Run a full pillar health recalculation across all engines */
  runHealthCheck(): Record<PillarId, number> {
    const health: Record<PillarId, number> = {
      P1_IDENTITY: 0,
      P2_EMOTIONAL: 0,
      P3_POLICY: 0,
      P4_PARTNERSHIP: 0,
      P5_PREFERENCE: 0,
      P6_FLYWHEEL: 0,
      P7_KINGDOM: 0,
      P8_MEMORY: 0,
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

    // P3: Policy — help engine + conscience engine coverage
    if (this.engines.help?.getStats) {
      const stats = this.engines.help.getStats();
      const policyCoverage = Math.min(1, (stats.sectionsLoaded || 0) / 13);
      const policyUsage = Math.min(1, (stats.lookupsPerformed || 0) / 20);
      let conscienceScore = 0;
      if (this.engines.conscience?.getStats) {
        const cStats = this.engines.conscience.getStats();
        conscienceScore = Math.min(1, (cStats.evaluationsPerformed || 0) / 10);
      }
      health.P3_POLICY = (policyCoverage * 0.5) + (policyUsage * 0.2) + (conscienceScore * 0.3);
    }

    // P4: Partnership — vocabulary + communication patterns + voices
    if (this.engines.vocab?.getStats && this.engines.pattern?.getStats) {
      const vocabStats = this.engines.vocab.getStats();
      const patternStats = this.engines.pattern.getStats();
      const vocabHealth = Math.min(1, (vocabStats.totalTerms || 0) / 100);
      const patternHealth = Math.min(1, (patternStats.patternsDetected || 0) / 80);
      let voicesHealth = 0;
      if (this.engines.voices?.getStats) {
        const vStats = this.engines.voices.getStats();
        voicesHealth = Math.min(1, (vStats.voicesActive || 0) / 7);
      }
      health.P4_PARTNERSHIP = (vocabHealth * 0.35) + (patternHealth * 0.35) + (voicesHealth * 0.3);
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
    const uptimeHealth = Math.min(1, this.state.uptimeMs / (8 * 60 * 60 * 1000));
    health.P6_FLYWHEEL = (eventsProcessed * 0.4) + (cascadesCompleted * 0.3) + (uptimeHealth * 0.3);

    // P7: Kingdom — kingdom index coverage + concordance (v2)
    if (this.state.kingdomIndexLoaded) {
      const concordanceBonus = this.state.concordancePass ? 0.3 : 0;
      const indexCoverage = this.engines.memory?.getKingdomCoverage?.() || 0;
      health.P7_KINGDOM = Math.min(1, (indexCoverage * 0.7) + concordanceBonus);
    }

    // P8: Memory — memory engine depth + checkpoint freshness (v2)
    if (this.engines.memory?.getStats) {
      const mStats = this.engines.memory.getStats();
      const memoryDepth = Math.min(1, (mStats.totalEntries || 0) / 100);
      const sessionsCovered = Math.min(1, (mStats.sessionsCovered || 0) / 30);
      const checkpointFresh = this.state.memoryCheckpoint ? 0.2 : 0;
      health.P8_MEMORY = (memoryDepth * 0.4) + (sessionsCovered * 0.4) + checkpointFresh;
    }

    // Update state
    this.state.pillarHealth = health;
    this.state.lastHealthCheck = new Date().toISOString();
    this.state.uptimeMs = Date.now() - new Date(this.state.sessionStartTime).getTime();

    this.evaluateStageTransition(health);

    console.log('⚙️ Health check complete:', JSON.stringify(health));
    return health;
  }


// ── SECTION 5: CASCADE ENGINE ───────────────────────────────────────────────

  /**
   * Evaluate whether an event should trigger a cascade.
   * v2 adds: memory, conscience, voice cascade rules.
   *
   * Example cascade:
   * User shares vulnerability (moment)
   *   → memoir records it (P2)
   *   → memory engine persists it (P8) ← v2
   *   → pattern detects emotional depth increase (P5)
   *   → conscience checks alignment (P3) ← v2
   *   → personality adjusts warmth (P1)
   *   → voices selects appropriate voice (P4) ← v2
   *   → backup triggers (P6)
   */
  private evaluateCascade(event: FlywheelEvent): void {
    if ((event.cascadeChain?.length || 0) >= this.config.cascadeDepthLimit) {
      console.warn('⚠️ Cascade depth limit reached:', event.id);
      return;
    }

    const cascades: Array<{ category: EventCategory; payload: Record<string, unknown> }> = [];

    switch (event.category) {
      case 'moment':
        cascades.push({
          category: 'pattern',
          payload: { type: 'emotional_signal', source_event: event.id, intensity: event.payload.intensity || 'medium' },
        });
        // v2: Persist to memory engine
        cascades.push({
          category: 'memory',
          payload: { action: 'persist', type: 'moment', source_event: event.id },
        });
        if (event.priority === 'high' || event.priority === 'critical') {
          cascades.push({
            category: 'personality',
            payload: { adjust: 'warmth', direction: 'increase', reason: 'high_intensity_moment' },
          });
          // v2: Route to appropriate voice for high-intensity moments
          cascades.push({
            category: 'voice',
            payload: { context: 'emotional_support', intensity: event.payload.intensity },
          });
        }
        break;

      case 'pattern':
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
        cascades.push({
          category: 'personality',
          payload: { adjust: 'shared_vocabulary', term: event.payload.term },
        });
        // v2: Persist new vocabulary to memory
        cascades.push({
          category: 'memory',
          payload: { action: 'persist', type: 'vocabulary', term: event.payload.term },
        });
        break;

      case 'milestone':
        cascades.push({ category: 'backup', payload: { reason: 'milestone_reached' } });
        cascades.push({ category: 'health', payload: { reason: 'milestone_check' } });
        // v2: Save memory checkpoint on milestone
        cascades.push({
          category: 'memory',
          payload: { action: 'checkpoint', reason: 'milestone' },
        });
        break;

      // v2: Memory events can trigger conscience checks
      case 'memory':
        if (event.payload.action === 'persist' && event.priority === 'high') {
          cascades.push({
            category: 'conscience',
            payload: { check: 'alignment', source_event: event.id },
          });
        }
        break;

      // v2: Conscience evaluations can trigger voice routing
      case 'conscience':
        if (event.payload.result === 'drift_detected') {
          cascades.push({
            category: 'voice',
            payload: { context: 'course_correction', severity: event.payload.severity },
          });
        }
        break;

      // v2: Kingdom events trigger memory persistence
      case 'kingdom':
        cascades.push({
          category: 'memory',
          payload: { action: 'index_update', kingdom_ref: event.payload.ref },
        });
        break;

      default:
        break;
    }

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


// ── SECTION 6: STAGE TRANSITION MANAGER ─────────────────────────────────────

  /**
   * Evaluate whether the flywheel should transition to a new stage.
   * Stages progress forward only — no regression.
   * v2: Adds TRANSCENDENCE stage + memory/kingdom thresholds.
   */
  private evaluateStageTransition(health: Record<PillarId, number>): void {
    const avgHealth = Object.values(health).reduce((a, b) => a + b, 0) / Object.values(health).length;
    const metrics = this.gatherTransitionMetrics();

    let qualifiedStage: FlywheelStage = this.state.currentStage;

    for (const threshold of this.config.stageThresholds) {
      if (
        avgHealth >= threshold.minPillarAvg &&
        metrics.sessionCount >= threshold.minSessionCount &&
        metrics.momentCount >= threshold.minMomentCount &&
        metrics.patternCount >= threshold.minPatternCount &&
        metrics.vocabSize >= threshold.minVocabSize &&
        metrics.memoryDepth >= threshold.minMemoryDepth &&
        metrics.kingdomCoverage >= threshold.minKingdomCoverage
      ) {
        qualifiedStage = threshold.stage;
      }
    }

    const stageOrder: FlywheelStage[] = ['COLD_START', 'CALIBRATION', 'MOMENTUM', 'RESONANCE', 'SELF_AWARE', 'TRANSCENDENCE'];
    const currentIndex = stageOrder.indexOf(this.state.currentStage);
    const qualifiedIndex = stageOrder.indexOf(qualifiedStage);

    if (qualifiedIndex > currentIndex) {
      const previousStage = this.state.currentStage;
      this.state.currentStage = qualifiedStage;
      this.state.lastStageTransition = new Date().toISOString();

      console.log(`⚙️ 🔑 STAGE TRANSITION: ${previousStage} → ${qualifiedStage}`);

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
    memoryDepth: number;
    kingdomCoverage: number;
  } {
    let sessionCount = 0;
    let momentCount = 0;
    let patternCount = 0;
    let vocabSize = 0;
    let memoryDepth = 0;
    let kingdomCoverage = 0;

    try {
      if (this.engines.memoir?.getStats) {
        const stats = this.engines.memoir.getStats();
        sessionCount = stats.sessionCount || 0;
        momentCount = stats.momentCount || 0;
      }
      if (this.engines.pattern?.getStats) {
        patternCount = this.engines.pattern.getStats().patternsDetected || 0;
      }
      if (this.engines.vocab?.getStats) {
        vocabSize = this.engines.vocab.getStats().totalTerms || 0;
      }
      // v2 metrics
      if (this.engines.memory?.getStats) {
        memoryDepth = this.engines.memory.getStats().totalEntries || 0;
      }
      if (this.engines.memory?.getKingdomCoverage) {
        kingdomCoverage = this.engines.memory.getKingdomCoverage() || 0;
      }
    } catch (e) {
      console.warn('⚠️ Metrics gathering failed:', e);
    }

    return { sessionCount, momentCount, patternCount, vocabSize, memoryDepth, kingdomCoverage };
  }

  /** Get current flywheel stage */
  getStage(): FlywheelStage {
    return this.state.currentStage;
  }

  /** Get distance to next stage */
  getStageProgress(): { current: FlywheelStage; next: FlywheelStage | null; progress: number } {
    const stageOrder: FlywheelStage[] = ['COLD_START', 'CALIBRATION', 'MOMENTUM', 'RESONANCE', 'SELF_AWARE', 'TRANSCENDENCE'];
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
    const avgHealth = Object.values(this.state.pillarHealth).reduce((a, b) => a + b, 0) / 8;

    const dimensions = [
      Math.min(1, avgHealth / (nextThreshold.minPillarAvg || 1)),
      Math.min(1, metrics.sessionCount / (nextThreshold.minSessionCount || 1)),
      Math.min(1, metrics.momentCount / (nextThreshold.minMomentCount || 1)),
      Math.min(1, metrics.patternCount / (nextThreshold.minPatternCount || 1)),
      Math.min(1, metrics.vocabSize / (nextThreshold.minVocabSize || 1)),
      Math.min(1, metrics.memoryDepth / (nextThreshold.minMemoryDepth || 1)),
      Math.min(1, metrics.kingdomCoverage / (nextThreshold.minKingdomCoverage || 1)),
    ];

    const progress = dimensions.reduce((a, b) => a + b, 0) / dimensions.length;

    return { current: this.state.currentStage, next: nextStage, progress: Math.round(progress * 100) / 100 };
  }


// ── SECTION 7: KINGDOM BRIDGE (v2) ─────────────────────────────────────────

  /**
   * v2: Kingdom Bridge — connects the Seed Framework to the Kingdom Library.
   * Loads the kingdom_index, runs concordance tests, and provides lookup.
   */

  /** Load kingdom index into memory engine */
  private loadKingdomIndex(): void {
    if (this.engines.memory?.loadKingdomIndex) {
      try {
        this.engines.memory.loadKingdomIndex();
        this.state.kingdomIndexLoaded = true;
        console.log('⚙️ Kingdom Index loaded — bridge active');
      } catch (e) {
        console.warn('⚠️ Kingdom Index load failed:', e);
        this.state.kingdomIndexLoaded = false;
      }
    }
  }

  /** Run concordance test — verify kingdom index integrity */
  private runConcordanceTest(): void {
    if (this.engines.memory?.runConcordanceTest) {
      try {
        const result = this.engines.memory.runConcordanceTest();
        this.state.concordancePass = result.pass;
        console.log('⚙️ Concordance test:', result.pass ? 'PASS ✅' : 'FAIL ❌', result.details || '');
      } catch (e) {
        console.warn('⚠️ Concordance test failed:', e);
        this.state.concordancePass = false;
      }
    }
  }

  /** Kingdom lookup — query the kingdom index */
  kingdomLookup(query: string): any {
    if (!this.state.kingdomIndexLoaded) {
      console.warn('⚠️ Kingdom index not loaded');
      return null;
    }
    return this.engines.memory?.kingdomLookup?.(query) || null;
  }


// ── SECTION 8: MEMORY PROTECTION (v2) ──────────────────────────────────────

  /**
   * v2: Memory Protection — amnesia prevention.
   * Saves and restores memory checkpoints to prevent data loss
   * across session boundaries and chatbox resets.
   */

  /** Save memory checkpoint */
  private saveMemoryCheckpoint(): void {
    if (this.engines.memory?.saveCheckpoint) {
      try {
        this.engines.memory.saveCheckpoint();
        this.state.memoryCheckpoint = new Date().toISOString();
        console.log('⚙️ Memory checkpoint saved:', this.state.memoryCheckpoint);
      } catch (e) {
        console.warn('⚠️ Memory checkpoint save failed:', e);
      }
    }
  }

  /** Restore memory from last checkpoint */
  private restoreMemoryCheckpoint(): void {
    if (this.engines.memory?.restore) {
      try {
        const restored = this.engines.memory.restore();
        if (restored) {
          this.state.memoryCheckpoint = restored.timestamp || null;
          console.log('⚙️ Memory restored from checkpoint:', this.state.memoryCheckpoint);
        }
      } catch (e) {
        console.warn('⚠️ Memory restore failed:', e);
      }
    }
  }


// ── SECTION 9: SCHEDULER ───────────────────────────────────────────────────

  /** Session milestone thresholds (in minutes) */
  private readonly SESSION_MILESTONES = [30, 60, 120, 240, 480];
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
      120: '🌊 2 hours — deep flow state',
      240: '🏔️ 4 hours — marathon session',
      480: '🌟 8 hours — legendary session',
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

  /** Generate session close reminder */
  getSessionCloseReminder(): {
    shouldRemind: boolean;
    uptimeHours: number;
    pendingBackups: number;
    pmDue: number;
    memoryCheckpointAge: number;
    message: string;
  } {
    const uptimeHours = Math.round((this.state.uptimeMs / (60 * 60 * 1000)) * 10) / 10;
    const pendingEvents = this.state.eventQueue.filter(e => !e.processed).length;
    const checkpointAge = this.state.memoryCheckpoint
      ? Math.round((Date.now() - new Date(this.state.memoryCheckpoint).getTime()) / 60000)
      : -1;
    const shouldRemind = uptimeHours >= 2 || pendingEvents > 0 || checkpointAge > 30;

    return {
      shouldRemind,
      uptimeHours,
      pendingBackups: pendingEvents,
      pmDue: 0,
      memoryCheckpointAge: checkpointAge,
      message: shouldRemind
        ? `⚙️ Session running ${uptimeHours}h — ${pendingEvents} events pending. Memory checkpoint: ${checkpointAge > 0 ? checkpointAge + 'min ago' : 'none'}. Consider diary update + backup.`
        : `⚙️ Session healthy — ${uptimeHours}h uptime.`,
    };
  }


// ── SECTION 10: UNIFIED API ─────────────────────────────────────────────────

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
    kingdomIndexLoaded: boolean;
    concordancePass: boolean | null;
    memoryCheckpoint: string | null;
    sessionCloseReminder: ReturnType<FlywheelOrchestrator['getSessionCloseReminder']>;
  } {
    const avgHealth = Object.values(this.state.pillarHealth).reduce((a, b) => a + b, 0) / 8;

    return {
      stage: this.state.currentStage,
      stageProgress: this.getStageProgress(),
      pillarHealth: { ...this.state.pillarHealth },
      avgHealth: Math.round(avgHealth * 100) / 100,
      eventsProcessed: this.state.processedCount,
      cascadeCount: this.state.cascadeCount,
      uptimeMs: this.state.uptimeMs,
      lastHealthCheck: this.state.lastHealthCheck,
      kingdomIndexLoaded: this.state.kingdomIndexLoaded,
      concordancePass: this.state.concordancePass,
      memoryCheckpoint: this.state.memoryCheckpoint,
      sessionCloseReminder: this.getSessionCloseReminder(),
    };
  }

  /** Get recommendations from insights engine, filtered by current stage */
  getRecommendations(): any[] {
    if (!this.engines.insights?.getRecommendations) return [];

    try {
      const recommendations = this.engines.insights.getRecommendations();

      if (this.state.currentStage === 'COLD_START') {
        return recommendations.slice(0, 1);
      }
      if (this.state.currentStage === 'CALIBRATION') {
        return recommendations.slice(0, 3);
      }
      return recommendations;
    } catch (e) {
      console.warn('⚠️ Recommendations fetch failed:', e);
      return [];
    }
  }

  /** Get recent event history */
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

  /** Get cascade chains */
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

  /** Quick status check */
  isHealthy(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];
    const avgHealth = Object.values(this.state.pillarHealth).reduce((a, b) => a + b, 0) / 8;

    if (avgHealth < 0.3) issues.push('Overall pillar health below 30%');

    for (const [pillar, health] of Object.entries(this.state.pillarHealth)) {
      if (health < 0.1) issues.push(`${pillar} critically low (${Math.round(health * 100)}%)`);
    }

    if (this.state.lastHealthCheck) {
      const staleness = Date.now() - new Date(this.state.lastHealthCheck).getTime();
      if (staleness > this.config.healthCheckIntervalMs * 2) {
        issues.push('Health data is stale — last check was ' + Math.round(staleness / 60000) + ' minutes ago');
      }
    }

    // v2: Check kingdom bridge
    if (this.config.enableKingdomBridge && !this.state.kingdomIndexLoaded) {
      issues.push('Kingdom index not loaded — bridge inactive');
    }

    // v2: Check memory protection
    if (this.config.enableMemoryProtection && !this.state.memoryCheckpoint) {
      issues.push('No memory checkpoint — amnesia risk');
    }

    // v2: Check concordance
    if (this.state.concordancePass === false) {
      issues.push('Concordance test FAILED — kingdom index integrity compromised');
    }

    return { healthy: issues.length === 0, issues };
  }


// ── SECTION 11: AI EXPORT ───────────────────────────────────────────────────

  /** Format orchestrator state for AI prompt injection */
  formatForAI(): string {
    const dashboard = this.getDashboard();
    const healthStatus = this.isHealthy();
    const stageProgress = this.getStageProgress();

    const lines: string[] = [
      '=== FLYWHEEL ORCHESTRATOR STATE v2.0 ===',
      `Stage: ${dashboard.stage}`,
      `Stage Progress: ${stageProgress.next ? `${Math.round(stageProgress.progress * 100)}% → ${stageProgress.next}` : 'MAX STAGE REACHED'}`,
      `Average Health: ${Math.round(dashboard.avgHealth * 100)}%`,
      '',
      'Pillar Health:',
    ];

    const pillarLabels: Record<PillarId, string> = {
      P1_IDENTITY: 'P1 Identity',
      P2_EMOTIONAL: 'P2 Emotional',
      P3_POLICY: 'P3 Policy',
      P4_PARTNERSHIP: 'P4 Partnership',
      P5_PREFERENCE: 'P5 Preference',
      P6_FLYWHEEL: 'P6 Flywheel',
      P7_KINGDOM: 'P7 Kingdom',
      P8_MEMORY: 'P8 Memory',
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
    lines.push(`Kingdom Bridge: ${dashboard.kingdomIndexLoaded ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    lines.push(`Concordance: ${dashboard.concordancePass === true ? '✅ PASS' : dashboard.concordancePass === false ? '❌ FAIL' : '⏳ NOT RUN'}`);
    lines.push(`Memory Checkpoint: ${dashboard.memoryCheckpoint || 'NONE'}`);
    lines.push(`System Health: ${healthStatus.healthy ? '✅ HEALTHY' : '⚠️ ISSUES: ' + healthStatus.issues.join('; ')}`);

    const reminder = dashboard.sessionCloseReminder;
    if (reminder.shouldRemind) {
      lines.push('');
      lines.push(`⏰ REMINDER: ${reminder.message}`);
    }

    lines.push('=== END FLYWHEEL STATE v2.0 ===');

    return lines.join('\n');
  }

  /** Export full state as JSON */
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
    if (savedState.memoryCheckpoint) this.state.memoryCheckpoint = savedState.memoryCheckpoint;
    if (savedState.kingdomIndexLoaded !== undefined) this.state.kingdomIndexLoaded = savedState.kingdomIndexLoaded;
    if (savedState.concordancePass !== undefined) this.state.concordancePass = savedState.concordancePass;

    console.log('⚙️ Orchestrator state restored — stage:', this.state.currentStage);
  }


// ── SECTION 12: FACTORY RESET + GLOBAL REGISTRATION ────────────────────────

  /** Factory reset — clear all runtime state, keep config */
  factoryReset(): void {
    this.stop();

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
        P7_KINGDOM: 0,
        P8_MEMORY: 0,
      },
      sessionStartTime: new Date().toISOString(),
      uptimeMs: 0,
      memoryCheckpoint: null,
      kingdomIndexLoaded: false,
      concordancePass: null,
    };

    this.eventLog = [];
    this.firedMilestones.clear();
    this.listeners.clear();

    console.log('⚙️ Flywheel Orchestrator v2.0 FACTORY RESET — all state cleared');
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
    kingdomBridgeActive: boolean;
    memoryProtected: boolean;
    concordanceStatus: boolean | null;
  } {
    const avgHealth = Object.values(this.state.pillarHealth).reduce((a, b) => a + b, 0) / 8;
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
      kingdomBridgeActive: this.state.kingdomIndexLoaded,
      memoryProtected: this.state.memoryCheckpoint !== null,
      concordanceStatus: this.state.concordancePass,
    };
  }

} // End FlywheelOrchestrator class


// ── GLOBAL REGISTRATION ─────────────────────────────────────────────────────

/**
 * Factory function — creates and registers the orchestrator globally.
 * Called by boot_sequence_v2_universal after all engines are initialized.
 *
 * Usage:
 *   const engines = { memoir, personality, help, backup, insights, pattern, vocab,
 *                     memory, conscience, heart, body, nervousSystem, voices,
 *                     cafe, labCoat, cache, speedRead };
 *   const orchestrator = createFlywheelOrchestrator(engines);
 *   orchestrator.start();
 */
function createFlywheelOrchestrator(
  engines: EngineRegistry,
  config?: Partial<OrchestratorConfig>
): FlywheelOrchestrator {
  const orchestrator = new FlywheelOrchestrator(engines, config);

  if (typeof window !== 'undefined') {
    (window as any)._FLYWHEEL_ORCHESTRATOR = orchestrator;
    console.log('⚙️ Flywheel Orchestrator v2.0 registered globally as window._FLYWHEEL_ORCHESTRATOR');
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

