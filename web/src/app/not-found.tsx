import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-32 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">This line is off the board.</h1>
      <p className="mt-3 text-muted">The page moved, or the match has already started.</p>
      <Link href="/odds" className="btn-primary mt-8">
        Back to odds
      </Link>
    </div>
  );
}
