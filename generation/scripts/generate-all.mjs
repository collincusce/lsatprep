// Orchestrator: enumerates remaining cells per coverage-matrix, fires
// generate-batch.mjs in parallel (6-way concurrency), writes progress log,
// retries failures once.
//
// Usage:
//   node generate-all.mjs                    # backfill to full matrix targets
//   node generate-all.mjs --topup 20         # bring every cell up to at least 20 Qs

import { generate } from './generate-batch.mjs';
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/home/ccusce/lsatprep';
const RAW = join(ROOT, 'generation/raw');
const DRAFT = join(ROOT, 'generation/raw-draft');
const LOG = join(ROOT, 'generation/logs');

if (!existsSync(DRAFT)) mkdirSync(DRAFT, { recursive: true });
if (!existsSync(LOG)) mkdirSync(LOG, { recursive: true });

const logFile = join(LOG, `generate-all-${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`);
function logEvent(event) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...event });
  process.stdout.write(line + '\n');
  try { require('node:fs').appendFileSync(logFile, line + '\n'); } catch {}
}

// Batch sizing — small batches to stay under output-TPM ceiling with high concurrency
// AND to reduce Sonnet's malformed-JSON failure mode (correlated with long outputs).
const BATCH = {
  LR: 3,   // ~2.1k output tokens/call — 5× smaller = ~5× more concurrency for same TPM
  RC: 1,   // 1 passage × 7 Q ≈ 4k output tokens
  LG: 1    // 1 game × 5 Q ≈ 3.5k output tokens
};

function countDelivered() {
  // Count from the SHIPPED bank (frontend/questions.json) because it reflects
  // post-cap assembly. raw/ files may contain more than ships; we need to fill
  // cells based on what actually survives assembly.
  const counts = {};
  const bankPath = join(ROOT, 'frontend/questions.json');
  if (existsSync(bankPath)) {
    try {
      const bank = JSON.parse(readFileSync(bankPath, 'utf8'));
      for (const q of bank.lr || []) {
        const k = `LR|${q.subtype}|${q.difficulty}`;
        counts[k] = (counts[k] || 0) + 1;
      }
      for (const p of bank.rc || []) {
        const k = `RC|${p.genre}|${p.difficulty}`;
        counts[k] = (counts[k] || 0) + (p.questions?.length || 0);
      }
      for (const g of bank.lg || []) {
        const k = `LG|${g.family}|${g.difficulty}`;
        counts[k] = (counts[k] || 0) + (g.questions?.length || 0);
      }
    } catch {}
  }
  // Also count in-flight drafts so a rerun doesn't duplicate work
  if (existsSync(DRAFT)) {
    for (const f of readdirSync(DRAFT)) {
      if (!f.endsWith('.json') || f.startsWith('_DEBUG')) continue;
      let arr;
      try { arr = JSON.parse(readFileSync(join(DRAFT, f), 'utf8')); } catch { continue; }
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        const section = item.section;
        const slot = item.subtype || item.genre || item.family;
        const d = item.difficulty;
        if (!section || !slot || !d) continue;
        const key = `${section}|${slot}|${d}`;
        if (section === 'LR') counts[key] = (counts[key] || 0) + 1;
        else counts[key] = (counts[key] || 0) + (item.questions?.length || 0);
      }
    }
  }
  return counts;
}

function existingBatchIndices(section, slot, difficulty) {
  // Look for files matching <section>-<slot>-d<difficulty>-b<N>.json in both raw and raw-draft
  const pattern = new RegExp(`^${section.toLowerCase()}-${slot}-d${difficulty}-b(\\d+)\\.json$`);
  const indices = new Set();
  for (const dir of [RAW, DRAFT]) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      const m = f.match(pattern);
      if (m) indices.add(Number(m[1]));
    }
  }
  return indices;
}

function planTasks(mode, topupTo) {
  const matrix = JSON.parse(readFileSync(join(ROOT, 'generation/coverage-matrix.json'), 'utf8'));
  const delivered = countDelivered();
  const tasks = [];

  for (const cell of matrix.cells) {
    const slot = cell.subtype || cell.genre || cell.family;
    const key = `${cell.section}|${slot}|${cell.difficulty}`;
    const have = delivered[key] || 0;

    let target;
    if (mode === 'topup') target = Math.max(have, topupTo);
    else target = cell.count;

    const need = target - have;
    if (need <= 0) continue;

    // For RC/LG, need is in questions — convert to passages/games
    let unitsNeeded;
    if (cell.section === 'LR') unitsNeeded = need;
    else if (cell.section === 'RC') unitsNeeded = Math.ceil(need / 7);
    else unitsNeeded = Math.ceil(need / 6); // LG avg 6 Qs per game

    // Determine batch index for this cell (pick next available)
    const usedIndices = existingBatchIndices(cell.section, slot, cell.difficulty);
    let nextIdx = 1;
    while (usedIndices.has(nextIdx)) nextIdx += 1;

    const batchSize = BATCH[cell.section];
    let remaining = unitsNeeded;
    while (remaining > 0) {
      const take = Math.min(batchSize, remaining);
      tasks.push({
        section: cell.section,
        slot,
        difficulty: cell.difficulty,
        count: take,
        batchIdx: nextIdx
      });
      usedIndices.add(nextIdx);
      while (usedIndices.has(nextIdx)) nextIdx += 1;
      remaining -= take;
    }
  }

  return tasks;
}

