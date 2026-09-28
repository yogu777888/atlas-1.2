import type { Metadata } from "next";
import { OddsTable } from "@/components/OddsTable";
import { SportTabs } from "@/components/SportTabs";
import { getEvents, getSureBets, oddsSource } from "@/lib/odds/provider";
import { getSport } from "@/lib/sports";

export const revalidate = 120;

type Props = { searchParams: Promise<{ sport?: string; view?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { sport, view } = await searchParams;
  const s = getSport(sport);
  if (view === "surebets") return { title: "Вилки", description: "Вилки между легальными российскими букмекерами." };
  return {
    title: s ? `${s.label}: сравнение коэффициентов` : "Сравнение коэффициентов",
    description: `Сравните коэффициенты${s ? " на " + s.label.toLowerCase() : ""} у легальных букмекеров и найдите лучшую цену на каждый исход.`,
    alternates: { canonical: s ? `/odds?sport=${s.key}` : "/odds" },
  };
}

export default async function OddsPage({ searchParams }: Props) {
  const { sport, view } = await searchParams;
  const s = getSport(sport);
  const surebets = view === "surebets";
  const events = surebets ? await getSureBets() : await getEvents(s?.key);

  return (
    <div className="container-x pt-14">
      <p className="eyebrow">{oddsSource() === "live" ? "Актуальная линия" : "Демо-данные"} · исход матча</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        {surebets ? "Вилки" : s ? `${s.label}: коэффициенты` : "Сравнение коэффициентов"}
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        {surebets
          ? "Матчи, где ставки на все исходы по лучшим коэффициентам возвращают больше, чем вы поставили. Они быстро исчезают — всегда проверяйте коэффициенты в купоне."
          : "Самый высокий коэффициент на каждый исход отмечен зелёным. Маржа показывает, сколько вы отдаёте, ставя на все исходы по этим ценам, — чем меньше, тем лучше."}
      </p>
      <div className="mt-8 mb-5">
        <SportTabs active={s?.key} view={view} />
      </div>
      <OddsTable events={events} empty={surebets ? "Сейчас вилок нет. Загляните позже." : undefined} />
    </div>
  );
}
