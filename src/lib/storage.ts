import type { DailyLimit, HistoryEntry } from "./types";
import { seoulDate } from "./date";

const DAILY_KEY = "soulrx_daily";
const HISTORY_KEY = "soulrx_history";
const FREE_LIMIT = 1;

export function getDailyLimit(): DailyLimit {
  if (typeof window === "undefined") {
    return { date: seoulDate(), count: 0 };
  }
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return { date: seoulDate(), count: 0 };
    const parsed = JSON.parse(raw) as DailyLimit;
    const today = seoulDate();
    if (parsed.date !== today) {
      return { date: today, count: 0 };
    }
    return parsed;
  } catch {
    return { date: seoulDate(), count: 0 };
  }
}

export function canViewPrescription(): boolean {
  return getDailyLimit().count < FREE_LIMIT;
}

export function recordPrescriptionView(): DailyLimit {
  const today = seoulDate();
  const current = getDailyLimit();
  const next: DailyLimit =
    current.date === today
      ? { date: today, count: current.count + 1 }
      : { date: today, count: 1 };
  localStorage.setItem(DAILY_KEY, JSON.stringify(next));
  return next;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as HistoryEntry[];
    const cutoff = new Date();
    // Keep last 7 Seoul calendar days
    const today = seoulDate();
    const [y, m, d] = today.split("-").map(Number);
    const keep = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const dt = new Date(Date.UTC(y, m - 1, d - i));
      const key = new Intl.DateTimeFormat("en-CA", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dt);
      keep.add(key);
    }
    void cutoff;
    return list.filter((e) => keep.has(e.date));
  } catch {
    return [];
  }
}

export function saveHistoryEntry(
  entry: Omit<HistoryEntry, "id" | "savedAt" | "date">
): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: seoulDate(),
    savedAt: new Date().toISOString(),
  };
  const existing = getHistory();
  const next = [full, ...existing].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return full;
}

const ONBOARD_KEY = "soulrx_onboarded";

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARD_KEY) === "1";
}

export function setOnboarded(): void {
  localStorage.setItem(ONBOARD_KEY, "1");
}
