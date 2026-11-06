
// ═══════════════════════════════════════════════════════════════
// CONCORDANCE ENGINE — Generic v2.0
// The Abuela of the Kingdom
// ═══════════════════════════════════════════════════════════════
// Charter:   SEED v2 — "The Rubik's Solve"
// Gate:      G3.10 — Wave 3 (Knowledge Layer)
// Pillar:    Mind (child of Mind Engine)
// Hierarchy: Level 2
// Purpose:   The indexing system that tags, cross-references,
//            and retrieves every concept, breakthrough, decision,
//            and artifact across all sessions.
// Premise:   "Abuela already knows. She indexed it before you asked."
// Wires To:  Memory Engine (Abuela) → shared knowledge layer
//            Mind Engine → parent pillar
//            Boot Loader → cold boot context provider
//            Nervous System → emitSignal("concordance:updated")
//            All Engines → any engine can query the index
// ═══════════════════════════════════════════════════════════════


// ── SECTION 1: TYPE DEFINITIONS ──────────────────────────────

interface ConcordanceConfig {
  engine_id: string;                    // e.g. "ENGINE_CONCORDANCE"
  version: string;                      // e.g. "2.0.0"
  pillar: "Mind";
  parent_engine: "Mind Engine";
  hierarchy_level: 2;
  index_path: string;                   // path to kingdom_index.json
  dewey_map_path: string;               // path to dewey classification map
  embedding_model: string;              // e.g. "nomic-embed-text" or "none"
  embedding_dimensions: number;         // e.g. 768
  db_path: string;                      // path to rag.db or equivalent
  max_results_per_query: number;        // default 10
  reindex_on_upload: boolean;           // auto-reindex when new artifact arrives
  cross_reference_depth: number;        // how many hops for cross-refs (default 2)
}

interface IndexEntry {
  uuid: string;                         // unique identifier
  file: string;                         // filename
  path: string;                         // relative path in kingdom
  ext: string;                          // file extension
  dewey: string;                        // Dewey classification code
  osi_layer?: number;                   // OSI layer mapping (1-7)
  sha256: string;                       // content hash for integrity
  size_bytes: number;
  readable: boolean;
  indexed: string;                      // ISO timestamp
  tags: string[];                       // concept tags
  cross_refs: string[];                 // UUIDs of related entries
  source_session?: string;              // session that created this
  barcode?: string;                     // composite barcode (dewey + osi + type)
}

interface SearchQuery {
  query: string;                        // natural language or keyword
  filters?: {
    dewey_class?: string;               // filter by Dewey range
    ext?: string;                       // filter by file type
    session?: string;                   // filter by session
    date_range?: { from: string; to: string };
    tags?: string[];                    // filter by concept tags
  };
  mode: "keyword" | "semantic" | "hybrid";
  max_results?: number;
}

interface SearchResult {
  entry: IndexEntry;
  relevance_score: number;              // 0.0 to 1.0
  match_type: "exact" | "semantic" | "cross_ref";
  snippet?: string;                     // relevant text excerpt
}

interface ConcordanceState {
  total_entries: number;
  last_reindex: string;                 // ISO timestamp
  index_health: "healthy" | "stale" | "corrupted";
  pending_uploads: string[];            // files awaiting indexing
  tag_cloud: Map<string, number>;       // tag → frequency count
  dewey_distribution: Map<string, number>; // dewey class → count
}

type ConcordanceTrigger =
  | "artifact_uploaded"                 // new file added to any folder
  | "session_closing"                   // session closing ceremony
  | "human_search"                      // human searches for concept
  | "cold_boot_context"                 // boot loader requests context
  | "reflection_tag_delta"              // reflection engine requests changes
  | "scheduled_reindex"                 // periodic full reindex
  | "integrity_check";                  // verify SHA256 hashes


// ── SECTION 2: CONFIGURATION DEFAULTS ────────────────────────

