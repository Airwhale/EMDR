export const SNAPSHOT_VERSION = 2;
export const SNAPSHOT_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24h

export function safeParseJSON(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isFreshIsoDate(iso, maxAgeMs = SNAPSHOT_MAX_AGE_MS) {
  if (typeof iso !== "string") return false;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= maxAgeMs;
}

export function clampHistory(list, maxItems = 10) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, maxItems);
}
