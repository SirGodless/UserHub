import { initI18n, t } from "/assets/js/i18n.js";
import { api, show, useViews, setError, tokenFromPath } from "/assets/js/api.js";

const $ = (id) => document.getElementById(id);
useViews(["state-loading", "state-invalid", "step-form", "step-done"]);
const token = tokenFromPath();

async function start() {
  await initI18n();
  const res = await api("GET", `/api/auth/password-reset/${encodeURIComponent(token)}`);
  show(res.ok ? "step-form" : "state-invalid");
}

$("step-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "error", null);
  if ($("password").value !== $("password2").value) return setError(t, "error", "password_mismatch");
  const res = await api("POST", "/api/auth/password-reset/confirm", { token, password: $("password").value });
  if (res.ok) {
    $("password").value = "";
    $("password2").value = "";
    return show("step-done");
  }
  const code = res.data.error || "server_error";
  if (code === "invalid_link") return show("state-invalid");
  setError(t, "error", code);
});

start();
