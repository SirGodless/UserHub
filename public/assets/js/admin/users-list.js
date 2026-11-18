// Dashboard "Benutzer": Suche und Liste. Ein Klick öffnet die Detailansicht.
import { h } from "/assets/js/shared/dom.js";
import { t, getLang } from "/assets/js/shared/i18n.js";
import { call, showError, clearNotice, formatTime, state, isStale } from "/assets/js/admin/ui.js";
import { renderUserDetail } from "/assets/js/admin/users-detail.js";

let query = "";

export async function renderUsers(panel) {
  clearNotice();
  const view = state.view;
  const res = await call("GET", "/api/admin/users?q=" + encodeURIComponent(query));
  if (isStale(view)) return;
  if (!res.ok) return showError(res);

  const search = h("input", { type: "text", id: "user-search", value: query, "aria-label": t("users.search") });
  const form = h("form", { class: "toolbar", onsubmit: (e) => { e.preventDefault(); query = search.value; renderUsers(panel); } },
    search, h("button", { type: "submit", text: t("users.searchButton") }));

  const rows = res.data.map((u) => h("tr", {},
    h("td", {}, h("button", { type: "button", class: "link", text: u.username, onclick: () => renderUserDetail(panel, u.id, () => renderUsers(panel)) })),
    h("td", { text: u.email || "" }),
    h("td", { text: u.roles }),
    h("td", { text: u.hasTotp ? t("users.yes") : t("users.no") }),
    h("td", {}, h("span", { class: u.banned ? "badge danger" : "badge", text: u.banned ? t("users.status.banned") : t("users.status.active") })),
    h("td", { text: formatTime(u.createdAt, getLang()) })));

  const table = h("table", {},
    h("thead", {}, h("tr", {}, ["username", "email", "roles", "twofactor", "status", "created"]
      .map((c) => h("th", { scope: "col", text: t("users.col." + c) })))),
    h("tbody", {}, rows));
  panel.replaceChildren(h("h2", { text: t("users.title") }), form,
    res.data.length ? h("div", { class: "table-wrap" }, table) : h("p", { class: "muted", text: t("users.empty") }));
}
