// Darstellung setzen (system, light, dark): wirkt sofort und wird im Browser gemerkt. Die Logik steht in theme.js (head).
export function setTheme(mode) {
  window.UserHubTheme.set(mode);
}
