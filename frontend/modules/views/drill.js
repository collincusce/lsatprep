import { snapshot } from '../store.js';
import { bankSnapshot } from '../bank.js';

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

export function renderDrillSetup(mainEl) {
  const bank = bankSnapshot();
  const prefs = snapshot().preferences;
  const lrSubtypes = Object.keys(bank.byLRSubtype || {}).sort();
  const rcGenres = Object.keys(bank.byRCGenre || {}).sort();
  const lgFamilies = Object.keys(bank.byLGFamily || {}).sort();

  mainEl.innerHTML = `
    <section class="card">
      <h2>Drill setup</h2>
      <form id="drill-form" class="stack">
        <fieldset class="stack">
          <legend>Section</legend>
          <label><input type="radio" name="section" value="LR" checked> Logical Reasoning</label>
          <label><input type="radio" name="section" value="RC"> Reading Comprehension</label>
          <label><input type="radio" name="section" value="LG"${prefs.lgEnabled ? '' : ' disabled'}> Logic Games${prefs.lgEnabled ? '' : ' <span class="muted">(enable in Settings)</span>'}</label>
        </fieldset>

        <fieldset class="stack" data-group="LR">
          <legend>LR subtypes (optional — leave blank for all)</legend>
          ${lrSubtypes.map(s => `<label><input type="checkbox" name="subtype" value="${s}"> ${s.replace(/_/g, ' ')}</label>`).join('')}
        </fieldset>

        <fieldset class="stack" data-group="RC" hidden>
          <legend>RC genres</legend>
          ${rcGenres.map(g => `<label><input type="checkbox" name="genre" value="${g}"> ${g.replace(/_/g, ' ')}</label>`).join('')}
        </fieldset>

        <fieldset class="stack" data-group="LG" hidden>
          <legend>LG families</legend>
          ${lgFamilies.map(f => `<label><input type="checkbox" name="family" value="${f}"> ${f.replace(/_/g, ' ')}</label>`).join('')}
        </fieldset>

        <label>
          Difficulty
          <select name="difficulty">
            <option value="any">Any</option>
            <option value="1">1 (easy)</option>
            <option value="2">2 (medium)</option>
            <option value="3">3 (hard)</option>
          </select>
        </label>

        <label>
          Count
          <select name="count">
            <option>10</option><option>20</option><option>30</option>
          </select>
        </label>

        <button type="submit" class="primary">Start</button>
      </form>
    </section>
  `;

  const form = mainEl.querySelector('#drill-form');
  // Show the right fieldset per section choice.
  form.addEventListener('change', e => {
    if (e.target.name !== 'section') return;
    for (const fs of form.querySelectorAll('fieldset[data-group]')) {
      fs.hidden = fs.dataset.group !== e.target.value;
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const section = fd.get('section');
    const cfg = { section, count: Number(fd.get('count')) };
    if (section === 'LR') cfg.subtypes = fd.getAll('subtype');
    if (section === 'RC') cfg.genres = fd.getAll('genre');
    if (section === 'LG') cfg.families = fd.getAll('family');
    const d = fd.get('difficulty');
    if (d !== 'any') {
      cfg.difficultyMin = Number(d);
      cfg.difficultyMax = Number(d);
    }
    const encoded = btoa(JSON.stringify(cfg));
    window.history.pushState(null, '', `${BASE}/drill/session?cfg=${encoded}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}
