export type Emotion =
  | "기쁨"
  | "감사"
  | "불안"
  | "슬픔"
  | "분노"
  | "지침";

export type Situation =
  | "직장"
  | "관계"
  | "가정"
  | "신앙"
  | "그냥 오늘";

export const EMOTIONS: Emotion[] = [
  "기쁨",
  "감사",
  "불안",
  "슬픔",
  "분노",
  "지침",
];

export const SITUATIONS: Situation[] = [
  "직장",
  "관계",
  "가정",
  "신앙",
  "그냥 오늘",
];

export const EMOTION_SLUG: Record<Emotion, string> = {
  기쁨: "joy",
  감사: "gratitude",
  불안: "anxiety",
  슬픔: "sorrow",
  분노: "anger",
  지침: "weary",
};

export const SITUATION_SLUG: Record<Situation, string> = {
  직장: "work",
  관계: "relationship",
  가정: "family",
  신앙: "faith",
  "그냥 오늘": "today",
};

export const SLUG_TO_EMOTION: Record<string, Emotion> = Object.fromEntries(
  Object.entries(EMOTION_SLUG).map(([k, v]) => [v, k as Emotion])
) as Record<string, Emotion>;

export const SLUG_TO_SITUATION: Record<string, Situation> = Object.fromEntries(
  Object.entries(SITUATION_SLUG).map(([k, v]) => [v, k as Situation])
) as Record<string, Situation>;

export interface Prescription {
  emotion: Emotion;
  situation: Situation;
  verseRef: string;
  verse: string;
  commentary: string;
  steps: [string, string, string];
  prayer: string;
  isFull?: boolean;
}

export interface HistoryEntry {
  id: string;
  date: string;
  emotion: Emotion;
  situation: Situation;
  verseRef: string;
  savedAt: string;
}

export interface DailyLimit {
  date: string;
  count: number;
}
