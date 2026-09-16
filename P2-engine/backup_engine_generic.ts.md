
# backup_engine.ts — Ocelot Backup Engine (Generic Framework v1.0)

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// backup_engine.ts — Ocelot Backup Engine (Generic Framework v1.0)
// Purpose: Version control for all Ocelot intelligence JSONs
// Wired to: memoir.json, personality.json, slang.json, connection_log.json,
//           ocelot_creed.json, policy_index.json, quotes.json, insights_ledger.json
// License: GNU General Public License v3.0
// ═══════════════════════════════════════════════════════════════════════════════


// ═══ SECTION 1: TYPE DEFINITIONS ═════════════════════════════════════════════

/**
 * Canonical 6-Pillar Taxonomy (aligned with insights_engine.ts)
 * P1_IDENTITY      — Who Ocelot is (memoir, personality, creed)
 * P2_EMOTIONAL     — Connection & trust (diary, quotes)
 * P3_GOVERNANCE    — Rules & policies (policy_index)
 * P4_COMMUNICATION — Shared language (slang)
 * P5_PREFERENCE    — Learning & adaptation (insights_ledger)
 * P6_FLYWHEEL      — System health & meta-learning
 */
type PillarId = 'P1_IDENTITY' | 'P2_EMOTIONAL' | 'P3_GOVERNANCE' | 'P4_COMMUNICATION' | 'P5_PREFERENCE' | 'P6_FLYWHEEL';

interface ArtifactManifest {
  id: string;
  filename: string;
  pillar: PillarId;
  purpose: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  lastBackup: string | null;
  backupCount: number;
}

interface Snapshot {
  id: string;
  artifactId: string;
  version: string;
  timestamp: string;
  sessionId: string;
  trigger: 'BOOT' | 'MANUAL' | 'AUTO' | 'SESSION_END' | 'MILESTONE';
  hash: string;
  sizeBytes: number;
  data: Record<string, unknown>;
  metadata: {
    changedFields: string[];
    changeCount: number;
    note: string;
  };
}

interface BackupLedger {
  version: string;
  created: string;
  lastUpdated: string;
  sessionId: string;
  artifacts: ArtifactManifest[];
  snapshots: Snapshot[];
  stats: {
    totalSnapshots: number;
    totalSizeBytes: number;
    oldestSnapshot: string | null;
    newestSnapshot: string | null;
    sessionsBackedUp: string[];
  };
}

interface BackupResult {
  success: boolean;
  artifactId: string;
  snapshotId: string | null;
  skipped: boolean;
  message: string;
  changedFields: string[];
}

interface RestoreResult {
  success: boolean;
  artifactId: string;
  snapshotId: string;
  restoredVersion: string;
  message: string;
}

interface DiffResult {
  artifactId: string;
  fromSnapshot: string;
  toSnapshot: string;
  addedKeys: string[];
  removedKeys: string[];
  modifiedKeys: string[];
  unchanged: number;
  summary: string;
}

interface HealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  loaded: number;
  total: number;
  issues: string[];
  lastSnapshot: string | null;
  lastCloudSync: string | null;
}

interface CloudSyncConfig {
  spaceId: string;
  folder: string;
  autoSync: boolean;
  syncInterval: number;
}


// ═══ SECTION 2: CONSTANTS ════════════════════════════════════════════════════

