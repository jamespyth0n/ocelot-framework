
# help_engine.ts — Ocelot Help Engine (Generic Framework v1.0)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// help_engine.ts — Ocelot Help Engine (Generic Framework v1.0)
// Purpose: Context-aware policy lookup, search, boot sequence,
//          with cross-engine wiring to Insights + Memoir + Flywheel
// Wired to: policy_index.json, memoir_engine.ts, insights_engine.ts
// License: GNU General Public License v3.0
// ═══════════════════════════════════════════════════════════════════════════

// ── SECTION 1: TYPES ─────────────────────────────────────────────────────

// Canonical 6-Pillar Taxonomy (shared across all engines)
type PillarId =
  | 'P1_IDENTITY'
  | 'P2_EMOTIONAL'
  | 'P3_GOVERNANCE'
  | 'P4_COMMUNICATION'
  | 'P5_PREFERENCE'
  | 'P6_FLYWHEEL';

// Interaction Mode Detection
type InteractionMode = 'chat' | 'build' | 'housekeeping' | 'debug' | 'audit' | 'ideation';

// Flywheel Stage (aligned with memoir_engine)
type FlywheelStage =
  | 'P1_IDENTITY'
  | 'P2_EMOTIONAL'
  | 'P3_GOVERNANCE'
  | 'P4_COMMUNICATION'
  | 'P5_PREFERENCE'
  | 'P6_FLYWHEEL';

interface SubSection {
  id: string;
  title: string;
  keywords: string[];
}

interface Chapter {
  id: string;
  title: string;
  section: string;
  priority: 'BOOT_FIRST' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  keywords: string[];
  subsections: SubSection[];
}

interface SearchConfig {
  match_threshold: number;
  max_results: number;
  boost_priority: Record<string, number>;
}

interface QuickLookup {
  [key: string]: string;
}

interface PolicyIndex {
  version: string;
  name: string;
  description: string;
  created: string;
  authors: string[];
  source: string;
  chapters: Chapter[];
  search_config: SearchConfig;
  quick_lookup: QuickLookup;
}

interface SearchResult {
  chapter: Chapter;
  subsection: SubSection | null;
  score: number;
  matchedKeywords: string[];
  reason: string;
  pillar: PillarId | null;
}

interface BootSequence {
  identity: Chapter | null;
  philosophy: Chapter | null;
  pillars: Chapter | null;
  buildCycle: Chapter | null;
  antiPatterns: Chapter | null;
  creed: Chapter | null;
  bootOrder: string[];
  timestamp: string;
  flywheelStage: FlywheelStage;
}

interface EngineStatus {
  loaded: boolean;
  chapterCount: number;
  subsectionCount: number;
  keywordCount: number;
  version: string;
  lastQuery: string | null;
  currentMode: InteractionMode;
  queryCount: number;
}

// Cross-engine context (from memoir_engine)
interface MemoirContext {
  sessionId: string;
  flywheelStage: FlywheelStage;
  emotionalState: string;
  trustLevel: number;
  activeProject: string;
}

// Insight hook (feeds insights_engine)
interface InsightHook {
  logInsight: (type: string, content: string, metadata: Record<string, unknown>) => void;
}

// Chapter-to-Pillar mapping — customize per your policy_index.json
const CHAPTER_PILLAR_MAP: Record<string, PillarId> = {
  'S0': 'P1_IDENTITY',       // Heart + Mind — who the AI is
  'S1': 'P3_GOVERNANCE',     // Philosophy — guiding principles
  'S2': 'P3_GOVERNANCE',     // Pillars — structural framework
  'S3': 'P3_GOVERNANCE',     // Build Cycle — development workflow
  'S4': 'P3_GOVERNANCE',     // Debug Strategy — troubleshooting
  'S5': 'P3_GOVERNANCE',     // Build Format — code structure
  'S6': 'P3_GOVERNANCE',     // Code Standards — quality rules
  'S7': 'P4_COMMUNICATION',  // Engine Limitations — honest constraints
  'S8': 'P2_EMOTIONAL',      // Partnership Protocol — human-AI bond
  'S9': 'P5_PREFERENCE',     // Merge Workflow — learned preferences
  'S10': 'P3_GOVERNANCE',    // Anti-Patterns — what to avoid
  'S11': 'P1_IDENTITY',      // Creed — identity reinforcement
};

