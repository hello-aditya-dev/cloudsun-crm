import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandPalette } from "@/components/cloudsun/app/CommandPalette";
import { useDemoStore } from "@/lib/demo-store";

beforeEach(() => {
  window.localStorage.clear();
  useDemoStore.getState().reset();
  useDemoStore.getState().setCommandOpen(false);
});

describe("CommandPalette", () => {
  it("does not render when closed", () => {
    useDemoStore.getState().setCommandOpen(false);
    const { container } = render(<CommandPalette />);
    expect(container.firstChild).toBeNull();
  });

  it("renders as a dialog when open", () => {
    useDemoStore.getState().setCommandOpen(true);
    render(<CommandPalette />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("shows the search input with an accessible label", () => {
    useDemoStore.getState().setCommandOpen(true);
    render(<CommandPalette />);
    expect(screen.getByLabelText("Command palette search")).toBeInTheDocument();
  });

  it("lists navigation results by default", () => {
    useDemoStore.getState().setCommandOpen(true);
    render(<CommandPalette />);
    // Overview and Inbox are nav items that should appear
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Inbox")).toBeInTheDocument();
  });

  it("filters results by query", () => {
    useDemoStore.getState().setCommandOpen(true);
    render(<CommandPalette />);
    const input = screen.getByLabelText("Command palette search");
    fireEvent.change(input, { target: { value: "inbox" } });
    // Inbox should still be visible
    expect(screen.getByText("Inbox")).toBeInTheDocument();
    // Overview should be filtered out
    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
  });

  it("shows a no-results message for an unmatched query", () => {
    useDemoStore.getState().setCommandOpen(true);
    render(<CommandPalette />);
    fireEvent.change(screen.getByLabelText("Command palette search"), {
      target: { value: "zzzzznomatch" },
    });
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("navigates when a result is clicked", () => {
    useDemoStore.getState().setCommandOpen(true);
    const navigateSpy = vi.spyOn(useDemoStore.getState(), "navigate");
    render(<CommandPalette />);
    // "Contacts" appears both as a nav result and as a group heading.
    // Click the option (button) whose label is exactly "Contacts".
    const contactsOption = screen.getAllByRole("option").find(
      (el) => el.textContent?.trim().startsWith("Contacts"),
    );
    expect(contactsOption).toBeDefined();
    fireEvent.click(contactsOption!);
    // Nav-item actions call navigate(viewId) — params defaults to {} inside
    // the store, so the spy sees only the first argument.
    expect(navigateSpy).toHaveBeenCalledWith("contacts");
    // Palette should close after navigation
    expect(useDemoStore.getState().commandOpen).toBe(false);
    navigateSpy.mockRestore();
  });

  it("closes when the Escape key is pressed", () => {
    useDemoStore.getState().setCommandOpen(true);
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(useDemoStore.getState().commandOpen).toBe(false);
  });

  it("opens via Ctrl+K keyboard shortcut", () => {
    render(<CommandPalette />);
    expect(useDemoStore.getState().commandOpen).toBe(false);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(useDemoStore.getState().commandOpen).toBe(true);
  });

  it("opens via Cmd+K keyboard shortcut", () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(useDemoStore.getState().commandOpen).toBe(true);
  });

  it("renders grouped results with group headings", () => {
    useDemoStore.getState().setCommandOpen(true);
    render(<CommandPalette />);
    // "Navigate" group should be present
    expect(screen.getByText("Navigate")).toBeInTheDocument();
  });

  it("shows contacts from the demo data", () => {
    useDemoStore.getState().setCommandOpen(true);
    render(<CommandPalette />);
    const input = screen.getByLabelText("Command palette search");
    // Search for a contact — pick the first non-archived contact's first name.
    const firstContact = useDemoStore.getState().contacts.find((c) => !c.archived);
    if (firstContact) {
      fireEvent.change(input, { target: { value: firstContact.fullName.split(" ")[0] } });
      // The contact name may appear as both a result label and a hint, so
      // assert that at least one element renders the full name.
      const matches = screen.getAllByText(firstContact.fullName);
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it("closes when the overlay is clicked", () => {
    useDemoStore.getState().setCommandOpen(true);
    const { container } = render(<CommandPalette />);
    const overlay = container.querySelector(".bg-overlay");
    if (overlay) {
      fireEvent.click(overlay);
      expect(useDemoStore.getState().commandOpen).toBe(false);
    }
  });
});
