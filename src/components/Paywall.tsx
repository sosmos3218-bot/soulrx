import Link from "next/link";

export function Paywall() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-center shadow-sm">
      <div className="mb-2 text-3xl" aria-hidden>
        🙏
      </div>
      <h2 className="mb-2 text-lg font-semibold text-stone-800">
        오늘은 이미 처방을 받으셨어요
      </h2>
      <p className="mb-2 text-sm leading-relaxed text-stone-600">
        내일 다시 만나요.
        <br />
        하루를 천천히 소화할 수 있도록, 무료는 하루 한 번이에요.
      </p>
      <p className="mb-6 text-xs text-stone-400">무제한 이용은 준비 중이에요.</p>
      <div className="flex flex-col gap-2">
        <Link
          href="/history"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          오늘 기록 다시 보기
        </Link>
        <Link
          href="/"
          className="w-full rounded-xl px-4 py-3 text-sm font-medium text-stone-500 hover:text-stone-700"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
