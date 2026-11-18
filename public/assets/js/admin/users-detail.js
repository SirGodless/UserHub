// Dashboard "Benutzer": Detailansicht mit Rollen, direkten Rechten und Aktionen (Bann, 2FA zurücksetzen,
// Passwort-Reset erzwingen). Alle Entscheidungen trifft das Backend, hier stehen nur Knöpfe und Antworten.
import { h } from "/assets/js/shared/dom.js";
import { t } from "/assets/js/shared/i18n.js";
import { call, can, notice, showError, clearNotice, state, isStale } from "/assets/js/admin/ui.js";
import { valueEditor, describeValue, permissionSelect } from "/assets/js/admin/permission-value.js";

export async function renderUserDetail(panel, id, back) {
  clearNotice();
  const view = state.view;
  const res = await call("GET", "/api/admin/users/" + id);
  if (isStale(view)) return;
  if (!res.ok) return showError(res);
  const { user, roles, directPermissions, effectivePermissions } = res.data;
  const again = () => renderUserDetail(panel, id, back);

  // Aktion mit Rückfrage, danach Meldung und neu laden
  const action = (label, confirmKey, doneKey, method, path, danger = false) => h("button", {
    type: "button", class: danger ? "danger" : "secondary", text: label,
    onclick: async () => {
      if (confirmKey && !window.confirm(t(confirmKey))) return;
      const r = await call(method, path);
      if (!r.ok) return showError(r);
      await again();
      notice(t(doneKey));
    },
  });
  const base = "/api/admin/users/" + id;
  const actions = h("div", { class: "actions" },
    user.banned ? action(t("users.action.unban"), null, "users.done.unban", "POST", base + "/unban")
      : action(t("users.action.ban"), "users.confirm.ban", "users.done.ban", "POST", base + "/ban", true),
    action(t("users.action.reset2fa"), "users.confirm.reset2fa", "users.done.reset2fa", "POST", base + "/reset-2fa"),
    action(t("users.action.forceReset"), "users.confirm.forceReset", "users.done.forceReset", "POST", base + "/force-password-reset"));

  const [rolesPart, permissionsPart] = [await rolesBlock(user, roles, base, again), await permissionsBlock(directPermissions, base, again)];
  if (isStale(view)) return;
  const sections = [
    h("p", {}, h("button", { type: "button", class: "link", text: t("users.back"), onclick: back })),
    h("h2", { text: user.username }),
    h("p", { class: "muted", text: `${user.email || ""} | ${user.language}` }),
    actions,
    rolesPart,
    permissionsPart,
    effectiveBlock(effectivePermissions),
  ];
  panel.replaceChildren(...sections.filter(Boolean));
}

async function rolesBlock(user, userRoles, base, again) {
  const list = userRoles.length
    ? h("ul", {}, userRoles.map((r) => h("li", {}, r.name, " ", can("roles") && h("button", {
      type: "button", class: "small secondary", text: t("users.removeRole"),
      onclick: async () => { const x = await call("DELETE", `${base}/roles/${r.id}`); x.ok ? again() : showError(x); },
    }))))
    : h("p", { class: "muted", text: t("users.noRoles") });
  const block = h("section", {}, h("h3", { text: t("users.roles") }), list);
  if (can("roles")) {
    const all = await call("GET", "/api/admin/roles");
    if (all.ok) {
      const free = all.data.map((r) => r.role).filter((r) => !userRoles.some((u) => u.id === r.id));
      if (free.length) {
        const select = h("select", { "aria-label": t("users.addRole") }, free.map((r) => h("option", { value: r.id, text: r.name })));
        block.append(h("div", { class: "toolbar" }, select, h("button", {
          type: "button", text: t("users.addRole"),
          onclick: async () => { const x = await call("PUT", `${base}/roles/${select.value}`); x.ok ? again() : showError(x); },
        })));
      }
    }
  }
  return block;
}

async function permissionsBlock(direct, base, again) {
  const list = direct.length
    ? h("ul", {}, direct.map((d) => h("li", {}, `${d.permissionKey}: ${describeValue(d.value)} `, can("permissions") && h("button", {
      type: "button", class: "small secondary", text: t("users.removePermission"),
      onclick: async () => { const x = await call("DELETE", `${base}/permissions/${d.permissionKey}`); x.ok ? again() : showError(x); },
    }))))
    : h("p", { class: "muted", text: t("users.noDirect") });
  const block = h("section", {}, h("h3", { text: t("users.direct") }), list);
  if (can("permissions")) {
    const res = await call("GET", "/api/admin/permissions");
    const defs = { ok: res.ok, data: res.ok ? res.data.map((p) => p.definition) : [] };
    if (defs.ok && defs.data.length) {
      const select = permissionSelect(defs.data);
      const holder = h("span", { class: "inline" });
      let editor = valueEditor(defs.data[0]);
      const swap = () => {
        editor = valueEditor(defs.data.find((d) => d.key === select.value));
        holder.replaceChildren(...(editor.element ? [editor.element] : []));
      };
      select.addEventListener("change", swap);
      swap();
      block.append(h("div", { class: "toolbar" }, select, holder, h("button", {
        type: "button", text: t("users.setPermission"),
        onclick: async () => {
          const x = await call("PUT", `${base}/permissions/${select.value}`, editor.read());
          x.ok ? again() : showError(x);
        },
      })));
    }
  }
  return block;
}

function effectiveBlock(effective) {
  const keys = Object.keys(effective).sort();
  return h("section", {}, h("h3", { text: t("users.effective") }), h("p", { class: "muted", text: t("users.effectiveHint") }),
    keys.length ? h("ul", {}, keys.map((k) => h("li", { text: `${k}: ${describeValue(effective[k])}` })))
      : h("p", { class: "muted", text: t("users.noneEffective") }));
}
