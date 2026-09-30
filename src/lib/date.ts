/** Asia/Seoul calendar date as YYYY-MM-DD */
export function seoulDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function formatKoreanDate(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}
