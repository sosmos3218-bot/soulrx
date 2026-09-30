"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getPrescription } from "@/data/prescriptions";
import {
  SLUG_TO_EMOTION,
  SLUG_TO_SITUATION,
} from "@/lib/types";
import { checkCanView, recordView } from "@/lib/cloud";
import { seoulDate } from "@/lib/date";
import { PrescriptionView } from "@/components/PrescriptionView";
import { Paywall } from "@/components/Paywall";

type Gate = "loading" | "ok" | "paywall" | "missing";

export default function RxPage() {
  const params = useParams<{ emotion: string; situation: string }>();
  const { isLoaded, isSignedIn } = useAuth();
  const emotion = SLUG_TO_EMOTION[params.emotion];
  const situation = SLUG_TO_SITUATION[params.situation];
  const rx =
    emotion && situation ? getPrescription(emotion, situation) : undefined;

  const [gate, setGate] = useState<Gate>("loading");

  useEffect(() => {
    if (!isLoaded) return;
    if (!rx) {
      setGate("missing");
      return;
    }

    let cancelled = false;
    (async () => {
      const viewKey = `soulrx_viewed_${rx.emotion}_${rx.situation}_${seoulDate()}`;
      const alreadyThisSession = sessionStorage.getItem(viewKey) === "1";

      if (alreadyThisSession) {
        if (!cancelled) setGate("ok");
        return;
      }

      const can = await checkCanView(!!isSignedIn);
      if (cancelled) return;

      if (!can) {
        setGate("paywall");
        return;
      }

      await recordView(!!isSignedIn);
      if (cancelled) return;
      sessionStorage.setItem(viewKey, "1");
      setGate("ok");
    })();

    return () => {
      cancelled = true;
    };
  }, [rx, isLoaded, isSignedIn]);

  if (gate === "loading") {
    return (
      <main className="text-center text-sm text-stone-400">불러오는 중…</main>
    );
  }

  if (gate === "missing" || !rx) {
    return (
      <main className="text-center">
        <p className="mb-4 text-stone-600">처방을 찾지 못했어요.</p>
        <Link href="/" className="text-sky-700 underline">
          홈으로
        </Link>
      </main>
    );
  }

  if (gate === "paywall") {
    return (
      <main>
        <Paywall />
      </main>
    );
  }

  return (
    <main>
      <header className="mb-5 text-center">
        <p className="mb-1 text-xs font-semibold tracking-[0.15em] text-sky-600">
          PRESCRIPTION
        </p>
        <h1 className="font-serif text-xl font-bold text-stone-800">
          오늘의 말씀 처방
        </h1>
      </header>
      <PrescriptionView rx={rx} />
    </main>
  );
}
