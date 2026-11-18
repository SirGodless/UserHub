// Seite "Kein Zugang": Der Provider leitet hierher, wenn dem angemeldeten User das Recht für einen Dienst fehlt.
// Der Name des Dienstes kommt als Parameter "service". Er wird nur als Text eingesetzt (nie als HTML).
import { initI18n } from "/assets/js/shared/i18n.js";

document.getElementById("service").textContent = new URLSearchParams(location.search).get("service") || "";
initI18n();
