"use client";

import Link from "next/link";
import { EMOTIONS, EMOTION_SLUG, type Emotion } from "@/lib/types";
import { Onboarding } from "@/components/Onboarding";

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
      <Onboarding />
      <header className="mb-8 text-center">
        <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-sky-600">
          QUIET TIME
        </p>
        <h1 className="mb-2 font-serif text-3xl font-bold text-stone-800">
          SoulRx
        </h1>
        <p className="text-sm leading-relaxed text-stone-500">
          오늘 기분에 맞는 말씀 처방
        </p>
      </header>

      <p className="mb-4 text-center text-xs text-stone-400">
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

      <p className="mt-8 text-center text-[11px] leading-relaxed text-stone-400">
        운세·예언이 아닙니다.
        <br />
        말씀 앞에서 마음을 살피는 짧은 큐티예요.
      </p>
    </main>
  );
}
