import { snapshot, setPreference, exportState, mergeImport, clear, subscribe } from '../store.js';
import { toast } from '../components/toast.js';
import { bankSnapshot } from '../bank.js';
import { applyThemePreference } from '../theme.js';

export function renderSettings(mainEl) {
  function render() {
    const state = snapshot();
    const prefs = state.preferences;
    mainEl.innerHTML = `
      <section class="card">
        <h2>Settings</h2>
        <div class="stack">
          <label><input type="checkbox" id="lg" ${prefs.lgEnabled ? 'checked' : ''}> Enable Logic Games mode</label>
          <label>
            Theme
            <select id="theme">
              <option value="auto" ${prefs.theme === 'auto' ? 'selected' : ''}>Auto (system)</option>
              <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>Light</option>
              <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>Dark</option>
            </select>
          </label>
        </div>
      </section>

      <section class="card">
        <h3>Data</h3>
        <div class="row">
          <button id="export">Export progress</button>
          <label class="choice" style="margin:0; cursor:pointer; display:inline-block; width:auto">
            Import progress <input type="file" id="import" accept="application/json" hidden>
          </label>
          <button id="clear">Clear all data</button>
        </div>
        <p class="muted" style="margin-top:var(--space-3)">${state.attempts.length} attempts · ${state.sessions.length} sessions · ${state.writingSamples.length} essays · ${state.coachThreads.length} coach threads</p>
      </section>

      <section class="card">
        <h3>Keyboard shortcuts</h3>
        <ul>
          <li><strong>A B C D E</strong> — select a choice</li>
          <li><strong>Enter</strong> / <strong>Space</strong> — submit or next</li>
        </ul>
      </section>
    `;

    mainEl.querySelector('#lg').addEventListener('change', e => setPreference('lgEnabled', e.target.checked));
    mainEl.querySelector('#theme').addEventListener('change', e => {
      setPreference('theme', e.target.value);
      applyThemePreference(e.target.value);
    });
    mainEl.querySelector('#export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(exportState(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lsatprep-export-${new Date().toISOString().slice(0,19).replace(/[:]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
    mainEl.querySelector('#import').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const incoming = JSON.parse(text);
        const bank = bankSnapshot();
        const knownIds = new Set(bank.allQuestions.map(q => q.id));
        const report = mergeImport(incoming, { knownQuestionIds: knownIds });
        toast(`Merged: +${report.attemptsAdded} attempts, dropped ${report.attemptsDroppedStale} stale`);
        render();
      } catch (err) {
        toast('Import failed: ' + err.message);
      }
    });
    mainEl.querySelector('#clear').addEventListener('click', () => {
      if (!confirm('This will delete all your progress. Continue?')) return;
      clear();
      toast('All data cleared.');
      render();
    });
  }
  render();
  const unsub = subscribe(() => render());
  // Unsubscribe when we navigate away; view lifecycle is not formal but this is best-effort.
  setTimeout(() => {
    const observer = new MutationObserver(() => {
      if (!document.body.contains(mainEl)) { unsub(); observer.disconnect(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }, 0);
}
