import { describe, expect, it } from "vitest";

import { shouldRedirectAuthPageToDashboard, shouldRedirectRootToDashboard } from "@/lib/auth-navigation";

describe("auth navigation", () => {
  it("redirects signed-in root visitors to the dashboard", () => {
    expect(shouldRedirectRootToDashboard({ id: "user-1" })).toBe(true);
  });

  it("keeps signed-out root visitors on the public entry page", () => {
    expect(shouldRedirectRootToDashboard(null)).toBe(false);
    expect(shouldRedirectRootToDashboard(undefined)).toBe(false);
    expect(shouldRedirectRootToDashboard({ id: null })).toBe(false);
  });

  it("redirects signed-in auth-page visitors to the dashboard", () => {
    expect(shouldRedirectAuthPageToDashboard({ id: "user-1" })).toBe(true);
  });

  it("keeps signed-out auth-page visitors on the auth forms", () => {
    expect(shouldRedirectAuthPageToDashboard(null)).toBe(false);
    expect(shouldRedirectAuthPageToDashboard(undefined)).toBe(false);
    expect(shouldRedirectAuthPageToDashboard({ id: null })).toBe(false);
  });
});
