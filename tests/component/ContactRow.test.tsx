import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { StatusBadge } from "@/components/cloudsun/shared/StatusBadge";
import { useDemoStore } from "@/lib/demo-store";
import type { Contact } from "@/types/domain";

beforeEach(() => {
  window.localStorage.clear();
  useDemoStore.getState().reset();
});

/**
 * Minimal contact row that mirrors the markup pattern used by ContactsView.
 * This lets us test the row composition (avatar + name + stage badge + company)
 * in isolation without rendering the entire view.
 */
function ContactRow({
  contact,
  companyName,
  onClick,
}: {
  contact: Contact;
  companyName?: string;
  onClick?: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(contact.id)}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left hover:bg-surface-hover"
      aria-label={`Open contact ${contact.fullName}`}
    >
      <ContactAvatar name={contact.fullName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {contact.fullName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {contact.jobTitle || "No title"}
        </p>
      </div>
      {companyName && (
        <span className="truncate text-xs text-muted-foreground">{companyName}</span>
      )}
      <StatusBadge kind="leadStage" value={contact.leadStage} />
    </button>
  );
}

describe("ContactRow", () => {
  function makeContact(overrides: Partial<Contact> = {}): Contact {
    const seed = useDemoStore.getState().contacts[0];
    return { ...seed, id: "ct-test", fullName: "Ada Lovelace", ...overrides };
  }

  it("renders the contact name and job title", () => {
    const contact = makeContact({ fullName: "Ada Lovelace", jobTitle: "CTO" });
    render(<ContactRow contact={contact} />);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("CTO")).toBeInTheDocument();
  });

  it("shows 'No title' when jobTitle is empty", () => {
    const contact = makeContact({ jobTitle: "" });
    render(<ContactRow contact={contact} />);
    expect(screen.getByText("No title")).toBeInTheDocument();
  });

  it("renders a lead-stage status badge", () => {
    const contact = makeContact({ leadStage: "customer" });
    render(<ContactRow contact={contact} />);
    expect(screen.getByText("Customer")).toBeInTheDocument();
  });

  it("renders the company name when provided", () => {
    const contact = makeContact();
    render(<ContactRow contact={contact} companyName="Acme Corp" />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("does not render a company name span when not provided", () => {
    const contact = makeContact();
    render(<ContactRow contact={contact} />);
    expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
  });

  it("fires onClick with the contact id when clicked", () => {
    const onClick = vi.fn();
    const contact = makeContact({ id: "ct-123" });
    render(<ContactRow contact={contact} onClick={onClick} />);
    fireEvent.click(screen.getByLabelText("Open contact Ada Lovelace"));
    expect(onClick).toHaveBeenCalledWith("ct-123");
  });

  it("renders an accessible label that includes the contact name", () => {
    const contact = makeContact({ fullName: "Wei-Lin Tan" });
    render(<ContactRow contact={contact} />);
    expect(screen.getByLabelText("Open contact Wei-Lin Tan")).toBeInTheDocument();
  });

  it("truncates long names without breaking layout (renders in a button)", () => {
    const longName = "Sven-Åke Östergren the Third Junior";
    const contact = makeContact({ fullName: longName });
    const { container } = render(<ContactRow contact={contact} />);
    const nameEl = container.querySelector(".truncate");
    expect(nameEl).toBeInTheDocument();
    expect(nameEl?.textContent).toContain(longName);
  });
});
