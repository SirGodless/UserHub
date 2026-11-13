import { initI18n, t } from "/assets/js/shared/i18n.js";
import { api } from "/assets/js/shared/api.js";

const $ = (id) => document.getElementById(id);

async function start() {
  await initI18n();
  const me = await api("GET", "/api/auth/me");
  if (me.ok) {
    $("name").textContent = me.data.username;
    $("signed-in").hidden = false;
  } else {
    $("signed-out").hidden = false;
  }
}

$("logout").addEventListener("click", async () => {
  await api("POST", "/api/auth/logout", {});
  location.href = "/login";
});

start();
