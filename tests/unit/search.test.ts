import { describe, it, expect } from "vitest";
import { normalizeSearch, matchesQuery, toHaystack } from "@/lib/search";

describe("normalizeSearch", () => {
  it("lowercases input", () => {
    expect(normalizeSearch("Eleanor Whitfield")).toBe("eleanor whitfield");
  });

  it("strips diacritics so álvarez matches alvarez", () => {
    expect(normalizeSearch("Mateo Álvarez")).toBe("mateo alvarez");
    expect(normalizeSearch("Sven-Åke Östergren")).toBe("sven-ake ostergren");
    expect(normalizeSearch("Hannah Bergström")).toBe("hannah bergstrom");
  });

  it("collapses internal whitespace", () => {
    expect(normalizeSearch("  Wei-Lin   Tan  ")).toBe("wei-lin tan");
  });

  it("returns empty string for null/undefined/non-string", () => {
    expect(normalizeSearch(null)).toBe("");
    expect(normalizeSearch(undefined)).toBe("");
    expect(normalizeSearch(42)).toBe("");
    expect(normalizeSearch({ x: 1 })).toBe("");
  });
});

describe("matchesQuery", () => {
  it("empty query matches everything", () => {
    expect(matchesQuery("anything", "")).toBe(true);
    expect(matchesQuery("", "")).toBe(true);
  });

  it("single token substring match is case- and diacritic-insensitive", () => {
    expect(matchesQuery("Eleanor Whitfield", "eleanor")).toBe(true);
    expect(matchesQuery("Eleanor Whitfield", "ELEANOR")).toBe(true);
    expect(matchesQuery("Mateo Álvarez", "alvarez")).toBe(true);
  });

  it("multi-token query requires every token to appear (order-independent)", () => {
    expect(matchesQuery("Wei-Lin Tan", "wei lin")).toBe(true);
    expect(matchesQuery("Wei-Lin Tan", "lin wei")).toBe(true);
    expect(matchesQuery("Wei-Lin Tan", "wei missing")).toBe(false);
  });

  it("returns false when haystack is empty but query is not", () => {
    expect(matchesQuery("", "anything")).toBe(false);
    expect(matchesQuery(null, "anything")).toBe(false);
  });

  it("prefix matching works (eleanor whit matches Eleanor Whitfield)", () => {
    expect(matchesQuery("Eleanor Whitfield", "eleanor whit")).toBe(true);
  });
});

describe("toHaystack", () => {
  it("joins parts and normalizes, skipping nullish entries", () => {
    expect(toHaystack(["Eleanor Whitfield", null, "Austin", undefined])).toBe(
      "eleanor whitfield austin",
    );
  });

  it("returns empty string for all-nullish input", () => {
    expect(toHaystack([null, undefined])).toBe("");
  });
});
