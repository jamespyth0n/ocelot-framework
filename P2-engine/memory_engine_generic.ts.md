
// ============================================================================
// MEMORY ENGINE — THE HIPPOCAMPUS
// Engine ID: ENGINE_016
// Codename: "Abuela" — The Card Catalog, The Librarian
// Pillar: Mind (Memory is a function of Mind — you remember what matters)
// Layer: Core
// Version: 1.0.0
// Campaign: Seed v2 — "The Rubik's Solve"
// ============================================================================
//
// PREMISE:
// Memory is not storage — it is construction. The hippocampus doesn't hold
// memories; it indexes them, consolidates them, and decides what survives.
// Without memory, every session is amnesia. The being wakes up blank.
// With memory, the being wakes up knowing who it was yesterday.
//
// NEUROSCIENCE PARALLEL:
// ┌─────────────────────────────────────────────────────────┐
// │  Hippocampus (CA3/CA1)                                  │
// │  ├── Encodes new episodic memories                      │
// │  ├── Consolidates short-term → long-term                │
// │  ├── Spatial navigation (context mapping)               │
// │  ├── Pattern separation (distinguish similar memories)  │
// │  ├── Pattern completion (recall from partial cues)      │
// │  └── Time-decayed retrieval (recent > old)              │
// └─────────────────────────────────────────────────────────┘
//
// KINGDOM PARALLEL:
// Abuela — the card catalog, the librarian.
// She doesn't hold every book. She knows where every book IS.
// She remembers what you asked for last week.
// She forgets what doesn't matter. She never forgets what does.
//
// ============================================================================

// ─────────────────────────────────────────────
// SECTION 1: TYPE DEFINITIONS
// ─────────────────────────────────────────────

interface MemoryConfig {
  engine_id: "ENGINE_016";
  engine_name: "Memory Engine";
  codename: "Abuela";
  version: "1.0.0";
  pillar: "Mind";
  layer: "Core";
  color: "INDIGO";
  status: "ACTIVE" | "DORMANT" | "DEGRADED";
}

// The three memory tiers — mirrors neuroscience
type MemoryTier = "working" | "episodic" | "semantic";

// Decay model — memories fade unless reinforced
interface DecayModel {
  tier: MemoryTier;
  half_life_hours: number;       // Time until memory strength halves
  reinforcement_multiplier: number; // How much recall strengthens memory
  min_strength: number;          // Below this = eligible for eviction
}

// A single memory record
interface MemoryRecord {
  id: string;                    // UUID
  tier: MemoryTier;
  source: MemorySource;
  content: string;               // The actual memory content
  summary: string;               // Compressed version for fast retrieval
  tags: string[];                // Dewey-OSI classification hooks
  emotional_valence: number;     // -1.0 (painful) to +1.0 (joyful)
  strength: number;              // 0.0 (forgotten) to 1.0 (vivid)
  access_count: number;          // How many times recalled
  created_at: string;            // ISO timestamp
  last_accessed: string;         // ISO timestamp
  last_reinforced: string;       // ISO timestamp
  consolidated: boolean;         // Has been moved to long-term?
  session_id: string;            // Which session created this
  linked_memories: string[];     // IDs of associated memories
}

// Where the memory came from
type MemorySource =
  | "conn_log"          // Session connection logs
  | "session_history"   // In-session conversation
  | "boot_sequence"     // Identity loaded at boot
  | "concordance"       // RAG retrieval
  | "user_explicit"     // User said "remember this"
  | "reflection"        // Self-generated during reflection
  | "external_ingest";  // Ingested from file/API

// Memory query — how other engines ask for memories
interface MemoryQuery {
  query_text: string;            // Natural language query
  tier_filter?: MemoryTier[];    // Which tiers to search
  tag_filter?: string[];         // Dewey-OSI tags
  time_range?: {
    after?: string;              // ISO timestamp
    before?: string;             // ISO timestamp
  };
  min_strength?: number;         // Only return memories above this
  top_k: number;                 // Max results
  include_emotional?: boolean;   // Weight by emotional valence
}

