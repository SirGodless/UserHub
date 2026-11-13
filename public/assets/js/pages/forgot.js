import { initI18n, t } from "/assets/js/shared/i18n.js";
import { api, setError } from "/assets/js/shared/api.js";

const $ = (id) => document.getElementById(id);

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(t, "error", null);
  $("sent").hidden = true;
  const res = await api("POST", "/api/auth/password-reset/request", { email: $("email").value });
  // Die Antwort ist absichtlich immer gleich, egal ob es die Adresse gibt
  if (res.ok) $("sent").hidden = false;
  else setError(t, "error", res.data.error || "server_error");
});

initI18n();
