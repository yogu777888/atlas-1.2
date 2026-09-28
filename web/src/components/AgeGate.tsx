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
            <h2 id="age-title" className="text-xl font-semibold">Come back when you&apos;re 18</h2>
            <p className="mt-2 text-sm text-muted">tag.bet is only for adults of legal gambling age in their country.</p>
          </>
        ) : (
          <>
            <h2 id="age-title" className="text-xl font-semibold">Are you 18 or older?</h2>
            <p className="mt-2 text-sm text-muted">
              tag.bet compares sports betting odds. You must be of legal gambling age in your country to continue.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button className="btn-ghost" onClick={() => setDenied(true)}>
                No
              </button>
              <button className="btn-primary" onClick={confirm} autoFocus>
                Yes, I&apos;m 18+
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
