// Gemeinsame Hilfen der Admin-Seiten: Aufrufe mit Umleitung bei fehlender Anmeldung, Meldungen, Zustand.
// Die Oberfläche entscheidet nichts: Jeder Aufruf wird vom Backend geprüft, die Seite zeigt nur dessen Antwort.
import { api } from "/assets/js/shared/api.js";
import { t } from "/assets/js/shared/i18n.js";

// Abschnitte, die der User laut Backend öffnen darf (Antwort von /api/admin/overview)
// view zählt die geöffneten Ansichten. Eine Ansicht, die erst nach einem Wechsel fertig wird, darf nichts mehr zeichnen.
export const state = { sections: [], view: 0 };
export const isStale = (view) => view !== state.view;

const $ = (id) => document.getElementById(id);

export async function call(method, path, body) {
  const res = await api(method, path, body);
  if (res.status === 401) location.href = "/login?continue=" + encodeURIComponent("/admin");
  if (res.status === 403 && res.data.error === "two_factor_required") $("twofactor-banner").hidden = false;
  return res;
}

export function notice(text, isError = false) {
  const el = $("notice");
  el.textContent = text;
  el.className = isError ? "error" : "success";
}

export function clearNotice() {
  notice("");
}

export function showError(res) {
  notice(t("error." + (res.data.error || "server_error")), true);
}

export const can = (section) => state.sections.includes(section);

// Zeit aus dem Backend (UTC) in Europe/Berlin anzeigen
export function formatTime(value, lang) {
  const date = new Date(typeof value === "number" ? value * 1000 : value);
  return date.toLocaleString(lang, { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "medium" });
}
