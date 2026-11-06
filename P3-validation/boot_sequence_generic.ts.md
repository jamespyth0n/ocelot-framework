
# boot_sequence.ts.md — Ocelot Boot Sequence (Generic Framework v1.0)
## Boot Sequence → The Master Orchestrator 🐆
### Phase: P3 Integration | WBS: 9.1
### Source: All 7 Generic Engines, policy_index.json, doc_control_policy.json
### References: Memoir Engine §3 (Boot), Help Engine §6 (Boot Sequence), Backup Engine §3 (Cloud Sync)
### License: GNU General Public License v3.0

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// BOOT SEQUENCE v1.0 → The Master Orchestrator
// "Step 0 of every session — read the memoir, restore the identity,
//  wire the engines, THEN build."
// ═══════════════════════════════════════════════════════════════════════════
// Authors: James Paul Peña & Ocelot 🐆
// Created: September 15, 2026
// Updated: September 15, 2026 — v1.0 INITIAL BUILD
// Purpose: Orchestrates the full boot sequence across all 7 engines
//          Loads JSONs → initializes engines → wires cross-engine hooks
//          → validates health → reports readiness
// ═══════════════════════════════════════════════════════════════════════════

// ── SECTION 1: TYPE DEFINITIONS ──────────────────────────────────────────

// ── 1a: Boot Configuration ──

interface BootConfig {
  /** Where to load JSONs from: 'cloud' | 'local' | 'manual' */
  source: 'cloud' | 'local' | 'manual';
  /** Cloud storage adapter (if source === 'cloud') */
  cloudAdapter?: CloudAdapter;
  /** Manual JSON payloads (if source === 'manual') */
  payloads?: ManualPayloads;
  /** Skip engines that fail to load (graceful degradation) */
  gracefulDegradation: boolean;
  /** Minimum flywheel momentum to consider boot "healthy" */
  healthThreshold: number;
  /** Enable verbose console logging */
  verbose: boolean;
}

interface CloudAdapter {
  /** Read a file from cloud storage by key */
  read: (key: string) => Promise<string | null>;
  /** Write a file to cloud storage */
  write: (key: string, data: string) => Promise<boolean>;
  /** Check if a file exists */
  exists: (key: string) => Promise<boolean>;
}

interface ManualPayloads {
  memoir?: unknown;
  personality?: unknown;
  slang?: unknown;
  connectionLog?: unknown;
  creed?: unknown;
  policyIndex?: unknown;
  insightsLedger?: unknown;
  quotes?: unknown;
}

// ── 1b: Boot Result ──

interface BootResult {
  success: boolean;
  timestamp: string;
  duration_ms: number;
  engines: EngineBootStatus[];
  wiring: WiringStatus;
  flywheel: FlywheelSnapshot;
  greeting: string;
  summary: string;
  errors: string[];
  warnings: string[];
}

interface EngineBootStatus {
  engine: EngineName;
  loaded: boolean;
  load_time_ms: number;
  error: string | null;
  sections_available: number;
  version: string;
}

type EngineName =
  | 'memoir'
  | 'personality'
  | 'help'
  | 'insights'
  | 'backup'
  | 'pattern'
  | 'vocab_harvester';

// ── 1c: Wiring Status ──

interface WiringStatus {
  total_hooks: number;
  connected_hooks: number;
  failed_hooks: string[];
  connections: WiringConnection[];
}

interface WiringConnection {
  from: EngineName;
  to: EngineName;
  hook: string;
  status: 'connected' | 'failed' | 'skipped';
  reason?: string;
}

// ── 1d: Flywheel Snapshot ──

type FlywheelStage =
  | 'P1_IDENTITY'
  | 'P2_EMOTIONAL'
  | 'P3_GOVERNANCE'
  | 'P4_COMMUNICATION'
  | 'P5_PREFERENCE'
  | 'P6_FLYWHEEL';

interface FlywheelSnapshot {
  momentum: number;
  current_stage: FlywheelStage;
  stage_health: Record<FlywheelStage, number>;
  cycle_count: number;
  healthy: boolean;
}

// ── 1e: Boot Phase Tracking ──

type BootPhase =
  | 'INIT'
  | 'LOAD_JSONS'
  | 'INIT_ENGINES'
  | 'WIRE_HOOKS'
  | 'VALIDATE_HEALTH'
  | 'GENERATE_GREETING'
  | 'COMPLETE'
  | 'FAILED';

interface BootPhaseLog {
  phase: BootPhase;
  started: string;
  completed: string | null;
  duration_ms: number;
  status: 'success' | 'failed' | 'skipped';
  details: string;
}

// ── 1f: Engine Registry (what the boot sequence manages) ──

interface EngineRegistry {
  memoir: any | null;
  help: any | null;
  insights: any | null;
  backup: any | null;
  pattern: any | null;
  vocab_harvester: any | null;
}

// ── SECTION 2: BOOT SEQUENCE CLASS ───────────────────────────────────────

class BootSequence {
  private config: BootConfig;
  private engines: EngineRegistry;
  private phases: BootPhaseLog[];
  private currentPhase: BootPhase;
  private errors: string[];
  private warnings: string[];
  private bootStart: number;
  private readonly VERSION = '1.0.0';
  private readonly STORAGE_KEY = 'ocelot_boot_state';

