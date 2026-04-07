import type { Role } from "./roles";

export function readRoleFromToken(token: string): Role | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlToUtf8(parts[1]);
    const payload = JSON.parse(payloadJson) as { role?: unknown };
    if (payload.role === "admin" || payload.role === "intern") {
      return payload.role;
    }
    return null;
  } catch {
    return null;
  }
}

function base64UrlToUtf8(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(pad);
  const binary = atob(padded);
  try {
    return decodeURIComponent(
      Array.from(binary, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
  } catch {
    return binary;
  }
}
