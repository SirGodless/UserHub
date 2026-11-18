// Registrierung über einen Einladungslink (/invite/<token>). Keine Geschäftslogik: Das Backend prüft Link und Eingaben.
// Das bloße Öffnen verbraucht den Link nicht (GET prüft nur), erst das Absenden.
import { initI18n, getLang, t } from "/assets/js/shared/i18n.js";
import { api, show, useViews, setError, tokenFromPath } from "/assets/js/shared/api.js";
import { initPasswordToggles } from "/assets/js/shared/password-toggle.js";

const $ = (id) => document.getElementById(id);
useViews(["state-loading", "state-invalid", "state-blocked", "step-form", "step-done"]);
const token = tokenFromPath();
const base = `/api/invite/${encodeURIComponent(token)}`;

async function start() {
  await initI18n();
  initPasswordToggles();
  const res = await api("GET", base);
  if (res.ok) return show("step-form");
  show(res.data.error === "ip_blocked" ? "state-blocked" : "state-invalid");
}

$("step-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "error", null);
  if ($("password").value !== $("password2").value) return setError(t, "error", "password_mismatch");
  const res = await api("POST", `${base}/register`, {
    username: $("username").value, email: $("email").value, password: $("password").value, language: getLang(),
  });
  if (res.ok) {
    // Zugangsdaten sofort aus den Feldern entfernen
    $("password").value = "";
    $("password2").value = "";
    return show("step-done");
  }
  const code = res.data.error || "server_error";
  if (code === "invalid_link") return show("state-invalid");
  if (code === "ip_blocked") return show("state-blocked");
  setError(t, "error", code);
});

start();
