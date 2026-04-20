// Auto-loop: generate → validate → promote → re-assemble → check count → repeat.
// Exits when bank hits the target OR when a wave adds zero new questions
// (indicating we've maxed out what generator+schema can produce).
//
// Usage: node loop-to-target.mjs [target=4000] [maxWaves=8]

import { readFileSync, readdirSync, writeFileSync, renameSync, existsSync, rmSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = '/home/ccusce/lsatprep';
const BANK = join(ROOT, 'frontend/questions.json');
const DRAFT = join(ROOT, 'generation/raw-draft');

const TARGET = Number(process.argv[2] || 4000);
const MAX_WAVES = Number(process.argv[3] || 8);

function currentCount() {
  const b = JSON.parse(readFileSync(BANK, 'utf8'));
  return b.totals?.overall || 0;
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

function clearDrafts() {
  for (const f of readdirSync(DRAFT)) {
    try { unlinkSync(join(DRAFT, f)); } catch {}
  }
}

async function main() {
  let wave = 0;
  let prev = currentCount();
  console.log(`[loop] starting — current: ${prev}, target: ${TARGET}`);

  while (prev < TARGET && wave < MAX_WAVES) {
    wave += 1;
    console.log(`\n[loop] === wave ${wave} ===`);

    clearDrafts();

    console.log('[loop] generate-all.mjs running...');
    const gen = run('node', ['generation/scripts/generate-all.mjs']);
    console.log('[loop] generator exit code:', gen.code);
    if (gen.code !== 0) {
      console.error('[loop] generator failed:', gen.err.slice(0, 500));
      break;
    }

    console.log('[loop] validate-drafts --move');
    const val = run('node', ['generation/scripts/validate-drafts.mjs', '--move']);
    console.log(val.out.slice(0, 500));

    console.log('[loop] assemble.mjs');
    const asm = run('node', ['generation/scripts/assemble.mjs']);
    console.log(asm.out.slice(0, 500));

    console.log('[loop] validate-bank.mjs');
    const vb = run('node', ['generation/scripts/validate-bank.mjs']);
    console.log(vb.out.slice(0, 200));
    if (vb.code !== 0) {
      console.error('[loop] bank validation FAILED, stopping');
      break;
    }

    const next = currentCount();
    console.log(`[loop] wave ${wave}: ${prev} -> ${next} (+${next - prev})`);
    if (next === prev) {
      console.log('[loop] no progress this wave — likely all remaining cells are unproducable under current schema. stopping.');
      break;
    }
    prev = next;
  }

  console.log(`\n[loop] done. final count: ${prev} (target: ${TARGET}, waves: ${wave})`);
  process.exit(prev >= TARGET ? 0 : 1);
}

main().catch(err => {
  console.error('[loop] fatal:', err);
  process.exit(2);
});