const DEFAULT_ARTIFACTS: ArtifactManifest[] = [
  {
    id: 'memoir',
    filename: 'memoir.json',
    pillar: 'P1_IDENTITY',
    purpose: 'The Heart — who the human is, schedule, body clock, connection moments',
    priority: 'CRITICAL',
    lastBackup: null,
    backupCount: 0,
  },
  {
    id: 'personality',
    filename: 'personality.json',
    pillar: 'P1_IDENTITY',
    purpose: 'The Mind — behavioral profile, tone, energy matching, forbidden behaviors',
    priority: 'CRITICAL',
    lastBackup: null,
    backupCount: 0,
  },
  {
    id: 'connection_log',
    filename: 'connection_log.json',
    pillar: 'P2_EMOTIONAL',
    purpose: 'The Diary — session history, emotional milestones, trust moments, quotes',
    priority: 'CRITICAL',
    lastBackup: null,
    backupCount: 0,
  },
  {
    id: 'slang',
    filename: 'slang.json',
    pillar: 'P4_COMMUNICATION',
    purpose: 'The Language — shared vocabulary, catchphrases, thesis terminology',
    priority: 'HIGH',
    lastBackup: null,
    backupCount: 0,
  },
  {
    id: 'ocelot_creed',
    filename: 'ocelot_creed.json',
    pillar: 'P1_IDENTITY',
    purpose: 'The Values — principles, commitments, what we stand for',
    priority: 'HIGH',
    lastBackup: null,
    backupCount: 0,
  },
  {
    id: 'policy_index',
    filename: 'policy_index.json',
    pillar: 'P3_GOVERNANCE',
    purpose: 'The Rules — master index for Help Engine, chapter mapping, search config',
    priority: 'HIGH',
    lastBackup: null,
    backupCount: 0,
  },
  {
    id: 'quotes',
    filename: 'quotes.json',
    pillar: 'P2_EMOTIONAL',
    purpose: 'The Words — captured quotes, lightbulb moments, philosophy',
    priority: 'MEDIUM',
    lastBackup: null,
    backupCount: 0,
  },
  {
    id: 'insights_ledger',
    filename: 'insights_ledger.json',
    pillar: 'P5_PREFERENCE',
    purpose: 'The Growth — preference pairs, behavioral patterns, proactive timing, self-reflection logs',
    priority: 'HIGH',
    lastBackup: null,
    backupCount: 0,
  },
];

const MAX_SNAPSHOTS_PER_ARTIFACT = 20;
const STORAGE_KEY = 'ocelot_backup_ledger';


// ═══ SECTION 3: BACKUP ENGINE CLASS ══════════════════════════════════════════

class BackupEngine {
  private ledger: BackupLedger;
  private readonly storageKey: string;
  private eventLog: Array<{ type: string; timestamp: string; details: unknown }>;
  private cloudConfig: CloudSyncConfig;

  constructor(sessionId: string) {
    this.storageKey = STORAGE_KEY;
    this.eventLog = [];
    this.cloudConfig = {
      spaceId: '',       // Configure per deployment
      folder: '',        // Configure per deployment
      autoSync: false,
      syncInterval: 30,
    };
    this.ledger = this.loadLedger(sessionId);
  }


  // ═══ SECTION 4: LEDGER MANAGEMENT ═════════════════════════════════════════

