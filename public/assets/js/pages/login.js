import { initPasswordToggles } from "/assets/js/shared/password-toggle.js";
import { initI18n, t } from "/assets/js/shared/i18n.js";
import { api, show, useViews, setError } from "/assets/js/shared/api.js";
import { afterLoginTarget } from "/assets/js/shared/redirect.js";

const $ = (id) => document.getElementById(id);
useViews(["step-password", "step-code"]);

async function start() {
  await initI18n();
  initPasswordToggles();
  const me = await api("GET", "/api/auth/me"); // holt auch das CSRF-Cookie
  if (me.ok) location.href = afterLoginTarget();
}

$("step-password").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "password-error", null);
  const res = await api("POST", "/api/auth/login", {
    identifier: $("identifier").value,
    password: $("password").value,
    rememberMe: $("remember").checked,
  });
  if (res.ok && res.data.status === "totp_required") {
    $("password").value = "";
    show("step-code");
    $("code").focus();
  } else if (res.ok) {
    location.href = afterLoginTarget();
  } else {
    const code = res.data.error || "server_error";
    setError(t, "password-error", code);
    if (code === "email_not_verified") $("resend-box").hidden = false;
  }
});

$("step-code").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "code-error", null);
  const res = await api("POST", "/api/auth/login/second-factor", { code: $("code").value });
  if (res.ok) return (location.href = afterLoginTarget());
  const code = res.data.error || "server_error";
  if (code === "no_pending_login") {
    setError(t, "password-error", code);
    return show("step-password");
  }
  setError(t, "code-error", code);
});

$("resend-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "resend-error", null);
  $("resend-done").hidden = true;
  const res = await api("POST", "/api/auth/resend-confirmation", { email: $("resend-email").value });
  if (res.ok) $("resend-done").hidden = false;
  else setError(t, "resend-error", res.data.error || "server_error");
});

start();
