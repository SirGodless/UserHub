# Eingebundene Fremdbibliotheken

- `qrcode-esm.js`: qrcode-generator 2.0.4 von Kazuhiko Arase, MIT-Lizenz (Lizenzhinweis steht im Dateikopf).
  Quelle: npm-Paket `qrcode-generator@2.0.4`, Datei `dist/qrcode.mjs`, Inhalt unverändert.
  Nur umbenannt von `.mjs` nach `.js`, weil nginx `.mjs` nicht als JavaScript ausliefert.
  Wird für den QR-Code der Authenticator-App gebraucht. Alles wird selbst ausgeliefert, kein CDN.
