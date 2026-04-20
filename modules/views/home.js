import { snapshot } from '../store.js';
import { bankSnapshot } from '../bank.js';

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

export function renderHome(mainEl) {
  const state = snapshot();
  const bank = bankSnapshot();
  const totalQ = bank?.allQuestions.length || 0;
  const attempts = state.attempts.length;
  const correct = state.attempts.filter(a => a.correct).length;
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : null;
  const lastSession = state.sessions[state.sessions.length - 1];

  mainEl.innerHTML = `
    <section class="card hero">
      <span class="kicker">LSAT prep · single user</span>
      <h1>Drill, pace, simulate. All in one place.</h1>
      <p class="muted" style="font-size:var(--text-lg);max-width:60ch">
        ${totalQ.toLocaleString()} questions across Logical Reasoning, Reading Comprehension, and Logic Games — with an AI coach, writing-sample grading, and diagnostic weakness reports when you want them.
      </p>
      <div class="row" style="margin-top:var(--space-4)">
        <a href="${BASE}/drill" style="text-decoration:none"><button class="primary">Start drilling →</button></a>
        <a href="${BASE}/test" style="text-decoration:none"><button class="ghost">Full-length test</button></a>
      </div>
    </section>

    <section class="grid" aria-label="Study modes">
      ${tile('Drill', 'Pick a section, subtype, and difficulty. Work through questions one at a time with instant feedback.', `${BASE}/drill`, 'Start drilling')}
      ${tile('Timed section', 'A single 35-minute section (LR, RC, or LG). No feedback until the end.', `${BASE}/timed`, 'Begin')}
      ${tile('Full-length test', 'Four sections back-to-back with a 10-minute break. End-of-test scoring.', `${BASE}/test`, 'Begin')}
      ${tile('Writing sample', 'Pick a prompt, write for 35 minutes, get AI-graded rubric feedback.', `${BASE}/writing`, 'Start writing')}
      ${tile('Progress', 'Weaknesses by type, difficulty, and section.', `${BASE}/progress`, 'View')}
      ${tile('Settings', 'Export / import progress. Dark mode, LG toggle.', `${BASE}/settings`, 'Open')}
    </section>

    <section class="card">
      <h3 style="margin-bottom:var(--space-4)">Your stats</h3>
      <div class="spread">
        ${stat(totalQ.toLocaleString(), 'questions available')}
        ${stat(attempts.toLocaleString(), 'attempts')}
        ${stat(accuracy == null ? '—' : accuracy + '%', 'accuracy')}
        ${stat(lastSession ? new Date(lastSession.startedAt).toLocaleDateString() : '—', 'last session')}
      </div>
    </section>
  `;
}

function tile(title, desc, href, cta) {
  return `
    <a class="card tile" href="${href}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:0">
      <h3 style="margin:0">${title}</h3>
      <p class="muted" style="margin:0">${desc}</p>
      <span style="color:var(--color-accent);margin-top:auto;font-weight:500">${cta} →</span>
    </a>
  `;
}

function stat(value, label) {
  return `
    <div>
      <strong>${value}</strong>
      <span class="soft" style="font-size:var(--text-sm)">${label}</span>
    </div>
  `;
}
