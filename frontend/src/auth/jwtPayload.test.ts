import { describe, expect, it } from "vitest";

import { readRoleFromToken } from "./jwtPayload";

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function makeToken(payload: unknown): string {
  const header = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe("readRoleFromToken", () => {
  it("returns admin for a valid admin payload", () => {
    const token = makeToken({ role: "admin" });
    expect(readRoleFromToken(token)).toBe("admin");
  });

  it("returns intern for a valid intern payload", () => {
    const token = makeToken({ role: "intern" });
    expect(readRoleFromToken(token)).toBe("intern");
  });

  it("returns null when role is missing or invalid", () => {
    expect(readRoleFromToken(makeToken({}))).toBeNull();
    expect(readRoleFromToken(makeToken({ role: "guest" }))).toBeNull();
  });

  it("returns null for malformed tokens", () => {
    expect(readRoleFromToken("not.a.jwt")).toBeNull();
    expect(readRoleFromToken("abc")).toBeNull();
  });
});
