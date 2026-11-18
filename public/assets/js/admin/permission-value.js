// Eingabe und Anzeige von Rechte-Werten. Boolesch: nur "vergeben". Zahl: Wert, bei "höher = mehr" auch "unbegrenzt".
import { h } from "/assets/js/shared/dom.js";
import { t } from "/assets/js/shared/i18n.js";

// Gibt { element, read } zurück. read() liefert den Body für die API. Fehler in den Werten meldet das Backend.
export function valueEditor(definition) {
  if (!definition || definition.type !== "number") return { element: null, read: () => ({}) };
  const number = h("input", { type: "number", min: "0", step: "1", class: "narrow", "aria-label": t("value.number") });
  const canBeUnlimited = definition.allowUnlimited && definition.direction === "higher";
  const unlimited = canBeUnlimited ? h("input", { type: "checkbox" }) : null;
  const element = h("span", { class: "inline" }, number,
    unlimited && h("label", { class: "check inline" }, unlimited, h("span", { text: t("value.unlimited") })));
  unlimited?.addEventListener("change", () => { number.disabled = unlimited.checked; });
  return {
    element,
    read: () => (unlimited?.checked ? { unlimited: true } : number.value === "" ? {} : { number: Number(number.value) }),
  };
}

// { set, number, unlimited } als Text
export function describeValue(value) {
  if (!value || !value.set) return t("value.notSet");
  if (value.unlimited) return t("value.unlimited");
  if (value.number !== null && value.number !== undefined) return String(value.number);
  return t("value.granted");
}

// Auswahlfeld mit den Rechten (Schlüssel als Beschriftung)
export function permissionSelect(definitions) {
  return h("select", { "aria-label": t("value.permission") },
    definitions.map((d) => h("option", { value: d.key, text: d.key })));
}
