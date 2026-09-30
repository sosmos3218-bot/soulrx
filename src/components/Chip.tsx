import type { ReactNode } from "react";

export function Chip({
  children,
  tone = "warm",
}: {
  children: ReactNode;
  tone?: "warm" | "sky";
}) {
  const cls =
    tone === "sky"
      ? "bg-sky-100 text-sky-800 border-sky-200"
      : "bg-amber-50 text-amber-900 border-amber-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${cls}`}
    >
      {children}
    </span>
  );
}
