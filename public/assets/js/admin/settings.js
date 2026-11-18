// Dashboard "Einstellungen": Grenzen der Gültigkeit von Einladungslinks und gesperrte Adressen.
import { h } from "/assets/js/shared/dom.js";
import { t, getLang } from "/assets/js/shared/i18n.js";
import { call, notice, showError, clearNotice, formatTime, state, isStale } from "/assets/js/admin/ui.js";

export async function renderSettings(panel) {
  clearNotice();
  const view = state.view;
  const res = await call("GET", "/api/admin/settings/invites");
  if (isStale(view)) return;
  if (!res.ok) return showError(res);
  const { limits, hardMaxDays, blocks } = res.data;

  const fields = [["minHours", "settings.minHours", 1], ["defaultDays", "settings.defaultDays", 1],
    ["maxDays", "settings.maxDays", 1], ["privilegedMaxDays", "settings.privilegedMaxDays", 1]];
  const inputs = {};
  const rows = fields.map(([name, key, min]) => {
    inputs[name] = h("input", { type: "number", min: String(min), max: name === "maxDays" ? String(hardMaxDays) : null, step: "1", class: "narrow", id: "limit-" + name, value: String(limits[name]) });
    return [h("label", { for: "limit-" + name, text: t(key) }), inputs[name]];
  });
  const form = h("form", { class: "stack", onsubmit: async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(Object.entries(inputs).map(([k, input]) => [k, Number(input.value)]));
    const r = await call("PUT", "/api/admin/settings/invites", body);
    if (!r.ok) return showError(r);
    await renderSettings(panel);
    notice(t("settings.saved"));
  } }, h("h3", { text: t("settings.invites.heading") }), rows, h("div", { class: "actions" }, h("button", { type: "submit", text: t("settings.save") })));

  const list = blocks.length
    ? h("ul", {}, blocks.map((b) => h("li", {}, `${b.ipKey} (${t("settings.blocks.until")} ${formatTime(b.blockedUntil, getLang())}) `, h("button", {
      type: "button", class: "small secondary", text: t("settings.blocks.lift"),
      onclick: async () => { const r = await call("DELETE", "/api/admin/settings/invites/blocks?ipKey=" + encodeURIComponent(b.ipKey)); r.ok ? renderSettings(panel) : showError(r); },
    }))))
    : h("p", { class: "muted", text: t("settings.blocks.none") });

  panel.replaceChildren(h("h2", { text: t("settings.title") }), form, h("h3", { text: t("settings.blocks.heading") }), list);
}
