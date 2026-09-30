"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function Paywall() {
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
          window.location.pathname
        )}`;
        return;
      }
      if (!res.ok) {
        throw new Error("checkout failed");
      }
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("missing url");
      window.location.href = data.url;
    } catch {
      setError("결제 페이지를 열지 못했어요. 잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  };

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
      <p className="mb-4 text-xs text-stone-500">
        무제한으로 말씀 처방을 이어가고 싶다면 아래에서 구독할 수 있어요.
      </p>

      {!isLoaded ? (
        <p className="mb-4 text-sm text-stone-400">불러오는 중…</p>
      ) : isSignedIn ? (
        <button
          type="button"
          onClick={startCheckout}
          disabled={busy}
          className="mb-3 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
        >
          {busy ? "결제 페이지로 이동 중…" : "월 ₩3,900으로 무제한"}
        </button>
      ) : (
        <Link
          href={`/sign-in?redirect_url=${encodeURIComponent("/pricing")}`}
          className="mb-3 block w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          월 ₩3,900으로 무제한
        </Link>
      )}

      {error && (
        <p className="mb-3 text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}

      <p className="mb-6 text-[11px] leading-relaxed text-stone-400">
        로그인 후 Stripe 결제가 진행됩니다. 언제든 Stripe에서 구독을 해지할 수
        있어요.
      </p>

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
