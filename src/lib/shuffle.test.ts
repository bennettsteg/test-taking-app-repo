import { describe, expect, it } from "vitest";
import { shuffleArray } from "./shuffle";

describe("shuffleArray", () => {
  it("returns an array with the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffleArray(input);
    expect(input).toEqual(copy);
  });

  it("returns a new array instance", () => {
    const input = [1, 2, 3];
    const result = shuffleArray(input);
    expect(result).not.toBe(input);
  });

  it("handles empty and single-element arrays", () => {
    expect(shuffleArray([])).toEqual([]);
    expect(shuffleArray([1])).toEqual([1]);
  });
});