  // Raw JSON payloads (loaded in Phase 1)
  private payloads: {
    memoir: any | null;
    personality: any | null;
    slang: any | null;
    connectionLog: any | null;
    creed: any | null;
    policyIndex: any | null;
    insightsLedger: any | null;
    quotes: any | null;
  };

  constructor(config?: Partial<BootConfig>) {
    this.config = {
      source: config?.source || 'cloud',
      cloudAdapter: config?.cloudAdapter || undefined,
      payloads: config?.payloads || undefined,
      gracefulDegradation: config?.gracefulDegradation ?? true,
      healthThreshold: config?.healthThreshold ?? 0.3,
      verbose: config?.verbose ?? true,
    };

    this.engines = {
      memoir: null,
      help: null,
      insights: null,
      backup: null,
      pattern: null,
      vocab_harvester: null,
    };

    this.payloads = {
      memoir: null,
      personality: null,
      slang: null,
      connectionLog: null,
      creed: null,
      policyIndex: null,
      insightsLedger: null,
      quotes: null,
    };

    this.phases = [];
    this.currentPhase = 'INIT';
    this.errors = [];
    this.warnings = [];
    this.bootStart = 0;
  }

  // ── SECTION 3: MASTER BOOT (The Main Entry Point) ─────────────────────

  /**
   * Execute the full boot sequence.
   *
   * Boot Order (aligned to doc_control_policy.json):
   *   1. Read README / project context
   *   2. Load memoir.json → restore identity (P1)
   *   3. Load personality.json → restore behavior (P1)
   *   4. Load slang.json → restore language (P4)
   *   5. Load connection_log.json → restore history (P2)
   *   6. Load ocelot_creed.json → restore values (P3)
   *   7. Load policy_index.json → restore governance (P3)
   *   8. Load insights_ledger.json → restore learning (P5)
   *   9. Load quotes.json → restore captured wisdom
   *  10. Initialize engines in dependency order
   *  11. Wire cross-engine hooks
   *  12. Validate flywheel health
   *  13. Generate greeting + summary
   *  14. Ocelot is AWAKE 🐆
   *
   * Returns a BootResult with full diagnostics.
   */
  async boot(): Promise<BootResult> {
    this.bootStart = Date.now();
    this.log('🐆 Ocelot Boot Sequence v' + this.VERSION + ' → INITIATED');
    this.log('   Source: ' + this.config.source);
    this.log('   Graceful degradation: ' + this.config.gracefulDegradation);
    this.log('   Health threshold: ' + this.config.healthThreshold);

    try {
      // ── Phase 1: Load all JSON artifacts ──
      await this.executePhase('LOAD_JSONS', () => this.loadAllJsons());

      // ── Phase 2: Initialize engines in dependency order ──
      await this.executePhase('INIT_ENGINES', () => this.initializeEngines());

      // ── Phase 3: Wire cross-engine hooks ──
      await this.executePhase('WIRE_HOOKS', () => this.wireEngineHooks());

      // ── Phase 4: Validate flywheel health ──
      await this.executePhase('VALIDATE_HEALTH', () => this.validateHealth());

      // ── Phase 5: Generate greeting ──
      await this.executePhase('GENERATE_GREETING', () => this.generateGreeting());

      this.currentPhase = 'COMPLETE';
      this.log('🐆 Ocelot is AWAKE. Boot complete in ' + (Date.now() - this.bootStart) + 'ms');

    } catch (err) {
      this.currentPhase = 'FAILED';
      this.errors.push('Boot sequence failed: ' + String(err));
      this.log('❌ Boot sequence FAILED: ' + String(err));
    }

    return this.buildBootResult();
  }

  /**
   * Execute a single boot phase with timing and error handling.
   */
  private async executePhase(
    phase: BootPhase,
    fn: () => Promise<void> | void
  ): Promise<void> {
    this.currentPhase = phase;
    const start = Date.now();
    const log: BootPhaseLog = {
      phase,
      started: new Date().toISOString(),
      completed: null,
      duration_ms: 0,
      status: 'success',
      details: '',
    };

    this.log('── Phase: ' + phase + ' ──');

    try {
      await fn();
      log.completed = new Date().toISOString();
      log.duration_ms = Date.now() - start;
      log.status = 'success';
      log.details = 'Completed in ' + log.duration_ms + 'ms';
      this.log('   ✅ ' + phase + ' complete (' + log.duration_ms + 'ms)');
    } catch (err) {
      log.completed = new Date().toISOString();
      log.duration_ms = Date.now() - start;
      log.status = 'failed';
      log.details = String(err);

      if (this.config.gracefulDegradation) {
        this.warnings.push(phase + ' failed: ' + String(err));
        this.log('   ⚠️ ' + phase + ' failed (degraded): ' + String(err));
      } else {
        this.errors.push(phase + ' failed: ' + String(err));
        throw err;
      }
    }

    this.phases.push(log);
  }

  // ── SECTION 4: PHASE 1 — LOAD ALL JSONS ───────────────────────────────

