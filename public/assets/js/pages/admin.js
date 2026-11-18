// Admin-Dashboard: Rahmen mit Reitern. Welche Reiter es gibt, sagt das Backend (/api/admin/overview).
import { initI18n, onLangChange, t } from "/assets/js/shared/i18n.js";
import { api } from "/assets/js/shared/api.js";
import { state, notice } from "/assets/js/admin/ui.js";
import { h } from "/assets/js/shared/dom.js";
import { renderUsers } from "/assets/js/admin/users-list.js";
import { renderRoles } from "/assets/js/admin/roles.js";
import { renderPermissions } from "/assets/js/admin/permissions.js";
import { renderAudit } from "/assets/js/admin/audit.js";
import { renderLinks } from "/assets/js/admin/links.js";
import { renderSettings } from "/assets/js/admin/settings.js";

const $ = (id) => document.getElementById(id);
const renderers = { users: renderUsers, roles: renderRoles, permissions: renderPermissions, links: renderLinks, audit: renderAudit, settings: renderSettings };
let current = null;

function drawTabs() {
  $("tabs").replaceChildren(...state.sections.map((s) => h("button", {
    type: "button", class: s === current ? "tab active" : "tab", role: "tab", "aria-selected": String(s === current),
    text: t("admin.tab." + s), onclick: () => open(s),
  })));
}

async function open(section) {
  current = section;
  state.view++;
  location.hash = section;
  drawTabs();
  await renderers[section]($("panel"));
}

async function start() {
  await initI18n();
  const me = await api("GET", "/api/auth/me");
  if (!me.ok) { location.href = "/login?continue=" + encodeURIComponent("/admin"); return; }
  const overview = await api("GET", "/api/admin/overview");
  if (!overview.ok) { notice(t("error." + (overview.data.error || "server_error")), true); return; }
  state.sections = overview.data.sections;
  if (!overview.data.twoFactorEnabled && overview.data.isAdmin) $("twofactor-banner").hidden = false;
  if (!state.sections.length) { $("none").hidden = false; return; }
  const wanted = location.hash.slice(1);
  await open(state.sections.includes(wanted) ? wanted : state.sections[0]);
  onLangChange(() => { drawTabs(); if (current) renderers[current]($("panel")); });
}

$("logout").addEventListener("click", async () => {
  await api("POST", "/api/auth/logout", {});
  location.href = "/login";
});

start();
