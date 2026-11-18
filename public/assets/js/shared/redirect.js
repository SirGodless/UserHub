// Wohin es nach dem Login geht. Ein Dienst schickt den Browser an /oauth2/authorize, das Backend leitet auf
// /login?continue=<diese Adresse> um. Nach dem Login geht es genau dorthin zurück.
// Auch die eigenen Seiten Admin-Dashboard und 2FA-Einstellungen leiten bei fehlender Anmeldung hierher um.
// Erlaubt sind nur diese festen Ziele. Alles andere wird ignoriert (kein offener Redirect).
const OWN_PAGES = ["/admin", "/account/2fa", "/account/links"];
export function afterLoginTarget() {
  const wanted = new URLSearchParams(location.search).get("continue");
  if (wanted && wanted.startsWith("/oauth2/authorize?")) return wanted;
  if (OWN_PAGES.includes(wanted)) return wanted;
  return "/";
}