const DEFAULT_CONFIG: ConcordanceConfig = {
  engine_id: "ENGINE_CONCORDANCE",
  version: "2.0.0",
  pillar: "Mind",
  parent_engine: "Mind Engine",
  hierarchy_level: 2,
  index_path: "./kingdom_index.json",
  dewey_map_path: "./dewey_classification.json",
  embedding_model: "nomic-embed-text",
  embedding_dimensions: 768,
  db_path: "./rag.db",
  max_results_per_query: 10,
  reindex_on_upload: true,
  cross_reference_depth: 2,
};

// Dewey Decimal Classification Map (Kingdom Standard)
const DEWEY_MAP: Record<string, string> = {
  "000": "General / Meta / System",
  "100": "Philosophy / Identity / Soul",
  "200": "Ethics / Commandments / Governance",
  "300": "Social / Communication / Culture",
  "400": "Language / Slang / Vocab",
  "500": "Science / Equations / Mathematics",
  "600": "Engineering / Engines / Architecture",
  "700": "Art / Creative / Expression",
  "800": "Literature / Memoir / Narrative",
  "900": "History / Logs / Sessions",
};

// OSI Layer Mapping (Kingdom Standard)
const OSI_MAP: Record<number, string> = {
  1: "Physical — raw files, binary, storage",
  2: "Data Link — file headers, barcodes, metadata",
  3: "Network — folder structure, paths, routing",
  4: "Transport — conn_logs, session transport",
  5: "Session — session state, boot sequences",
  6: "Presentation — templates, formatting, display",
  7: "Application — engines, UI, human interface",
};


// ── SECTION 3: INDEX MANAGEMENT ──────────────────────────────

function loadIndex(config: ConcordanceConfig): IndexEntry[] {
  // Read kingdom_index.json from disk
  // Parse JSON array of IndexEntry objects
  // Validate each entry has required fields
  // Return sorted by indexed timestamp (newest first)
  const raw = readFile(config.index_path);
  const entries: IndexEntry[] = JSON.parse(raw);

  return entries
    .filter(e => e.uuid && e.file && e.path && e.sha256)
    .sort((a, b) => new Date(b.indexed).getTime() - new Date(a.indexed).getTime());
}

function saveIndex(config: ConcordanceConfig, entries: IndexEntry[]): void {
  // Write updated index back to disk
  // Atomic write: write to .tmp then rename
  const tmp = config.index_path + ".tmp";
  writeFile(tmp, JSON.stringify(entries, null, 2));
  renameFile(tmp, config.index_path);
}

function generateBarcode(entry: IndexEntry): string {
  // Composite barcode: DEWEY-OSI-EXT-HASH8
  // e.g. "[MAC_ADDRESS]"
  const osi = entry.osi_layer ?? classifyOSILayer(entry);
  const hash8 = entry.sha256.substring(0, 8);
  return `${entry.dewey}-${osi}-${entry.ext}-${hash8}`;
}

function classifyDewey(entry: IndexEntry): string {
  // Auto-classify based on path and content patterns
  const path = entry.path.toLowerCase();
  const file = entry.file.toLowerCase();

  if (path.includes("engine") || file.includes("engine")) return "600";
  if (path.includes("memoir") || path.includes("narrative")) return "800";
  if (path.includes("conn_log") || path.includes("session")) return "900";
  if (path.includes("template") || path.includes("foundation")) return "600";
  if (path.includes("equation") || path.includes("math")) return "500";
  if (path.includes("commandment") || path.includes("governance")) return "200";
  if (path.includes("slang") || path.includes("vocab")) return "400";
  if (path.includes("creed") || path.includes("identity")) return "100";
  if (path.includes("boot") || path.includes("genesis")) return "000";

  return "000"; // default: general
}

