const REMINDER_KEY = "soulrx_reminder_at";

/** ISO timestamp of next local reminder, or null if unset. */
export function getReminderAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return null;
    const t = Date.parse(raw);
    if (Number.isNaN(t)) return null;
    return new Date(t).toISOString();
  } catch {
    return null;
  }
}

/** Schedule a reminder for ~24h from now (same local clock time tomorrow). */
export function scheduleTomorrowReminder(): string {
  const at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  localStorage.setItem(REMINDER_KEY, at);
  return at;
}

export function clearReminder(): void {
  localStorage.removeItem(REMINDER_KEY);
}

export function formatReminderTime(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

/**
 * If a scheduled reminder is due and Notification permission is granted,
 * show one notification and clear the schedule. Returns true if fired.
 */
export function maybeFireDueReminder(): boolean {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const raw = localStorage.getItem(REMINDER_KEY);
  if (!raw) return false;
  const at = Date.parse(raw);
  if (Number.isNaN(at) || Date.now() < at) return false;

  try {
    new Notification("SoulRx — 오늘도 마음을 살피세요", {
      body: "감정 → 상황 → 말씀 처방. 조용한 큐티를 이어 가 보세요.",
      tag: "soulrx-daily-reminder",
      lang: "ko",
    });
  } catch {
    return false;
  }

  clearReminder();
  return true;
}

export function notificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}
