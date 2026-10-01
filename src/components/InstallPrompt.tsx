"use client";

import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "soulrx_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || Boolean(iosStandalone);
}

/**
 * Dismissible Korean install hint.
 * Chrome/Android: beforeinstallprompt. iOS Safari: share → Add to Home Screen tip.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [showIos, setShowIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    if (isIos()) {
      setShowIos(true);
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDeferred(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* user closed sheet */
    }
    setDeferred(null);
    setVisible(false);
  }, [deferred]);

  if (!visible) return null;
  if (!deferred && !showIos) return null;

  return (
    <div
      role="region"
      aria-label="앱 설치 안내"
      className="fixed bottom-20 left-1/2 z-40 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 rounded-2xl border border-sky-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-800">
            SoulRx를 홈 화면에 추가
          </p>
          {deferred ? (
            <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
              앱처럼 바로 열고, 알림 리마인드도 쓰기 쉬워져요.
            </p>
          ) : (
            <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
              Safari에서{" "}
              <span className="font-medium text-stone-700">공유</span>
              {" → "}
              <span className="font-medium text-stone-700">홈 화면에 추가</span>
              를 눌러 주세요. (iOS는 브라우저 설치 배너가 없어요)
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {deferred && (
              <button
                type="button"
                onClick={install}
                className="rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
              >
                설치하기
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-700"
            >
              나중에
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="닫기"
          className="shrink-0 rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