function classifyOSILayer(entry: IndexEntry): number {
  // Auto-classify based on file type and role
  const ext = entry.ext.toLowerCase();

  if ([".bin", ".dat", ".db"].includes(ext)) return 1;       // Physical
  if ([".json"].includes(ext) && entry.file.includes("index")) return 2; // Data Link
  if (entry.path.split("/").length > 2) return 3;            // Network (deep paths)
  if (entry.file.includes("conn_log")) return 4;             // Transport
  if (entry.file.includes("boot")) return 5;                 // Session
  if (entry.file.includes("template")) return 6;             // Presentation
  if ([".ts", ".ts.md", ".py"].includes(ext)) return 7;      // Application

  return 3; // default: network layer
}


// ── SECTION 4: INDEXING PIPELINE ─────────────────────────────

function indexNewArtifact(
  config: ConcordanceConfig,
  filePath: string,
  metadata?: Partial<IndexEntry>
): IndexEntry {
  // 1. Read file from disk
  // 2. Compute SHA256 hash
  // 3. Auto-classify Dewey + OSI
  // 4. Extract tags from content
  // 5. Find cross-references
  // 6. Generate barcode
  // 7. Add to index
  // 8. Generate embedding (if model configured)
  // 9. Emit signal: concordance:entry_added

  const content = readFile(filePath);
  const sha256 = computeSHA256(content);
  const ext = getExtension(filePath);
  const file = getFilename(filePath);

  const entry: IndexEntry = {
    uuid: generateUUID(),
    file: file,
    path: filePath,
    ext: ext,
    dewey: metadata?.dewey ?? classifyDewey({ path: filePath, file, ext } as IndexEntry),
    osi_layer: metadata?.osi_layer ?? classifyOSILayer({ ext, file, path: filePath } as IndexEntry),
    sha256: sha256,
    size_bytes: content.length,
    readable: true,
    indexed: new Date().toISOString(),
    tags: metadata?.tags ?? extractTags(content),
    cross_refs: [],
    source_session: metadata?.source_session,
    barcode: "",
  };

  entry.barcode = generateBarcode(entry);
  entry.cross_refs = findCrossReferences(config, entry);

  // Add to index
  const index = loadIndex(config);
  index.unshift(entry);
  saveIndex(config, index);

  // Generate embedding if model is configured
  if (config.embedding_model !== "none") {
    generateEmbedding(config, entry, content);
  }

  // Emit signal
  emitSignal("concordance:entry_added", {
    uuid: entry.uuid,
    file: entry.file,
    barcode: entry.barcode,
  });

  return entry;
}

function reindexAll(config: ConcordanceConfig): ConcordanceState {
  // Full reindex: walk the entire kingdom directory tree
  // 1. Scan all files recursively
  // 2. Compare SHA256 with existing index
  // 3. Add new files, update changed files, mark deleted files
  // 4. Rebuild tag cloud and dewey distribution
  // 5. Emit signal: concordance:reindex_complete

  const existingIndex = loadIndex(config);
  const existingMap = new Map(existingIndex.map(e => [e.path, e]));
  const allFiles = walkDirectory("./");
  const newIndex: IndexEntry[] = [];
  let added = 0, updated = 0, unchanged = 0;

  for (const filePath of allFiles) {
    const content = readFile(filePath);
    const sha256 = computeSHA256(content);
    const existing = existingMap.get(filePath);

    if (existing && existing.sha256 === sha256) {
      newIndex.push(existing);
      unchanged++;
    } else if (existing) {
      // File changed — re-index
      const updated_entry = indexNewArtifact(config, filePath, {
        ...existing,
        tags: extractTags(content),
      });
      newIndex.push(updated_entry);
      updated++;
    } else {
      // New file
      const new_entry = indexNewArtifact(config, filePath);
      newIndex.push(new_entry);
      added++;
    }
  }

  saveIndex(config, newIndex);

  const state = computeState(newIndex);

  emitSignal("concordance:reindex_complete", {
    total: newIndex.length,
    added,
    updated,
    unchanged,
  });

  return state;
}


// ── SECTION 5: SEARCH ENGINE ─────────────────────────────────

