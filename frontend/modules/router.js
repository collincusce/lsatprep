// Minimal hash-free History API router. Patterns support `:param` segments.
// Intercepts link clicks for same-origin hrefs, and popstate for back/forward.

const routes = [];
let fallback = null;
let initialized = false;
let popListener = null;
let clickListener = null;

function compile(pattern) {
  const parts = pattern.split('/').filter(Boolean);
  const keys = [];
  const regexParts = parts.map(p => {
    if (p.startsWith(':')) {
      keys.push(p.slice(1));
      return '([^/]+)';
    }
    return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  const re = new RegExp('^/' + regexParts.join('/') + '/?$');
  return { re, keys };
}

export function register(pattern, handler) {
  routes.push({ pattern, handler, ...compile(pattern) });
}

export function registerFallback(handler) {
  fallback = handler;
}

function matchRoute(path) {
  for (const r of routes) {
    const m = r.re.exec(path);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { route: r, params };
    }
  }
  return null;
}

function parseQuery(search) {
  const q = {};
  if (!search) return q;
  const s = search.startsWith('?') ? search.slice(1) : search;
  for (const pair of s.split('&')) {
    if (!pair) continue;
    const [k, v = ''] = pair.split('=');
    q[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return q;
}

function dispatch(pathWithQuery) {
  const [path, search = ''] = pathWithQuery.split('?');
  const matched = matchRoute(path);
  const query = parseQuery(search);
  if (matched) {
    matched.route.handler({ path, params: matched.params, query });
  } else if (fallback) {
    fallback({ path, params: {}, query });
  } else {
    console.warn('router: no route or fallback for', path);
  }
}

export function navigate(to, { replace = false } = {}) {
  if (!initialized) throw new Error('router: initRouter() must be called before navigate()');
  if (typeof history !== 'undefined' && history.pushState) {
    if (replace) history.replaceState(null, '', to);
    else history.pushState(null, '', to);
  }
  dispatch(to);
}

function onLinkClick(event) {
  if (event.defaultPrevented) return;
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const a = event.target?.closest?.('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href) return;
  // Only intercept same-origin relative hrefs.
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return; // absolute URLs
  if (href.startsWith('#')) return;
  if (a.target && a.target !== '_self') return;
  event.preventDefault();
  navigate(href);
}

export function initRouter({ skipInitial = false } = {}) {
  if (initialized) return;
  initialized = true;
  if (typeof window !== 'undefined' && window.addEventListener) {
    popListener = () => dispatch(window.location.pathname + window.location.search);
    window.addEventListener('popstate', popListener);
  }
  if (typeof document !== 'undefined' && document.addEventListener) {
    clickListener = onLinkClick;
    document.addEventListener('click', clickListener);
  }
  if (!skipInitial && typeof window !== 'undefined') {
    dispatch(window.location.pathname + window.location.search);
  }
}

export function __resetForTests() {
  routes.length = 0;
  fallback = null;
  initialized = false;
  popListener = null;
  clickListener = null;
}
