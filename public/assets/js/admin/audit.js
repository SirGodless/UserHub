// Dashboard "Protokoll": neueste Einträge zuerst, filterbar, seitenweise nachladen.
import { h } from "/assets/js/shared/dom.js";
import { t, getLang } from "/assets/js/shared/i18n.js";
import { call, showError, clearNotice, formatTime, state, isStale } from "/assets/js/admin/ui.js";

const PAGE = 50;
let filter = { action: "", user: "" };

export async function renderAudit(panel) {
  clearNotice();
  const view = state.view;
  const action = h("input", { type: "text", value: filter.action, "aria-label": t("audit.action"), placeholder: t("audit.action") });
  const user = h("input", { type: "text", value: filter.user, "aria-label": t("audit.user"), placeholder: t("audit.user") });
  const form = h("form", { class: "toolbar", onsubmit: (e) => { e.preventDefault(); filter = { action: action.value, user: user.value }; renderAudit(panel); } },
    action, user, h("button", { type: "submit", text: t("audit.filter") }));
  const body = h("tbody", {});
  const more = h("button", { type: "button", class: "secondary", text: t("audit.more"), hidden: true });
  const table = h("table", {},
    h("thead", {}, h("tr", {}, ["time", "actor", "subject", "action", "details", "ip"].map((c) => h("th", { scope: "col", text: t("audit.col." + c) })))), body);
  panel.replaceChildren(h("h2", { text: t("audit.title") }), form, h("div", { class: "table-wrap" }, table), more);

  let before = null;
  async function load() {
    const q = new URLSearchParams({ action: filter.action, user: filter.user, limit: String(PAGE) });
    if (before !== null) q.set("before", String(before));
    const res = await call("GET", "/api/admin/audit?" + q);
    if (isStale(view)) return;
    if (!res.ok) return showError(res);
    for (const e of res.data) {
      body.append(h("tr", {}, h("td", { text: formatTime(e.at, getLang()) }), h("td", { text: e.actor || "" }),
        h("td", { text: e.subject || "" }), h("td", {}, h("code", { text: e.action })),
        h("td", { class: "wrap", text: e.details || "" }), h("td", { text: e.ip || "" })));
    }
    if (res.data.length) before = res.data[res.data.length - 1].id;
    more.hidden = res.data.length < PAGE;
  }
  more.addEventListener("click", load);
  await load();
}
