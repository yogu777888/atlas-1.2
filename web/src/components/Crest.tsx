"use client";

import { useState } from "react";

/** A club crest from the data; if the image fails, the club-colour mark passed as children shows instead. */
export function Crest({ src, size, children }: { src: string; size: number; children?: React.ReactNode }) {
  const [bad, setBad] = useState(false);
  if (bad) return <>{children}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- crests come from the data provider's CDN, any host
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setBad(true)}
      className="inline-block shrink-0 object-contain"
      style={{ width: size, height: size }}
    />
  );
}
