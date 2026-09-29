import type { Metadata } from "next";
import { ForecastsView } from "@/components/ForecastsView";
import { paths } from "@/lib/routes";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Прогнозы на футбол на сегодня и неделю",
  description:
    "Прогнозы на футбол на сегодня, завтра и неделю: шансы на матчи РПЛ, АПЛ, Ла Лиги, Серии А, Бундеслиги и Лиги чемпионов по коэффициентам мировых букмекеров.",
  alternates: { canonical: paths.forecasts },
};

export default function ForecastsPage() {
  return <ForecastsView />;
}
