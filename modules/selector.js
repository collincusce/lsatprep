// Question picker. Filters → shuffle (seedable) → slice. Prefers unseen
// questions; falls back to seen ones when the unseen pool is exhausted so
// the user is never blocked if they've worked through a small cell.

export function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    // xorshift32.
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return (s >>> 0) / 0x100000000;
  };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function matches(q, filters) {
  if (filters.section && q.section !== filters.section) return false;
  if (filters.lgEnabled === false && q.section === 'LG') return false;
  if (filters.subtypes && filters.subtypes.length > 0) {
    if (q.section === 'LR' && !filters.subtypes.includes(q.subtype)) return false;
  }
  if (filters.genres && filters.genres.length > 0) {
    if (q.section === 'RC' && q.passageId) {
      // Genre lookup via index would be cleaner; caller can pre-filter by passing a subset.
      // Skip here — selector caller supplies passage-filtered pool when needed.
    }
  }
  if (filters.families && filters.families.length > 0) {
    if (q.section === 'LG' && q.gameFamily && !filters.families.includes(q.gameFamily)) return false;
  }
  if (filters.difficultyMin && q.difficulty < filters.difficultyMin) return false;
  if (filters.difficultyMax && q.difficulty > filters.difficultyMax) return false;
  return true;
}

export function pickQuestions({ bank, filters = {}, count = 10, seenIds = new Set(), rng = Math.random }) {
  const pool = bank.allQuestions.filter(q => matches(q, filters));
  const unseen = pool.filter(q => !seenIds.has(q.id));
  const seen = pool.filter(q => seenIds.has(q.id));
  const shuffled = shuffle(unseen, rng).concat(shuffle(seen, rng));
  return shuffled.slice(0, count);
}
