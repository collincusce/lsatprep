// Post-answer feedback block: correctness banner, correct letter, and
// explanations (the pre-generated correct-answer explanation plus the
// user's wrong-choice explanation if applicable). "Explain more" calls
// the Lambda /explain endpoint for a tailored follow-up.

import { explain, ApiError } from '../api.js';
import { toast } from './toast.js';

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

export function renderFeedback(parentEl, { question, userAnswer }) {
  const correct = userAnswer === question.correctAnswer;
  const el = document.createElement('div');
  el.className = 'card feedback';
  el.innerHTML = `
    <h3 style="color: var(--color-${correct ? 'correct' : 'incorrect'})">${correct ? 'Correct' : 'Incorrect'}</h3>
    <p class="muted">Correct answer: <strong>${question.correctAnswer}</strong></p>
    <p><strong>Why:</strong> ${escapeHtml(question.explanations?.correct || '(no explanation on file)')}</p>
    ${!correct && question.explanations?.[userAnswer] ? `
      <p><strong>About your choice (${userAnswer}):</strong> ${escapeHtml(question.explanations[userAnswer])}</p>
    ` : ''}
    <div class="row" style="margin-top: var(--space-3)">
      <button type="button" class="explain-more">Explain more</button>
      <a href="${BASE}/coach/${encodeURIComponent(question.id)}">Open coach</a>
    </div>
    <div class="tailored" style="margin-top: var(--space-3)"></div>
  `;
  parentEl.appendChild(el);

  const explainBtn = el.querySelector('.explain-more');
  const tailored = el.querySelector('.tailored');
  explainBtn.addEventListener('click', async () => {
    explainBtn.disabled = true;
    explainBtn.textContent = 'Thinking…';
    try {
      const res = await explain({
        questionId: question.id,
        stimulus: question.stimulus || '',
        choices: question.choices,
        correctAnswer: question.correctAnswer,
        userAnswer
      });
      tailored.innerHTML = `<div class="card" style="background: var(--color-surface-muted)"><p>${escapeHtml(res.explanation || '')}</p></div>`;
      explainBtn.textContent = 'Explain again';
      explainBtn.disabled = false;
    } catch (err) {
      explainBtn.disabled = false;
      explainBtn.textContent = 'Explain more';
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch explanation.';
      toast(msg);
    }
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
