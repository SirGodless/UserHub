// Setup-Seite für den ersten Admin. Keine Geschäftslogik: Das Backend prüft alles.
// Die Seite zeigt nur Formular, QR-Code und die Wiederherstellungscodes.
import { initPasswordToggles } from "/assets/js/shared/password-toggle.js";
import { initI18n, getLang, t } from "/assets/js/shared/i18n.js";
import { renderQr } from "/assets/js/shared/qr.js";
import { showCodes, initCodeButtons } from "/assets/js/shared/recovery-codes.js";

const token = location.pathname.split("/")[2] || "";
const api = (path) => `/api/setup/${encodeURIComponent(token)}${path}`;
const $ = (id) => document.getElementById(id);

const views = ["state-loading", "state-invalid", "step-account", "step-totp", "step-done"];
function show(id) {
  for (const v of views) $(v).hidden = v !== id;
}

// Fehler als Code merken, damit sie beim Sprachwechsel neu übersetzt werden
function setError(elId, code) {
  const el = $(elId);
  if (code) {
    el.dataset.errorCode = code;
    el.textContent = t("error." + code);
  } else {
    delete el.dataset.errorCode;
    el.textContent = "";
  }
}

async function call(path, options) {
  try {
    const res = await fetch(api(path), { cache: "no-store", ...options });
    let data = {};
    try { data = await res.json(); } catch { /* leere Antwort */ }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "network" } };
  }
}

const account = { username: "", email: "", password: "" };
let secret = "";

// --- Start: Link prüfen ---
async function start() {
  await initI18n();
  initPasswordToggles();
  const res = await call("");
  show(res.ok ? "step-account" : "state-invalid");
}

// --- Schritt 1 -> 2 ---
$("step-account").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError("account-error", null);
  if ($("password").value !== $("password2").value) {
    setError("account-error", "password_mismatch");
    return;
  }
  account.username = $("username").value;
  account.email = $("email").value;
  account.password = $("password").value;

  const res = await call("/prepare", { method: "POST" });
  if (!res.ok) {
    if (res.data.error === "invalid_link") return show("state-invalid");
    return setError("account-error", res.data.error || "server_error");
  }
  secret = res.data.secret;
  renderQr($("qr"), res.data.issuer, account.username.trim().toLowerCase(), secret);
  $("secret").textContent = secret.match(/.{1,4}/g).join(" ");
  $("totp").value = "";
  setError("totp-error", null);
  show("step-totp");
  $("totp").focus();
});

$("totp-back").addEventListener("click", () => show("step-account"));

// --- Schritt 2 -> 3 ---
$("step-totp").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError("totp-error", null);
  const res = await call("/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: account.username,
      email: account.email,
      password: account.password,
      language: getLang(),
      totpCode: $("totp").value.trim(),
    }),
  });
  if (res.ok) {
    // Zugangsdaten sofort aus dem Speicher und den Feldern entfernen
    account.password = "";
    $("password").value = "";
    $("password2").value = "";
    renderCodes(res.data.recoveryCodes);
    return show("step-done");
  }
  const code = res.data.error || "server_error";
  if (code === "invalid_link") return show("state-invalid");
  if (code === "totp_code_invalid") return setError("totp-error", code);
  // Alles andere betrifft die Angaben aus Schritt 1
  setError("account-error", code);
  show("step-account");
});

// --- Schritt 3 ---
let recoveryCodes = [];
function renderCodes(codes) {
  recoveryCodes = codes;
  showCodes($("codes"), codes);
}
initCodeButtons($("copy"), $("download"), () => recoveryCodes);

// Weiter erst, wenn bestätigt wurde, dass die Codes gesichert sind
$("saved").addEventListener("change", () => {
  $("next").setAttribute("aria-disabled", String(!$("saved").checked));
});
$("next").addEventListener("click", (e) => {
  if (!$("saved").checked) e.preventDefault();
});

start();