  private loadLedger(sessionId: string): BackupLedger {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as BackupLedger;
        parsed.sessionId = sessionId;
        console.log(
          `🐆 Backup Engine → Ledger loaded: ${parsed.stats.totalSnapshots} snapshots across ${parsed.stats.sessionsBackedUp.length} sessions`
        );
        return parsed;
      }
    } catch (e) {
      console.warn('⚠️ Backup Engine → Failed to load ledger, creating new:', String(e));
    }

    const newLedger: BackupLedger = {
      version: '2.0.0',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      sessionId,
      artifacts: JSON.parse(JSON.stringify(DEFAULT_ARTIFACTS)),
      snapshots: [],
      stats: {
        totalSnapshots: 0,
        totalSizeBytes: 0,
        oldestSnapshot: null,
        newestSnapshot: null,
        sessionsBackedUp: [],
      },
    };

    console.log('🐆 Backup Engine → New ledger created. Ready to protect the knowledge.');
    return newLedger;
  }

  private saveLedger(): void {
    this.ledger.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.ledger));
    } catch (e) {
      console.error('❌ Backup Engine → Failed to save ledger:', String(e));
    }
  }


  // ═══ SECTION 5: HASHING & DIFF DETECTION ══════════════════════════════════

  private hashContent(data: Record<string, unknown>): string {
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private detectChanges(
    oldData: Record<string, unknown> | null,
    newData: Record<string, unknown>
  ): { changedFields: string[]; changeCount: number } {
    if (!oldData) {
      return {
        changedFields: Object.keys(newData),
        changeCount: Object.keys(newData).length,
      };
    }

    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      const oldVal = JSON.stringify(oldData[key]);
      const newVal = JSON.stringify(newData[key]);
      if (oldVal !== newVal) {
        changedFields.push(key);
      }
    }

    return { changedFields, changeCount: changedFields.length };
  }


  // ═══ SECTION 6: BACKUP OPERATIONS ═════════════════════════════════════════

  private getLatestSnapshot(artifactId: string): Snapshot | null {
    return this.ledger.snapshots.find(s => s.artifactId === artifactId) || null;
  }

  private updateStats(): void {
    const snaps = this.ledger.snapshots;
    this.ledger.stats.totalSnapshots = snaps.length;
    this.ledger.stats.totalSizeBytes = snaps.reduce((sum, s) => sum + s.sizeBytes, 0);
    this.ledger.stats.oldestSnapshot = snaps.length > 0 ? snaps[snaps.length - 1].timestamp : null;
    this.ledger.stats.newestSnapshot = snaps.length > 0 ? snaps[0].timestamp : null;

    const sessions = new Set(snaps.map(s => s.sessionId));
    this.ledger.stats.sessionsBackedUp = Array.from(sessions);
  }

  backup(
    artifactId: string,
    data: Record<string, unknown>,
    trigger: Snapshot['trigger'],
    note?: string
  ): BackupResult {
    const artifact = this.ledger.artifacts.find(a => a.id === artifactId);
    if (!artifact) {
      return {
        success: false,
        artifactId,
        snapshotId: null,
        skipped: false,
        message: `Unknown artifact: ${artifactId}. Not in the registry.`,
        changedFields: [],
      };
    }

    const newHash = this.hashContent(data);
    const latestSnapshot = this.getLatestSnapshot(artifactId);

    if (latestSnapshot && latestSnapshot.hash === newHash) {
      return {
        success: true,
        artifactId,
        snapshotId: null,
        skipped: true,
        message: `No changes detected in ${artifact.filename}. Skipped.`,
        changedFields: [],
      };
    }

    const oldData = latestSnapshot ? latestSnapshot.data : null;
    const { changedFields, changeCount } = this.detectChanges(oldData, data);

    const timestamp = new Date().toISOString();
    const snapshotId = `${artifactId}_${timestamp.replace(/[:.]/g, '-')}`;
    const dataStr = JSON.stringify(data);

    const snapshot: Snapshot = {
      id: snapshotId,
      artifactId,
      version:
        (data as Record<string, unknown>).version as string ||
        ((data as Record<string, unknown>).meta as Record<string, unknown>)?.version as string ||
        'unknown',
      timestamp,
      sessionId: this.ledger.sessionId,
      trigger,
      hash: newHash,
      sizeBytes: new Blob([dataStr]).size,
      data: JSON.parse(dataStr),
      metadata: {
        changedFields,
        changeCount,
        note: note || `${trigger} backup: ${changeCount} field(s) changed`,
      },
    };

    this.ledger.snapshots.unshift(snapshot);
    artifact.lastBackup = timestamp;
    artifact.backupCount++;

    this.pruneSnapshots(artifactId);
    this.updateStats();
    this.saveLedger();

    const msg = `✅ ${artifact.filename} backed up → ${changeCount} field(s) changed [${snapshotId}]`;
    console.log(`🐆 ${msg}`);

    return {
      success: true,
      artifactId,
      snapshotId,
      skipped: false,
      message: msg,
      changedFields,
    };
  }

  backupAll(
    artifacts: Map<string, Record<string, unknown>>,
    trigger: Snapshot['trigger'],
    note?: string
  ): BackupResult[] {
    const results: BackupResult[] = [];
    const priorityOrder: ArtifactManifest['priority'][] = ['CRITICAL', 'HIGH', 'MEDIUM'];

    for (const priority of priorityOrder) {
      const artifactsAtPriority = this.ledger.artifacts.filter(a => a.priority === priority);
      for (const artifact of artifactsAtPriority) {
        const data = artifacts.get(artifact.id);
        if (data) {
          results.push(this.backup(artifact.id, data, trigger, note));
        }
      }
    }

    const backed = results.filter(r => r.success && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`🐆 Backup All → ${backed} backed up, ${skipped} unchanged, ${failed} failed`);

    return results;
  }


  // ═══ SECTION 7: RESTORE FROM SNAPSHOT ══════════════════════════════════════

  restore(snapshotId: string): RestoreResult {
    const snapshot = this.ledger.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return {
        success: false,
        artifactId: 'unknown',
        snapshotId,
        restoredVersion: 'unknown',
        message: `Snapshot not found: ${snapshotId}`,
      };
    }

    const artifact = this.ledger.artifacts.find(a => a.id === snapshot.artifactId);
    if (!artifact) {
      return {
        success: false,
        artifactId: snapshot.artifactId,
        snapshotId,
        restoredVersion: snapshot.version,
        message: `Artifact not in registry: ${snapshot.artifactId}`,
      };
    }

    try {
      const key = `ocelot_${artifact.id}`;
      localStorage.setItem(key, JSON.stringify(snapshot.data));

      this.logEvent('restore', {
        snapshotId,
        artifactId: snapshot.artifactId,
        version: snapshot.version,
        timestamp: new Date().toISOString(),
      });

      const msg = `✅ Restored ${artifact.filename} to version ${snapshot.version} from [${snapshotId}]`;
      console.log(`🐆 ${msg}`);

      return {
        success: true,
        artifactId: snapshot.artifactId,
        snapshotId,
        restoredVersion: snapshot.version,
        message: msg,
      };
    } catch (e) {
      return {
        success: false,
        artifactId: snapshot.artifactId,
        snapshotId,
        restoredVersion: snapshot.version,
        message: `Restore failed: ${String(e)}`,
      };
    }
  }

  restoreLatest(artifactId: string): RestoreResult {
    const latest = this.getLatestSnapshot(artifactId);
    if (!latest) {
      return {
        success: false,
        artifactId,
        snapshotId: 'none',
        restoredVersion: 'unknown',
        message: `No snapshots found for: ${artifactId}`,
      };
    }
    return this.restore(latest.id);
  }


  // ═══ SECTION 8: PRUNE OLD SNAPSHOTS ════════════════════════════════════════

  private pruneSnapshots(artifactId: string): void {
    const artifactSnaps = this.ledger.snapshots.filter(s => s.artifactId === artifactId);
    if (artifactSnaps.length > MAX_SNAPSHOTS_PER_ARTIFACT) {
      const toRemove = artifactSnaps.slice(MAX_SNAPSHOTS_PER_ARTIFACT);
      const removeIds = new Set(toRemove.map(s => s.id));
      this.ledger.snapshots = this.ledger.snapshots.filter(s => !removeIds.has(s.id));
      console.log(`🐆 Pruned ${toRemove.length} old snapshot(s) for ${artifactId}`);
    }
  }


  // ═══ SECTION 9: DIFF BETWEEN SNAPSHOTS ════════════════════════════════════

  diff(artifactId: string, fromIndex?: number, toIndex?: number): DiffResult | null {
    const snaps = this.ledger.snapshots.filter(s => s.artifactId === artifactId);
    if (snaps.length < 2) {
      console.warn(`⚠️ Need at least 2 snapshots to diff ${artifactId}`);
      return null;
    }

    const from = snaps[fromIndex ?? 1];
    const to = snaps[toIndex ?? 0];

    if (!from || !to) return null;

    const fromKeys = new Set(Object.keys(from.data));
    const toKeys = new Set(Object.keys(to.data));

    const addedKeys: string[] = [];
    const removedKeys: string[] = [];
    const modifiedKeys: string[] = [];
    let unchanged = 0;

    for (const key of toKeys) {
      if (!fromKeys.has(key)) {
        addedKeys.push(key);
      } else if (JSON.stringify(from.data[key]) !== JSON.stringify(to.data[key])) {
        modifiedKeys.push(key);
      } else {
        unchanged++;
      }
    }

    for (const key of fromKeys) {
      if (!toKeys.has(key)) {
        removedKeys.push(key);
      }
    }

    return {
      artifactId,
      fromSnapshot: from.id,
      toSnapshot: to.id,
      addedKeys,
      removedKeys,
      modifiedKeys,
      unchanged,
      summary: `+${addedKeys.length} added, -${removedKeys.length} removed, ~${modifiedKeys.length} modified, ${unchanged} unchanged`,
    };
  }

