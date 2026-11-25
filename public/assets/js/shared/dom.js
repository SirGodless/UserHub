// Baut Elemente ohne innerHTML: Texte landen immer als Text im Dokument, nie als HTML (Schutz gegen XSS aus Daten).
// h("button", { class: "secondary", onclick: fn }, "Text", weitereKinder)
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === false || value == null) continue;
    if (key === "class") el.className = value;
    else if (key === "text") el.textContent = value;
    else if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child != null && child !== false) el.append(child);
  }
  return el;
}
