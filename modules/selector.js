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

// Approximates a real LSAT section's difficulty distribution:
// ~30% 1★ easy, ~45% 2★ medium, ~25% 3★ hard. Buckets are interleaved
// (round-robin by index) so the section doesn't front-load the easy ones.
// Use this for any "simulate a real section" flow: full-length test,
// timed section, and drill when the user hasn't pinned a difficulty.
export function pickQuestionsWithDifficultyMix({ bank, filters = {}, count = 10, seenIds = new Set(), rng = Math.random }) {
  // If caller already pinned a difficulty range, honor that and don't override.
  if (filters.difficultyMin || filters.difficultyMax) {
    return pickQuestions({ bank, filters, count, seenIds, rng });
  }

  const easyCount = Math.round(count * 0.30);
  const hardCount = Math.round(count * 0.25);
  const mediumCount = count - easyCount - hardCount;

  const easy = pickQuestions({
    bank, filters: { ...filters, difficultyMin: 1, difficultyMax: 1 },
    count: easyCount, seenIds, rng
  });
  const medium = pickQuestions({
    bank, filters: { ...filters, difficultyMin: 2, difficultyMax: 2 },
    count: mediumCount, seenIds, rng
  });
  const hard = pickQuestions({
    bank, filters: { ...filters, difficultyMin: 3, difficultyMax: 3 },
    count: hardCount, seenIds, rng
  });

  // Real LSAT sections aren't flat-random: the first 2-3 questions tend to be
  // warm-ups (easy-leaning), the middle third clusters the hardest questions,
  // and the tail eases off to medium to reward time management. Approximate
  // that arc by placing each bucket's questions into position ranges.
  const eQ = [...easy], mQ = [...medium], hQ = [...hard];
  const total = eQ.length + mQ.length + hQ.length;
  const merged = [];
  for (let pos = 0; pos < total; pos++) {
    const frac = pos / total;
    let preferOrder;
    if (frac < 0.15)       preferOrder = [eQ, mQ, hQ];   // warm-up: easy first
    else if (frac < 0.45)  preferOrder = [mQ, eQ, hQ];   // early body: medium
    else if (frac < 0.75)  preferOrder = [hQ, mQ, eQ];   // hard cluster
    else                    preferOrder = [mQ, eQ, hQ];   // ease-off: medium
    // Find the first non-empty bucket in preference order.
    const bucket = preferOrder.find(b => b.length > 0);
    merged.push(bucket.shift());
  }
  // If a bucket is short (thin cell coverage), backfill from the full pool.
  if (merged.length < count) {
    const already = new Set(merged.map(q => q.id));
    const backfillSeen = new Set([...seenIds, ...already]);
    const extra = pickQuestions({
      bank, filters, count: count - merged.length,
      seenIds: backfillSeen, rng
    });
    merged.push(...extra);
  }
  return merged.slice(0, count);
}
