import { call, MODELS } from '../lib/anthropic.mjs';
import { readJsonBody, respond } from '../lib/http.mjs';

const SYSTEM = `You are an LSAT diagnostic coach. Given a log of attempts, identify patterns: weak question types, struggling difficulty bands, suspected conceptual gaps. Be specific; back claims with the data in the log. Keep it under 500 words. Use LSAT vocabulary (necessary assumption vs. sufficient, strengthen vs. weaken, etc.).

OUTPUT FORMAT (strict JSON, no markdown fences, no commentary before or after):
{"weaknesses":["...","..."],"strengths":["..."],"recommendations":["..."]}`;

export async function diagnostic(event, stream) {
  let body;
  try { body = await readJsonBody(event); }
  catch (err) { respond(stream, err.status || 400, { error: err.message }); return; }
  const attempts = Array.isArray(body.attempts) ? body.attempts.slice(-500) : [];
  if (attempts.length === 0) { respond(stream, 400, { error: 'no attempts provided' }); return; }

  const summary = summarize(attempts);
  const user = `Attempt log (${attempts.length} entries, newest last):

${JSON.stringify(summary, null, 2)}`;
  try {
    const { text } = await call({
      model: MODELS.sonnet,
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
      maxTokens: 1200,
      cacheSystem: true
    });
    let parsed;
    try { parsed = JSON.parse(text); }
    catch { parsed = { weaknesses: [], strengths: [], recommendations: [text.trim()] }; }
    respond(stream, 200, parsed);
  } catch (err) {
    console.error('diagnostic handler error', err);
    respond(stream, 502, { error: 'upstream AI error' });
  }
}

function summarize(attempts) {
  const bySection = {};
  for (const a of attempts) {
    const s = sectionOf(a.questionId);
    (bySection[s] ||= { attempts: 0, correct: 0, byQuestion: [] });
    bySection[s].attempts++;
    if (a.correct) bySection[s].correct++;
    bySection[s].byQuestion.push({ id: a.questionId, correct: a.correct, timeMs: a.timeSpentMs });
  }
  return bySection;
}

function sectionOf(id) {
  if (!id) return '?';
  if (id.startsWith('lr-')) return 'LR';
  if (id.startsWith('rc-')) return 'RC';
  if (id.startsWith('lg-')) return 'LG';
  return '?';
}
