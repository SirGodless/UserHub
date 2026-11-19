// Dashboard "Dienste": Dienste anlegen, Anzeige-Eigenschaften, Rücksprung-Adressen, Client-Geheimnis, Akzentfarbe.
// Das Client-Geheimnis steht nur in der Antwort auf Anlegen und Erneuern und wird nur einmal angezeigt.
import { h } from "/assets/js/shared/dom.js";
import { t } from "/assets/js/shared/i18n.js";
import { applyServiceColor, isHexColor } from "/assets/js/shared/service-color.js";
import { call, notice, showError, clearNotice, state, isStale } from "/assets/js/admin/ui.js";

const DEFAULT_PICKER = "#8c99ff";
const lines = (text) => text.split("\n").map((l) => l.trim()).filter(Boolean);

// reveal: { key, secret } direkt nach Anlegen oder Erneuern, sonst nichts
export async function renderServices(panel, reveal = null) {
  clearNotice();
  const view = state.view;
  const res = await call("GET", "/api/admin/services");
  if (isStale(view)) return;
  if (!res.ok) return showError(res);
  const again = (secret) => renderServices(panel, secret || null);
  panel.replaceChildren(h("h2", { text: t("services.title") }), h("p", { class: "muted", text: t("services.hint") }),
    reveal ? secretBox(reveal) : null, createForm(again),
    ...(res.data.length ? res.data.map((s) => card(s, again)) : [h("p", { class: "muted", text: t("services.empty") })]));
}

// Das Geheimnis einmal anzeigen, mit Kopieren
function secretBox({ key, secret }) {
  const copy = h("button", { type: "button", class: "secondary small", text: t("services.secret.copy"), onclick: async () => {
    try { await navigator.clipboard.writeText(secret); copy.textContent = t("services.secret.copied"); } catch { /* markieren geht immer */ }
  } });
  return h("section", { class: "info", id: "secret-box" }, h("strong", { text: t("services.secret.heading") }),
    h("p", { class: "small", text: t("services.secret.warning") }),
    h("p", {}, `${t("services.secret.clientId")}: `, h("span", { class: "secret", id: "secret-client-id", text: key })),
    h("p", {}, `${t("services.secret.client")}: `, h("span", { class: "secret", id: "secret-value", text: secret })), copy);
}

function field(id, label, value, extra = {}) {
  return [h("label", { for: id, text: label }), h("input", { type: "text", id, value: value || "", autocomplete: "off", ...extra })];
}

function createForm(again) {
  const [keyLabel, key] = field("new-key", t("services.key"), "", { maxlength: "32", autocapitalize: "none", spellcheck: "false", placeholder: "media" });
  const [nameLabel, name] = field("new-name", t("services.name"), "", { maxlength: "60", placeholder: "Medien" });
  const [urlLabel, url] = field("new-url", t("services.url"), "", { placeholder: "https://media.example.net" });
  const redirects = h("textarea", { id: "new-redirects", rows: "3", spellcheck: "false", placeholder: "https://media.example.net/auth/callback" });
  const form = h("form", { class: "stack", onsubmit: async (e) => {
    e.preventDefault();
    const r = await call("POST", "/api/admin/services", { key: key.value, displayName: name.value, url: url.value, redirectUris: lines(redirects.value) });
    if (!r.ok) return showError(r);
    again({ key: r.data.service.clientId, secret: r.data.clientSecret });
  } }, h("div", { class: "svc-form" }, h("div", {}, keyLabel, key, h("p", { class: "muted small", text: t("services.key.hint") })), h("div", {}, nameLabel, name),
    h("div", { class: "wide" }, urlLabel, url),
    h("div", { class: "wide" }, h("label", { for: "new-redirects", text: t("services.redirects") }), redirects, h("p", { class: "muted small", text: t("services.redirects.hint") }))),
  h("div", { class: "actions" }, h("button", { type: "submit", text: t("services.create") })));
  return h("details", { class: "card-inner", id: "new-service" }, h("summary", { text: t("services.new") }), form);
}