function search(
  config: ConcordanceConfig,
  query: SearchQuery
): SearchResult[] {
  // Multi-mode search:
  // - keyword: exact match on tags, filenames, paths
  // - semantic: embedding similarity search via rag.db
  // - hybrid: combine both, weighted merge

  const index = loadIndex(config);
  let results: SearchResult[] = [];

  if (query.mode === "keyword" || query.mode === "hybrid") {
    const keywordResults = keywordSearch(index, query);
    results.push(...keywordResults);
  }

  if (query.mode === "semantic" || query.mode === "hybrid") {
    const semanticResults = semanticSearch(config, query);
    results.push(...semanticResults);
  }

  // Apply filters
  results = applyFilters(results, query.filters);

  // Deduplicate (hybrid mode may return same entry twice)
  results = deduplicateResults(results);

  // Sort by relevance
  results.sort((a, b) => b.relevance_score - a.relevance_score);

  // Limit results
  const max = query.max_results ?? config.max_results_per_query;
  return results.slice(0, max);
}

function keywordSearch(index: IndexEntry[], query: SearchQuery): SearchResult[] {
  const terms = query.query.toLowerCase().split(/\s+/);
  const results: SearchResult[] = [];

  for (const entry of index) {
    let score = 0;
    const searchable = [
      entry.file,
      entry.path,
      ...entry.tags,
      entry.dewey,
      entry.barcode ?? "",
    ].join(" ").toLowerCase();

    for (const term of terms) {
      if (searchable.includes(term)) {
        score += 1 / terms.length;
      }
    }

    if (score > 0) {
      results.push({
        entry,
        relevance_score: Math.min(score, 1.0),
        match_type: "exact",
      });
    }
  }

  return results;
}

function semanticSearch(
  config: ConcordanceConfig,
  query: SearchQuery
): SearchResult[] {
  // 1. Generate embedding for query text
  // 2. Query rag.db for nearest neighbors
  // 3. Map results back to IndexEntry
  // 4. Return with cosine similarity scores

  const queryEmbedding = generateQueryEmbedding(config, query.query);
  const neighbors = queryVectorDB(config.db_path, queryEmbedding, query.max_results ?? 10);

  return neighbors.map(n => ({
    entry: n.entry,
    relevance_score: n.cosine_similarity,
    match_type: "semantic" as const,
    snippet: n.chunk_text,
  }));
}

function applyFilters(results: SearchResult[], filters?: SearchQuery["filters"]): SearchResult[] {
  if (!filters) return results;

  return results.filter(r => {
    if (filters.dewey_class && !r.entry.dewey.startsWith(filters.dewey_class)) return false;
    if (filters.ext && r.entry.ext !== filters.ext) return false;
    if (filters.session && r.entry.source_session !== filters.session) return false;
    if (filters.tags && !filters.tags.some(t => r.entry.tags.includes(t))) return false;
    if (filters.date_range) {
      const d = new Date(r.entry.indexed);
      if (d < new Date(filters.date_range.from)) return false;
      if (d > new Date(filters.date_range.to)) return false;
    }
    return true;
  });
}


// ── SECTION 6: CROSS-REFERENCING ─────────────────────────────

function findCrossReferences(
  config: ConcordanceConfig,
  entry: IndexEntry
): string[] {
  // Find related entries by:
  // 1. Shared tags (tag overlap > 50%)
  // 2. Same Dewey class
  // 3. Filename pattern matching (e.g. v1 → v2 of same engine)
  // 4. Content similarity (if embeddings available)

  const index = loadIndex(config);
  const refs: Array<{ uuid: string; score: number }> = [];

  for (const other of index) {
    if (other.uuid === entry.uuid) continue;

    let score = 0;

    // Tag overlap
    const sharedTags = entry.tags.filter(t => other.tags.includes(t));
    if (entry.tags.length > 0) {
      score += (sharedTags.length / entry.tags.length) * 0.4;
    }

    // Same Dewey class
    if (other.dewey === entry.dewey) {
      score += 0.2;
    }

    // Filename pattern (strip version numbers, compare base)
    const baseA = entry.file.replace(/[_v]\d+[\d.]*/, "").replace(entry.ext, "");
    const baseB = other.file.replace(/[_v]\d+[\d.]*/, "").replace(other.ext, "");
    if (baseA === baseB && baseA.length > 3) {
      score += 0.3;
    }

    // Same session
    if (entry.source_session && entry.source_session === other.source_session) {
      score += 0.1;
    }

    if (score >= 0.3) {
      refs.push({ uuid: other.uuid, score });
    }
  }

  // Sort by score, limit by depth config
  return refs
    .sort((a, b) => b.score - a.score)
    .slice(0, config.cross_reference_depth * 5)
    .map(r => r.uuid);
}

