// Regenerate frontend/taxonomy.json from coverage-matrix.json + rubric cards.
//
// Purpose: keep the machine-readable taxonomy in sync with the source of truth
// (the generator's coverage matrix + the human-authored rubric cards) rather
// than requiring hand-edits in two places.
//
// Frontend usage: the taxonomy is small and eager-loaded. It powers drill-
// setup dropdowns, progress-report grouping, and the About page's coverage table.
// Rubric prose itself lives under docs/taxonomy/ and is NOT shipped to the
// browser — only the names / targets / short descriptions are.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const coverage = JSON.parse(readFileSync(join(ROOT, 'generation/coverage-matrix.json'), 'utf8'));

// Coverage aggregator: sum counts per (section, slot).
const totals = {}; // "LR|strengthen" -> { total, byDifficulty: {1: 51, 2: 90, 3: 51} }
for (const cell of coverage.cells) {
  const slot = cell.subtype || cell.genre || cell.family;
  const key = `${cell.section}|${slot}`;
  if (!totals[key]) totals[key] = { total: 0, byDifficulty: { 1: 0, 2: 0, 3: 0 } };
  totals[key].total += cell.count;
  totals[key].byDifficulty[cell.difficulty] += cell.count;
}

function readRubric(section, slot) {
  try {
    return readFileSync(join(ROOT, `docs/taxonomy/${section}/${slot}.md`), 'utf8');
  } catch {
    return '';
  }
}

// Rubric extractors: pull bullet lists under specific headings. Cheap regex-based.
function extractSection(md, heading) {
  const re = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i');
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

function extractBullets(md, heading, limit = 5) {
  const block = extractSection(md, heading);
  if (!block) return [];
  const items = [];
  for (const line of block.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) items.push(trimmed.slice(2).trim());
    if (items.length >= limit) break;
  }
  return items;
}

// Grab a 1–2 sentence description from the rubric's "Structure" / "Passage characteristics"
// / "Scenario pattern" section (whichever exists) for a tight one-liner.
function extractDescription(md) {
  for (const heading of ['Structure', 'Passage characteristics', 'Scenario pattern']) {
    const block = extractSection(md, heading);
    if (!block) continue;
    // First non-bullet paragraph.
    const para = block.split('\n\n').find(p => p.trim() && !p.trim().startsWith('-'));
    if (!para) continue;
    // Trim to first sentence (period followed by space-or-newline).
    const first = para.trim().split(/\.\s+(?=[A-Z])/)[0];
    return (first.endsWith('.') ? first : first + '.').replace(/\s+/g, ' ').trim();
  }
  return '';
}

function extractDifficultyAnchors(md) {
  const block = extractSection(md, 'Difficulty anchors') || extractSection(md, 'Difficulty drivers');
  const anchors = { 1: '', 2: '', 3: '' };
  for (const line of block.split('\n')) {
    const m = line.match(/\*\*([123])★?.*?:\*\*\s*(.+?)(?:;|$)/);
    if (m) anchors[m[1]] = m[2].replace(/\[|\]/g, '').trim();
  }
  return anchors;
}

// LR subtype order + nice display names.
const LR_SUBTYPES = [
  ['assumption_necessary',    'Necessary Assumption'],
  ['assumption_sufficient',   'Sufficient Assumption'],
  ['strengthen',              'Strengthen'],
  ['weaken',                  'Weaken'],
  ['flaw',                    'Flaw in the Reasoning'],
  ['parallel_reasoning',      'Parallel Reasoning'],
  ['parallel_flaw',           'Parallel Flaw'],
  ['method_of_reasoning',     'Method of Reasoning'],
  ['role_in_argument',        'Role in Argument'],
  ['point_at_issue',          'Point at Issue'],
  ['main_point',              'Main Point'],
  ['must_be_true',            'Must Be True'],
  ['most_strongly_supported', 'Most Strongly Supported'],
  ['principle_conform',       'Principle (Conform)'],
  ['principle_justify',       'Principle (Justify)'],
  ['paradox_resolve',         'Paradox / Resolve']
];

const RC_GENRES = [
  ['humanities',       'Humanities'],
  ['social_sciences',  'Social Sciences'],
  ['natural_science',  'Natural Science'],
  ['law',              'Law'],
  ['comparative',      'Comparative Reading']
];

const RC_QUESTION_TYPES = [
  ['main_point',              "Main Point"],
  ['author_attitude',         "Author's Attitude"],
  ['passage_structure',       'Passage Structure'],
  ['specific_detail',         'Specific Detail'],
  ['inference',               'Inference'],
  ['function',                'Function'],
  ['strengthen_weaken_claim', "Strengthen/Weaken Claim"],
  ['application',             'Application']
];

const LG_FAMILIES = [
  ['basic_linear',    'Basic Linear'],
  ['advanced_linear', 'Advanced Linear'],
  ['grouping',        'Grouping'],
  ['hybrid',          'Hybrid']
];

