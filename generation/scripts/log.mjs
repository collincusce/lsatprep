// Structured JSONL logger for generation pipeline stages.
// Each line is a JSON object with { ts, stage, level, msg, ...fields }.

import { mkdirSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const logsDir = resolve(repoRoot, 'generation', 'logs');

function ensureDir() {
  try { mkdirSync(logsDir, { recursive: true }); } catch {}
}

function isoNow() {
  return new Date().toISOString();
}

export function createLogger(stage) {
  ensureDir();
  const stamp = isoNow().replace(/[:]/g, '-').slice(0, 19);
  const path = resolve(logsDir, `${stage}-${stamp}.jsonl`);
  const write = (level, msg, fields) => {
    const record = { ts: isoNow(), stage, level, msg, ...(fields || {}) };
    const line = JSON.stringify(record) + '\n';
    appendFileSync(path, line);
    const prefix = `[${stage}:${level}]`;
    if (level === 'error') console.error(prefix, msg, fields || '');
    else console.log(prefix, msg, fields || '');
  };
  return {
    path,
    info: (msg, fields) => write('info', msg, fields),
    warn: (msg, fields) => write('warn', msg, fields),
    error: (msg, fields) => write('error', msg, fields)
  };
}