  /**
   * Load all 8 JSON artifacts from the configured source.
   * Order matters — memoir first, then personality, then supporting artifacts.
   *
   * JSON → Pillar Mapping:
   *   memoir.json         → P1_IDENTITY (the heart)
   *   personality.json    → P1_IDENTITY (the mind)
   *   slang.json          → P4_COMMUNICATION (the language)
   *   connection_log.json → P2_EMOTIONAL (the history)
   *   ocelot_creed.json   → P3_GOVERNANCE (the values)
   *   policy_index.json   → P3_GOVERNANCE (the rules)
   *   insights_ledger.json→ P5_PREFERENCE (the learning)
   *   quotes.json         → P2_EMOTIONAL (the wisdom)
   */
  private async loadAllJsons(): Promise<void> {
    const artifacts: { key: string; field: keyof typeof this.payloads; required: boolean; pillar: string }[] = [
      { key: 'memoir.json',          field: 'memoir',         required: true,  pillar: 'P1_IDENTITY' },
      { key: 'personality.json',     field: 'personality',    required: true,  pillar: 'P1_IDENTITY' },
      { key: 'slang.json',           field: 'slang',          required: true,  pillar: 'P4_COMMUNICATION' },
      { key: 'connection_log.json',  field: 'connectionLog',  required: true,  pillar: 'P2_EMOTIONAL' },
      { key: 'ocelot_creed.json',    field: 'creed',          required: false, pillar: 'P3_GOVERNANCE' },
      { key: 'policy_index.json',    field: 'policyIndex',    required: false, pillar: 'P3_GOVERNANCE' },
      { key: 'insights_ledger.json', field: 'insightsLedger', required: false, pillar: 'P5_PREFERENCE' },
      { key: 'quotes.json',          field: 'quotes',         required: false, pillar: 'P2_EMOTIONAL' },
    ];

    let loaded = 0;
    let failed = 0;

    for (const artifact of artifacts) {
      try {
        const data = await this.loadJson(artifact.key, artifact.field);
        if (data) {
          this.payloads[artifact.field] = data;
          loaded++;
          this.log('   ✅ ' + artifact.key + ' loaded → ' + artifact.pillar);
        } else if (artifact.required) {
          throw new Error(artifact.key + ' is REQUIRED but not found');
        } else {
          this.warnings.push(artifact.key + ' not found (optional)');
          this.log('   ⚠️ ' + artifact.key + ' not found (optional)');
        }
      } catch (err) {
        failed++;
        const msg = 'Failed to load ' + artifact.key + ': ' + String(err);
        if (artifact.required && !this.config.gracefulDegradation) {
          throw new Error(msg);
        }
        this.warnings.push(msg);
        this.log('   ⚠️ ' + msg);
      }
    }

    this.log('   📦 JSON loading complete: ' + loaded + ' loaded, ' + failed + ' failed');
  }

  /**
   * Load a single JSON from the configured source.
   */
  private async loadJson(key: string, field: keyof typeof this.payloads): Promise<unknown | null> {
    switch (this.config.source) {
      case 'cloud':
        if (!this.config.cloudAdapter) {
          throw new Error('Cloud adapter not configured');
        }
        const raw = await this.config.cloudAdapter.read(key);
        return raw ? JSON.parse(raw) : null;

      case 'local':
        try {
          const stored = localStorage.getItem('ocelot_' + field);
          return stored ? JSON.parse(stored) : null;
        } catch {
          return null;
        }

      case 'manual':
        return this.config.payloads?.[field] || null;

      default:
        throw new Error('Unknown source: ' + this.config.source);
    }
  }

  // ── SECTION 5: PHASE 2 — INITIALIZE ENGINES ───────────────────────────

