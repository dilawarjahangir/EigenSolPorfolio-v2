// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AdminSelect, type AdminSelectOption } from "@/components/admin/AdminSelect";

const statusOptions: readonly AdminSelectOption[] = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

describe("AdminSelect", () => {
  it("exposes its label, selected value, and form value", () => {
    render(
      <form aria-label="Post filters">
        <AdminSelect
          name="status"
          label="Status"
          options={statusOptions}
          defaultValue="draft"
        />
      </form>,
    );

    const control = screen.getByRole("combobox", { name: "Status" });
    expect(control).toHaveTextContent("Draft");
    expect(control).toHaveAttribute("aria-expanded", "false");
    expect(new FormData(screen.getByRole<HTMLFormElement>("form")).get("status")).toBe("draft");
  });

  it("selects an option with a pointer and returns focus to the control", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <AdminSelect
        name="status"
        label="Status"
        options={statusOptions}
        onValueChange={onValueChange}
      />,
    );

    const control = screen.getByRole("combobox", { name: "Status" });
    await user.click(control);
    expect(screen.getByRole("listbox", { name: "Status" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Published" }));

    expect(control).toHaveTextContent("Published");
    expect(control).toHaveAttribute("aria-expanded", "false");
    expect(control).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledWith("published");
  });

  it("supports arrow navigation, skips disabled options, and selects with Enter", async () => {
    const user = userEvent.setup();
    render(
      <AdminSelect
        name="workflow"
        label="Workflow"
        defaultValue="draft"
        options={[
          { value: "draft", label: "Draft" },
          { value: "review", label: "In review", disabled: true },
          { value: "published", label: "Published" },
        ]}
      />,
    );

    const control = screen.getByRole("combobox", { name: "Workflow" });
    control.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(control).toHaveTextContent("Published");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes with Escape without changing the selected value", async () => {
    const user = userEvent.setup();
    render(
      <AdminSelect
        name="status"
        label="Status"
        options={statusOptions}
        defaultValue="draft"
      />,
    );

    const control = screen.getByRole("combobox", { name: "Status" });
    control.focus();
    await user.keyboard("{Enter}{ArrowDown}{Escape}");

    expect(control).toHaveAttribute("aria-expanded", "false");
    expect(control).toHaveTextContent("Draft");
    expect(control).toHaveFocus();
  });

  it("supports typeahead while closed", async () => {
    const user = userEvent.setup();
    render(<AdminSelect name="status" label="Status" options={statusOptions} />);

    const control = screen.getByRole("combobox", { name: "Status" });
    control.focus();
    await user.keyboard("p");

    expect(control).toHaveTextContent("Published");
    expect(control).toHaveAttribute("aria-expanded", "false");
  });

  it("restores an uncontrolled value when its form resets", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Editor">
        <AdminSelect
          name="status"
          label="Status"
          options={statusOptions}
          defaultValue="draft"
        />
      </form>,
    );

    const form = screen.getByRole<HTMLFormElement>("form");
    const control = screen.getByRole("combobox", { name: "Status" });
    await user.click(control);
    await user.click(screen.getByRole("option", { name: "Archived" }));
    expect(control).toHaveTextContent("Archived");

    fireEvent.reset(form);
    expect(control).toHaveTextContent("Draft");
    expect(new FormData(form).get("status")).toBe("draft");
  });

  it("supports a controlled value while preserving form submission", async () => {
    const user = userEvent.setup();

    function ControlledSelect() {
      const [value, setValue] = useState("draft");
      return (
        <form aria-label="Controlled editor">
          <AdminSelect
            name="status"
            label="Status"
            options={statusOptions}
            value={value}
            onValueChange={setValue}
          />
        </form>
      );
    }

    render(<ControlledSelect />);
    const form = screen.getByRole<HTMLFormElement>("form");
    const control = screen.getByRole("combobox", { name: "Status" });
    await user.click(control);
    await user.click(screen.getByRole("option", { name: "Published" }));

    expect(control).toHaveTextContent("Published");
    expect(new FormData(form).get("status")).toBe("published");
  });
});
