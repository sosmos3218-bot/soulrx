"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  EMOTION_SLUG,
  SITUATIONS,
  SITUATION_SLUG,
  SLUG_TO_EMOTION,
  type Emotion,
} from "@/lib/types";

function SituationInner() {
  const params = useSearchParams();
  const slug = params.get("emotion") ?? "";
  const emotion: Emotion | undefined = SLUG_TO_EMOTION[slug];

  if (!emotion) {
    return (
      <main className="text-center">
        <p className="mb-4 text-stone-600">감정을 먼저 골라 주세요.</p>
        <Link href="/" className="text-sky-700 underline">
          홈으로
        </Link>
      </main>
    );
  }

  return (
    <main>
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-stone-400 hover:text-stone-600"
      >
        ← 감정 다시 고르기
      </Link>

      <header className="mb-6 text-center">
        <p className="mb-1 text-sm text-stone-500">
          <span className="font-semibold text-stone-700">{emotion}</span> 중이에요
        </p>
        <h1 className="font-serif text-2xl font-bold text-stone-800">
          어떤 자리에서요?
        </h1>
      </header>

      <div className="flex flex-col gap-2.5">
        {SITUATIONS.map((s) => (
          <Link
            key={s}
            href={`/rx/${EMOTION_SLUG[emotion]}/${SITUATION_SLUG[s]}`}
            className="rounded-2xl border border-stone-200 bg-white/80 px-5 py-4 text-center text-base font-medium text-stone-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/50 active:scale-[0.99]"
          >
            {s}
          </Link>
        ))}
      </div>
    </main>
  );
}

export default function SituationPage() {
  return (
    <Suspense
      fallback={
        <main className="text-center text-sm text-stone-400">불러오는 중…</main>
      }
    >
      <SituationInner />
    </Suspense>
  );
}
