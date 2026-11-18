// Seite "Einladungslinks" (/account/links): eigene Links erstellen, ansehen, deaktivieren. Ob jemand das darf,
// entscheidet das Backend. Der Link wird nur einmal angezeigt (gespeichert ist nur ein Hash).
import { initI18n, onLangChange, getLang, t } from "/assets/js/shared/i18n.js";
import { api } from "/assets/js/shared/api.js";
import { h } from "/assets/js/shared/dom.js";
import { formatTime } from "/assets/js/shared/time.js";
import { describeGrants, describeStatus } from "/assets/js/shared/grants.js";

const $ = (id) => document.getElementById(id);
let options = null;
let links = [];

function notice(text, isError = false) {
  $("notice").textContent = text;
  $("notice").className = isError ? "error" : "success";
}

async function call(method, path, body) {
  const res = await api(method, path, body);
  if (res.status === 401) location.href = "/login?continue=" + encodeURIComponent("/account/links");
  return res;
}

const showError = (res) => notice(t("error." + (res.data.error || "server_error")), true);

async function load() {
  const [o, l] = await Promise.all([call("GET", "/api/invites/options"), call("GET", "/api/invites")]);
  if (!o.ok) return showError(o);
  options = o.data;
  links = l.ok ? l.data : [];
  draw();
}

function limitText() {
  const max = options.maxActive;
  const maxText = max.unlimited ? t("links.unlimited") : String(max.set ? max.number : 0);
  return `${t("links.open")}: ${options.activeCount} ${t("links.of")} ${maxText}`;
}

function draw() {
  $("cannot").hidden = options.canCreate;
  $("create-form").hidden = !options.canCreate;
  $("usage").textContent = options.canCreate ? limitText() : "";
  if (options.canCreate) drawForm();
  drawList();
}

function drawForm() {
  const lim = options.limits;
  $("validity-hint").textContent = t("links.new.validityHint", { min: lim.minHours, max: lim.maxDays, default: lim.defaultDays });
  $("privileged-hint").textContent = t("links.new.privilegedHint", { days: lim.privilegedMaxDays });
  const keep = $("role").value;
  $("role").replaceChildren(h("option", { value: "", text: t("links.new.noRole") }),
    ...options.grantableRoles.map((r) => h("option", { value: r.id, text: r.name })));
  $("role").value = keep;
  $("rights-box").hidden = !options.grantablePermissions.length;
  const checked = new Set([...document.querySelectorAll("#rights input[type=checkbox]:checked")].map((c) => c.dataset.key));
  $("rights").replaceChildren(...options.grantablePermissions.map((d) => {
    const box = h("input", { type: "checkbox", "data-key": d.key });
    box.checked = checked.has(d.key);
    const row = h("label", { class: "check" }, box, h("span", { text: d.description ? `${d.key} (${d.description})` : d.key }));
    if (d.type === "number") {
      const num = h("input", { type: "number", min: "0", step: "1", class: "narrow", "data-number-for": d.key, "aria-label": d.key });
      row.append(num);
      if (d.allowUnlimited && d.direction === "higher") {
        row.append(h("label", { class: "check inline" }, h("input", { type: "checkbox", "data-unlimited-for": d.key }), h("span", { text: t("links.unlimited") })));
      }
    }
    return row;
  }));
}

function selectedGrants() {
  return [...document.querySelectorAll("#rights input[data-key]:checked")].map((box) => {
    const key = box.dataset.key;
    const num = document.querySelector(`[data-number-for="${key}"]`);
    const unlimited = document.querySelector(`[data-unlimited-for="${key}"]`);
    return { key, number: num && num.value !== "" ? Number(num.value) : null, unlimited: Boolean(unlimited && unlimited.checked) };
  });
}

$("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  notice("");
  const validity = $("validity").value;
  const res = await call("POST", "/api/invites", {
    validityHours: validity === "" ? null : Number(validity),
    roleId: $("role").value || null,
    permissions: selectedGrants(),
  });
  if (!res.ok) return showError(res);
  $("created-url").textContent = res.data.url;
  $("created").hidden = false;
  $("copy").textContent = t("links.copy");
  await load();
});

$("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("created-url").textContent);
    $("copy").textContent = t("links.copied");
  } catch { /* Zwischenablage nicht erlaubt: Nutzer kann den Link markieren */ }
});

function drawList() {
  if (!links.length) return $("list").replaceChildren(h("p", { class: "muted", text: t("links.empty") }));
  const head = ["created", "expires", "status", "role", "rights", "usedBy", "actions"]
    .map((c) => h("th", { scope: "col", text: t("links.col." + c) }));
  const rows = links.map((l) => h("tr", {},
    h("td", { text: formatTime(l.createdAt, getLang()) }), h("td", { text: formatTime(l.expiresAt, getLang()) }),
    h("td", { text: describeStatus(l) }), h("td", { text: l.role || t("links.none") }),
    h("td", { text: describeGrants([...l.rolePermissions, ...l.permissions]) }), h("td", { text: l.usedBy || "" }),
    h("td", {}, l.status === "active" ? h("button", { type: "button", class: "small danger", text: t("links.deactivate"), onclick: async () => {
      if (!window.confirm(t("links.confirmDeactivate"))) return;
      const r = await call("POST", `/api/invites/${l.id}/deactivate`, {});
      r.ok ? load() : showError(r);
    } }) : null)));
  $("list").replaceChildren(h("div", { class: "table-wrap" }, h("table", {}, h("thead", {}, h("tr", {}, head)), h("tbody", {}, rows))));
}

async function start() {
  await initI18n();
  await load();
  onLangChange(() => { if (options) draw(); });
}

start();
