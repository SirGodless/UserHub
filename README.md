# UserHub

Die Oberfläche zum Backend im Schwesterrepo `AuthenticationService` (muss im Nachbarordner liegen): Setup des ersten
Admins, Anmelden, Passwort vergessen, E-Mail bestätigen und eine Startseite. Hub, Admin-Dashboard und Profilseite folgen.
Einfaches HTML, CSS und JavaScript ohne Framework. Die verbindliche Spezifikation steht in
`../AuthenticationService/CLAUDE.md`.

**Stand:** Etappe 3. Dazu kommt die Seite "Kein Zugang" (`/access-denied`) und der Rücksprung nach dem Login zu einem Dienst.

## Ordnerübersicht

| Ordner | Was dort liegt |
| :- | :- |
| `public/` | Alles, was der Webserver ausliefert. Die Startseite (`index.html`) liegt direkt hier. |
| `public/pages/` | Eine HTML-Datei pro Seite. Der Dateiname entspricht der Adresse (`login.html` für `/login`). |
| `public/assets/js/pages/` | Ein Skript pro Seite, gleicher Name wie die Seite. Es enthält nur, was diese Seite tut. |
| `public/assets/js/shared/` | Was mehrere Seiten brauchen: Aufrufe an das Backend (`api.js`), Übersetzung (`i18n.js`), "Passwort anzeigen" (`password-toggle.js`), Rücksprung nach dem Login zu einem Dienst (`redirect.js`). |
| `public/assets/css/` | Gestaltung: Farben (`tokens.css`), Seitenaufbau (`layout.css`), Formulare (`forms.css`), Setup-Seite (`setup.css`). |
| `public/assets/i18n/` | Texte nach Sprache und Thema (`en/login.json`, `de/login.json`, ...). Jede Seite nennt im `body`, welche Themen sie lädt. |
| `public/assets/vendor/` | Fremdbibliotheken mit Herkunft und Lizenz (QR-Code). Kein CDN, alles wird selbst ausgeliefert. |
| `nginx/` | Konfiguration des Webservers im Container: Adressen der Seiten und Sicherheits-Header. |
| `tests/` | Prüfungen, die ohne Browser laufen (`check-i18n.js`). Der Test im Browser liegt im Backend-Repo (`tests/e2e/`). |
| `docs/` | Verweis auf die Entscheidungen (sie stehen gesammelt im Backend-Repo). |
| `Dockerfile` | Image des UI-Containers (nginx ohne Root-Rechte, Port 8080). |

## Starten

Die UI läuft im Compose-Stack des Backend-Repos, siehe dessen `README.md`:

```bash
cd ../AuthenticationService
docker compose up -d --build
```

Der Container lauscht intern auf Port 8080 per HTTP. HTTPS und Zertifikate übernimmt Caddy.

## Testen

```bash
node tests/check-i18n.js    # en und de gleich vollständig, jede Seite findet ihre Texte
```

Der Durchlauf im echten Browser (Setup, Login mit 2FA, Passwort vergessen) liegt im Backend-Repo:
`../AuthenticationService/tests/e2e/run.sh`.

## Texte ändern oder eine Sprache ergänzen

Alle Texte stehen in `public/assets/i18n/<sprache>/<thema>.json`, nichts steht fest im Code. Eine neue Sprache ist ein
neuer Ordner mit denselben Dateinamen. Danach `node tests/check-i18n.js` ausführen.
