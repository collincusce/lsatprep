import { bankSnapshot } from '../bank.js';
import { pickQuestions, seededRng } from '../selector.js';
import { recordAttempt, recordSession, seenQuestionIds, snapshot } from '../store.js';
import { renderQuestionCard } from '../components/question-card.js';

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

function uuid() { return 'id-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36); }

export function renderTimedSetup(mainEl) {
  const prefs = snapshot().preferences;
  mainEl.innerHTML = `
    <section class="card">
      <h2>Timed section</h2>
      <p class="muted">35-minute clock, no immediate feedback, scoring at the end.</p>
      <form id="timed-form" class="stack">
        <fieldset class="stack">
          <legend>Section</legend>
          <label><input type="radio" name="section" value="LR" checked> Logical Reasoning (~25 questions)</label>
          <label><input type="radio" name="section" value="RC"> Reading Comprehension (~27 questions, 4 passages)</label>
          <label><input type="radio" name="section" value="LG"${prefs.lgEnabled ? '' : ' disabled'}> Logic Games (~23 questions, 4 games)${prefs.lgEnabled ? '' : ' <span class="muted">(enable in Settings)</span>'}</label>
        </fieldset>
        <button type="submit" class="primary">Begin timed section</button>
      </form>
    </section>
  `;
  mainEl.querySelector('#timed-form').addEventListener('submit', e => {
    e.preventDefault();
    const section = new FormData(e.target).get('section');
    window.history.pushState(null, '', `${BASE}/timed/section?section=${section}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

export function renderTimedSection(mainEl, ctx) {
  const bank = bankSnapshot();
  const section = ctx.query.section || 'LR';
  const count = section === 'LR' ? 25 : section === 'RC' ? 27 : 23;
  const questions = pickQuestions({
    bank,
    filters: { section, lgEnabled: snapshot().preferences.lgEnabled },
    count,
    seenIds: seenQuestionIds(),
    rng: seededRng(Date.now())
  });

  if (questions.length === 0) {
    mainEl.innerHTML = '<div class="card"><p>Not enough questions in this section yet.</p></div>';
    return;
  }

  const sessionId = uuid();
  const startedAt = new Date().toISOString();
  const endTime = Date.now() + 35 * 60 * 1000;
  const answers = new Map();
  let index = 0;
  let finished = false;
  let interval;

  function render() {
    if (finished) return;
    const q = questions[index];
    mainEl.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'card spread';
    header.innerHTML = `
      <div><strong>Timed ${section}</strong> — ${index + 1} / ${questions.length}</div>
      <div class="timer" id="timer">--:--</div>
    `;
    mainEl.appendChild(header);

    if (q.section === 'RC' && q.passageId) {
      const passage = bank.passages.get(q.passageId);
      if (passage) {
        const p = document.createElement('div');
        p.className = 'card passage';
        p.innerHTML = `<h3>Passage</h3><div>${escapeHtml(passage.passage)}</div>`;
        mainEl.appendChild(p);
      }
    }
    if (q.section === 'LG' && q.gameId) {
      const game = bank.games.get(q.gameId);
      if (game) {
        const s = document.createElement('div');
        s.className = 'card passage';
        s.innerHTML = `<h3>Scenario</h3><div>${escapeHtml(game.scenario)}</div>`;
        mainEl.appendChild(s);
      }
    }
    renderQuestionCard(mainEl, {
      question: q,
      initialSelection: answers.get(q.id) || null,
      onSelect: (label) => { answers.set(q.id, label); }
    });
    const nav = document.createElement('div');
    nav.className = 'row';
    nav.style.marginTop = 'var(--space-3)';
    nav.innerHTML = `
      <button ${index === 0 ? 'disabled' : ''} id="prev">← Previous</button>
      <button id="next">${index + 1 < questions.length ? 'Next →' : 'Finish'}</button>
      <span class="muted" style="margin-left:auto">${answers.size} / ${questions.length} answered</span>
    `;
    mainEl.appendChild(nav);
    nav.querySelector('#prev').addEventListener('click', () => { index = Math.max(0, index - 1); render(); });
    nav.querySelector('#next').addEventListener('click', () => {
      if (index + 1 < questions.length) { index++; render(); } else { finish(false); }
    });
    updateTimer();
  }

  function updateTimer() {
    const remaining = Math.max(0, endTime - Date.now());
    const el = document.getElementById('timer');
    if (el) {
      const min = Math.floor(remaining / 60000);
      const sec = Math.floor((remaining % 60000) / 1000);
      el.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
    if (remaining <= 0) finish(true);
  }

  function finish(timedOut) {
    if (finished) return;
    finished = true;
    if (interval) clearInterval(interval);
    let correct = 0;
    const finishedAt = new Date().toISOString();
    for (const q of questions) {
      const chosen = answers.get(q.id) || null;
      const isCorrect = chosen && chosen === q.correctAnswer;
      if (isCorrect) correct++;
      recordAttempt({
        id: uuid(),
        questionId: q.id,
        sessionId,
        chosenAnswer: chosen,
        correct: !!isCorrect,
        timeSpentMs: 0,
        timestamp: finishedAt
      });
    }
    recordSession({
      id: sessionId,
      mode: 'timed_section',
      startedAt,
      finishedAt,
      questionIds: questions.map(q => q.id),
      score: correct,
      elapsedMs: Date.now() - new Date(startedAt).getTime(),
      meta: { section, timedOut }
    });
    window.history.pushState(null, '', `${BASE}/results/${encodeURIComponent(sessionId)}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render();
  interval = setInterval(updateTimer, 500);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