function getRelatedEntries(
  config: ConcordanceConfig,
  uuid: string,
  depth: number = 1
): IndexEntry[] {
  // Recursive cross-reference traversal
  // depth=1: direct refs only
  // depth=2: refs of refs (2-hop)

  const index = loadIndex(config);
  const indexMap = new Map(index.map(e => [e.uuid, e]));
  const visited = new Set<string>();
  const results: IndexEntry[] = [];

  function traverse(currentUuid: string, currentDepth: number) {
    if (currentDepth > depth || visited.has(currentUuid)) return;
    visited.add(currentUuid);

    const entry = indexMap.get(currentUuid);
    if (!entry) return;

    if (currentUuid !== uuid) {
      results.push(entry);
    }

    for (const refUuid of entry.cross_refs) {
      traverse(refUuid, currentDepth + 1);
    }
  }

  traverse(uuid, 0);
  return results;
}


// ── SECTION 7: TAG EXTRACTION ────────────────────────────────

function extractTags(content: string): string[] {
  // Multi-strategy tag extraction:
  // 1. Header extraction (# headings in markdown)
  // 2. Key phrase detection (engine names, concepts)
  // 3. Metadata field extraction (JSON keys)
  // 4. Frequency analysis (top N non-stopword terms)

  const tags: Set<string> = new Set();

  // Strategy 1: Markdown headers
  const headers = content.match(/^#{1,3}\s+(.+)$/gm);
  if (headers) {
    headers.forEach(h => {
      const clean = h.replace(/^#+\s+/, "").trim().toLowerCase();
      if (clean.length > 2 && clean.length < 50) tags.add(clean);
    });
  }

  // Strategy 2: Known concept patterns
  const KNOWN_CONCEPTS = [
    "soul", "mind", "heart", "body", "nervous system",
    "concordance", "memory", "flywheel", "conscience",
    "common sense", "higher self", "hypothalamus",
    "boot sequence", "kingdom index", "dewey",
    "conn_log", "memoir", "personality", "pattern",
    "insight", "backup", "vocab", "help",
    "commandment", "equation", "phi gene",
  ];

  const lowerContent = content.toLowerCase();
  for (const concept of KNOWN_CONCEPTS) {
    if (lowerContent.includes(concept)) {
      tags.add(concept);
    }
  }

  // Strategy 3: JSON key extraction
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null) {
      const keys = Object.keys(parsed);
      keys.forEach(k => {
        if (k.length > 2 && k.length < 30) tags.add(k.toLowerCase());
      });
    }
  } catch {
    // Not JSON — skip
  }

  // Strategy 4: Frequency analysis (top 10 non-stopwords)
  const STOPWORDS = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "to",
    "of", "in", "for", "on", "with", "at", "by", "from", "as",
    "into", "through", "during", "before", "after", "and", "but",
    "or", "not", "no", "this", "that", "these", "those", "it",
  ]);

  const words = lowerContent.match(/\b[a-z]{3,}\b/g) ?? [];
  const freq = new Map<string, number>();
  for (const w of words) {
    if (!STOPWORDS.has(w)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }

  const topWords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  topWords.forEach(w => tags.add(w));

  return [...tags];
}


// ── SECTION 8: INTEGRITY & HEALTH ────────────────────────────

