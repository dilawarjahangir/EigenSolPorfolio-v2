// @vitest-environment jsdom

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signOut: vi.fn(async () => undefined),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/posts",
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: mocks.signOut },
}));

import { AdminShell } from "@/components/admin/AdminShell";

describe("admin shell", () => {
  it("marks the current route and restores menu-button focus after Escape", async () => {
    const user = userEvent.setup();
    render(
      <AdminShell ownerEmail="owner@example.com">
        <h1>Posts</h1>
      </AdminShell>,
    );

    const menu = screen.getByRole("button", { name: "Open admin navigation" });
    await user.click(menu);
    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveFocus();

    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByRole("link", { name: "View public site" })).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(dashboard).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(menu).toHaveFocus();
    expect(menu).toHaveAttribute("aria-expanded", "false");
  });
});
