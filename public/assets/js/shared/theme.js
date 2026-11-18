// Darstellung: "system" (Einstellung des Geräts), "light" oder "dark". Die Wahl steht beim Konto (Profilseite) und wird
// zusätzlich im Browser gemerkt, damit auch die Seiten vor dem Login und der erste Aufbau ohne Aufblitzen passen.
// Klassisches Skript im head (läuft vor dem Zeichnen). Die Module benutzen window.UserHubTheme.
(function () {
  var root = document.documentElement;
  var query = matchMedia("(prefers-color-scheme: light)");

  function resolve(mode) {
    return mode === "light" || mode === "dark" ? mode : (query.matches ? "light" : "dark");
  }
  function stored() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }   // gesperrt: dann gilt das System
  }
  function apply(mode) {
    root.dataset.theme = resolve(mode);
  }
  apply(stored());
  // Folgt das Konto dem System, zieht ein Wechsel am Gerät sofort mit
  query.addEventListener("change", function () { if (!stored() || stored() === "system") apply("system"); });

  window.UserHubTheme = {
    set: function (mode) {
      try { localStorage.setItem("theme", mode); } catch (e) { /* egal */ }
      apply(mode);
    },
  };
})();
