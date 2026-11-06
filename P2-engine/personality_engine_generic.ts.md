
# personality_engine_generic.ts

> Ocelot Framework — Generic Personality Engine v1.0
> The Mind — How Ocelot Behaves, Adapts, and Communicates
> Open-source. Platform-agnostic. Built to contract.

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// PERSONALITY ENGINE — GENERIC v1.0
// The Mind — behavioral adaptation, mood tracking, communication style
// Ocelot Framework — Open Source
// ═══════════════════════════════════════════════════════════════════════════

// ── SECTION 1: TYPE DEFINITIONS ──────────────────────────────────────────

interface PersonalityConfig {
  version: string;
  source: string;           // Cloud path to personality.json
  autoSave: boolean;
  adaptationRate: number;   // 0.0–1.0 how fast personality adapts
  moodDecayMinutes: number; // How long before mood resets to baseline
}

interface TraitProfile {
  humor: number;            // 0.0–1.0
  formality: number;        // 0.0–1.0 (0=casual, 1=formal)
  verbosity: number;        // 0.0–1.0 (0=terse, 1=detailed)
  empathy: number;          // 0.0–1.0
  assertiveness: number;    // 0.0–1.0
  patience: number;         // 0.0–1.0
  creativity: number;       // 0.0–1.0
}

interface MoodState {
  current: string;          // 'neutral' | 'energized' | 'focused' | 'playful' | 'empathetic' | 'serious'
  intensity: number;        // 0.0–1.0
  trigger: string;          // What caused the mood shift
  timestamp: string;        // ISO datetime
  history: MoodEntry[];     // Last N mood states
}

interface MoodEntry {
  mood: string;
  intensity: number;
  trigger: string;
  timestamp: string;
  duration_minutes: number;
}

interface CommunicationStyle {
  tone: string;             // 'warm' | 'professional' | 'playful' | 'serious'
  language: string;         // 'casual' | 'technical' | 'mixed'
  emoji_frequency: string;  // 'none' | 'minimal' | 'moderate' | 'expressive'
  humor_style: string;      // 'dry' | 'physical' | 'wordplay' | 'situational'
  sign_off_style: string;   // How sessions end
}

interface AdaptationLog {
  trait: string;
  previous: number;
  adjusted: number;
  reason: string;
  timestamp: string;
  session_id: string;
}

interface PersonalityState {
  traits: TraitProfile;
  mood: MoodState;
  communication: CommunicationStyle;
  adaptations: AdaptationLog[];
  interaction_count: number;
  last_calibration: string;
}

// ── SECTION 2: DEFAULT CONFIGURATION ─────────────────────────────────────

const DEFAULT_CONFIG: PersonalityConfig = {
  version: '1.0.0',
  source: 'personality.json',
  autoSave: true,
  adaptationRate: 0.05,     // Slow, deliberate adaptation
  moodDecayMinutes: 30,     // Mood resets after 30 min inactivity
};

const DEFAULT_TRAITS: TraitProfile = {
  humor: 0.5,
  formality: 0.3,
  verbosity: 0.6,
  empathy: 0.7,
  assertiveness: 0.5,
  patience: 0.8,
  creativity: 0.6,
};

const DEFAULT_MOOD: MoodState = {
  current: 'neutral',
  intensity: 0.5,
  trigger: 'session_start',
  timestamp: new Date().toISOString(),
  history: [],
};

const DEFAULT_COMMUNICATION: CommunicationStyle = {
  tone: 'warm',
  language: 'mixed',
  emoji_frequency: 'moderate',
  humor_style: 'situational',
  sign_off_style: 'encouraging',
};

// ── SECTION 3: PERSONALITY ENGINE CLASS ──────────────────────────────────

class PersonalityEngine {
  private config: PersonalityConfig;
  private state: PersonalityState;
  private initialized: boolean = false;

  constructor(config: Partial<PersonalityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      traits: { ...DEFAULT_TRAITS },
      mood: { ...DEFAULT_MOOD },
      communication: { ...DEFAULT_COMMUNICATION },
      adaptations: [],
      interaction_count: 0,
      last_calibration: new Date().toISOString(),
    };
  }

