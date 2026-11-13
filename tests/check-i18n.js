// Prüft die Sprachdateien (läuft ohne Abhängigkeiten): node tests/check-i18n.js
//  1. en und de haben dieselben Themen-Dateien und dieselben Schlüssel in jeder Datei.
//  2. Jeder Schlüssel, den eine Seite im HTML (data-i18n, data-i18n-placeholder, data-i18n-aria-label) oder im Skript
//     (t("...")) fest nennt, steht in den Themen, die diese Seite lädt (data-i18n-files im body).
//  3. Kein Text steht in zwei Themen doppelt (Schlüssel sind eindeutig).
//  4. Jede Fehlermeldung, die ein Skript über setError(..., "code") fest anfordert, hat einen Text.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "public");
let failed = false;
const fail = (msg) => { console.log("FAIL:", msg); failed = true; };

const langs = ["en", "de"];
const topics = {};
for (const lang of langs) {
  const dir = path.join(root, "assets", "i18n", lang);
  topics[lang] = {};
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    topics[lang][f.replace(".json", "")] = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  }
}

// 1. gleiche Dateien und Schlüssel
const names = Object.keys(topics.en).sort();
if (JSON.stringify(names) !== JSON.stringify(Object.keys(topics.de).sort())) fail("en und de haben verschiedene Dateien");
for (const n of names) {
  const a = Object.keys(topics.en[n] || {}).sort();
  const b = Object.keys(topics.de[n] || {}).sort();
  for (const k of a) if (!b.includes(k)) fail(`de/${n}.json fehlt ${k}`);
  for (const k of b) if (!a.includes(k)) fail(`en/${n}.json fehlt ${k}`);
  for (const [k, v] of Object.entries({ ...topics.en[n], ...topics.de[n] })) if (!String(v).trim()) fail(`${n}: leerer Text bei ${k}`);
}

// 3. Schlüssel eindeutig über alle Themen
const seen = {};
for (const n of names) for (const k of Object.keys(topics.en[n])) {
  if (seen[k]) fail(`Schlüssel ${k} steht in ${seen[k]} und ${n}`);
  seen[k] = n;
}

// 2. und 4. Seiten
const pages = ["index.html", ...fs.readdirSync(path.join(root, "pages")).map((f) => "pages/" + f)];
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  const files = (html.match(/data-i18n-files="([^"]+)"/) || [null, "common"])[1].split(" ");
  for (const f of files) if (!topics.en[f]) fail(`${page}: Thema ${f} gibt es nicht`);
  const available = new Set(files.flatMap((f) => Object.keys(topics.en[f] || {})));
  const keys = [...html.matchAll(/data-i18n(?:-placeholder|-aria-label)?="([^"]+)"/g)].map((m) => m[1]);
  const titleKey = (html.match(/data-title-key="([^"]+)"/) || [])[1];
  if (titleKey) keys.push(titleKey);
  const script = (html.match(/src="\/assets\/js\/pages\/([a-z]+\.js)"/) || [])[1];
  let code = "";
  if (script) {
    code = fs.readFileSync(path.join(root, "assets/js/pages", script), "utf8");
    keys.push(...[...code.matchAll(/\bt\("([a-zA-Z0-9_.]+)"\)/g)].map((m) => m[1]));
    keys.push(...[...code.matchAll(/setError\(t, "[a-z-]+", "([a-z_]+)"\)/g)].map((m) => "error." + m[1]));
  }
  for (const k of new Set(keys)) if (!available.has(k)) fail(`${page}: Text ${k} fehlt in den geladenen Themen (${files.join(", ")})`);
}

// Die Skripte laden nur Dateien, die es gibt
for (const f of fs.readdirSync(path.join(root, "assets/js/pages"))) {
  const code = fs.readFileSync(path.join(root, "assets/js/pages", f), "utf8");
  for (const m of code.matchAll(/from "(\/assets\/[^"]+)"/g)) {
    if (!fs.existsSync(path.join(root, m[1]))) fail(`pages/${f}: Import ${m[1]} gibt es nicht`);
  }
}

console.log(failed ? "Sprachprüfung FEHLGESCHLAGEN" : `Sprachprüfung ok: ${names.length} Themen, ${Object.keys(seen).length} Texte je Sprache, ${pages.length} Seiten`);
process.exit(failed ? 1 : 0);
