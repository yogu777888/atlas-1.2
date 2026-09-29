import { describe, expect, it } from "vitest";
import { classifyLeague } from "./leagues";

const L = (id: number, name: string, country: string, code: string) => ({ id, name, country: { name: country, code } });

describe("classifyLeague", () => {
  it("recognises top leagues by id and by name", () => {
    expect(classifyLeague(L(39, "Premier League", "England", "GB-ENG"))?.key).toBe("epl");
    expect(classifyLeague(L(9999, "Premier League", "England", "GB-ENG"))?.key).toBe("epl");
    expect(classifyLeague(L(235, "Premier League", "Russia", "RU"))?.key).toBe("rpl");
  });
  it("leaves lower divisions and cups alone", () => {
    expect(classifyLeague(L(42, "League Two", "England", "GB-ENG"))).toBeUndefined();
    expect(classifyLeague(L(650, "Second League - Group 3", "Russia", "RU"))).toBeUndefined();
    expect(classifyLeague(L(525, "UEFA Champions League Women", "World", "WW"))).toBeUndefined();
  });
  it("groups senior national-team games, not youth or women", () => {
    expect(classifyLeague(L(5, "UEFA Nations League", "World", "WW"))?.key).toBe("intl");
    expect(classifyLeague(L(8888, "World Cup - Qualification Europe", "World", "WW"))?.key).toBe("intl");
    expect(classifyLeague(L(850, "UEFA U21 Championship - Qualification", "World", "WW"))).toBeUndefined();
  });
});
