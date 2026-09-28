/** Visitor country from the edge network's geo header (Vercel or Cloudflare). */
export function countryFromHeaders(headers: Headers): string | null {
  const c = headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry");
  return c && /^[A-Z]{2}$/i.test(c) ? c.toUpperCase() : null;
}
