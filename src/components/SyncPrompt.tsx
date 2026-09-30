"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import {
  hasLocalDataToSync,
  isMigrated,
  markMigrated,
  migrateLocalToCloud,
} from "@/lib/cloud";

export function SyncPrompt() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      setVisible(false);
      return;
    }
    if (isMigrated(userId)) {
      setVisible(false);
      return;
    }
    setVisible(hasLocalDataToSync());
  }, [isLoaded, isSignedIn, userId]);

  const onSync = useCallback(async () => {
    if (!userId) return;
    setBusy(true);
    setDoneMsg(null);
    try {
      const result = await migrateLocalToCloud();
      markMigrated(userId);
      setVisible(false);
      setDoneMsg(
        `기기 기록을 클라우드에 옮겼어요 (기록 ${result.migratedHistory}건)`
      );
    } catch {
      setDoneMsg("동기화에 실패했어요. 잠시 후 다시 시도해 주세요");
    } finally {
      setBusy(false);
    }
  }, [userId]);

  const onSkip = useCallback(() => {
    if (!userId) return;
    markMigrated(userId);
    setVisible(false);
  }, [userId]);

  if (doneMsg) {
    return (
      <p className="mb-4 rounded-xl bg-sky-50 px-4 py-3 text-center text-sm text-sky-800">
        {doneMsg}
      </p>
    );
  }

  if (!visible) return null;

  return (
    <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-4 text-center shadow-sm">
      <p className="mb-1 text-sm font-medium text-stone-800">
        이 기기에 남긴 기록이 있어요
      </p>
      <p className="mb-3 text-xs leading-relaxed text-stone-500">
        로그인 계정으로 옮기면 다른 기기에서도 볼 수 있어요.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSkip}
          disabled={busy}
          className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-500 hover:bg-stone-50 disabled:opacity-60"
        >
          나중에
        </button>
        <button
          type="button"
          onClick={onSync}
          disabled={busy}
          className="flex-1 rounded-xl bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {busy ? "옮기는 중…" : "클라우드로 동기화"}
        </button>
      </div>
    </div>
  );
}
