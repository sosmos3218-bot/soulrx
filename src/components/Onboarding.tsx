"use client";

import { useEffect, useState } from "react";
import { hasOnboarded, setOnboarded } from "@/lib/storage";

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
          className="mb-3 font-serif text-xl font-bold text-stone-800"
        >
          오늘 기분에 맞는 말씀 처방
        </h2>
        <ul className="mb-6 space-y-2.5 text-sm leading-relaxed text-stone-600">
          <li className="flex gap-2">
            <span className="text-sky-600" aria-hidden>
              ·
            </span>
            <span>감정 고르기 → 상황 → 구절·묵상·기도</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sky-600" aria-hidden>
              ·
            </span>
            <span>무료는 하루 한 번의 처방이에요</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sky-600" aria-hidden>
              ·
            </span>
            <span>점술·운세가 아니라, 마음을 살피는 짧은 큐티입니다</span>
          </li>
        </ul>
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
