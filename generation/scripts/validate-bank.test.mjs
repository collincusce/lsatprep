import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateBank } from './validate-bank.mjs';

function makeMinimalValidBank() {
  return {
    bankVersion: '2026-04-19-test',
    generatedAt: '2026-04-19T00:00:00Z',
    totals: { LR: 1, RC: 0, LG: 1, passages: 0, games: 1 },
    lr: [
      {
        id: 'lr-0001',
        section: 'LR',
        subtype: 'strengthen',
        difficulty: 1,
        stimulus: 'x',
        questionStem: 'y',
        choices: [
          { label: 'A', text: 'a' },
          { label: 'B', text: 'b' },
          { label: 'C', text: 'c' },
          { label: 'D', text: 'd' },
          { label: 'E', text: 'e' }
        ],
        correctAnswer: 'A',
        explanations: { correct: '', A: '', B: '', C: '', D: '', E: '' }
      }
    ],
    rc: [],
    lg: [
      {
        id: 'lg-game-0001',
        section: 'LG',
        family: 'basic_linear',
        difficulty: 1,
        scenario: 's',
        entities: ['A', 'B'],
        positions: [1, 2],
        rules: [],
        verifiedSolutions: [
          { A: 1, B: 2 },
          { A: 2, B: 1 }
        ],
        questions: [
          {
            id: 'lg-0001',
            section: 'LG',
            gameId: 'lg-game-0001',
            questionType: 'could_be_true',
            difficulty: 1,
            questionStem: 'q',
            localRules: [],
            choices: [
              { label: 'A', text: 'A=1' },
              { label: 'B', text: 'A=2' },
              { label: 'C', text: 'A=3' },
              { label: 'D', text: 'A=4' },
              { label: 'E', text: 'A=5' }
            ],
            correctAnswer: 'A',
            explanations: { correct: '', A: '', B: '', C: '', D: '', E: '' }
          }
        ]
      }
    ]
  };
}

function makeMinimalTaxonomy() {
  return {
    version: 'test',
    bankVersion: '2026-04-19-test',
    sections: {
      LR: { name: 'Logical Reasoning', subtypes: { strengthen: { name: 'Strengthen', coverageTarget: 1 } } },
      RC: { name: 'Reading Comprehension', genres: {}, questionTypes: {} },
      LG: { name: 'Logic Games', families: { basic_linear: { name: 'Basic Linear', coverageTarget: 1 } } }
    }
  };
}

function writePair(bank, taxonomy) {
  const dir = mkdtempSync(join(tmpdir(), 'lsatprep-test-'));
  const qp = join(dir, 'questions.json');
  const tp = join(dir, 'taxonomy.json');
  writeFileSync(qp, JSON.stringify(bank));
  writeFileSync(tp, JSON.stringify(taxonomy));
  return { qp, tp };
}

test('valid bank passes', () => {
  const { qp, tp } = writePair(makeMinimalValidBank(), makeMinimalTaxonomy());
  const res = validateBank(qp, tp);
  assert.equal(res.ok, true, res.errors.join('\n'));
});

test('missing correctAnswer fails', () => {
  const bank = makeMinimalValidBank();
  delete bank.lr[0].correctAnswer;
  const { qp, tp } = writePair(bank, makeMinimalTaxonomy());
  const res = validateBank(qp, tp);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /correctAnswer/.test(e)));
});

test('correctAnswer not among choices fails', () => {
  const bank = makeMinimalValidBank();
  bank.lr[0].correctAnswer = 'Z';
  const { qp, tp } = writePair(bank, makeMinimalTaxonomy());
  const res = validateBank(qp, tp);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /Z/.test(e)));
});

test('duplicate ids fail', () => {
  const bank = makeMinimalValidBank();
  bank.lr.push({ ...bank.lr[0] });
  const { qp, tp } = writePair(bank, makeMinimalTaxonomy());
  const res = validateBank(qp, tp);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /duplicate/i.test(e)));
});

test('LG game with empty verifiedSolutions fails', () => {
  const bank = makeMinimalValidBank();
  bank.lg[0].verifiedSolutions = [];
  const { qp, tp } = writePair(bank, makeMinimalTaxonomy());
  const res = validateBank(qp, tp);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /verifiedSolutions/.test(e)));
});

test('LG correctAnswer conflicting with solutions fails', () => {
  const bank = makeMinimalValidBank();
  // Question says A=3, but solver said A can only be 1 or 2.
  const q = bank.lg[0].questions[0];
  q.correctAnswer = 'C'; // claims A=3 in the text
  q.verifiedAssertion = { kind: 'could_be_true', assertion: { type: 'at', entity: 'A', position: 3 } };
  const { qp, tp } = writePair(bank, makeMinimalTaxonomy());
  const res = validateBank(qp, tp);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /LG|verify/i.test(e)));
});

test('missing top-level field fails', () => {
  const bank = makeMinimalValidBank();
  delete bank.bankVersion;
  const { qp, tp } = writePair(bank, makeMinimalTaxonomy());
  const res = validateBank(qp, tp);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /bankVersion/.test(e)));
});

test('unknown subtype in question fails', () => {
  const bank = makeMinimalValidBank();
  bank.lr[0].subtype = 'nonsense_subtype';
  const { qp, tp } = writePair(bank, makeMinimalTaxonomy());
  const res = validateBank(qp, tp);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /subtype/.test(e)));
});
