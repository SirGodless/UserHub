// Zeigt das TOTP-Geheimnis als QR-Code (für Setup-Seite und 2FA-Seite).
import qrcode from "/assets/vendor/qrcode-esm.js";

export function renderQr(target, issuer, accountName, base32Secret) {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const uri = `otpauth://totp/${label}?secret=${base32Secret}&issuer=${encodeURIComponent(issuer)}` +
    "&algorithm=SHA1&digits=6&period=30";
  const qr = qrcode(0, "M");
  qr.addData(uri);
  qr.make();
  // SVG als Dokument parsen statt innerHTML zu benutzen
  const svg = new DOMParser().parseFromString(qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }), "image/svg+xml");
  target.replaceChildren(document.importNode(svg.documentElement, true));
}
