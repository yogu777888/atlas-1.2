"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";

const isActive = (item: (typeof nav)[number], path: string) =>
  path === item.href || path.startsWith(`${item.href}/`) || item.match.some((p) => path.startsWith(p));

/** Section links; the current section is underlined in ink. */
export function NavLinks({ className = "" }: { className?: string }) {
  const path = usePathname() ?? "/";
  return (
    <nav aria-label="Разделы" className={className}>
      {nav.map((item) => {
        const active = isActive(item, path);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="nav-link shrink-0 rounded-md px-2.5 py-1.5 text-sm text-muted transition-colors hover:text-fg aria-[current=page]:font-semibold aria-[current=page]:text-fg"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Today's date in Moscow, rendered in the browser so a cached page never shows a stale day. */
export function Today({ className = "" }: { className?: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(new Date().toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long", timeZone: "Europe/Moscow" }));
  }, []);
  return <span className={className}>{text}</span>;
}
