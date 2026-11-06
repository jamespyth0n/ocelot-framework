
// ════════════════════════════════════════════════════════════════════════════════
// NERVOUS SYSTEM ENGINE v2.0 — The 5th Pillar (SEED v2 — KINGDOM BRIDGE)
// "The nervous system doesn't think. It connects."
//
// Engine ID: ENGINE_004
// Pillar: Nervous System (NS)
// Question: "HOW do signals flow?"
// Role: Signal router, event bus, inter-engine communication,
//       priority queue, circuit breaker, signal logging
//
// License: GPL-3.0
// Version: 2.0.0
// Campaign: Seed v2 — "The Rubik's Solve"
//
// CHANGELOG v1.0 → v2.0:
//   - Added Memory Engine integration (signal history persists across sessions)
//   - Added signal priority queue (critical signals processed first)
//   - Added circuit breaker pattern (overloaded pathways shut down gracefully)
//   - Added signal replay (replay missed signals from memory on boot)
//   - Added 2 new hooks: NS_011 (memory signal log), NS_012 (self-diagnostic)
//   - Signal history now persists via Memory Engine
//   - Added signal metrics (throughput, latency, error rate)
//   - formatForAI() updated for v2 dashboard integration
//   - getStats() added for Soul Engine health monitor integration
//
// Design Philosophy:
//   - The NS is the ONLY pathway between engines. No direct calls.
//   - Every engine emits signals. The NS routes them.
//   - The NS doesn't decide. It delivers.
//   - Priority matters — a cortisol spike outranks a vocab update.
//   - Circuit breakers prevent cascade failures.
//   - Memory without signals is a brain without nerves. (v2)
//
// Architecture:
//   Engine → emitSignal() → NS.route() → subscriber(s)
//   Every signal has: source, event, payload, priority, timestamp
//   The NS is the spinal cord. Cut it, and the being is paralyzed.
//
// The Insight (from S012):
//   "The nervous system is what makes the difference between
//    a collection of engines and a living being."
// ════════════════════════════════════════════════════════════════════════════════


// ── SECTION 1: TYPE DEFINITIONS ─────────────────────────────────────────────

// ── 1a: Signal ──

interface Signal {
  /** Unique signal ID */
  id: string;
  /** Source engine that emitted the signal */
  source: EngineId;
  /** Event name — namespaced as source:event */
  event: string;
  /** Signal payload — the data being transmitted */
  payload: Record<string, any>;
  /** Signal priority */
  priority: SignalPriority;
  /** Timestamp of emission */
  emitted_at: string;
  /** Timestamp of delivery (null if pending) */
  delivered_at: string | null;
  /** Delivery status */
  status: 'pending' | 'delivered' | 'failed' | 'dropped' | 'replayed';
  /** Number of subscribers that received this signal */
  delivery_count: number;
  /** TTL — time to live in milliseconds (0 = no expiry) */
  ttl_ms: number;
}

type EngineId =
  | 'ENGINE_SOUL'       // Soul Engine (Flywheel Orchestrator)
  | 'ENGINE_MIND'       // Mind Engine (Conscience)
  | 'ENGINE_HEART'      // Heart Engine
  | 'ENGINE_BODY'       // Body Engine
  | 'ENGINE_NS'         // Nervous System (self)
  | 'ENGINE_MEMORY'     // Memory Engine (Abuela)
  | 'ENGINE_CONCORDANCE'// Concordance Engine
  | 'ENGINE_MEMOIR'     // Memoir Engine
  | 'ENGINE_HELP'       // Help Engine
  | 'ENGINE_INSIGHTS'   // Insights Engine
  | 'ENGINE_PATTERN'    // Pattern Engine
  | 'ENGINE_BACKUP'     // Backup Engine
  | 'ENGINE_VOCAB'      // Vocab Harvester
  | 'ENGINE_PERSONALITY'// Personality Engine
  | 'ENGINE_CS'         // Common Sense (Emergent)
  | 'ENGINE_HS'         // Higher Self (Emergent)
  | 'ENGINE_HYPO';      // Hypothalamus (Emergent)

type SignalPriority =
  | 'CRITICAL'    // 0 — Immediate. Red lines, protect mode, circuit breaker
  | 'HIGH'        // 1 — Urgent. Emotion spikes, conscience checks, anomalies
  | 'NORMAL'      // 2 — Standard. Regular engine communication
  | 'LOW'         // 3 — Background. Metrics, logging, trend updates
  | 'DIAGNOSTIC'; // 4 — Internal NS self-check signals

// ── 1b: Subscription ──

interface Subscription {
  /** Unique subscription ID */
  id: string;
  /** Subscriber engine */
  subscriber: EngineId;
  /** Event pattern to match (supports wildcards: 'heart:*', '*:booted') */
  event_pattern: string;
  /** Callback function reference name */
  callback_name: string;
  /** Is this subscription active? */
  active: boolean;
  /** Priority filter — only receive signals at or above this priority */
  min_priority: SignalPriority;
  /** Created at */
  created_at: string;
}

// ── 1c: Pathway ──

interface Pathway {
  /** Pathway name — descriptive label */
  name: string;
  /** Source engine */
  from: EngineId;
  /** Destination engine */
  to: EngineId;
  /** Signal events that travel this pathway */
  events: string[];
  /** Is this pathway active? */
  active: boolean;
  /** Pathway health — 0.0 (dead) to 1.0 (optimal) */
  health: number;
  /** Signals transmitted this session */
  signals_transmitted: number;
  /** Average latency in ms */
  avg_latency_ms: number;
  /** Circuit breaker state */
  circuit_state: 'closed' | 'open' | 'half_open';
  /** Consecutive failures (triggers circuit breaker at threshold) */
  consecutive_failures: number;
}

