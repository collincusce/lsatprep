// Reads the user's theme preference and applies it to <html data-theme>.
// 'auto' removes the attribute and lets prefers-color-scheme decide.

export function applyThemePreference(pref) {
  const root = document.documentElement;
  if (pref === 'light' || pref === 'dark') {
    root.setAttribute('data-theme', pref);
  } else {
    root.removeAttribute('data-theme');
  }
}
