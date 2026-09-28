import { describe, expect, it } from "vitest";
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
