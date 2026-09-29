"use client";

import { useEffect, useState } from "react";
import { FlipMark } from "./Logo";

const KEY = "tagbet:age-ok";

export function AgeGate() {
  const [open, setOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) !== "1") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const confirm = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-fg/40 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="card w-full max-w-sm animate-rise p-6 shadow-2xl shadow-fg/20">
        <FlipMark className="mb-5 size-9" />
        {denied ? (
          <>
            <h2 id="age-title" className="text-xl font-bold tracking-tight">Возвращайтесь, когда исполнится 18</h2>
            <p className="mt-2 text-sm text-muted">Сайт рассказывает о ставках на спорт, поэтому открыт только совершеннолетним.</p>
          </>
        ) : (
          <>
            <h2 id="age-title" className="text-xl font-bold tracking-tight">Вам уже есть 18 лет?</h2>
            <p className="mt-2 text-sm text-muted">На сайте есть информация о ставках на спорт. По закону её можно показывать только совершеннолетним.</p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button className="btn-ghost" onClick={() => setDenied(true)}>
                Нет
              </button>
              <button className="btn-primary" onClick={confirm} autoFocus>
                Да, мне есть 18
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
