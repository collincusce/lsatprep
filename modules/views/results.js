import { snapshot } from '../store.js';
import { bankSnapshot } from '../bank.js';

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

export function renderResults(mainEl, ctx) {
  const id = ctx.params.id;
  const state = snapshot();
  const bank = bankSnapshot();
  const session = state.sessions.find(s => s.id === id);
  if (!session) {
    mainEl.innerHTML = `<div class="card"><p>Session not found.</p></div>`;
    return;
  }
  const attempts = state.attempts.filter(a => a.sessionId === id);
  const correct = attempts.filter(a => a.correct).length;
  const rows = attempts.map(a => {
    const q = bank.byId.get(a.questionId);
    const stem = q ? q.questionStem : '(question missing)';
    return `
      <tr>
        <td>${escapeHtml(a.questionId)}</td>
        <td>${escapeHtml(stem.slice(0, 80))}${stem.length > 80 ? '…' : ''}</td>
        <td>${escapeHtml(a.chosenAnswer || '—')}</td>
        <td>${a.correct ? '✓' : '✗'}</td>
        <td><a href="${BASE}/coach/${encodeURIComponent(a.questionId)}">Coach</a></td>
      </tr>
    `;
  }).join('');
  mainEl.innerHTML = `
    <section class="card">
      <h2>Results</h2>
      <p><strong>${correct} / ${attempts.length}</strong> correct · mode: ${escapeHtml(session.mode)}</p>
      ${session.meta?.scaled ? `<p>Approx. scaled: <strong>${session.meta.scaled}</strong></p>` : ''}
    </section>
    <section class="card">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr><th align="left">ID</th><th align="left">Question</th><th align="left">Answer</th><th align="left">✓/✗</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
