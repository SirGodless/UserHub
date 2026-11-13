# Entscheidungen (UserHub)

Die Entscheidungen und Annahmen für beide Repos stehen gesammelt in
`../../AuthenticationService/docs/DECISIONS.md` (Abschnitt "UI (UserHub)"). Dort stehen auch die offenen Fragen in `OPEN-QUESTIONS.md`.

Kurz für Etappe 1: Webserver nginx-unprivileged auf Port 8080, QR-Code-Bibliothek selbst gehostet (`public/assets/vendor`), strenge CSP, Texte in `public/assets/i18n/en.json` und `de.json`.

Etappe 2: Seiten `/login`, `/forgot`, `/reset/<token>`, `/confirm/<token>` und eine Startseite mit Anmelde-Status. Die UI spricht nur mit `/api/auth/*` (gleiche Adresse, Cookies und CSRF-Header siehe `public/assets/js/api.js`). Links in Mails verbrauchen sich erst auf Knopfdruck. Alle Texte in `en.json` und `de.json`.