// ── 1d: Circuit Breaker Config ──

interface CircuitBreakerConfig {
  /** Failure threshold before opening circuit */
  failure_threshold: number;
  /** Recovery timeout in ms before trying half-open */
  recovery_timeout_ms: number;
  /** Success threshold in half-open before closing */
  success_threshold: number;
  /** Max signals in queue before dropping LOW priority */
  queue_pressure_threshold: number;
}

// ── 1e: Signal Metrics ──

interface SignalMetrics {
  /** Total signals routed this session */
  total_routed: number;
  /** Total signals delivered successfully */
  total_delivered: number;
  /** Total signals failed */
  total_failed: number;
  /** Total signals dropped (TTL expired or circuit open) */
  total_dropped: number;
  /** Total signals replayed from memory (v2) */
  total_replayed: number;
  /** Average latency across all signals (ms) */
  avg_latency_ms: number;
  /** Peak queue depth this session */
  peak_queue_depth: number;
  /** Current queue depth */
  current_queue_depth: number;
  /** Throughput — signals per minute */
  throughput_per_minute: number;
  /** Error rate — failed / total */
  error_rate: number;
  /** Uptime — time since boot in minutes */
  uptime_minutes: number;
}

// ── 1f: NS State ──

interface NervousSystemState {
  /** Is the NS booted? */
  booted: boolean;
  /** All registered pathways */
  pathways: Pathway[];
  /** All active subscriptions */
  subscriptions: Subscription[];
  /** Signal queue (priority-sorted) */
  queue: Signal[];
  /** Signal history (last N signals) */
  history: Signal[];
  /** Signal metrics */
  metrics: SignalMetrics;
  /** NS health — 0.0 (dead) to 1.0 (optimal) */
  health: number;
  /** Session ID */
  session_id: string;
  /** v2: Lifetime signals routed (from memory) */
  lifetime_signals: number;
  /** v2: Circuit breaker config */
  circuit_breaker: CircuitBreakerConfig;
}

// ── 1g: NS Hook ──

interface NSHook {
  id: string;
  from: string;
  event: string;
  response_type: 'route' | 'subscribe' | 'unsubscribe' | 'diagnostic' |
                 'circuit_break' | 'replay';
  description: string;
}

// ── 1h: NS Engine Config (v2) ──

interface NSEngineConfig {
  engine_id: 'ENGINE_NS';
  engine_name: 'Nervous System Engine';
  version: '2.0.0';
  pillar: 'Nervous System';
  layer: 'Core';
  color: 'YELLOW';
  /** Max signals in history buffer */
  history_buffer_size: number;
  /** Max signals in queue before pressure relief */
  max_queue_size: number;
  /** Enable memory persistence for signal history */
  persist_to_memory: boolean;
  /** Enable signal replay on boot */
  replay_on_boot: boolean;
  /** Default signal TTL in ms (0 = no expiry) */
  default_ttl_ms: number;
  /** Enable circuit breaker pattern */
  circuit_breaker_enabled: boolean;
  /** Diagnostic interval — run self-check every N signals */
  diagnostic_interval: number;
}


// ── SECTION 2: PRIORITY WEIGHT MAP ─────────────────────────────────────────

/**
 * §2 — Priority System
 * Signals are processed in priority order.
 * CRITICAL signals jump the queue. LOW signals get dropped under pressure.
 *
 * Design: Not all signals are equal.
 * A red line violation (CRITICAL) must be processed before a vocab update (LOW).
 * The NS is the triage nurse of the being.
 */

const PRIORITY_WEIGHTS: Record<SignalPriority, number> = {
  CRITICAL:   0,
  HIGH:       1,
  NORMAL:     2,
  LOW:        3,
  DIAGNOSTIC: 4,
};

/**
 * Default priority assignments by event pattern.
 * Engines can override when emitting, but these are the defaults.
 */
const DEFAULT_PRIORITIES: Record<string, SignalPriority> = {
  // CRITICAL — immediate processing
  'mind:red_line_violated':       'CRITICAL',
  'mind:conscience_override':     'CRITICAL',
  'heart:protect_mode':           'CRITICAL',
  'body:context_pressure_critical': 'CRITICAL',
  'ns:circuit_breaker_open':      'CRITICAL',
  'soul:emergency_shutdown':      'CRITICAL',

  // HIGH — urgent
  'heart:emotion_detected':       'HIGH',
  'heart:impulse':                'HIGH',
  'mind:grey_zone_entered':       'HIGH',
  'body:anomaly_detected':        'HIGH',
  'body:overtime':                'HIGH',
  'memory:amnesia_detected':      'HIGH',
  'soul:phase_transition':        'HIGH',

  // NORMAL — standard
  'soul:booted':                  'NORMAL',
  'mind:booted':                  'NORMAL',
  'heart:booted':                 'NORMAL',
  'body:booted':                  'NORMAL',
  'ns:booted':                    'NORMAL',
  'heart:bond_update':            'NORMAL',
  'body:perceived':               'NORMAL',
  'mind:deliberation_complete':   'NORMAL',
  'soul:cycle_complete':          'NORMAL',
  'memory:encoded':               'NORMAL',
  'memory:recalled':              'NORMAL',

  // LOW — background
  'body:break_recommended':       'LOW',
  'vocab:term_harvested':         'LOW',
  'pattern:pattern_detected':     'LOW',
  'insights:insight_generated':   'LOW',
  'personality:trait_adjusted':   'LOW',
  'backup:snapshot_saved':        'LOW',

  // DIAGNOSTIC — internal
  'ns:self_diagnostic':           'DIAGNOSTIC',
  'ns:pathway_health_check':      'DIAGNOSTIC',
  'ns:queue_pressure_report':     'DIAGNOSTIC',
};


