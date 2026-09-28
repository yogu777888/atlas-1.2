"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="card w-full max-w-sm animate-rise p-6 shadow-2xl shadow-black">
        <LogoMark className="mb-5 size-10" />
        {denied ? (
          <>
            <h2 id="age-title" className="text-xl font-semibold">Возвращайтесь, когда исполнится 18</h2>
            <p className="mt-2 text-sm text-muted">Сайт предназначен только для совершеннолетних.</p>
          </>
        ) : (
          <>
            <h2 id="age-title" className="text-xl font-semibold">Вам исполнилось 18 лет?</h2>
            <p className="mt-2 text-sm text-muted">
              На сайте есть информация о ставках на спорт. Она предназначена только для совершеннолетних.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button className="btn-ghost" onClick={() => setDenied(true)}>
                Нет
              </button>
              <button className="btn-primary" onClick={confirm} autoFocus>
                Да, мне 18+
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