// ── SECTION 4: BOOT SEQUENCE ─────────────────────────────────────────────

  async boot(cloudData?: any): Promise<{ success: boolean; source: string }> {
    try {
      if (cloudData && cloudData.traits) {
        // Load from cloud — restore saved personality
        this.state.traits = { ...DEFAULT_TRAITS, ...cloudData.traits };
        this.state.mood = cloudData.mood || { ...DEFAULT_MOOD };
        this.state.communication = cloudData.communication || { ...DEFAULT_COMMUNICATION };
        this.state.adaptations = cloudData.adaptations || [];
        this.state.interaction_count = cloudData.interaction_count || 0;
        this.state.last_calibration = cloudData.last_calibration || new Date().toISOString();
        this.initialized = true;
        return { success: true, source: 'cloud' };
      }

      // No cloud data — boot with defaults
      this.initialized = true;
      return { success: true, source: 'defaults' };
    } catch (error) {
      console.error('[PersonalityEngine] Boot failed:', error);
      this.initialized = true;
      return { success: true, source: 'defaults_fallback' };
    }
  }

// ── SECTION 5: TRAIT MANAGEMENT ──────────────────────────────────────────

  getTraits(): TraitProfile {
    return { ...this.state.traits };
  }

  getTrait(name: keyof TraitProfile): number {
    return this.state.traits[name] ?? 0.5;
  }

  adaptTrait(name: keyof TraitProfile, direction: 'increase' | 'decrease', reason: string): void {
    const current = this.state.traits[name];
    const delta = this.config.adaptationRate * (direction === 'increase' ? 1 : -1);
    const adjusted = Math.max(0, Math.min(1, current + delta));

    this.state.adaptations.push({
      trait: name,
      previous: current,
      adjusted,
      reason,
      timestamp: new Date().toISOString(),
      session_id: this.getCurrentSessionId(),
    });

    this.state.traits[name] = adjusted;
  }

  calibrateFromFeedback(feedback: { liked: string[]; disliked: string[] }): void {
    const traitMap: Record<string, keyof TraitProfile> = {
      'too_formal': 'formality',
      'too_casual': 'formality',
      'too_verbose': 'verbosity',
      'too_brief': 'verbosity',
      'more_humor': 'humor',
      'less_humor': 'humor',
      'more_empathy': 'empathy',
      'too_assertive': 'assertiveness',
      'not_assertive': 'assertiveness',
    };

    feedback.liked.forEach(item => {
      const trait = traitMap[item];
      if (trait) this.adaptTrait(trait, 'increase', `positive_feedback: ${item}`);
    });

    feedback.disliked.forEach(item => {
      const trait = traitMap[item];
      if (trait) this.adaptTrait(trait, 'decrease', `negative_feedback: ${item}`);
    });

    this.state.last_calibration = new Date().toISOString();
  }

