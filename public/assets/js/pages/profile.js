// Profilseite (/account): Sprache des Kontos und Passwort ändern. Passwort und Regeln prüft das Backend.
import { initI18n, getLang, setLang, t } from "/assets/js/shared/i18n.js";
import { api, setError } from "/assets/js/shared/api.js";
import { initPasswordToggles } from "/assets/js/shared/password-toggle.js";
import { initShell, redrawShell } from "/assets/js/shared/shell.js";

const $ = (id) => document.getElementById(id);

async function start() {
  await initI18n();
  initPasswordToggles();
  const hub = await initShell();
  if (!hub) return;
  $("profile-language").value = getLang();
}

$("profile-language").addEventListener("change", async () => {
  const language = $("profile-language").value;
  $("language-saved").hidden = true;
  const res = await api("PUT", "/api/auth/language", { language });
  if (!res.ok) return;
  await setLang(language);
  redrawShell();
  $("language-saved").hidden = false;
});

$("password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "password-error", null);
  $("password-saved").hidden = true;
  const res = await api("POST", "/api/auth/password", { currentPassword: $("current").value, newPassword: $("new").value });
  if (!res.ok) return setError(t, "password-error", res.data.error || "server_error");
  $("current").value = "";
  $("new").value = "";
  $("password-saved").hidden = false;
});

start();
