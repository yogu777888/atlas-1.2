import type { Metadata } from "next";
import { ForecastsView } from "@/components/ForecastsView";
import { paths } from "@/lib/routes";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Коэффициенты выше честной цены: матчи недели",
  description:
    "Матчи недели, где коэффициент легального букмекера выше честного по оценке мирового рынка. Перевес в процентах и шансы на каждый исход.",
  alternates: { canonical: paths.valueBets },
};

export default function ValueBetsPage() {
  return <ForecastsView valueOnly />;
}
