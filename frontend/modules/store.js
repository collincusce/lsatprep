// Single source of truth for user state. All reads/writes go through this
// module — never call localStorage.setItem elsewhere in the frontend.
//
// State blob is stored under one key. Writes are debounced 200ms so rapid
// bursts (e.g., per-keystroke timer updates) don't thrash localStorage.

const STORAGE_KEY = 'lsatprep:v1:state';
const SCHEMA_VERSION = 1;
const DEBOUNCE_MS = 200;

const DEFAULT_STATE = {
  schemaVersion: SCHEMA_VERSION,
  bankVersion: null,
  preferences: {
    lgEnabled: false,
    theme: 'auto',
    defaultSection: 'LR'
  },
  attempts: [],
  sessions: [],
  writingSamples: [],
  coachThreads: []
};

let state = null;
let saveTimer = null;
const subscribers = new Set();

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function migrate(blob) {
  if (!blob || typeof blob !== 'object') return cloneDefault();
  if (typeof blob.schemaVersion !== 'number') blob.schemaVersion = SCHEMA_VERSION;
  if (blob.schemaVersion > SCHEMA_VERSION) {
    throw new Error(`Stored schemaVersion ${blob.schemaVersion} is newer than this build (${SCHEMA_VERSION}). Refusing to downgrade.`);
  }
  // Fill in any missing fields.
  const merged = { ...cloneDefault(), ...blob };
  merged.preferences = { ...cloneDefault().preferences, ...(blob.preferences || {}) };
  for (const k of ['attempts', 'sessions', 'writingSamples', 'coachThreads']) {
    if (!Array.isArray(merged[k])) merged[k] = [];
  }
  return merged;
}

export function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw == null) {
    state = cloneDefault();
    return state;
  }
  try {
    state = migrate(JSON.parse(raw));
  } catch (err) {
    console.warn('store.load: failed to parse; starting fresh.', err);
    state = cloneDefault();
  }
  return state;
}

export function snapshot() {
  if (state === null) load();
  return state;
}

function notify() {
  for (const fn of subscribers) {
    try { fn(state); } catch (err) { console.error('store subscriber threw', err); }
  }
}

function schedule() {
  notify();
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    flush();
  }, DEBOUNCE_MS);
}

function flush() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function save() { flush(); }

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function unionById(existing, incoming, { overwriteNewer = true } = {}) {
  const map = new Map(existing.map(r => [r.id, r]));
  let added = 0;
  let overwritten = 0;
  for (const rec of incoming) {
    if (!rec || !rec.id) continue;
    if (!map.has(rec.id)) {
      map.set(rec.id, rec);
      added++;
    } else if (overwriteNewer) {
      const prev = map.get(rec.id);
      const prevT = prev.timestamp || '';
      const newT = rec.timestamp || '';
      if (newT > prevT) {
        map.set(rec.id, rec);
        overwritten++;
      }
    }
  }
  return { merged: [...map.values()], added, overwritten };
}

export function recordAttempt(attempt) {
  if (state === null) load();
  state.attempts.push(attempt);
  schedule();
}

export function recordSession(session) {
  if (state === null) load();
  state.sessions.push(session);
  schedule();
}

export function recordWritingSample(sample) {
  if (state === null) load();
  state.writingSamples.push(sample);
  schedule();
}

export function recordCoachThread(thread) {
  if (state === null) load();
  const idx = state.coachThreads.findIndex(t => t.id === thread.id);
  if (idx >= 0) state.coachThreads[idx] = thread;
  else state.coachThreads.push(thread);
  schedule();
}

export function setPreference(key, value) {
  if (state === null) load();
  state.preferences[key] = value;
  schedule();
}

export function mergeImport(incoming, opts = {}) {
  if (state === null) load();
  if (!incoming || typeof incoming !== 'object') {
    throw new Error('mergeImport: invalid payload');
  }
  if (typeof incoming.schemaVersion === 'number' && incoming.schemaVersion > SCHEMA_VERSION) {
    throw new Error(`import has schemaVersion ${incoming.schemaVersion}; this build only supports ${SCHEMA_VERSION}`);
  }
  const normalized = migrate(incoming);
  const knownIds = opts.knownQuestionIds instanceof Set ? opts.knownQuestionIds : null;

  let attemptsDroppedStale = 0;
  let incomingAttempts = normalized.attempts;
  if (knownIds) {
    const before = incomingAttempts.length;
    incomingAttempts = incomingAttempts.filter(a => knownIds.has(a.questionId));
    attemptsDroppedStale = before - incomingAttempts.length;
  }

  const a = unionById(state.attempts, incomingAttempts);
  const s = unionById(state.sessions, normalized.sessions);
  const w = unionById(state.writingSamples, normalized.writingSamples);
  const c = unionById(state.coachThreads, normalized.coachThreads);

  state.attempts = a.merged;
  state.sessions = s.merged;
  state.writingSamples = w.merged;
  state.coachThreads = c.merged;
  state.preferences = { ...state.preferences, ...normalized.preferences };
  if (normalized.bankVersion) state.bankVersion = normalized.bankVersion;
  flush(); // import is a user-initiated action — flush immediately.
  notify();

  return {
    attemptsAdded: a.added,
    attemptsOverwritten: a.overwritten,
    attemptsDroppedStale,
    sessionsAdded: s.added,
    writingSamplesAdded: w.added,
    coachThreadsAdded: c.added
  };
}

export function exportState() {
  if (state === null) load();
  return JSON.parse(JSON.stringify(state));
}

export function clear() {
  state = cloneDefault();
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

export function seenQuestionIds() {
  if (state === null) load();
  return new Set(state.attempts.map(a => a.questionId));
}

// Test-only hook; not part of the public API for the app.
export function __resetForTests() {
  state = null;
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  subscribers.clear();
}
