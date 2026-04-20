import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const listeners = new Map();
globalThis.window = {
  addEventListener: (type, fn) => {
    const arr = listeners.get(type) || [];
    arr.push(fn);
    listeners.set(type, arr);
  },
  removeEventListener: (type, fn) => {
    const arr = (listeners.get(type) || []).filter(x => x !== fn);
    listeners.set(type, arr);
  },
  location: { pathname: '/', search: '', hash: '' }
};
globalThis.history = {
  _stack: [],
  pushState: function (state, _, url) {
    const u = new URL(url, 'http://localhost');
    window.location.pathname = u.pathname;
    window.location.search = u.search;
    this._stack.push({ state, url });
  },
  replaceState: function (state, _, url) {
    const u = new URL(url, 'http://localhost');
    window.location.pathname = u.pathname;
    window.location.search = u.search;
  }
};
globalThis.document = {
  addEventListener: () => {},
  querySelector: () => null
};

const router = await import('./router.js');

beforeEach(() => {
  router.__resetForTests();
  window.location.pathname = '/';
  window.location.search = '';
  history._stack = [];
});

test('register + navigate matches a simple path', () => {
  let called = null;
  router.register('/drill', (ctx) => { called = ctx; });
  router.initRouter({ skipInitial: true });
  router.navigate('/drill');
  assert.ok(called);
  assert.equal(called.path, '/drill');
});

test('navigate with query parses query params', () => {
  let ctx;
  router.register('/drill/session', (c) => { ctx = c; });
  router.initRouter({ skipInitial: true });
  router.navigate('/drill/session?cfg=abc&count=10');
  assert.equal(ctx.query.cfg, 'abc');
  assert.equal(ctx.query.count, '10');
});

test('path params are captured with :param syntax', () => {
  let ctx;
  router.register('/results/:id', (c) => { ctx = c; });
  router.initRouter({ skipInitial: true });
  router.navigate('/results/session-42');
  assert.equal(ctx.params.id, 'session-42');
});

test('unknown route falls through to fallback handler', () => {
  let fallback = null;
  router.registerFallback(() => { fallback = 'hit'; });
  router.initRouter({ skipInitial: true });
  router.navigate('/nonexistent');
  assert.equal(fallback, 'hit');
});

test('initRouter dispatches the current path when not skipped', () => {
  let hit = null;
  router.register('/', () => { hit = 'home'; });
  window.location.pathname = '/';
  router.initRouter();
  assert.equal(hit, 'home');
});
