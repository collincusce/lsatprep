import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { __setClientForTests, __resetClientForTests } from './lib/anthropic.mjs';
import { explain } from './handlers/explain.mjs';
import { writingSample } from './handlers/writing-sample.mjs';
import { diagnostic } from './handlers/diagnostic.mjs';
import { coach } from './handlers/coach.mjs';

function makeStream() {
  const out = { status: null, headers: null, chunks: [], ended: false };
  return {
    out,
    stream: {
      writeHead: (s, h) => { out.status = s; out.headers = h; },
      write: (c) => out.chunks.push(String(c)),
      end: () => { out.ended = true; }
    }
  };
}

function mockClient({ text = 'mock response', streamDeltas = null } = {}) {
  return {
    messages: {
      create: async () => ({ content: [{ type: 'text', text }] }),
      stream: async () => {
        const events = (streamDeltas || ['hello']).map(t => ({ type: 'content_block_delta', delta: { type: 'text_delta', text: t } }));
        return (async function* () { for (const e of events) yield e; })();
      }
    }
  };
}

beforeEach(() => {
  process.env.SHARED_SECRET = 'test-secret';
  process.env.ALLOWED_ORIGIN = 'https://example.com';
  process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
  __resetClientForTests();
});

test('/explain happy path', async () => {
  __setClientForTests(mockClient({ text: 'Because it restates the gap between premise and conclusion.' }));
  const { out, stream } = makeStream();
  await explain({
    body: JSON.stringify({
      questionId: 'lr-0001',
      stimulus: 'stim',
      choices: [{ label: 'A', text: 'a' }, { label: 'B', text: 'b' }, { label: 'C', text: 'c' }, { label: 'D', text: 'd' }, { label: 'E', text: 'e' }],
      correctAnswer: 'B',
      userAnswer: 'C'
    })
  }, stream);
  assert.equal(out.status, 200);
  const body = JSON.parse(out.chunks.join(''));
  assert.ok(body.explanation.length > 0);
});

test('/explain 400 on missing fields', async () => {
  __setClientForTests(mockClient());
  const { out, stream } = makeStream();
  await explain({ body: JSON.stringify({}) }, stream);
  assert.equal(out.status, 400);
});

test('/writing-sample happy path returns JSON object', async () => {
  __setClientForTests(mockClient({ text: '{"grade":"A","rubric":{"organization":5,"argumentStrength":5,"evidenceUse":5,"clarity":5},"narrative":"solid"}' }));
  const { out, stream } = makeStream();
  await writingSample({ body: JSON.stringify({ promptId: 'ws-0001', essay: 'x'.repeat(200) }) }, stream);
  assert.equal(out.status, 200);
  const body = JSON.parse(out.chunks.join(''));
  assert.equal(body.grade, 'A');
});

test('/writing-sample rejects short essays', async () => {
  __setClientForTests(mockClient());
  const { out, stream } = makeStream();
  await writingSample({ body: JSON.stringify({ essay: 'short' }) }, stream);
  assert.equal(out.status, 400);
});

test('/diagnostic happy path parses JSON', async () => {
  __setClientForTests(mockClient({ text: '{"weaknesses":["assumptions"],"strengths":["tone"],"recommendations":["drill"]}' }));
  const { out, stream } = makeStream();
  await diagnostic({
    body: JSON.stringify({ attempts: [{ questionId: 'lr-0001', correct: false, timeSpentMs: 1 }] })
  }, stream);
  assert.equal(out.status, 200);
  const body = JSON.parse(out.chunks.join(''));
  assert.ok(Array.isArray(body.weaknesses));
});

test('/diagnostic 400 on empty attempts', async () => {
  __setClientForTests(mockClient());
  const { out, stream } = makeStream();
  await diagnostic({ body: JSON.stringify({ attempts: [] }) }, stream);
  assert.equal(out.status, 400);
});

test('/coach streams SSE frames', async () => {
  __setClientForTests(mockClient({ streamDeltas: ['he', 'llo', ' world'] }));
  const { out, stream } = makeStream();
  await coach({
    body: JSON.stringify({
      questionId: 'lr-0001',
      stimulus: 's',
      choices: [{ label: 'A', text: 'a' }],
      correctAnswer: 'A',
      userMessage: 'hint me'
    })
  }, stream);
  const combined = out.chunks.join('');
  assert.ok(combined.includes('data:'));
  assert.ok(combined.includes('"delta":"he"'));
  assert.ok(combined.includes('[DONE]'));
});
