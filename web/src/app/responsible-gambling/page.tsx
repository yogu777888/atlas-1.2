import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Responsible gambling", alternates: { canonical: "/responsible-gambling" } };

export default function Page() {
  return (
    <Prose eyebrow="Play safe" title="Responsible gambling">
      <p>
        Betting should be entertainment, never a way to make money or escape problems. tag.bet helps you find better prices — it
        does not make betting risk-free. Most bettors lose over time.
      </p>
      <h2>Keep it in control</h2>
      <ul>
        <li>Set a deposit limit with every bookmaker before you place your first bet.</li>
        <li>Only bet what you can afford to lose. Never chase losses.</li>
        <li>Take regular breaks, and don&apos;t bet when you&apos;re upset, stressed or drinking.</li>
        <li>Use time-outs and self-exclusion if betting stops being fun.</li>
      </ul>
      <h2>Warning signs</h2>
      <ul>
        <li>Spending more money or time than you planned.</li>
        <li>Borrowing money or hiding betting from people close to you.</li>
        <li>Feeling anxious, irritable or low when you&apos;re not betting.</li>
      </ul>
      <h2>Free, confidential help</h2>
      <ul>
        <li>
          <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">BeGambleAware</a> (UK) — 0808 8020 133
        </li>
        <li>
          <a href="https://www.gamstop.co.uk" target="_blank" rel="noopener noreferrer">GAMSTOP</a> — self-exclusion from all UK-licensed sites
        </li>
        <li>
          <a href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer">NCPG</a> (US) — 1-800-GAMBLER
        </li>
        <li>
          <a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer">Gambling Therapy</a> — worldwide, multilingual support
        </li>
        <li>
          <a href="https://www.gamblersanonymous.org" target="_blank" rel="noopener noreferrer">Gamblers Anonymous</a>
        </li>
      </ul>
      <h2>Under 18?</h2>
      <p>
        tag.bet is for adults only. Parents can block gambling sites with tools like Net Nanny, Qustodio or Gamban.
      </p>
    </Prose>
  );
}
