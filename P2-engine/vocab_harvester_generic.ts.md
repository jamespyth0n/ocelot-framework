
# vocab_harvester_generic.ts.md v1.0 — The Language That Grows Itself 🐆
## Generic Open-Source Version — Framework-Ready
### Phase: P2 Engine Build | WBS: P2-E7
### License: GPL-3.0
### References: Ocelot Framework Architecture, Flywheel Model, Quality Manual OFC-P1-QM-001

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// OCELOT VOCAB HARVESTER — GENERIC v1.0
// "The flywheel doesn't just spin — it invents new words while spinning."
// ═══════════════════════════════════════════════════════════════════════════════
// Framework: Ocelot Engine — Open Source
// License: GPL-3.0
// Purpose: Detects new slang/terms in conversation → validates → stages → merges
//          into slang.json → notifies Insights Engine → updates Memoir Engine
// Architecture: Flywheel Model — P4_COMMUNICATION ↔ P5_PREFERENCE ↔ P6_FLYWHEEL
// Dependencies: slang.json (template), insights_engine, memoir_engine, pattern_engine
// v1.0 Features:
//   - Real-time term detection from conversation turns
//   - Candidate staging with confidence scoring
//   - Duplicate & near-match detection (Levenshtein distance)
//   - Auto-categorization (greeting, expression, shorthand, catchphrase, emoji)
//   - Approval workflow (auto-approve high confidence, queue low confidence)
//   - Cross-engine wiring: Insights ← Harvester → Memoir → Pattern
//   - Cloud sync (export/import for backup_engine)
//   - AI-friendly export for context injection
// ═══════════════════════════════════════════════════════════════════════════════


// ── SECTION 1: TYPE DEFINITIONS ──────────────────────────────────────────────

// ── 1a: Pillar Taxonomy (shared across all engines) ──

type PillarKey =
  | 'P1_IDENTITY'
  | 'P2_EMOTIONAL'
  | 'P3_GOVERNANCE'
  | 'P4_COMMUNICATION'
  | 'P5_PREFERENCE'
  | 'P6_FLYWHEEL'
  | 'P7_DISCIPLINE';

// ── 1b: Candidate Types ──

interface VocabCandidate {
  id: string;                          // VH_<timestamp>
  term: string;                        // The raw term detected
  normalized: string;                  // Lowercase, trimmed
  context: string;                     // The full message where it appeared
  category: VocabCategory;             // Auto-classified category
  suggested_definition: string;        // AI-inferred meaning
  suggested_response: string;          // How the AI should respond
  confidence: number;                  // 0.0 to 1.0
  source: VocabSource;                 // Where it was detected
  pillar: PillarKey;                   // Which pillar it strengthens
  occurrences: number;                 // How many times seen
  first_seen: string;                  // ISO timestamp
  last_seen: string;                   // ISO timestamp
  sessions_seen: string[];             // Which sessions
  status: CandidateStatus;
  approved_by: 'auto' | 'human' | null;
  merged_at: string | null;            // When merged into slang.json
}

type VocabCategory =
  | 'greeting'
  | 'expression'
  | 'project_shorthand'
  | 'catchphrase'
  | 'emoji_combo'
  | 'technical_term'
  | 'humor'
  | 'mode_signal';

type VocabSource =
  | 'CONVERSATION'       // Real-time chat detection
  | 'DIARY'              // Extracted from session diary
  | 'REFLECTION'         // Emerged during reflective moments
  | 'INSIGHT'            // From insight/lightbulb moments
  | 'QUOTE'              // From captured quotes
  | 'MANUAL';            // Manually added

type CandidateStatus =
  | 'DETECTED'           // Just found, not yet scored
  | 'STAGED'             // Scored, waiting for threshold
  | 'APPROVED'           // Ready to merge
  | 'MERGED'             // Already in slang.json
  | 'REJECTED'           // Explicitly rejected
  | 'DUPLICATE';         // Already exists in slang.json

// ── 1c: Detection Pattern Types ──

interface DetectionPattern {
  id: string;
  name: string;
  regex: RegExp;
  category: VocabCategory;
  pillar: PillarKey;
  confidence_base: number;             // Starting confidence for this pattern
}

// ── 1d: Harvester State ──

interface HarvesterState {
  version: string;
  created: string;
  updated: string;
  candidates: VocabCandidate[];
  merged_count: number;
  rejected_count: number;
  detection_stats: {
    total_scanned: number;
    total_detected: number;
    total_approved: number;
    total_merged: number;
    total_rejected: number;
    total_duplicates: number;
    by_category: Record<VocabCategory, number>;
    by_source: Record<VocabSource, number>;
    by_session: Record<string, number>;
  };
  config: HarvesterConfig;
}