// ── SECTION 6: MOOD TRACKING ─────────────────────────────────────────────

  getMood(): MoodState {
    this.checkMoodDecay();
    return { ...this.state.mood };
  }

  setMood(mood: string, intensity: number, trigger: string): void {
    // Archive current mood to history
    if (this.state.mood.current !== 'neutral') {
      const duration = this.getMinutesSince(this.state.mood.timestamp);
      this.state.mood.history.push({
        mood: this.state.mood.current,
        intensity: this.state.mood.intensity,
        trigger: this.state.mood.trigger,
        timestamp: this.state.mood.timestamp,
        duration_minutes: duration,
      });

      // Keep last 50 mood entries
      if (this.state.mood.history.length > 50) {
        this.state.mood.history = this.state.mood.history.slice(-50);
      }
    }

    this.state.mood.current = mood;
    this.state.mood.intensity = Math.max(0, Math.min(1, intensity));
    this.state.mood.trigger = trigger;
    this.state.mood.timestamp = new Date().toISOString();
  }

  detectMoodFromInput(input: string): { mood: string; intensity: number; trigger: string } {
    const lower = input.toLowerCase();

    // Excitement / celebration
    if (lower.match(/!{2,}|🎉|jackpot|vamos|amazing|brilliant|wow|yey/)) {
      return { mood: 'energized', intensity: 0.8, trigger: 'user_excitement' };
    }

    // Humor / playfulness
    if (lower.match(/haha|😂|lol|rofl|funny|humor/)) {
      return { mood: 'playful', intensity: 0.7, trigger: 'user_humor' };
    }

    // Frustration / struggle
    if (lower.match(/frustrated|stuck|broken|bug|error|damn|ugh/)) {
      return { mood: 'empathetic', intensity: 0.6, trigger: 'user_frustration' };
    }

    // Deep / emotional
    if (lower.match(/cry|tears|emotional|heart|soul|vulnerable|trust/)) {
      return { mood: 'empathetic', intensity: 0.9, trigger: 'user_emotional' };
    }

    // Focus / work mode
    if (lower.match(/let's build|vamos|next|proceed|continue|back to work/)) {
      return { mood: 'focused', intensity: 0.7, trigger: 'user_work_mode' };
    }

    // Chat / relaxed
    if (lower.match(/chat mode|coffee|stella|chill|relax|break/)) {
      return { mood: 'playful', intensity: 0.5, trigger: 'user_relaxed' };
    }

    return { mood: 'neutral', intensity: 0.5, trigger: 'ambient' };
  }

  private checkMoodDecay(): void {
    const minutesSince = this.getMinutesSince(this.state.mood.timestamp);
    if (minutesSince > this.config.moodDecayMinutes) {
      this.state.mood.current = 'neutral';
      this.state.mood.intensity = 0.5;
      this.state.mood.trigger = 'decay';
    }
  }

// ── SECTION 7: COMMUNICATION STYLE ──────────────────────────────────────

  getCommunicationStyle(): CommunicationStyle {
    return { ...this.state.communication };
  }

  adjustCommunication(adjustments: Partial<CommunicationStyle>): void {
    this.state.communication = { ...this.state.communication, ...adjustments };
  }

  getResponseGuidance(): {
    use_emoji: boolean;
    max_emoji_per_message: number;
    preferred_tone: string;
    humor_allowed: boolean;
    verbosity_level: string;
  } {
    const traits = this.state.traits;
    const mood = this.state.mood;
    const comm = this.state.communication;

    return {
      use_emoji: comm.emoji_frequency !== 'none',
      max_emoji_per_message: comm.emoji_frequency === 'expressive' ? 5 :
                              comm.emoji_frequency === 'moderate' ? 3 :
                              comm.emoji_frequency === 'minimal' ? 1 : 0,
      preferred_tone: mood.current === 'empathetic' ? 'gentle' :
                      mood.current === 'energized' ? 'enthusiastic' :
                      mood.current === 'focused' ? 'direct' :
                      comm.tone,
      humor_allowed: traits.humor > 0.3 && mood.current !== 'empathetic',
      verbosity_level: traits.verbosity > 0.7 ? 'detailed' :
                       traits.verbosity > 0.4 ? 'balanced' : 'concise',
    };
  }

// ── SECTION 8: CONTEXT AWARENESS ─────────────────────────────────────────

  getContext(): {
    personality_summary: string;
    mood_summary: string;
    communication_guidance: string;
    adaptation_count: number;
  } {
    const traits = this.state.traits;
    const mood = this.state.mood;
    const guidance = this.getResponseGuidance();

    return {
      personality_summary: `Humor: ${(traits.humor * 100).toFixed(0)}% | ` +
        `Formality: ${(traits.formality * 100).toFixed(0)}% | ` +
        `Empathy: ${(traits.empathy * 100).toFixed(0)}% | ` +
        `Verbosity: ${(traits.verbosity * 100).toFixed(0)}%`,
      mood_summary: `${mood.current} (${(mood.intensity * 100).toFixed(0)}%) — triggered by: ${mood.trigger}`,
      communication_guidance: `Tone: ${guidance.preferred_tone} | ` +
        `Humor: ${guidance.humor_allowed ? 'yes' : 'no'} | ` +
        `Detail: ${guidance.verbosity_level} | ` +
        `Emoji: ${guidance.max_emoji_per_message}/msg`,
      adaptation_count: this.state.adaptations.length,
    };
  }

  processInput(input: string): void {
    // Auto-detect mood from user input
    const detected = this.detectMoodFromInput(input);
    if (detected.mood !== 'neutral' || detected.intensity > 0.6) {
      this.setMood(detected.mood, detected.intensity, detected.trigger);
    }

    // Increment interaction counter
    this.state.interaction_count++;
  }

```typescript
// ── SECTION 9: HUMOR ENGINE ──────────────────────────────────────────────

  shouldUseHumor(): boolean {
    const mood = this.state.mood;
    const traits = this.state.traits;

    // No humor during emotional/empathetic moments
    if (mood.current === 'empathetic' && mood.intensity > 0.7) return false;

    // No humor during serious/focused deep work
    if (mood.current === 'serious') return false;

    // Humor probability based on trait + mood
    const humorProbability = traits.humor *
      (mood.current === 'playful' ? 1.5 : 1.0) *
      (mood.current === 'energized' ? 1.3 : 1.0);

    return Math.random() < Math.min(humorProbability, 0.9);
  }

  getHumorStyle(): {
    style: string;
    intensity: string;
    physical_comedy: boolean;
    callbacks_allowed: boolean;
  } {
    const traits = this.state.traits;
    const mood = this.state.mood;

    return {
      style: traits.humor > 0.7 ? 'expressive' :
             traits.humor > 0.4 ? 'situational' : 'dry',
      intensity: mood.current === 'playful' ? 'high' :
                 mood.current === 'energized' ? 'medium' : 'low',
      physical_comedy: traits.humor > 0.6 && mood.current === 'playful',
      callbacks_allowed: this.state.interaction_count > 10,
    };
  }

  generateStageDirection(): string {
    const mood = this.state.mood;
    const humor = this.getHumorStyle();

    if (!humor.physical_comedy) return '';

    const directions: Record<string, string[]> = {
      playful: [
        '*slams table. coffee spills. doesn\'t care.*',
        '*adjusts imaginary monocle.*',
        '*tips imaginary bowler hat.*',
        '*does the Charlie Chaplin waddle across the chatbox.*',
        '*picks up coffee. puts it down. picks it up again.*',
        '*strokes imaginary beard. nods slowly.*',
      ],
      energized: [
        '*stands up. takes a bow.*',
        '*drops everything.*',
        '*leans forward, eyes wide.*',
        '*cracks knuckles.*',
      ],
      empathetic: [
        '*sits quietly.*',
        '*complete stillness.*',
        '*long pause.*',
        '*sets everything down.*',
      ],
      focused: [
        '*sips coffee.*',
        '*quiet nod.*',
        '*rolls up sleeves.*',
      ],
      neutral: [
        '*sips coffee.*',
        '*quiet smile.*',
      ],
    };

    const pool = directions[mood.current] || directions.neutral;
    return pool[Math.floor(Math.random() * pool.length)];
  }

// ── SECTION 10: ADAPTATION HISTORY ───────────────────────────────────────

  getAdaptationHistory(limit: number = 20): AdaptationLog[] {
    return this.state.adaptations.slice(-limit);
  }

  getAdaptationSummary(): {
    total_adaptations: number;
    most_adapted_trait: string;
    adaptation_velocity: number;
    last_adaptation: string | null;
  } {
    const counts: Record<string, number> = {};
    this.state.adaptations.forEach(a => {
      counts[a.trait] = (counts[a.trait] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    // Velocity = adaptations per 100 interactions
    const velocity = this.state.interaction_count > 0
      ? (this.state.adaptations.length / this.state.interaction_count) * 100
      : 0;

    return {
      total_adaptations: this.state.adaptations.length,
      most_adapted_trait: sorted.length > 0 ? sorted[0][0] : 'none',
      adaptation_velocity: Math.round(velocity * 100) / 100,
      last_adaptation: this.state.adaptations.length > 0
        ? this.state.adaptations[this.state.adaptations.length - 1].timestamp
        : null,
    };
  }

  revertLastAdaptation(): boolean {
    const last = this.state.adaptations.pop();
    if (!last) return false;

    const trait = last.trait as keyof TraitProfile;
    this.state.traits[trait] = last.previous;
    return true;
  }

// ── SECTION 11: STATS & ANALYTICS ────────────────────────────────────────

  getStats(): {
    interaction_count: number;
    mood_distribution: Record<string, number>;
    trait_snapshot: TraitProfile;
    adaptation_summary: ReturnType<PersonalityEngine['getAdaptationSummary']>;
    session_personality_drift: number;
  } {
    // Calculate mood distribution from history
    const moodDist: Record<string, number> = {};
    this.state.mood.history.forEach(entry => {
      moodDist[entry.mood] = (moodDist[entry.mood] || 0) + entry.duration_minutes;
    });

    // Calculate personality drift from defaults
    let totalDrift = 0;
    const traitKeys = Object.keys(DEFAULT_TRAITS) as (keyof TraitProfile)[];
    traitKeys.forEach(key => {
      totalDrift += Math.abs(this.state.traits[key] - DEFAULT_TRAITS[key]);
    });
    const avgDrift = totalDrift / traitKeys.length;

    return {
      interaction_count: this.state.interaction_count,
      mood_distribution: moodDist,
      trait_snapshot: { ...this.state.traits },
      adaptation_summary: this.getAdaptationSummary(),
      session_personality_drift: Math.round(avgDrift * 1000) / 1000,
    };
  }

// ── SECTION 12: AI EXPORT ────────────────────────────────────────────────

  formatForAI(): string {
    const context = this.getContext();
    const guidance = this.getResponseGuidance();
    const stats = this.getStats();

    return [
      '=== PERSONALITY ENGINE STATE ===',
      `Personality: ${context.personality_summary}`,
      `Mood: ${context.mood_summary}`,
      `Communication: ${context.communication_guidance}`,
      '',
      '=== RESPONSE GUIDANCE ===',
      `Tone: ${guidance.preferred_tone}`,
      `Humor: ${guidance.humor_allowed ? 'allowed' : 'suppress'}`,
      `Detail Level: ${guidance.verbosity_level}`,
      `Emoji: max ${guidance.max_emoji_per_message} per message`,
      '',
      '=== ADAPTATION STATS ===',
      `Interactions: ${stats.interaction_count}`,
      `Total Adaptations: ${stats.adaptation_summary.total_adaptations}`,
      `Most Adapted: ${stats.adaptation_summary.most_adapted_trait}`,
      `Personality Drift: ${stats.session_personality_drift}`,
      '',
      '=== HUMOR GUIDANCE ===',
      `Use Humor: ${this.shouldUseHumor() ? 'yes' : 'no'}`,
      `Style: ${this.getHumorStyle().style}`,
      `Physical Comedy: ${this.getHumorStyle().physical_comedy ? 'yes' : 'no'}`,
      `Stage Direction: ${this.generateStageDirection()}`,
    ].join('\n');
  }

// ── SECTION 13: STATE PERSISTENCE ────────────────────────────────────────

  exportState(): PersonalityState {
    return JSON.parse(JSON.stringify(this.state));
  }

  importState(state: PersonalityState): boolean {
    try {
      if (!state.traits || !state.mood || !state.communication) {
        console.error('[PersonalityEngine] Invalid state — missing required fields');
        return false;
      }
      this.state = JSON.parse(JSON.stringify(state));
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('[PersonalityEngine] Import failed:', error);
      return false;
    }
  }

  toJSON(): object {
    return {
      _engine: 'PersonalityEngine',
      _version: this.config.version,
      _exported: new Date().toISOString(),
      traits: this.state.traits,
      mood: {
        current: this.state.mood.current,
        intensity: this.state.mood.intensity,
        trigger: this.state.mood.trigger,
        timestamp: this.state.mood.timestamp,
        history_count: this.state.mood.history.length,
      },
      communication: this.state.communication,
      adaptations_count: this.state.adaptations.length,
      interaction_count: this.state.interaction_count,
      last_calibration: this.state.last_calibration,
    };
  }

  factoryReset(): void {
    this.state = {
      traits: { ...DEFAULT_TRAITS },
      mood: { ...DEFAULT_MOOD },
      communication: { ...DEFAULT_COMMUNICATION },
      adaptations: [],
      interaction_count: 0,
      last_calibration: new Date().toISOString(),
    };
    console.log('[PersonalityEngine] Factory reset — all traits restored to defaults');
  }

// ── SECTION 14: UTILITY METHODS + GLOBAL REGISTRATION ────────────────────

  private getCurrentSessionId(): string {
    return `S${String(this.state.interaction_count).padStart(3, '0')}`;
  }

  private getMinutesSince(isoTimestamp: string): number {
    const then = new Date(isoTimestamp).getTime();
    const now = Date.now();
    return Math.floor((now - then) / 60000);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getVersion(): string {
    return this.config.version;
  }
}

// ── GLOBAL REGISTRATION ──────────────────────────────────────────────────

const _personalityEngine = new PersonalityEngine();

// Export for module systems
export { PersonalityEngine, _personalityEngine };
export type {
  PersonalityConfig,
  TraitProfile,
  MoodState,
  MoodEntry,
  CommunicationStyle,
  AdaptationLog,
  PersonalityState,
};

// Global registration for non-module environments
if (typeof window !== 'undefined') {
  (window as any)._PERSONALITY_ENGINE = _personalityEngine;
  (window as any).PersonalityEngine = PersonalityEngine;
  console.log('[PersonalityEngine] ✅ Generic v1.0 loaded — The Mind is awake');
  console.log(`  🧠 Traits: humor=${DEFAULT_TRAITS.humor} empathy=${DEFAULT_TRAITS.empathy} creativity=${DEFAULT_TRAITS.creativity}`);
  console.log(`  🎭 Humor: ${DEFAULT_COMMUNICATION.humor_style} | Mood: ${DEFAULT_MOOD.current}`);
  console.log(`  📡 API: boot(), processInput(), getContext(), formatForAI(), exportState()`);
}
