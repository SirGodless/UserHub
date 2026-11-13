// Wohin es nach dem Login geht. Ein Dienst schickt den Browser an /oauth2/authorize, das Backend leitet auf
// /login?continue=<diese Adresse> um. Nach dem Login geht es genau dorthin zurück.
// Erlaubt sind nur Adressen, die mit /oauth2/authorize? beginnen. Alles andere wird ignoriert (kein offener Redirect).
export function afterLoginTarget() {
  const wanted = new URLSearchParams(location.search).get("continue");
  if (wanted && wanted.startsWith("/oauth2/authorize?") && !wanted.startsWith("//")) return wanted;
  return "/";
}
