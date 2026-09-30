import type { DailyLimit, HistoryEntry } from "./types";
import {
  getDailyLimit,
  getHistory,
  saveHistoryEntry as saveLocalHistory,
  recordPrescriptionView as recordLocalView,
  canViewPrescription as canViewLocal,
} from "./storage";
import { seoulDate } from "./date";

const FREE_LIMIT = 1;
const HISTORY_KEY = "soulrx_history";
const DAILY_KEY = "soulrx_daily";
const MIGRATE_FLAG_PREFIX = "soulrx_cloud_migrated_";

export function hasLocalDataToSync(): boolean {
  if (typeof window === "undefined") return false;
  const history = getHistory();
  const daily = getDailyLimit();
  return history.length > 0 || daily.count > 0;
}

export function isMigrated(userId: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(MIGRATE_FLAG_PREFIX + userId) === "1";
}

export function markMigrated(userId: string): void {
  localStorage.setItem(MIGRATE_FLAG_PREFIX + userId, "1");
}

function cacheHistoryEntry(entry: HistoryEntry): void {
  try {
    const existing = getHistory().filter((e) => e.id !== entry.id);
    const next = [entry, ...existing].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore cache errors
  }
}

export async function fetchCloudHistory(): Promise<HistoryEntry[]> {
  const res = await fetch("/api/history");
  if (!res.ok) throw new Error("history fetch failed");
  const data = (await res.json()) as { entries: HistoryEntry[] };
  return data.entries;
}

export async function saveCloudHistoryEntry(
  entry: Omit<HistoryEntry, "id" | "savedAt" | "date"> &
    Partial<Pick<HistoryEntry, "id" | "savedAt" | "date">>
): Promise<HistoryEntry> {
  const res = await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("history save failed");
  const data = (await res.json()) as { entry: HistoryEntry };
  return data.entry;
}

export async function fetchCloudDaily(): Promise<DailyLimit> {
  const res = await fetch("/api/daily");
  if (!res.ok) throw new Error("daily fetch failed");
  return (await res.json()) as DailyLimit;
}

export async function incrementCloudDaily(): Promise<DailyLimit> {
  const res = await fetch("/api/daily", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("daily increment failed");
  return (await res.json()) as DailyLimit;
}

export async function migrateLocalToCloud(): Promise<{
  migratedHistory: number;
  migratedDaily: boolean;
}> {
  const history = getHistory();
  const daily = getDailyLimit();
  const payload = {
    history,
    daily: daily.count > 0 ? daily : null,
  };
  const res = await fetch("/api/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("migrate failed");
  return (await res.json()) as {
    migratedHistory: number;
    migratedDaily: boolean;
  };
}

/** Load history: cloud when signed in, else localStorage. */
export async function loadHistory(signedIn: boolean): Promise<HistoryEntry[]> {
  if (!signedIn) return getHistory();
  try {
    return await fetchCloudHistory();
  } catch {
    return getHistory();
  }
}

/** Save history entry to cloud or local. */
export async function persistHistoryEntry(
  signedIn: boolean,
  entry: Omit<HistoryEntry, "id" | "savedAt" | "date">
): Promise<HistoryEntry> {
  if (!signedIn) return saveLocalHistory(entry);
  try {
    const saved = await saveCloudHistoryEntry(entry);
    cacheHistoryEntry(saved);
    return saved;
  } catch {
    return saveLocalHistory(entry);
  }
}

export async function checkCanView(signedIn: boolean): Promise<boolean> {
  if (!signedIn) return canViewLocal();
  try {
    const daily = await fetchCloudDaily();
    const today = seoulDate();
    if (daily.date !== today) return true;
    return daily.count < FREE_LIMIT;
  } catch {
    return canViewLocal();
  }
}

export async function recordView(signedIn: boolean): Promise<DailyLimit> {
  if (!signedIn) return recordLocalView();
  try {
    const next = await incrementCloudDaily();
    localStorage.setItem(DAILY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return recordLocalView();
  }
}
