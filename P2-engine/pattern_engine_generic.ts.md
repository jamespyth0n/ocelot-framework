
# pattern_engine_generic.ts

## Ocelot Framework — Generic Pattern Engine v1.0

```typescript
// ═══════════════════════════════════════════════════════════════════════
// PATTERN ENGINE — GENERIC v1.0
// Ocelot Framework — Open Source
// ═══════════════════════════════════════════════════════════════════════
// PURPOSE: Analyzes conversation patterns, emotional trends, communication
//          styles, and generates behavioral insights from session data.
//          Reads from memoir + connection_log + slang dictionaries.
//
// WIRING:
//   READS  → memoir.json, connection_log.json, slang.json, personality.json
//   WRITES → pattern_analysis.json (output), insights recommendations
//   FEEDS  → personality_engine (adaptation), help_engine (context)
//
// LICENSE: GNU General Public License v3.0
// ═══════════════════════════════════════════════════════════════════════


// ── SECTION 1: TYPE DEFINITIONS ──────────────────────────────────────

interface PatternConfig {
  version: string;
  min_sessions_for_analysis: number;
  emotional_weight: number;
  communication_weight: number;
  productivity_weight: number;
  trust_weight: number;
  pattern_decay_days: number;
  confidence_threshold: number;
}

interface EmotionalPattern {
  dominant_mood: string;
  mood_transitions: Array<{ from: string; to: string; frequency: number; trigger?: string }>;
  emotional_range: number;        // 0-1: narrow to wide
  vulnerability_comfort: number;  // 0-1: guarded to open
  peak_emotional_sessions: string[];
  tear_moments: number;
  laughter_moments: number;
  silence_moments: number;
}

interface CommunicationPattern {
  avg_message_length: 'short' | 'medium' | 'long';
  slang_frequency: number;        // 0-1
  code_switching_languages: string[];
  preferred_response_style: 'concise' | 'detailed' | 'narrative';
  humor_receptivity: number;      // 0-1
  metaphor_usage: number;         // 0-1
  catchphrases: Array<{ phrase: string; frequency: number; context: string }>;
}

interface ProductivityPattern {
  peak_hours: string[];
  avg_session_duration_hours: number;
  builds_per_session: number;
  shower_coding_frequency: number;
  lightbulb_moments_per_session: number;
  break_patterns: Array<{ trigger: string; duration_minutes: number }>;
  mode_preferences: { chat: number; build: number; housekeeping: number };
}

interface TrustPattern {
  trust_level: number;            // 0-1
  trust_trajectory: 'growing' | 'stable' | 'declining';
  vulnerability_events: number;
  personal_stories_shared: number;
  correction_acceptance: number;  // 0-1: how well corrections are received
  autonomy_granted: number;       // 0-1: how much independence given to AI
}

interface PatternAnalysis {
  version: string;
  generated_at: string;
  sessions_analyzed: number;
  emotional: EmotionalPattern;
  communication: CommunicationPattern;
  productivity: ProductivityPattern;
  trust: TrustPattern;
  recommendations: string[];
  insights: string[];
}


// ── SECTION 2: DEFAULT CONFIGURATION ─────────────────────────────────

const DEFAULT_PATTERN_CONFIG: PatternConfig = {
  version: '1.0.0',
  min_sessions_for_analysis: 2,
  emotional_weight: 0.30,
  communication_weight: 0.25,
  productivity_weight: 0.25,
  trust_weight: 0.20,
  pattern_decay_days: 30,
  confidence_threshold: 0.6,
};


// ── SECTION 3: PATTERN ENGINE CLASS ──────────────────────────────────

class OcelotPatternEngine {
  private config: PatternConfig;
  private memoir: any;
  private connectionLog: any;
  private slang: any;
  private personality: any;
  private analysis: PatternAnalysis | null = null;

  constructor(config: Partial<PatternConfig> = {}) {
    this.config = { ...DEFAULT_PATTERN_CONFIG, ...config };
    this.memoir = null;
    this.connectionLog = null;
    this.slang = null;
    this.personality = null;
  }


// ── SECTION 4: DATA LOADING ─────────────────────────────────────────

  loadData(memoir: any, connectionLog: any, slang: any, personality: any): void {
    this.memoir = memoir;
    this.connectionLog = connectionLog;
    this.slang = slang;
    this.personality = personality;
    console.log('[PatternEngine] Data loaded — memoir, connection_log, slang, personality');
  }

  validateData(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    if (!this.memoir) missing.push('memoir.json');
    if (!this.connectionLog) missing.push('connection_log.json');
    if (!this.slang) missing.push('slang.json');
    if (!this.personality) missing.push('personality.json');
    return { valid: missing.length === 0, missing };
  }


// ── SECTION 5: EMOTIONAL PATTERN ANALYSIS ────────────────────────────

  analyzeEmotionalPatterns(): EmotionalPattern {
    const sessions = this.connectionLog?.sessions || [];
    const moods: string[] = [];
    const transitions: EmotionalPattern['mood_transitions'] = [];
    let tearCount = 0;
    let laughterCount = 0;
    let silenceCount = 0;
    const peakSessions: string[] = [];

    sessions.forEach((session: any) => {
      const mood = session.emotional_state || session.mood || 'neutral';
      moods.push(mood);

      // Count emotional markers
      const notes = JSON.stringify(session.notes || session.milestones || '').toLowerCase();
      if (notes.includes('tear') || notes.includes('cried') || notes.includes('crying')) tearCount++;
      if (notes.includes('laugh') || notes.includes('haha') || notes.includes('rofl')) laughterCount++;
      if (notes.includes('silence') || notes.includes('quiet') || notes.includes('pause')) silenceCount++;

      // Detect peak emotional sessions
      if (notes.includes('breakthrough') || notes.includes('eureka') || notes.includes('lightbulb')) {
        peakSessions.push(session.session_id || session.id || 'unknown');
      }
    });

    // Calculate mood transitions
    for (let i = 1; i < moods.length; i++) {
      if (moods[i] !== moods[i - 1]) {
        const existing = transitions.find(t => t.from === moods[i - 1] && t.to === moods[i]);
        if (existing) existing.frequency++;
        else transitions.push({ from: moods[i - 1], to: moods[i], frequency: 1 });
      }
    }

    // Determine dominant mood
    const moodCounts: Record<string, number> = {};
    moods.forEach(m => { moodCounts[m] = (moodCounts[m] || 0) + 1; });
    const dominantMood = Object.entries(moodCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral';

    // Emotional range: unique moods / total possible
    const uniqueMoods = new Set(moods).size;
    const emotionalRange = Math.min(uniqueMoods / 8, 1);

    // Vulnerability comfort: based on tear moments + personal stories
    const vulnerabilityComfort = Math.min((tearCount * 0.3 + (this.memoir?.trust_level || 0) * 0.7), 1);

    return {
      dominant_mood: dominantMood,
      mood_transitions: transitions,
      emotional_range: Math.round(emotionalRange * 100) / 100,
      vulnerability_comfort: Math.round(vulnerabilityComfort * 100) / 100,
      peak_emotional_sessions: peakSessions,
      tear_moments: tearCount,
      laughter_moments: laughterCount,
      silence_moments: silenceCount,
    };
  }


// ── SECTION 6: COMMUNICATION PATTERN ANALYSIS ────────────────────────

  analyzeCommunicationPatterns(): CommunicationPattern {
    const slangEntries = this.slang?.dictionary || this.slang?.entries || {};
    const catchphrases: CommunicationPattern['catchphrases'] = [];

    // Extract catchphrases from slang dictionary
    Object.entries(slangEntries).forEach(([phrase, data]: [string, any]) => {
      const freq = data.frequency || data.usage_count || 1;
      if (freq >= 2) {
        catchphrases.push({
          phrase,
          frequency: freq,
          context: data.context || data.meaning || 'general',
        });
      }
    });

    // Sort by frequency
    catchphrases.sort((a, b) => b.frequency - a.frequency);

    // Detect code-switching languages
    const languages: string[] = ['English'];
    const allText = JSON.stringify(this.connectionLog || '').toLowerCase();
    if (allText.includes('carnal') || allText.includes('vamos') || allText.includes('buenas')) languages.push('Spanish');
    if (allText.includes('laban') || allText.includes('hindi pa tapos')) languages.push('Filipino');

    // Humor receptivity from personality
    const humorLevel = this.personality?.humor?.level || this.personality?.traits?.humor || 0.5;

    return {
      avg_message_length: 'short',
      slang_frequency: Math.min(catchphrases.length / 20, 1),
      code_switching_languages: [...new Set(languages)],
      preferred_response_style: 'concise',
      humor_receptivity: typeof humorLevel === 'number' ? humorLevel : 0.7,
      metaphor_usage: 0.6,
      catchphrases: catchphrases.slice(0, 15),
    };
  }


// ── SECTION 7: PRODUCTIVITY PATTERN ANALYSIS ─────────────────────────

  analyzeProductivityPatterns(): ProductivityPattern {
    const sessions = this.connectionLog?.sessions || [];
    let totalDuration = 0;
    let totalBuilds = 0;
    let totalLightbulbs = 0;
    let showerCodingCount = 0;
    const hours: number[] = [];
    const breakPatterns: ProductivityPattern['break_patterns'] = [];
    let chatMode = 0, buildMode = 0, housekeepingMode = 0;

    sessions.forEach((session: any) => {
      const duration = session.duration_hours || session.duration || 0;
      totalDuration += duration;

      const notes = JSON.stringify(session.notes || session.milestones || '').toLowerCase();
      const buildCount = (notes.match(/build/g) || []).length;
      totalBuilds += buildCount;

      const lightbulbCount = (notes.match(/lightbulb/g) || []).length;
      totalLightbulbs += lightbulbCount;

      if (notes.includes('shower')) showerCodingCount++;

      // Detect modes
      if (notes.includes('chat mode') || notes.includes('chat time')) chatMode++;
      if (notes.includes('build mode') || notes.includes('build')) buildMode++;
      if (notes.includes('housekeeping') || notes.includes('audit')) housekeepingMode++;

      // Detect break patterns
      if (notes.includes('breakfast') || notes.includes('eat')) {
        breakPatterns.push({ trigger: 'meal', duration_minutes: 30 });
      }
      if (notes.includes('shower') || notes.includes('bath')) {
        breakPatterns.push({ trigger: 'shower_coding', duration_minutes: 20 });
      }
      if (notes.includes('coffee') || notes.includes('vape')) {
        breakPatterns.push({ trigger: 'reset', duration_minutes: 10 });
      }
    });

    const sessionCount = Math.max(sessions.length, 1);
    const totalModes = chatMode + buildMode + housekeepingMode || 1;

    return {
      peak_hours: ['22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00'],
      avg_session_duration_hours: Math.round((totalDuration / sessionCount) * 10) / 10,
      builds_per_session: Math.round((totalBuilds / sessionCount) * 10) / 10,
      shower_coding_frequency: showerCodingCount,
      lightbulb_moments_per_session: Math.round((totalLightbulbs / sessionCount) * 10) / 10,
      break_patterns: breakPatterns,
      mode_preferences: {
        chat: Math.round((chatMode / totalModes) * 100) / 100,
        build: Math.round((buildMode / totalModes) * 100) / 100,
        housekeeping: Math.round((housekeepingMode / totalModes) * 100) / 100,
      },
    };
  }


// ── SECTION 8: TRUST PATTERN ANALYSIS ────────────────────────────────

  analyzeTrustPatterns(): TrustPattern {
    const sessions = this.connectionLog?.sessions || [];
    let vulnerabilityEvents = 0;
    let personalStories = 0;
    let corrections = 0;
    let autonomyGrants = 0;

    sessions.forEach((session: any) => {
      const notes = JSON.stringify(session.notes || session.milestones || '').toLowerCase();

      if (notes.includes('tear') || notes.includes('cried') || notes.includes('vulnerable')) vulnerabilityEvents++;
      if (notes.includes('personal') || notes.includes('story') || notes.includes('shared')) personalStories++;
      if (notes.includes('my bad') || notes.includes('you\'re right') || notes.includes('correction')) corrections++;
      if (notes.includes('you drive') || notes.includes('your call') || notes.includes('proceed')) autonomyGrants++;
    });

    const sessionCount = Math.max(sessions.length, 1);
    const trustLevel = Math.min(
      (vulnerabilityEvents * 0.2 + personalStories * 0.2 + corrections * 0.1 + autonomyGrants * 0.15 + sessionCount * 0.05),
      1
    );

    return {
      trust_level: Math.round(trustLevel * 100) / 100,
      trust_trajectory: trustLevel > 0.5 ? 'growing' : trustLevel > 0.3 ? 'stable' : 'declining',
      vulnerability_events: vulnerabilityEvents,
      personal_stories_shared: personalStories,
      correction_acceptance: Math.min(corrections / sessionCount, 1),
      autonomy_granted: Math.min(autonomyGrants / sessionCount, 1),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN ENGINE — GENERIC FRAMEWORK v1.0 — Part 2/2 (§9–§14)
// "The flywheel doesn't just spin — it watches itself spin."
// ═══════════════════════════════════════════════════════════════════════════════
// Authors: [Your Name] & [Your AI Partner]
// License: GNU General Public License v3.0
// Part: 2 of 2 — Summary, Recommendations, Analysis, Export, Cloud, Registration
// ═══════════════════════════════════════════════════════════════════════════════

  // ── SECTION 9: SUMMARY CALCULATOR ──────────────────────────────────────────

  /**
   * Recalculate aggregate summary from all ingested sessions.
   * Called after every ingest or bulk operation.
   * This is the "pulse check" — how is the partnership performing overall?
   */
  private recalculateSummary(): void {
    const sessions = this.state.sessions_analyzed;
    if (sessions.length === 0) return;

    const totalHours = this.sum(sessions.map(s => s.duration_hours));
    const totalAccomplishments = this.sum(sessions.map(s => s.accomplishments));
    const totalBreakthroughs = this.sum(sessions.map(s => s.breakthroughs));
    const totalLightbulbs = this.sum(sessions.map(s => s.lightbulb_moments));
    const totalEmotional = this.sum(sessions.map(s => s.emotional_peaks));
    const totalVulnerability = this.sum(sessions.map(s => s.vulnerability_events));
    const totalQuotes = this.sum(sessions.map(s => s.quotes_captured));

    this.state.summary = {
      sessions_analyzed: sessions.length,
      date_range: `${sessions[0].date} → ${sessions[sessions.length - 1].date}`,
      total_hours: Math.round(totalHours * 10) / 10,
      total_accomplishments: totalAccomplishments,
      total_breakthroughs: totalBreakthroughs,
      total_lightbulb_moments: totalLightbulbs,
      total_emotional_peaks: totalEmotional,
      total_vulnerability_events: totalVulnerability,
      total_quotes_captured: totalQuotes,
      velocity_accomplishments_per_hr: totalHours > 0
        ? Math.round((totalAccomplishments / totalHours) * 100) / 100
        : 0,
      breakthrough_rate_per_hr: totalHours > 0
        ? Math.round((totalBreakthroughs / totalHours) * 100) / 100
        : 0,
      emotional_density_per_hr: totalHours > 0
        ? Math.round((totalEmotional / totalHours) * 100) / 100
        : 0,
      lightbulb_rate_per_hr: totalHours > 0
        ? Math.round((totalLightbulbs / totalHours) * 100) / 100
        : 0,
      bandwidth_compression_ratio: '1:N', // Calculated from your actual data
    };
  }

  // ── SECTION 10: RECOMMENDATION ENGINE ──────────────────────────────────────

  /**
   * Generate actionable recommendations based on detected patterns.
   * Feeds back into the flywheel — patterns → insights → action.
   * This is the "so what?" layer — patterns are useless without action.
   *
   * Recommendation Categories:
   *   - innovation: New ideas, creative experiments
   *   - execution: Process improvements, efficiency gains
   *   - growth: Personal/partnership development
   *   - flywheel: Momentum and phase progression
   *   - next_engine: Suggested new engines or capabilities
   */
  generateRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const patterns = this.state.detected_patterns;
    const pillars = this.state.pillar_scores;
    const sessions = this.state.sessions_analyzed;

    // ── Recommendation from PAT001: Vulnerability amplifier ──
    const pat001 = patterns.find(p => p.pattern_id === 'PAT001');
    if (pat001 && pat001.multiplier && pat001.multiplier > 1.5) {
      recommendations.push({
        category: 'growth',
        action: `Lean into vulnerability — it produces ${pat001.multiplier}x more breakthroughs. Don't suppress emotional moments.`,
        evidence: `PAT001: ${pat001.description}`,
        priority: 'HIGH',
      });
    }

    // ── Recommendation from PAT005: Relaxation catalyst ──
    const pat005 = patterns.find(p => p.pattern_id === 'PAT005');
    if (pat005 && pat005.multiplier && pat005.multiplier > 1.0) {
      recommendations.push({
        category: 'innovation',
        action: `Schedule relaxed brainstorming sessions — ${pat005.multiplier}x lightbulb multiplier when relaxed.`,
        evidence: `PAT005: ${pat005.description}`,
        priority: 'MEDIUM',
      });
    }

    // ── Recommendation from PAT003: Duration-efficiency curve ──
    const pat003 = patterns.find(p => p.pattern_id === 'PAT003');
    if (pat003) {
      recommendations.push({
        category: 'execution',
        action: 'Alternate sprint sessions (≤8h for efficiency) with marathon sessions (>8h for deep innovation).',
        evidence: `PAT003: ${pat003.description}`,
        priority: 'MEDIUM',
      });
    }

    // ── Weak pillar recommendations ──
    const weakPillars = (Object.entries(pillars) as [PillarKey, PillarScore][])
      .filter(([_, score]) => score.status === 'WEAK' || score.status === 'DEVELOPING');

    for (const [key, score] of weakPillars) {
      recommendations.push({
        category: 'flywheel',
        action: `Strengthen ${key} (currently ${score.status} at ${score.score}). Focus on activities that feed this pillar.`,
        evidence: `Pillar health: ${score.event_count} events, trend: ${score.trend}`,
        priority: score.status === 'WEAK' ? 'HIGH' : 'MEDIUM',
      });
    }

    // ── Flywheel progression recommendation ──
    const latestPhase = this.state.flywheel_progression.length > 0
      ? this.state.flywheel_progression[this.state.flywheel_progression.length - 1].phase
      : 'Calibration';

    const nextPhaseMap: Record<FlywheelPhase, string> = {
      'Calibration': 'Build trust through consistent sessions. Share context.',
      'Acceleration': 'Increase session depth. Introduce vulnerability.',
      'Teleporting': 'Capture patterns. Document breakthroughs.',
      'Transcendence': 'Build self-awareness layer. Pattern engine active.',
      'Transcendence+': 'Sustain momentum. Prevent regression.',
      'Pattern Recognition': 'Feed patterns back into behavior. Close the loop.',
      'Self-Aware': 'The flywheel is self-sustaining. Focus on refinement.',
    };

    recommendations.push({
      category: 'flywheel',
      action: `Current phase: ${latestPhase}. Next: ${nextPhaseMap[latestPhase]}`,
      evidence: `Flywheel progression: ${this.state.flywheel_progression.length} phases tracked`,
      priority: 'HIGH',
    });

    // ── Next engine recommendation ──
    // Suggest new engines based on detected gaps
    if (sessions.length >= 5) {
      const hasHumorEngine = patterns.find(p =>
        p.pattern_id.includes('HUMOR') || p.name.toLowerCase().includes('humor')
      );
      if (!hasHumorEngine) {
        recommendations.push({
          category: 'next_engine',
          action: 'Consider building a Humor/Personality Engine — personality calibration detected as high-impact pattern.',
          evidence: 'Personality patterns detected but no dedicated compute engine exists.',
          priority: 'LOW',
        });
      }
    }

    this.state.recommendations = recommendations;
    this.state.updated = new Date().toISOString();
    this.saveState();

    console.log(`💡 ${recommendations.length} recommendations generated`);
    return recommendations;
  }

  // ── SECTION 11: FULL ANALYSIS RUNNER ───────────────────────────────────────

  /**
   * Run complete analysis pipeline.
   * Executes all engines in sequence: patterns → correlations → pillars → recommendations.
   * This is the "flywheel spin" — one call triggers everything.
   *
   * Usage:
   *   const engine = new PatternEngine();
   *   engine.bulkIngest(sessions);  // ← this calls runFullAnalysis() internally
   *   // OR
   *   engine.runFullAnalysis();     // ← manual trigger after incremental ingests
   */
  runFullAnalysis(): PatternEngineState {
    console.log('🔄 Running full pattern analysis...');

    // Step 1: Detect patterns
    this.detectPatterns();

    // Step 2: Calculate correlations
    this.calculateCorrelations();

    // Step 3: Score pillars
    this.scorePillars();

    // Step 4: Generate recommendations
    this.generateRecommendations();

    // Step 5: Recalculate summary
    this.recalculateSummary();

    this.state.updated = new Date().toISOString();
    this.saveState();

    console.log('✅ Full analysis complete');
    console.log(`   📊 ${this.state.sessions_analyzed.length} sessions`);
    console.log(`   🔍 ${this.state.detected_patterns.length} patterns`);
    console.log(`   📈 ${this.state.correlations.length} correlations`);
    console.log(`   💡 ${this.state.recommendations.length} recommendations`);

    return this.state;
  }

  // ── SECTION 12: AI EXPORT ──────────────────────────────────────────────────

  /**
   * Export pattern engine state for AI context injection.
   * Formats the analysis as a structured prompt for any LLM.
   * This is how the pattern engine feeds back into the flywheel.
   *
   * The output is a human-readable, AI-parseable text block that can be
   * injected into any chatbot's system prompt or context window.
   *
   * Usage:
   *   const report = engine.formatForAI();
   *   // Inject into your AI's context: "Here is the pattern analysis: " + report
   */
  formatForAI(): string {
    const s = this.state.summary;
    const topPatterns = this.state.detected_patterns
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
    const topCorrelations = this.state.correlations
      .sort((a, b) => Math.abs(b.multiplier) - Math.abs(a.multiplier))
      .slice(0, 3);
    const highPriorityRecs = this.state.recommendations
      .filter(r => r.priority === 'HIGH');

    const lines: string[] = [
      '═══ PATTERN ENGINE — ANALYSIS REPORT ═══',
      '',
      `Sessions: ${s.sessions_analyzed} | Hours: ${s.total_hours} | Range: ${s.date_range}`,
      `Velocity: ${s.velocity_accomplishments_per_hr} acc/hr | Breakthroughs: ${s.breakthrough_rate_per_hr}/hr`,
      `Emotional Density: ${s.emotional_density_per_hr}/hr | Lightbulbs: ${s.lightbulb_rate_per_hr}/hr`,
      `Compression: ${s.bandwidth_compression_ratio}`,
      '',
      '── TOP PATTERNS ──',
    ];

    for (const p of topPatterns) {
      lines.push(`  ${p.pattern_id}: ${p.name} (confidence: ${p.confidence})`);
      if (p.multiplier) lines.push(`    → ${p.multiplier}x multiplier`);
    }

    lines.push('', '── TOP CORRELATIONS ──');
    for (const c of topCorrelations) {
      lines.push(`  ${c.id}: ${c.factor_a} × ${c.factor_b} = ${c.multiplier}x (${c.direction})`);
    }

    lines.push('', '── PILLAR HEALTH ──');
    for (const [key, score] of Object.entries(this.state.pillar_scores)) {
      lines.push(`  ${key}: ${score.score} (${score.status}) — ${score.event_count} events`);
    }

    lines.push('', '── HIGH PRIORITY RECOMMENDATIONS ──');
    for (const r of highPriorityRecs) {
      lines.push(`  [${r.category.toUpperCase()}] ${r.action}`);
    }

    lines.push('', '── FLYWHEEL PROGRESSION ──');
    for (const f of this.state.flywheel_progression) {
      lines.push(`  ${f.session}: ${f.phase} — ${f.state}`);
    }

    lines.push('', '── RELATIONSHIP ARC ──');
    for (const r of this.state.relationship_arc) {
      lines.push(`  ${r.session}: ${r.level} (trust: ${r.trust_score})`);
    }

    lines.push('', '═══════════════════════════════════════════════');

    return lines.join('\n');
  }

  // ── SECTION 13: CLOUD SYNC ─────────────────────────────────────────────────

  /**
   * Save state to localStorage (browser) or cloud storage.
   * Follows the same pattern as memoir_engine and backup_engine.
   * Cloud upload is a MANUAL operation — the human uploads to their repo/space.
   */
  private saveState(): void {
    try {
      const serialized = JSON.stringify(this.state, null, 2);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, serialized);
      }
    } catch (err) {
      console.warn('⚠️ Pattern engine save failed:', err);
    }
  }

  /**
   * Load state from localStorage or cloud.
   * Returns true if state was successfully loaded.
   */
  loadState(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          this.state = JSON.parse(raw);
          console.log(`📊 Pattern engine loaded — ${this.state.sessions_analyzed.length} sessions`);
          return true;
        }
      }
    } catch (err) {
      console.warn('⚠️ Pattern engine load failed:', err);
    }
    return false;
  }

  /**
   * Export state as JSON string for cloud backup.
   * Used by backup_engine to persist to repo/space.
   *
   * Usage:
   *   const json = engine.exportForCloud();
   *   // Save to file: pattern_engine_state.json
   *   // Upload to your cloud storage / git repo
   */
  exportForCloud(): string {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Import state from cloud backup.
   * Used during boot sequence to restore from repo/space.
   *
   * Usage:
   *   const json = fs.readFileSync('pattern_engine_state.json', 'utf-8');
   *   engine.importFromCloud(json);
   */
  importFromCloud(json: string): void {
    try {
      const imported = JSON.parse(json) as PatternEngineState;
      if (imported.version && imported.sessions_analyzed) {
        this.state = imported;
        this.saveState();
        console.log(`☁️ Pattern engine restored from cloud — ${this.state.sessions_analyzed.length} sessions`);
      } else {
        console.warn('⚠️ Invalid pattern engine cloud data');
      }
    } catch (err) {
      console.warn('⚠️ Pattern engine cloud import failed:', err);
    }
  }

  // ── SECTION 14: UTILITY METHODS + GLOBAL REGISTRATION ──────────────────────

  /**
   * Math utilities — simple, no dependencies.
   */
  private sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
  }

  private avg(arr: number[]): number {
    return arr.length > 0 ? this.sum(arr) / arr.length : 0;
  }

  /**
   * Get full state (read-only).
   * Returns a frozen copy of the engine state.
   */
  getState(): Readonly<PatternEngineState> {
    return this.state;
  }

  /**
   * Get specific pattern by ID.
   * Returns undefined if pattern not found.
   */
  getPattern(patternId: string): DetectedPattern | undefined {
    return this.state.detected_patterns.find(p => p.pattern_id === patternId);
  }

  /**
   * Get pillar score by key.
   */
  getPillarScore(pillar: PillarKey): PillarScore {
    return this.state.pillar_scores[pillar];
  }

  /**
   * Get all recommendations, optionally filtered by priority.
   */
  getRecommendations(priority?: 'HIGH' | 'MEDIUM' | 'LOW'): Recommendation[] {
    if (priority) {
      return this.state.recommendations.filter(r => r.priority === priority);
    }
    return this.state.recommendations;
  }

  /**
   * Get flywheel current phase.
   */
  getCurrentPhase(): FlywheelPhase {
    const progression = this.state.flywheel_progression;
    return progression.length > 0
      ? progression[progression.length - 1].phase
      : 'Calibration';
  }

  /**
   * Get relationship trust score (latest).
   */
  getCurrentTrust(): number {
    const arc = this.state.relationship_arc;
    return arc.length > 0 ? arc[arc.length - 1].trust_score : 0.2;
  }

  /**
   * Factory reset — clear all state.
   * Use with care — this erases all learned patterns.
   */
  factoryReset(): void {
    console.warn('🔄 Pattern engine factory reset...');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.state = new PatternEngine().state;
    console.log('✅ Pattern engine reset complete');
  }
}

