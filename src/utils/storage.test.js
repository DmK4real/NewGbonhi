import { afterEach, describe, expect, it, vi } from "vitest";
import { readStoredValue, writeStoredValue, removeStoredValue } from "./storage.js";

afterEach(() => vi.unstubAllGlobals());

describe("optional browser storage", () => {
  it("keeps normal local and session storage separate", () => {
    const makeStorage = () => {
      const values = new Map();
      return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
    };
    vi.stubGlobal("window", { localStorage: makeStorage(), sessionStorage: makeStorage() });
    expect(writeStoredValue("language", "fr")).toBe(true);
    expect(writeStoredValue("token", "test", "sessionStorage")).toBe(true);
    expect(readStoredValue("language")).toBe("fr");
    expect(readStoredValue("token")).toBe(null);
    expect(readStoredValue("token", "sessionStorage")).toBe("test");
    expect(removeStoredValue("token", "sessionStorage")).toBe(true);
    expect(readStoredValue("token", "sessionStorage")).toBe(null);
  });

  it("survives policies that throw when the storage property is read", () => {
    const blocked = {};
    for (const kind of ["localStorage", "sessionStorage"]) Object.defineProperty(blocked, kind, { get() { throw new DOMException("Blocked", "SecurityError"); } });
    vi.stubGlobal("window", blocked);
    for (const kind of ["localStorage", "sessionStorage"]) {
      expect(readStoredValue("key", kind)).toBe(null);
      expect(writeStoredValue("key", "value", kind)).toBe(false);
      expect(removeStoredValue("key", kind)).toBe(false);
    }
  });

  it("survives full storage and unavailable storage methods", () => {
    vi.stubGlobal("window", { localStorage: { getItem() { throw new Error("unavailable"); }, setItem() { throw new DOMException("Full", "QuotaExceededError"); }, removeItem() { throw new Error("unavailable"); } } });
    expect(readStoredValue("key")).toBe(null);
    expect(writeStoredValue("key", "value")).toBe(false);
    expect(removeStoredValue("key")).toBe(false);
    expect(readStoredValue("key", "sessionStorage")).toBe(null);
  });
});
