import { bankSnapshot } from '../bank.js';
import { pickQuestions, seededRng } from '../selector.js';
import { recordAttempt, recordSession, seenQuestionIds, snapshot } from '../store.js';
import { renderQuestionCard } from '../components/question-card.js';
import { rawToScaled } from '../score.js';

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

function uuid() { return 'id-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36); }

export function renderTestSetup(mainEl) {
  const prefs = snapshot().preferences;
  mainEl.innerHTML = `
    <section class="card">
      <h2>Full-length test</h2>
      <p>Four 35-minute sections with a 10-minute break between sections 2 and 3. End-of-test scoring. This closely simulates real LSAT pacing.</p>
      <p class="muted">With LG ${prefs.lgEnabled ? 'enabled' : 'disabled'}: sections will be 2× LR · 1× RC · 1× ${prefs.lgEnabled ? 'LG' : 'experimental LR'}.</p>
      <button class="primary" id="begin">Begin test</button>
    </section>
  `;
  mainEl.querySelector('#begin').addEventListener('click', () => {
    window.history.pushState(null, '', `${BASE}/test/session`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

function assembleTest(bank, prefs) {
  const seenIds = seenQuestionIds();
  const rng = seededRng(Date.now());
  const lr1 = pickQuestions({ bank, filters: { section: 'LR' }, count: 25, seenIds, rng });
  const lr2 = pickQuestions({ bank, filters: { section: 'LR' }, count: 25, seenIds, rng });
  const rc = pickQuestions({ bank, filters: { section: 'RC' }, count: 27, seenIds, rng });
  const fourth = prefs.lgEnabled
    ? pickQuestions({ bank, filters: { section: 'LG', lgEnabled: true }, count: 23, seenIds, rng })
    : pickQuestions({ bank, filters: { section: 'LR' }, count: 23, seenIds, rng });
  return [
    { name: 'Section 1 · LR', questions: lr1, durationMs: 35 * 60 * 1000, experimental: false },
    { name: 'Section 2 · LR', questions: lr2, durationMs: 35 * 60 * 1000, experimental: false },
    { name: 'Section 3 · RC', questions: rc, durationMs: 35 * 60 * 1000, experimental: false },
    { name: prefs.lgEnabled ? 'Section 4 · LG' : 'Section 4 · LR (experimental)', questions: fourth, durationMs: 35 * 60 * 1000, experimental: !prefs.lgEnabled }
  ];
}

export function renderTestSession(mainEl) {
  const bank = bankSnapshot();
  const prefs = snapshot().preferences;
  const sections = assembleTest(bank, prefs);
  const sessionId = uuid();
  const startedAt = new Date().toISOString();
  const answers = new Map(); // key: section index + question id

  let sectionIdx = 0;
  let onBreak = false;
  let questionIdx = 0;
  let sectionEndTime = 0;
  let interval;

  function startSection() {
    const section = sections[sectionIdx];
    sectionEndTime = Date.now() + section.durationMs;
    questionIdx = 0;
    renderSectionView();
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      if (Date.now() >= sectionEndTime) advanceSection();
      else updateTimer();
    }, 500);
  }

  function renderSectionView() {
    const section = sections[sectionIdx];
    const q = section.questions[questionIdx];
    if (!q) { advanceSection(); return; }
    mainEl.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'card spread';
    header.innerHTML = `<div><strong>${section.name}</strong> — ${questionIdx + 1}/${section.questions.length}</div><div class="timer" id="timer">--:--</div>`;
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
      initialSelection: answers.get(`${sectionIdx}-${q.id}`) || null,
      onSelect: (l) => answers.set(`${sectionIdx}-${q.id}`, l)
    });
    const nav = document.createElement('div');
    nav.className = 'row';
    nav.style.marginTop = 'var(--space-3)';
    nav.innerHTML = `
      <button ${questionIdx === 0 ? 'disabled' : ''} id="prev">← Previous</button>
      <button id="next">${questionIdx + 1 < section.questions.length ? 'Next →' : 'Finish section'}</button>
    `;
    mainEl.appendChild(nav);
    nav.querySelector('#prev').addEventListener('click', () => { questionIdx = Math.max(0, questionIdx - 1); renderSectionView(); });
    nav.querySelector('#next').addEventListener('click', () => {
      if (questionIdx + 1 < section.questions.length) { questionIdx++; renderSectionView(); }
      else advanceSection();
    });
    updateTimer();
  }

  function updateTimer() {
    const r = Math.max(0, sectionEndTime - Date.now());
    const el = document.getElementById('timer');
    if (el) {
      const m = Math.floor(r / 60000);
      const s = Math.floor((r % 60000) / 1000);
      el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  function advanceSection() {
    if (interval) { clearInterval(interval); interval = null; }
    sectionIdx++;
    if (sectionIdx === 2) { showBreak(); return; }
    if (sectionIdx >= sections.length) { finish(); return; }
    startSection();
  }

  function showBreak() {
    onBreak = true;
    const breakEnd = Date.now() + 10 * 60 * 1000;
    function r() {
      const rem = Math.max(0, breakEnd - Date.now());
      const m = Math.floor(rem / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      mainEl.innerHTML = `
        <div class="card">
          <h2>Break</h2>
          <p>10-minute break between sections 2 and 3. Stretch. Water.</p>
          <p class="timer">${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</p>
          <button id="skip-break">Skip break</button>
        </div>
      `;
      mainEl.querySelector('#skip-break').addEventListener('click', () => {
        onBreak = false;
        if (interval) { clearInterval(interval); interval = null; }
        startSection();
      });
      if (rem <= 0) { onBreak = false; if (interval) { clearInterval(interval); interval = null; } startSection(); }
    }
    r();
    if (interval) clearInterval(interval);
    interval = setInterval(() => { if (!onBreak) return; r(); }, 1000);
  }

  function finish() {
    const finishedAt = new Date().toISOString();
    let scoredCount = 0;
    let rawScore = 0;
    const questionIds = [];
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (section.experimental) continue;
      for (const q of section.questions) {
        questionIds.push(q.id);
        const chosen = answers.get(`${i}-${q.id}`) || null;
        const isCorrect = chosen && chosen === q.correctAnswer;
        if (isCorrect) rawScore++;
        scoredCount++;
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
    }
    const scaled = rawToScaled(rawScore);
    recordSession({
      id: sessionId,
      mode: 'full_test',
      startedAt,
      finishedAt,
      questionIds,
      score: rawScore,
      elapsedMs: Date.now() - new Date(startedAt).getTime(),
      meta: { scaled, scoredCount }
    });
    mainEl.innerHTML = `
      <div class="card">
        <h2>Test complete</h2>
        <p><strong>Raw:</strong> ${rawScore} / ${scoredCount}</p>
        <p><strong>Approx. scaled:</strong> ${scaled} <span class="muted">(approximation; not an official LSAC curve)</span></p>
        <a href="${BASE}/results/${encodeURIComponent(sessionId)}">Review answers</a>
      </div>
    `;
  }

  startSection();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
