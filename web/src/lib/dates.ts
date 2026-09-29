/** Dates for people in Russia: everything in Moscow time. */
const TZ = "Europe/Moscow";

/** "2026-09-29": the Moscow calendar day of an instant */
export const mskDay = (iso: string | number) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));

/** "19:30" */
export const mskTime = (iso: string) => new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

/** "29 сентября" */
export const dayMonth = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: TZ });

/** "29 сентября 2026" */
export const dayMonthYear = (iso: string) => `${dayMonth(iso)} ${new Date(iso).toLocaleDateString("ru-RU", { year: "numeric", timeZone: TZ }).replace(/\D/g, "")}`;

/** "3 октября", "с 3 по 5 октября", "с 30 сентября по 5 октября" */
export function dateRange(from: string, to: string): string {
  if (mskDay(from) === mskDay(to)) return dayMonth(from);
  const [d1, m1] = dayMonth(from).split(" "), [d2, m2] = dayMonth(to).split(" ");
  return m1 === m2 ? `с ${d1} по ${d2} ${m2}` : `с ${d1} ${m1} по ${d2} ${m2}`;
}

/** "вторник" */
const weekday = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { weekday: "long", timeZone: TZ });

/** "сб, 3 окт" for tight spaces */
export const shortDay = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Heading for a day group: the big date number, "Сегодня" / "Завтра" / weekday, and the full date. */
export function dayHeading(iso: string, now = Date.now()) {
  const day = mskDay(iso);
  const num = String(Number(day.slice(8)));
  if (day === mskDay(now)) return { num, name: "Сегодня", sub: `${weekday(iso)}, ${dayMonth(iso)}` };
  if (day === mskDay(now + 86_400_000)) return { num, name: "Завтра", sub: `${weekday(iso)}, ${dayMonth(iso)}` };
  return { num, name: cap(weekday(iso)), sub: dayMonth(iso) };
}

/** "сегодня в 19:30", "завтра в 22:00", "3 октября в 17:00" (Moscow time) */
export function whenRu(iso: string, now = Date.now()): string {
  const day = mskDay(iso);
  const d = day === mskDay(now) ? "сегодня" : day === mskDay(now + 86_400_000) ? "завтра" : dayMonth(iso);
  return `${d} в ${mskTime(iso)}`;
}
