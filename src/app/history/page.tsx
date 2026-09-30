"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { loadHistory } from "@/lib/cloud";
import type { HistoryEntry } from "@/lib/types";
import { formatKoreanDate } from "@/lib/date";
import { Chip } from "@/components/Chip";
import { SyncPrompt } from "@/components/SyncPrompt";

export default function HistoryPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    (async () => {
      const list = await loadHistory(!!isSignedIn);
      if (!cancelled) setEntries(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  return (
    <main>
      <header className="mb-6 text-center">
        <h1 className="mb-1 font-serif text-2xl font-bold text-stone-800">
          기록
        </h1>
        <p className="text-sm text-stone-500">
          최근 7일
          {isSignedIn ? " · 클라우드" : " · 이 기기"}
        </p>
      </header>

      <SyncPrompt />

      {entries === null ? (
        <p className="text-center text-sm text-stone-400">불러오는 중…</p>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-5 py-12 text-center">
          <p className="mb-1 text-base font-medium text-stone-700">
            아직 기록이 비어 있어요
          </p>
          <p className="mb-5 text-sm leading-relaxed text-stone-500">
            오늘의 감정을 고르고 처방을 받은 뒤
            <br />
            「기록 남기기」를 누르면 여기에 쌓여요.
            {!isSignedIn && (
              <>
                <br />
                로그인하면 클라우드에 안전하게 남겨 둘 수 있어요.
              </>
            )}
          </p>
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              className="inline-block rounded-xl bg-sky-600 px-5 py-3 text-sm font-medium text-white hover:bg-sky-700"
            >
              첫 처방 받으러 가기
            </Link>
            {!isSignedIn && (
              <SignInButton mode="redirect" forceRedirectUrl="/history">
                <button
                  type="button"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-sky-700 hover:text-sky-800"
                >
                  로그인하고 클라우드 동기화
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 shadow-sm"
            >
              <p className="mb-2 text-xs text-stone-400">
                {formatKoreanDate(e.date)}
              </p>
              <div className="mb-2 flex flex-wrap gap-2">
                <Chip>{e.emotion}</Chip>
                <Chip tone="sky">{e.situation}</Chip>
              </div>
              <p className="font-serif text-sm text-stone-700">{e.verseRef}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
