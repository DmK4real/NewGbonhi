import { describe, expect, it } from "vitest";
import { FACES_DROP_TIMESTAMP, getFacesCountdown } from "./facesDrop.js";

describe("Faces countdown", () => {
  it("opens at 18:00 in Abidjan, regardless of the visitor's timezone", () => {
    expect(FACES_DROP_TIMESTAMP).toBe(Date.parse("2026-12-19T19:00:00+01:00"));
    expect(FACES_DROP_TIMESTAMP).toBe(Date.parse("2026-12-19T13:00:00-05:00"));
    expect(getFacesCountdown(Date.parse("2026-12-18T16:57:56Z"))).toEqual({ days: 1, hours: 1, minutes: 2, seconds: 4, finished: false });
  });
  it("keeps counting until the exact launch time and never returns negative values", () => {
    expect(getFacesCountdown(FACES_DROP_TIMESTAMP - 1)).toMatchObject({ seconds: 1, finished: false });
    expect(getFacesCountdown(FACES_DROP_TIMESTAMP)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
    expect(getFacesCountdown(FACES_DROP_TIMESTAMP + 86400000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
  });
});
