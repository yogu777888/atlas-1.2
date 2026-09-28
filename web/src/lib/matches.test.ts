import { isValue, isSuspect, describe, expect, it } from "vitest";
import { consensus, edge, fairFromOdds, margin } from "./matches";

describe("match maths", () => {
  it("removes the margin", () => {
    const f = fairFromOdds({ home: 2.38, draw: 3.2, away: 2.7 });
    expect(f.home + f.draw + f.away).toBeCloseTo(1, 10);
    expect(f.home).toBeGreaterThan(f.away);
  });
  it("averages books into a consensus", () => {
    const c = consensus([
      { home: 2.5, draw: 3, away: 2.75 },
      { home: 2.55, draw: 3.27, away: 2.85 },
    ])!;
    expect(c.home + c.draw + c.away).toBeCloseTo(1, 10);
  });
  it("computes margin and edge", () => {
    expect(margin({ home: 3, draw: 3, away: 3 })).toBeCloseTo(0);
    expect(edge(2.2, 0.5)).toBeCloseTo(0.1);
  });
});

describe("credible edges", () => {
  it("flags small edges and ignores implausible ones", () => {
    expect(isValue(2.06, 0.505)).toBe(true); // +4%
    expect(isValue(1.9, 0.505)).toBe(false); // below fair
    expect(isValue(4.0, 0.3)).toBe(false); // +20%: stale line, not value
    expect(isSuspect(4.0, 0.3)).toBe(true);
  });
});
