import { describe, expect, it } from "vitest";
import { findPariLine, nameSimilarity, openingFrom } from "./pari";
import { moved } from "./matches";

describe("PARI ↔ sstats matching", () => {
  it("matches differently spelled team names", () => {
    expect(nameSimilarity("Olimpia", "Olimpia Asuncion")).toBe(1);
    expect(nameSimilarity("Zenit St. Petersburg", "Zenit")).toBe(1);
    expect(nameSimilarity("Spartak Moscow", "CSKA Moscow")).toBeLessThan(1);
  });
  it("needs the kick-off time to line up", () => {
    const start = Date.parse("2026-09-29T01:00:00+03:00");
    const lines = [{ eventId: 1, start, home: "Libertad Asuncion", away: "Olimpia Asuncion", odds: null, url: null, updatedAt: null }];
    expect(findPariLine(lines, start, "Libertad Asuncion", "Olimpia")).toBeDefined();
    expect(findPariLine(lines, start + 3 * 3600_000, "Libertad Asuncion", "Olimpia")).toBeUndefined();
  });
});

describe("line movement", () => {
  const ids = { home: 101, draw: 102, away: 103 };
  it("takes the first pre-match price of each outcome", () => {
    const history = [
      { createdAt: "2026-09-29T12:00:00Z", odds: [{ id: 101, value: 2.2 }, { id: 102, value: 3.3 }, { id: 103, value: 3.1 }] },
      { createdAt: "2026-09-28T12:00:00Z", odds: [{ id: 101, value: 2.0 }, { id: 102, value: 3.4 }] },
      { createdAt: "2026-09-28T13:00:00Z", odds: [{ id: 103, value: 3.5 }] },
      { createdAt: "2026-09-28T11:00:00Z", isLive: true, odds: [{ id: 101, value: 9 }] },
    ];
    expect(openingFrom(history, ids)).toEqual({ home: 2.0, draw: 3.4, away: 3.5 });
  });
  it("flags moves of 3% and more", () => {
    expect(moved(2.1, 2.0)).toBe(1);
    expect(moved(1.9, 2.0)).toBe(-1);
    expect(moved(2.02, 2.0)).toBe(0);
    expect(moved(2.1, null)).toBe(0);
  });
});
