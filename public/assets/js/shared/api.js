// Kleine Hilfe für Aufrufe an die Backend-API. Die UI trifft keine Entscheidungen, sie zeigt nur die Antworten.
// Schreibende Aufrufe schicken den CSRF-Token aus dem Cookie XSRF-TOKEN als Header zurück.
function csrfToken() {
  const match = document.cookie.split("; ").find((c) => c.startsWith("XSRF-TOKEN="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export async function api(method, path, body) {
  try {
    const headers = {};
    if (method !== "GET") {
      headers["Content-Type"] = "application/json";
      // Das Cookie kommt mit jeder Antwort des Backends. Beim ersten Mal holen wir es per Lesezugriff.
      if (!csrfToken()) await fetch("/api/auth/me", { cache: "no-store" });
      const token = csrfToken();
      if (token) headers["X-XSRF-TOKEN"] = token;
    }
    const res = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
    let data = {};
    try { data = await res.json(); } catch { /* leere Antwort */ }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "network" } };
  }
}

export const tokenFromPath = () => decodeURIComponent(location.pathname.split("/")[2] || "");

const views = new Map();
export function useViews(ids) {
  views.set("ids", ids);
}
export function show(id) {
  for (const v of views.get("ids")) document.getElementById(v).hidden = v !== id;
}

// Fehler als Code merken, damit sie beim Sprachwechsel neu übersetzt werden
export function setError(t, elId, code) {
  const el = document.getElementById(elId);
  if (code) {
    el.dataset.errorCode = code;
    el.textContent = t("error." + code);
  } else {
    delete el.dataset.errorCode;
    el.textContent = "";
  }
}
