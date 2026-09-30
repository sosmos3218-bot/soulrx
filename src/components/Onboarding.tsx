"use client";

import { useEffect, useState } from "react";
import { hasOnboarded, setOnboarded } from "@/lib/storage";

const STEPS = [
  {
    n: "1",
    title: "감정 고르기",
    body: "기쁨·감사·불안·슬픔·분노·지침 중 오늘의 마음을 고릅니다.",
  },
  {
    n: "2",
    title: "상황 고르기",
    body: "직장·관계·가정·신앙·그냥 오늘 — 그 감정이 머무는 자리를 고릅니다.",
  },
  {
    n: "3",
    title: "말씀 처방전",
    body: "구절·해설·묵상 3스텝·짧은 기도를 받습니다. 마음을 살피는 짧은 큐티예요.",
  },
] as const;

export function Onboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!hasOnboarded());
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboard-title"
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-[#faf7f2] p-6 shadow-xl"
      >
        <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-sky-600">
          SOULRX
        </p>
        <h2
          id="onboard-title"
          className="mb-1 font-serif text-xl font-bold text-stone-800"
        >
          오늘 마음에 맞는 말씀 처방
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-stone-500">
          점술·운세가 아닙니다. 그리스도 안에서 감정을 살피고
          <br className="hidden sm:inline" />
          말씀으로 한 걸음 내딛는 짧은 자기 성찰이에요.
        </p>

        <ol className="mb-5 space-y-3">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-medium text-stone-800">{s.title}</p>
                <p className="text-xs leading-relaxed text-stone-500">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mb-5 text-center text-xs text-stone-400">
          무료는 하루 한 번의 처방이에요 · 한 번만 보여 드려요
        </p>

        <button
          type="button"
          onClick={() => {
            setOnboarded();
            setOpen(false);
          }}
          className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-700"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
