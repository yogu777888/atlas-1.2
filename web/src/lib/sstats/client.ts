/**
 * Minimal client for the free sstats.net football API.
 * Without a key the limit is 30 requests/minute per IP, so every call is
 * cached through Next's fetch cache (`revalidate` seconds).
 */
const BASE = "https://api.sstats.net";

export type ApiResponse<T> = { status: string; data: T | null; message?: string | null; TotalCount?: number | null };

export async function sstats<T>(path: string, params: Record<string, string | number | boolean | undefined>, revalidate: number): Promise<T> {
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  if (process.env.SSTATS_API_KEY) url.searchParams.set("apikey", process.env.SSTATS_API_KEY);

  const res = await fetch(url, { next: { revalidate, tags: ["sstats"] }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`sstats ${path} -> HTTP ${res.status}`);
  const body = (await res.json()) as ApiResponse<T>;
  if (body.status !== "OK" || body.data === null) throw new Error(`sstats ${path} -> ${body.status} ${body.message ?? ""}`);
  return body.data;
}

/** Same as `sstats` but also returns TotalCount, for paginated endpoints. */
export async function sstatsPage<T>(path: string, params: Record<string, string | number | boolean | undefined>, revalidate: number) {
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  if (process.env.SSTATS_API_KEY) url.searchParams.set("apikey", process.env.SSTATS_API_KEY);
  const res = await fetch(url, { next: { revalidate, tags: ["sstats"] }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`sstats ${path} -> HTTP ${res.status}`);
  const body = (await res.json()) as ApiResponse<T[]>;
  if (body.status !== "OK" || !body.data) throw new Error(`sstats ${path} -> ${body.status}`);
  return { data: body.data, total: body.TotalCount ?? body.data.length };
}
