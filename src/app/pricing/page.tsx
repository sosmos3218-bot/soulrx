"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PLANS, TRIAL_DAYS, type PlanId } from "@/lib/plans";

export default function PricingPage() {
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
      setBusy(null);
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
        <p className="mt-2 text-xs font-medium text-emerald-700">
          처음 {TRIAL_DAYS}일은 무료 · 언제든 해지 가능
        </p>
      </header>

      <div className="mb-4 grid gap-3">
        {/* Annual — highlighted */}
        <div className="relative rounded-2xl border-2 border-sky-400 bg-white/95 p-5 shadow-md ring-1 ring-sky-100">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-sky-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            추천 · {PLANS.annual.savingsLabel}
          </span>
          <p className="mb-1 mt-1 text-center text-sm font-medium text-sky-700">
            {PLANS.annual.label} 구독
          </p>
          <p className="mb-1 text-center font-serif text-3xl font-bold text-stone-800">
            {PLANS.annual.priceLabel}
            <span className="text-base font-medium text-stone-400">
              {PLANS.annual.periodLabel}
            </span>
          </p>
          <p className="mb-4 text-center text-xs text-stone-500">
            {PLANS.annual.monthlyEquivalent} · 월간 대비 약 ₩7,800 절약
          </p>
          <ul className="mb-5 space-y-2 text-sm text-stone-600">
            <li className="flex gap-2">
              <span aria-hidden>✓</span>
              <span>처방 횟수 무제한</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>✓</span>
              <span>{TRIAL_DAYS}일 무료 체험 후 결제</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>✓</span>
              <span>약 2개월분 무료 (연간 할인)</span>
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
              onClick={() => startCheckout("annual")}
              disabled={busy !== null}
              className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {busy === "annual"
                ? "결제 페이지로 이동 중…"
                : `${TRIAL_DAYS}일 무료로 연간 시작`}
            </button>
          ) : (
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent("/pricing")}`}
              className="block w-full rounded-xl bg-sky-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-sky-700"
            >
              로그인 후 연간 구독
            </Link>
          )}
        </div>

        {/* Monthly */}
        <div className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm">
          <p className="mb-1 text-center text-sm font-medium text-stone-500">
            {PLANS.monthly.label} 구독
          </p>
          <p className="mb-4 text-center font-serif text-3xl font-bold text-stone-800">
            {PLANS.monthly.priceLabel}
            <span className="text-base font-medium text-stone-400">
              {PLANS.monthly.periodLabel}
            </span>
          </p>
          <ul className="mb-5 space-y-2 text-sm text-stone-600">
            <li className="flex gap-2">
              <span aria-hidden>✓</span>
              <span>처방 횟수 무제한</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>✓</span>
              <span>{TRIAL_DAYS}일 무료 체험 후 결제</span>
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
              onClick={() => startCheckout("monthly")}
              disabled={busy !== null}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
            >
              {busy === "monthly"
                ? "결제 페이지로 이동 중…"
                : `${TRIAL_DAYS}일 무료로 월간 시작`}
            </button>
          ) : (
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent("/pricing")}`}
              className="block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              로그인 후 월간 구독
            </Link>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-3 text-center text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}

      <p className="mt-2 text-center text-[11px] leading-relaxed text-stone-400">
        결제는 Stripe를 통해 안전하게 처리됩니다.
        <br />
        {TRIAL_DAYS}일 체험 중에는 요금이 청구되지 않으며, 체험 종료 전에
        해지하면 결제되지 않습니다.
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
