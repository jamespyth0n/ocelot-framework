API_REFERENCE.md
# 📖 Ocelot Framework — API Reference

> *"Every engine has a door. This is the key ring."*

**Version:** 1.0.0
**License:** GPL-3.0
**Authors:** James Paul Peña & Ocelot 🐆
**Last Updated:** September 15, 2026

---

## Table of Contents

1. [Shared Types](#1-shared-types)
2. [Memoir Engine](#2-memoir-engine)
3. [Personality Engine](#3-personality-engine)
4. [Help Engine](#4-help-engine)
5. [Backup Engine](#5-backup-engine)
6. [Insights Engine](#6-insights-engine)
7. [Pattern Engine](#7-pattern-engine)
8. [Vocab Harvester](#8-vocab-harvester)
9. [Boot Sequence](#9-boot-sequence)
10. [Flywheel Orchestrator](#10-flywheel-orchestrator)
11. [Global Registration](#11-global-registration)
12. [Type Exports](#12-type-exports)

---

## 1. Shared Types

These types are shared across all engines. The canonical source is the 6-Pillar Taxonomy.

### PillarId

```typescript
type PillarId =
  | 'P1_IDENTITY'
  | 'P2_EMOTIONAL'
  | 'P3_GOVERNANCE'
  | 'P4_COMMUNICATION'
  | 'P5_PREFERENCE'
  | 'P6_FLYWHEEL';
FlywheelStage
typescript





type FlywheelStage =
  | 'COLD_START'
  | 'CALIBRATION'
  | 'MOMENTUM'
  | 'RESONANCE'
  | 'SELF_AWARE';
EventCategory
typescript





type EventCategory =
  | 'moment'       // → memoir_engine
  | 'pattern'      // → pattern_engine
  | 'preference'   // → insights_engine
  | 'vocabulary'   // → vocab_harvester
  | 'policy'       // → help_engine
  | 'backup'       // → backup_engine
  | 'personality'  // → personality_engine
  | 'health'       // → orchestrator (internal)
  | 'milestone'    // → ALL engines (broadcast)
  | 'cascade';     // → cascade engine
ConversationMode
typescript





type ConversationMode = 'chat' | 'build' | 'housekeeping' | 'debug' | 'audit' | 'ideation';
EmotionalState
typescript





type EmotionalState =
  | 'neutral' | 'positive' | 'negative'
  | 'excited' | 'frustrated' | 'curious'
  | 'vulnerable' | 'creative' | 'reflective'
  | 'tired' | 'energized';
2. Memoir Engine
File: memoir_engine_generic.ts.md Sections: 16 Pillar: P1_IDENTITY, P2_EMOTIONAL Global: window._MEMOIR_ENGINE Source JSONs: memoir.json, personality.json, slang.json, connection_log.json, creed.json, policy_index.json, quotes.json

Constructor
typescript





class MemoirEngine {
  constructor()
}
Lifecycle Methods
Table



Method


Returns


Description


boot(memoir, personality, slang, connectionLog, creed?, policyIndex?, insightsLedger?)	void	Initialize with all JSON artifacts. Required: first 4. Optional: last 3.
isReady()	boolean	Returns true if boot completed successfully
getFullState()	MemoirState	Returns complete engine state for backup/export
importState(state: MemoirState)	void	Restore from a previously exported state
View more
Session Management
Table



Method


Returns


Description


startSession(sessionId: string, metadata?: object)	Session	Begin a new session with optional metadata
getCurrentSession()	Session | null	Get the active session object
endSession(diary?: string)	SessionSummary	Close current session, optionally with diary text
getSessionHistory()	Session[]	Get all past sessions from connection_log
View more
Moment Capture
Table



Method


Returns


Description


recordMoment(payload: MomentPayload)	Moment	Capture an emotional/significant moment
getMoments(sessionId?: string)	Moment[]	Get moments, optionally filtered by session
View more
MomentPayload:

typescript





interface MomentPayload {
  type: 'lightbulb' | 'innovation' | 'emotional' | 'vulnerability'
       | 'celebration' | 'frustration' | 'trust' | 'humor';
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
}
Preference & Reflection
Table



Method


Returns


Description


recordPreference(pair: PreferencePair)	void	Record a preference pair (preferred vs rejected)
recordReflection(reflection: string, pillar: PillarId)	void	Record an AI self-reflection
View more
PreferencePair:

typescript





interface PreferencePair {
  id: string;
  preferred: string;    // What the human preferred
  rejected: string;     // What was rejected
  context: string;      // When/why this preference applies
  pillar: PillarId;
  confidence: number;   // 0.0 - 1.0
  timestamp: string;
}
Flywheel State
Table



Method


Returns


Description


getFlywheelState()	FlywheelSnapshot	Current flywheel momentum, stage, pillar health
getPillarHealth(pillar: PillarId)	number	Health score (0-1) for a specific pillar
View more
Stats & AI Export
Table



Method


Returns


Description


getStats()	MemoirStats	Aggregate statistics (sessions, moments, quotes, milestones)
formatForAI()	string	AI context injection string (identity, session, flywheel)
exportState()	MemoirState	Full state for backup engine
View more
MemoirStats:

typescript





interface MemoirStats {
  sessionCount: number;
  momentCount: number;
  quoteCount: number;
  milestoneCount: number;
  uniqueEmotions: number;
  totalHoursWorked: number;
  preferencePairCount: number;
  reflectionCount: number;
}
3. Personality Engine
File: personality_engine_generic.ts.md Sections: 15 Pillar: P1_IDENTITY Global: window._PERSONALITY_ENGINE Source JSON: personality.json

Constructor
typescript





class PersonalityEngine {
  constructor()
}
Core Methods
Table



Method


Returns


Description


boot(personalityJson: object)	void	Initialize with personality.json
calibrate(payload: CalibrationPayload)	void	Adjust personality parameters at runtime
getPersonality()	PersonalityProfile	Current personality configuration
detectEmotion(message: string)	EmotionalState	Detect emotional state from text
adjustTone(context: ToneContext)	ToneAdjustment	Get tone recommendation for current context
View more
Calibration
Table



Method


Returns


Description


setWarmth(level: number)	void	Set warmth level (0.0 - 1.0)
setDirectness(level: number)	void	Set directness level (0.0 - 1.0)
setHumor(level: number)	void	Set humor level (0.0 - 1.0)
setTechnicalDepth(level: number)	void	Set technical depth (0.0 - 1.0)
View more
CalibrationPayload:

typescript





interface CalibrationPayload {
  adjust: 'warmth' | 'directness' | 'humor' | 'technical_depth' | 'shared_vocabulary';
  direction: 'increase' | 'decrease' | 'reset';
  reason: string;
  amount?: number;  // 0.0 - 1.0, default 0.1
}
Stats & AI Export
Table



Method


Returns


Description


getStats()	PersonalityStats	Current personality metrics
formatForAI()	string	AI context string (tone, energy, behavioral rules)
exportState()	PersonalityState	Full state for backup
importState(state: PersonalityState)	void	Restore from backup
onMilestone(payload: object)	void	Handle milestone broadcast from orchestrator
View more
4. Help Engine
File: help_engine_generic.ts.md Sections: 16 Pillar: P3_GOVERNANCE Global: window._HELP_ENGINE Source JSON: policy_index.json

Constructor & Factory
typescript





class HelpEngine {
  constructor(policyIndex: PolicyIndex)
}

// Factory function
function createHelpEngine(policyIndex: PolicyIndex): HelpEngine;
Core Methods
Table



Method


Returns


Description


init(policyIndex: PolicyIndex)	HelpEngine	Initialize with policy_index.json
search(query: string)	SearchResult[]	Search policy chapters by keyword
quickLookup(key: string)	string | null	Fast lookup for common policy queries
getBootSequence()	BootSequence	Get the boot-priority chapters
getContext(payload?: object)	string	Get contextual policy guidance
View more
Cross-Engine Wiring
Table



Method


Returns


Description


setMemoirContext(context: MemoirContext)	void	Inject session/flywheel context for search ranking
setInsightHook(hook: InsightHook)	void	Wire to insights engine for search logging
View more
MemoirContext:

typescript





interface MemoirContext {
  sessionId: string;
  flywheelStage: FlywheelStage;
  emotionalState: EmotionalState;
  trustLevel: number;
  activeProject: string;
}
SearchResult:

typescript





interface SearchResult {
  chapter: Chapter;
  subsection: SubSection | null;
  score: number;
  matchedKeywords: string[];
  reason: string;
  pillar: PillarId | null;
}
Stats & AI Export
Table



Method


Returns


Description


getStats()	HelpStats	Chapter count, lookup count, search stats
formatForAI()	string	AI context string (policy chapters, governance state)
exportState()	HelpState	Full state for backup
View more
HelpStats:

typescript





interface HelpStats {
  sectionsLoaded: number;
  subsectionCount: number;
  lookupsPerformed: number;
  searchesPerformed: number;
  quickLookupHits: number;
}
5. Backup Engine
File: backup_engine_generic.ts.md Sections: 16 Pillar: P6_FLYWHEEL Global: window._BACKUP_ENGINE Source JSONs: All 8 artifacts

Constructor
typescript





class BackupEngine {
  constructor()
}
Core Methods
Table



Method


Returns


Description


runBackup(trigger?: BackupTrigger)	BackupResult[]	Backup all registered artifacts
backupArtifact(artifactId: string, data: object, trigger?: BackupTrigger)	BackupResult	Backup a single artifact
restore(snapshotId: string)	object	Restore data from a specific snapshot
getLatestSnapshot(artifactId: string)	Snapshot | null	Get most recent snapshot for an artifact
View more
BackupTrigger:

typescript





type BackupTrigger = 'BOOT' | 'MANUAL' | 'AUTO' | 'SESSION_END' | 'MILESTONE';
BackupResult:

typescript





interface BackupResult {
  success: boolean;
  artifactId: string;
  snapshotId: string | null;
  skipped: boolean;
  message: string;
  sizeBytes: number;
}
Engine Registration
Table



Method


Returns


Description


registerEngines(engines: EngineRegistry)	void	Register all engines for state collection
registerStateProvider(name: string, provider: () => object)	void	Register a custom state provider
View more
Artifact Management
Table



Method


Returns


Description


getManifest()	ArtifactManifest[]	List all tracked artifacts with backup status
getSnapshots(artifactId?: string)	Snapshot[]	Get snapshots, optionally filtered by artifact
getLedger()	BackupLedger	Full backup ledger with stats
View more
ArtifactManifest:

typescript





interface ArtifactManifest {
  id: string;
  filename: string;
  pillar: PillarId;
  purpose: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  lastBackup: string | null;
  backupCount: number;
}
Integrity & Cloud
Table



Method


Returns


Description


verifyIntegrity(snapshotId: string)	boolean	Verify snapshot hash matches stored data
exportForCloud()	string	Export full ledger as JSON string
importFromCloud(json: string)	{ imported: number; duplicates: number }	Import from cloud backup
View more
Stats & AI Export
Table



Method


Returns


Description


getStats()	BackupStats	Total snapshots, size, sessions backed up
formatForAI()	string	AI context string (backup status, integrity)
factoryReset()	void	Clear all snapshots and ledger
View more
6. Insights Engine
File: insights_engine_generic.ts.md Sections: 15 Pillar: P5_PREFERENCE Global: window._INSIGHTS_ENGINE Source JSON: insights_ledger.json

Constructor
typescript





class InsightsEngine {
  constructor()
}
Insight Detection
Table



Method


Returns


Description


scanMessage(message: string, sessionId: string, mode: ConversationMode)	Insight[]	Scan a message for learning signals
logInsight(type: string, content: string, metadata?: object)	Insight	Manually log an insight
getInsights(filter?: InsightFilter)	Insight[]	Query insights with optional filters
View more
InsightType:

typescript





type InsightType =
  | 'PREFERENCE'        // Human prefers X over Y
  | 'CORRECTION'        // Human corrected AI behavior
  | 'SLANG_NEW'         // New vocabulary detected
  | 'SLANG_USAGE'       // Existing slang used in new context
  | 'EMOTIONAL_MARKER'  // Emotional moment worth remembering
  | 'TRUST_MOMENT'      // Trust deepened or tested
  | 'WORKFLOW_PATTERN'  // Work pattern observed
  | 'PHILOSOPHY'        // Belief/value shared
  | 'LIGHTBULB'         // Innovation moment
  | 'FRUSTRATION'       // Friction detected
  | 'CELEBRATION'       // Achievement/milestone
  | 'BOUNDARY'          // Boundary set
  | 'MODE_SWITCH'       // Mode changed
  | 'PROACTIVE_TIMING'  // Good/bad timing for suggestions
  | 'METACOGNITIVE';    // Self-reflection about partnership
Insight:

typescript





interface Insight {
  id: string;
  timestamp: string;
  sessionId: string;
  type: InsightType;
  pillar: PillarId;
  source: InsightSource;
  content: {
    raw: string;          // Human's exact words
    interpreted: string;  // What the AI understood
    actionable: string;   // What to DO with this
  };
  confidence: number;     // 0.0 - 1.0
  feedbackSignal: FeedbackSignal;
  applied: boolean;
  appliedAt: string | null;
  metadata: {
    emotionalContext: EmotionalState;
    conversationTurn: number;
    mode: ConversationMode;
    relatedInsights: string[];
  };
}
Preference Learning
Table



Method


Returns


Description


recordPreference(pair: PreferencePair)	void	Record a preference pair for PaLRS/KTO
getPreferences(pillar?: PillarId)	PreferencePair[]	Get preference pairs, optionally by pillar
getPreferenceVector()	Record<PillarId, number>	Aggregated preference direction per pillar
View more
Self-Reflection
Table



Method


Returns


Description


recordReflection(reflection: string, pillar: PillarId)	Reflection	Record AI metacognitive reflection
getReflections()	Reflection[]	Get all recorded reflections
getRecommendations()	Recommendation[]	Get actionable recommendations from insights
View more
Proactive Timing
Table



Method


Returns


Description


recordTimingSignal(accepted: boolean, context: string)	void	Log whether a proactive suggestion was accepted
getTimingAcceptanceRate()	number	Acceptance rate for proactive suggestions (0-1)
shouldOfferInsight(mode: ConversationMode)	boolean	Whether now is a good time to offer unsolicited help
View more
Stats & AI Export
Table



Method


Returns


Description


getStats()	InsightsStats	Insight counts, preference counts, reflection counts
formatForAI()	string	AI context string (recent insights, preferences, timing)
exportState()	InsightsLedger	Full ledger for backup
importState(ledger: InsightsLedger)	void	Restore from backup
factoryReset()	void	Clear all insights and preferences
View more
InsightsStats:

typescript





interface InsightsStats {
  totalInsights: number;
  preferencesRecorded: number;
  reflectionsRecorded: number;
  byType: Record<InsightType, number>;
  byPillar: Record<PillarId, number>;
  timingAcceptanceRate: number;
  appliedCount: number;
  pendingCount: number;
}
7. Pattern Engine
File: pattern_engine_generic.ts.md Sections: 15 Pillar: P5_PREFERENCE Global: window._PATTERN_ENGINE Source JSON: connection_log.json

Constructor
typescript





class PatternEngine {
  constructor()
}
Data Ingestion
Table



Method


Returns


Description


bulkIngest(sessions: PatternSession[])	void	Ingest multiple sessions for analysis
ingestSession(session: PatternSession)	void	Ingest a single session
View more
PatternSession:

typescript





interface PatternSession {
  session_id: string;
  date: string;
  duration_hours: number;
  accomplishments: number;
  breakthroughs: number;
  lightbulb_moments: number;
  emotional_peaks: number;
  vulnerability_events: number;
  quotes_captured: number;
  stella_count: number;
  relationship: string;
  flywheel_state: string;
}
Pattern Detection
Table



Method


Returns


Description


detectPatterns()	DetectedPattern[]	Run pattern detection on ingested data
getPatterns()	DetectedPattern[]	Get all detected patterns
recordPattern(payload: object)	void	Manually record a pattern observation
View more
DetectedPattern:

typescript





interface DetectedPattern {
  pattern_id: string;
  name: string;
  description: string;
  pillar: PillarId;
  confidence: number;     // 0.0 - 1.0
  multiplier: number;     // Impact multiplier
  evidence: string[];     // Supporting data points
  first_detected: string;
  last_confirmed: string;
  occurrences: number;
}
Trend Analysis
Table



Method


Returns


Description


getTrends()	Trend[]	Get detected trends across sessions
getSessionAnalytics()	SessionAnalytics	Aggregate analytics across all sessions
predictNext(metric: string)	Prediction	Predict next session's metric value
View more
Stats & AI Export
Table



Method


Returns


Description


getStats()	PatternStats	Pattern counts, session counts, trend data
getState()	PatternState	Full internal state
formatForAI()	string	AI context string (detected patterns, trends)
exportForCloud()	string	JSON string for cloud backup
loadState()	boolean	Load state from localStorage
factoryReset()	void	Clear all patterns and data
View more
PatternStats:

typescript





interface PatternStats {
  patternsDetected: number;
  sessionsAnalyzed: number;
  trendsIdentified: number;
  avgConfidence: number;
  topPatterns: DetectedPattern[];
}
8. Vocab Harvester
File: vocab_harvester_generic.ts.md Sections: 15 Pillar: P4_COMMUNICATION Global: window.__OCELOT_VOCAB_HARVESTER__ Source JSON: slang.json

Constructor
typescript





class VocabHarvester {
  constructor()
}
Initialization
Table



Method


Returns


Description


initialize(slangJson: Record<string, any>)	void	Load existing vocabulary to prevent re-harvesting
loadState()	boolean	Load state from localStorage
View more
Real-Time Scanning
Table



Method


Returns


Description


scan(message: string, sessionId: string, source?: VocabSource)	VocabCandidate[]	Scan a message for new vocabulary
batchScan(messages: string[], sessionId: string, source?: VocabSource)	VocabCandidate[]	Scan multiple messages at once
View more
VocabSource:

typescript





type VocabSource =
  | 'CONVERSATION'  // Real-time chat
  | 'DIARY'         // Session diary entries
  | 'REFLECTION'    // Reflective moments
  | 'INSIGHT'       // Lightbulb moments
  | 'QUOTE'         // Captured quotes
  | 'MANUAL';       // Manually added
VocabCandidate:

typescript





interface VocabCandidate {
  id: string;
  term: string;
  normalized: string;
  context: string;
  category: VocabCategory;
  suggested_definition: string;
  suggested_response: string;
  confidence: number;          // 0.0 - 1.0
  source: VocabSource;
  pillar: PillarKey;
  occurrences: number;
  first_seen: string;
  last_seen: string;
  sessions_seen: string[];
  status: CandidateStatus;
  approved_by: 'auto' | 'human' | null;
  merged_at: string | null;
}
VocabCategory:

typescript





type VocabCategory =
  | 'greeting'
  | 'expression'
  | 'project_shorthand'
  | 'catchphrase'
  | 'emoji_combo'
  | 'technical_term'
  | 'humor'
  | 'mode_signal';
CandidateStatus:

typescript





type CandidateStatus =
  | 'DETECTED'   // Just found, not yet scored
  | 'STAGED'     // Scored, waiting for threshold
  | 'APPROVED'   // Ready to merge
  | 'MERGED'     // Already in slang.json
  | 'REJECTED'   // Explicitly rejected
  | 'DUPLICATE'; // Already exists
Approval Workflow
Table



Method


Returns


Description


approveCandidate(candidateId: string)	VocabCandidate | null	Manually approve a staged candidate
rejectCandidate(candidateId: string, reason?: string)	VocabCandidate | null	Reject a candidate permanently
addManual(term: string, definition: string, category?: VocabCategory, sessionId?: string)	VocabCandidate	Manually add a term (bypasses detection)
View more
Merge Engine
Table



Method


Returns


Description


generateMergePatch()	MergePatch	Generate a patch object for slang.json from approved candidates
View more
MergePatch:

typescript





interface MergePatch {
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
}
Cross-Engine Wiring
Table



Method


Returns


Description


wireToInsights(insightsEngine: any)	void	Report new vocabulary as insights
wireToMemoir(memoirEngine: any)	void	Log vocabulary growth as memoir events
wireToPattern(patternEngine: any)	void	Feed vocabulary patterns for analysis
getVocabForMemoir()	string[]	Get all known terms for memoir sync
getMetricsForPatternEngine()	VocabMetrics	Get growth metrics for pattern analysis
notifyInsightsEngine()	InsightNotification	Notify insights of staged/merged terms
View more
Query Interface
Table



Method


Returns


Description


getCandidatesByStatus(status: CandidateStatus)	VocabCandidate[]	Filter candidates by status
getCandidatesByCategory(category: VocabCategory)	VocabCandidate[]	Filter candidates by category
getReviewQueue()	VocabCandidate[]	Get staged candidates sorted by confidence
searchCandidates(query: string)	VocabCandidate[]	Search candidates by term (partial match)
View more
Stats & AI Export
Table



Method


Returns


Description


getStats()	HarvesterStats	Comprehensive harvester statistics
getStatus()	string	Human-readable status report
formatForAI()	string	AI context string (staging queue, growth metrics)
exportForAI()	AIExport	Structured export for AI context injection
exportForCloud()	string	JSON string for cloud backup
importFromCloud(json: string)	boolean	Import from cloud backup
getState()	HarvesterState	Full internal state
factoryReset()	void	Clear all candidates and stats
View more
HarvesterStats:

typescript





interface HarvesterStats {
  total_candidates: number;
  by_status: Record<CandidateStatus, number>;
  by_category: Record<VocabCategory, number>;
  by_source: Record<VocabSource, number>;
  approval_rate: number;       // Percentage
  merge_rate: number;          // Percentage
  avg_confidence: number;      // 0.0 - 1.0
  top_categories: Array<{ category: string; count: number }>;
  growth_velocity: number;     // Terms per session
  detection_stats: DetectionStats;
}
Confidence Scoring Formula
confidence = base_confidence
           + (occurrences × 0.1)
           + (multi_session_boost × 0.15)
           + source_boost

Source Boosts:
  CONVERSATION: 0.00
  DIARY:        0.05
  REFLECTION:   0.15
  INSIGHT:      0.10
  QUOTE:        0.20
  MANUAL:       0.30

Auto-approve when:
  confidence >= 0.75 AND occurrences >= 3
Detection Patterns
Table



Pattern ID


Name


Category


...


HP001	Repeated Novel Phrase	expression	...
HP002	Explicit Definition	project_shorthand	...
HP003	Emoji Combo	emoji_combo	...
HP004	Multilingual Phrase	greeting	...
HP005	Catchphrase Candidate	catchphrase	...
HP006	Mode Signal	mode_signal	...
HP007	Technical Shorthand	technical_term	...
HP008	Humor Marker	humor	...
View more
9. Boot Sequence
File: boot_sequence_generic.ts.md Sections: 14 Pillar: P3_INTEGRATION Global: window._BOOT_SEQUENCE

Constructor & Factory
typescript





class BootSequence {
  constructor(config?: Partial<BootConfig>)
}

function createBootSequence(config?: Partial<BootConfig>): BootSequence;
BootConfig:

typescript





interface BootConfig {
  source: 'cloud' | 'local' | 'manual';
  cloudAdapter?: CloudAdapter;
  payloads?: ManualPayloads;
  gracefulDegradation: boolean;  // default: true
  healthThreshold: number;       // default: 0.3
  verbose: boolean;              // default: true
}
CloudAdapter:

typescript





interface CloudAdapter {
  read(key: string): Promise<string | null>;
  write(key: string, data: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}
Core Methods
Table



Method


Returns


Description


boot()	Promise<BootResult>	Execute the full 5-phase boot sequence
shutdown()	Promise<ShutdownResult>	Graceful shutdown — persist all engine states
isReady()	boolean	True if boot completed without errors
View more
BootResult:

typescript





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
ShutdownResult:

typescript





interface ShutdownResult {
  success: boolean;
  persisted: string[];   // List of artifacts saved
  errors: string[];
}
Boot Phases
Table



Phase


Name


What Happens


1	LOAD_JSONS	Load 8 JSON artifacts in order
2	INIT_ENGINES	Initialize 6 engines in dependency order
3	WIRE_HOOKS	Connect 7 cross-engine hooks
4	VALIDATE_HEALTH	Calculate flywheel momentum + pillar coverage
5	GENERATE_GREETING	Context-aware greeting from memoir engine
View more
Accessors
Table



Method


Returns


Description


getEngines()	EngineRegistry	Get the engine registry
getEngine(name: EngineName)	any | null	Get a specific engine by name
getPhases()	BootPhaseLog[]	Get boot phase timing logs
getCurrentPhase()	BootPhase	Current boot phase
getErrors()	string[]	All boot errors
getWarnings()	string[]	All boot warnings
getPayloads()	object	Raw JSON payloads (for debugging)
View more
AI Export
Table



Method


Returns


Description


formatForAI()	string	Combined AI context from all engines
View more
Quick Boot (Convenience)
typescript





// One-liner boot with defaults
const result = await window._BOOT_SEQUENCE.quickBoot({
  source: 'cloud',
  cloudAdapter: myAdapter
});
10. Flywheel Orchestrator
File: flywheel_orchestrator_generic.ts.md Sections: 10 Pillar: P6_FLYWHEEL Global: window._FLYWHEEL_ORCHESTRATOR

Constructor & Factory
typescript





class FlywheelOrchestrator {
  constructor(engines: EngineRegistry, config?: Partial<OrchestratorConfig>)
}

function createFlywheelOrchestrator(
  engines: EngineRegistry,
  config?: Partial<OrchestratorConfig>
): FlywheelOrchestrator;
OrchestratorConfig:

typescript





interface OrchestratorConfig {
  healthCheckIntervalMs: number;     // default: 300000 (5 min)
  autoBackupThreshold: number;       // default: 10 events
  cascadeDepthLimit: number;         // default: 5
  stageThresholds: StageThresholds[];
  enableProactiveInsights: boolean;  // default: true
  proactiveTimingRule: 'post_commit' | 'on_pause' | 'never';
}
Lifecycle
Table



Method


Returns


Description


start()	void	Start the orchestrator — begin health monitoring loop
stop()	void	Stop the orchestrator — clear timers
factoryReset()	void	Clear all runtime state, keep config
View more
Event Dispatch (Single Entry Point)
Table



Method


Returns


Description


dispatch(category, payload, source?, priority?)	FlywheelEvent	Dispatch an event into the flywheel
on(category: EventCategory, callback)	void	Subscribe to events by category
View more
FlywheelEvent:

typescript





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
Health Monitoring
Table



Method


Returns


Description


runHealthCheck()	Record<PillarId, number>	Recalculate all pillar health scores
isHealthy()	{ healthy: boolean; issues: string[] }	Quick health check with issue list
View more
Stage Management
Table



Method


Returns


Description


getStage()	FlywheelStage	Current flywheel stage
getStageProgress()	StageProgress	Progress toward next stage
View more
StageProgress:

typescript





interface StageProgress {
  current: FlywheelStage;
  next: FlywheelStage | null;
  progress: number;  // 0.0 - 1.0
}
Dashboard API (Unified UI Interface)
Table



Method


Returns


Description


getDashboard()	DashboardState	Complete flywheel dashboard state
getRecommendations()	Recommendation[]	Stage-filtered recommendations from insights
getEventHistory(limit?: number)	FlywheelEvent[]	Recent events (default: 20)
getEventsByCategory(category, limit?)	FlywheelEvent[]	Events filtered by category
getCascadeChains()	CascadeChain[]	Cascade chains for debugging
View more
DashboardState:

typescript





interface DashboardState {
  stage: FlywheelStage;
  stageProgress: StageProgress;
  pillarHealth: Record<PillarId, number>;
  avgHealth: number;
  eventsProcessed: number;
  cascadeCount: number;
  uptimeMs: number;
  lastHealthCheck: string | null;
  sessionCloseReminder: SessionCloseReminder;
}
Scheduler
Table



Method


Returns


Description


checkPMSchedule(pmSchedule: any[])	PMDueItem[]	Check for due preventive maintenance items
getSessionCloseReminder()	SessionCloseReminder	Get session close reminder status
View more
SessionCloseReminder:

typescript





interface SessionCloseReminder {
  shouldRemind: boolean;
  uptimeHours: number;
  pendingBackups: number;
  pmDue: number;
  message: string;
}
Stats & AI Export
Table



Method


Returns


Description


getStats()	OrchestratorStats	Full orchestrator diagnostics
formatForAI()	string	AI context string (stage, health, events)
exportState()	OrchestratorState	Full state for backup
importState(state: Partial<OrchestratorState>)	void	Restore from backup
View more
OrchestratorStats:

typescript





interface OrchestratorStats {
  stage: FlywheelStage;
  eventsProcessed: number;
  cascadeCount: number;
  eventLogSize: number;
  uptimeMinutes: number;
  avgHealth: number;
  healthyPillars: number;    // Pillars >= 50%
  criticalPillars: number;   // Pillars < 20%
}
11. Global Registration
All engines register on window for cross-engine access and debugging.

Window Namespace Map
Table



Global Key


Engine


Key Methods


window._MEMOIR_ENGINE	Memoir Engine	boot(), formatForAI(), getStats()
window._PERSONALITY_ENGINE	Personality Engine	calibrate(), detectEmotion()
window._HELP_ENGINE	Help Engine	search(), quickLookup(), getBootSequence()
window._BACKUP_ENGINE	Backup Engine	runBackup(), restore(), verifyIntegrity()
window._INSIGHTS_ENGINE	Insights Engine	scanMessage(), recordPreference(), getRecommendations()
window._PATTERN_ENGINE	Pattern Engine	bulkIngest(), detectPatterns(), getTrends()
window.__OCELOT_VOCAB_HARVESTER__	Vocab Harvester	scan(), generateMergePatch(), approveCandidate()
window._BOOT_SEQUENCE	Boot Sequence	quickBoot(), createBootSequence()
window._FLYWHEEL_ORCHESTRATOR	Flywheel Orchestrator	dispatch(), getDashboard(), runHealthCheck()
View more
Quick Boot Example
typescript





// 1. Boot with cloud adapter
const result = await window._BOOT_SEQUENCE.quickBoot({
  source: 'cloud',
  cloudAdapter: {
    read: async (key) => await myCloudStorage.get(key),
    write: async (key, data) => await myCloudStorage.put(key, data),
    exists: async (key) => await myCloudStorage.has(key),
  }
});

// 2. Create and start the flywheel orchestrator
const engines = window._BOOT_SEQUENCE.instance.getEngines();
const orchestrator = createFlywheelOrchestrator(engines);
orchestrator.start();

// 3. Dispatch events
orchestrator.dispatch('moment', {
  type: 'lightbulb',
  description: 'Realized the flywheel IS the product',
  significance: 'critical'
});

// 4. Check dashboard
const dashboard = orchestrator.getDashboard();
console.log(dashboard.stage);        // 'MOMENTUM'
console.log(dashboard.avgHealth);    // 0.72

// 5. Graceful shutdown
await window._BOOT_SEQUENCE.instance.shutdown();
12. Type Exports
All engines export their types for TypeScript consumers.

Boot Sequence Exports
typescript





export { BootSequence, createBootSequence };
export type {
  BootConfig, BootResult, BootPhase, BootPhaseLog,
  EngineName, EngineBootStatus, EngineRegistry,
  WiringStatus, WiringConnection, FlywheelSnapshot,
  FlywheelStage, CloudAdapter, ManualPayloads,
};
Flywheel Orchestrator Exports
typescript





export { FlywheelOrchestrator, createFlywheelOrchestrator };
export type {
  FlywheelEvent, FlywheelStage, PillarId,
  EventCategory, OrchestratorConfig, OrchestratorState,
  EngineRegistry, StageThresholds,
};
Vocab Harvester Exports
typescript





export { VocabHarvester, __OCELOT_VOCAB_HARVESTER__ };
export type {
  VocabCandidate, VocabCategory, VocabSource,
  CandidateStatus, DetectionPattern,
  HarvesterState, HarvesterConfig,
};
Insights Engine Exports
typescript





export type {
  Insight, InsightType, InsightSource,
  PreferencePair, FeedbackSignal,
  EmotionalState, ConversationMode,
  Reflection, Recommendation,
  InsightsLedger, InsightsStats,
};
"Every engine has a door. This is the key ring."

— The Ocelot Framework 🐆


**API_REFERENCE.md — DONE!** 🐆📖🔥

## 📋 What We Just Built

| Section | Content |
|---|---|
| **Shared Types** | PillarId, FlywheelStage, EventCategory, ConversationMode, EmotionalState |
| **Memoir Engine** | 16 methods — boot, sessions, moments, preferences, reflections, flywheel |
| **Personality Engine** | 10 methods — calibration, emotion detection, tone adjustment |
| **Help Engine** | 8 methods — search, quick lookup, boot sequence, cross-engine wiring |
| **Backup Engine** | 10 methods — backup, restore, integrity, cloud sync, artifact manifest |
| **Insights Engine** | 14 methods — detection, preferences, reflections, proactive timing |
| **Pattern Engine** | 10 methods — ingestion, detection, trends, predictions |
| **Vocab Harvester** | 22 methods — scanning, approval, merge, cross-engine wiring, queries |
| **Boot Sequence** | 10 methods — boot, shutdown, accessors, AI export |
| **Flywheel Orchestrator** | 16 methods — dispatch, health, stages, dashboard, scheduler |
| **Global Registration** | 9 window namespace entries with key methods |
| **Type Exports** | Complete TypeScript export declarations |

Every method. Every parameter. Every return type. Every interface. **The complete key ring.** 🔑 [139][140][141][142][143][144][147][148][149][150][151][152][153][154]