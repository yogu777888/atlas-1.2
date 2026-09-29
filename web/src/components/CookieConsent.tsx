"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { paths } from "@/lib/routes";

const KEY = "tagbet:cookies";
const YM_ID = process.env.NEXT_PUBLIC_YM_ID;

/**
 * Cookie notice. Yandex.Metrika loads only after the visitor accepts
 * analytics, as 152-ФЗ requires consent for processing their data.
 */
export function CookieConsent() {
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "yes" || v === "no") setChoice(v);
    } catch {}
    setReady(true);
  }, []);

  const save = (v: "yes" | "no") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    setChoice(v);
  };

  return (
    <>
      {choice === "yes" && YM_ID && (
        <Script id="ym" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${Number(YM_ID)},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}
        </Script>
      )}
      {ready && choice === null && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4" role="region" aria-label="Cookies">
          <div className="card mx-auto flex max-w-3xl flex-col gap-3 p-4 text-sm shadow-xl shadow-fg/10 sm:flex-row sm:items-center">
            <p className="flex-1 text-muted">
              Мы используем cookies и Яндекс Метрику, чтобы понимать, какие страницы читают. Метрика включится, только если вы согласитесь.{" "}
              <Link href={paths.privacy} className="font-medium text-fg underline underline-offset-2">
                Подробнее
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button className="btn-ghost h-9 px-4" onClick={() => save("no")}>
                Только необходимые
              </button>
              <button className="btn-primary h-9 px-4" onClick={() => save("yes")}>
                Принять
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
