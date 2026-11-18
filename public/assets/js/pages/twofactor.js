// Seite "Zwei-Faktor-Anmeldung" (/account/2fa): einrichten, Wiederherstellungscodes erneuern, abschalten.
// Keine Geschäftslogik: Passwort und Codes prüft das Backend, die Seite zeigt Formulare und Antworten.
import { initI18n, onLangChange, t } from "/assets/js/shared/i18n.js";
import { api, setError } from "/assets/js/shared/api.js";
import { initPasswordToggles } from "/assets/js/shared/password-toggle.js";
import { renderQr } from "/assets/js/shared/qr.js";
import { showCodes, initCodeButtons } from "/assets/js/shared/recovery-codes.js";
import { initShell, redrawShell } from "/assets/js/shared/shell.js";

const $ = (id) => document.getElementById(id);
let me = null;
let recoveryCodes = [];
let status = null;

async function call(method, path, body) {
  const res = await api(method, path, body);
  if (res.status === 401 && res.data.error === "unauthenticated") location.href = "/login?continue=" + encodeURIComponent("/account/2fa");
  return res;
}

async function refresh() {
  const res = await call("GET", "/api/auth/2fa");
  if (!res.ok) return setError(t, "status", res.data.error || "server_error");
  status = res.data;
  draw();
}

// Zeigt je nach Zustand die passenden Teile
function draw() {
  $("status").textContent = status.enabled ? `${t("twofactor.status.on")} ${t("twofactor.status.codesLeft")}: ${status.recoveryCodesLeft}` : t("twofactor.status.off");
  $("mandatory").hidden = !status.mandatory;
  $("start-form").hidden = status.enabled || !$("confirm-form").hidden;
  $("manage").hidden = !status.enabled;
  // Wer Verwaltungsrechte hat, darf die 2FA nicht abschalten (das Backend lehnt es ebenfalls ab)
  $("disable-form").hidden = status.mandatory;
}

$("start-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "start-error", null);
  const res = await call("POST", "/api/auth/2fa/enrollment", { password: $("start-password").value });
  if (!res.ok) return setError(t, "start-error", res.data.error || "server_error");
  $("start-password").value = "";
  renderQr($("qr"), res.data.issuer, me.username, res.data.secret);
  $("secret").textContent = res.data.secret.match(/.{1,4}/g).join(" ");
  $("start-form").hidden = true;
  $("confirm-form").hidden = false;
  $("confirm-code").focus();
});

$("confirm-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "confirm-error", null);
  const res = await call("POST", "/api/auth/2fa/enrollment/confirm", { code: $("confirm-code").value.trim() });
  if (!res.ok) return setError(t, "confirm-error", res.data.error || "server_error");
  $("confirm-code").value = "";
  $("confirm-form").hidden = true;
  showNewCodes(res.data.recoveryCodes);
  await refresh();
});

$("regen-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "regen-error", null);
  const res = await call("POST", "/api/auth/2fa/recovery-codes", { password: $("regen-password").value, code: $("regen-code").value.trim() });
  if (!res.ok) return setError(t, "regen-error", res.data.error || "server_error");
  $("regen-password").value = "";
  $("regen-code").value = "";
  showNewCodes(res.data.recoveryCodes);
  await refresh();
});

$("disable-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "disable-error", null);
  if (!window.confirm(t("twofactor.disable.confirm"))) return;
  const res = await call("POST", "/api/auth/2fa/disable", { password: $("disable-password").value, code: $("disable-code").value.trim() });
  if (!res.ok) return setError(t, "disable-error", res.data.error || "server_error");
  $("disable-password").value = "";
  $("disable-code").value = "";
  $("codes-box").hidden = true;
  await refresh();
});

function showNewCodes(codes) {
  recoveryCodes = codes;
  showCodes($("codes"), codes);
  $("codes-box").hidden = false;
}

async function start() {
  await initI18n();
  initPasswordToggles();
  initCodeButtons($("copy"), $("download"), () => recoveryCodes);
  if (!(await initShell())) return;
  const res = await call("GET", "/api/auth/me");
  if (!res.ok) return;
  me = res.data;
  await refresh();
  onLangChange(() => { redrawShell(); if (status) draw(); });
}

start();