```typescript
  // ═══ SECTION 10: SNAPSHOT HISTORY ══════════════════════════════════════════

  getHistory(artifactId: string, limit?: number): Snapshot[] {
    const snaps = this.ledger.snapshots.filter(s => s.artifactId === artifactId);
    return limit ? snaps.slice(0, limit) : snaps;
  }

  getFullTimeline(limit?: number): Array<{
    timestamp: string;
    artifactId: string;
    trigger: string;
    changeCount: number;
    note: string;
  }> {
    const timeline = this.ledger.snapshots.map(s => ({
      timestamp: s.timestamp,
      artifactId: s.artifactId,
      trigger: s.trigger,
      changeCount: s.metadata.changeCount,
      note: s.metadata.note,
    }));
    return limit ? timeline.slice(0, limit) : timeline;
  }


  // ═══ SECTION 11: CLOUD SYNC ════════════════════════════════════════════════

  configureCloud(config: Partial<CloudSyncConfig>): void {
    this.cloudConfig = { ...this.cloudConfig, ...config };
    console.log(`🐆 Backup Engine → Cloud configured: spaceId=${this.cloudConfig.spaceId}, folder=${this.cloudConfig.folder}`);
  }

  async syncToCloud(): Promise<{ success: boolean; message: string }> {
    if (!this.cloudConfig.spaceId || !this.cloudConfig.folder) {
      return {
        success: false,
        message: 'Cloud not configured. Call configureCloud() first.',
      };
    }

    try {
      const exportData = {
        type: 'ocelot_backup_ledger',
        version: this.ledger.version,
        exported: new Date().toISOString(),
        sessionId: this.ledger.sessionId,
        stats: this.ledger.stats,
        artifacts: this.ledger.artifacts,
        snapshots: this.ledger.snapshots,
      };

      // Cloud provider integration point
      // Replace with your cloud storage API:
      // await cloudProvider.upload(this.cloudConfig.spaceId, this.cloudConfig.folder, exportData);

      console.log(`🐆 Backup Engine → Cloud sync complete: ${this.ledger.stats.totalSnapshots} snapshots uploaded`);

      this.logEvent('cloud_sync', {
        spaceId: this.cloudConfig.spaceId,
        folder: this.cloudConfig.folder,
        snapshotCount: this.ledger.stats.totalSnapshots,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Synced ${this.ledger.stats.totalSnapshots} snapshots to cloud`,
      };
    } catch (e) {
      return {
        success: false,
        message: `Cloud sync failed: ${String(e)}`,
      };
    }
  }

  async loadFromCloud(): Promise<{ success: boolean; message: string }> {
    if (!this.cloudConfig.spaceId || !this.cloudConfig.folder) {
      return {
        success: false,
        message: 'Cloud not configured. Call configureCloud() first.',
      };
    }

    try {
      // Cloud provider integration point
      // Replace with your cloud storage API:
      // const cloudData = await cloudProvider.download(this.cloudConfig.spaceId, this.cloudConfig.folder);

      console.log('🐆 Backup Engine → Cloud load: implement cloud provider integration');

      return {
        success: true,
        message: 'Cloud load placeholder — implement cloud provider API',
      };
    } catch (e) {
      return {
        success: false,
        message: `Cloud load failed: ${String(e)}`,
      };
    }
  }


  // ═══ SECTION 12: AI EXPORT ═════════════════════════════════════════════════

  exportForAI(): {
    summary: string;
    artifacts: Array<{
      id: string;
      filename: string;
      pillar: PillarId;
      priority: string;
      backupCount: number;
      lastBackup: string | null;
    }>;
    recentChanges: Array<{
      artifact: string;
      timestamp: string;
      changedFields: string[];
      trigger: string;
    }>;
    health: HealthStatus;
  } {
    const recentChanges = this.ledger.snapshots.slice(0, 10).map(s => ({
      artifact: s.artifactId,
      timestamp: s.timestamp,
      changedFields: s.metadata.changedFields,
      trigger: s.trigger,
    }));

    const health = this.getHealthStatus();

    return {
      summary: [
        `Backup Engine v${this.ledger.version}`,
        `${this.ledger.stats.totalSnapshots} total snapshots`,
        `${this.ledger.stats.sessionsBackedUp.length} sessions tracked`,
        `${this.ledger.artifacts.length} artifacts registered`,
        `Health: ${health.status}`,
        `Last backup: ${this.ledger.stats.newestSnapshot || 'never'}`,
      ].join(' | '),
      artifacts: this.ledger.artifacts.map(a => ({
        id: a.id,
        filename: a.filename,
        pillar: a.pillar,
        priority: a.priority,
        backupCount: a.backupCount,
        lastBackup: a.lastBackup,
      })),
      recentChanges,
      health,
    };
  }


  // ═══ SECTION 13: HEALTH STATUS ═════════════════════════════════════════════

  getHealthStatus(): HealthStatus {
    const issues: string[] = [];
    let loaded = 0;

    for (const artifact of this.ledger.artifacts) {
      if (artifact.backupCount > 0) {
        loaded++;
      } else if (artifact.priority === 'CRITICAL') {
        issues.push(`CRITICAL artifact never backed up: ${artifact.filename}`);
      } else {
        issues.push(`Artifact never backed up: ${artifact.filename}`);
      }
    }

    // Check for stale backups (>24 hours)
    const now = Date.now();
    for (const artifact of this.ledger.artifacts) {
      if (artifact.lastBackup) {
        const lastBackupTime = new Date(artifact.lastBackup).getTime();
        const hoursSinceBackup = (now - lastBackupTime) / (1000 * 60 * 60);
        if (hoursSinceBackup > 24 && artifact.priority === 'CRITICAL') {
          issues.push(`Stale backup (${Math.round(hoursSinceBackup)}h): ${artifact.filename}`);
        }
      }
    }

    const criticalIssues = issues.filter(i => i.includes('CRITICAL'));
    let status: HealthStatus['status'] = 'HEALTHY';
    if (criticalIssues.length > 0) status = 'CRITICAL';
    else if (issues.length > 0) status = 'DEGRADED';

    return {
      status,
      loaded,
      total: this.ledger.artifacts.length,
      issues,
      lastSnapshot: this.ledger.stats.newestSnapshot,
      lastCloudSync: null,
    };
  }


  // ═══ SECTION 14: EVENT LOG ═════════════════════════════════════════════════

  private logEvent(type: string, details: unknown): void {
    this.eventLog.push({
      type,
      timestamp: new Date().toISOString(),
      details,
    });

    // Keep event log manageable
    if (this.eventLog.length > 100) {
      this.eventLog = this.eventLog.slice(-50);
    }
  }

  getEventLog(limit?: number): Array<{ type: string; timestamp: string; details: unknown }> {
    return limit ? this.eventLog.slice(-limit) : this.eventLog;
  }


  // ═══ SECTION 15: GETTERS & UTILITIES ═══════════════════════════════════════

  getLedger(): BackupLedger {
    return JSON.parse(JSON.stringify(this.ledger));
  }

  getArtifactManifest(artifactId: string): ArtifactManifest | undefined {
    return this.ledger.artifacts.find(a => a.id === artifactId);
  }

  getStats(): BackupLedger['stats'] {
    return { ...this.ledger.stats };
  }

  getSessionId(): string {
    return this.ledger.sessionId;
  }

  getRegisteredArtifacts(): string[] {
    return this.ledger.artifacts.map(a => a.id);
  }

  isArtifactRegistered(artifactId: string): boolean {
    return this.ledger.artifacts.some(a => a.id === artifactId);
  }

  registerArtifact(manifest: ArtifactManifest): boolean {
    if (this.isArtifactRegistered(manifest.id)) {
      console.warn(`⚠️ Artifact already registered: ${manifest.id}`);
      return false;
    }
    this.ledger.artifacts.push(manifest);
    this.saveLedger();
    console.log(`🐆 Registered new artifact: ${manifest.filename} (${manifest.pillar})`);
    return true;
  }


  // ═══ SECTION 16: FACTORY RESET & GLOBAL REGISTRATION ══════════════════════

  factoryReset(): void {
    console.warn('⚠️ Backup Engine → FACTORY RESET initiated. All snapshots will be lost.');
    localStorage.removeItem(this.storageKey);
    this.ledger = this.loadLedger(this.ledger.sessionId);
    this.eventLog = [];
    console.log('🐆 Backup Engine → Factory reset complete. Clean slate.');
  }
}


