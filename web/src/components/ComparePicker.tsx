"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type League = { key: string; label: string; teams: { name: string; slug: string }[] };

/** Pick a league and two of its teams; the page redirects to the canonical order itself. */
export function ComparePicker({ leagues }: { leagues: League[] }) {
  const router = useRouter();
  const [lg, setLg] = useState(leagues[0]?.key ?? "");
  const teams = leagues.find((l) => l.key === lg)?.teams ?? [];
  const [a, setA] = useState(teams[0]?.slug ?? "");
  const [b, setB] = useState(teams[1]?.slug ?? "");
  const pickLeague = (key: string) => {
    const t = leagues.find((l) => l.key === key)?.teams ?? [];
    setLg(key);
    setA(t[0]?.slug ?? "");
    setB(t[1]?.slug ?? "");
  };
  const select = "field h-11 cursor-pointer text-base font-semibold font-sans";
  return (
    <form
      className="card grid gap-3 p-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto_minmax(0,1fr)_auto] sm:items-end sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (a && b && a !== b) router.push(`/sravnenie/${a}-vs-${b}`);
      }}
    >
      <label className="grid gap-1 text-xs text-muted">
        Лига
        <select className={select} value={lg} onChange={(e) => pickLeague(e.target.value)}>
          {leagues.map((l) => (
            <option key={l.key} value={l.key}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Первая команда
        <select className={select} value={a} onChange={(e) => setA(e.target.value)}>
          {teams.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <span className="hidden pb-3 text-center text-sm font-semibold text-subtle sm:block">или</span>
      <label className="grid gap-1 text-xs text-muted">
        Вторая команда
        <select className={select} value={b} onChange={(e) => setB(e.target.value)}>
          {teams.map((t) => (
            <option key={t.slug} value={t.slug} disabled={t.slug === a}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary h-11" disabled={!a || !b || a === b}>
        Сравнить
      </button>
    </form>
  );
}
