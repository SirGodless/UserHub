// Dashboard "Rollen": Rollen sind Live-Gruppen. Ändert man eine Rolle, gilt das sofort für alle Mitglieder.
import { h } from "/assets/js/shared/dom.js";
import { t } from "/assets/js/shared/i18n.js";
import { call, notice, showError, clearNotice, state, isStale } from "/assets/js/admin/ui.js";
import { valueEditor, describeValue, permissionSelect } from "/assets/js/admin/permission-value.js";

export async function renderRoles(panel) {
  clearNotice();
  const view = state.view;
  const [roles, defsRes] = await Promise.all([call("GET", "/api/admin/roles"), call("GET", "/api/admin/permissions")]);
  if (isStale(view)) return;
  if (!roles.ok) return showError(roles);
  if (!defsRes.ok) return showError(defsRes);
  const definitions = defsRes.data.map((p) => p.definition);
  const again = () => renderRoles(panel);

  const name = h("input", { type: "text", maxlength: "40", "aria-label": t("roles.name") });
  const create = h("form", { class: "toolbar", onsubmit: async (e) => {
    e.preventDefault();
    const r = await call("POST", "/api/admin/roles", { name: name.value });
    r.ok ? again() : showError(r);
  } }, name, h("button", { type: "submit", text: t("roles.create") }));

  panel.replaceChildren(h("h2", { text: t("roles.title") }), h("p", { class: "muted", text: t("roles.hint") }), create,
    ...roles.data.map((info) => roleCard(info, definitions, again)));
}

function roleCard({ role, permissions, members }, definitions, again) {
  const base = "/api/admin/roles/" + role.id;
  const head = h("h3", {}, role.name, " ", role.builtin && h("span", { class: "badge", text: t("roles.builtin") }),
    h("span", { class: "muted small", text: ` ${t("roles.members")}: ${members}` }));

  const list = h("ul", {});
  if (role.allAdminPermissions) list.append(h("li", { class: "muted", text: t("roles.allAdmin") }));
  for (const p of permissions) {
    list.append(h("li", {}, `${p.permissionKey}: ${describeValue(p.value)} `, h("button", {
      type: "button", class: "small secondary", text: t("roles.removePermission"),
      onclick: async () => { const r = await call("DELETE", `${base}/permissions/${p.permissionKey}`); r.ok ? again() : showError(r); },
    })));
  }

  // Die Rolle Admin enthält alle admin.*-Rechte von selbst, dafür gibt es keine Einträge
  const choices = definitions.filter((d) => !(role.allAdminPermissions && d.key.startsWith("admin.")));
  const card = h("section", { class: "card-inner" }, head, list);
  if (choices.length) {
    const select = permissionSelect(choices);
    const holder = h("span", { class: "inline" });
    let editor;
    const swap = () => {
      editor = valueEditor(choices.find((d) => d.key === select.value));
      holder.replaceChildren(...(editor.element ? [editor.element] : []));
    };
    select.addEventListener("change", swap);
    swap();
    card.append(h("div", { class: "toolbar" }, select, holder, h("button", {
      type: "button", text: t("roles.setPermission"),
      onclick: async () => { const r = await call("PUT", `${base}/permissions/${select.value}`, editor.read()); r.ok ? again() : showError(r); },
    })));
  }
  if (!role.builtin) {
    card.append(h("div", { class: "actions" },
      h("button", { type: "button", class: "secondary", text: t("roles.rename"), onclick: async () => {
        const next = window.prompt(t("roles.renamePrompt"), role.name);
        if (!next) return;
        const r = await call("PATCH", base, { name: next });
        r.ok ? again() : showError(r);
      } }),
      h("button", { type: "button", class: "danger", text: t("roles.delete"), onclick: async () => {
        if (!window.confirm(t("roles.confirmDelete"))) return;
        const r = await call("DELETE", base);
        r.ok ? (await again(), notice(t("roles.deleted"))) : showError(r);
      } })));
  }
  return card;
}
