"use client";

import { useEffect, useState } from "react";

function format(iso: string, now: number): string {
  const d = new Date(iso);
  const diff = d.getTime() - now;
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (diff > 0 && diff < 60 * 60_000) return `через ${Math.max(1, Math.round(diff / 60_000))} мин`;
  const today = new Date(now);
  const tomorrow = new Date(now + 86_400_000);
  if (d.toDateString() === today.toDateString()) return `Сегодня, ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Завтра, ${time}`;
  return `${d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
}

/** Kick-off time in the viewer's timezone (Moscow time on the server render). */
export function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() =>
    new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" }) + " МСК",
  );
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
