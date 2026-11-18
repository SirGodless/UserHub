// Startseite nach dem Login: Dienste mit Status, Kennzahlen und Konto-Zeilen. Welche Dienste sichtbar sind und ob sie laufen,
// entscheidet das Backend. Der Status wird alle 30 Sekunden neu geholt (das Backend prüft die Dienste alle 60 Sekunden).
import { initI18n, onLangChange, getLang, t } from "/assets/js/shared/i18n.js";
import { api } from "/assets/js/shared/api.js";
import { h } from "/assets/js/shared/dom.js";
import { initShell, redrawShell } from "/assets/js/shared/shell.js";
import { applyServiceColor } from "/assets/js/shared/service-color.js";

const $ = (id) => document.getElementById(id);
let hub = null;

async function start() {
  await initI18n();
  hub = await initShell();
  if (!hub) return;
  draw();
  onLangChange(() => { redrawShell(); draw(); });
  setInterval(refresh, 30000);
}

async function refresh() {
  const res = await api("GET", "/api/hub");
  if (res.ok) { hub = res.data; redrawShell(); draw(); }
}

function ago(iso) {
  if (!iso) return t("hub.checked.never");
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const rtf = new Intl.RelativeTimeFormat(getLang(), { numeric: "auto" });
  return seconds < 60 ? rtf.format(-seconds, "second") : rtf.format(-Math.round(seconds / 60), "minute");
}

function draw() {
  const services = hub.services;
  $("stat-services").textContent = String(services.length);
  $("stat-online").textContent = String(services.filter((s) => s.status === "up").length);
  const down = services.filter((s) => s.status === "down").length;
  $("stat-offline").textContent = String(down);
  $("stat-offline").className = down ? "warn" : "";
  $("stat-links").textContent = linksText();

  $("empty").hidden = services.length > 0;
  $("services-wrap").hidden = services.length === 0;
  $("services").replaceChildren(...services.map(serviceRow));
  $("account-rows").replaceChildren(...accountRows());
}

function maxText(max) {
  if (max.unlimited) return t("hub.account.links.unlimited");
  return String(max.set ? max.number : 0);
}

function linksText() {
  const a = hub.account;
  return a.canCreateLinks ? `${a.activeLinks} / ${maxText(a.maxActiveLinks)}` : "-";
}

function serviceRow(s) {
  const row = h("tr", {});
  const name = h("td", { class: "name" }, h("span", { class: "svc-name" }, h("span", { class: "svc-swatch", "aria-hidden": "true" }), s.name),
    s.description ? h("small", { text: s.description }) : null);
  const status = h("td", {}, h("span", { class: `tag ${s.status}`, text: t("shell.status." + s.status) }));
  const checked = h("td", { class: "mono", text: ago(s.checkedAt) });
  // Ein nicht erreichbarer Dienst bleibt öffenbar (die Prüfung kann irren), der Knopf ist dann nur umrandet.
  const open = s.url
    ? h("a", { class: "btn svc" + (s.status === "down" ? " outline" : ""), href: s.url, target: "_blank", rel: "noopener noreferrer", text: t("hub.open") })
    : h("span", { class: "btn svc disabled", "aria-disabled": "true", title: t("hub.noUrl"), text: t("hub.open") });
  const action = h("td", { class: "act" }, open);
  row.append(name, status, checked, action);
  applyServiceColor(row, s.accentColor);
  return row;
}

function accountRows() {
  const a = hub.account;
  const rows = [
    h("a", { class: "row", href: "/account/2fa" }, h("b", { text: t("hub.account.twofactor") }),
      h("span", { class: "val " + (a.twoFactorEnabled ? "ok" : "down"), text: t(a.twoFactorEnabled ? "hub.account.twofactor.on" : "hub.account.twofactor.off") })),
  ];
  if (a.canCreateLinks) {
    rows.push(h("a", { class: "row", href: "/account/links" }, h("b", { text: t("hub.account.links") }),
      h("span", { class: "val", text: `${a.activeLinks} ${t("hub.account.links.of")} ${maxText(a.maxActiveLinks)}` })));
  }
  rows.push(h("a", { class: "row", href: "/account" }, h("b", { text: t("hub.account.password") })));
  if (a.isAdmin) {
    rows.push(h("a", { class: "row", href: "/admin" }, h("b", { text: t("hub.account.admin") }), h("span", { class: "val", text: t("hub.account.admin.value") })));
    if (hub.mail) {
      rows.push(h("div", { class: "row" }, h("b", { text: t("hub.account.mail") }),
        h("span", { class: `tag ${hub.mail.status}`, text: t("shell.status." + hub.mail.status) })));
    }
  }
  return rows;
}

start();
