// Nur für das Mockup: Hell/Dunkel umschalten und merken. Die echte UI macht das später genauso über data-theme.
(function () {
  var root = document.documentElement, saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { /* egal */ }
  root.dataset.theme = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-theme]");
    if (!b) return;
    root.dataset.theme = b.dataset.setTheme;
    try { localStorage.setItem("theme", b.dataset.setTheme); } catch (err) { /* egal */ }
    sync();
  });
  function sync() {
    document.querySelectorAll("[data-set-theme]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.setTheme === root.dataset.theme)); });
  }
  document.addEventListener("DOMContentLoaded", sync);
})();
