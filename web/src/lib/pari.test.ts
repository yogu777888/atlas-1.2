import { describe, expect, it } from "vitest";
import { findPariLine, nameSimilarity } from "./pari";

describe("PARI ↔ sstats matching", () => {
  it("matches differently spelled team names", () => {
    expect(nameSimilarity("Olimpia", "Olimpia Asuncion")).toBe(1);
    expect(nameSimilarity("Zenit St. Petersburg", "Zenit")).toBe(1);
    expect(nameSimilarity("Spartak Moscow", "CSKA Moscow")).toBeLessThan(1);
  });
  it("needs the kick-off time to line up", () => {
    const start = Date.parse("2026-09-29T01:00:00+03:00");
    const lines = [{ start, home: "Libertad Asuncion", away: "Olimpia Asuncion", odds: null, url: null, updatedAt: null }];
    expect(findPariLine(lines, start, "Libertad Asuncion", "Olimpia")).toBeDefined();
    expect(findPariLine(lines, start + 3 * 3600_000, "Libertad Asuncion", "Olimpia")).toBeUndefined();
  });
});
