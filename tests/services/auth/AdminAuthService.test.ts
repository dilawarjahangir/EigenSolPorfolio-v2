// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

import {
  requireOwner,
  requireOwnerForSetup,
} from "@/services/auth/AdminAuthService";

function ownerSession(twoFactorEnabled = true, email = "owner@example.com") {
  return {
    user: {
      id: "10000000-0000-4000-8000-000000000001",
      email,
      name: "Owner",
      twoFactorEnabled,
    },
    session: { id: "session" },
  };
}

describe("admin owner authorization", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "owner@example.com";
    process.env.CONTACT_TO_EMAIL = "moderator@example.com";
    mocks.getSession.mockReset();
    mocks.redirect.mockClear();
  });

  it("returns only the normalized allowlisted owner after TOTP enrollment", async () => {
    mocks.getSession.mockResolvedValue(ownerSession(true, "OWNER@example.com"));

    await expect(requireOwner()).resolves.toEqual({
      userId: "10000000-0000-4000-8000-000000000001",
      email: "OWNER@example.com",
      name: "Owner",
    });
  });

  it("rejects a valid session for any non-owner email", async () => {
    mocks.getSession.mockResolvedValue(ownerSession(true, "someone@example.com"));

    await expect(requireOwner()).rejects.toThrow("redirect:/admin/login");
  });

  it("requires enrolled TOTP for protected mutations and pages", async () => {
    mocks.getSession.mockResolvedValue(ownerSession(false));

    await expect(requireOwner()).rejects.toThrow(
      "redirect:/admin/settings/security",
    );
  });

  it("allows the owner to reach the mandatory TOTP enrollment page", async () => {
    mocks.getSession.mockResolvedValue(ownerSession(false));

    await expect(requireOwnerForSetup()).resolves.toMatchObject({
      email: "owner@example.com",
    });
  });

  it("defaults the owner allowlist to the moderation recipient", async () => {
    delete process.env.ADMIN_EMAIL;
    mocks.getSession.mockResolvedValue(ownerSession(true, "MODERATOR@example.com"));

    await expect(requireOwner()).resolves.toMatchObject({
      email: "MODERATOR@example.com",
    });
  });
});
