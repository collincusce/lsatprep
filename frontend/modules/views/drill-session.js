import { pickQuestions, seededRng } from '../selector.js';
import { bankSnapshot } from '../bank.js';
import { recordAttempt, recordSession, seenQuestionIds, snapshot } from '../store.js';
import { renderQuestionCard } from '../components/question-card.js';
import { renderFeedback } from '../components/feedback.js';

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

function uuid() { return 'id-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36); }

export function renderDrillSession(mainEl, ctx) {
  const bank = bankSnapshot();
  let cfg;
  try {
    cfg = JSON.parse(atob(ctx.query.cfg || ''));
  } catch {
    mainEl.innerHTML = '<div class="card"><p>Invalid drill configuration. <a href="' + BASE + '/drill">Start over</a>.</p></div>';
    return;
  }

  const seed = Date.now();
  const questions = pickQuestions({
    bank,
    filters: {
      section: cfg.section,
      subtypes: cfg.subtypes,
      genres: cfg.genres,
      families: cfg.families,
      difficultyMin: cfg.difficultyMin,
      difficultyMax: cfg.difficultyMax,
      lgEnabled: snapshot().preferences.lgEnabled
    },
    count: cfg.count || 10,
    seenIds: seenQuestionIds(),
    rng: seededRng(seed)
  });

  if (questions.length === 0) {
    mainEl.innerHTML = '<div class="card"><p>No questions match those filters. <a href="' + BASE + '/drill">Back</a>.</p></div>';
    return;
  }

  const sessionId = uuid();
  const startedAt = new Date().toISOString();
  let index = 0;
  let correctCount = 0;
  let questionStart = Date.now();

  function renderCurrent() {
    mainEl.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'card spread';
    header.innerHTML = `<div><strong>Drill · ${cfg.section}</strong></div><div class="muted">Question ${index + 1} / ${questions.length}</div>`;
    mainEl.appendChild(header);

    const q = questions[index];
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
        s.innerHTML = `<h3>Scenario</h3><div>${escapeHtml(game.scenario)}</div><h4 style="margin-top:var(--space-3)">Rules</h4><ol>${(game.rules || []).map(r => `<li>${escapeHtml(formatRule(r))}</li>`).join('')}</ol>`;
        mainEl.appendChild(s);
      }
    }

    questionStart = Date.now();
    let card;
    card = renderQuestionCard(mainEl, {
      question: q,
      onSelect: (label) => {
        card.setDisabled(true);
        const elapsed = Date.now() - questionStart;
        const isCorrect = label === q.correctAnswer;
        if (isCorrect) correctCount++;
        card.markCorrectness(q.correctAnswer, label);
        recordAttempt({
          id: uuid(),
          questionId: q.id,
          sessionId,
          chosenAnswer: label,
          correct: isCorrect,
          timeSpentMs: elapsed,
          timestamp: new Date().toISOString()
        });
        renderFeedback(mainEl, { question: q, userAnswer: label });

        const actions = document.createElement('div');
        actions.className = 'row';
        actions.style.marginTop = 'var(--space-3)';
        actions.innerHTML = `
          ${index + 1 < questions.length ? '<button class="primary next-btn">Next →</button>' : '<button class="primary next-btn">Finish</button>'}
          <a href="${BASE}/drill">Exit</a>
        `;
        mainEl.appendChild(actions);
        const nextBtn = actions.querySelector('.next-btn');
        nextBtn.addEventListener('click', advance);

        setKeyboard(nextBtn);
      }
    });

    setKeyboard(null, q, card);
  }

  function setKeyboard(nextBtn, q, card) {
    const handler = (e) => {
      const k = e.key?.toUpperCase?.();
      if (card && ['A', 'B', 'C', 'D', 'E'].includes(k)) {
        const btn = mainEl.querySelector(`.choice[data-label="${k}"]`);
        if (btn && !btn.disabled) btn.click();
      } else if (nextBtn && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        nextBtn.click();
      }
    };
    document.removeEventListener('keydown', mainEl._drillKey || (() => {}));
    mainEl._drillKey = handler;
    document.addEventListener('keydown', handler);
  }

  function advance() {
    index++;
    if (index >= questions.length) {
      finish();
      return;
    }
    renderCurrent();
  }

  function finish() {
    recordSession({
      id: sessionId,
      mode: 'drill',
      startedAt,
      finishedAt: new Date().toISOString(),
      questionIds: questions.map(q => q.id),
      score: correctCount,
      elapsedMs: Date.now() - new Date(startedAt).getTime(),
      cfg
    });
    mainEl.innerHTML = `
      <div class="card">
        <h2>Drill complete</h2>
        <p><strong>${correctCount} / ${questions.length}</strong> correct.</p>
        <div class="row">
          <a class="primary" href="${BASE}/results/${encodeURIComponent(sessionId)}" style="padding:var(--space-2) var(--space-4); background:var(--color-accent); color:var(--color-accent-fg); border-radius:var(--radius-md); text-decoration:none">Review answers</a>
          <a href="${BASE}/drill">Drill again</a>
          <a href="${BASE}/">Home</a>
        </div>
      </div>
    `;
  }

  renderCurrent();
}

function formatRule(r) {
  switch (r.type) {
    case 'at': return `${r.entity} is in position ${r.position}.`;
    case 'not_at': return `${r.entity} is NOT in position ${r.position}.`;
    case 'before': return `${r.a} is before ${r.b}.`;
    case 'after': return `${r.a} is after ${r.b}.`;
    case 'adjacent': return `${r.a} and ${r.b} are adjacent.`;
    case 'not_adjacent': return `${r.a} and ${r.b} are not adjacent.`;
    case 'same_group': return `${r.a} and ${r.b} are in the same group.`;
    case 'different_group': return `${r.a} and ${r.b} are in different groups.`;
    case 'exactly_one_of': return `Exactly one of ${r.entities.join(', ')} is in position ${r.position}.`;
    case 'conditional': return `If ${formatRule(r.ifRule)} then ${formatRule(r.thenRule)}`.replace(/\.\s*then/, ', then ').replace(/\.$/, '.');
    default: return JSON.stringify(r);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
