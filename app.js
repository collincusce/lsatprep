// Entry module. Loads store + bank, registers routes, kicks off the router.

import { initRouter, register, registerFallback, navigate } from './modules/router.js';
import { load as loadStore, subscribe as subscribeStore } from './modules/store.js';
import { loadBank } from './modules/bank.js';
import { renderHome } from './modules/views/home.js';
import { renderDrillSetup } from './modules/views/drill.js';
import { renderDrillSession } from './modules/views/drill-session.js';
import { renderTimedSetup, renderTimedSection } from './modules/views/timed-section.js';
import { renderTestSetup, renderTestSession } from './modules/views/test.js';
import { renderWriting } from './modules/views/writing.js';
import { renderResults } from './modules/views/results.js';
import { renderCoach } from './modules/views/coach.js';
import { renderProgress } from './modules/views/progress.js';
import { renderSettings } from './modules/views/settings.js';
import { renderAbout } from './modules/views/about.js';
import { renderNotFound } from './modules/views/not-found.js';
import { mountNav } from './modules/components/nav.js';
import { applyThemePreference } from './modules/theme.js';

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

function wrapHandler(fn) {
  return (ctx) => {
    const app = document.getElementById('app');
    app.innerHTML = '';
    mountNav(app, ctx);
    const main = document.createElement('main');
    app.appendChild(main);
    try {
      fn(main, ctx);
    } catch (err) {
      console.error('view render error', err);
      main.innerHTML = `<div class="card"><h2>Something went wrong</h2><pre>${String(err && err.stack || err)}</pre></div>`;
    }
  };
}

async function bootstrap() {
  const state = loadStore();
  applyThemePreference(state.preferences.theme);
  subscribeStore(s => applyThemePreference(s.preferences.theme));

  try {
    await loadBank();
  } catch (err) {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="card"><h2>Failed to load question bank</h2><p class="muted">${err.message}</p></div>`;
    return;
  }

  register(`${BASE}/`, wrapHandler(renderHome));
  register(`${BASE}/drill`, wrapHandler(renderDrillSetup));
  register(`${BASE}/drill/session`, wrapHandler(renderDrillSession));
  register(`${BASE}/timed`, wrapHandler(renderTimedSetup));
  register(`${BASE}/timed/section`, wrapHandler(renderTimedSection));
  register(`${BASE}/test`, wrapHandler(renderTestSetup));
  register(`${BASE}/test/session`, wrapHandler(renderTestSession));
  register(`${BASE}/writing`, wrapHandler(renderWriting));
  register(`${BASE}/results/:id`, wrapHandler(renderResults));
  register(`${BASE}/coach/:qid`, wrapHandler(renderCoach));
  register(`${BASE}/progress`, wrapHandler(renderProgress));
  register(`${BASE}/settings`, wrapHandler(renderSettings));
  register(`${BASE}/about`, wrapHandler(renderAbout));
  registerFallback(wrapHandler(renderNotFound));

  initRouter();
}

bootstrap();

// Register service worker. Only in production-like contexts (i.e. where
// the path includes /lsatprep/), to avoid noise during local dev.
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
