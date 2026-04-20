import { gradeWriting, ApiError } from '../api.js';
import { recordWritingSample } from '../store.js';
import { toast } from '../components/toast.js';

let promptsCache = null;
async function loadPrompts() {
  if (promptsCache) return promptsCache;
  const res = await fetch('./prompts.json');
  promptsCache = await res.json();
  return promptsCache;
}

function uuid() { return 'id-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36); }

export async function renderWriting(mainEl) {
  const promptsFile = await loadPrompts();
  const prompts = promptsFile.prompts || promptsFile;
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  const endTime = Date.now() + 35 * 60 * 1000;
  const startedAt = new Date().toISOString();
  let submitted = false;

  mainEl.innerHTML = `
    <section class="card">
      <h2>Writing Sample</h2>
      <p class="muted">35-minute timer. There is no right answer — take a position on the facts below and defend it.</p>
      <h3>${escapeHtml(prompt.title)}</h3>
      <p>${escapeHtml(prompt.scenario)}</p>
      <ul>${prompt.considerations.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
      <div class="grid">
        <div class="card" style="background: var(--color-surface-muted)"><h4>${escapeHtml(prompt.optionA.name)}</h4><p>${escapeHtml(prompt.optionA.description)}</p></div>
        <div class="card" style="background: var(--color-surface-muted)"><h4>${escapeHtml(prompt.optionB.name)}</h4><p>${escapeHtml(prompt.optionB.description)}</p></div>
      </div>
      <div class="spread" style="margin-top:var(--space-3)">
        <div class="timer" id="w-timer">35:00</div>
        <button class="primary" id="submit-essay">Submit for grading</button>
      </div>
      <label style="margin-top:var(--space-3)">
        Your essay
        <textarea id="essay" rows="18"></textarea>
      </label>
      <div id="grading-output"></div>
    </section>
  `;

  const timerEl = mainEl.querySelector('#w-timer');
  const interval = setInterval(() => {
    const r = Math.max(0, endTime - Date.now());
    const m = Math.floor(r / 60000);
    const s = Math.floor((r % 60000) / 1000);
    timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (r <= 0) clearInterval(interval);
  }, 500);

  mainEl.querySelector('#submit-essay').addEventListener('click', async () => {
    if (submitted) return;
    const essay = mainEl.querySelector('#essay').value.trim();
    if (essay.length < 50) { toast('Essay seems too short. Keep writing.'); return; }
    submitted = true;
    const out = mainEl.querySelector('#grading-output');
    out.innerHTML = `<div class="card"><p>Grading — this may take a moment…</p></div>`;
    try {
      const res = await gradeWriting({ promptId: prompt.id, essay });
      out.innerHTML = renderGrade(res);
      recordWritingSample({
        id: uuid(),
        promptId: prompt.id,
        text: essay,
        grade: res,
        timestamp: new Date().toISOString()
      });
      clearInterval(interval);
    } catch (err) {
      submitted = false;
      const msg = err instanceof ApiError ? err.message : 'Grading failed.';
      out.innerHTML = `<div class="card"><p>${escapeHtml(msg)}</p></div>`;
    }
  });
}

function renderGrade(res) {
  const r = res.rubric || {};
  return `
    <div class="card">
      <h3>Grade: ${escapeHtml(String(res.grade || '—'))}</h3>
      <ul>
        ${Object.entries(r).map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</li>`).join('')}
      </ul>
      <p>${escapeHtml(res.narrative || '')}</p>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
