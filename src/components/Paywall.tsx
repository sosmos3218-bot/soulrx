"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PLANS, TRIAL_DAYS, type PlanId } from "@/lib/plans";

export function Paywall() {
  const { isLoaded, isSignedIn } = useAuth();
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (plan: PlanId) => {
    setBusy(plan);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
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
      setBusy(null);
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
      <p className="mb-1 text-xs text-stone-500">
        무제한으로 말씀 처방을 이어가고 싶다면 아래에서 구독할 수 있어요.
      </p>
      <p className="mb-4 text-xs font-medium text-emerald-700">
        처음 {TRIAL_DAYS}일은 무료
      </p>

      {!isLoaded ? (
        <p className="mb-4 text-sm text-stone-400">불러오는 중…</p>
      ) : isSignedIn ? (
        <div className="mb-3 space-y-2">
          <button
            type="button"
            onClick={() => startCheckout("annual")}
            disabled={busy !== null}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
          >
            {busy === "annual"
              ? "결제 페이지로 이동 중…"
              : `연 ₩39,000 · ${PLANS.annual.savingsLabel}`}
          </button>
          <button
            type="button"
            onClick={() => startCheckout("monthly")}
            disabled={busy !== null}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
          >
            {busy === "monthly"
              ? "결제 페이지로 이동 중…"
              : "월 ₩3,900으로 시작"}
          </button>
        </div>
      ) : (
        <div className="mb-3 space-y-2">
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent("/pricing")}`}
            className="block w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            연 ₩39,000 · {PLANS.annual.savingsLabel}
          </Link>
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent("/pricing")}`}
            className="block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            월 ₩3,900으로 시작
          </Link>
        </div>
      )}

      {error && (
        <p className="mb-3 text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}

      <p className="mb-4 text-[11px] leading-relaxed text-stone-400">
        <Link href="/pricing" className="underline hover:text-stone-600">
          요금제 자세히 보기
        </Link>
        {" · "}
        로그인 후 Stripe 결제가 진행됩니다. 체험 중 해지하면 요금이 청구되지
        않아요.
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
