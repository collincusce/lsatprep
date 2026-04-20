import { call, MODELS } from '../lib/anthropic.mjs';
import { readJsonBody, respond } from '../lib/http.mjs';

const SYSTEM = `You are an LSAT Writing Sample grader. You evaluate an argumentative essay written in a 35-minute timed setting where the writer chose one of two options based on a scenario and considerations. The LSAT Writing Sample is ungraded on the real test, but law schools do read it; treat it with that weight.

Grade strictly but fairly on four criteria (1-5 each):
- organization (structure, flow, paragraphing)
- argumentStrength (use of considerations, handling counter-arguments)
- evidenceUse (how well the essay uses the provided facts)
- clarity (grammar, sentence construction, precision)

Also produce:
- grade: a letter grade A-F
- narrative: 2-3 paragraphs of candid feedback, pointing to specific passages from the essay.

OUTPUT FORMAT (strict JSON, no markdown fences, no commentary before or after):
{"grade":"B","rubric":{"organization":4,"argumentStrength":3,"evidenceUse":3,"clarity":4},"narrative":"..."}`;

export async function writingSample(event, stream) {
  let body;
  try { body = await readJsonBody(event); }
  catch (err) { respond(stream, err.status || 400, { error: err.message }); return; }
  const { promptId, essay } = body;
  if (!essay || essay.length < 50) { respond(stream, 400, { error: 'essay too short' }); return; }

  const user = `Prompt ID: ${promptId || '(unspecified)'}

Essay:
${essay}`;
  try {
    const { text } = await call({
      model: MODELS.opus,
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
      maxTokens: 1200,
      cacheSystem: true
    });
    let parsed;
    try { parsed = JSON.parse(text); }
    catch { parsed = { grade: 'unscored', rubric: {}, narrative: text.trim() }; }
    respond(stream, 200, parsed);
  } catch (err) {
    console.error('writing-sample handler error', err);
    respond(stream, 502, { error: 'upstream AI error' });
  }
}
