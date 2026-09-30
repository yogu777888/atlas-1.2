import { describe, expect, it } from "vitest";
import { teamRu } from "./teams";

describe("teamRu", () => {
  it("translates known clubs regardless of accents and punctuation", () => {
    expect(teamRu("Bayern München")).toBe("Бавария");
    expect(teamRu("Borussia Mönchengladbach")).toBe("Боруссия М");
    expect(teamRu("Zenit St. Petersburg")).toBe("Зенит");
    expect(teamRu("Bodø/Glimt")).toBe("Будё-Глимт");
    expect(teamRu("FC Barcelona")).toBe("Барселона");
  });
  it("keeps unknown teams as they are", () => {
    expect(teamRu("America Mineiro")).toBe("America Mineiro");
  });
});

it("knows short spellings of RPL clubs", () => {
  expect(teamRu("Dynamo")).toBe("Динамо");
  expect(teamRu("Dynamo Makhachkala")).toBe("Динамо Махачкала");
});
