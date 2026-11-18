// "Passwort anzeigen" (NIST SP 800-63B-4: Verifier sollen diese Möglichkeit anbieten).
// Ein Kontrollkästchen mit data-show-password="id1 id2" schaltet die genannten Felder zwischen Punkten und Klartext um.
export function initPasswordToggles() {
  for (const box of document.querySelectorAll("input[data-show-password]")) {
    box.addEventListener("change", () => {
      for (const id of box.dataset.showPassword.split(" ")) {
        document.getElementById(id).type = box.checked ? "text" : "password";
      }
    });
  }
}