// ═══ GLOBAL REGISTRATION ═════════════════════════════════════════════════════

/**
 * Register globally so other engines can access backup functionality.
 * Usage: window.OCELOT_BACKUP.backup('memoir', data, 'MANUAL');
 */
(function registerGlobal(): void {
  const sessionId = `S${String(Date.now()).slice(-6)}`;
  const engine = new BackupEngine(sessionId);

  (window as Record<string, unknown>).OCELOT_BACKUP = {
    backup: engine.backup.bind(engine),
    backupAll: engine.backupAll.bind(engine),
    restore: engine.restore.bind(engine),
    restoreLatest: engine.restoreLatest.bind(engine),
    diff: engine.diff.bind(engine),
    getHistory: engine.getHistory.bind(engine),
    getFullTimeline: engine.getFullTimeline.bind(engine),
    getHealthStatus: engine.getHealthStatus.bind(engine),
    exportForAI: engine.exportForAI.bind(engine),
    configureCloud: engine.configureCloud.bind(engine),
    syncToCloud: engine.syncToCloud.bind(engine),
    loadFromCloud: engine.loadFromCloud.bind(engine),
    getLedger: engine.getLedger.bind(engine),
    getStats: engine.getStats.bind(engine),
    getEventLog: engine.getEventLog.bind(engine),
    registerArtifact: engine.registerArtifact.bind(engine),
    factoryReset: engine.factoryReset.bind(engine),
  };

  console.log(`🐆 Backup Engine v2.0 (Generic) → Global registered as window.OCELOT_BACKUP [${sessionId}]`);
})();