// Concurrency-limited runner. Kicks off up to `limit` tasks in parallel,
// starts a new one whenever any finish.
async function runWithConcurrency(tasks, limit, onDone) {
  const inflight = new Set();
  let idx = 0;
  const results = [];

  async function startNext() {
    if (idx >= tasks.length) return;
    const myIdx = idx++;
    const task = tasks[myIdx];
    const promise = (async () => {
      try {
        const r = await generate(task);
        results.push({ ok: true, task, r });
        onDone?.(task, r, null);
      } catch (err) {
        results.push({ ok: false, task, error: err.message });
        onDone?.(task, null, err);
      }
    })();
    inflight.add(promise);
    promise.finally(() => inflight.delete(promise));
  }

  // Prime
  while (inflight.size < limit && idx < tasks.length) {
    startNext();
  }
  // Drain — whenever any finishes, start another
  while (inflight.size > 0) {
    await Promise.race(inflight);
    while (inflight.size < limit && idx < tasks.length) {
      startNext();
    }
  }
  return results;
}

// Retry pass for failed tasks.
async function retryFailures(failed, limit) {
  if (failed.length === 0) return [];
  logEvent({ event: 'retry_start', count: failed.length });
  const retryResults = await runWithConcurrency(
    failed.map(f => f.task),
    limit,
    (t, r, e) => {
      if (e) logEvent({ event: 'retry_fail', task: t, error: e.message });
      else logEvent({ event: 'retry_ok', task: t, outPath: r.outPath, count: r.count });
    }
  );
  return retryResults;
}

// Totals tracker
let totalInputTokens = 0;
let totalOutputTokens = 0;
let totalCacheReadTokens = 0;
let totalCacheWriteTokens = 0;

async function main() {
  const args = process.argv.slice(2);
  const topupIdx = args.indexOf('--topup');
  const mode = topupIdx >= 0 ? 'topup' : 'fill';
  const topupTo = topupIdx >= 0 ? Number(args[topupIdx + 1]) : null;

  const tasks = planTasks(mode, topupTo);
  logEvent({ event: 'plan', mode, topupTo, taskCount: tasks.length });

  const bySection = tasks.reduce((acc, t) => { acc[t.section] = (acc[t.section] || 0) + 1; return acc; }, {});
  logEvent({ event: 'plan_by_section', bySection });

  if (tasks.length === 0) {
    logEvent({ event: 'nothing_to_do' });
    return;
  }

  const CONCURRENCY = 30;
  const started = Date.now();
  let finished = 0;

  const results = await runWithConcurrency(tasks, CONCURRENCY, (task, r, err) => {
    finished += 1;
    if (err) {
      logEvent({ event: 'batch_fail', task, error: err.message, progress: `${finished}/${tasks.length}` });
    } else {
      totalInputTokens += r.inputTokens || 0;
      totalOutputTokens += r.outputTokens || 0;
      totalCacheReadTokens += r.cacheReadTokens || 0;
      totalCacheWriteTokens += r.cacheWriteTokens || 0;
      logEvent({
        event: 'batch_ok',
        task,
        count: r.count,
        model: r.model,
        usage: { in: r.inputTokens, out: r.outputTokens, cacheRead: r.cacheReadTokens, cacheWrite: r.cacheWriteTokens },
        progress: `${finished}/${tasks.length}`,
        elapsedSec: Math.round((Date.now() - started) / 1000)
      });
    }
  });

  const failed = results.filter(r => !r.ok);
  let finalFailures = failed;
  if (failed.length > 0) {
    const retried = await retryFailures(failed, CONCURRENCY);
    finalFailures = retried.filter(r => !r.ok);
  }

  // Rough cost estimate — Sonnet/Haiku blended rates.
  // Sonnet: $3/M in, $15/M out; Haiku: $1/M in, $5/M out. Cache read: 0.1x of input rate.
  const estCost = (
    (totalInputTokens * 3) + (totalOutputTokens * 15) + (totalCacheReadTokens * 0.3) + (totalCacheWriteTokens * 3.75)
  ) / 1_000_000;

  logEvent({
    event: 'done',
    total: tasks.length,
    succeeded: tasks.length - finalFailures.length,
    finalFailures: finalFailures.length,
    failedTasks: finalFailures.map(f => f.task),
    usage: {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      cacheReadTokens: totalCacheReadTokens,
      cacheWriteTokens: totalCacheWriteTokens
    },
    estCostUSD: Number(estCost.toFixed(2)),
    elapsedSec: Math.round((Date.now() - started) / 1000)
  });
}

main().catch(err => {
  logEvent({ event: 'fatal', error: err.message, stack: err.stack });
  process.exit(1);
});
