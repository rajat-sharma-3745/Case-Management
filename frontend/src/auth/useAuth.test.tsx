import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow("useAuth must be used within an AuthProvider");
  });

  it("provides a default unauthenticated state inside provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBeNull();
    expect(result.current.role).toBeNull();
  });
});
