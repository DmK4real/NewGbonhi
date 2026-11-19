import { describe, expect, it } from "vitest";
import { shouldUseHashRouter } from "./routerMode.js";

describe("public site routing", () => {
  it("preserves direct links on the custom domain even with the legacy hash build setting", () => {
    for (const host of ["newgbonhi.com", "www.newgbonhi.com", "newgbonhi.pages.dev", "e38bd217.newgbonhi.pages.dev"]) {
      expect(shouldUseHashRouter("true", host)).toBe(false);
    }
  });
  it("keeps explicit hash routing on other hosts and history mode by default", () => {
    expect(shouldUseHashRouter("true", "dmk4real.github.io")).toBe(true);
    expect(shouldUseHashRouter("false", "dmk4real.github.io")).toBe(false);
    expect(shouldUseHashRouter(undefined, "localhost")).toBe(false);
  });
});
