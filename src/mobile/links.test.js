import { describe, expect, it } from "vitest";
import { mobileRouteFromUrl } from "./links.js";

describe("mobile links", () => {
  it.each([
    ["newgbonhi://app/checkout?payment=success", "/checkout?payment=success"],
    ["newgbonhi://app/product/camo", "/product/camo"],
    ["https://newgbonhi.com/faces", "/faces"],
    ["https://www.newgbonhi.com/#/collections", "/collections"],
    ["https://newgbonhi.com/", "/"],
  ])("opens the intended app route for %s", (url, route) => {
    expect(mobileRouteFromUrl(url)).toBe(route);
  });
  it.each([
    "https://newgbonhi.com.evil.example/faces", "https://evil.example/faces",
    "http://newgbonhi.com/faces", "javascript:alert(1)", "//evil.example/faces",
    "https://user:pass@newgbonhi.com/faces", "https://newgbonhi.com:8443/faces",
    "newgbonhi://other/faces", "https://newgbonhi.com/api/orders",
    "https://newgbonhi.com/assets/test.js", "https://newgbonhi.com/#//evil.example",
  ])("rejects unrelated URLs: %s", url => {
    expect(mobileRouteFromUrl(url)).toBeNull();
  });
});
