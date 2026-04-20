// Validates the coverage matrix: cells sum to totalTarget, every section/
// subtype/genre/family exists in taxonomy, difficulty in {1,2,3}, batchSize > 0.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export function validateCoverageMatrix(matrixPath, taxonomyOrPath) {
  const errors = [];
  let matrix;
  let taxonomy;
  try {
    matrix = JSON.parse(readFileSync(matrixPath, 'utf8'));
  } catch (err) {
    return { ok: false, errors: [`failed to read ${matrixPath}: ${err.message}`] };
  }

  if (typeof taxonomyOrPath === 'string') {
    try {
      taxonomy = JSON.parse(readFileSync(taxonomyOrPath, 'utf8'));
    } catch (err) {
      return { ok: false, errors: [`failed to read ${taxonomyOrPath}: ${err.message}`] };
    }
  } else {
    taxonomy = taxonomyOrPath;
  }

  if (typeof matrix.totalTarget !== 'number') errors.push('totalTarget must be a number');
  if (!Array.isArray(matrix.cells)) {
    errors.push('cells must be an array');
    return { ok: false, errors };
  }

  const lrSubtypes = taxonomy?.sections?.LR?.subtypes || {};
  const rcGenres = taxonomy?.sections?.RC?.genres || {};
  const lgFamilies = taxonomy?.sections?.LG?.families || {};

  let sum = 0;
  matrix.cells.forEach((cell, i) => {
    const where = `cell[${i}]`;
    if (!['LR', 'RC', 'LG'].includes(cell.section)) errors.push(`${where}: invalid section "${cell.section}"`);
    if (typeof cell.count !== 'number' || cell.count < 0) errors.push(`${where}: count must be a non-negative number`);
    else sum += cell.count;
    if (typeof cell.batchSize !== 'number' || cell.batchSize <= 0) errors.push(`${where}: batchSize must be > 0`);
    if (cell.difficulty !== undefined && ![1, 2, 3].includes(cell.difficulty)) {
      errors.push(`${where}: difficulty must be 1, 2, or 3`);
    }
    if (cell.section === 'LR') {
      if (!cell.subtype) errors.push(`${where}: LR cell missing subtype`);
      else if (!lrSubtypes[cell.subtype]) errors.push(`${where}: unknown LR subtype "${cell.subtype}"`);
    }
    if (cell.section === 'RC') {
      if (!cell.genre) errors.push(`${where}: RC cell missing genre`);
      else if (!rcGenres[cell.genre]) errors.push(`${where}: unknown RC genre "${cell.genre}"`);
    }
    if (cell.section === 'LG') {
      if (!cell.family) errors.push(`${where}: LG cell missing family`);
      else if (!lgFamilies[cell.family]) errors.push(`${where}: unknown LG family "${cell.family}"`);
    }
  });

  if (sum !== matrix.totalTarget) {
    errors.push(`cell counts sum to ${sum}, but totalTarget is ${matrix.totalTarget}`);
  }

  return { ok: errors.length === 0, errors };
}

const thisFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(thisFile);

if (invokedDirectly) {
  const repoRoot = resolve(dirname(thisFile), '..', '..');
  const matrixPath = resolve(repoRoot, 'generation', 'coverage-matrix.json');
  const taxonomyPath = resolve(repoRoot, 'frontend', 'taxonomy.json');
  const res = validateCoverageMatrix(matrixPath, taxonomyPath);
  if (res.ok) {
    console.log(`[validate-coverage-matrix] OK — sums to ${JSON.parse(readFileSync(matrixPath, 'utf8')).totalTarget}`);
    process.exit(0);
  } else {
    console.error('[validate-coverage-matrix] FAILED:');
    for (const e of res.errors) console.error('  -', e);
    process.exit(1);
  }
}
