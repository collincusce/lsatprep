import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifySharedSecret, corsHeaders, respond, readJsonBody } from './http.mjs';

test('verifySharedSecret accepts matching token', () => {
  process.env.SHARED_SECRET = 'abc123';
  assert.equal(verifySharedSecret({ headers: { 'x-lsatprep-token': 'abc123' } }), true);
});

test('verifySharedSecret is case-insensitive on header name', () => {
  process.env.SHARED_SECRET = 'abc123';
  assert.equal(verifySharedSecret({ headers: { 'X-LSATPrep-Token': 'abc123' } }), true);
});

test('verifySharedSecret rejects wrong token', () => {
  process.env.SHARED_SECRET = 'abc123';
  assert.equal(verifySharedSecret({ headers: { 'x-lsatprep-token': 'wrong' } }), false);
});

test('verifySharedSecret rejects missing header', () => {
  process.env.SHARED_SECRET = 'abc123';
  assert.equal(verifySharedSecret({ headers: {} }), false);
});

test('corsHeaders reflects ALLOWED_ORIGIN', () => {
  process.env.ALLOWED_ORIGIN = 'https://example.com';
  const h = corsHeaders();
  assert.equal(h['Access-Control-Allow-Origin'], 'https://example.com');
  assert.ok(h['Access-Control-Allow-Headers'].toLowerCase().includes('x-lsatprep-token'));
});

test('respond writes status + json + ends stream', () => {
  const events = [];
  const stream = {
    writeHead: (s, h) => events.push({ type: 'head', status: s, headers: h }),
    write: (chunk) => events.push({ type: 'write', chunk }),
    end: () => events.push({ type: 'end' })
  };
  respond(stream, 200, { ok: true });
  assert.equal(events[0].status, 200);
  assert.equal(events[0].headers['content-type'], 'application/json');
  assert.ok(events.find(e => e.type === 'write' && e.chunk.includes('"ok":true')));
  assert.ok(events.find(e => e.type === 'end'));
});

test('readJsonBody parses base64-encoded body', async () => {
  const raw = JSON.stringify({ a: 1 });
  const event = { body: Buffer.from(raw).toString('base64'), isBase64Encoded: true };
  const body = await readJsonBody(event);
  assert.equal(body.a, 1);
});

test('readJsonBody parses raw body', async () => {
  const event = { body: JSON.stringify({ a: 2 }), isBase64Encoded: false };
  const body = await readJsonBody(event);
  assert.equal(body.a, 2);
});