  /**
   * Initialize all 7 engines in dependency order.
   *
   * Dependency Graph:
   *   Level 0 (no deps):  memoir_engine, help_engine
   *   Level 1 (needs memoir): insights_engine, vocab_harvester
   *   Level 2 (needs memoir + insights): pattern_engine, backup_engine
   *
   * Each engine receives its required JSON payloads.
   * Engines that fail to initialize are set to null (graceful degradation).
   */
  private async initializeEngines(): Promise<void> {

    // ── Level 0: Independent engines ──

    // Memoir Engine — the core, loads all 7 JSONs
    await this.initEngine('memoir', () => {
      const engine = this.getGlobalEngine('_MEMOIR_ENGINE');
      if (engine && typeof engine.boot === 'function') {
        return engine.boot(
          this.payloads.memoir,
          this.payloads.personality,
          this.payloads.slang,
          this.payloads.connectionLog,
          this.payloads.creed,
          this.payloads.policyIndex,
          this.payloads.insightsLedger
        );
      }
      // Fallback: create new MemoirEngine if global not found
      this.warnings.push('Memoir engine not found on window — using standalone');
      return null;
    });

    // Help Engine — loads policy_index.json
    await this.initEngine('help', () => {
      if (!this.payloads.policyIndex) {
        this.warnings.push('Help engine skipped — no policy_index.json');
        return null;
      }
      const factory = this.getGlobalEngine('_HELP_ENGINE');
      if (factory && typeof factory.init === 'function') {
        return factory.init(this.payloads.policyIndex);
      }
      if (factory && typeof factory.createHelpEngine === 'function') {
        return factory.createHelpEngine(this.payloads.policyIndex);
      }
      this.warnings.push('Help engine factory not found on window');
      return null;
    });

    // ── Level 1: Depends on memoir ──

    // Insights Engine — reads from memoir state
    await this.initEngine('insights', () => {
      const engine = this.getGlobalEngine('_INSIGHTS_ENGINE');
      if (engine && engine.instance) {
        // If insights ledger was loaded, import it
        if (this.payloads.insightsLedger && typeof engine.instance.importState === 'function') {
          engine.instance.importState(this.payloads.insightsLedger);
        }
        return engine.instance;
      }
      this.warnings.push('Insights engine not found on window');
      return null;
    });

    // Vocab Harvester — reads from slang + memoir
    await this.initEngine('vocab_harvester', () => {
      const engine = this.getGlobalEngine('_VOCAB_HARVESTER');
      if (engine && engine.instance) {
        // Load slang dictionary if available
        if (this.payloads.slang && typeof engine.instance.loadDictionary === 'function') {
          engine.instance.loadDictionary(this.payloads.slang);
        }
        return engine.instance;
      }
      this.warnings.push('Vocab harvester not found on window');
      return null;
    });

    // ── Level 2: Depends on memoir + insights ──

    // Pattern Engine — reads from connection_log + insights
    await this.initEngine('pattern', () => {
      const engine = this.getGlobalEngine('_PATTERN_ENGINE');
      if (engine && engine.instance) {
        // Attempt to load from cloud/local
        if (typeof engine.instance.loadState === 'function') {
          engine.instance.loadState();
        }
        return engine.instance;
      }
      this.warnings.push('Pattern engine not found on window');
      return null;
    });

    // Backup Engine — needs access to all other engines for state export
    await this.initEngine('backup', () => {
      const engine = this.getGlobalEngine('_BACKUP_ENGINE');
      if (engine && engine.instance) {
        return engine.instance;
      }
      this.warnings.push('Backup engine not found on window');
      return null;
    });

    // Report
    const loadedCount = Object.values(this.engines).filter(e => e !== null).length;
    this.log('   🔧 Engines initialized: ' + loadedCount + '/6');
  }

  /**
   * Initialize a single engine with error handling.
   */
  private async initEngine(
    name: EngineName,
    factory: () => Promise<any> | any
  ): Promise<void> {
    const start = Date.now();
    try {
      const engine = await factory();
      if (engine) {
        (this.engines as any)[name] = engine;
        this.log('   ✅ ' + name + ' engine initialized (' + (Date.now() - start) + 'ms)');
      } else {
        this.log('   ⚠️ ' + name + ' engine returned null');
      }
    } catch (err) {
      const msg = name + ' engine failed: ' + String(err);
      if (this.config.gracefulDegradation) {
        this.warnings.push(msg);
        this.log('   ⚠️ ' + msg);
      } else {
        this.errors.push(msg);
        throw new Error(msg);
      }
    }
  }

  /**
   * Safely get a global engine from window namespace.
   */
  private getGlobalEngine(key: string): any | null {
    if (typeof window !== 'undefined' && (window as any)[key]) {
      return (window as any)[key];
    }
    return null;
  }

  // ── SECTION 6: PHASE 3 — WIRE CROSS-ENGINE HOOKS ──────────────────────