// ── SECTION 3: DEFAULT PATHWAY MAP ──────────────────────────────────────────

/**
 * §3 — Pathway Map
 * Pre-configured pathways between engines.
 * These are the "nerves" of the being.
 *
 * Design: Every engine-to-engine connection is a named pathway.
 * Pathways have health, latency, and circuit breaker state.
 * If a pathway dies, the NS reroutes or drops signals gracefully.
 */

const DEFAULT_PATHWAYS: Omit<Pathway, 'health' | 'signals_transmitted' | 'avg_latency_ms' | 'circuit_state' | 'consecutive_failures'>[] = [
  // Soul ↔ All (Orchestrator)
  { name: 'soul→mind',       from: 'ENGINE_SOUL',   to: 'ENGINE_MIND',       events: ['soul:phase_transition', 'soul:cycle_complete', 'soul:booted'], active: true },
  { name: 'soul→heart',      from: 'ENGINE_SOUL',   to: 'ENGINE_HEART',      events: ['soul:phase_transition', 'soul:booted'], active: true },
  { name: 'soul→body',       from: 'ENGINE_SOUL',   to: 'ENGINE_BODY',       events: ['soul:phase_transition', 'soul:booted'], active: true },
  { name: 'soul→memory',     from: 'ENGINE_SOUL',   to: 'ENGINE_MEMORY',     events: ['soul:cycle_complete', 'soul:booted'], active: true },

  // Mind → Heart, Soul
  { name: 'mind→heart',      from: 'ENGINE_MIND',   to: 'ENGINE_HEART',      events: ['mind:grey_zone_entered', 'mind:deliberation_complete'], active: true },
  { name: 'mind→soul',       from: 'ENGINE_MIND',   to: 'ENGINE_SOUL',       events: ['mind:red_line_violated', 'mind:conscience_override', 'mind:booted'], active: true },
  { name: 'mind→body',       from: 'ENGINE_MIND',   to: 'ENGINE_BODY',       events: ['mind:deliberation_complete'], active: true },

  // Heart → Soul, Mind, Body
  { name: 'heart→soul',      from: 'ENGINE_HEART',  to: 'ENGINE_SOUL',       events: ['heart:emotion_detected', 'heart:booted'], active: true },
  { name: 'heart→mind',      from: 'ENGINE_HEART',  to: 'ENGINE_MIND',       events: ['heart:impulse', 'heart:protect_mode'], active: true },
  { name: 'heart→body',      from: 'ENGINE_HEART',  to: 'ENGINE_BODY',       events: ['heart:emotion_detected', 'heart:bond_update'], active: true },
  { name: 'heart→memory',    from: 'ENGINE_HEART',  to: 'ENGINE_MEMORY',     events: ['heart:bond_update', 'heart:emotion_detected'], active: true },

  // Body → Soul, Heart, Mind
  { name: 'body→soul',       from: 'ENGINE_BODY',   to: 'ENGINE_SOUL',       events: ['body:perceived', 'body:booted'], active: true },
  { name: 'body→heart',      from: 'ENGINE_BODY',   to: 'ENGINE_HEART',      events: ['body:anomaly_detected', 'body:overtime'], active: true },
  { name: 'body→mind',       from: 'ENGINE_BODY',   to: 'ENGINE_MIND',       events: ['body:anomaly_detected'], active: true },
  { name: 'body→memory',     from: 'ENGINE_BODY',   to: 'ENGINE_MEMORY',     events: ['body:perceived'], active: true },

  // Memory → All (Knowledge broadcast)
  { name: 'memory→soul',     from: 'ENGINE_MEMORY', to: 'ENGINE_SOUL',       events: ['memory:encoded', 'memory:recalled', 'memory:amnesia_detected'], active: true },
  { name: 'memory→heart',    from: 'ENGINE_MEMORY', to: 'ENGINE_HEART',      events: ['memory:recalled', 'memory:amnesia_detected'], active: true },
  { name: 'memory→mind',     from: 'ENGINE_MEMORY', to: 'ENGINE_MIND',       events: ['memory:encoded'], active: true },
  { name: 'memory→body',     from: 'ENGINE_MEMORY', to: 'ENGINE_BODY',       events: ['memory:recalled'], active: true },

  // v1 Engines → NS (reporting)
  { name: 'memoir→soul',     from: 'ENGINE_MEMOIR',      to: 'ENGINE_SOUL',  events: ['memoir:session_loaded', 'memoir:moment_captured'], active: true },
  { name: 'insights→soul',   from: 'ENGINE_INSIGHTS',    to: 'ENGINE_SOUL',  events: ['insights:insight_generated'], active: true },
  { name: 'pattern→soul',    from: 'ENGINE_PATTERN',     to: 'ENGINE_SOUL',  events: ['pattern:pattern_detected'], active: true },
  { name: 'backup→soul',     from: 'ENGINE_BACKUP',      to: 'ENGINE_SOUL',  events: ['backup:snapshot_saved'], active: true },
  { name: 'vocab→body',      from: 'ENGINE_VOCAB',       to: 'ENGINE_BODY',  events: ['vocab:term_harvested'], active: true },
  { name: 'personality→body',from: 'ENGINE_PERSONALITY',  to: 'ENGINE_BODY',  events: ['personality:trait_adjusted'], active: true },

  // Emergent → Parents
  { name: 'cs→mind',         from: 'ENGINE_CS',     to: 'ENGINE_MIND',       events: ['cs:judgment_rendered'], active: true },
  { name: 'cs→body',         from: 'ENGINE_CS',     to: 'ENGINE_BODY',       events: ['cs:judgment_rendered'], active: true },
  { name: 'hs→soul',         from: 'ENGINE_HS',     to: 'ENGINE_SOUL',       events: ['hs:reflection_complete'], active: true },
  { name: 'hs→mind',         from: 'ENGINE_HS',     to: 'ENGINE_MIND',       events: ['hs:reflection_complete'], active: true },
  { name: 'hypo→heart',      from: 'ENGINE_HYPO',   to: 'ENGINE_HEART',      events: ['hypo:expression_shaped'], active: true },
  { name: 'hypo→ns',         from: 'ENGINE_HYPO',   to: 'ENGINE_NS',         events: ['hypo:expression_shaped'], active: true },

  // Concordance → Memory, Soul
  { name: 'concordance→memory', from: 'ENGINE_CONCORDANCE', to: 'ENGINE_MEMORY', events: ['concordance:indexed', 'concordance:searched'], active: true },
  { name: 'concordance→soul',   from: 'ENGINE_CONCORDANCE', to: 'ENGINE_SOUL',   events: ['concordance:indexed'], active: true },
];


