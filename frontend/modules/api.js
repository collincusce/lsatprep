// Frontend wrapper for calls to the Lambda Function URL. The shared secret
// lives in config.js and is visible in the shipped JS — this is anti-drive-by
// obscurity, not real authentication. The Anthropic key stays in Lambda env vars.

import { CONFIG } from './config.js';

function url(path) {
  const base = (CONFIG.lambdaUrl || '').replace(/\/$/, '');
  return `${base}${path}`;
}

async function post(path, body, { stream = false } = {}) {
  const res = await fetch(url(path), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-lsatprep-token': CONFIG.sharedSecret || ''
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.text()).slice(0, 300); } catch {}
    if (res.status === 401) throw new ApiError('AI features are misconfigured (auth). Ask Collin to rerun deploy.', res.status);
    if (res.status === 429) throw new ApiError('Rate-limited — try again in a minute.', res.status);
    if (res.status >= 500) throw new ApiError('AI service is having a moment. Try again shortly.', res.status, detail);
    throw new ApiError(`Request failed (${res.status}): ${detail}`, res.status, detail);
  }
  if (stream) return res;
  return res.json();
}

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export function explain({ questionId, stimulus, choices, correctAnswer, userAnswer }) {
  return post('/explain', { questionId, stimulus, choices, correctAnswer, userAnswer });
}

export function gradeWriting({ promptId, essay }) {
  return post('/writing-sample', { promptId, essay });
}

export function runDiagnostic({ attempts }) {
  return post('/diagnostic', { attempts });
}

export async function* coach({ questionId, stimulus, choices, correctAnswer, history, userMessage, tier = 'haiku' }) {
  const res = await post('/coach', { questionId, stimulus, choices, correctAnswer, history, userMessage, tier }, { stream: true });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    // Parse SSE-style `data: {...}\n\n` frames.
    let idx;
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const frame = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 2);
      if (!frame.startsWith('data:')) continue;
      const payload = frame.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        if (json.delta) yield json.delta;
      } catch (err) {
        // Tolerate malformed frames; keep streaming.
        console.warn('coach: bad frame', payload);
      }
    }
  }
}
