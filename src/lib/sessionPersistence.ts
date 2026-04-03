import {
  SNAPSHOT_MAX_AGE_MS,
  SNAPSHOT_VERSION,
  clampHistory,
  isFreshIsoDate,
  safeParseJSON,
} from "./sessionPersistenceCore.mjs";

export interface EndSummary {
  mode: "emdr" | "art";
  sudStart: number | null;
  sudEnd: number | null;
  details: string[];
  completedAt: string;
}

export interface AppSnapshot {
  version?: number;
  appState: "entry" | "safety" | "mode-select" | "session" | "end-summary";
  selectedMode: "trance" | "emdr" | "art" | null;
  endSummary: EndSummary | null;
  updatedAt: string;
}

const APP_SNAPSHOT_KEY = "trance.app.snapshot.v1";
const END_SUMMARY_KEY = "trance.endSummary.latest.v1";
const END_SUMMARY_HISTORY_KEY = "trance.endSummary.history.v1";
const TRANCE_PREFS_KEY = "trance.user.prefs.v1";
const SAFETY_ACK_KEY = "trance.safety.ack.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadAppSnapshot(): AppSnapshot | null {
  if (!hasStorage()) return null;
  const parsed = safeParseJSON(window.localStorage.getItem(APP_SNAPSHOT_KEY)) as AppSnapshot | null;
  if (!parsed) return null;
  if (parsed.version !== SNAPSHOT_VERSION) return null;
  if (!isFreshIsoDate(parsed.updatedAt, SNAPSHOT_MAX_AGE_MS)) return null;
  return parsed;
}

export function saveAppSnapshot(snapshot: AppSnapshot): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(APP_SNAPSHOT_KEY, JSON.stringify({
    ...snapshot,
    version: SNAPSHOT_VERSION,
  }));
}

export function clearAppSnapshot(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(APP_SNAPSHOT_KEY);
}

export function saveLatestEndSummary(summary: EndSummary): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(END_SUMMARY_KEY, JSON.stringify(summary));
}

export function loadLatestEndSummary(): EndSummary | null {
  if (!hasStorage()) return null;
  return safeParseJSON(window.localStorage.getItem(END_SUMMARY_KEY)) as EndSummary | null;
}

export function appendSummaryToHistory(summary: EndSummary, maxItems: number = 10): EndSummary[] {
  if (!hasStorage()) return [];
  const existing = loadSummaryHistory();
  const next = clampHistory([summary, ...existing], maxItems);
  window.localStorage.setItem(END_SUMMARY_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function loadSummaryHistory(): EndSummary[] {
  if (!hasStorage()) return [];
  const parsed = safeParseJSON(window.localStorage.getItem(END_SUMMARY_HISTORY_KEY)) as EndSummary[] | null;
  return Array.isArray(parsed) ? parsed : [];
}

export interface TrancePrefs {
  voiceEnabled: boolean;
}

export function loadTrancePrefs(): TrancePrefs {
  if (!hasStorage()) return { voiceEnabled: true };
  const parsed = safeParseJSON(window.localStorage.getItem(TRANCE_PREFS_KEY)) as Partial<TrancePrefs> | null;
  return { voiceEnabled: parsed?.voiceEnabled ?? true };
}

export function saveTrancePrefs(prefs: TrancePrefs): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(TRANCE_PREFS_KEY, JSON.stringify(prefs));
}

export function hasAcknowledgedSafety(): boolean {
  if (!hasStorage()) return false;
  return window.localStorage.getItem(SAFETY_ACK_KEY) === "true";
}

export function saveSafetyAcknowledged(): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(SAFETY_ACK_KEY, "true");
}
