// Sehr kleine Übersetzungshilfe. Die Texte stehen in /assets/i18n/<sprache>/<thema>.json. Jede Seite nennt im
// body-Attribut data-i18n-files die Themen, die sie braucht (z. B. "common fields errors login").
// Vor dem Login merkt sich nur der Browser die Sprache (Standard Englisch).
const SUPPORTED = ["en", "de"];
const DEFAULT_LANG = "en";
let strings = {};
let current = DEFAULT_LANG;

function storedLang() {
  try {
    const v = localStorage.getItem("lang");
    return SUPPORTED.includes(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG; // localStorage kann gesperrt sein
  }
}

export function getLang() {
  return current;
}

export function t(key) {
  return strings[key] ?? key;
}

export async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
  const files = (document.body.dataset.i18nFiles || "common").split(" ");
  const loaded = await Promise.all(files.map(async (name) => (await fetch(`/assets/i18n/${lang}/${name}.json`)).json()));
  strings = Object.assign({}, ...loaded);
  current = lang;
  try {
    localStorage.setItem("lang", lang);
  } catch {
    /* egal, die Wahl gilt dann nur für diese Seite */
  }
  document.documentElement.lang = lang;
  applyTranslations();
}

export async function initI18n() {
  await setLang(storedLang());
  const select = document.getElementById("lang");
  if (select) {
    select.value = current;
    select.addEventListener("change", () => setLang(select.value));
  }
}

function applyTranslations() {
  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of document.querySelectorAll("[data-i18n-placeholder]")) {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  }
  for (const el of document.querySelectorAll("[data-i18n-aria-label]")) {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  }
  document.title = t(document.body.dataset.titleKey || "app.title");
  // Fehlermeldungen, die gerade sichtbar sind, in die neue Sprache übersetzen
  for (const el of document.querySelectorAll("[data-error-code]")) {
    el.textContent = t("error." + el.dataset.errorCode);
  }
}