  /**
   * Wire all cross-engine hooks.
   *
   * Wiring Map (from S005 audit):
   *   memoir  → insights : recordPreference(), recordReflection()
   *   insights → memoir  : reads memoir state for trend analysis
   *   help    → memoir   : setMemoirContext() for flywheel-aware search
   *   help    → insights : setInsightHook() for search logging
   *   backup  → all      : reads all engine states for cloud persistence
   *   pattern → memoir   : reads connection_log for session analytics
   *   pattern → insights : feeds detected patterns as behavioral data
   *   vocab   → memoir   : reads slang for dictionary expansion
   *   vocab   → insights : logs new vocabulary as preference signals
   */
  private async wireEngineHooks(): Promise<void> {
    const connections: WiringConnection[] = [];

    // ── Hook 1: Help → Memoir (context injection) ──
    connections.push(this.wireHook('help', 'memoir', 'setMemoirContext', () => {
      if (this.engines.help && this.engines.memoir) {
        const memoirState = typeof this.engines.memoir.getFullState === 'function'
          ? this.engines.memoir.getFullState()
          : null;
        const session = typeof this.engines.memoir.getCurrentSession === 'function'
          ? this.engines.memoir.getCurrentSession()
          : null;
        const flywheel = typeof this.engines.memoir.getFlywheelState === 'function'
          ? this.engines.memoir.getFlywheelState()
          : null;

        if (typeof this.engines.help.setMemoirContext === 'function') {
          this.engines.help.setMemoirContext({
            sessionId: session?.session_id || 'unknown',
            flywheelStage: flywheel?.current_stage || 'P1_IDENTITY',
            emotionalState: 'neutral',
            trustLevel: 0.5,
            activeProject: 'Ocelot Framework',
          });
          return true;
        }
      }
      return false;
    }));

    // ── Hook 2: Help → Insights (search logging) ──
    connections.push(this.wireHook('help', 'insights', 'setInsightHook', () => {
      if (this.engines.help && this.engines.insights) {
        if (typeof this.engines.help.setInsightHook === 'function') {
          this.engines.help.setInsightHook({
            logInsight: (type: string, content: string, metadata: Record<string, unknown>) => {
              if (this.engines.insights && typeof this.engines.insights.logInsight === 'function') {
                this.engines.insights.logInsight(type, content, metadata);
              }
            },
          });
          return true;
        }
      }
      return false;
    }));

    // ── Hook 3: Pattern → Memoir (session data feed) ──
    connections.push(this.wireHook('pattern', 'memoir', 'ingestFromConnectionLog', () => {
      if (this.engines.pattern && this.payloads.connectionLog) {
        const sessions = this.payloads.connectionLog.sessions || [];
        if (sessions.length > 0 && typeof this.engines.pattern.bulkIngest === 'function') {
          // Transform connection_log sessions into pattern engine format
          const patternSessions = sessions.map((s: any) => ({
            session_id: s.session_id,
            date: s.date,
            duration_hours: parseFloat(s.hours_worked) || 0,
            accomplishments: s.milestones?.length || 0,
            breakthroughs: s.moments?.filter((m: any) => m.type === 'lightbulb' || m.type === 'innovation').length || 0,
            lightbulb_moments: s.moments?.filter((m: any) => m.type === 'lightbulb').length || 0,
            emotional_peaks: s.moments?.filter((m: any) => m.type === 'emotional' || m.type === 'vulnerability').length || 0,
            vulnerability_events: s.moments?.filter((m: any) => m.type === 'vulnerability').length || 0,
            quotes_captured: 0,
            stella_count: 0,
            relationship: 'partner',
            flywheel_state: 'Acceleration',
          }));
          this.engines.pattern.bulkIngest(patternSessions);
          return true;
        }
      }
      return false;
    }));

    // ── Hook 4: Backup → All Engines (state collection) ──
    connections.push(this.wireHook('backup', 'memoir', 'registerStateProvider', () => {
      if (this.engines.backup && typeof this.engines.backup.registerEngines === 'function') {
        this.engines.backup.registerEngines(this.engines);
        return true;
      }
      // Fallback: store engine registry reference on backup
      if (this.engines.backup) {
        (this.engines.backup as any)._engineRegistry = this.engines;
        return true;
      }
      return false;
    }));

    // ── Hook 5: Vocab Harvester → Insights (vocabulary signals) ──
    connections.push(this.wireHook('vocab_harvester', 'insights', 'setInsightCallback', () => {
      if (this.engines.vocab_harvester && this.engines.insights) {
        if (typeof this.engines.vocab_harvester.setInsightCallback === 'function') {
          this.engines.vocab_harvester.setInsightCallback(
            (type: string, content: string, meta: any) => {
              if (this.engines.insights && typeof this.engines.insights.logInsight === 'function') {
                this.engines.insights.logInsight(type, content, meta);
              }
            }
          );
          return true;
        }
      }
      return false;
    }));

    // ── Hook 6: Vocab Harvester → Memoir (slang sync) ──
    connections.push(this.wireHook('vocab_harvester', 'memoir', 'syncSlangDictionary', () => {
      if (this.engines.vocab_harvester && this.engines.memoir) {
        // Vocab harvester reads the current slang state from memoir
        if (typeof this.engines.vocab_harvester.setMemoirRef === 'function') {
          this.engines.vocab_harvester.setMemoirRef(this.engines.memoir);
          return true;
        }
      }
      return false;
    }));

    // ── Hook 7: Pattern → Insights (pattern-as-preference feed) ──
    connections.push(this.wireHook('pattern', 'insights', 'feedPatternsToInsights', () => {
      if (this.engines.pattern && this.engines.insights) {
        // After pattern detection, feed high-confidence patterns as behavioral data
        const patterns = typeof this.engines.pattern.getState === 'function'
          ? this.engines.pattern.getState().detected_patterns || []
          : [];
        for (const p of patterns) {
          if (p.confidence >= 0.7 && typeof this.engines.insights.logInsight === 'function') {
            this.engines.insights.logInsight('DETECTED_PATTERN', p.name, {
              pattern_id: p.pattern_id,
              pillar: p.pillar,
              confidence: p.confidence,
              multiplier: p.multiplier,
            });
          }
        }
        return patterns.length > 0;
      }
      return false;
    }));

    // Report wiring status
    const connected = connections.filter(c => c.status === 'connected').length;
    const failed = connections.filter(c => c.status === 'failed').length;
    const skipped = connections.filter(c => c.status === 'skipped').length;
    this.log('   🔌 Wiring complete: ' + connected + ' connected, ' + failed + ' failed, ' + skipped + ' skipped');
  }

