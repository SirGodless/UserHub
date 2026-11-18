// Zeit aus dem Backend (UTC) in Europe/Berlin anzeigen
export function formatTime(value, lang) {
  const date = new Date(typeof value === "number" ? value * 1000 : value);
  return date.toLocaleString(lang, { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "medium" });
}
