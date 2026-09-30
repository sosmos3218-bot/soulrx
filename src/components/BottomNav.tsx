"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "처방" },
  { href: "/history", label: "기록" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/80 bg-[#faf7f2]/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {links.map((l) => {
          const active =
            l.href === "/"
              ? pathname === "/" ||
                pathname.startsWith("/situation") ||
                pathname.startsWith("/rx")
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex-1 py-3 text-center text-sm font-medium transition ${
                active ? "text-sky-700" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
