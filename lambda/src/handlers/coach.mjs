import { callStream, MODELS } from '../lib/anthropic.mjs';
import { readJsonBody, writeSseHeaders, writeSseEvent, respond } from '../lib/http.mjs';

const SYSTEM = `You are an LSAT tutor having a focused, one-question conversation with a student. Meet them where they are: hint at what they missed rather than restating the explanation, ask short Socratic questions, only reveal full logic after they've tried. Never claim certainty about a model the LSAC hasn't published. Keep responses under 180 words unless the student explicitly asks for more depth.`;

export async function coach(event, stream) {
  let body;
  try { body = await readJsonBody(event); }
  catch (err) { respond(stream, err.status || 400, { error: err.message }); return; }
  const { questionId, stimulus, choices, correctAnswer, history = [], userMessage, tier = 'haiku' } = body;
  if (!questionId || !userMessage) {
    respond(stream, 400, { error: 'missing required fields' });
    return;
  }

  const model = tier === 'sonnet' ? MODELS.sonnet : MODELS.haiku;

  // Seed the conversation with the question as cached context.
  const questionContext = `Question under discussion:
Stimulus: ${stimulus || '(context shared elsewhere)'}

Choices:
${(choices || []).map(c => `  ${c.label}. ${c.text}`).join('\n')}

Correct answer (not to volunteer): ${correctAnswer || '(unknown)'}`;

  const messages = [
    { role: 'user', content: [{ type: 'text', text: questionContext, cache_control: { type: 'ephemeral' } }] },
    { role: 'assistant', content: 'Ready to help with this question.' },
    ...history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content || '' })),
    { role: 'user', content: userMessage }
  ];

  const out = writeSseHeaders(stream);
  try {
    for await (const delta of callStream({
      model,
      system: SYSTEM,
      messages,
      maxTokens: 500,
      cacheSystem: true
    })) {
      writeSseEvent(out, { delta });
    }
    writeSseEvent(out, '[DONE]');
    out.end();
  } catch (err) {
    console.error('coach handler error', err);
    try { writeSseEvent(out, { error: 'upstream AI error' }); } catch {}
    try { out.end(); } catch {}
  }
}