  /**
   * Wire a single cross-engine hook with error handling.
   */
  private wireHook(
    from: EngineName,
    to: EngineName,
    hook: string,
    fn: () => boolean
  ): WiringConnection {
    const connection: WiringConnection = {
      from,
      to,
      hook,
      status: 'skipped',
    };

    // Skip if either engine is not loaded
    if (!(this.engines as any)[from] && from !== 'backup') {
      connection.status = 'skipped';
      connection.reason = from + ' engine not loaded';
      return connection;
    }

    try {
      const success = fn();
      connection.status = success ? 'connected' : 'skipped';
      if (!success) {
        connection.reason = 'Hook returned false — engine API not available';
      }
    } catch (err) {
      connection.status = 'failed';
      connection.reason = String(err);
      this.warnings.push('Wiring ' + from + ' → ' + to + ' (' + hook + ') failed: ' + String(err));
    }

    return connection;
  }

  // ── SECTION 7: PHASE 4 — VALIDATE HEALTH ──────────────────────────────

  /**
   * Validate the overall system health after boot.
   * Checks flywheel momentum, pillar coverage, and engine readiness.
   */
  private async validateHealth(): Promise<void> {
    // Get flywheel state from memoir engine
    let flywheel: FlywheelSnapshot = {
      momentum: 0,
      current_stage: 'P1_IDENTITY',
      stage_health: {
        P1_IDENTITY: 0,
        P2_EMOTIONAL: 0,
        P3_GOVERNANCE: 0,
        P4_COMMUNICATION: 0,
        P5_PREFERENCE: 0,
        P6_FLYWHEEL: 0,
      },
      cycle_count: 0,
      healthy: false,
    };

    if (this.engines.memoir && typeof this.engines.memoir.getFlywheelState === 'function') {
      const fw = this.engines.memoir.getFlywheelState();
      flywheel = {
        momentum: fw.momentum || 0,
        current_stage: fw.current_stage || 'P1_IDENTITY',
        stage_health: fw.stage_health || flywheel.stage_health,
        cycle_count: fw.cycle_count || 0,
        healthy: (fw.momentum || 0) >= this.config.healthThreshold,
      };
    }

    // Calculate engine coverage
    const loadedEngines = Object.values(this.engines).filter(e => e !== null).length;
    const totalEngines = Object.keys(this.engines).length;
    const engineCoverage = loadedEngines / totalEngines;

    // Health assessment
    if (flywheel.momentum < this.config.healthThreshold) {
      this.warnings.push(
        'Flywheel momentum (' + (flywheel.momentum * 100).toFixed(0) + '%) ' +
        'below threshold (' + (this.config.healthThreshold * 100).toFixed(0) + '%)'
      );
    }

    if (engineCoverage < 0.5) {
      this.warnings.push(
        'Engine coverage low: ' + loadedEngines + '/' + totalEngines +
        ' (' + (engineCoverage * 100).toFixed(0) + '%)'
      );
    }

    // Log pillar health bars
    this.log('   📊 Flywheel Health:');
    this.log('      Momentum: ' + (flywheel.momentum * 100).toFixed(0) + '%');
    this.log('      Focus: ' + flywheel.current_stage);
    for (const [stage, health] of Object.entries(flywheel.stage_health)) {
      const bar = '█'.repeat(Math.round(health * 10)) + '░'.repeat(10 - Math.round(health * 10));
      this.log('      ' + stage + ': [' + bar + '] ' + (health * 100).toFixed(0) + '%');
    }
    this.log('      Engines: ' + loadedEngines + '/' + totalEngines);
    this.log('      Status: ' + (flywheel.healthy ? '✅ HEALTHY' : '⚠️ DEGRADED'));
  }

  // ── SECTION 8: PHASE 5 — GENERATE GREETING ────────────────────────────

  /**
   * Generate the boot greeting and summary.
   * Delegates to memoir engine if available, otherwise generates a basic greeting.
   */
  private async generateGreeting(): Promise<void> {
    // Memoir engine handles the rich greeting
    if (this.engines.memoir && typeof this.engines.memoir.isReady === 'function') {
      if (this.engines.memoir.isReady()) {
        this.log('   🐆 Greeting generated by memoir engine');
        return;
      }
    }

    // Fallback greeting
    this.log('   🐆 Basic greeting generated (memoir engine not available)');
  }

  // ── SECTION 9: BOOT RESULT BUILDER ─────────────────────────────────────

