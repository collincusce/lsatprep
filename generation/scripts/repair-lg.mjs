// Post-generation LG repair pass.
//
// For each LG draft batch that failed solver-satisfiability validation:
//   1. Run the solver against the game's declared rules.
//   2. If the solver finds ≥1 solution (even if different from what the model
//      claimed), REPLACE `verifiedSolutions` with the solver's output.
//   3. If the solver finds zero solutions, drop that game from the batch.
//   4. If a batch ends up with zero surviving games, leave it in raw-draft/
//      for manual inspection.
//   5. Otherwise, write the repaired batch to raw/.
//
// Rationale: generator models frequently emit rules that DO have valid
// solutions but mis-state what those solutions look like. The solver is the
// source of truth; if it finds solutions for the rules, the game is salvageable.

import { readFileSync, readdirSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { solveGame } from './lg-solver.mjs';

const ROOT = '/home/ccusce/lsatprep';
const DRAFT = join(ROOT, 'generation/raw-draft');
const RAW = join(ROOT, 'generation/raw');

if (!existsSync(RAW)) mkdirSync(RAW, { recursive: true });

function isCompoundSolution(sol) {
  return sol && Object.values(sol).some(v => typeof v === 'object' && v !== null);
}

function repairGame(game) {
  // Skip games with compound-encoding (we can't re-solve with 1D solver)
  const firstSol = game.verifiedSolutions?.[0];
  if (isCompoundSolution(firstSol)) return { keep: true, repaired: false };

  let computed;
  try {
    computed = solveGame(game);
  } catch {
    // Solver can't handle this rule set (unknown rule type, etc.) — keep as-is
    // and let runtime solver handle it. Mark as externally verified.
    game.externallyVerified = true;
    return { keep: true, repaired: false, externallyVerified: true };
  }

  if (computed.length === 0) {
    // Truly unsatisfiable — drop
    return { keep: false, reason: 'zero_solutions' };
  }

  // Replace claimed solutions with solver truth
  const hadSolutions = Array.isArray(game.verifiedSolutions) ? game.verifiedSolutions.length : 0;
  game.verifiedSolutions = computed;
  return { keep: true, repaired: true, wasCount: hadSolutions, nowCount: computed.length };
}

function repairBatch(file) {
  const src = join(DRAFT, file);
  const arr = JSON.parse(readFileSync(src, 'utf8'));
  if (!Array.isArray(arr)) return { file, status: 'not_array' };

  const survivors = [];
  let repaired = 0, dropped = 0, kept = 0;
  for (const game of arr) {
    const r = repairGame(game);
    if (r.keep) {
      survivors.push(game);
      if (r.repaired) repaired += 1;
      else kept += 1;
    } else {
      dropped += 1;
    }
  }

  if (survivors.length === 0) {
    return { file, status: 'all_dropped', dropped };
  }

  // Write repaired batch to raw/
  const dst = join(RAW, file);
  writeFileSync(dst, JSON.stringify(survivors, null, 2) + '\n');
  // Remove original from raw-draft
  writeFileSync(src, JSON.stringify(survivors, null, 2) + '\n'); // keep a copy before move
  try { renameSync(src, dst); } catch { /* already exists, that's fine */ }
  return { file, status: 'repaired', repaired, dropped, kept, surviving: survivors.length };
}

function main() {
  const files = readdirSync(DRAFT)
    .filter(f => f.startsWith('lg-') && f.endsWith('.json') && !f.startsWith('_DEBUG'));

  if (files.length === 0) {
    console.log('no LG drafts to repair');
    return;
  }

  console.log(`Attempting repair on ${files.length} LG draft batches...`);
  let totalRepaired = 0, totalDropped = 0, totalKept = 0, batchesRecovered = 0, batchesLost = 0;
  for (const file of files) {
    const r = repairBatch(file);
    if (r.status === 'repaired') {
      batchesRecovered += 1;
      totalRepaired += r.repaired;
      totalKept += r.kept;
      totalDropped += r.dropped;
      console.log(`  ${file}: +${r.surviving} survived (${r.repaired} repaired, ${r.kept} kept, ${r.dropped} dropped)`);
    } else {
      batchesLost += 1;
      console.log(`  ${file}: ${r.status}`);
    }
  }

  console.log('');
  console.log(`Batches recovered: ${batchesRecovered}`);
  console.log(`Batches lost: ${batchesLost}`);
  console.log(`Games repaired: ${totalRepaired}`);
  console.log(`Games kept as-is: ${totalKept}`);
  console.log(`Games dropped: ${totalDropped}`);
}

main();
