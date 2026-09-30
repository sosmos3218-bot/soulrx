"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { useAuth } from "@clerk/nextjs";
import type { Prescription } from "@/lib/types";
import { Chip } from "./Chip";
import { persistHistoryEntry } from "@/lib/cloud";

export function PrescriptionView({ rx }: { rx: Prescription }) {
  const shareRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSaveImage = useCallback(async () => {
    if (!shareRef.current) return;
    setBusy(true);
    setSavedMsg(null);
    try {
      const dataUrl = await toPng(shareRef.current, {
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
      const text = `${rx.verseRef}\n${rx.verse}\n\n${rx.prayer}\n\n— SoulRx`;
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

  const onRecord = useCallback(async () => {
    setBusy(true);
    setSavedMsg(null);
    try {
      await persistHistoryEntry(!!isSignedIn, {
        emotion: rx.emotion,
        situation: rx.situation,
        verseRef: rx.verseRef,
      });
      setSavedMsg(
        isSignedIn
          ? "클라우드 기록에 남겼어요"
          : "이 기기에 남겼어요 · 로그인하면 클라우드에 동기화할 수 있어요"
      );
    } catch {
      setSavedMsg("기록 저장에 실패했어요");
    } finally {
      setBusy(false);
    }
  }, [rx, isSignedIn]);

  return (
    <div className="space-y-4 pb-4">
      {/* Full reading card */}
      <div className="rounded-2xl border border-stone-200 bg-[#faf7f2] px-6 py-7 shadow-sm">
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

      {/* Share-optimized card (captured by html-to-image) */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-9999px] top-0"
      >
        <div
          ref={shareRef}
          style={{
            width: 540,
            padding: "40px 36px 32px",
            backgroundColor: "#faf7f2",
            borderRadius: 24,
            border: "1px solid #e7e5e4",
            fontFamily:
              'ui-serif, Georgia, "Noto Serif KR", "Apple Myungjo", serif',
            color: "#292524",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                borderRadius: 999,
                border: "1px solid #fde68a",
                background: "#fffbeb",
                color: "#78350f",
                fontSize: 13,
                fontWeight: 600,
                padding: "4px 12px",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {rx.emotion}
            </span>
            <span
              style={{
                display: "inline-flex",
                borderRadius: 999,
                border: "1px solid #bae6fd",
                background: "#e0f2fe",
                color: "#075985",
                fontSize: 13,
                fontWeight: 600,
                padding: "4px 12px",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {rx.situation}
            </span>
          </div>

          <p
            style={{
              margin: "0 0 8px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#0369a1",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {rx.verseRef}
          </p>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: 18,
              lineHeight: 1.75,
              wordBreak: "keep-all",
              color: "#1c1917",
            }}
          >
            {rx.verse}
          </p>

          <div
            style={{
              borderRadius: 16,
              background: "rgba(240, 249, 255, 0.85)",
              padding: "16px 18px",
              marginBottom: 28,
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#a8a29e",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              짧은 기도
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
                wordBreak: "keep-all",
                color: "#292524",
              }}
            >
              {rx.prayer}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #e7e5e4",
              paddingTop: 16,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.18em",
                color: "#0284c7",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              SoulRx
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#a8a29e",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              마음을 살피는 말씀 처방
            </span>
          </div>
        </div>
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
          disabled={busy}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
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
