// Tiny toast queue. Call toast('message') to show a 3s message at the bottom.

let current = null;
let timer = null;

export function toast(msg, { durationMs = 3000 } = {}) {
  if (current) {
    current.remove();
    if (timer) clearTimeout(timer);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  // Trigger the transition.
  requestAnimationFrame(() => el.classList.add('visible'));
  current = el;
  timer = setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => {
      if (current === el) current = null;
      el.remove();
    }, 250);
  }, durationMs);
}
