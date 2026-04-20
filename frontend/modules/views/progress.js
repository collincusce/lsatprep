import { snapshot } from '../store.js';
import { runDiagnostic, ApiError } from '../api.js';
import { toast } from '../components/toast.js';

const DIAGNOSTIC_COOLDOWN_MS = 10 * 60 * 1000;

export function renderProgress(mainEl) {
  const state = snapshot();
  const attempts = state.attempts;
  const bySection = group(attempts, a => sectionOf(a.questionId));
  const byDifficulty = group(attempts, a => a.questionId); // placeholder — no difficulty without bank lookup

  mainEl.innerHTML = `
    <section class="card">
      <h2>Progress</h2>
      <p class="muted">Accuracy by section. More slices coming when more data is accumulated.</p>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th align="left">Section</th><th align="left">Attempts</th><th align="left">Correct</th><th align="left">Accuracy</th></tr></thead>
        <tbody>
          ${Object.keys(bySection).sort().map(s => {
            const arr = bySection[s];
            const c = arr.filter(a => a.correct).length;
            const pct = arr.length ? Math.round((c / arr.length) * 100) : 0;
            return `<tr><td>${s}</td><td>${arr.length}</td><td>${c}</td><td>${pct}%</td></tr>`;
          }).join('') || '<tr><td colspan="4" class="muted">No attempts yet.</td></tr>'}
        </tbody>
      </table>
    </section>
    <section class="card">
      <h3>AI diagnostic</h3>
      <p class="muted">Sonnet 4.6 reviews your recent attempts and writes a weakness report.</p>
      <button class="primary" id="diag">Run diagnostic</button>
      <div id="diag-output" style="margin-top:var(--space-3)"></div>
    </section>
  `;

  const btn = mainEl.querySelector('#diag');
  btn.addEventListener('click', async () => {
    const lastRun = Number(localStorage.getItem('lsatprep:v1:diag-last') || 0);
    if (Date.now() - lastRun < DIAGNOSTIC_COOLDOWN_MS) {
      toast('Diagnostic is rate-limited to once every 10 minutes.');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Running…';
    const out = mainEl.querySelector('#diag-output');
    try {
      const res = await runDiagnostic({ attempts: attempts.slice(-500) });
      localStorage.setItem('lsatprep:v1:diag-last', String(Date.now()));
      out.innerHTML = `
        <div class="card">
          <h4>Weaknesses</h4><ul>${(res.weaknesses || []).map(w => `<li>${escapeHtml(String(w))}</li>`).join('')}</ul>
          <h4>Strengths</h4><ul>${(res.strengths || []).map(w => `<li>${escapeHtml(String(w))}</li>`).join('')}</ul>
          <h4>Recommendations</h4><ul>${(res.recommendations || []).map(w => `<li>${escapeHtml(String(w))}</li>`).join('')}</ul>
        </div>
      `;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Diagnostic failed.';
      out.innerHTML = `<div class="card"><p>${escapeHtml(msg)}</p></div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Run diagnostic';
    }
  });
}

function sectionOf(id) {
  if (id.startsWith('lr-')) return 'LR';
  if (id.startsWith('rc-')) return 'RC';
  if (id.startsWith('lg-')) return 'LG';
  return '?';
}

function group(arr, keyFn) {
  const o = {};
  for (const x of arr) (o[keyFn(x)] ||= []).push(x);
  return o;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
