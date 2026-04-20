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
    <section class="card">
      <h1>LSAT Prep</h1>
      <p class="muted">A comprehensive study kit. Drill individual question types, take timed sections or full-length tests, practice the Writing Sample, and chat with an AI coach about any question.</p>
    </section>
    <section class="grid" aria-label="Study modes">
      ${tile('Drill', 'Pick a section + subtype + difficulty and work through them one at a time with instant feedback.', `${BASE}/drill`, 'Start drilling')}
      ${tile('Timed section', 'A single 35-minute section (LR, RC, or LG). No feedback until the end.', `${BASE}/timed`, 'Begin')}
      ${tile('Full-length test', 'Four sections back-to-back with a 10-minute break. End-of-test scoring.', `${BASE}/test`, 'Begin')}
      ${tile('Writing sample', 'Pick a prompt, write for 35 minutes, get AI-graded rubric feedback.', `${BASE}/writing`, 'Start writing')}
      ${tile('Progress', 'Weaknesses by type, difficulty, section.', `${BASE}/progress`, 'View')}
      ${tile('Settings', 'Export / import your progress. Dark mode, LG toggle.', `${BASE}/settings`, 'Open')}
    </section>
    <section class="card">
      <h3>Your stats</h3>
      <div class="spread">
        <div><strong>${totalQ}</strong> <span class="muted">questions available</span></div>
        <div><strong>${attempts}</strong> <span class="muted">attempts</span></div>
        <div><strong>${accuracy == null ? '—' : accuracy + '%'}</strong> <span class="muted">accuracy</span></div>
        <div><strong>${lastSession ? new Date(lastSession.startedAt).toLocaleDateString() : '—'}</strong> <span class="muted">last session</span></div>
      </div>
    </section>
  `;
}

function tile(title, desc, href, cta) {
  return `
    <a class="card tile" href="${href}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:var(--space-2)">
      <h3 style="margin:0">${title}</h3>
      <p class="muted" style="margin:0">${desc}</p>
      <span style="color:var(--color-accent);margin-top:auto;font-weight:500">${cta} →</span>
    </a>
  `;
}
