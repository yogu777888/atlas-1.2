"use client";

import { useEffect, useState } from "react";

const MSK = "Europe/Moscow";
const fmt = (iso: string, timeZone?: string) => new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone });
const differsFromMoscow = () => {
  const now = new Date().toISOString();
  return fmt(now) !== fmt(now, MSK);
};

/** Kick-off time: Moscow on the server, the visitor's own clock once the page is in the browser. */
export function LocalClock({ iso, className = "" }: { iso: string; className?: string }) {
  const [text, setText] = useState(() => fmt(iso, MSK));
  useEffect(() => setText(fmt(iso)), [iso]);
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}

/** One line saying whose clock the table uses, shown only when it isn't Moscow's. */
export function ZoneNote() {
  const [zone, setZone] = useState<string | null>(null);
  useEffect(() => {
    if (differsFromMoscow()) setZone(Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()?.replace(/_/g, " ") ?? "");
  }, []);
  if (zone === null) return null;
  return <span>время — по вашему часовому поясу</span>;
}
