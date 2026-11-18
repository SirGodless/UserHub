// Dashboard "Links": alle Einladungslinks (nur ansehen und deaktivieren, den Token gibt es nicht mehr).
import { h } from "/assets/js/shared/dom.js";
import { t, getLang } from "/assets/js/shared/i18n.js";
import { call, showError, clearNotice, formatTime, state, isStale } from "/assets/js/admin/ui.js";
import { describeGrants, describeStatus } from "/assets/js/shared/grants.js";

export async function renderLinks(panel) {
  clearNotice();
  const view = state.view;
  const res = await call("GET", "/api/admin/invites");
  if (isStale(view)) return;
  if (!res.ok) return showError(res);
  const head = ["creator", "created", "expires", "status", "role", "rights", "usedBy", "actions"]
    .map((c) => h("th", { scope: "col", text: t(c === "creator" ? "adminlinks.col.creator" : "links.col." + c) }));
  const rows = res.data.map((l) => h("tr", {},
    h("td", { text: l.creator }), h("td", { text: formatTime(l.createdAt, getLang()) }), h("td", { text: formatTime(l.expiresAt, getLang()) }),
    h("td", { text: describeStatus(l) }), h("td", { text: l.role || t("links.none") }),
    h("td", { text: describeGrants([...l.rolePermissions, ...l.permissions]) }), h("td", { text: l.usedBy || "" }),
    h("td", {}, l.status === "active" ? h("button", { type: "button", class: "small danger", text: t("links.deactivate"), onclick: async () => {
      if (!window.confirm(t("links.confirmDeactivate"))) return;
      const r = await call("POST", `/api/admin/invites/${l.id}/deactivate`, {});
      r.ok ? renderLinks(panel) : showError(r);
    } }) : null)));
  panel.replaceChildren(h("h2", { text: t("adminlinks.title") }), h("p", { class: "muted", text: t("adminlinks.hint") }),
    res.data.length ? h("div", { class: "table-wrap" }, h("table", {}, h("thead", {}, h("tr", {}, head)), h("tbody", {}, rows)))
      : h("p", { class: "muted", text: t("links.empty") }));
}