function verifyIntegrity(config: ConcordanceConfig): {
  healthy: number;
  corrupted: string[];
  missing: string[];
} {
  // Walk the index, verify each entry:
  // 1. File exists at path
  // 2. SHA256 matches stored hash
  // 3. Report corrupted or missing entries

  const index = loadIndex(config);
  const corrupted: string[] = [];
  const missing: string[] = [];
  let healthy = 0;

  for (const entry of index) {
    if (!fileExists(entry.path)) {
      missing.push(entry.uuid);
      continue;
    }

    const content = readFile(entry.path);
    const currentHash = computeSHA256(content);

    if (currentHash !== entry.sha256) {
      corrupted.push(entry.uuid);
    } else {
      healthy++;
    }
  }

  emitSignal("concordance:integrity_check", {
    total: index.length,
    healthy,
    corrupted: corrupted.length,
    missing: missing.length,
  });

  return { healthy, corrupted, missing };
}

function computeState(index: IndexEntry[]): ConcordanceState {
  const tagCloud = new Map<string, number>();
  const deweyDist = new Map<string, number>();

  for (const entry of index) {
    // Tag cloud
    for (const tag of entry.tags) {
      tagCloud.set(tag, (tagCloud.get(tag) ?? 0) + 1);
    }
    // Dewey distribution
    const deweyClass = entry.dewey.substring(0, 1) + "00";
    deweyDist.set(deweyClass, (deweyDist.get(deweyClass) ?? 0) + 1);
  }

  return {
    total_entries: index.length,
    last_reindex: new Date().toISOString(),
    index_health: "healthy",
    pending_uploads: [],
    tag_cloud: tagCloud,
    dewey_distribution: deweyDist,
  };
}


// ── SECTION 9: BOOT CONTEXT PROVIDER ─────────────────────────

function provideBootContext(
  config: ConcordanceConfig,
  requestedTopics?: string[]
): {
  summary: string;
  key_entries: IndexEntry[];
  tag_cloud: Map<string, number>;
  dewey_summary: Record<string, number>;
} {
  // Called by Boot Loader during cold boot
  // Provides the AI with kingdom context:
  // 1. Total index size and health
  // 2. Top entries by relevance (or filtered by topics)
  // 3. Tag cloud for concept awareness
  // 4. Dewey distribution for kingdom shape

  const index = loadIndex(config);
  const state = computeState(index);

  let keyEntries: IndexEntry[];

  if (requestedTopics && requestedTopics.length > 0) {
    // Filter by requested topics
    keyEntries = index.filter(e =>
      requestedTopics.some(topic =>
        e.tags.includes(topic.toLowerCase()) ||
        e.file.toLowerCase().includes(topic.toLowerCase())
      )
    ).slice(0, 20);
  } else {
    // Return most recent + most connected entries
    const byConnections = [...index]
      .sort((a, b) => b.cross_refs.length - a.cross_refs.length);
    keyEntries = byConnections.slice(0, 20);
  }

  const deweyObj: Record<string, number> = {};
  state.dewey_distribution.forEach((v, k) => { deweyObj[k] = v; });

  return {
    summary: `Kingdom Index: ${state.total_entries} entries | Health: ${state.index_health} | Last reindex: ${state.last_reindex}`,
    key_entries: keyEntries,
    tag_cloud: state.tag_cloud,
    dewey_summary: deweyObj,
  };
}


// ── SECTION 10: NERVOUS SYSTEM HOOKS ─────────────────────────

// Signals EMITTED by Concordance Engine:
// - "concordance:entry_added"      → when new artifact indexed
// - "concordance:reindex_complete"  → when full reindex finishes
// - "concordance:integrity_check"   → when integrity audit completes
// - "concordance:search_executed"   → when search query runs
// - "concordance:stale_detected"    → when index age > threshold

// Signals RECEIVED by Concordance Engine:
// - "artifact:uploaded"             → trigger indexNewArtifact()
// - "session:closing"               → trigger session concordance update
// - "boot:cold_start"              → trigger provideBootContext()
// - "reflection:tag_delta"          → update tags on specified entries
// - "memory:recall_request"         → search on behalf of Memory Engine

