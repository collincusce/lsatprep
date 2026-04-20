// Stage-6 assembly. Reads all generation/raw/*.json and produces the final
// frontend/questions.json the app ships.
//
// What it does:
//   - Scans generation/raw/ for lr-*.json, rc-*.json, lg-*.json batches.
//   - Flattens LR batches; renumbers ids as lr-0001, lr-0002, ... in deterministic order.
//   - Keeps RC passage structure; renumbers passage ids as rc-passage-0001 and
//     nested question ids as rc-0001 (flat across all passages); patches each
//     question's passageId to match the renumbered passage id.
//   - Keeps LG game structure; renumbers game ids as lg-game-0001 and nested
//     question ids as lg-0001 (flat); patches each question's gameId; preserves
//     verifiedSolutions verbatim.
//   - Stamps bankVersion = <ISO date>-<build counter> and emits totals.
//
// Deterministic sort order: files sorted by filename so the same raw corpus
// always produces the same final bank (important for git diffs on regen).

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const RAW_DIR = join(ROOT, 'generation/raw');
const OUT_PATH = join(ROOT, 'frontend/questions.json');

function zeroPad(n, width = 4) {
  return String(n).padStart(width, '0');
}

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function sortedBatches(prefix) {
  return readdirSync(RAW_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.json'))
    .sort();
}

// Patch missing explanations[correctAnswer] with "Correct." — some generators
// (Haiku especially) put the full rationale under `correct` and skip the
// correct-letter entry. Frontend renders best when all 5 letter entries exist.
function patchExplanations(q) {
  if (!q.explanations || !q.correctAnswer) return;
  if (!q.explanations[q.correctAnswer]) {
    q.explanations[q.correctAnswer] = 'Correct.';
  }
}

// --- LR ---------------------------------------------------------------------

function assembleLr() {
  const records = [];
  for (const file of sortedBatches('lr-')) {
    const batch = readJson(join(RAW_DIR, file));
    if (!Array.isArray(batch)) {
      console.warn(`  skipping ${file}: not an array`);
      continue;
    }
    for (const q of batch) {
      if (q.criticNotes !== undefined) delete q.criticNotes;
      patchExplanations(q);
      records.push(q);
    }
  }
  // Renumber ids.
  for (let i = 0; i < records.length; i++) {
    records[i].id = `lr-${zeroPad(i + 1)}`;
  }
  return records;
}

// --- RC ---------------------------------------------------------------------

function assembleRc() {
  const passages = [];
  let passageCounter = 0;
  let questionCounter = 0;

  for (const file of sortedBatches('rc-')) {
    const batch = readJson(join(RAW_DIR, file));
    if (!Array.isArray(batch)) {
      console.warn(`  skipping ${file}: not an array`);
      continue;
    }
    for (const passage of batch) {
      passageCounter += 1;
      const newPassageId = `rc-passage-${zeroPad(passageCounter)}`;
      passage.id = newPassageId;
      delete passage.criticNotes;
      if (!Array.isArray(passage.questions)) {
        console.warn(`  ${file} passage ${passageCounter}: no questions array`);
        passage.questions = [];
      }
      for (const q of passage.questions) {
        questionCounter += 1;
        q.id = `rc-${zeroPad(questionCounter)}`;
        q.passageId = newPassageId;
        delete q.criticNotes;
        patchExplanations(q);
      }
      passages.push(passage);
    }
  }
  return passages;
}

// --- LG ---------------------------------------------------------------------

function assembleLg() {
  const games = [];
  let gameCounter = 0;
  let questionCounter = 0;

  for (const file of sortedBatches('lg-')) {
    const batch = readJson(join(RAW_DIR, file));
    if (!Array.isArray(batch)) {
      console.warn(`  skipping ${file}: not an array`);
      continue;
    }
    for (const game of batch) {
      gameCounter += 1;
      const newGameId = `lg-game-${zeroPad(gameCounter)}`;
      game.id = newGameId;
      delete game.criticNotes;
      if (!Array.isArray(game.verifiedSolutions) || game.verifiedSolutions.length === 0) {
        console.warn(`  ${file} game ${gameCounter}: missing or empty verifiedSolutions`);
      }
      if (!Array.isArray(game.questions)) {
        console.warn(`  ${file} game ${gameCounter}: no questions array`);
        game.questions = [];
      }
      for (const q of game.questions) {
        questionCounter += 1;
        q.id = `lg-${zeroPad(questionCounter)}`;
        q.gameId = newGameId;
        delete q.criticNotes;
        patchExplanations(q);
      }
      games.push(game);
    }
  }
  return games;
}

// --- bankVersion helper -----------------------------------------------------

function nextBankVersion() {
  const today = new Date().toISOString().slice(0, 10);
  // If the existing bank already has today's date, bump the counter.
  let counter = 1;
  if (existsSync(OUT_PATH)) {
    try {
      const prev = readJson(OUT_PATH);
      const m = /^(\d{4}-\d{2}-\d{2})-(\d+)$/.exec(prev.bankVersion || '');
      if (m && m[1] === today) counter = Number(m[2]) + 1;
    } catch { /* ignore */ }
  }
  return `${today}-${String(counter).padStart(3, '0')}`;
}

// --- main -------------------------------------------------------------------

console.log('assembling from', RAW_DIR);
const lr = assembleLr();
console.log('  LR:', lr.length, 'questions');

const rc = assembleRc();
const rcQuestions = rc.reduce((s, p) => s + (p.questions?.length || 0), 0);
console.log('  RC:', rc.length, 'passages,', rcQuestions, 'questions');

const lg = assembleLg();
const lgQuestions = lg.reduce((s, g) => s + (g.questions?.length || 0), 0);
console.log('  LG:', lg.length, 'games,', lgQuestions, 'questions');

const bankVersion = nextBankVersion();
const bank = {
  bankVersion,
  generatedAt: new Date().toISOString(),
  totals: {
    LR: lr.length,
    RC: rcQuestions,
    LG: lgQuestions,
    passages: rc.length,
    games: lg.length,
    overall: lr.length + rcQuestions + lgQuestions
  },
  lr,
  rc,
  lg
};

writeFileSync(OUT_PATH, JSON.stringify(bank, null, 2) + '\n');

console.log();
console.log('bankVersion:', bankVersion);
console.log('total:', bank.totals.overall, 'questions');
console.log('wrote', OUT_PATH);
