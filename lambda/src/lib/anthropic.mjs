// Thin wrapper around @anthropic-ai/sdk. Single place to build clients,
// attach prompt-caching beta, and expose call/callStream helpers.

import Anthropic from '@anthropic-ai/sdk';

const CACHE_BETA = 'prompt-caching-2024-07-31';

let _client = null;
export function client() {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  _client = new Anthropic({ apiKey, defaultHeaders: { 'anthropic-beta': CACHE_BETA } });
  return _client;
}

// For tests.
export function __setClientForTests(c) { _client = c; }
export function __resetClientForTests() { _client = null; }

function buildSystem(system, { cacheSystem = true } = {}) {
  if (system == null) return undefined;
  if (!cacheSystem) return system;
  if (typeof system === 'string') {
    return [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }];
  }
  return system;
}

export async function call({ model, system, messages, maxTokens = 1024, cacheSystem = true, temperature }) {
  const res = await client().messages.create({
    model,
    system: buildSystem(system, { cacheSystem }),
    messages,
    max_tokens: maxTokens,
    ...(temperature != null ? { temperature } : {})
  });
  const text = (res.content || [])
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('');
  return { text, raw: res };
}

export async function* callStream({ model, system, messages, maxTokens = 1024, cacheSystem = true, temperature }) {
  const stream = await client().messages.stream({
    model,
    system: buildSystem(system, { cacheSystem }),
    messages,
    max_tokens: maxTokens,
    ...(temperature != null ? { temperature } : {})
  });
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      yield event.delta.text || '';
    }
  }
}

export const MODELS = {
  // Keep in sync with memory/project_lsatprep.md.
  opus: 'claude-opus-4-7',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5-20251001'
};
