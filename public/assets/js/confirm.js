import { initI18n, t } from "/assets/js/i18n.js";
import { api, show, useViews, setError, tokenFromPath } from "/assets/js/api.js";

const $ = (id) => document.getElementById(id);
useViews(["state-loading", "state-invalid", "step-confirm", "step-done"]);
const token = tokenFromPath();

async function start() {
  await initI18n();
  // Nur prüfen, nicht verbrauchen: Mail-Scanner und Vorschauen öffnen Links automatisch.
  const res = await api("GET", `/api/auth/confirm-email/${encodeURIComponent(token)}`);
  show(res.ok ? "step-confirm" : "state-invalid");
}

$("confirm").addEventListener("click", async () => {
  setError(t, "error", null);
  const res = await api("POST", "/api/auth/confirm-email", { token });
  if (res.ok) return show("step-done");
  const code = res.data.error || "server_error";
  if (code === "invalid_link") return show("state-invalid");
  setError(t, "error", code);
});

start();
