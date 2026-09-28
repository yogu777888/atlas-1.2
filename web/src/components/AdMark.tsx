import type { AdInfo } from "@/lib/bookmakers";

/** Mandatory ad marking for partner links (38-ФЗ «О рекламе», ст. 18.1). */
export function AdMark({ ad, className = "" }: { ad: AdInfo; className?: string }) {
  return (
    <p className={`text-[10px] leading-snug text-subtle ${className}`}>
      Реклама. {ad.advertiser}. erid: {ad.erid}
    </p>
  );
}
