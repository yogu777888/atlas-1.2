import { describe, expect, it } from "vitest";
import { fromAmerican, fromFraction, num, toAmerican, toFraction } from "./tools";

describe("odds formats", () => {
  it("parses Russian decimal commas", () => expect(num("1,95")).toBe(1.95));
  it("converts decimal ↔ fractional", () => {
    expect(toFraction(1.9)).toBe("9/10");
    expect(toFraction(4)).toBe("3/1");
    expect(fromFraction("3/2")).toBe(2.5);
  });
  it("converts decimal ↔ american", () => {
    expect(toAmerican(1.9)).toBe("-111");
    expect(toAmerican(2.5)).toBe("+150");
    expect(fromAmerican("-200")).toBe(1.5);
    expect(fromAmerican("+300")).toBe(4);
  });
});
