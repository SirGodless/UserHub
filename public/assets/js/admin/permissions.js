// Dashboard "Rechte": Rechte anlegen, beschreiben und löschen. Ein Recht wirkt nur, wenn etwas es durchsetzt,
// nämlich als Anmeldevoraussetzung an einem Dienst (Client). Der Hinweis dazu steht oben auf der Seite.
import { h } from "/assets/js/shared/dom.js";
import { t } from "/assets/js/shared/i18n.js";
import { call, showError, clearNotice, state, isStale } from "/assets/js/admin/ui.js";

export async function renderPermissions(panel) {
  clearNotice();
  const view = state.view;
  const res = await call("GET", "/api/admin/permissions");
  if (isStale(view)) return;
  if (!res.ok) return showError(res);
  const again = () => renderPermissions(panel);

  const rows = res.data.map(({ definition: d, enforcedByServices, assignedCount, ownerService }) => h("tr", {},
    h("td", {}, h("code", { text: d.key })),
    h("td", { text: t("permissions.type." + d.type) + (d.direction ? ` (${t("permissions.direction." + d.direction)})` : "") + (d.allowUnlimited ? `, ${t("permissions.unlimitedAllowed")}` : "") }),
    h("td", { text: d.linkGrantable ? t("users.yes") : t("users.no") }),
    h("td", { class: "mono", text: ownerService || t("permissions.service.none") }),
    h("td", { text: enforcedByServices.length ? enforcedByServices.join(", ") : t("permissions.enforcedNothing") }),
    h("td", { text: String(assignedCount) }),
    h("td", { text: d.description }),
    h("td", {}, d.builtin ? h("span", { class: "badge", text: t("permissions.builtin") }) : actions(d, again))));

  const table = h("table", {},
    h("thead", {}, h("tr", {}, ["key", "service", "type", "linkGrantable", "enforcedBy", "assigned", "description", "actions"]
      .map((c) => h("th", { scope: "col", text: t("permissions.col." + c) })))),
    h("tbody", {}, rows));

  panel.replaceChildren(h("h2", { text: t("permissions.title") }),
    h("p", { class: "info", text: t("permissions.hint") }),
    createForm(again), h("div", { class: "table-wrap" }, table));
}

function actions(d, again) {
  return h("span", { class: "inline" },
    h("button", { type: "button", class: "small secondary", text: t("permissions.edit"), onclick: async () => {
      const description = window.prompt(t("permissions.descriptionPrompt"), d.description);
      if (description === null) return;
      const r = await call("PATCH", "/api/admin/permissions/" + d.key, { description, linkGrantable: d.linkGrantable });
      r.ok ? again() : showError(r);
    } }),
    h("button", { type: "button", class: "small secondary", text: d.linkGrantable ? t("permissions.linkOff") : t("permissions.linkOn"), onclick: async () => {
      const r = await call("PATCH", "/api/admin/permissions/" + d.key, { description: d.description, linkGrantable: !d.linkGrantable });
      r.ok ? again() : showError(r);
    } }),
    h("button", { type: "button", class: "small danger", text: t("permissions.delete"), onclick: async () => {
      if (!window.confirm(t("permissions.confirmDelete"))) return;
      const r = await call("DELETE", "/api/admin/permissions/" + d.key);
      r.ok ? again() : showError(r);
    } }));
}

function createForm(again) {
  const key = h("input", { type: "text", id: "perm-key", autocapitalize: "none", spellcheck: "false", placeholder: "media.upload" });
  const type = h("select", { id: "perm-type" }, h("option", { value: "boolean", text: t("permissions.type.boolean") }),
    h("option", { value: "number", text: t("permissions.type.number") }));
  const direction = h("select", { id: "perm-direction" }, h("option", { value: "higher", text: t("permissions.direction.higher") }),
    h("option", { value: "lower", text: t("permissions.direction.lower") }));
  const unlimited = h("input", { type: "checkbox", id: "perm-unlimited" });
  const link = h("input", { type: "checkbox", id: "perm-link" });
  const description = h("input", { type: "text", id: "perm-description" });
  const numberOnly = h("div", { hidden: true },
    h("label", { for: "perm-direction", text: t("permissions.form.direction") }), direction,
    h("label", { class: "check" }, unlimited, h("span", { text: t("permissions.form.unlimited") })));
  type.addEventListener("change", () => { numberOnly.hidden = type.value !== "number"; });

  return h("form", { class: "stack", onsubmit: async (e) => {
    e.preventDefault();
    const isNumber = type.value === "number";
    const r = await call("POST", "/api/admin/permissions", {
      key: key.value, type: type.value, direction: isNumber ? direction.value : "",
      allowUnlimited: isNumber && direction.value === "higher" && unlimited.checked,
      linkGrantable: link.checked, description: description.value,
    });
    r.ok ? again() : showError(r);
  } },
  h("h3", { text: t("permissions.form.title") }),
  h("label", { for: "perm-key", text: t("permissions.form.key") }), key,
  h("label", { for: "perm-type", text: t("permissions.form.type") }), type, numberOnly,
  h("label", { for: "perm-description", text: t("permissions.form.description") }), description,
  h("label", { class: "check" }, link, h("span", { text: t("permissions.form.linkGrantable") })),
  h("div", { class: "actions" }, h("button", { type: "submit", text: t("permissions.form.create") })));
}
