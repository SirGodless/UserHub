// Rahmen nach dem Login: Seitenmenü mit den Diensten des Users, Konto-Links, Name und Abmelden.
// Welche Dienste und Links es gibt, entscheidet das Backend (/api/hub). Ohne Anmeldung geht es zum Login zurück.
import { api } from "/assets/js/shared/api.js";
import { h } from "/assets/js/shared/dom.js";
import { t, getLang, setLang } from "/assets/js/shared/i18n.js";
import { applyServiceColor } from "/assets/js/shared/service-color.js";
import { setTheme } from "/assets/js/shared/theme-setting.js";

// Gibt die Hub-Daten zurück (oder null, wenn nicht angemeldet) und zeichnet das Seitenmenü.
export async function initShell() {
  const res = await api("GET", "/api/hub");
  if (res.status === 401) {
    location.href = "/login?continue=" + encodeURIComponent(location.pathname);
    return null;
  }
  if (!res.ok) return null;
  // Die Oberfläche folgt Darstellung und Sprache des Kontos
  setTheme(res.data.account.theme);
  if (res.data.account.language !== getLang()) await setLang(res.data.account.language);
  drawSidebar(res.data);
  return res.data;
}

let lastHub = null;
export function redrawShell() {
  if (lastHub) drawSidebar(lastHub);
}

function navLink(href, text, current) {
  return h("a", { href, class: current ? "current" : null, "aria-current": current ? "page" : null }, h("span", { text }));
}

function serviceLink(s) {
  const dot = h("span", { class: `dot ${s.status}`, title: t("shell.status." + s.status), role: "img", "aria-label": t("shell.status." + s.status) });
  const link = h("a", { class: "service", href: s.url || null, target: s.url ? "_blank" : null, rel: s.url ? "noopener noreferrer" : null },
    h("span", { class: "svc-name" }, h("span", { class: "svc-swatch", "aria-hidden": "true" }), h("span", { text: s.name })), dot);
  applyServiceColor(link, s.accentColor);
  return link;
}

function drawSidebar(hub) {
  lastHub = hub;
  const here = location.pathname;
  const a = hub.account;
  const side = document.getElementById("sidebar");
  const services = hub.services.length ? hub.services.map(serviceLink) : [h("p", { class: "muted small side-note", text: t("shell.noServices") })];
  side.replaceChildren(
    h("a", { class: "brand", href: "/", text: "UserHub" }),
    h("p", { class: "side-title", text: t("shell.services") }),
    h("nav", { "aria-label": t("shell.services") }, services),
    h("p", { class: "side-title", text: t("shell.account") }),
    h("nav", { "aria-label": t("shell.account") },
      navLink("/", t("shell.nav.overview"), here === "/"),
      navLink("/account", t("shell.nav.profile"), here === "/account"),
      a.canCreateLinks || here === "/account/links" ? navLink("/account/links", t("shell.nav.links"), here === "/account/links") : null,
      navLink("/account/2fa", t("shell.nav.twofactor"), here === "/account/2fa"),
      a.isAdmin ? navLink("/admin", t("shell.nav.admin"), here === "/admin") : null),
    h("div", { class: "grow" }),
    h("div", { class: "me" }, h("span", { text: a.username }),
      h("button", { type: "button", class: "secondary small", text: t("action.logout"), onclick: async () => {
        await api("POST", "/api/auth/logout", {});
        location.href = "/login";
      } })));
}
