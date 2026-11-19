// Ein Dienst im Öffnungsmodus "embedded": Der Hub zeigt ihn in einem Rahmen neben dem Seitenmenü. Welcher Dienst, steht im Pfad
// (/app/<dienst>). Nur Dienste, die der User nutzen darf und die auf "embedded" stehen, werden geladen (das entscheidet das Backend
// in /api/hub). Der Dienst meldet sich über die normale OIDC-Anmeldung an, im Hub angemeldet heißt ohne Eingabe.
import { initI18n, onLangChange, t } from "/assets/js/shared/i18n.js";
import { h } from "/assets/js/shared/dom.js";
import { initShell, redrawShell } from "/assets/js/shared/shell.js";

const key = location.pathname.split("/").pop();

// sandbox ohne allow-top-navigation: Der Dienst kann den Hub nicht wegnavigieren. allow-same-origin gilt für den Ursprung
// des Dienstes (eine andere Adresse als der Hub), nicht für den des Hubs.
const SANDBOX = "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads";

async function start() {
  await initI18n();
  const hub = await initShell();
  if (!hub) return;
  const service = hub.services.find((s) => s.key === key && s.openMode === "embedded" && s.url);
  if (!service) {
    location.replace("/");
    return;
  }
  document.title = service.name;
  // Der Rahmen wird nur einmal angelegt: Wird er aus der Seite genommen und wieder eingesetzt, lädt der Browser ihn neu.
  const frame = h("iframe", { class: "embed-frame", src: service.url, title: service.name, sandbox: SANDBOX, referrerpolicy: "no-referrer" });
  const bar = h("header", { class: "embed-bar" });
  document.getElementById("embed").replaceChildren(bar, frame);
  const drawBar = () => bar.replaceChildren(h("strong", { text: service.name }),
    h("a", { class: "small", href: service.url, target: "_blank", rel: "noopener noreferrer", text: t("hub.embed.newTab") }));
  drawBar();
  onLangChange(() => { redrawShell(); drawBar(); });
}

start();
