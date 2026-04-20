// Final gap-closer burst. Reads /tmp/burst-plan.json, fires all tasks at 30-way
// concurrency, reports ok/fail.

import { generate } from './generate-batch.mjs';
import { readFileSync } from 'node:fs';

const TASKS = JSON.parse(readFileSync('/tmp/burst-plan.json', 'utf8'));
const CONCURRENCY = 30;

async function run(tasks) {
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
        console.log(`  ok  ${t.section} ${t.slot} d${t.difficulty} b${t.batchIdx}`);
      } catch (err) {
        fail += 1;
        console.log(`  FAIL ${t.section} ${t.slot} d${t.difficulty} b${t.batchIdx}: ${err.message.slice(0, 100)}`);
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

console.log(`Firing ${TASKS.length} batches at concurrency ${CONCURRENCY}...`);
const start = Date.now();
const res = await run(TASKS);
console.log(`Done in ${Math.round((Date.now() - start) / 1000)}s: ok=${res.ok} fail=${res.fail}`);