function card(s, again) {
  const id = (name) => `${s.key}-${name}`;
  const [nameLabel, name] = field(id("name"), t("services.name"), s.displayName, { maxlength: "60" });
  const [descLabel, desc] = field(id("desc"), t("services.description"), s.description, { maxlength: "200" });
  const [urlLabel, url] = field(id("url"), t("services.url"), s.url, { placeholder: "https://vault.example.net" });
  const [healthLabel, health] = field(id("health"), t("services.healthUrl"), s.healthUrl, { placeholder: "https://vault.example.net/alive" });

  const [logoutLabel, logout] = field(id("logout"), t("services.logoutUrl"), s.backchannelLogoutUri, { placeholder: "https://vault.example.net/auth/backchannel-logout" });
  const mode = h("select", { id: id("mode") }, ...["new_tab", "embedded"].map((m) => h("option", { value: m, text: t("services.openMode." + m) })));
  mode.value = s.openMode;

  const picker = h("input", { type: "color", id: id("picker"), value: isHexColor(s.accentColor) ? s.accentColor : DEFAULT_PICKER, "aria-label": t("services.color") });
  const hex = h("input", { type: "text", id: id("hex"), value: s.accentColor || "", placeholder: "#2f81f7", maxlength: "7", autocomplete: "off", spellcheck: "false" });
  const preview = h("span", { class: "btn svc", "aria-hidden": "true", text: t("services.preview") });
  const sync = () => applyServiceColor(preview, hex.value);
  picker.addEventListener("input", () => { hex.value = picker.value; sync(); });
  hex.addEventListener("input", () => { if (isHexColor(hex.value)) picker.value = hex.value.toLowerCase(); sync(); });
  const reset = h("button", { type: "button", class: "secondary small", text: t("services.color.reset"), onclick: () => { hex.value = ""; sync(); } });
  sync();

  const lock = h("input", { type: "checkbox", id: id("lock") });
  lock.checked = Boolean(s.accentLocked);
  const lockRow = h("label", { class: "check", for: id("lock") }, lock, h("span", { text: t("services.lock") }));
  const reported = h("p", { class: "muted small" }, `${t("services.reported")}: `,
    s.reportedAccentColor ? h("span", { class: "inline" }, h("span", { class: "svc-swatch reported", "aria-hidden": "true" }), s.reportedAccentColor) : t("services.reported.none"));
  const swatch = reported.querySelector(".reported");
  if (swatch) applyServiceColor(swatch, s.reportedAccentColor);

  const save = h("button", { type: "button", text: t("services.save"), onclick: async () => {
    const r = await call("PATCH", "/api/admin/services/" + s.key,
      { displayName: name.value, description: desc.value, url: url.value, healthUrl: health.value, accentColor: hex.value, accentLocked: lock.checked,
        openMode: mode.value, backchannelLogoutUri: logout.value });
    if (!r.ok) return showError(r);
    await again();
    notice(t("services.saved"));
  } });

  // Rücksprung-Adressen und Client-Geheimnis
  const redirects = h("textarea", { id: id("redirects"), rows: "3", spellcheck: "false" });
  redirects.value = s.redirectUris.join("\n");
  const saveRedirects = h("button", { type: "button", class: "secondary", text: t("services.redirects.save"), onclick: async () => {
    const r = await call("PUT", `/api/admin/services/${s.key}/redirect-uris`, { redirectUris: lines(redirects.value) });
    if (!r.ok) return showError(r);
    await again();
    notice(t("services.saved"));
  } });
  const newSecret = h("button", { type: "button", class: "danger", id: id("new-secret"), text: t("services.secret.new"), onclick: async () => {
    if (!window.confirm(t("services.secret.confirm"))) return;
    const r = await call("POST", `/api/admin/services/${s.key}/secret`, {});
    if (!r.ok) return showError(r);
    again({ key: s.key, secret: r.data.clientSecret });
  } });

  const origin = location.origin;
  const connection = h("details", {}, h("summary", { text: t("services.connection") }),
    h("p", { class: "muted small", text: t("services.connection.hint") }),
    h("dl", { class: "kv" },
      ...[["services.connection.issuer", origin], ["services.connection.clientId", s.clientId], ["services.connection.discovery", `${origin}/.well-known/openid-configuration`],
        ["services.connection.scopes", "openid profile email offline_access"], ["services.connection.right", s.requiredPermission],
        ["services.connection.prefix", `${s.key}.*`]]
        .flatMap(([label, value]) => [h("dt", { text: t(label) }), h("dd", {}, h("code", { text: value }))])));

  return h("section", { class: "card-inner", id: `service-${s.key}` },
    h("h3", {}, s.displayName, " ", h("span", { class: "muted small", text: s.key })),
    h("div", { class: "svc-form" }, h("div", {}, nameLabel, name), h("div", {}, descLabel, desc), h("div", {}, urlLabel, url),
      h("div", {}, healthLabel, health, h("p", { class: "muted small", text: t("services.healthHint") })),
      h("div", {}, h("label", { for: id("mode"), text: t("services.openMode") }), mode, h("p", { class: "muted small", text: t("services.openMode.hint") })),
      h("div", {}, logoutLabel, logout, h("p", { class: "muted small", text: t("services.logoutUrl.hint") })),
      h("div", { class: "wide" }, h("label", { for: id("hex"), text: t("services.color") }), h("div", { class: "color-row" }, picker, hex, reset, preview), lockRow,
        h("p", { class: "muted small", text: t("services.lock.hint") }), reported)),
    h("div", { class: "actions" }, save),
    h("h4", { text: t("services.redirects") }), redirects, h("div", { class: "actions" }, saveRedirects, newSecret), connection);
}
