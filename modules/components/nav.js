// Top navigation. Highlights the current section based on ctx.path.

const BASE = window.location.pathname.includes('/lsatprep/') ? '/lsatprep' : '';

const LINKS = [
  { href: `${BASE}/`, label: 'Home', match: /^\/?$/ },
  { href: `${BASE}/drill`, label: 'Drill', match: /^\/drill/ },
  { href: `${BASE}/timed`, label: 'Timed', match: /^\/timed/ },
  { href: `${BASE}/test`, label: 'Test', match: /^\/test/ },
  { href: `${BASE}/writing`, label: 'Writing', match: /^\/writing/ },
  { href: `${BASE}/progress`, label: 'Progress', match: /^\/progress/ },
  { href: `${BASE}/settings`, label: 'Settings', match: /^\/settings/ },
  { href: `${BASE}/about`, label: 'About', match: /^\/about/ }
];

export function mountNav(rootEl, ctx) {
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  const current = (ctx?.path || '/').replace(BASE, '') || '/';
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-brand" href="${BASE}/">LSAT Prep</a>
      <div class="nav-links">
        ${LINKS.map(l => {
          const active = l.match.test(current);
          return `<a href="${l.href}"${active ? ' class="active"' : ''}>${l.label}</a>`;
        }).join('')}
      </div>
    </div>
  `;
  rootEl.appendChild(nav);
}
