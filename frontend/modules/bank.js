// Question-bank loader. Fetches `questions.json` once and returns indexed
// views. Subsequent calls are memoized; re-fetching only happens after
// __resetForTests() in tests.

let cache = null;
let pending = null;

function indexBank(raw) {
  const byId = new Map();
  const passages = new Map();
  const games = new Map();
  const bySection = { LR: [], RC: [], LG: [] };
  const byDifficulty = { LR: {}, RC: {}, LG: {} };
  const byLRSubtype = {};
  const byRCGenre = {};
  const byLGFamily = {};
  const allQuestions = [];

  for (const q of raw.lr || []) {
    byId.set(q.id, q);
    bySection.LR.push(q);
    allQuestions.push(q);
    (byDifficulty.LR[q.difficulty] ||= []).push(q);
    (byLRSubtype[q.subtype] ||= []).push(q);
  }
  for (const p of raw.rc || []) {
    passages.set(p.id, p);
    (byRCGenre[p.genre] ||= []).push(p);
    for (const q of p.questions || []) {
      byId.set(q.id, q);
      bySection.RC.push(q);
      allQuestions.push(q);
      (byDifficulty.RC[q.difficulty] ||= []).push(q);
    }
  }
  for (const g of raw.lg || []) {
    games.set(g.id, g);
    (byLGFamily[g.family] ||= []).push(g);
    for (const q of g.questions || []) {
      byId.set(q.id, q);
      bySection.LG.push(q);
      allQuestions.push(q);
      (byDifficulty.LG[q.difficulty] ||= []).push(q);
    }
  }

  return {
    raw,
    bankVersion: raw.bankVersion,
    byId,
    passages,
    games,
    bySection,
    byDifficulty,
    byLRSubtype,
    byRCGenre,
    byLGFamily,
    allQuestions
  };
}

export async function loadBank(url = './questions.json') {
  if (cache) return cache;
  if (pending) return pending;
  pending = (async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch question bank: ${res.status}`);
    const raw = await res.json();
    cache = indexBank(raw);
    return cache;
  })();
  try {
    return await pending;
  } finally {
    pending = null;
  }
}

export function bankSnapshot() {
  return cache;
}

export function __resetForTests() {
  cache = null;
  pending = null;
}
