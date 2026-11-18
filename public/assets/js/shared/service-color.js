// Akzentfarbe eines Dienstes: setzt --svc und eine lesbare Schriftfarbe darauf. Gesetzt wird über das Skript (nicht per
// style-Attribut im HTML), damit die strenge CSP ohne Inline-Styles auskommt.
const FALLBACK_TEXT = "#ffffff";

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

// Schwarz oder Weiß, je nachdem, was auf der Farbe besser lesbar ist
export function readableText(hex) {
  const l = luminance(hex);
  const onBlack = (l + 0.05) / 0.05;
  const onWhite = 1.05 / (l + 0.05);
  return onBlack >= onWhite ? "#0d0d0d" : FALLBACK_TEXT;
}

export const isHexColor = (value) => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);

// Ohne eigene Farbe gilt der allgemeine Akzent (die Variablen aus tokens.css)
export function applyServiceColor(element, color) {
  if (!isHexColor(color)) {
    element.style.removeProperty("--svc");
    element.style.removeProperty("--svc-text");
    return;
  }
  element.style.setProperty("--svc", color);
  element.style.setProperty("--svc-text", readableText(color));
}
