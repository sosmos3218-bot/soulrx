"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function PricingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      if (res.status === 401) {
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(
          "/pricing"
        )}`;
        return;
      }
      if (!res.ok) throw new Error("checkout failed");
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("missing url");
      window.location.href = data.url;
    } catch {
      setError("결제 페이지를 열지 못했어요. 잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  return (
    <main>
      <header className="mb-6 text-center">
        <p className="mb-1 text-xs font-semibold tracking-[0.15em] text-sky-600">
          UNLIMITED
        </p>
        <h1 className="font-serif text-2xl font-bold text-stone-800">
          SoulRx 무제한
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          하루 한 번의 제한 없이, 필요할 때마다 말씀 처방을 받으세요.
        </p>
      </header>

      <div className="rounded-2xl border border-sky-200 bg-white/90 p-6 shadow-sm">
        <p className="mb-1 text-center text-sm font-medium text-stone-500">
          월간 구독
        </p>
        <p className="mb-4 text-center font-serif text-3xl font-bold text-stone-800">
          ₩4,900
          <span className="text-base font-medium text-stone-400">/월</span>
        </p>
        <ul className="mb-6 space-y-2 text-sm text-stone-600">
          <li className="flex gap-2">
            <span aria-hidden>✓</span>
            <span>처방 횟수 무제한</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>✓</span>
            <span>클라우드 기록과 함께 이용</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>✓</span>
            <span>언제든 Stripe에서 해지 가능</span>
          </li>
        </ul>

        {!isLoaded ? (
          <p className="text-center text-sm text-stone-400">불러오는 중…</p>
        ) : isSignedIn ? (
          <button
            type="button"
            onClick={startCheckout}
            disabled={busy}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {busy ? "결제 페이지로 이동 중…" : "월 ₩4,900으로 무제한"}
          </button>
        ) : (
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent("/pricing")}`}
            className="block w-full rounded-xl bg-sky-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-sky-700"
          >
            로그인 후 구독하기
          </Link>
        )}

        {error && (
          <p className="mt-3 text-center text-xs text-rose-600" role="alert">
            {error}
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-stone-400">
        결제는 Stripe를 통해 안전하게 처리됩니다.
        <br />
        세금(부가세 등)이 적용될 수 있으며, 필요 시 Stripe Tax 설정을
        검토하세요.
      </p>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-700">
          홈으로
        </Link>
      </div>
    </main>
  );
}