const LG_QUESTION_TYPES = [
  ['orientation_question', 'Orientation'],
  ['could_be_true',        'Could Be True'],
  ['must_be_true',         'Must Be True'],
  ['cannot_be_true',       'Cannot Be True'],
  ['must_be_false',        'Must Be False'],
  ['rule_substitution',    'Rule Substitution'],
  ['equivalent',           'Equivalent Rule']
];

function buildSlotRecord(section, slot, displayName) {
  const key = `${section}|${slot}`;
  const cov = totals[key] || { total: 0, byDifficulty: { 1: 0, 2: 0, 3: 0 } };
  const md = readRubric(section, slot);
  return {
    name: displayName,
    description: extractDescription(md),
    coverageTarget: cov.total,
    byDifficulty: cov.byDifficulty,
    stemTemplates: extractBullets(md, 'Common stem templates', 5),
    commonTraps: extractBullets(md, 'Trap patterns', 6),
    difficultyAnchors: extractDifficultyAnchors(md),
    rubricPath: `docs/taxonomy/${section}/${slot}.md`
  };
}

const today = new Date().toISOString().slice(0, 10);

const taxonomy = {
  version: '1.0',
  bankVersion: coverage.bankVersion || `${today}-placeholder`,
  generatedAt: new Date().toISOString(),
  totalTarget: coverage.totalTarget,
  sections: {
    LR: {
      name: 'Logical Reasoning',
      coverageTarget: Object.entries(totals).filter(([k]) => k.startsWith('LR|')).reduce((s, [, v]) => s + v.total, 0),
      subtypes: Object.fromEntries(LR_SUBTYPES.map(([slot, name]) => [slot, buildSlotRecord('LR', slot, name)]))
    },
    RC: {
      name: 'Reading Comprehension',
      coverageTarget: Object.entries(totals).filter(([k]) => k.startsWith('RC|')).reduce((s, [, v]) => s + v.total, 0),
      genres: Object.fromEntries(RC_GENRES.map(([slot, name]) => [slot, buildSlotRecord('RC', slot, name)])),
      questionTypes: Object.fromEntries(RC_QUESTION_TYPES.map(([slot, name]) => [slot, { name }]))
    },
    LG: {
      name: 'Logic Games',
      coverageTarget: Object.entries(totals).filter(([k]) => k.startsWith('LG|')).reduce((s, [, v]) => s + v.total, 0),
      families: Object.fromEntries(LG_FAMILIES.map(([slot, name]) => [slot, buildSlotRecord('LG', slot, name)])),
      questionTypes: Object.fromEntries(LG_QUESTION_TYPES.map(([slot, name]) => [slot, { name }]))
    }
  },
  difficultyScale: {
    1: { label: '1★', description: 'Easier — ≈80–100% of LSAT takers get these right.' },
    2: { label: '2★', description: 'Medium — ≈50–79% of LSAT takers get these right.' },
    3: { label: '3★', description: 'Harder — under 50% of LSAT takers get these right.' }
  },
  trapCatalog: [
    { id: 'sufficient_necessary_swap',  name: 'Sufficient / Necessary Swap',  description: 'Reverses the direction of a conditional.' },
    { id: 'out_of_scope',                name: 'Out of Scope',                 description: 'Brings in a topic the stimulus never addresses.' },
    { id: 'half_right',                  name: 'Half Right / Half Wrong',      description: 'First clause matches; second clause contradicts the stimulus.' },
    { id: 'opposite_answer',             name: 'Opposite Answer',              description: 'States the reverse of what follows — often by dropping a negation.' },
    { id: 'too_strong',                  name: 'Too Strong',                   description: 'Overstates the stimulus (only → all; some → most).' },
    { id: 'temporal_confusion',          name: 'Temporal Confusion',           description: 'Swaps past/present/future against what the stimulus claims.' },
    { id: 'reversed_causation',          name: 'Reversed Causation',           description: 'Claims Y caused X when the stimulus shows X caused Y.' },
    { id: 'relative_vs_absolute',        name: 'Relative vs. Absolute',        description: 'Confuses percent changes with absolute counts or vice versa.' },
    { id: 'unwarranted_comparison',      name: 'Unwarranted Comparison',       description: 'Compares two things the stimulus never put on the same scale.' },
    { id: 'shift_in_subject',            name: 'Shift in Subject',             description: 'Slightly changes who/what the stimulus is talking about.' }
  ]
};

const outPath = join(ROOT, 'frontend/taxonomy.json');
writeFileSync(outPath, JSON.stringify(taxonomy, null, 2) + '\n');

console.log(`wrote ${outPath}`);
console.log(`  LR slots: ${Object.keys(taxonomy.sections.LR.subtypes).length}`);
console.log(`  RC genres: ${Object.keys(taxonomy.sections.RC.genres).length}`);
console.log(`  LG families: ${Object.keys(taxonomy.sections.LG.families).length}`);
console.log(`  totalTarget: ${taxonomy.totalTarget}`);