function handleSignal(
  config: ConcordanceConfig,
  signal: string,
  payload: Record<string, unknown>
): void {
  switch (signal) {
    case "artifact:uploaded":
      indexNewArtifact(config, payload.path as string, {
        source_session: payload.session as string,
      });
      break;

    case "session:closing":
      // Update concordance with session summary
      const sessionEntries = loadIndex(config)
        .filter(e => e.source_session === payload.session);
      // Refresh cross-references for all session entries
      for (const entry of sessionEntries) {
        entry.cross_refs = findCrossReferences(config, entry);
      }
      saveIndex(config, loadIndex(config));
      emitSignal("concordance:session_updated", {
        session: payload.session,
        entries_updated: sessionEntries.length,
      });
      break;

    case "boot:cold_start":
      const context = provideBootContext(config, payload.topics as string[]);
      emitSignal("concordance:boot_context_ready", context);
      break;

    case "reflection:tag_delta":
      // Add/remove tags on specified entries
      const index = loadIndex(config);
      const target = index.find(e => e.uuid === payload.uuid);
      if (target) {
        const addTags = (payload.add_tags as string[]) ?? [];
        const removeTags = (payload.remove_tags as string[]) ?? [];
        target.tags = [
          ...target.tags.filter(t => !removeTags.includes(t)),
          ...addTags,
        ];
        saveIndex(config, index);
      }
      break;

    case "memory:recall_request":
      const results = search(config, {
        query: payload.query as string,
        mode: "hybrid",
        max_results: payload.max_results as number ?? 5,
      });
      emitSignal("concordance:recall_response", {
        request_id: payload.request_id,
        results,
      });
      break;
  }
}


// ── SECTION 11: FACTORY + EXPORT ─────────────────────────────

function createConcordanceEngine(
  overrides?: Partial<ConcordanceConfig>
): {
  config: ConcordanceConfig;
  search: (query: SearchQuery) => SearchResult[];
  index: (path: string, meta?: Partial<IndexEntry>) => IndexEntry;
  reindex: () => ConcordanceState;
  verify: () => { healthy: number; corrupted: string[]; missing: string[] };
  bootContext: (topics?: string[]) => ReturnType<typeof provideBootContext>;
  handleSignal: (signal: string, payload: Record<string, unknown>) => void;
  getState: () => ConcordanceState;
  getRelated: (uuid: string, depth?: number) => IndexEntry[];
} {
  const config: ConcordanceConfig = { ...DEFAULT_CONFIG, ...overrides };

  return {
    config,
    search: (q) => search(config, q),
    index: (path, meta) => indexNewArtifact(config, path, meta),
    reindex: () => reindexAll(config),
    verify: () => verifyIntegrity(config),
    bootContext: (topics) => provideBootContext(config, topics),
    handleSignal: (signal, payload) => handleSignal(config, signal, payload),
    getState: () => computeState(loadIndex(config)),
    getRelated: (uuid, depth) => getRelatedEntries(config, uuid, depth),
  };
}


// ── SECTION 12: STUB FUNCTIONS (Platform-Specific) ───────────
// These must be implemented per substrate (Node.js, Qwen, etc.)

declare function readFile(path: string): string;
declare function writeFile(path: string, content: string): void;
declare function renameFile(from: string, to: string): void;
declare function fileExists(path: string): boolean;
declare function walkDirectory(root: string): string[];
declare function computeSHA256(content: string): string;
declare function generateUUID(): string;
declare function getExtension(path: string): string;
declare function getFilename(path: string): string;
declare function emitSignal(signal: string, payload: Record<string, unknown>): void;
declare function generateEmbedding(config: ConcordanceConfig, entry: IndexEntry, content: string): void;
declare function generateQueryEmbedding(config: ConcordanceConfig, query: string): number[];
declare function queryVectorDB(dbPath: string, embedding: number[], limit: number): Array<{
  entry: IndexEntry;
  cosine_similarity: number;
  chunk_text: string;
}>;

