// Direct burst: fires N batches for specific LG cells in parallel, bypassing
// the planner. Use when the planner is being conservative and you just want to
// close a gap fast.

import { generate } from './generate-batch.mjs';

const TASKS = [
  // (section, slot, difficulty, batchCount, batchIdx)
  ...Array.from({ length: 2 }, (_, i) => ({ section: 'LG', slot: 'grouping', difficulty: 1, count: 1, batchIdx: 100 + i })),
  ...Array.from({ length: 22 }, (_, i) => ({ section: 'LG', slot: 'grouping', difficulty: 2, count: 1, batchIdx: 100 + i })),
  ...Array.from({ length: 12 }, (_, i) => ({ section: 'LG', slot: 'grouping', difficulty: 3, count: 1, batchIdx: 100 + i }))
];

const CONCURRENCY = 30;

async function runBatches(tasks) {
  const inflight = new Set();
  let idx = 0;
  let ok = 0, fail = 0;

  async function startNext() {
    if (idx >= tasks.length) return;
    const t = tasks[idx++];
    const p = (async () => {
      try {
        const r = await generate(t);
        ok += 1;
        console.log(`  ok  ${t.slot} d${t.difficulty} b${t.batchIdx} -> ${r.count} game(s)`);
      } catch (err) {
        fail += 1;
        console.log(`  FAIL ${t.slot} d${t.difficulty} b${t.batchIdx}: ${err.message.slice(0, 120)}`);
      }
    })();
    inflight.add(p);
    p.finally(() => inflight.delete(p));
  }

  while (inflight.size < CONCURRENCY && idx < tasks.length) startNext();
  while (inflight.size > 0) {
    await Promise.race(inflight);
    while (inflight.size < CONCURRENCY && idx < tasks.length) startNext();
  }
  return { ok, fail, total: tasks.length };
}

console.log(`Firing ${TASKS.length} LG batches at concurrency ${CONCURRENCY}...`);
const start = Date.now();
const res = await runBatches(TASKS);
const elapsed = Math.round((Date.now() - start) / 1000);
console.log(`\nDone in ${elapsed}s: ok=${res.ok} fail=${res.fail} total=${res.total}`);
