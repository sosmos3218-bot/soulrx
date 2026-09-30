"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import type { Prescription } from "@/lib/types";
import { Chip } from "./Chip";
import { saveHistoryEntry } from "@/lib/storage";

export function PrescriptionView({ rx }: { rx: Prescription }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSaveImage = useCallback(async () => {
    if (!cardRef.current) return;
    setBusy(true);
    setSavedMsg(null);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#faf7f2",
      });
      const a = document.createElement("a");
      a.download = `soulrx-${rx.emotion}-${rx.situation}.png`;
      a.href = dataUrl;
      a.click();
      setSavedMsg("이미지를 저장했어요");
    } catch {
      // Fallback: copy verse + prayer
      const text = `${rx.verseRef}\n${rx.verse}\n\n${rx.prayer}`;
      try {
        await navigator.clipboard.writeText(text);
        setSavedMsg("이미지 저장에 실패해 말씀·기도를 복사했어요");
      } catch {
        setSavedMsg("저장에 실패했어요. 다시 시도해 주세요");
      }
    } finally {
      setBusy(false);
    }
  }, [rx]);

  const onRecord = useCallback(() => {
    saveHistoryEntry({
      emotion: rx.emotion,
      situation: rx.situation,
      verseRef: rx.verseRef,
    });
    setSavedMsg("기록에 남겼어요");
  }, [rx]);

  return (
    <div className="space-y-4 pb-4">
      <div
        ref={cardRef}
        className="rounded-2xl border border-stone-200 bg-[#faf7f2] px-6 py-7 shadow-sm"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <Chip>{rx.emotion}</Chip>
          <Chip tone="sky">{rx.situation}</Chip>
        </div>

        <p className="mb-1 text-xs font-semibold tracking-wide text-sky-700">
          {rx.verseRef}
        </p>
        <blockquote className="mb-5 break-keep font-serif text-[1.05rem] leading-[1.7] text-stone-800">
          {rx.verse}
        </blockquote>

        <section className="mb-5">
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
            해설
          </h3>
          <p className="text-sm leading-relaxed text-stone-700">
            {rx.commentary}
          </p>
        </section>

        <section className="mb-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
            묵상 3스텝
          </h3>
          <ol className="space-y-2">
            {rx.steps.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl bg-white/70 px-3 py-2.5 text-sm text-stone-700"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
            짧은 기도
          </h3>
          <p className="break-keep rounded-xl bg-sky-50/80 px-4 py-4 font-serif text-sm leading-[1.7] text-stone-800">
            {rx.prayer}
          </p>
        </section>
      </div>

      {savedMsg && (
        <p className="text-center text-sm text-sky-700" role="status">
          {savedMsg}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onSaveImage}
          disabled={busy}
          className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {busy ? "저장 중…" : "이미지로 저장"}
        </button>
        <button
          type="button"
          onClick={onRecord}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          기록 남기기
        </button>
        <Link
          href="/"
          className="w-full rounded-xl px-4 py-3 text-center text-sm font-medium text-stone-500 hover:text-stone-700"
        >
          다시 고르기
        </Link>
      </div>
    </div>
  );
}
