// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BlogEditorLinkDialog } from "@/components/admin/BlogEditorLinkDialog";

describe("BlogEditorLinkDialog", () => {
  it("portals its form outside the parent post form without bubbling form events", async () => {
    const user = userEvent.setup();
    const onPostInput = vi.fn();
    const onPostSubmit = vi.fn();
    render(
      <form aria-label="Post form" onInput={onPostInput} onSubmit={onPostSubmit}>
        <BlogEditorLinkDialog
          initialValue=""
          onCancel={vi.fn()}
          onSubmit={vi.fn()}
        />
      </form>,
    );

    const postForm = screen.getByRole("form", { name: "Post form" });
    expect(postForm.querySelector("form")).toBeNull();
    expect(screen.getByRole("dialog", { name: "Add a link" })).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    await user.type(screen.getByRole("textbox", { name: "Link URL" }), "/about");
    await user.click(screen.getByRole("button", { name: "Apply link" }));
    expect(onPostInput).not.toHaveBeenCalled();
    expect(onPostSubmit).not.toHaveBeenCalled();
  });

  it("validates URLs and submits safe relative links", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <BlogEditorLinkDialog
        initialValue=""
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Link URL" });
    await waitFor(() => expect(input).toHaveFocus());
    await user.type(input, "javascript:alert(1)");
    await user.click(screen.getByRole("button", { name: "Apply link" }));
    expect(screen.getByRole("alert")).toHaveTextContent("site-relative path");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, "/services");
    await user.click(screen.getByRole("button", { name: "Apply link" }));
    expect(onSubmit).toHaveBeenCalledWith("/services");
  });

  it("closes with Escape and restores focus when removed", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();

    const view = render(
      <BlogEditorLinkDialog
        initialValue="https://example.com"
        onCancel={onCancel}
        onSubmit={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Link URL" })).toHaveFocus());
    screen.getByRole("button", { name: "Close link dialog" }).focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByRole("button", { name: "Apply link" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
    view.unmount();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
