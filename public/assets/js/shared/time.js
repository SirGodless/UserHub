// Zeit aus dem Backend (UTC) in Europe/Berlin anzeigen, in jeder Sprache als JJJJ-MM-TT HH:MM:SS (zum Sortieren und eindeutig).
// Das Format hängt bewusst nicht von der Sprache ab: "11/19/26" (en-US) und "19.11.26" (de) sind sonst leicht zu verwechseln.
const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

export function formatTime(value) {
  const date = new Date(typeof value === "number" ? value * 1000 : value);
  const p = Object.fromEntries(parts.formatToParts(date).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}