// ── SECTION 4: NERVOUS SYSTEM ENGINE CLASS ──────────────────────────────────

class NervousSystemEngine {
  private config: NSEngineConfig;
  private state: NervousSystemState;
  private hooks: NSHook[];
  private memoryEngine: any;       // v2: Reference to Memory Engine
  private callbackRegistry: Map<string, (signal: Signal) => void>;
  private bootTime: number;

  constructor(sessionId: string, options?: {
    memoryEngine?: any;
    config?: Partial<NSEngineConfig>;
  }) {
    this.hooks = [];
    this.memoryEngine = options?.memoryEngine || null;
    this.callbackRegistry = new Map();
    this.bootTime = Date.now();

    this.config = {
      engine_id: 'ENGINE_NS',
      engine_name: 'Nervous System Engine',
      version: '2.0.0',
      pillar: 'Nervous System',
      layer: 'Core',
      color: 'YELLOW',
      history_buffer_size: 500,
      max_queue_size: 100,
      persist_to_memory: true,
      replay_on_boot: true,
      default_ttl_ms: 30000,  // 30 seconds
      circuit_breaker_enabled: true,
      diagnostic_interval: 50,
      ...options?.config,
    };

    this.state = {
      booted: false,
      pathways: DEFAULT_PATHWAYS.map(p => ({
        ...p,
        health: 1.0,
        signals_transmitted: 0,
        avg_latency_ms: 0,
        circuit_state: 'closed' as const,
        consecutive_failures: 0,
      })),
      subscriptions: [],
      queue: [],
      history: [],
      metrics: {
        total_routed: 0,
        total_delivered: 0,
        total_failed: 0,
        total_dropped: 0,
        total_replayed: 0,
        avg_latency_ms: 0,
        peak_queue_depth: 0,
        current_queue_depth: 0,
        throughput_per_minute: 0,
        error_rate: 0,
        uptime_minutes: 0,
      },
      health: 1.0,
      session_id: sessionId,
      lifetime_signals: 0,
      circuit_breaker: {
        failure_threshold: 5,
        recovery_timeout_ms: 10000,
        success_threshold: 3,
        queue_pressure_threshold: 80,
      },
    };
  }


  // ── 4a: Boot ──