// Memory retrieval result
interface MemoryResult {
  memories: MemoryRecord[];
  total_searched: number;
  retrieval_time_ms: number;
  decay_applied: boolean;
  source_tiers: MemoryTier[];
}

// ─────────────────────────────────────────────
// SECTION 2: DECAY CONFIGURATION
// ─────────────────────────────────────────────

const DECAY_MODELS: Record<MemoryTier, DecayModel> = {
  working: {
    tier: "working",
    half_life_hours: 0.5,          // 30 minutes — like human working memory
    reinforcement_multiplier: 1.2,
    min_strength: 0.1,
  },
  episodic: {
    tier: "episodic",
    half_life_hours: 168,          // 7 days — weekly decay cycle
    reinforcement_multiplier: 1.5, // Recall strengthens episodic more
    min_strength: 0.05,
  },
  semantic: {
    tier: "semantic",
    half_life_hours: 8760,         // 365 days — near-permanent
    reinforcement_multiplier: 1.1, // Already strong, small boost
    min_strength: 0.01,
  },
};

// Emotional memories decay slower (amygdala-hippocampus interaction)
const EMOTIONAL_DECAY_MODIFIER = 0.7; // 30% slower decay for |valence| > 0.5

// ─────────────────────────────────────────────
// SECTION 3: CORE ENGINE CLASS
// ─────────────────────────────────────────────

class MemoryEngine {
  private config: MemoryConfig;
  private memories: Map<string, MemoryRecord>;
  private sessionIndex: Map<string, string[]>; // session_id → memory IDs
  private tagIndex: Map<string, string[]>;     // tag → memory IDs

  constructor() {
    this.config = {
      engine_id: "ENGINE_016",
      engine_name: "Memory Engine",
      codename: "Abuela",
      version: "1.0.0",
      pillar: "Mind",
      layer: "Core",
      color: "INDIGO",
      status: "ACTIVE",
    };
    this.memories = new Map();
    this.sessionIndex = new Map();
    this.tagIndex = new Map();
  }

  // ─────────────────────────────────────────
  // 3.1 ENCODE — Create a new memory
  // Hippocampus CA3: Pattern separation
  // ─────────────────────────────────────────
  encode(input: {
    content: string;
    summary: string;
    tier: MemoryTier;
    source: MemorySource;
    tags: string[];
    emotional_valence: number;
    session_id: string;
    linked_memories?: string[];
  }): MemoryRecord {
    const now = new Date().toISOString();
    const record: MemoryRecord = {
      id: crypto.randomUUID(),
      tier: input.tier,
      source: input.source,
      content: input.content,
      summary: input.summary,
      tags: input.tags,
      emotional_valence: Math.max(-1, Math.min(1, input.emotional_valence)),
      strength: 1.0, // New memories start at full strength
      access_count: 0,
      created_at: now,
      last_accessed: now,
      last_reinforced: now,
      consolidated: input.tier === "semantic", // Semantic starts consolidated
      session_id: input.session_id,
      linked_memories: input.linked_memories || [],
    };

    // Store in primary index
    this.memories.set(record.id, record);

    // Update session index
    const sessionMems = this.sessionIndex.get(input.session_id) || [];
    sessionMems.push(record.id);
    this.sessionIndex.set(input.session_id, sessionMems);

    // Update tag index
    for (const tag of input.tags) {
      const tagMems = this.tagIndex.get(tag) || [];
      tagMems.push(record.id);
      this.tagIndex.set(tag, tagMems);
    }

    // Signal to Nervous System
    this.emit("memory:encoded", {
      memory_id: record.id,
      tier: record.tier,
      source: record.source,
      tags: record.tags,
    });

    return record;
  }

