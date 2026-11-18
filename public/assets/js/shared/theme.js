// Hell oder Dunkel: Die Wahl wird im Browser gemerkt, ohne Wahl gilt die Einstellung des Systems.
// Klassisches Skript im head, damit die Seite nicht kurz in der falschen Farbe aufblitzt.
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { /* gesperrt: dann gilt die Systemwahl */ }
  root.dataset.theme = saved === "light" || saved === "dark" ? saved : (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  function sync() {
    document.querySelectorAll("[data-set-theme]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.setTheme === root.dataset.theme));
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-theme]");
    if (!b) return;
    root.dataset.theme = b.dataset.setTheme;
    try { localStorage.setItem("theme", b.dataset.setTheme); } catch (err) { /* egal */ }
    sync();
  });
  document.addEventListener("DOMContentLoaded", sync);
})();
