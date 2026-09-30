import type { Emotion, HistoryEntry, Situation } from "./types";
import { EMOTIONS, SITUATIONS } from "./types";
import { seoulDate } from "./date";

/** Pastoral one-liners keyed by top emotion — encouraging, not predictive. */
const PASTORAL_BY_EMOTION: Record<Emotion, string> = {
  기쁨: "기쁨이 머문 한 주예요. 그 기쁨의 근원을 기억하며 이웃에게도 조용히 나눠 보세요.",
  감사: "감사의 기록이 많은 한 주예요. 받은 은혜를 다시 떠올리며 짧게 찬양해 보세요.",
  불안: "불안이 자주 찾아온 한 주예요. 오늘도 염려를 주님 앞에 내려놓아 보세요.",
  슬픔: "슬픔을 담아 오신 한 주예요. 하나님은 눈물을 외면하지 않으십니다.",
  분노: "화가 난 마음도 주님 앞에 가져올 수 있어요. 진노를 내려놓고 평안을 구해요.",
  지침: "지친 마음이 많았던 한 주예요. 안식은 의무가 아니라 선물이라는 걸 기억하세요.",
};

export interface WeeklyInsight {
  count: number;
  topEmotion: Emotion | null;
  topSituation: Situation | null;
  pastoralLine: string | null;
}

/** Last 7 Asia/Seoul calendar day keys (today inclusive). */
export function lastSevenSeoulDays(today: string = seoulDate()): Set<string> {
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
  return keep;
}

function mostFrequent<T extends string>(
  values: T[],
  order: readonly T[]
): T | null {
  if (values.length === 0) return null;
  const counts = new Map<T, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: T | null = null;
  let bestCount = 0;
  for (const candidate of order) {
    const c = counts.get(candidate) ?? 0;
    if (c > bestCount) {
      best = candidate;
      bestCount = c;
    }
  }
  return best;
}

/**
 * Aggregate a calm weekly insight from history entries (last 7 Seoul days).
 * Pure / client-safe — no LLM.
 */
export function computeWeeklyInsight(
  entries: HistoryEntry[],
  today: string = seoulDate()
): WeeklyInsight {
  const window = lastSevenSeoulDays(today);
  const week = entries.filter((e) => window.has(e.date));

  if (week.length === 0) {
    return {
      count: 0,
      topEmotion: null,
      topSituation: null,
      pastoralLine: null,
    };
  }

  const topEmotion = mostFrequent(
    week.map((e) => e.emotion),
    EMOTIONS
  );
  const topSituation = mostFrequent(
    week.map((e) => e.situation),
    SITUATIONS
  );

  return {
    count: week.length,
    topEmotion,
    topSituation,
    pastoralLine: topEmotion ? PASTORAL_BY_EMOTION[topEmotion] : null,
  };
}
