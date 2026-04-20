import { bankSnapshot } from '../bank.js';
import { snapshot, recordCoachThread } from '../store.js';
import { coach, ApiError } from '../api.js';
import { toast } from '../components/toast.js';

function uuid() { return 'id-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36); }

export function renderCoach(mainEl, ctx) {
  const qid = ctx.params.qid;
  const bank = bankSnapshot();
  const q = bank.byId.get(qid);
  if (!q) {
    mainEl.innerHTML = `<div class="card"><p>Question not found.</p></div>`;
    return;
  }
  const existing = snapshot().coachThreads.find(t => t.questionId === qid);
  const threadId = existing?.id || uuid();
  const messages = existing ? [...existing.messages] : [];
  let tier = 'haiku';

  mainEl.innerHTML = `
    <section class="card">
      <h2>Coach</h2>
      <p class="muted">One question at a time. Haiku for most; toggle to Sonnet when you need harder help.</p>
      <details><summary>Show question</summary><pre style="white-space:pre-wrap">${escapeHtml(q.stimulus || '')}\n\n${escapeHtml(q.questionStem)}\n${q.choices.map(c => c.label + '. ' + c.text).join('\n')}</pre></details>
      <div id="thread" class="stack" style="margin-top:var(--space-3)"></div>
      <form id="coach-form" class="stack" style="margin-top:var(--space-3)">
        <textarea name="msg" rows="3" placeholder="Ask for a hint, a walkthrough, or a comparison of two choices…"></textarea>
        <div class="row">
          <button type="submit" class="primary">Send</button>
          <label><input type="checkbox" id="sonnet"> Sonnet (harder help)</label>
        </div>
      </form>
    </section>
  `;

  const threadEl = mainEl.querySelector('#thread');
  const form = mainEl.querySelector('#coach-form');
  const sonnetToggle = mainEl.querySelector('#sonnet');
  sonnetToggle.addEventListener('change', () => { tier = sonnetToggle.checked ? 'sonnet' : 'haiku'; });

  function renderThread() {
    threadEl.innerHTML = messages.map(m => `
      <div class="card" style="background: ${m.role === 'user' ? 'var(--color-surface-muted)' : 'var(--color-surface)'}">
        <strong>${m.role === 'user' ? 'You' : 'Coach'}:</strong>
        <div style="white-space:pre-wrap">${escapeHtml(m.content || '')}</div>
      </div>
    `).join('');
    threadEl.scrollTop = threadEl.scrollHeight;
  }
  renderThread();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const userMessage = (fd.get('msg') || '').toString().trim();
    if (!userMessage) return;
    messages.push({ role: 'user', content: userMessage });
    messages.push({ role: 'assistant', content: '' });
    renderThread();
    form.querySelector('textarea').value = '';

    const history = messages.slice(0, -2);
    try {
      for await (const delta of coach({
        questionId: q.id,
        stimulus: q.stimulus || '',
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        history,
        userMessage,
        tier
      })) {
        messages[messages.length - 1].content += delta;
        renderThread();
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Coach stream failed.';
      messages[messages.length - 1].content = `(${msg})`;
      toast(msg);
      renderThread();
    }
    recordCoachThread({ id: threadId, questionId: qid, messages, timestamp: new Date().toISOString() });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
