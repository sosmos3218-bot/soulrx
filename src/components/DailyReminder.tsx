"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearReminder,
  formatReminderTime,
  getReminderAt,
  maybeFireDueReminder,
  notificationSupported,
  scheduleTomorrowReminder,
} from "@/lib/reminder";

type Status = "idle" | "scheduled" | "unsupported" | "denied" | "fired";

export function DailyReminder({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [atLabel, setAtLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const sync = useCallback(() => {
    if (!notificationSupported()) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    const fired = maybeFireDueReminder();
    if (fired) {
      setStatus("fired");
      setAtLabel(null);
      setMsg("리마인드를 보냈어요. 다시 예약할 수 있어요.");
      return;
    }
    const at = getReminderAt();
    if (at) {
      setStatus("scheduled");
      setAtLabel(formatReminderTime(at));
    } else {
      setStatus("idle");
      setAtLabel(null);
    }
  }, []);

  useEffect(() => {
    sync();
    const onVis = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVis);
    const id = window.setInterval(sync, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(id);
    };
  }, [sync]);

  const enable = async () => {
    setBusy(true);
    setMsg(null);
    try {
      if (!notificationSupported()) {
        setStatus("unsupported");
        return;
      }
      let perm = Notification.permission;
      if (perm === "default") {
        perm = await Notification.requestPermission();
      }
      if (perm !== "granted") {
        setStatus("denied");
        setMsg("알림을 허용해 주시면 브라우저에서 리마인드를 보낼 수 있어요.");
        return;
      }
      const iso = scheduleTomorrowReminder();
      setStatus("scheduled");
      setAtLabel(formatReminderTime(iso));
      setMsg(
        "내일 이 시간에 알림을 예약했어요. 브라우저가 열려 있고 알림이 허용된 경우에만 동작해요."
      );
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    clearReminder();
    setStatus("idle");
    setAtLabel(null);
    setMsg("리마인드를 취소했어요.");
  };

  if (status === "unsupported") {
    return (
      <section
        aria-label="리마인드"
        className={
          compact
            ? "rounded-xl border border-stone-200/80 bg-white/60 px-4 py-3"
            : "mt-6 rounded-2xl border border-stone-200 bg-white/70 px-4 py-4 shadow-sm"
        }
      >
        <p className="text-xs leading-relaxed text-stone-400">
          이 브라우저는 알림을 지원하지 않아 리마인드를 쓸 수 없어요.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="내일 리마인드"
      className={
        compact
          ? "rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3"
          : "mt-6 rounded-2xl border border-sky-100 bg-sky-50/40 px-4 py-4 shadow-sm"
      }
    >
      <p className="mb-1 text-xs font-semibold tracking-wide text-sky-700/90">
        내일 이 시간에 리마인드
      </p>
      <p className="mb-3 text-[11px] leading-relaxed text-stone-500">
        브라우저 알림으로 가볍게 알려 드려요. 푸시 서버 없이,{" "}
        <span className="font-medium text-stone-600">
          탭이 열려 있고 알림 권한이 있을 때
        </span>
        만 동작합니다.
      </p>

      {status === "scheduled" && atLabel ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex-1 text-sm text-stone-700">
            예약됨 · <span className="font-medium">{atLabel}</span>
            <span className="text-stone-400"> (서울)</span>
          </p>
          <button
            type="button"
            onClick={cancel}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-white/80 hover:text-stone-700"
          >
            취소
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={enable}
          disabled={busy || status === "denied"}
          className="w-full rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-medium text-sky-700 hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy
            ? "예약 중…"
            : status === "denied"
              ? "알림이 차단되어 있어요"
              : "내일 이 시간에 알려 주기"}
        </button>
      )}

      {msg && (
        <p className="mt-2 text-[11px] leading-relaxed text-stone-500" role="status">
          {msg}
        </p>
      )}
    </section>
  );
}
