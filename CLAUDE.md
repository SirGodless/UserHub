# CLAUDE.md: UserHub (UI)

Stand: 12.11.2026. Dieses Repo ist die Oberfläche zum Backend im Schwesterordner `AuthenticationService`. Die verbindliche Spezifikation steht in `../AuthenticationService/CLAUDE.md`. Lies sie zuerst. Bei Widerspruch gilt sie.

Kennzeichnung wie dort: **[E]** entschieden, **[A]** Annahme, **[O]** offen, **[U]** nicht verifiziert.

## Aufgabe dieses Repos

- [E] Der UI-Container zeigt Hub (mit Sidebar der nutzbaren Dienste und Statusanzeige), Admin-Dashboard, Profilseite sowie die Login-, Registrierungs-, Passwort-Reset- und Setup-Seiten.
- [E] Technik: einfaches HTML, CSS und JavaScript ohne großes Framework. Ein eigener Container, getrennt vom Backend.
- [E] Die UI spricht nur mit der Backend-API. Keine Geschäftslogik und keine Rechteentscheidung in der UI, das Backend entscheidet.
- [O] Wie sich die UI gegenüber der API authentifiziert, ist offen (siehe Hauptdatei, Abschnitt 8). Erst vorschlagen und Joshua fragen.

## Design

- [E] Modern, freundlich und verspielt, Dark Mode zuerst. Nicht der anfall.net-Look (kein Schwarz mit Rot und Cyan, keine Scanlines).
- [A] Etappe 6 beginnt mit 2 bis 3 Stilvorschlägen als statische Mockup-Seiten (Login und Hub-Startseite), Joshua wählt. Davor schlichtes, funktionales Styling mit CSS-Variablen. Light Mode später.
- [E] Die UI-Sprache ist pro Account einstellbar. Standard ist Englisch, als Alternative gibt es Deutsch. Alle Texte liegen in Sprachdateien (`en` und `de`), nichts steht fest im Code. Die Details (Umschalter vor dem Login, Registrierung, Mails) stehen in der Hauptdatei, Abschnitt 8.
- [A] Keine externen Schriften oder CDNs, alles selbst hosten. Grundlegende Barrierefreiheit (Kontrast, Tastaturbedienung).
- [A] Die Login-Seite wird unter `auth.anfall.net` ausgeliefert. Caddy verteilt dort die Pfade an Backend und UI (siehe Hauptdatei, Abschnitt 2). Login und Admin dürfen nicht in Frames eingebettet werden.

## Arbeitsregeln

Es gelten alle Arbeitsregeln aus Abschnitt 0 der Hauptdatei. Kurz:

1. Deutsch in Antworten, Doku und Kommentaren, Bezeichner Englisch. Keine Gedankenstriche.
2. Nichts erfinden. Bei Lücken in `docs/OPEN-QUESTIONS.md` eintragen und fragen.
3. Gegen aktuelle offizielle Doku prüfen. Was nicht prüfbar war, als "nicht verifiziert" kennzeichnen.
4. Widersprechen, wenn eine Vorgabe falsch oder unsicher ist.
5. Code einfach und lesbar halten, Joshua soll ihn verstehen.
6. Branch pro Etappe, Pull Request, kein Push auf `main`, kein Force-Push. Nächste Etappe erst nach Freigabe.
7. Keine Secrets im Repo.
