import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <Prose eyebrow="Legal" title="Privacy policy">
      <p>
        <em>Template — have this reviewed by a lawyer for the jurisdictions you operate in before launch.</em>
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Outbound clicks:</strong> when you follow a link to a bookmaker we record the bookmaker, the page you clicked from,
          your country (from your IP address, which we don&apos;t store) and an anonymous click ID shared with the bookmaker so we
          can be credited for referrals.
        </li>
        <li>
          <strong>Local preferences:</strong> your age confirmation is stored in your browser&apos;s local storage.
        </li>
        <li>
          <strong>App:</strong> the matches you star are stored only on your device.
        </li>
      </ul>
      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t sell personal data.</li>
        <li>We don&apos;t see your bookmaker account, bets or balance.</li>
      </ul>
      <h2>Your rights</h2>
      <p>
        You can request access to, or deletion of, any data linked to you by emailing <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </Prose>
  );
}