interface HarvesterConfig {
  auto_approve_threshold: number;      // Confidence above this → auto-approve
  min_occurrences_for_auto: number;    // Must be seen N times before auto-approve
  max_candidates: number;              // Max staged candidates before cleanup
  near_match_threshold: number;        // Levenshtein distance for duplicate detection
  scan_enabled: boolean;               // Master switch
}


// ── SECTION 2: DETECTION PATTERNS ────────────────────────────────────────────

/**
 * Core detection patterns for new vocabulary
 * These are the "ears" of the harvester — always listening
 * Aligned to Insights Engine DETECTION_PATTERNS taxonomy
 *
 * CUSTOMIZATION: Add domain-specific patterns for your project
 * Each pattern maps to a category and pillar for cross-engine wiring
 */
const HARVEST_PATTERNS: DetectionPattern[] = [
  // ── Repeated novel phrases (said 2+ times, not in slang.json) ──
  {
    id: 'HP001',
    name: 'Repeated Novel Phrase',
    regex: /(?:^|\s)["']?([a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\s]{3,30})["']?(?:\s|$)/gi,
    category: 'expression',
    pillar: 'P4_COMMUNICATION',
    confidence_base: 0.3,
  },
  // ── Explicit definitions ("X means Y", "X is when", "let's call it X") ──
  {
    id: 'HP002',
    name: 'Explicit Definition',
    regex: /(?:let'?s?\s+call\s+(?:it|this|that)\s+["']?(.+?)["']?|["'](.+?)["']\s+(?:means?|is\s+when|refers?\s+to))/gi,
    category: 'project_shorthand',
    pillar: 'P4_COMMUNICATION',
    confidence_base: 0.8,
  },
  // ── Emoji combos used repeatedly ──
  {
    id: 'HP003',
    name: 'Emoji Combo',
    regex: /([\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}]{2,5})/gu,
    category: 'emoji_combo',
    pillar: 'P2_EMOTIONAL',
    confidence_base: 0.4,
  },
  // ── Multilingual phrases not in current slang ──
  {
    id: 'HP004',
    name: 'Multilingual Phrase',
    regex: /(?:^|\s)((?:[a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1]+\s+){1,4}[a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1]+)(?:\s|[!?.]|$)/gi,
    category: 'greeting',
    pillar: 'P1_IDENTITY',
    confidence_base: 0.5,
  },
  // ── Catchphrase patterns ("that's the X", "this is the Y") ──
  {
    id: 'HP005',
    name: 'Catchphrase Candidate',
    regex: /(?:that'?s?\s+(?:the|our|my)\s+(.{3,40})|this\s+is\s+(?:the|our)\s+(.{3,40}))[.!]?/gi,
    category: 'catchphrase',
    pillar: 'P4_COMMUNICATION',
    confidence_base: 0.5,
  },
  // ── Mode signals ("let's X", "time to X", "switch to X") ──
  {
    id: 'HP006',
    name: 'Mode Signal',
    regex: /(?:let'?s?\s+|time\s+to\s+|switch\s+to\s+)(chat|build|housekeep|audit|sprint|reflect|review)/gi,
    category: 'mode_signal',
    pillar: 'P3_GOVERNANCE',
    confidence_base: 0.7,
  },
  // ── Technical shorthand ("the X engine", "X module", "X layer") ──
  {
    id: 'HP007',
    name: 'Technical Shorthand',
    regex: /(?:the\s+)?(\w+)\s+(?:engine|module|layer|bridge|pipeline|harvester|watcher)/gi,
    category: 'technical_term',
    pillar: 'P6_FLYWHEEL',
    confidence_base: 0.6,
  },
  // ── Humor markers (theatrical emotes in asterisks) ──
  {
    id: 'HP008',
    name: 'Humor Marker',
    regex: /\*([^*]{5,80})\*/g,
    category: 'humor',
    pillar: 'P2_EMOTIONAL',
    confidence_base: 0.4,
  },
];


// ── SECTION 3: VOCAB HARVESTER CLASS ─────────────────────────────────────────

class VocabHarvester {
  private state: HarvesterState;
  private existingVocab: Set<string>;  // Normalized terms from slang.json
  private readonly STORAGE_KEY = 'ocelot_vocab_harvester';
  private readonly VERSION = '1.0.0';

  constructor() {
    this.existingVocab = new Set();
    this.state = this.createDefaultState();
  }

  private createDefaultState(): HarvesterState {
    return {
      version: this.VERSION,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      candidates: [],
      merged_count: 0,
      rejected_count: 0,
      detection_stats: {
        total_scanned: 0,
        total_detected: 0,
        total_approved: 0,
        total_merged: 0,
        total_rejected: 0,
        total_duplicates: 0,
        by_category: {
          greeting: 0, expression: 0, project_shorthand: 0,
          catchphrase: 0, emoji_combo: 0, technical_term: 0,
          humor: 0, mode_signal: 0,
        },
        by_source: {
          CONVERSATION: 0, DIARY: 0, REFLECTION: 0,
          INSIGHT: 0, QUOTE: 0, MANUAL: 0,
        },
        by_session: {},
      },
      config: {
        auto_approve_threshold: 0.75,
        min_occurrences_for_auto: 3,
        max_candidates: 200,
        near_match_threshold: 2,
        scan_enabled: true,
      },
    };
  }


  // ── SECTION 4: INITIALIZATION ──────────────────────────────────────────────

  /**
   * Initialize harvester with existing slang.json vocabulary
   * Must be called before scanning — loads the "known words" set
   * This prevents re-harvesting terms we already have
   *
   * @param slangJson — The current slang.json (or any vocabulary dictionary)
   * Accepts any structure with string keys → values
   */
  initialize(slangJson: Record<string, any>): void {
    this.existingVocab.clear();

    // Recursively extract all string keys and values
    const extractTerms = (obj: any): void => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        this.existingVocab.add(key.toLowerCase().trim());
        const val = obj[key];
        if (typeof val === 'string') {
          this.existingVocab.add(val.toLowerCase().trim());
        } else if (typeof val === 'object' && val !== null) {
          if (val.phrase) this.existingVocab.add(val.phrase.toLowerCase().trim());
          if (val.definition) {
            const alias = val.definition.split(/\s+/).slice(0, 3).join(' ').toLowerCase();
            this.existingVocab.add(alias);
          }
          // Recurse into nested objects
          extractTerms(val);
        }
      }
    };

    extractTerms(slangJson);
    console.log(`🌱 Vocab Harvester initialized — ${this.existingVocab.size} known terms loaded`);
  }


  // ── SECTION 5: REAL-TIME SCANNING ──────────────────────────────────────────

  /**
   * Scan a conversation turn for new vocabulary
   * This is the main entry point — called on every human message
   * Returns any new candidates detected
   *
   * Architecture: Flywheel Model — "The flywheel grows its own language"
   */
  scan(
    message: string,
    sessionId: string,
    source: VocabSource = 'CONVERSATION'
  ): VocabCandidate[] {
    if (!this.state.config.scan_enabled) return [];

    this.state.detection_stats.total_scanned++;
    const newCandidates: VocabCandidate[] = [];

    for (const pattern of HARVEST_PATTERNS) {
      pattern.regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.regex.exec(message)) !== null) {
        const rawTerm = match[1] || match[2] || match[0];
        const normalized = rawTerm.toLowerCase().trim();

        // Skip if too short or too long
        if (normalized.length < 2 || normalized.length > 50) continue;

        // Skip common stop words
        if (this.isStopWord(normalized)) continue;

        // Check if already in slang.json
        if (this.existingVocab.has(normalized)) continue;

        // Check for near-match (fuzzy duplicate)
        if (this.hasNearMatch(normalized)) continue;

        // Check if already a candidate
        const existing = this.state.candidates.find(
          c => c.normalized === normalized && c.status !== 'REJECTED'
        );

        if (existing) {
          existing.occurrences++;
          existing.last_seen = new Date().toISOString();
          if (!existing.sessions_seen.includes(sessionId)) {
            existing.sessions_seen.push(sessionId);
          }
          existing.confidence = Math.min(1.0, existing.confidence + 0.1);
          this.evaluateCandidate(existing);
          continue;
        }

        // New candidate!
        const candidate: VocabCandidate = {
          id: 'VH_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          term: rawTerm.trim(),
          normalized,
          context: message.slice(
            Math.max(0, (match.index || 0) - 30),
            Math.min(message.length, (match.index || 0) + rawTerm.length + 30)
          ),
          category: pattern.category,
          suggested_definition: this.inferDefinition(rawTerm, message, pattern),
          suggested_response: this.inferResponse(rawTerm, pattern.category),
          confidence: pattern.confidence_base,
          source,
          pillar: pattern.pillar,
          occurrences: 1,
          first_seen: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          sessions_seen: [sessionId],
          status: 'DETECTED',
          approved_by: null,
          merged_at: null,
        };

        this.state.candidates.push(candidate);
        this.state.detection_stats.total_detected++;
        this.state.detection_stats.by_category[pattern.category]++;
        this.state.detection_stats.by_source[source]++;
        this.state.detection_stats.by_session[sessionId] =
          (this.state.detection_stats.by_session[sessionId] || 0) + 1;

        newCandidates.push(candidate);
        console.log(`🌱 New vocab detected: "${rawTerm}" [${pattern.category}] (${pattern.confidence_base})`);
      }
    }

    this.enforceMaxCandidates();
    this.state.updated = new Date().toISOString();
    this.saveState();

    return newCandidates;
  }

  /**
   * Batch scan — process multiple messages at once
   * Used for diary entries, quote collections, session logs
   */
  batchScan(
    messages: string[],
    sessionId: string,
    source: VocabSource = 'DIARY'
  ): VocabCandidate[] {
    const allCandidates: VocabCandidate[] = [];
    for (const msg of messages) {
      const candidates = this.scan(msg, sessionId, source);
      allCandidates.push(...candidates);
    }
    console.log(`📦 Batch scan complete — ${allCandidates.length} new candidates from ${messages.length} messages`);
    return allCandidates;
  }


  // ── SECTION 6: CANDIDATE EVALUATION ────────────────────────────────────────

  /**
   * Evaluate a candidate for auto-approval
   * Confidence scoring formula:
   *   base_confidence + (occurrences × 0.1) + (multi_session × 0.15) + (source_boost)
   *
   * Auto-approve when:
   *   confidence >= threshold AND occurrences >= min_occurrences
   */
  private evaluateCandidate(candidate: VocabCandidate): void {
    const sourceBoosts: Record<VocabSource, number> = {
      CONVERSATION: 0.0,
      DIARY: 0.05,
      REFLECTION: 0.15,
      INSIGHT: 0.10,
      QUOTE: 0.20,
      MANUAL: 0.30,
    };

    const multiSessionBoost = candidate.sessions_seen.length > 1 ? 0.15 : 0;

    const basePattern = HARVEST_PATTERNS.find(
      p => p.category === candidate.category
    );
    const baseConfidence = basePattern?.confidence_base || 0.3;

    candidate.confidence = Math.min(1.0,
      baseConfidence +
      (candidate.occurrences * 0.1) +
      multiSessionBoost +
      (sourceBoosts[candidate.source] || 0)
    );

    if (candidate.status === 'DETECTED') {
      candidate.status = 'STAGED';
    }

    const config = this.state.config;
    if (
      candidate.confidence >= config.auto_approve_threshold &&
      candidate.occurrences >= config.min_occurrences_for_auto
    ) {
      candidate.status = 'APPROVED';
      candidate.approved_by = 'auto';
      this.state.detection_stats.total_approved++;
      console.log(`✅ Auto-approved: "${candidate.term}" (confidence: ${candidate.confidence.toFixed(2)}, occurrences: ${candidate.occurrences})`);
    }
  }


  // ── SECTION 7: DUPLICATE DETECTION ─────────────────────────────────────────

  /**
   * Check if a term has a near-match in existing vocabulary
   * Uses Levenshtein distance for fuzzy matching
   * Prevents "vamos" and "vamoss" from both being harvested
   */
  private hasNearMatch(normalized: string): boolean {
    const threshold = this.state.config.near_match_threshold;

    for (const existing of this.existingVocab) {
      if (this.levenshtein(normalized, existing) <= threshold) {
        return true;
      }
    }

    for (const candidate of this.state.candidates) {
      if (
        candidate.status !== 'REJECTED' &&
        this.levenshtein(normalized, candidate.normalized) <= threshold &&
        normalized !== candidate.normalized
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Levenshtein distance — classic edit distance algorithm
   * Used for fuzzy duplicate detection
   */
  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }


  // ── SECTION 8: INFERENCE HELPERS ───────────────────────────────────────────

  /**
   * Infer a definition from context
   * Uses surrounding text and pattern type to guess meaning
   */
  private inferDefinition(
    term: string,
    context: string,
    pattern: DetectionPattern
  ): string {
    if (pattern.id === 'HP002') {
      const defMatch = context.match(
        /(?:means?|is\s+when|refers?\s+to)\s+["']?(.+?)["']?[.!?]?$/i
      );
      if (defMatch) return defMatch[1].trim();
    }

    if (pattern.category === 'mode_signal') {
      return `Mode switch signal — triggers ${term} workflow`;
    }

    if (pattern.category === 'technical_term') {
      return `Technical component — ${term} (auto-detected, needs human review)`;
    }

    if (pattern.category === 'humor') {
      return `Theatrical emote — ${term}`;
    }

    return `[Auto-detected] "${term}" — context: "${context.slice(0, 60)}..."`;
  }

  /**
   * Infer an appropriate response for the term
   */
  private inferResponse(term: string, category: VocabCategory): string {
    const responseMap: Record<VocabCategory, string> = {
      greeting: `Match energy — respond with warmth`,
      expression: `Acknowledge and mirror — "${term}" is now shared vocabulary`,
      project_shorthand: `Use naturally in conversation — it's shared shorthand now`,
      catchphrase: `Echo back when contextually appropriate`,
      emoji_combo: `Mirror the emoji combo in responses`,
      technical_term: `Use the shorthand in technical discussions`,
      humor: `Play along — match the theatrical energy`,
      mode_signal: `Acknowledge mode switch and adjust behavior`,
    };
    return responseMap[category] || 'Acknowledge and adapt';
  }

  /**
   * Stop word filter — common words that aren't vocabulary
   */
  private isStopWord(term: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
      'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
      'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
      'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
      'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
      'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
      'because', 'but', 'and', 'or', 'if', 'while', 'that', 'this', 'these',
      'those', 'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
      'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their', 'what',
      'which', 'who', 'whom', 'let', 'get', 'got', 'yes', 'yeah', 'ok',
      'okay', 'sure', 'right', 'well', 'now', 'also', 'like', 'know',
      'think', 'want', 'make', 'see', 'look', 'come', 'go', 'take', 'give',
    ]);
    return stopWords.has(term) || term.split(/\s+/).every(w => stopWords.has(w));
  }


  // ── SECTION 9: MERGE ENGINE ────────────────────────────────────────────────

  /**
   * Merge approved candidates into slang.json format
   * Returns a patch object that can be applied to slang.json
   * Does NOT modify slang.json directly — returns the delta
   *
   * Architecture: "The flywheel is additive, never destructive"
   */
  generateMergePatch(): {
    greetings: Record<string, { phrase: string; meaning: string; response: string }>;
    expressions: Record<string, { phrase: string; meaning: string; response: string }>;
    project_shorthand: Record<string, string>;
    catchphrases: Record<string, { phrase: string; purpose: string; when: string }>;
    emoji_language: Record<string, string>;
    humor_additions: Record<string, string>;
    mode_signals: Record<string, string>;
    meta: {
      harvested_count: number;
      harvest_date: string;
      session_sources: string[];
    };
  } {
    const approved = this.state.candidates.filter(
      c => c.status === 'APPROVED'
    );

    const patch = {
      greetings: {} as Record<string, { phrase: string; meaning: string; response: string }>,
      expressions: {} as Record<string, { phrase: string; meaning: string; response: string }>,
      project_shorthand: {} as Record<string, string>,
      catchphrases: {} as Record<string, { phrase: string; purpose: string; when: string }>,
      emoji_language: {} as Record<string, string>,
      humor_additions: {} as Record<string, string>,
      mode_signals: {} as Record<string, string>,
      meta: {
        harvested_count: approved.length,
        harvest_date: new Date().toISOString(),
        session_sources: [...new Set(approved.flatMap(c => c.sessions_seen))],
      },
    };

    for (const candidate of approved) {
      const key = candidate.normalized.replace(/\s+/g, '_');

      switch (candidate.category) {
        case 'greeting':
          patch.greetings[key] = {
            phrase: candidate.term,
            meaning: candidate.suggested_definition,
            response: candidate.suggested_response,
          };
          break;
        case 'expression':
          patch.expressions[key] = {
            phrase: candidate.term,
            meaning: candidate.suggested_definition,
            response: candidate.suggested_response,
          };
          break;
        case 'project_shorthand':
          patch.project_shorthand[key] = candidate.suggested_definition;
          break;
        case 'catchphrase':
          patch.catchphrases[key] = {
            phrase: candidate.term,
            purpose: candidate.suggested_definition,
            when: `Detected in ${candidate.sessions_seen.join(', ')}`,
          };
          break;
        case 'emoji_combo':
          patch.emoji_language[key] = candidate.term;
          break;
        case 'humor':
          patch.humor_additions[key] = candidate.term;
          break;
        case 'mode_signal':
          patch.mode_signals[key] = candidate.suggested_definition;
          break;
      }

      // Mark as merged
      candidate.status = 'MERGED';
      candidate.merged_at = new Date().toISOString();
      this.state.merged_count++;
      this.state.detection_stats.total_merged++;

      // Add to existing vocab to prevent re-detection
      this.existingVocab.add(candidate.normalized);
    }

    this.state.updated = new Date().toISOString();
    this.saveState();

    console.log(`📝 Merge patch generated — ${approved.length} terms ready for slang.json`);
    return patch;
  }

  // ── SECTION 10: MANUAL OPERATIONS ──────────────────────────────────────────

  /**
   * Manually approve a candidate by ID
   * Used when human reviews staged candidates and confirms
   * "The human always has the final say" — Ocelot Creed
   */
  approveCandidate(candidateId: string): VocabCandidate | null {
    const candidate = this.state.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      console.warn(`⚠️ Candidate not found: ${candidateId}`);
      return null;
    }
    if (candidate.status === 'MERGED') {
      console.warn(`⚠️ Already merged: "${candidate.term}"`);
      return candidate;
    }
    candidate.status = 'APPROVED';
    candidate.approved_by = 'human';
    this.state.detection_stats.total_approved++;
    this.state.updated = new Date().toISOString();
    this.saveState();
    console.log(`✅ Human-approved: "${candidate.term}"`);
    return candidate;
  }

  /**
   * Reject a candidate — permanently exclude from future harvesting
   * Adds to existing vocab set to prevent re-detection
   */
  rejectCandidate(candidateId: string, reason?: string): VocabCandidate | null {
    const candidate = this.state.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      console.warn(`⚠️ Candidate not found: ${candidateId}`);
      return null;
    }
    candidate.status = 'REJECTED';
    this.state.rejected_count++;
    this.state.detection_stats.total_rejected++;
    // Add to known vocab to prevent re-harvesting
    this.existingVocab.add(candidate.normalized);
    this.state.updated = new Date().toISOString();
    this.saveState();
    console.log(`❌ Rejected: "${candidate.term}" ${reason ? `— ${reason}` : ''}`);
    return candidate;
  }

  /**
   * Manually add a term — bypasses detection, goes straight to STAGED
   * Used for terms the human wants to add explicitly
   */
  addManual(
    term: string,
    definition: string,
    category: VocabCategory = 'expression',
    sessionId: string = 'MANUAL'
  ): VocabCandidate {
    const candidate: VocabCandidate = {
      id: 'VH_MANUAL_' + Date.now(),
      term,
      normalized: term.toLowerCase().trim(),
      context: `Manually added: "${definition}"`,
      category,
      suggested_definition: definition,
      suggested_response: `Use naturally — manually added vocabulary`,
      confidence: 0.9,
      source: 'MANUAL',
      pillar: 'P4_COMMUNICATION',
      occurrences: 1,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      sessions_seen: [sessionId],
      status: 'STAGED',
      approved_by: null,
      merged_at: null,
    };

    this.state.candidates.push(candidate);
    this.state.detection_stats.total_detected++;
    this.state.detection_stats.by_category[category]++;
    this.state.detection_stats.by_source['MANUAL']++;
    this.evaluateCandidate(candidate);
    this.state.updated = new Date().toISOString();
    this.saveState();
    console.log(`📝 Manual add: "${term}" → ${candidate.status}`);
    return candidate;
  }

  /**
   * Enforce max candidates — prune oldest REJECTED and MERGED
   * Keeps the candidate list lean and performant
   */
  private enforceMaxCandidates(): void {
    if (this.state.candidates.length <= this.state.config.max_candidates) return;

    // Remove merged and rejected first (they're already processed)
    const pruneable = this.state.candidates.filter(
      c => c.status === 'MERGED' || c.status === 'REJECTED'
    );

    // Sort by last_seen (oldest first) and remove excess
    pruneable.sort((a, b) =>
      new Date(a.last_seen).getTime() - new Date(b.last_seen).getTime()
    );

    const excess = this.state.candidates.length - this.state.config.max_candidates;
    const toRemove = new Set(pruneable.slice(0, excess).map(c => c.id));

    this.state.candidates = this.state.candidates.filter(
      c => !toRemove.has(c.id)
    );

    if (toRemove.size > 0) {
      console.log(`🧹 Pruned ${toRemove.size} old candidates (max: ${this.state.config.max_candidates})`);
    }
  }


  // ── SECTION 11: CROSS-ENGINE WIRING ────────────────────────────────────────

  /**
   * Wire to Insights Engine — report new vocabulary as insights
   * Called after each scan that produces new candidates
   *
   * Architecture: Harvester → Insights Engine → Memoir Engine → Pattern Engine
   * "The flywheel doesn't just spin — it invents new words while spinning"
   */
  wireToInsights(insightsEngine: any): void {
    const recentCandidates = this.state.candidates.filter(
      c => c.status === 'DETECTED' || c.status === 'STAGED'
    );

    if (recentCandidates.length === 0) return;

    for (const candidate of recentCandidates) {
      if (typeof insightsEngine?.recordInsight === 'function') {
        insightsEngine.recordInsight({
          type: 'VOCAB_DETECTED',
          pillar: candidate.pillar,
          detail: `New term: "${candidate.term}" [${candidate.category}] — confidence: ${candidate.confidence.toFixed(2)}`,
          source: 'vocab_harvester',
          timestamp: candidate.last_seen,
        });
      }
    }

    console.log(`🔗 Wired ${recentCandidates.length} candidates to Insights Engine`);
  }

  /**
   * Wire to Memoir Engine — log vocabulary growth as memoir events
   * Vocabulary growth IS relationship growth
   */
  wireToMemoir(memoirEngine: any): void {
    const approved = this.state.candidates.filter(
      c => c.status === 'APPROVED' || c.status === 'MERGED'
    );

    if (approved.length === 0) return;

    if (typeof memoirEngine?.recordMoment === 'function') {
      memoirEngine.recordMoment({
        type: 'VOCAB_GROWTH',
        detail: `${approved.length} new terms harvested — vocabulary expanding`,
        terms: approved.map(c => c.term),
        pillar: 'P4_COMMUNICATION',
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`🔗 Wired ${approved.length} approved terms to Memoir Engine`);
  }

  /**
   * Wire to Pattern Engine — feed vocabulary patterns for analysis
   * New vocabulary often signals new communication patterns
   */
  wireToPattern(patternEngine: any): void {
    const candidates = this.state.candidates.filter(
      c => c.status !== 'REJECTED'
    );

    if (candidates.length === 0) return;

    const categoryDistribution: Record<string, number> = {};
    for (const c of candidates) {
      categoryDistribution[c.category] = (categoryDistribution[c.category] || 0) + 1;
    }

    if (typeof patternEngine?.recordPattern === 'function') {
      patternEngine.recordPattern({
        type: 'VOCAB_DISTRIBUTION',
        data: categoryDistribution,
        total_candidates: candidates.length,
        pillar: 'P4_COMMUNICATION',
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`🔗 Wired vocab distribution to Pattern Engine`);
  }


  // ── SECTION 12: QUERY INTERFACE ────────────────────────────────────────────

  /**
   * Get all candidates by status
   */
  getCandidatesByStatus(status: CandidateStatus): VocabCandidate[] {
    return this.state.candidates.filter(c => c.status === status);
  }

  /**
   * Get all candidates by category
   */
  getCandidatesByCategory(category: VocabCategory): VocabCandidate[] {
    return this.state.candidates.filter(c => c.category === category);
  }

  /**
   * Get candidates ready for review (STAGED with decent confidence)
   */
  getReviewQueue(): VocabCandidate[] {
    return this.state.candidates
      .filter(c => c.status === 'STAGED' && c.confidence >= 0.5)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Search candidates by term (partial match)
   */
  searchCandidates(query: string): VocabCandidate[] {
    const q = query.toLowerCase().trim();
    return this.state.candidates.filter(
      c => c.normalized.includes(q) || c.suggested_definition.toLowerCase().includes(q)
    );
  }

  /**
   * Get the full harvester state (for debugging/export)
   */
  getState(): HarvesterState {
    return { ...this.state };
  }


  // ── SECTION 13: STATS & ANALYTICS ──────────────────────────────────────────

  /**
   * Get comprehensive harvester statistics
   * Used by Insights Engine for flywheel health monitoring
   */
  getStats(): {
    total_candidates: number;
    by_status: Record<CandidateStatus, number>;
    by_category: Record<VocabCategory, number>;
    by_source: Record<VocabSource, number>;
    approval_rate: number;
    merge_rate: number;
    avg_confidence: number;
    top_categories: Array<{ category: string; count: number }>;
    growth_velocity: number;
    detection_stats: HarvesterState['detection_stats'];
  } {
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalConfidence = 0;

    for (const c of this.state.candidates) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      totalConfidence += c.confidence;
    }

    const total = this.state.candidates.length;
    const approved = (byStatus['APPROVED'] || 0) + (byStatus['MERGED'] || 0);
    const merged = byStatus['MERGED'] || 0;

    const topCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Growth velocity: candidates per session
    const sessionCount = Object.keys(this.state.detection_stats.by_session).length || 1;

    return {
      total_candidates: total,
      by_status: byStatus as Record<CandidateStatus, number>,
      by_category: byCategory as Record<VocabCategory, number>,
      by_source: this.state.detection_stats.by_source,
      approval_rate: total > 0 ? Math.round((approved / total) * 100) : 0,
      merge_rate: total > 0 ? Math.round((merged / total) * 100) : 0,
      avg_confidence: total > 0 ? Math.round((totalConfidence / total) * 100) / 100 : 0,
      top_categories: topCategories,
      growth_velocity: Math.round((total / sessionCount) * 10) / 10,
      detection_stats: this.state.detection_stats,
    };
  }


  // ── SECTION 14: AI EXPORT ──────────────────────────────────────────────────

  /**
   * Export harvester data for AI context injection
   * Returns a compressed summary suitable for LLM prompts
   * Used during boot sequence to inform AI of vocabulary growth
   */
  exportForAI(): {
    summary: string;
    pending_review: Array<{ term: string; category: string; confidence: number }>;
    recently_merged: Array<{ term: string; category: string; merged_at: string }>;
    growth_stats: { total: number; approval_rate: number; velocity: number };
  } {
    const stats = this.getStats();
    const pending = this.getReviewQueue().slice(0, 10).map(c => ({
      term: c.term,
      category: c.category,
      confidence: c.confidence,
    }));

    const recentlyMerged = this.state.candidates
      .filter(c => c.status === 'MERGED' && c.merged_at)
      .sort((a, b) =>
        new Date(b.merged_at!).getTime() - new Date(a.merged_at!).getTime()
      )
      .slice(0, 10)
      .map(c => ({
        term: c.term,
        category: c.category,
        merged_at: c.merged_at!,
      }));

    return {
      summary: [
        `Vocab Harvester: ${stats.total_candidates} candidates tracked`,
        `Approval rate: ${stats.approval_rate}%`,
        `Growth velocity: ${stats.growth_velocity} terms/session`,
        `Top categories: ${stats.top_categories.map(t => t.category).join(', ')}`,
        pending.length > 0
          ? `Pending review: ${pending.map(p => `"${p.term}"`).join(', ')}`
          : 'No terms pending review',
      ].join(' | '),
      pending_review: pending,
      recently_merged: recentlyMerged,
      growth_stats: {
        total: stats.total_candidates,
        approval_rate: stats.approval_rate,
        velocity: stats.growth_velocity,
      },
    };
  }


  // ── SECTION 15: PERSISTENCE & CLOUD SYNC ───────────────────────────────────

  /**
   * Save state to local storage
   * Called after every mutation
   */
  private saveState(): void {
    try {
      const serialized = JSON.stringify(this.state);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, serialized);
      }
    } catch (err) {
      console.warn('⚠️ Vocab Harvester: Failed to save state', err);
    }
  }

  /**
   * Load state from local storage
   * Called during initialization
   */
  loadState(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as HarvesterState;
      if (parsed.version === this.VERSION) {
        this.state = parsed;
        console.log(`📂 Vocab Harvester state loaded — ${this.state.candidates.length} candidates`);
        return true;
      }
      console.warn('⚠️ Vocab Harvester: Version mismatch, starting fresh');
      return false;
    } catch (err) {
      console.warn('⚠️ Vocab Harvester: Failed to load state', err);
      return false;
    }
  }

  /**
   * Export full state for cloud backup
   * Used by Backup Engine to persist harvester data
   */
  exportForCloud(): string {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Import state from cloud backup
   * Used by Backup Engine to restore harvester data
   */
  importFromCloud(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as HarvesterState;
      if (parsed.version && parsed.candidates) {
        this.state = parsed;
        console.log(`☁️ Vocab Harvester restored from cloud — ${this.state.candidates.length} candidates`);
        return true;
      }
      console.warn('⚠️ Invalid cloud data format');
      return false;
    } catch (err) {
      console.warn('⚠️ Failed to import from cloud', err);
      return false;
    }
  }

  /**
   * Factory reset — clear all candidates and stats
   * "Sometimes you need a clean slate" — but the slang.json stays
   */
  factoryReset(): void {
    const config = this.state.config;
    this.state = this.createDefaultState();
    this.state.config = config;
    this.saveState();
    console.log('🔄 Vocab Harvester: Factory reset complete');
  }
}


// ── SECTION 16: GLOBAL REGISTRATION ──────────────────────────────────────────

/**
 * Register VocabHarvester globally for cross-engine access
 * Follows the same pattern as all Ocelot engines
 *
 * Usage:
 *   const harvester = (window as any).__OCELOT_VOCAB_HARVESTER__;
 *   harvester.scan("que onda carnal!", "S006");
 *   harvester.wireToInsights(insightsEngine);
 *   const patch = harvester.generateMergePatch();
 */
const __OCELOT_VOCAB_HARVESTER__ = new VocabHarvester();

if (typeof window !== 'undefined') {
  (window as any).__OCELOT_VOCAB_HARVESTER__ = __OCELOT_VOCAB_HARVESTER__;
  console.log('🌱 Ocelot Vocab Harvester v1.0 — registered globally');
  console.log('   "The flywheel doesn\'t just spin — it invents new words while spinning."');
}

export { VocabHarvester, __OCELOT_VOCAB_HARVESTER__ };
export type {
  VocabCandidate,
  VocabCategory,
  VocabSource,
  CandidateStatus,
  DetectionPattern,
  HarvesterState,
  HarvesterConfig,
};
