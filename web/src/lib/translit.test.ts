import { describe, expect, it } from "vitest";
import { slugify } from "./translit";

describe("slugify", () => {
  it("transliterates Russian team names", () => {
    expect(slugify("Зенит")).toBe("zenit");
    expect(slugify("Ак Барс")).toBe("ak-bars");
    expect(slugify("Локомотив-Кубань")).toBe("lokomotiv-kuban");
  });
  it("keeps latin names", () => {
    expect(slugify("Real Madrid")).toBe("real-madrid");
  });
});
