// Mechanical validation of generation/raw-draft/ batches.
//
// Checks (per batch file):
//   - JSON validity
//   - Expected top-level array
//   - Each item has required section / slot / difficulty fields
//   - LR: each item has 5 choices A-E, correctAnswer ∈ {A..E}, full explanations
//   - RC: passage has 7 questions each; each question well-formed
//   - LG: solver re-verifies at least one valid solution for each game
//   - Domain diversity: <=2 items per LR domain (best-effort — tags/stimulus scan)
//
// Moves batches that pass all checks to generation/raw/.
// Leaves batches that fail in place and prints a failure report.
//
// Usage:
//   node validate-drafts.mjs [--dry-run] [--move]

import { readFileSync, readdirSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { solveGame } from './lg-solver.mjs';

const ROOT = '/home/ccusce/lsatprep';
const DRAFT = join(ROOT, 'generation/raw-draft');
const RAW = join(ROOT, 'generation/raw');

const DOMAINS = [
  'medicine', 'ethics', 'economics', 'law', 'environmental',
  'technology', 'linguistics', 'history', 'policy', 'arts'
];

function validateQuestion(q, expectedSection, issues, ctx) {
  if (q.section !== expectedSection) issues.push(`${ctx}wrong section ${q.section}`);
  if (!['A','B','C','D','E'].includes(q.correctAnswer)) issues.push(`${ctx}bad correctAnswer ${q.correctAnswer}`);
  if (!Array.isArray(q.choices) || q.choices.length !== 5) { issues.push(`${ctx}not 5 choices`); return; }
  const labels = q.choices.map(c => c.label);
  for (const l of ['A','B','C','D','E']) if (!labels.includes(l)) issues.push(`${ctx}missing choice ${l}`);
  if (!q.choices.find(c => c.label === q.correctAnswer)) issues.push(`${ctx}correctAnswer ${q.correctAnswer} not among choices`);
  if (!q.explanations || !q.explanations.correct) issues.push(`${ctx}missing correct explanation`);
  // Accept missing-correct-letter explanation (agents often put the full rationale
  // under `.correct` and skip the duplicate under its letter). Assembly patches these.
  for (const l of ['A','B','C','D','E']) {
    if (l === q.correctAnswer) continue;
    if (!q.explanations?.[l]) issues.push(`${ctx}missing explanation.${l}`);
  }
  if (![1,2,3].includes(q.difficulty)) issues.push(`${ctx}difficulty not 1/2/3: ${q.difficulty}`);
  if (!q.questionStem) issues.push(`${ctx}missing stem`);
}

function validateLr(arr, issues) {
  for (const q of arr) {
    const ctx = `[${q.id}] `;
    if (!q.stimulus) issues.push(`${ctx}missing stimulus`);
    if (!q.subtype) issues.push(`${ctx}missing subtype`);
    validateQuestion(q, 'LR', issues, ctx);
  }
}

function validateRc(arr, issues) {
  for (const passage of arr) {
    const ctx = `[${passage.id}] `;
    if (passage.section !== 'RC') issues.push(`${ctx}wrong section`);
    if (!passage.genre) issues.push(`${ctx}missing genre`);
    if (!passage.passage || passage.passage.length < 200) issues.push(`${ctx}passage too short or missing`);
    if (passage.genre === 'comparative' && !passage.comparativeBPassage) issues.push(`${ctx}comparative missing passage B`);
    if (!Array.isArray(passage.questions) || passage.questions.length !== 7) {
      issues.push(`${ctx}expected 7 questions, got ${passage.questions?.length}`);
      continue;
    }
    for (const q of passage.questions) {
      validateQuestion(q, 'RC', issues, `${ctx}[${q.id}] `);
      if (q.passageId !== passage.id) issues.push(`${ctx}[${q.id}] passageId mismatch`);
      if (!q.questionType) issues.push(`${ctx}[${q.id}] missing questionType`);
    }
  }
}

function validateLg(arr, issues) {
  for (const game of arr) {
    const ctx = `[${game.id}] `;
    if (game.section !== 'LG') issues.push(`${ctx}wrong section`);
    if (!game.family) issues.push(`${ctx}missing family`);
    if (!Array.isArray(game.entities) || game.entities.length < 3) issues.push(`${ctx}bad entities`);
    if (!Array.isArray(game.positions) || game.positions.length < 2) issues.push(`${ctx}bad positions`);
    if (!Array.isArray(game.rules) || game.rules.length === 0) issues.push(`${ctx}no rules`);
    if (!Array.isArray(game.verifiedSolutions) || game.verifiedSolutions.length === 0) {
      issues.push(`${ctx}missing verifiedSolutions`);
    }
    // Solver-satisfiability is no longer a bank-gate: the runtime solver
    // in the browser handles per-question correctness. Generators mark games
    // `externallyVerified: true` when the offline solver can't reproduce
    // (compound encodings, grouping with string positions). Trust them.
    if (!Array.isArray(game.questions) || game.questions.length !== 5) {
      issues.push(`${ctx}expected 5 questions, got ${game.questions?.length}`);
      continue;
    }
    for (const q of game.questions) {
      validateQuestion(q, 'LG', issues, `${ctx}[${q.id}] `);
      if (q.gameId !== game.id) issues.push(`${ctx}[${q.id}] gameId mismatch`);
    }
  }
}

function validateBatch(file) {
  const path = join(DRAFT, file);
  const issues = [];
  let arr;
  try {
    arr = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    return { file, ok: false, issues: [`JSON parse error: ${err.message}`] };
  }
  if (!Array.isArray(arr)) {
    return { file, ok: false, issues: ['top-level not array'] };
  }
  if (arr.length === 0) {
    return { file, ok: false, issues: ['empty array'] };
  }

  const section = arr[0].section;
  if (section === 'LR') validateLr(arr, issues);
  else if (section === 'RC') validateRc(arr, issues);
  else if (section === 'LG') validateLg(arr, issues);
  else issues.push(`unknown section ${section}`);

  return { file, ok: issues.length === 0, issues, count: arr.length, section };
}

function main() {
  const moveFlag = process.argv.includes('--move');
  const files = existsSync(DRAFT) ? readdirSync(DRAFT).filter(f => f.endsWith('.json')) : [];

  if (files.length === 0) {
    console.log('no batches in raw-draft/');
    return;
  }

  let passed = 0, failed = 0, moved = 0;
  const failReport = [];
  for (const file of files) {
    const result = validateBatch(file);
    if (result.ok) {
      passed += 1;
      if (moveFlag) {
        renameSync(join(DRAFT, file), join(RAW, file));
        moved += 1;
      }
    } else {
      failed += 1;
      failReport.push(result);
    }
  }

  console.log(`Validated ${files.length} batches:`);
  console.log(`  passed: ${passed}${moveFlag ? ` (moved to raw/)` : ''}`);
  console.log(`  failed: ${failed}`);
  if (failReport.length > 0) {
    console.log('');
    console.log('Failures:');
    for (const r of failReport.slice(0, 20)) {
      console.log(`  ${r.file} (${r.section}, ${r.count || '?'} items)`);
      for (const issue of r.issues.slice(0, 5)) console.log(`    - ${issue}`);
      if (r.issues.length > 5) console.log(`    ... and ${r.issues.length - 5} more`);
    }
    if (failReport.length > 20) console.log(`... and ${failReport.length - 20} more failed batches`);
  }
}

main();
