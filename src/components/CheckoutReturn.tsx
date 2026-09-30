"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

/**
 * After Stripe Checkout redirect (?checkout=success&session_id=...),
 * confirm entitlement via /api/checkout/confirm as a webhook backup.
 */
export function CheckoutReturn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const checkout = searchParams.get("checkout");
    if (!checkout) return;

    const sessionId = searchParams.get("session_id");

    if (checkout === "cancel") {
      setMessage("결제가 취소되었어요.");
      const next = new URLSearchParams(searchParams.toString());
      next.delete("checkout");
      next.delete("session_id");
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
      return;
    }

    if (checkout !== "success" || !sessionId || !isSignedIn) {
      if (checkout === "success" && !isSignedIn) {
        setMessage("로그인 후 구독이 활성화됩니다.");
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`
        );
        if (!cancelled) {
          setMessage(
            res.ok
              ? "무제한 구독이 활성화되었어요. 감사합니다."
              : "결제 확인 중이에요. 잠시 후 다시 처방을 열어 주세요."
          );
        }
      } catch {
        if (!cancelled) {
          setMessage("결제 확인 중이에요. 잠시 후 다시 처방을 열어 주세요.");
        }
      } finally {
        const next = new URLSearchParams(searchParams.toString());
        next.delete("checkout");
        next.delete("session_id");
        const q = next.toString();
        router.replace(q ? `${pathname}?${q}` : pathname);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, searchParams, router, pathname]);

  if (!message) return null;

  return (
    <div
      className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-center text-sm text-sky-800"
      role="status"
    >
      {message}
    </div>
  );
}
