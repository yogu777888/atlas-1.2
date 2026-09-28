import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-32 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Такого матча нет в линии.</h1>
      <p className="mt-3 text-muted">Страница переехала или матч уже начался.</p>
      <Link href="/matches" className="btn-primary mt-8">
        К матчам
      </Link>
    </div>
  );
}
