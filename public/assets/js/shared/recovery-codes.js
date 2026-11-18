// Wiederherstellungscodes anzeigen, kopieren und als Textdatei speichern (Setup-Seite und 2FA-Seite).
import { t } from "/assets/js/shared/i18n.js";

export function showCodes(listEl, codes) {
  listEl.replaceChildren(...codes.map((c) => {
    const li = document.createElement("li");
    li.textContent = c;
    return li;
  }));
}

export function initCodeButtons(copyBtn, downloadBtn, getCodes) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getCodes().join("\n"));
      copyBtn.textContent = t("action.copied");
    } catch { /* Zwischenablage nicht erlaubt: Nutzer kann die Codes markieren */ }
  });
  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([getCodes().join("\n") + "\n"], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