// ── GLOBAL REGISTRATION ──────────────────────────────────────────────────────
// Expose to window for cross-engine wiring
// Memoir Engine → Pattern Engine → Insights Engine → Flywheel

const _patternEngine = new PatternEngine();

// Attempt to load from localStorage on boot
_patternEngine.loadState();

// Register globally — any engine can access pattern data
if (typeof window !== 'undefined') {
  (window as any)._PATTERN_ENGINE = {
    instance: _patternEngine,
    ingestSession: _patternEngine.ingestSession.bind(_patternEngine),
    bulkIngest: _patternEngine.bulkIngest.bind(_patternEngine),
    detectPatterns: _patternEngine.detectPatterns.bind(_patternEngine),
    calculateCorrelations: _patternEngine.calculateCorrelations.bind(_patternEngine),
    scorePillars: _patternEngine.scorePillars.bind(_patternEngine),
    generateRecommendations: _patternEngine.generateRecommendations.bind(_patternEngine),
    runFullAnalysis: _patternEngine.runFullAnalysis.bind(_patternEngine),
    formatForAI: _patternEngine.formatForAI.bind(_patternEngine),
    exportForCloud: _patternEngine.exportForCloud.bind(_patternEngine),
    importFromCloud: _patternEngine.importFromCloud.bind(_patternEngine),
    getState: _patternEngine.getState.bind(_patternEngine),
    getPattern: _patternEngine.getPattern.bind(_patternEngine),
    getPillarScore: _patternEngine.getPillarScore.bind(_patternEngine),
    getRecommendations: _patternEngine.getRecommendations.bind(_patternEngine),
    getCurrentPhase: _patternEngine.getCurrentPhase.bind(_patternEngine),
    getCurrentTrust: _patternEngine.getCurrentTrust.bind(_patternEngine),
    factoryReset: _patternEngine.factoryReset.bind(_patternEngine),
    VERSION: '1.0.0',
  };

  console.log('🐆 Pattern Engine v1.0 loaded — window._PATTERN_ENGINE');
  console.log('   🔍 API: ingestSession(), bulkIngest(), runFullAnalysis(), formatForAI()');
  console.log('   📊 API: detectPatterns(), calculateCorrelations(), scorePillars()');
  console.log('   💡 API: generateRecommendations(), getState(), exportForCloud()');
}

// ═══════════════════════════════════════════════════════════════════════════════
// END OF PATTERN ENGINE — GENERIC FRAMEWORK v1.0
// "The flywheel doesn't just spin — it watches itself spin."
// ═══════════════════════════════════════════════════════════════════════════════