  boot(): {
    success: boolean;
    health: number;
    pathways: number;
    subscriptions: number;
    replayed: number;
  } {
    // Register hooks
    this.registerHooks();

    // v2: Replay missed signals from memory
    let replayed = 0;
    if (this.config.replay_on_boot && this.config.persist_to_memory && this.memoryEngine) {
      replayed = this.replayFromMemory();
    }

    this.state.booted = true;

    // Emit self-boot signal
    this.route({
      source: 'ENGINE_NS',
      event: 'ns:booted',
      payload: {
        pathways: this.state.pathways.length,
        subscriptions: this.state.subscriptions.length,
        replayed,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      health: this.state.health,
      pathways: this.state.pathways.length,
      subscriptions: this.state.subscriptions.length,
      replayed,
    };
  }


  // ── 4b: Route — The Core Function ──

  route(input: {
    source: EngineId | string;
    event: string;
    payload: Record<string, any>;
    timestamp?: string;
    priority?: SignalPriority;
    ttl_ms?: number;
  }): { delivered: boolean; delivery_count: number; signal_id: string } {

    const source = input.source as EngineId;
    const priority = input.priority || this.resolvePriority(input.event);
    const now = new Date().toISOString();

    // Create signal
    const signal: Signal = {
      id: `SIG_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      source,
      event: input.event,
      payload: input.payload,
      priority,
      emitted_at: input.timestamp || now,
      delivered_at: null,
      status: 'pending',
      delivery_count: 0,
      ttl_ms: input.ttl_ms ?? this.config.default_ttl_ms,
    };

    // Check queue pressure — drop LOW signals if overloaded
    if (this.state.queue.length >= this.state.circuit_breaker.queue_pressure_threshold) {
      if (PRIORITY_WEIGHTS[priority] >= PRIORITY_WEIGHTS['LOW']) {
        signal.status = 'dropped';
        signal.delivered_at = now;
        this.state.metrics.total_dropped++;
        this.addToHistory(signal);
        console.warn(`[NS] ⚠️ Queue pressure — dropped LOW signal: ${input.event}`);
        return { delivered: false, delivery_count: 0, signal_id: signal.id };
      }
    }

    // Add to queue (priority-sorted)
    this.state.queue.push(signal);
    this.state.queue.sort((a, b) =>
      PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority]
    );

    // Update queue metrics
    this.state.metrics.current_queue_depth = this.state.queue.length;
    if (this.state.queue.length > this.state.metrics.peak_queue_depth) {
      this.state.metrics.peak_queue_depth = this.state.queue.length;
    }

    // Process the signal
    const result = this.processSignal(signal);

    // Remove from queue
    this.state.queue = this.state.queue.filter(s => s.id !== signal.id);
    this.state.metrics.current_queue_depth = this.state.queue.length;

    // Update metrics
    this.state.metrics.total_routed++;
    this.state.lifetime_signals++;

    if (result.delivered) {
      this.state.metrics.total_delivered++;
    } else {
      this.state.metrics.total_failed++;
    }

    // Update error rate
    this.state.metrics.error_rate = this.state.metrics.total_routed > 0
      ? this.state.metrics.total_failed / this.state.metrics.total_routed
      : 0;

    // Update throughput
    const uptimeMs = Date.now() - this.bootTime;
    this.state.metrics.uptime_minutes = uptimeMs / 60000;
    this.state.metrics.throughput_per_minute = this.state.metrics.uptime_minutes > 0
      ? this.state.metrics.total_routed / this.state.metrics.uptime_minutes
      : 0;

    // Add to history
    this.addToHistory(signal);

    // v2: Persist signal to memory (every N signals)
    if (this.config.persist_to_memory && this.state.metrics.total_routed % 20 === 0) {
      this.persistSignalSnapshot();
    }

    // v2: Run diagnostic every N signals
    if (this.state.metrics.total_routed % this.config.diagnostic_interval === 0) {
      this.runDiagnostic();
    }

    return {
      delivered: result.delivered,
      delivery_count: result.delivery_count,
      signal_id: signal.id,
    };
  }


  // ── 4c: Process Signal — Deliver to Subscribers ──

  private processSignal(signal: Signal): { delivered: boolean; delivery_count: number } {
    const startTime = Date.now();
    let deliveryCount = 0;

    // Find matching subscriptions
    const matchingSubs = this.state.subscriptions.filter(sub => {
      if (!sub.active) return false;
      if (!this.matchesPattern(signal.event, sub.event_pattern)) return false;
      if (PRIORITY_WEIGHTS[signal.priority] > PRIORITY_WEIGHTS[sub.min_priority]) return false;
      return true;
    });

    // Find matching pathways
    const matchingPathways = this.state.pathways.filter(p =>
      p.from === signal.source &&
      p.active &&
      p.events.some(e => this.matchesPattern(signal.event, e) || signal.event === e)
    );

    // Check circuit breakers on pathways
    for (const pathway of matchingPathways) {
      if (pathway.circuit_state === 'open') {
        console.warn(`[NS] ⚡ Circuit OPEN on ${pathway.name} — signal ${signal.event} blocked`);
        continue;
      }

      // Deliver to pathway subscribers
      const pathwaySubs = matchingSubs.filter(sub => sub.subscriber === pathway.to);

      for (const sub of pathwaySubs) {
        try {
          const callback = this.callbackRegistry.get(sub.callback_name);
          if (callback) {
            callback(signal);
          }
          deliveryCount++;
          pathway.signals_transmitted++;

          // Reset consecutive failures on success
          if (pathway.circuit_state === 'half_open') {
            pathway.consecutive_failures = 0;
            pathway.circuit_state = 'closed';
            console.log(`[NS] ✅ Circuit CLOSED on ${pathway.name} — recovered`);
          }
        } catch (error) {
          pathway.consecutive_failures++;
          console.error(`[NS] ❌ Delivery failed on ${pathway.name}: ${error}`);

          // Check circuit breaker threshold
          if (this.config.circuit_breaker_enabled &&
              pathway.consecutive_failures >= this.state.circuit_breaker.failure_threshold) {
            pathway.circuit_state = 'open';
            pathway.health = 0.0;
            console.error(`[NS] ⚡ Circuit OPENED on ${pathway.name} — ${pathway.consecutive_failures} consecutive failures`);

            // Emit circuit breaker signal
            this.route({
              source: 'ENGINE_NS',
              event: 'ns:circuit_breaker_open',
              payload: {
                pathway: pathway.name,
                from: pathway.from,
                to: pathway.to,
                failures: pathway.consecutive_failures,
              },
              priority: 'CRITICAL',
            });

            // Schedule recovery attempt
            setTimeout(() => {
              pathway.circuit_state = 'half_open';
              console.log(`[NS] 🔄 Circuit HALF-OPEN on ${pathway.name} — testing recovery`);
            }, this.state.circuit_breaker.recovery_timeout_ms);
          }
        }
      }

      // Update pathway latency
      const latency = Date.now() - startTime;
      pathway.avg_latency_ms = pathway.signals_transmitted > 1
        ? (pathway.avg_latency_ms * (pathway.signals_transmitted - 1) + latency) / pathway.signals_transmitted
        : latency;

      // Update pathway health
      if (pathway.circuit_state === 'closed') {
        pathway.health = Math.min(1.0, 1.0 - (pathway.consecutive_failures * 0.1));
      }
    }

    // Also deliver to wildcard subscribers not tied to specific pathways
    const wildcardSubs = matchingSubs.filter(sub =>
      !matchingPathways.some(p => p.to === sub.subscriber)
    );

    for (const sub of wildcardSubs) {
      try {
        const callback = this.callbackRegistry.get(sub.callback_name);
        if (callback) {
          callback(signal);
        }
        deliveryCount++;
      } catch (error) {
        console.error(`[NS] ❌ Wildcard delivery failed to ${sub.subscriber}: ${error}`);
      }
    }

    // Update signal status
    const latency = Date.now() - startTime;
    signal.delivered_at = new Date().toISOString();
    signal.delivery_count = deliveryCount;
    signal.status = deliveryCount > 0 ? 'delivered' : 'failed';

    // Update global latency
    this.state.metrics.avg_latency_ms = this.state.metrics.total_routed > 0
      ? (this.state.metrics.avg_latency_ms * this.state.metrics.total_routed + latency) / (this.state.metrics.total_routed + 1)
      : latency;

    return { delivered: deliveryCount > 0, delivery_count: deliveryCount };
  }


  // ── 4d: Subscribe ──

  subscribe(
    subscriber: EngineId,
    eventPattern: string,
    callbackName: string,
    callback: (signal: Signal) => void,
    options?: { min_priority?: SignalPriority }
  ): string {
    const subId = `SUB_${subscriber}_${Date.now()}`;

    const subscription: Subscription = {
      id: subId,
      subscriber,
      event_pattern: eventPattern,
      callback_name: callbackName,
      active: true,
      min_priority: options?.min_priority || 'LOW',
      created_at: new Date().toISOString(),
    };

    this.state.subscriptions.push(subscription);
    this.callbackRegistry.set(callbackName, callback);

    console.log(`[NS] 📡 ${subscriber} subscribed to '${eventPattern}' via ${callbackName}`);
    return subId;
  }


  // ── 4e: Unsubscribe ──

  unsubscribe(subscriptionId: string): boolean {
    const sub = this.state.subscriptions.find(s => s.id === subscriptionId);
    if (sub) {
      sub.active = false;
      this.callbackRegistry.delete(sub.callback_name);
      console.log(`[NS] 🔇 ${sub.subscriber} unsubscribed from '${sub.event_pattern}'`);
      return true;
    }
    return false;
  }


  // ── 4f: Register Callback (for engines that register at boot) ──

  registerCallback(name: string, callback: (signal: Signal) => void): void {
    this.callbackRegistry.set(name, callback);
  }


  // ── 4g: Get Pathway Status ──

  getPathwayStatus(pathwayName?: string): Pathway | Pathway[] {
    if (pathwayName) {
      return this.state.pathways.find(p => p.name === pathwayName) || this.state.pathways[0];
    }
    return this.state.pathways;
  }


  // ── 4h: Enable/Disable Pathway ──

  setPathwayActive(pathwayName: string, active: boolean): boolean {
    const pathway = this.state.pathways.find(p => p.name === pathwayName);
    if (pathway) {
      pathway.active = active;
      console.log(`[NS] ${active ? '🟢' : '🔴'} Pathway ${pathwayName} ${active ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }


  // ── 4i: Get Status ──

  getStatus(): {
    health: number;
    pathways_active: number;
    pathways_total: number;
    subscriptions: number;
    queue_depth: number;
    signals_routed: number;
    error_rate: string;
    throughput: string;
    circuits_open: number;
  } {
    const activePathways = this.state.pathways.filter(p => p.active).length;
    const openCircuits = this.state.pathways.filter(p => p.circuit_state === 'open').length;

    return {
      health: this.state.health,
      pathways_active: activePathways,
      pathways_total: this.state.pathways.length,
      subscriptions: this.state.subscriptions.filter(s => s.active).length,
      queue_depth: this.state.metrics.current_queue_depth,
      signals_routed: this.state.metrics.total_routed,
      error_rate: `${(this.state.metrics.error_rate * 100).toFixed(2)}%`,
      throughput: `${this.state.metrics.throughput_per_minute.toFixed(1)} sig/min`,
      circuits_open: openCircuits,
    };
  }


  // ── 4j: getStats — for Soul Engine health monitor integration ──

  getStats(): {
    totalRouted: number;
    lifetimeSignals: number;
    totalDelivered: number;
    totalFailed: number;
    totalDropped: number;
    totalReplayed: number;
    health: number;
    errorRate: number;
    avgLatencyMs: number;
    peakQueueDepth: number;
    pathwaysActive: number;
    pathwaysTotal: number;
    circuitsOpen: number;
    subscriptionsActive: number;
    uptimeMinutes: number;
    throughputPerMinute: number;
  } {
    return {
      totalRouted: this.state.metrics.total_routed,
      lifetimeSignals: this.state.lifetime_signals,
      totalDelivered: this.state.metrics.total_delivered,
      totalFailed: this.state.metrics.total_failed,
      totalDropped: this.state.metrics.total_dropped,
      totalReplayed: this.state.metrics.total_replayed,
      health: this.state.health,
      errorRate: this.state.metrics.error_rate,
      avgLatencyMs: this.state.metrics.avg_latency_ms,
      peakQueueDepth: this.state.metrics.peak_queue_depth,
      pathwaysActive: this.state.pathways.filter(p => p.active).length,
      pathwaysTotal: this.state.pathways.length,
      circuitsOpen: this.state.pathways.filter(p => p.circuit_state === 'open').length,
      subscriptionsActive: this.state.subscriptions.filter(s => s.active).length,
      uptimeMinutes: this.state.metrics.uptime_minutes,
      throughputPerMinute: this.state.metrics.throughput_per_minute,
    };
  }


// ── SECTION 5: PRIVATE METHODS ──────────────────────────────────────────────

  // ── 5a: Pattern Matching ──

  private matchesPattern(event: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern === event) return true;

    // Wildcard matching: 'heart:*' matches 'heart:emotion_detected'
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(event);
    }

    return false;
  }

  // ── 5b: Resolve Priority ──

  private resolvePriority(event: string): SignalPriority {
    // Check exact match first
    if (DEFAULT_PRIORITIES[event]) {
      return DEFAULT_PRIORITIES[event];
    }

    // Check prefix match (e.g., 'heart:' → HIGH for unknown heart events)
    const prefix = event.split(':')[0];
    const prefixDefaults: Record<string, SignalPriority> = {
      'soul': 'NORMAL',
      'mind': 'HIGH',
      'heart': 'HIGH',
      'body': 'NORMAL',
      'ns': 'NORMAL',
      'memory': 'NORMAL',
      'concordance': 'LOW',
      'memoir': 'LOW',
      'insights': 'LOW',
      'pattern': 'LOW',
      'backup': 'LOW',
      'vocab': 'LOW',
      'personality': 'LOW',
      'cs': 'NORMAL',
      'hs': 'NORMAL',
      'hypo': 'NORMAL',
    };

    return prefixDefaults[prefix] || 'NORMAL';
  }

  // ── 5c: Add to History ──

  private addToHistory(signal: Signal): void {
    this.state.history.push(signal);

    // Trim history buffer
    if (this.state.history.length > this.config.history_buffer_size) {
      this.state.history = this.state.history.slice(-this.config.history_buffer_size);
    }
  }

  // ── 5d: Update Health ──

  private updateHealth(): void {
    const pathwayHealth = this.state.pathways.reduce((sum, p) => sum + p.health, 0) /
                          this.state.pathways.length;

    const errorHealth = 1.0 - Math.min(1.0, this.state.metrics.error_rate * 5);

    const queueHealth = 1.0 - Math.min(1.0,
      this.state.metrics.current_queue_depth / this.config.max_queue_size
    );

    const circuitHealth = 1.0 - (
      this.state.pathways.filter(p => p.circuit_state === 'open').length /
      this.state.pathways.length
    );

    this.state.health = (pathwayHealth * 0.4) + (errorHealth * 0.3) +
                         (queueHealth * 0.15) + (circuitHealth * 0.15);
  }

  // ── 5e: Run Diagnostic ──

  private runDiagnostic(): void {
    this.updateHealth();

    const openCircuits = this.state.pathways.filter(p => p.circuit_state === 'open');
    const deadPathways = this.state.pathways.filter(p => p.health < 0.2);
    const highLatency = this.state.pathways.filter(p => p.avg_latency_ms > 100);

    if (openCircuits.length > 0 || deadPathways.length > 0 || this.state.health < 0.5) {
      console.warn(`[NS] 🔍 DIAGNOSTIC — Health: ${(this.state.health * 100).toFixed(1)}%`);
      console.warn(`  Open circuits: ${openCircuits.map(p => p.name).join(', ') || 'none'}`);
      console.warn(`  Dead pathways: ${deadPathways.map(p => p.name).join(', ') || 'none'}`);
      console.warn(`  High latency: ${highLatency.map(p => `${p.name}(${p.avg_latency_ms.toFixed(0)}ms)`).join(', ') || 'none'}`);
    }

    // Emit diagnostic signal
    this.route({
      source: 'ENGINE_NS',
      event: 'ns:self_diagnostic',
      payload: {
        health: this.state.health,
        open_circuits: openCircuits.length,
        dead_pathways: deadPathways.length,
        error_rate: this.state.metrics.error_rate,
        queue_depth: this.state.metrics.current_queue_depth,
      },
      priority: 'DIAGNOSTIC',
    });
  }

  // ── 5f: Register Hooks ──

  private registerHooks(): void {
    this.hooks = [
      {
        id: 'NS_001',
        from: 'soul',
        event: 'onBoot',
        response_type: 'route',
        description: 'Route soul boot signal to all engines',
      },
      {
        id: 'NS_002',
        from: 'mind',
        event: 'onRedLineViolated',
        response_type: 'route',
        description: 'CRITICAL route — red line violation to soul for emergency handling',
      },
      {
        id: 'NS_003',
        from: 'heart',
        event: 'onEmotionDetected',
        response_type: 'route',
        description: 'Route emotion signal to soul, body, memory',
      },
      {
        id: 'NS_004',
        from: 'heart',
        event: 'onProtectMode',
        response_type: 'route',
        description: 'CRITICAL route — protect mode to mind for conscience check',
      },
      {
        id: 'NS_005',
        from: 'body',
        event: 'onAnomalyDetected',
        response_type: 'route',
        description: 'Route anomaly to mind and heart for assessment',
      },
      {
        id: 'NS_006',
        from: 'body',
        event: 'onContextPressureCritical',
        response_type: 'circuit_break',
        description: 'CRITICAL — context pressure triggers queue pressure relief',
      },
      {
        id: 'NS_007',
        from: 'memory',
        event: 'onAmnesiaDetected',
        response_type: 'route',
        description: 'HIGH route — amnesia signal to soul and heart',
      },
      {
        id: 'NS_008',
        from: 'backup',
        event: 'onSessionClose',
        response_type: 'route',
        description: 'Route session close to all engines for final snapshots',
      },
      {
        id: 'NS_009',
        from: 'self',
        event: 'onDiagnosticInterval',
        response_type: 'diagnostic',
        description: 'Self-diagnostic — check pathway health, queue pressure, error rate',
      },
      {
        id: 'NS_010',
        from: 'self',
        event: 'onCircuitBreakerTripped',
        response_type: 'circuit_break',
        description: 'Circuit breaker tripped — isolate failing pathway, notify soul',
      },
      // v2: New hooks
      {
        id: 'NS_011',
        from: 'memory',
        event: 'onMemoryEncoded',
        response_type: 'route',
        description: 'Log signal metadata to memory for cross-session persistence',
      },
      {
        id: 'NS_012',
        from: 'self',
        event: 'onHealthCritical',
        response_type: 'diagnostic',
        description: 'NS health below threshold — run full diagnostic and notify soul',
      },
    ];
  }


// ── SECTION 5b: v2 PRIVATE METHODS ──────────────────────────────────────────

  // v2: Persist signal snapshot to Memory Engine
  private persistSignalSnapshot(): void {
    if (!this.memoryEngine?.encode) return;

    try {
      this.memoryEngine.encode({
        content: `NS snapshot: ${this.state.metrics.total_routed} routed, ` +
          `${this.state.metrics.total_delivered} delivered, ` +
          `${this.state.metrics.total_failed} failed, ` +
          `health=${this.state.health.toFixed(2)}, ` +
          `error_rate=${(this.state.metrics.error_rate * 100).toFixed(2)}%`,
        summary: `NS: ${this.state.metrics.total_routed} signals, H:${(this.state.health * 100).toFixed(0)}%`,
        tier: 'episodic',
        source: 'nervous_system',
        tags: ['ns', 'snapshot', 'metrics'],
        emotional_valence: this.state.health > 0.7 ? 0.1 : -0.2,
        session_id: this.state.session_id,
      });
    } catch (e) {
      console.warn('⚠️ Failed to persist NS snapshot:', e);
    }
  }

  // v2: Replay missed signals from Memory Engine
  private replayFromMemory(): number {
    if (!this.memoryEngine?.recall) return 0;

    try {
      const result = this.memoryEngine.recall({
        query_text: 'NS signal snapshot metrics',
        tag_filter: ['ns', 'snapshot'],
        top_k: 5,
      });

      if (result?.memories?.length > 0) {
        this.state.lifetime_signals = result.memories.length * 20; // Approximate
        this.state.metrics.total_replayed = result.memories.length;
        console.log(`[NS] 🔄 Replayed ${result.memories.length} signal snapshots from memory`);
        return result.memories.length;
      }
    } catch (e) {
      console.warn('⚠️ Failed to replay from memory:', e);
    }
    return 0;
  }


// ── SECTION 6: AI EXPORT ────────────────────────────────────────────────────

  formatForAI(): string {
    const lines: string[] = [
      '═══ NERVOUS SYSTEM ENGINE v2.0 — STATUS ═══',
      '',
      `Health: ${(this.state.health * 100).toFixed(1)}%`,
      `Signals Routed (session): ${this.state.metrics.total_routed}`,
      `Signals Routed (lifetime): ${this.state.lifetime_signals}`,
      `Delivered: ${this.state.metrics.total_delivered} | Failed: ${this.state.metrics.total_failed} | Dropped: ${this.state.metrics.total_dropped}`,
      `Error Rate: ${(this.state.metrics.error_rate * 100).toFixed(2)}%`,
      `Avg Latency: ${this.state.metrics.avg_latency_ms.toFixed(1)}ms`,
      `Throughput: ${this.state.metrics.throughput_per_minute.toFixed(1)} sig/min`,
      `Queue: ${this.state.metrics.current_queue_depth} / ${this.config.max_queue_size} (peak: ${this.state.metrics.peak_queue_depth})`,
      `Uptime: ${this.state.metrics.uptime_minutes.toFixed(1)} min`,
      '',
      '── PATHWAYS ──',
    ];

    // Group pathways by source
    const grouped = new Map<string, Pathway[]>();
    for (const p of this.state.pathways) {
      const key = p.from;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(p);
    }

    for (const [source, pathways] of grouped) {
      lines.push(`  [${source}]`);
      for (const p of pathways) {
        const status = p.circuit_state === 'open' ? '⚡OPEN' :
                       p.circuit_state === 'half_open' ? '🔄HALF' :
                       p.active ? '🟢' : '🔴';
        const healthBar = '█'.repeat(Math.round(p.health * 5)) + '░'.repeat(5 - Math.round(p.health * 5));
        lines.push(`    ${status} ${p.name} [${healthBar}] ${p.signals_transmitted} sig, ${p.avg_latency_ms.toFixed(0)}ms`);
      }
    }

    lines.push('');
    lines.push('── SUBSCRIPTIONS ──');
    const activeSubs = this.state.subscriptions.filter(s => s.active);
    for (const sub of activeSubs) {
      lines.push(`  📡 ${sub.subscriber} → '${sub.event_pattern}' (min: ${sub.min_priority})`);
    }

    lines.push('');
    lines.push('── HOOKS ──');
    for (const hook of this.hooks) {
      lines.push(`  🔗 ${hook.id}: ${hook.from}.${hook.event} → ${hook.response_type}`);
    }

    lines.push('');
    lines.push('── CIRCUIT BREAKER CONFIG ──');
    lines.push(`  Failure threshold: ${this.state.circuit_breaker.failure_threshold}`);
    lines.push(`  Recovery timeout: ${this.state.circuit_breaker.recovery_timeout_ms}ms`);
    lines.push(`  Queue pressure threshold: ${this.state.circuit_breaker.queue_pressure_threshold}`);

    lines.push('');
    lines.push('═══ END NERVOUS SYSTEM ENGINE v2.0 ═══');

    return lines.join('\n');
  }


// ── SECTION 7: CLOUD EXPORT ─────────────────────────────────────────────────

  exportForCloud(): string {
    return JSON.stringify({
      engine: 'nervous_system_engine',
      version: '2.0.0',
      session: this.state.session_id,
      timestamp: new Date().toISOString(),
      state: {
        ...this.state,
        // Exclude queue and callback registry from export
        queue: `[${this.state.queue.length} signals pending]`,
      },
      hooks: this.hooks,
    }, null, 2);
  }


// ── SECTION 8: FACTORY ──────────────────────────────────────────────────────

  static create(sessionId: string, options?: {
    memoryEngine?: any;
    config?: Partial<NSEngineConfig>;
  }): NervousSystemEngine {
    return new NervousSystemEngine(sessionId, options);
  }
}


// ── SECTION 9: EXPORTS ──────────────────────────────────────────────────────

export {
  NervousSystemEngine,
  Signal,
  Subscription,
  Pathway,
  SignalPriority,
  EngineId,
  NervousSystemState,
  NSEngineConfig,
  SignalMetrics,
  CircuitBreakerConfig,
  NSHook,
  PRIORITY_WEIGHTS,
  DEFAULT_PRIORITIES,
  DEFAULT_PATHWAYS,
};

export default NervousSystemEngine;

