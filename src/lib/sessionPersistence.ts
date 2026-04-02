export interface EndSummary {
  mode: "emdr" | "art";
  sudStart: number | null;
  sudEnd: number | null;
  details: string[];
  completedAt: string;
}

export interface AppSnapshot {
  appState: "entry" | "safety" | "mode-select" | "session" | "end-summary";
  selectedMode: "trance" | "emdr" | "art" | null;
  endSummary: EndSummary | null;
  updatedAt: string;
}

const APP_SNAPSHOT_KEY = "trance.app.snapshot.v1";
const END_SUMMARY_KEY = "trance.endSummary.latest.v1";
const END_SUMMARY_HISTORY_KEY = "trance.endSummary.history.v1";
const TRANCE_PREFS_KEY = "trance.user.prefs.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadAppSnapshot(): AppSnapshot | null {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(APP_SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppSnapshot;
  } catch {
    return null;
  }
}

export function saveAppSnapshot(snapshot: AppSnapshot): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(APP_SNAPSHOT_KEY, JSON.stringify(snapshot));
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
  const raw = window.localStorage.getItem(END_SUMMARY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EndSummary;
  } catch {
    return null;
  }
}

export function appendSummaryToHistory(summary: EndSummary, maxItems: number = 10): EndSummary[] {
  if (!hasStorage()) return [];
  const existing = loadSummaryHistory();
  const next = [summary, ...existing].slice(0, maxItems);
  window.localStorage.setItem(END_SUMMARY_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function loadSummaryHistory(): EndSummary[] {
  if (!hasStorage()) return [];
  const raw = window.localStorage.getItem(END_SUMMARY_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as EndSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface TrancePrefs {
  voiceEnabled: boolean;
}

export function loadTrancePrefs(): TrancePrefs {
  if (!hasStorage()) return { voiceEnabled: true };
  const raw = window.localStorage.getItem(TRANCE_PREFS_KEY);
  if (!raw) return { voiceEnabled: true };
  try {
    const parsed = JSON.parse(raw) as Partial<TrancePrefs>;
    return { voiceEnabled: parsed.voiceEnabled ?? true };
  } catch {
    return { voiceEnabled: true };
  }
}

export function saveTrancePrefs(prefs: TrancePrefs): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(TRANCE_PREFS_KEY, JSON.stringify(prefs));
}