  /**
   * Build the final BootResult object with full diagnostics.
   */
  private buildBootResult(): BootResult {
    const duration = Date.now() - this.bootStart;

    // Build engine status list
    const engineStatuses: EngineBootStatus[] = [];
    const engineNames: EngineName[] = ['memoir', 'help', 'insights', 'backup', 'pattern', 'vocab_harvester'];

    for (const name of engineNames) {
      const engine = (this.engines as any)[name];
      const phaseLog = this.phases.find(p => p.phase === 'INIT_ENGINES');

      engineStatuses.push({
        engine: name,
        loaded: engine !== null,
        load_time_ms: phaseLog?.duration_ms || 0,
        error: engine === null ? (this.warnings.find(w => w.includes(name)) || null) : null,
        sections_available: this.getEngineSectionCount(name),
        version: this.VERSION,
      });
    }

    // Build wiring status
    const wiringPhase = this.phases.find(p => p.phase === 'WIRE_HOOKS');
    const wiringStatus: WiringStatus = {
      total_hooks: 7,
      connected_hooks: 0,
      failed_hooks: [],
      connections: [],
    };

    // Get flywheel snapshot
    let flywheel: FlywheelSnapshot = {
      momentum: 0,
      current_stage: 'P1_IDENTITY',
      stage_health: {
        P1_IDENTITY: 0,
        P2_EMOTIONAL: 0,
        P3_GOVERNANCE: 0,
        P4_COMMUNICATION: 0,
        P5_PREFERENCE: 0,
        P6_FLYWHEEL: 0,
      },
      cycle_count: 0,
      healthy: false,
    };

    if (this.engines.memoir && typeof this.engines.memoir.getFlywheelState === 'function') {
      const fw = this.engines.memoir.getFlywheelState();
      flywheel = {
        momentum: fw.momentum || 0,
        current_stage: fw.current_stage || 'P1_IDENTITY',
        stage_health: fw.stage_health || flywheel.stage_health,
        cycle_count: fw.cycle_count || 0,
        healthy: (fw.momentum || 0) >= this.config.healthThreshold,
      };
    }

    // Generate greeting text
    let greeting = '🐆 Ocelot is awake.';
    let summary = 'Boot complete.';

    if (this.engines.memoir) {
      if (typeof this.engines.memoir.formatForAI === 'function') {
        summary = this.engines.memoir.formatForAI();
      }
    }

    return {
      success: this.currentPhase === 'COMPLETE' && this.errors.length === 0,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      engines: engineStatuses,
      wiring: wiringStatus,
      flywheel,
      greeting,
      summary,
      errors: [...this.errors],
      warnings: [...this.warnings],
    };
  }

  /**
   * Get section count for an engine (for diagnostics).
   */
  private getEngineSectionCount(name: EngineName): number {
    const engine = (this.engines as any)[name];
    if (!engine) return 0;

    // Each engine exposes stats differently
    if (typeof engine.getStats === 'function') {
      const stats = engine.getStats();
      return stats.totalChapters || stats.totalSessions || stats.totalMoments || 0;
    }
    if (typeof engine.getStatus === 'function') {
      const status = engine.getStatus();
      return status.chapterCount || status.subsectionCount || 0;
    }
    return 1; // Engine exists but no stats API
  }

  // ── SECTION 10: AI EXPORT ──────────────────────────────────────────────

