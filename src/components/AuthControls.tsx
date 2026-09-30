"use client";

import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function AuthControls() {
  const pathname = usePathname();
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-end gap-2">
      <Show when="signed-out">
        <SignInButton mode="redirect" forceRedirectUrl="/">
          <button
            type="button"
            className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-600 shadow-sm transition hover:border-sky-300 hover:text-sky-700"
          >
            로그인
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl="/">
          <button
            type="button"
            className="rounded-full bg-sky-600/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-sky-700"
          >
            가입
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </Show>
    </div>
  );
}
