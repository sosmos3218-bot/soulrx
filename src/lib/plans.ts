export type PlanId = "monthly" | "annual";

export const TRIAL_DAYS = 7;

export const PLANS = {
  monthly: {
    id: "monthly" as const,
    interval: "month" as const,
    unitAmount: 3900,
    label: "월간",
    priceLabel: "₩3,900",
    periodLabel: "/월",
    productName: "SoulRx 무제한 (월간)",
    productDescription:
      "하루 처방 횟수 제한 없이 말씀 처방을 이용합니다. 7일 무료 체험 포함.",
  },
  annual: {
    id: "annual" as const,
    interval: "year" as const,
    unitAmount: 39000,
    label: "연간",
    priceLabel: "₩39,000",
    periodLabel: "/년",
    productName: "SoulRx 무제한 (연간)",
    productDescription:
      "하루 처방 횟수 제한 없이 말씀 처방을 이용합니다. 약 2개월 무료 · 7일 무료 체험 포함.",
    savingsLabel: "2개월 무료",
    monthlyEquivalent: "월 환산 약 ₩3,250",
  },
} as const;

export function parsePlan(value: unknown): PlanId {
  return value === "annual" ? "annual" : "monthly";
}
