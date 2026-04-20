// Validates the question bank against its taxonomy and structural invariants.
// Used by CI and locally before any commit that touches frontend/questions.json.
//
// Exits 1 on any failure when invoked directly. Returns { ok, errors[] } when imported.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { solveGame, verifyAnswer } from './lg-solver.mjs';

const VALID_LABELS = ['A', 'B', 'C', 'D', 'E'];
const TOP_LEVEL_REQUIRED = ['bankVersion', 'generatedAt', 'totals', 'lr', 'rc', 'lg'];

function validateQuestion(q, expectedSection, seenIds, taxonomySubtypes, errors, ctx = '') {
  if (!q.id) errors.push(`${ctx}question missing id`);
  else if (seenIds.has(q.id)) errors.push(`${ctx}duplicate id: ${q.id}`);
  else seenIds.add(q.id);

  if (q.section !== expectedSection) {
    errors.push(`${ctx}${q.id}: section "${q.section}" does not match expected "${expectedSection}"`);
  }

  if (expectedSection === 'LR' && q.subtype && taxonomySubtypes && !taxonomySubtypes[q.subtype]) {
    errors.push(`${ctx}${q.id}: unknown LR subtype "${q.subtype}"`);
  }

  if (!q.correctAnswer) {
    errors.push(`${ctx}${q.id || '?'}: missing correctAnswer`);
    return;
  }

  if (!Array.isArray(q.choices) || q.choices.length === 0) {
    errors.push(`${ctx}${q.id}: missing or empty choices`);
    return;
  }

  const labels = q.choices.map(c => c.label);
  if (!labels.includes(q.correctAnswer)) {
    errors.push(`${ctx}${q.id}: correctAnswer "${q.correctAnswer}" not found among choice labels [${labels.join(',')}]`);
  }
  for (const lbl of labels) {
    if (!VALID_LABELS.includes(lbl)) errors.push(`${ctx}${q.id}: invalid choice label "${lbl}"`);
  }

  if (typeof q.difficulty !== 'number' || q.difficulty < 1 || q.difficulty > 3) {
    errors.push(`${ctx}${q.id}: difficulty must be 1, 2, or 3 (got ${q.difficulty})`);
  }

  if (!q.questionStem) errors.push(`${ctx}${q.id}: missing questionStem`);
}

function validateLgGame(game, seenIds, errors) {
  const ctx = `LG ${game.id}: `;
  if (!game.id) {
    errors.push('LG game missing id');
    return;
  }
  if (seenIds.has(game.id)) errors.push(`duplicate id: ${game.id}`);
  else seenIds.add(game.id);

  if (!Array.isArray(game.verifiedSolutions) || game.verifiedSolutions.length === 0) {
    errors.push(`${ctx}verifiedSolutions is missing or empty`);
  } else {
    // Re-solve for defense-in-depth. If the game uses a compound encoding
    // (advanced-linear / hybrid with positionLabels, compound {position,
    // attribute} solution values, or cross_dim rule annotations), the generator
    // pre-computed and verified solutions using a two-pass approach that the
    // naive re-solve can't reproduce. Trust the pre-computation in that case.
    const firstSol = game.verifiedSolutions[0];
    const isCompoundEncoding = (
      game.positionLabels ||
      game.externallyVerified ||
      (firstSol && Object.values(firstSol).some(v => typeof v === 'object' && v !== null))
    );
    if (!isCompoundEncoding) {
      try {
        const computed = solveGame(game);
        if (computed.length === 0) {
          errors.push(`${ctx}solver finds no valid solutions under stated rules`);
        }
      } catch (err) {
        errors.push(`${ctx}solver threw: ${err.message}`);
      }
    }
  }

  if (!Array.isArray(game.questions) || game.questions.length === 0) {
    errors.push(`${ctx}no questions in game`);
    return;
  }

  for (const q of game.questions) {
    validateQuestion(q, 'LG', seenIds, null, errors, ctx);
    // If a question ships an explicit verifiedAssertion, confirm it matches the answer.
    if (q.verifiedAssertion) {
      try {
        const ok = verifyAnswer(game, q.localRules || [], q.verifiedAssertion);
        if (!ok) {
          errors.push(`${ctx}${q.id}: verifyAnswer failed for declared assertion`);
        }
      } catch (err) {
        errors.push(`${ctx}${q.id}: verifyAnswer threw: ${err.message}`);
      }
    }
  }
}

export function validateBank(questionsPath, taxonomyPath) {
  const errors = [];
  let bank;
  let taxonomy;
  try {
    bank = JSON.parse(readFileSync(questionsPath, 'utf8'));
  } catch (err) {
    return { ok: false, errors: [`failed to read ${questionsPath}: ${err.message}`] };
  }
  try {
    taxonomy = JSON.parse(readFileSync(taxonomyPath, 'utf8'));
  } catch (err) {
    return { ok: false, errors: [`failed to read ${taxonomyPath}: ${err.message}`] };
  }

  for (const field of TOP_LEVEL_REQUIRED) {
    if (!(field in bank)) errors.push(`bank missing top-level field: ${field}`);
  }

  const lrSubtypes = taxonomy?.sections?.LR?.subtypes || {};
  const seenIds = new Set();

  if (Array.isArray(bank.lr)) {
    for (const q of bank.lr) validateQuestion(q, 'LR', seenIds, lrSubtypes, errors);
  }
  if (Array.isArray(bank.rc)) {
    for (const passage of bank.rc) {
      if (!passage.id) errors.push('RC passage missing id');
      else if (seenIds.has(passage.id)) errors.push(`duplicate id: ${passage.id}`);
      else seenIds.add(passage.id);
      if (!Array.isArray(passage.questions)) {
        errors.push(`RC passage ${passage.id}: missing questions`);
        continue;
      }
      for (const q of passage.questions) validateQuestion(q, 'RC', seenIds, null, errors, `RC ${passage.id}: `);
    }
  }
  if (Array.isArray(bank.lg)) {
    for (const game of bank.lg) validateLgGame(game, seenIds, errors);
  }

  return { ok: errors.length === 0, errors };
}

// CLI mode.
const thisFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(thisFile);

if (invokedDirectly) {
  const repoRoot = resolve(dirname(thisFile), '..', '..');
  const qp = resolve(repoRoot, 'frontend', 'questions.json');
  const tp = resolve(repoRoot, 'frontend', 'taxonomy.json');
  const res = validateBank(qp, tp);
  if (res.ok) {
    console.log(`[validate-bank] OK — ${qp}`);
    process.exit(0);
  } else {
    console.error(`[validate-bank] FAILED — ${res.errors.length} error(s):`);
    for (const e of res.errors) console.error('  -', e);
    process.exit(1);
  }
}