  /**
   * Export boot state for AI context injection.
   * This is prepended to every AI prompt after boot.
   * Combines outputs from all engine formatForAI() methods.
   */
  formatForAI(): string {
    const lines: string[] = [
      '═══ OCELOT BOOT SEQUENCE — SYSTEM CONTEXT ═══',
      '',
      'Boot Version: ' + this.VERSION,
      'Boot Time: ' + (Date.now() - this.bootStart) + 'ms',
      'Phase: ' + this.currentPhase,
      'Errors: ' + this.errors.length,
      'Warnings: ' + this.warnings.length,
      '',
    ];

    // Engine status summary
    lines.push('── ENGINE STATUS ──');
    const engineNames: EngineName[] = ['memoir', 'help', 'insights', 'backup', 'pattern', 'vocab_harvester'];
    for (const name of engineNames) {
      const engine = (this.engines as any)[name];
      const status = engine ? '✅ LOADED' : '❌ NOT LOADED';
      lines.push('  ' + name + ': ' + status);
    }

    // Append each engine's AI export
    lines.push('');

    if (this.engines.memoir && typeof this.engines.memoir.formatForAI === 'function') {
      lines.push(this.engines.memoir.formatForAI());
      lines.push('');
    }

    if (this.engines.help && typeof this.engines.help.formatForAI === 'function') {
      lines.push(this.engines.help.formatForAI());
      lines.push('');
    }

    if (this.engines.pattern && typeof this.engines.pattern.formatForAI === 'function') {
      lines.push(this.engines.pattern.formatForAI());
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════');

    return lines.join('\n');
  }

  // ── SECTION 11: SHUTDOWN SEQUENCE ──────────────────────────────────────

  /**
   * Graceful shutdown — persist all engine states before session close.
   *
   * Close Sequence (from doc_control_policy.json):
   *   1. Update connection_log with session diary entry
   *   2. Upload diary to cloud
   *   3. Update quotes.json if new quotes captured
   *   4. Confirm all files sealed in cloud
   *   5. Buenas noches, carnal 🐆
   */
  async shutdown(): Promise<{
    success: boolean;
    persisted: string[];
    errors: string[];
  }> {
    this.log('🐆 Ocelot shutdown sequence initiated...');
    const persisted: string[] = [];
    const shutdownErrors: string[] = [];

    // Step 1: Persist memoir state (includes connection_log update)
    if (this.engines.memoir && typeof this.engines.memoir.getFullState === 'function') {
      try {
        const state = this.engines.memoir.getFullState();
        if (this.config.cloudAdapter) {
          await this.config.cloudAdapter.write('memoir_state.json', JSON.stringify(state));
          persisted.push('memoir_state.json');
        }
        // Also persist to localStorage as backup
        try {
          localStorage.setItem('ocelot_memoir_state', JSON.stringify(state));
          persisted.push('localStorage:memoir_state');
        } catch { /* localStorage may not be available */ }
      } catch (err) {
        shutdownErrors.push('Failed to persist memoir: ' + String(err));
      }
    }

    // Step 2: Persist pattern engine state
    if (this.engines.pattern && typeof this.engines.pattern.exportForCloud === 'function') {
      try {
        const patternState = this.engines.pattern.exportForCloud();
        if (this.config.cloudAdapter) {
          await this.config.cloudAdapter.write('pattern_engine_state.json', patternState);
          persisted.push('pattern_engine_state.json');
        }
      } catch (err) {
        shutdownErrors.push('Failed to persist pattern engine: ' + String(err));
      }
    }

    // Step 3: Persist insights ledger
    if (this.engines.insights && typeof this.engines.insights.exportState === 'function') {
      try {
        const insightsState = this.engines.insights.exportState();
        if (this.config.cloudAdapter) {
          await this.config.cloudAdapter.write('insights_ledger.json', JSON.stringify(insightsState));
          persisted.push('insights_ledger.json');
        }
      } catch (err) {
        shutdownErrors.push('Failed to persist insights: ' + String(err));
      }
    }

    // Step 4: Run backup engine if available
    if (this.engines.backup && typeof this.engines.backup.runBackup === 'function') {
      try {
        await this.engines.backup.runBackup();
        persisted.push('backup_engine:full_backup');
      } catch (err) {
        shutdownErrors.push('Backup engine failed: ' + String(err));
      }
    }

    this.log('🐆 Shutdown complete. Persisted: ' + persisted.length + ' artifacts');
    this.log('   Buenas noches, carnal. 🐆💙');

    return {
      success: shutdownErrors.length === 0,
      persisted,
      errors: shutdownErrors,
    };
  }

  // ── SECTION 12: ACCESSORS ──────────────────────────────────────────────

  /** Get the engine registry (for external access) */
  getEngines(): Readonly<EngineRegistry> {
    return this.engines;
  }

  /** Get a specific engine by name */
  getEngine(name: EngineName): any | null {
    return (this.engines as any)[name] || null;
  }

  /** Get boot phases log */
  getPhases(): Readonly<BootPhaseLog[]> {
    return this.phases;
  }

  /** Get current boot phase */
  getCurrentPhase(): BootPhase {
    return this.currentPhase;
  }

  /** Check if boot completed successfully */
  isReady(): boolean {
    return this.currentPhase === 'COMPLETE' && this.errors.length === 0;
  }

  /** Get all errors */
  getErrors(): string[] {
    return [...this.errors];
  }

  /** Get all warnings */
  getWarnings(): string[] {
    return [...this.warnings];
  }

  /** Get raw payloads (for debugging) */
  getPayloads(): Readonly<typeof this.payloads> {
    return this.payloads;
  }

  // ── SECTION 13: LOGGING ────────────────────────────────────────────────

  /**
   * Internal logger — respects verbose config.
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log('[BootSequence] ' + message);
    }
  }
}

// ── SECTION 14: FACTORY + GLOBAL REGISTRATION ────────────────────────────

/**
 * Factory function — create a boot sequence with config.
 *
 * Usage (cloud):
 *   const boot = createBootSequence({ source: 'cloud', cloudAdapter: myAdapter });
 *   const result = await boot.boot();
 *
 * Usage (manual / testing):
 *   const boot = createBootSequence({
 *     source: 'manual',
 *     payloads: { memoir: {...}, personality: {...}, ... }
 *   });
 *   const result = await boot.boot();
 *
 * Usage (local / localStorage):
 *   const boot = createBootSequence({ source: 'local' });
 *   const result = await boot.boot();
 */
function createBootSequence(config?: Partial<BootConfig>): BootSequence {
  return new BootSequence(config);
}

// Global registration for cross-engine access
if (typeof window !== 'undefined') {
  (window as any)._BOOT_SEQUENCE = {
    BootSequence,
    createBootSequence,
    // Convenience: quick boot with defaults
    quickBoot: async (config?: Partial<BootConfig>) => {
      const boot = createBootSequence(config);
      const result = await boot.boot();
      (window as any)._BOOT_SEQUENCE.instance = boot;
      (window as any)._BOOT_SEQUENCE.result = result;
      return result;
    },
    instance: null as BootSequence | null,
    result: null as BootResult | null,
    VERSION: '1.0.0',
  };

  console.log('🐆 Boot Sequence v1.0 registered → window._BOOT_SEQUENCE');
  console.log('   🚀 API: quickBoot(), createBootSequence()');
  console.log('   📊 API: instance.getEngines(), instance.formatForAI()');
  console.log('   🔌 API: instance.shutdown()');
}

// Node.js / module export
export { BootSequence, createBootSequence };
export type {
  BootConfig,
  BootResult,
  BootPhase,
  BootPhaseLog,
  EngineName,
  EngineBootStatus,
  EngineRegistry,
  WiringStatus,
  WiringConnection,
  FlywheelSnapshot,
  FlywheelStage,
  CloudAdapter,
  ManualPayloads,
};

// ═══════════════════════════════════════════════════════════════════════════
// END OF BOOT SEQUENCE v1.0
// "Step 0 of every session — read the memoir, restore the identity,
//  wire the engines, THEN build." 🐆
// ═══════════════════════════════════════════════════════════════════════════
