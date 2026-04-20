const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

export function renderNotFound(mainEl, ctx) {
  mainEl.innerHTML = `
    <section class="card">
      <h2>Not found</h2>
      <p>No route for <code>${escapeHtml(ctx.path)}</code>.</p>
      <a href="${BASE}/">Go home</a>
    </section>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
