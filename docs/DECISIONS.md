# Entscheidungen (UserHub)

Die Entscheidungen und Annahmen für beide Repos stehen gesammelt in
`../../AuthenticationService/docs/DECISIONS.md` (Inhaltsverzeichnis) und `../../AuthenticationService/docs/decisions/`.
Für dieses Repo sind vor allem relevant:

- `ui.md`: Webserver (nginx ohne Root), selbst gehostete QR-Bibliothek, strenge Sicherheits-Header, Sprachumschalter, Passwortfelder nach NIST.
- `code-structure.md`: Aufbau von `public/` (Seiten, Skripte, CSS, Sprachdateien nach Thema) und warum.

Kurz zum Stand: Seiten `/invite/<token>` und `/account/links` (ab Etappe 5, siehe `invite-links.md`), `/admin` und `/account/2fa` (ab Etappe 4, siehe `admin-dashboard.md` und `two-factor-settings.md`), `/access-denied` (ab Etappe 3), `/login`, `/forgot`, `/reset/<token>`, `/confirm/<token>`, `/setup/<token>` und eine Startseite mit
Anmelde-Status. Die UI spricht nur mit `/api/auth/*`, `/api/setup/*` und `/api/admin/*` (gleiche Adresse, Cookies und CSRF-Header über
`public/assets/js/shared/api.js`). Links in Mails verbrauchen sich erst auf Knopfdruck.
