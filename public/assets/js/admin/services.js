// Dashboard "Dienste": Anzeigename, Beschreibung, Adressen und Akzentfarbe je Dienst.
// Die Farbe färbt im Hub die Knöpfe des Dienstes. Die Vorschau zeigt den Knopf sofort.
import { h } from "/assets/js/shared/dom.js";
import { t } from "/assets/js/shared/i18n.js";
import { applyServiceColor, isHexColor } from "/assets/js/shared/service-color.js";
import { call, notice, showError, clearNotice, state, isStale } from "/assets/js/admin/ui.js";

const DEFAULT_PICKER = "#8c99ff";

export async function renderServices(panel) {
  clearNotice();
  const view = state.view;
  const res = await call("GET", "/api/admin/services");
  if (isStale(view)) return;
  if (!res.ok) return showError(res);
  panel.replaceChildren(h("h2", { text: t("services.title") }), h("p", { class: "muted", text: t("services.hint") }),
    ...(res.data.length ? res.data.map((s) => card(s, panel)) : [h("p", { class: "muted", text: t("services.empty") })]));
}

function field(id, label, value, extra = {}) {
  return [h("label", { for: id, text: label }), h("input", { type: "text", id, value: value || "", autocomplete: "off", ...extra })];
}

function card(s, panel) {
  const id = (name) => `${s.key}-${name}`;
  const [nameLabel, name] = field(id("name"), t("services.name"), s.displayName, { maxlength: "60" });
  const [descLabel, desc] = field(id("desc"), t("services.description"), s.description, { maxlength: "200" });
  const [urlLabel, url] = field(id("url"), t("services.url"), s.url, { placeholder: "https://vault.example.net" });
  const [healthLabel, health] = field(id("health"), t("services.healthUrl"), s.healthUrl, { placeholder: "https://vault.example.net/alive" });

  const picker = h("input", { type: "color", id: id("picker"), value: isHexColor(s.accentColor) ? s.accentColor : DEFAULT_PICKER, "aria-label": t("services.color") });
  const hex = h("input", { type: "text", id: id("hex"), value: s.accentColor || "", placeholder: "#2f81f7", maxlength: "7", autocomplete: "off", spellcheck: "false" });
  const preview = h("span", { class: "btn svc", "aria-hidden": "true", text: t("services.preview") });
  const sync = () => applyServiceColor(preview, hex.value);
  picker.addEventListener("input", () => { hex.value = picker.value; sync(); });
  hex.addEventListener("input", () => { if (isHexColor(hex.value)) picker.value = hex.value.toLowerCase(); sync(); });
  const lock = h("input", { type: "checkbox", id: id("lock") });
  lock.checked = Boolean(s.accentLocked);
  const lockRow = h("label", { class: "check", for: id("lock") }, lock, h("span", { text: t("services.lock") }));
  const reported = h("p", { class: "muted small" }, `${t("services.reported")}: `,
    s.reportedAccentColor ? h("span", { class: "inline" }, h("span", { class: "svc-swatch reported", "aria-hidden": "true" }), s.reportedAccentColor) : t("services.reported.none"));
  const swatch = reported.querySelector(".reported");
  if (swatch) applyServiceColor(swatch, s.reportedAccentColor);
  const reset = h("button", { type: "button", class: "secondary small", text: t("services.color.reset"), onclick: () => { hex.value = ""; sync(); } });
  sync();

  const save = h("button", { type: "button", text: t("services.save"), onclick: async () => {
    const r = await call("PATCH", "/api/admin/services/" + s.key,
      { displayName: name.value, description: desc.value, url: url.value, healthUrl: health.value, accentColor: hex.value, accentLocked: lock.checked });
    if (!r.ok) return showError(r);
    await renderServices(panel);
    notice(t("services.saved"));
  } });

  return h("section", { class: "card-inner" },
    h("h3", {}, s.displayName, " ", h("span", { class: "muted small", text: s.key })),
    h("div", { class: "svc-form" }, h("div", {}, nameLabel, name), h("div", {}, descLabel, desc), h("div", {}, urlLabel, url),
      h("div", {}, healthLabel, health, h("p", { class: "muted small", text: t("services.healthHint") })),
      h("div", { class: "wide" }, h("label", { for: id("hex"), text: t("services.color") }), h("div", { class: "color-row" }, picker, hex, reset, preview), lockRow, h("p", { class: "muted small", text: t("services.lock.hint") }), reported)),
    h("div", { class: "actions" }, save));
}
