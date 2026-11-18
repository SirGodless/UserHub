// Rechte eines Links als Text ("service.vault, links.max_active: 2").
import { t } from "/assets/js/shared/i18n.js";

export function describeGrants(grants) {
  if (!grants || !grants.length) return t("links.none");
  return grants.map((g) => (g.unlimited ? `${g.key}: ${t("links.unlimited")}` : g.number !== null && g.number !== undefined ? `${g.key}: ${g.number}` : g.key)).join(", ");
}

// Status eines Links als Text, bei deaktivierten Links mit Grund
export function describeStatus(link) {
  const status = t("links.status." + link.status);
  return link.status === "deactivated" && link.statusReason ? `${status} (${t("links.reason." + link.statusReason)})` : status;
}
