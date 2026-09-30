"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPrescription } from "@/data/prescriptions";
import {
  SLUG_TO_EMOTION,
  SLUG_TO_SITUATION,
} from "@/lib/types";
import {
  canViewPrescription,
  recordPrescriptionView,
} from "@/lib/storage";
import { seoulDate } from "@/lib/date";
import { PrescriptionView } from "@/components/PrescriptionView";
import { Paywall } from "@/components/Paywall";

type Gate = "loading" | "ok" | "paywall" | "missing";

export default function RxPage() {
  const params = useParams<{ emotion: string; situation: string }>();
  const emotion = SLUG_TO_EMOTION[params.emotion];
  const situation = SLUG_TO_SITUATION[params.situation];
  const rx =
    emotion && situation ? getPrescription(emotion, situation) : undefined;

  const [gate, setGate] = useState<Gate>("loading");

  useEffect(() => {
    if (!rx) {
      setGate("missing");
      return;
    }
    // Session key so refresh of same prescription doesn't re-count
    const viewKey = `soulrx_viewed_${rx.emotion}_${rx.situation}_${seoulDate()}`;
    const alreadyThisSession = sessionStorage.getItem(viewKey) === "1";

    if (alreadyThisSession) {
      setGate("ok");
      return;
    }

    if (!canViewPrescription()) {
      setGate("paywall");
      return;
    }

    recordPrescriptionView();
    sessionStorage.setItem(viewKey, "1");
    setGate("ok");
  }, [rx]);

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
