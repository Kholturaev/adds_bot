import { describe, expect, it } from "vitest";
import { isValidAdminCredentials } from "./admin-auth.service";

describe("isValidAdminCredentials", () => {
  it("returns true for matching credentials", () => {
    expect(isValidAdminCredentials("admin", "secret", "admin", "secret")).toBe(
      true,
    );
  });

  it("returns false for non-matching credentials", () => {
    expect(isValidAdminCredentials("admin", "wrong", "admin", "secret")).toBe(
      false,
    );
  });

  it("returns false when headers are missing", () => {
    expect(
      isValidAdminCredentials(undefined, undefined, "admin", "secret"),
    ).toBe(false);
  });
});