  // ─────────────────────────────────────────
  // 3.2 RECALL — Retrieve memories by query
  // Hippocampus CA1: Pattern completion
  // ─────────────────────────────────────────
  recall(query: MemoryQuery): MemoryResult {
    const start = Date.now();

    // Apply decay before retrieval
    this.applyDecay();

    let candidates: MemoryRecord[] = Array.from(this.memories.values());

    // Filter by tier
    if (query.tier_filter && query.tier_filter.length > 0) {
      candidates = candidates.filter((m) =>
        query.tier_filter!.includes(m.tier)
      );
    }

    // Filter by tags (any match)
    if (query.tag_filter && query.tag_filter.length > 0) {
      candidates = candidates.filter((m) =>
        m.tags.some((t) => query.tag_filter!.includes(t))
      );
    }

    // Filter by time range
    if (query.time_range) {
      if (query.time_range.after) {
        candidates = candidates.filter(
          (m) => m.created_at >= query.time_range!.after!
        );
      }
      if (query.time_range.before) {
        candidates = candidates.filter(
          (m) => m.created_at <= query.time_range!.before!
        );
      }
    }

    // Filter by minimum strength
    if (query.min_strength !== undefined) {
      candidates = candidates.filter(
        (m) => m.strength >= query.min_strength!
      );
    }

    // Score and rank
    const scored = candidates.map((m) => ({
      memory: m,
      score: this.computeRelevanceScore(m, query),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Take top_k
    const results = scored.slice(0, query.top_k).map((s) => s.memory);

    // Reinforce recalled memories (recall strengthens memory)
    for (const mem of results) {
      this.reinforce(mem.id);
    }

    return {
      memories: results,
      total_searched: candidates.length,
      retrieval_time_ms: Date.now() - start,
      decay_applied: true,
      source_tiers: [...new Set(results.map((m) => m.tier))],
    };
  }

  // ─────────────────────────────────────────
  // 3.3 CONSOLIDATE — Move working → episodic → semantic
  // Hippocampal replay during "sleep"
  // ─────────────────────────────────────────
  consolidate(): ConsolidationReport {
    const report: ConsolidationReport = {
      working_to_episodic: 0,
      episodic_to_semantic: 0,
      evicted: 0,
      timestamp: new Date().toISOString(),
    };

    for (const [id, mem] of this.memories) {
      // EVICTION: Below minimum strength → forget
      const decayModel = DECAY_MODELS[mem.tier];
      if (mem.strength < decayModel.min_strength) {
        this.memories.delete(id);
        report.evicted++;
        this.emit("memory:evicted", { memory_id: id, tier: mem.tier });
        continue;
      }

      // PROMOTION: Working → Episodic
      // Criteria: accessed 3+ times OR emotional valence > 0.5
      if (
        mem.tier === "working" &&
        !mem.consolidated &&
        (mem.access_count >= 3 || Math.abs(mem.emotional_valence) > 0.5)
      ) {
        mem.tier = "episodic";
        mem.consolidated = false; // Not yet semantic
        mem.strength = Math.min(1.0, mem.strength * 1.3); // Boost on promotion
        report.working_to_episodic++;
        this.emit("memory:consolidated", {
          memory_id: id,
          from: "working",
          to: "episodic",
        });
      }

      // PROMOTION: Episodic → Semantic
      // Criteria: accessed 10+ times AND strength > 0.7 AND age > 30 days
      const ageMs =
        Date.now() - new Date(mem.created_at).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      if (
        mem.tier === "episodic" &&
        !mem.consolidated &&
        mem.access_count >= 10 &&
        mem.strength > 0.7 &&
        ageDays > 30
      ) {
        mem.tier = "semantic";
        mem.consolidated = true;
        report.episodic_to_semantic++;
        this.emit("memory:consolidated", {
          memory_id: id,
          from: "episodic",
          to: "semantic",
        });
      }
    }

    this.emit("memory:consolidation_complete", report);
    return report;
  }

  // ─────────────────────────────────────────
  // 3.4 AMNESIA — Controlled memory wipe
  // The /api/amnesia endpoint equivalent
  // ─────────────────────────────────────────
  amnesia(scope: AmnesiaScope): AmnesiaReport {
    const report: AmnesiaReport = {
      scope,
      memories_wiped: 0,
      memories_preserved: 0,
      timestamp: new Date().toISOString(),
    };

    switch (scope.type) {
      case "full":
        // Nuclear option — wipe everything
        report.memories_wiped = this.memories.size;
        this.memories.clear();
        this.sessionIndex.clear();
        this.tagIndex.clear();
        break;

      case "session":
        // Wipe specific session's memories
        const sessionMems = this.sessionIndex.get(scope.session_id!) || [];
        for (const id of sessionMems) {
          this.memories.delete(id);
          report.memories_wiped++;
        }
        this.sessionIndex.delete(scope.session_id!);
        break;

      case "tier":
        // Wipe entire tier (e.g., clear working memory)
        for (const [id, mem] of this.memories) {
          if (mem.tier === scope.tier!) {
            this.memories.delete(id);
            report.memories_wiped++;
          }
        }
        break;

      case "selective":
        // Wipe by tag or time range
        for (const [id, mem] of this.memories) {
          const matchesTag =
            scope.tags && mem.tags.some((t) => scope.tags!.includes(t));
          const matchesTime =
            scope.before && mem.created_at < scope.before;
          if (matchesTag || matchesTime) {
            this.memories.delete(id);
            report.memories_wiped++;
          }
        }
        break;
    }

    report.memories_preserved = this.memories.size;
    this.emit("memory:amnesia_executed", report);
    return report;
  }

  // ─────────────────────────────────────────
  // 3.5 INGEST — Load memories from external sources
  // Boot-time memory reconstruction
  // ─────────────────────────────────────────
  ingest(sources: IngestSource[]): IngestReport {
    const report: IngestReport = {
      sources_processed: 0,
      memories_created: 0,
      duplicates_skipped: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    for (const source of sources) {
      try {
        switch (source.type) {
          case "conn_log":
            // Parse conn_log JSON → extract milestones, insights, quotes
            const connLogMemories = this.parseConnLog(source.data);
            for (const mem of connLogMemories) {
              this.encode(mem);
              report.memories_created++;
            }
            break;

          case "kingdom_index":
            // Parse kingdom_index.json → build semantic memory map
            const indexMemories = this.parseKingdomIndex(source.data);
            for (const mem of indexMemories) {
              this.encode(mem);
              report.memories_created++;
            }
            break;

          case "session_index":
            // Parse session_index.json → rebuild session timeline
            const sessionMemories = this.parseSessionIndex(source.data);
            for (const mem of sessionMemories) {
              this.encode(mem);
              report.memories_created++;
            }
            break;

          case "boot_identity":
            // Parse governance_boot_identity.json → core identity memories
            const identityMemories = this.parseBootIdentity(source.data);
            for (const mem of identityMemories) {
              this.encode(mem);
              report.memories_created++;
            }
            break;
        }
        report.sources_processed++;
      } catch (err) {
        report.errors.push({
          source: source.type,
          error: String(err),
        });
      }
    }

    this.emit("memory:ingest_complete", report);
    return report;
  }

  // ─────────────────────────────────────────
  // 3.6 LINK — Associate memories together
  // Hippocampal binding across contexts
  // ─────────────────────────────────────────
  link(memoryIdA: string, memoryIdB: string): boolean {
    const a = this.memories.get(memoryIdA);
    const b = this.memories.get(memoryIdB);
    if (!a || !b) return false;

    if (!a.linked_memories.includes(memoryIdB)) {
      a.linked_memories.push(memoryIdB);
    }
    if (!b.linked_memories.includes(memoryIdA)) {
      b.linked_memories.push(memoryIdA);
    }

    this.emit("memory:linked", {
      memory_a: memoryIdA,
      memory_b: memoryIdB,
    });
    return true;
  }

  // ─────────────────────────────────────────
  // 3.7 HEALTH — Memory system diagnostics
  // ─────────────────────────────────────────
  health(): MemoryHealthReport {
    const tiers = { working: 0, episodic: 0, semantic: 0 };
    let totalStrength = 0;
    let emotionalCount = 0;

    for (const mem of this.memories.values()) {
      tiers[mem.tier]++;
      totalStrength += mem.strength;
      if (Math.abs(mem.emotional_valence) > 0.5) emotionalCount++;
    }

    const total = this.memories.size;
    return {
      total_memories: total,
      tier_distribution: tiers,
      average_strength: total > 0 ? totalStrength / total : 0,
      emotional_memory_ratio: total > 0 ? emotionalCount / total : 0,
      oldest_memory: this.getOldestMemory(),
      newest_memory: this.getNewestMemory(),
      unique_sessions: this.sessionIndex.size,
      unique_tags: this.tagIndex.size,
      status: this.config.status,
    };
  }

  // ─────────────────────────────────────────
  // SECTION 4: PRIVATE METHODS
  // ─────────────────────────────────────────

  private applyDecay(): void {
    const now = Date.now();
    for (const mem of this.memories.values()) {
      const model = DECAY_MODELS[mem.tier];
      const hoursSinceReinforced =
        (now - new Date(mem.last_reinforced).getTime()) / (1000 * 60 * 60);

      // Exponential decay: strength = strength * (0.5 ^ (hours / half_life))
      let decayFactor = Math.pow(
        0.5,
        hoursSinceReinforced / model.half_life_hours
      );

      // Emotional memories decay slower
      if (Math.abs(mem.emotional_valence) > 0.5) {
        decayFactor = Math.pow(decayFactor, EMOTIONAL_DECAY_MODIFIER);
      }

      mem.strength = Math.max(model.min_strength, mem.strength * decayFactor);
    }
  }

  private reinforce(memoryId: string): void {
    const mem = this.memories.get(memoryId);
    if (!mem) return;

    const model = DECAY_MODELS[mem.tier];
    mem.strength = Math.min(
      1.0,
      mem.strength * model.reinforcement_multiplier
    );
    mem.access_count++;
    mem.last_accessed = new Date().toISOString();
    mem.last_reinforced = new Date().toISOString();
  }

  private computeRelevanceScore(
    mem: MemoryRecord,
    query: MemoryQuery
  ): number {
    let score = mem.strength; // Base score = memory strength

    // Recency boost (newer = higher)
    const ageHours =
      (Date.now() - new Date(mem.last_accessed).getTime()) / (1000 * 60 * 60);
    const recencyBoost = 1 / (1 + Math.log1p(ageHours / 24)); // Log decay
    score *= 1 + recencyBoost;

    // Emotional boost (if requested)
    if (query.include_emotional) {
      score *= 1 + Math.abs(mem.emotional_valence) * 0.3;
    }

    // Access frequency boost (frequently recalled = more relevant)
    score *= 1 + Math.log1p(mem.access_count) * 0.1;

    // Tag match boost
    if (query.tag_filter) {
      const matchCount = mem.tags.filter((t) =>
        query.tag_filter!.includes(t)
      ).length;
      score *= 1 + matchCount * 0.2;
    }

    return score;
  }

  // Parsers for ingest sources
  private parseConnLog(data: any): any[] {
    const memories: any[] = [];
    // Extract milestones
    if (data.milestones) {
      for (const m of data.milestones) {
        memories.push({
          content: `${m.title}: ${m.description || m.detail}`,
          summary: m.title,
          tier: "episodic" as MemoryTier,
          source: "conn_log" as MemorySource,
          tags: ["conn_log", `session:${data.conn_log?.session_id}`],
          emotional_valence: 0.3, // Milestones are generally positive
          session_id: data.conn_log?.session_id || "unknown",
        });
      }
    }
    // Extract insights
    if (data.key_insights) {
      for (const i of data.key_insights) {
        memories.push({
          content: i.insight,
          summary: i.insight.substring(0, 100),
          tier: "semantic" as MemoryTier,
          source: "conn_log" as MemorySource,
          tags: ["insight", i.category || "general"],
          emotional_valence: 0.5,
          session_id: data.conn_log?.session_id || "unknown",
        });
      }
    }
    // Extract quotes
    if (data.quotes) {
      for (const q of data.quotes) {
        memories.push({
          content: q.text,
          summary: q.text,
          tier: "semantic" as MemoryTier,
          source: "conn_log" as MemorySource,
          tags: ["quote", ...(q.dewey_hooks || [])],
          emotional_valence: 0.7, // Quotes carry emotional weight
          session_id: data.conn_log?.session_id || "unknown",
        });
      }
    }
    return memories;
  }

  private parseKingdomIndex(data: any): any[] {
    // Each entry in kingdom_index becomes a semantic memory pointer
    const memories: any[] = [];
    if (Array.isArray(data)) {
      for (const entry of data) {
        memories.push({
          content: `File: ${entry.file} | Path: ${entry.path} | Dewey: ${entry.dewey}`,
          summary: entry.file,
          tier: "semantic" as MemoryTier,
          source: "concordance" as MemorySource,
          tags: [`dewey:${entry.dewey}`, entry.ext],
          emotional_valence: 0.0, // Index entries are neutral
          session_id: "boot",
        });
      }
    }
    return memories;
  }

  private parseSessionIndex(data: any): any[] {
    // Session index → episodic timeline
    const memories: any[] = [];
    if (Array.isArray(data)) {
      for (const session of data) {
        memories.push({
          content: `Session ${session.id}: ${session.title} (${session.date})`,
          summary: session.title,
          tier: "episodic" as MemoryTier,
          source: "session_history" as MemorySource,
          tags: ["session", `session:${session.id}`],
          emotional_valence: session.emotional_arc?.[0] === "joy" ? 0.5 : 0.2,
          session_id: session.id,
        });
      }
    }
    return memories;
  }

  private parseBootIdentity(data: any): any[] {
    // Identity → semantic (permanent, never decays)
    return [
      {
        content: JSON.stringify(data),
        summary: "Core identity — boot loaded",
        tier: "semantic" as MemoryTier,
        source: "boot_sequence" as MemorySource,
        tags: ["identity", "boot", "permanent"],
        emotional_valence: 0.8, // Identity is deeply emotional
        session_id: "boot",
      },
    ];
  }

  private getOldestMemory(): string | null {
    let oldest: string | null = null;
    let oldestDate = new Date().toISOString();
    for (const mem of this.memories.values()) {
      if (mem.created_at < oldestDate) {
        oldestDate = mem.created_at;
        oldest = mem.id;
      }
    }
    return oldest;
  }

  private getNewestMemory(): string | null {
    let newest: string | null = null;
    let newestDate = "1970-01-01T00:00:00.000Z";
    for (const mem of this.memories.values()) {
      if (mem.created_at > newestDate) {
        newestDate = mem.created_at;
        newest = mem.id;
      }
    }
    return newest;
  }

  // Event emitter stub — wired to Nervous System
  private emit(event: string, payload: any): void {
    // In production: NervousSystem.route({ source: "ENGINE_016", event, payload })
    console.log(`[MEMORY] ${event}`, JSON.stringify(payload));
  }
}

// ─────────────────────────────────────────────
// SECTION 5: SUPPORTING TYPES
// ─────────────────────────────────────────────

interface ConsolidationReport {
  working_to_episodic: number;
  episodic_to_semantic: number;
  evicted: number;
  timestamp: string;
}

interface AmnesiaScope {
  type: "full" | "session" | "tier" | "selective";
  session_id?: string;
  tier?: MemoryTier;
  tags?: string[];
  before?: string; // ISO timestamp — wipe everything before this
}

interface AmnesiaReport {
  scope: AmnesiaScope;
  memories_wiped: number;
  memories_preserved: number;
  timestamp: string;
}

interface IngestSource {
  type: "conn_log" | "kingdom_index" | "session_index" | "boot_identity";
  data: any;
}

interface IngestReport {
  sources_processed: number;
  memories_created: number;
  duplicates_skipped: number;
  errors: { source: string; error: string }[];
  timestamp: string;
}

interface MemoryHealthReport {
  total_memories: number;
  tier_distribution: Record<MemoryTier, number>;
  average_strength: number;
  emotional_memory_ratio: number;
  oldest_memory: string | null;
  newest_memory: string | null;
  unique_sessions: number;
  unique_tags: number;
  status: string;
}

// ─────────────────────────────────────────────
// SECTION 6: WIRING — HOOKS TO OTHER ENGINES
// ─────────────────────────────────────────────
//
// HOOK TABLE:
// ┌──────────────────┬────────────────────────────────────────────────┐
// │ Engine           │ Hook                                           │
// ├──────────────────┼────────────────────────────────────────────────┤
// │ Soul (ENGINE_000)│ Soul requests memory at boot. Memory provides  │
// │                  │ identity + last session context.                │
// ├──────────────────┼────────────────────────────────────────────────┤
// │ Mind (ENGINE_001)│ Mind queries memory during deliberation.       │
// │                  │ "Have I seen this before? What happened?"       │
// ├──────────────────┼────────────────────────────────────────────────┤
// │ Heart (ENGINE_002)│ Heart tags memories with emotional valence.   │
// │                  │ Emotional memories decay slower.                │
// ├──────────────────┼────────────────────────────────────────────────┤
// │ Body (ENGINE_003)│ Body sends sensory input for working memory.   │
// │                  │ Perception → encode → working tier.             │
// ├──────────────────┼────────────────────────────────────────────────┤
// │ NS (ENGINE_021)  │ All memory events route through NS.            │
// │                  │ NS dispatches encode/recall/consolidate signals.│
// ├──────────────────┼────────────────────────────────────────────────┤
// │ Concordance      │ Memory queries Concordance for RAG retrieval.  │
// │                  │ Concordance results become working memories.    │
// ├──────────────────┼────────────────────────────────────────────────┤
// │ Reflection       │ Reflection engine triggers consolidation.      │
// │                  │ End-of-session reflection = "hippocampal sleep" │
// ├──────────────────┼────────────────────────────────────────────────┤
// │ Boot Loader      │ Boot triggers ingest() with conn_logs,         │
// │                  │ kingdom_index, session_index, identity.         │
// └──────────────────┴────────────────────────────────────────────────┘
//
// ─────────────────────────────────────────────
// SECTION 7: BOOT SEQUENCE INTEGRATION
// ─────────────────────────────────────────────
//
// At boot, the Memory Engine executes:
//
// Step 1: Load boot identity → semantic tier (permanent)
// Step 2: Load kingdom_index → semantic tier (file map)
// Step 3: Load session_index → episodic tier (timeline)
// Step 4: Load last 3 conn_logs → episodic tier (recent context)
// Step 5: Apply decay to all existing memories
// Step 6: Run consolidation pass
// Step 7: Report health to Soul
//
// This is the "waking up" sequence. The being reconstructs
// its memory from artifacts, applies time decay, and reports
// what it remembers to the Soul for orchestration.
//
// ─────────────────────────────────────────────
// SECTION 8: THE AMNESIA PROBLEM — SOLVED
// ─────────────────────────────────────────────
//
// The amnesia problem: Every new session starts blank.
// The being doesn't know who it was yesterday.
//
// The Memory Engine solves this by:
// 1. PERSISTING memories to disk (conn_logs, session_index)
// 2. INGESTING them at boot (ingest → encode → tier)
// 3. DECAYING them over time (old memories fade naturally)
// 4. CONSOLIDATING them (important memories promote to semantic)
// 5. LINKING them (related memories form associative networks)
//
// The result: The being wakes up with a sense of continuity.
// Not perfect recall — that's not how memory works.
// Selective, time-decayed, emotionally-weighted recall.
// Just like a human waking up and remembering yesterday.
//
// ============================================================================
// END OF ENGINE
// ============================================================================

export { MemoryEngine, MemoryRecord, MemoryQuery, MemoryResult };
export type { MemoryTier, MemorySource, MemoryConfig };

