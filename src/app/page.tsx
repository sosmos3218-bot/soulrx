"use client";

import Link from "next/link";
import { EMOTIONS, EMOTION_SLUG, type Emotion } from "@/lib/types";
import { Suspense } from "react";
import { Onboarding } from "@/components/Onboarding";
import { CheckoutReturn } from "@/components/CheckoutReturn";
import { DailyReminder } from "@/components/DailyReminder";

const emoji: Record<Emotion, string> = {
  기쁨: "😊",
  감사: "🙏",
  불안: "😟",
  슬픔: "😢",
  분노: "😤",
  지침: "😮‍💨",
};

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={null}>
        <CheckoutReturn />
      </Suspense>
      <Onboarding />

      <header className="mb-6 text-center">
        <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-sky-600">
          QUIET TIME
        </p>
        <h1 className="mb-2 font-serif text-3xl font-bold text-stone-800">
          SoulRx
        </h1>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-stone-600">
          <span className="font-medium text-stone-700">감정</span>
          <span className="mx-1.5 text-stone-300">→</span>
          <span className="font-medium text-stone-700">상황</span>
          <span className="mx-1.5 text-stone-300">→</span>
          <span className="font-medium text-stone-700">말씀 처방</span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-stone-500">
          마음에 가까운 감정을 고르면
          <br />
          구절·묵상·기도가 따라오는 짧은 큐티예요.
        </p>
      </header>

      <div className="mb-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <a
          href="#emotions"
          className="inline-flex rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
        >
          오늘 마음 고르기
        </a>
        <Link
          href="/pricing"
          className="inline-flex rounded-xl px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50/80"
        >
          무제한 · 요금 보기
        </Link>
      </div>

      <p
        id="emotions"
        className="mb-4 scroll-mt-4 text-center text-xs text-stone-400"
      >
        지금 마음에 가까운 감정을 골라 주세요
      </p>

      <div className="grid grid-cols-2 gap-3">
        {EMOTIONS.map((e) => (
          <Link
            key={e}
            href={`/situation?emotion=${EMOTION_SLUG[e]}`}
            className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-white/80 px-4 py-6 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/50 active:scale-[0.98]"
          >
            <span className="text-2xl" aria-hidden>
              {emoji[e]}
            </span>
            <span className="text-base font-semibold text-stone-800">{e}</span>
          </Link>
        ))}
      </div>

      <DailyReminder />

      <p className="mt-6 text-center text-[11px] leading-relaxed text-stone-400">
        말씀 앞에서 오늘의 마음을 살피고
        <br />
        작은 걸음을 내딛는 짧은 큐티예요.
      </p>
    </main>
  );
}