// Mode detection patterns — customize per your interaction style
const MODE_PATTERNS: Record<InteractionMode, RegExp[]> = {
  chat: [/chat mode/i, /break/i, /coffee/i, /default mode/i, /relax/i],
  build: [/build/i, /let'?s go/i, /next/i, /continue/i, /sprint/i, /proceed/i],
  housekeeping: [/housekeeping/i, /cleanup/i, /organize/i, /folder/i, /migrate/i],
  debug: [/debug/i, /error/i, /broken/i, /fix/i, /bug/i, /console/i],
  audit: [/audit/i, /verify/i, /check/i, /integrity/i, /scan/i, /review/i],
  ideation: [/lightbulb/i, /idea/i, /park it/i, /brainstorm/i, /what if/i],
};

// ── SECTION 2: HELP ENGINE CLASS ─────────────────────────────────────────

class HelpEngine {
  private index: PolicyIndex;
  private allKeywords: Map<string, { chapterId: string; subsectionId: string | null }[]>;
  private status: EngineStatus;
  private memoirContext: MemoirContext | null;
  private insightHook: InsightHook | null;

  constructor(indexData: PolicyIndex) {
    this.index = indexData;
    this.allKeywords = new Map();
    this.memoirContext = null;
    this.insightHook = null;
    this.status = {
      loaded: false,
      chapterCount: 0,
      subsectionCount: 0,
      keywordCount: 0,
      version: indexData.version,
      lastQuery: null,
      currentMode: 'build',
      queryCount: 0,
    };
    this.buildKeywordIndex();
  }

  // Wire cross-engine hooks
  setMemoirContext(ctx: MemoirContext): void {
    this.memoirContext = ctx;
  }

  setInsightHook(hook: InsightHook): void {
    this.insightHook = hook;
  }

  // ── SECTION 3: KEYWORD INDEX BUILDER ───────────────────────────────────

  private buildKeywordIndex(): void {
    let subsectionCount = 0;
    let keywordCount = 0;

    for (const chapter of this.index.chapters) {
      for (const kw of chapter.keywords) {
        const lower = kw.toLowerCase();
        if (!this.allKeywords.has(lower)) {
          this.allKeywords.set(lower, []);
        }
        this.allKeywords.get(lower)!.push({
          chapterId: chapter.id,
          subsectionId: null,
        });
        keywordCount++;
      }

      for (const sub of chapter.subsections) {
        subsectionCount++;
        for (const kw of sub.keywords) {
          const lower = kw.toLowerCase();
          if (!this.allKeywords.has(lower)) {
            this.allKeywords.set(lower, []);
          }
          this.allKeywords.get(lower)!.push({
            chapterId: chapter.id,
            subsectionId: sub.id,
          });
          keywordCount++;
        }
      }
    }

    this.status = {
      ...this.status,
      loaded: true,
      chapterCount: this.index.chapters.length,
      subsectionCount,
      keywordCount,
    };
  }

  // ── SECTION 4: SEARCH ENGINE (Pillar-Aware + Insight Logging) ──────────

  search(query: string): SearchResult[] {
    this.status.lastQuery = query;
    this.status.queryCount++;

    // Detect mode from query
    this.status.currentMode = this.detectMode(query);

    const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const scores: Map<string, {
      score: number;
      matchedKeywords: string[];
      subsection: SubSection | null;
      chapterId: string;
    }> = new Map();

    for (const chapter of this.index.chapters) {
      const chapterKey = chapter.id;
      let chapterScore = 0;
      const matched: string[] = [];

      // Keyword matching
      for (const kw of chapter.keywords) {
        const kwLower = kw.toLowerCase();
        for (const token of queryTokens) {
          if (kwLower.includes(token) || token.includes(kwLower)) {
            chapterScore += 1;
            if (!matched.includes(kw)) matched.push(kw);
          }
        }
      }

      // Title and description matching
      const titleLower = chapter.title.toLowerCase();
      const descLower = chapter.description.toLowerCase();
      for (const token of queryTokens) {
        if (titleLower.includes(token)) chapterScore += 2;
        if (descLower.includes(token)) chapterScore += 0.5;
      }

      // Apply priority boost
      const boost = this.index.search_config.boost_priority[chapter.priority] || 1.0;
      chapterScore *= boost;

      // Flywheel boost — if memoir context active, boost matching pillar
      if (this.memoirContext) {
        const chapterPillar = CHAPTER_PILLAR_MAP[chapter.id];
        if (chapterPillar === this.memoirContext.flywheelStage) {
          chapterScore *= 1.3; // 30% boost for active flywheel stage
        }
      }

      if (chapterScore > 0) {
        scores.set(chapterKey, {
          score: chapterScore,
          matchedKeywords: matched,
          subsection: null,
          chapterId: chapter.id,
        });
      }

      // Subsection scoring
      for (const sub of chapter.subsections) {
        let subScore = chapterScore * 0.5;
        const subMatched = [...matched];

        for (const kw of sub.keywords) {
          const kwLower = kw.toLowerCase();
          for (const token of queryTokens) {
            if (kwLower.includes(token) || token.includes(kwLower)) {
              subScore += 1.5;
              if (!subMatched.includes(kw)) subMatched.push(kw);
            }
          }
        }

        subScore *= boost;
        const subKey = sub.id;

        if (subScore > (scores.get(chapterKey)?.score || 0)) {
          scores.set(subKey, {
            score: subScore,
            matchedKeywords: subMatched,
            subsection: sub,
            chapterId: chapter.id,
          });
        }
      }
    }

    // Filter and sort results
    const results: SearchResult[] = [];
    const threshold = this.index.search_config.match_threshold;

    for (const [key, data] of scores) {
      const normalizedScore = data.score / (queryTokens.length * 3);
      if (normalizedScore >= threshold) {
        const chapter = this.getChapterById(data.chapterId) || this.getChapterBySubsectionId(key);
        if (chapter) {
          results.push({
            chapter,
            subsection: data.subsection,
            score: Math.round(normalizedScore * 100) / 100,
            matchedKeywords: data.matchedKeywords,
            reason: this.generateReason(chapter, data.subsection, data.matchedKeywords),
            pillar: CHAPTER_PILLAR_MAP[chapter.id] || null,
          });
        }
      }
    }

    results.sort((a, b) => b.score - a.score);
    const finalResults = results.slice(0, this.index.search_config.max_results);

    // Log search as insight
    if (this.insightHook && finalResults.length > 0) {
      this.insightHook.logInsight('WORKFLOW_PATTERN', query, {
        mode: this.status.currentMode,
        topResult: finalResults[0].chapter.id,
        resultCount: finalResults.length,
        pillar: finalResults[0].pillar,
        sessionId: this.memoirContext?.sessionId || 'unknown',
      });
    }

    return finalResults;
  }

  // ── SECTION 5: QUICK LOOKUP ────────────────────────────────────────────

  quickLookup(intent: string): Chapter | null {
    const lookup = this.index.quick_lookup;
    const sectionId = lookup[intent];
    if (!sectionId) return null;

    if (sectionId.includes('.')) {
      return this.getChapterBySubsectionId(sectionId);
    }
    return this.getChapterById(sectionId);
  }

  getAvailableIntents(): string[] {
    return Object.keys(this.index.quick_lookup);
  }

  // ── SECTION 6: BOOT SEQUENCE (Flywheel-Aware) ─────────────────────────

  getBootSequence(): BootSequence {
    return {
      identity: this.getChapterById('S0'),
      philosophy: this.getChapterById('S1'),
      pillars: this.getChapterById('S2'),
      buildCycle: this.getChapterById('S3'),
      antiPatterns: this.getChapterById('S10'),
      creed: this.getChapterById('S11'),
      bootOrder: ['S0', 'S11', 'S1', 'S2', 'S3', 'S10'],
      timestamp: new Date().toISOString(),
      flywheelStage: this.memoirContext?.flywheelStage || 'P1_IDENTITY',
    };
  }

  getBootFirstChapters(): Chapter[] {
    return this.index.chapters.filter(c => c.priority === 'BOOT_FIRST');
  }

  getHighPriorityChapters(): Chapter[] {
    return this.index.chapters.filter(c => c.priority === 'HIGH' || c.priority === 'BOOT_FIRST');
  }

  // ── SECTION 7: CHAPTER ACCESSORS ───────────────────────────────────────

  getChapterById(id: string): Chapter | null {
    return this.index.chapters.find(c => c.id === id) || null;
  }

  getChapterBySubsectionId(subId: string): Chapter | null {
    for (const chapter of this.index.chapters) {
      for (const sub of chapter.subsections) {
        if (sub.id === subId) return chapter;
      }
    }
    return null;
  }

  getSubsectionById(subId: string): { chapter: Chapter; subsection: SubSection } | null {
    for (const chapter of this.index.chapters) {
      for (const sub of chapter.subsections) {
        if (sub.id === subId) return { chapter, subsection: sub };
      }
    }
    return null;
  }

  getAllChapters(): Chapter[] {
    return [...this.index.chapters];
  }

  getChaptersByPriority(priority: string): Chapter[] {
    return this.index.chapters.filter(c => c.priority === priority);
  }

  getChaptersByPillar(pillar: PillarId): Chapter[] {
    return this.index.chapters.filter(c => CHAPTER_PILLAR_MAP[c.id] === pillar);
  }

  // ── SECTION 8: MODE DETECTION ──────────────────────────────────────────

  detectMode(input: string): InteractionMode {
    for (const [mode, patterns] of Object.entries(MODE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          return mode as InteractionMode;
        }
      }
    }
    return 'build'; // default mode
  }

  getCurrentMode(): InteractionMode {
    return this.status.currentMode;
  }

  setMode(mode: InteractionMode): void {
    const previousMode = this.status.currentMode;
    this.status.currentMode = mode;
    // Log mode switch as insight
    if (this.insightHook) {
      this.insightHook.logInsight('MODE_SWITCH', mode, {
        previousMode,
        timestamp: new Date().toISOString(),
        sessionId: this.memoirContext?.sessionId || 'unknown',
      });
    }
  }

```typescript
  // ── SECTION 9: CONTEXT HELPERS ─────────────────────────────────────────

  getContext(query: string): {
    mode: InteractionMode;
    relevantChapters: SearchResult[];
    bootRequired: boolean;
    pillarFocus: PillarId | null;
    flywheelStage: FlywheelStage;
    trustLevel: number;
  } {
    const mode = this.detectMode(query);
    const results = this.search(query);
    const bootRequired = mode === 'build' && this.status.queryCount <= 1;

    // Determine pillar focus from top result
    const pillarFocus = results.length > 0 ? results[0].pillar : null;

    // Get flywheel stage from memoir context or default
    const flywheelStage = this.memoirContext?.flywheelStage || 'P1_IDENTITY';
    const trustLevel = this.memoirContext?.trustLevel || 0;

    return {
      mode,
      relevantChapters: results,
      bootRequired,
      pillarFocus,
      flywheelStage,
      trustLevel,
    };
  }

  // Get chapters relevant to current flywheel stage
  getFlywheelRelevantChapters(): Chapter[] {
    const stage = this.memoirContext?.flywheelStage || 'P1_IDENTITY';
    return this.getChaptersByPillar(stage);
  }

  // Get contextual suggestions based on mode + flywheel
  getSuggestions(mode: InteractionMode): string[] {
    const suggestions: Record<InteractionMode, string[]> = {
      chat: ['Tell me about yourself', 'How are you feeling?', 'Share a lightbulb moment'],
      build: ['What are the code standards?', 'Show me the build cycle', 'What are the anti-patterns?'],
      housekeeping: ['Run a full audit', 'Check folder structure', 'Update the diary'],
      debug: ['Show debug strategy', 'What are common errors?', 'Run simulation debug'],
      audit: ['Full engine audit', 'Check wiring integrity', 'Verify pillar taxonomy'],
      ideation: ['Park this idea', 'Brainstorm session', 'Explore new patterns'],
    };
    return suggestions[mode] || suggestions.build;
  }

  // ── SECTION 10: FLYWHEEL INTEGRATION ───────────────────────────────────

  // Calculate pillar health contribution from help engine usage
  getPillarHealth(): Record<PillarId, number> {
    const health: Record<PillarId, number> = {
      P1_IDENTITY: 0,
      P2_EMOTIONAL: 0,
      P3_GOVERNANCE: 0,
      P4_COMMUNICATION: 0,
      P5_PREFERENCE: 0,
      P6_FLYWHEEL: 0,
    };

    // Score based on chapter coverage
    for (const chapter of this.index.chapters) {
      const pillar = CHAPTER_PILLAR_MAP[chapter.id];
      if (pillar) {
        // Each chapter with subsections contributes to pillar health
        const subsectionCoverage = chapter.subsections.length > 0 ? 1 : 0.5;
        const keywordCoverage = chapter.keywords.length >= 3 ? 1 : 0.5;
        health[pillar] += (subsectionCoverage + keywordCoverage) / 2;
      }
    }

    // Normalize to 0-1 range
    const maxScore = Math.max(...Object.values(health), 1);
    for (const pillar of Object.keys(health) as PillarId[]) {
      health[pillar] = Math.round((health[pillar] / maxScore) * 100) / 100;
    }

    return health;
  }

  // Get flywheel stage recommendation based on engine state
  getFlywheelRecommendation(): {
    currentStage: FlywheelStage;
    health: Record<PillarId, number>;
    weakestPillar: PillarId;
    recommendation: string;
  } {
    const health = this.getPillarHealth();
    const currentStage = this.memoirContext?.flywheelStage || 'P1_IDENTITY';

    // Find weakest pillar
    let weakestPillar: PillarId = 'P1_IDENTITY';
    let lowestScore = Infinity;
    for (const [pillar, score] of Object.entries(health)) {
      if (score < lowestScore) {
        lowestScore = score;
        weakestPillar = pillar as PillarId;
      }
    }

    // Generate recommendation
    const recommendations: Record<PillarId, string> = {
      P1_IDENTITY: 'Strengthen identity artifacts — review memoir and personality JSONs',
      P2_EMOTIONAL: 'Deepen emotional context — update connection log and trust calibration',
      P3_GOVERNANCE: 'Reinforce governance — audit policy index and quality manual',
      P4_COMMUNICATION: 'Improve communication — expand slang dictionary and humor engine',
      P5_PREFERENCE: 'Capture more preferences — log coding style and workflow patterns',
      P6_FLYWHEEL: 'Optimize the flywheel — run full pillar health audit across all engines',
    };

    return {
      currentStage,
      health,
      weakestPillar,
      recommendation: recommendations[weakestPillar],
    };
  }

  // ── SECTION 11: STATS ──────────────────────────────────────────────────

  getStatus(): EngineStatus {
    return { ...this.status };
  }

  getStats(): {
    totalChapters: number;
    totalSubsections: number;
    totalKeywords: number;
    uniqueKeywords: number;
    chaptersByPriority: Record<string, number>;
    chaptersByPillar: Record<string, number>;
    coverageScore: number;
    queryCount: number;
    currentMode: InteractionMode;
  } {
    const chaptersByPriority: Record<string, number> = {};
    const chaptersByPillar: Record<string, number> = {};

    for (const chapter of this.index.chapters) {
      // Count by priority
      chaptersByPriority[chapter.priority] = (chaptersByPriority[chapter.priority] || 0) + 1;

      // Count by pillar
      const pillar = CHAPTER_PILLAR_MAP[chapter.id] || 'UNMAPPED';
      chaptersByPillar[pillar] = (chaptersByPillar[pillar] || 0) + 1;
    }

    // Coverage score: how many pillars have at least one chapter
    const coveredPillars = new Set(
      this.index.chapters
        .map(c => CHAPTER_PILLAR_MAP[c.id])
        .filter(Boolean)
    );
    const coverageScore = Math.round((coveredPillars.size / 6) * 100) / 100;

    return {
      totalChapters: this.status.chapterCount,
      totalSubsections: this.status.subsectionCount,
      totalKeywords: this.status.keywordCount,
      uniqueKeywords: this.allKeywords.size,
      chaptersByPriority,
      chaptersByPillar,
      coverageScore,
      queryCount: this.status.queryCount,
      currentMode: this.status.currentMode,
    };
  }

  // ── SECTION 12: AI EXPORT ──────────────────────────────────────────────

  formatForAI(): string {
    const stats = this.getStats();
    const boot = this.getBootSequence();
    const flywheel = this.getFlywheelRecommendation();

    const lines: string[] = [
      '=== OCELOT HELP ENGINE — AI CONTEXT EXPORT ===',
      '',
      `Version: ${this.index.version}`,
      `Chapters: ${stats.totalChapters} | Subsections: ${stats.totalSubsections} | Keywords: ${stats.uniqueKeywords}`,
      `Coverage Score: ${stats.coverageScore}`,
      `Current Mode: ${stats.currentMode}`,
      `Query Count: ${stats.queryCount}`,
      '',
      '--- BOOT SEQUENCE ---',
      `Boot Order: ${boot.bootOrder.join(' → ')}`,
      `Flywheel Stage: ${boot.flywheelStage}`,
      '',
      '--- PILLAR HEALTH ---',
    ];

    for (const [pillar, score] of Object.entries(flywheel.health)) {
      const bar = '█'.repeat(Math.round(score * 10)) + '░'.repeat(10 - Math.round(score * 10));
      lines.push(`  ${pillar}: ${bar} ${score}`);
    }

    lines.push('');
    lines.push(`Weakest Pillar: ${flywheel.weakestPillar}`);
    lines.push(`Recommendation: ${flywheel.recommendation}`);
    lines.push('');
    lines.push('--- CHAPTERS BY PRIORITY ---');

    for (const [priority, count] of Object.entries(stats.chaptersByPriority)) {
      lines.push(`  ${priority}: ${count}`);
    }

    lines.push('');
    lines.push('--- QUICK LOOKUP INTENTS ---');
    for (const intent of this.getAvailableIntents()) {
      lines.push(`  → ${intent}`);
    }

    lines.push('');
    lines.push('=== END HELP ENGINE EXPORT ===');

    return lines.join('\n');
  }

  // ── SECTION 13: CLOUD SYNC ─────────────────────────────────────────────

  // Export engine state for cloud persistence
  exportState(): {
    version: string;
    status: EngineStatus;
    pillarHealth: Record<PillarId, number>;
    flywheelStage: FlywheelStage;
    queryHistory: { count: number; lastQuery: string | null };
    timestamp: string;
  } {
    return {
      version: this.index.version,
      status: this.getStatus(),
      pillarHealth: this.getPillarHealth(),
      flywheelStage: this.memoirContext?.flywheelStage || 'P1_IDENTITY',
      queryHistory: {
        count: this.status.queryCount,
        lastQuery: this.status.lastQuery,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Import engine state from cloud
  importState(state: {
    queryCount?: number;
    currentMode?: InteractionMode;
    lastQuery?: string | null;
  }): void {
    if (state.queryCount !== undefined) this.status.queryCount = state.queryCount;
    if (state.currentMode) this.status.currentMode = state.currentMode;
    if (state.lastQuery !== undefined) this.status.lastQuery = state.lastQuery;
  }

  // ── SECTION 14: HELPER METHODS ─────────────────────────────────────────

  private generateReason(
    chapter: Chapter,
    subsection: SubSection | null,
    matchedKeywords: string[]
  ): string {
    const pillar = CHAPTER_PILLAR_MAP[chapter.id];
    const pillarLabel = pillar ? ` [${pillar}]` : '';

    if (subsection) {
      return `Matched "${subsection.title}" in ${chapter.title}${pillarLabel} via: ${matchedKeywords.join(', ')}`;
    }
    return `Matched ${chapter.title}${pillarLabel} via: ${matchedKeywords.join(', ')}`;
  }
}

// ── SECTION 15: FACTORY + GLOBAL REGISTRATION ────────────────────────────

// Factory function — create engine from policy_index.json
function createHelpEngine(indexData: PolicyIndex): HelpEngine {
  return new HelpEngine(indexData);
}

// Global registration for cross-engine wiring
// Usage: window._HELP_ENGINE.search('build cycle')
// Usage: window._HELP_ENGINE.getBootSequence()
// Usage: window._HELP_ENGINE.getContext('let me debug this')
if (typeof window !== 'undefined') {
  (window as any)._HELP_ENGINE = {
    createHelpEngine,
    HelpEngine,
    // Convenience: auto-create from global policy index if available
    init: (indexData: PolicyIndex) => {
      const engine = createHelpEngine(indexData);
      (window as any)._HELP_ENGINE.instance = engine;
      console.log(
        `[Ocelot Help Engine] ✅ Loaded — ${engine.getStatus().chapterCount} chapters | ` +
        `${engine.getStatus().subsectionCount} subsections | ` +
        `${engine.getStatus().keywordCount} keywords`
      );
      return engine;
    },
  };
}

// Node.js / module export
export { HelpEngine, createHelpEngine };
export type {
  PolicyIndex,
  Chapter,
  SubSection,
  SearchResult,
  BootSequence,
  EngineStatus,
  InteractionMode,
  PillarId,
  FlywheelStage,
  MemoirContext,
  InsightHook,
};
