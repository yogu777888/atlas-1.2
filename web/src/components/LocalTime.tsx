"use client";

import { useEffect, useState } from "react";

function format(iso: string, now: number): string {
  const d = new Date(iso);
  const diff = d.getTime() - now;
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff > 0 && diff < 60 * 60_000) return `in ${Math.max(1, Math.round(diff / 60_000))} min`;
  const today = new Date(now);
  const tomorrow = new Date(now + 86_400_000);
  if (d.toDateString() === today.toDateString()) return `Today ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow ${time}`;
  return `${d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })} ${time}`;
}

/** Renders a kick-off time in the viewer's timezone (UTC on the server). */
export function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => new Date(iso).toISOString().slice(11, 16) + " UTC");
  useEffect(() => {
    setText(format(iso, Date.now()));
    const t = setInterval(() => setText(format(iso, Date.now())), 30_000);
    return () => clearInterval(t);
  }, [iso]);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
