import { call, MODELS } from '../lib/anthropic.mjs';
import { HttpError, readJsonBody, respond } from '../lib/http.mjs';

const SYSTEM = `You are an expert LSAT tutor. A student has answered a multiple-choice LSAT question. Provide a concise, targeted explanation of why their chosen answer is wrong (if wrong), why the correct answer is right, and one small move that would have helped them spot the right answer under time pressure.

Rules:
- Keep the explanation under 250 words.
- No filler. No "great question". Go straight to the logic.
- Address their specific choice, not a generic review.
- If they got it right, briefly confirm the reasoning instead of re-explaining from scratch.
- Prose only. No bullet lists.`;

export async function explain(event, stream) {
  let body;
  try {
    body = await readJsonBody(event);
  } catch (err) {
    respond(stream, err.status || 400, { error: err.message });
    return;
  }
  const { questionId, stimulus, choices, correctAnswer, userAnswer } = body;
  if (!questionId || !choices || !correctAnswer) {
    respond(stream, 400, { error: 'missing required fields' });
    return;
  }

  const formatted = (choices || []).map(c => `  ${c.label}. ${c.text}`).join('\n');
  const user = `Question ID: ${questionId}
Stimulus:
${stimulus || '(no stimulus — RC/LG context is shared elsewhere)'}

Answer choices:
${formatted}

Correct answer: ${correctAnswer}
Student chose: ${userAnswer || '(no answer)'}

Explain.`;

  try {
    const { text } = await call({
      model: MODELS.haiku,
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
      maxTokens: 400,
      cacheSystem: true
    });
    respond(stream, 200, { explanation: text.trim() });
  } catch (err) {
    console.error('explain handler error', err);
    respond(stream, 502, { error: 'upstream AI error' });
  }
}
