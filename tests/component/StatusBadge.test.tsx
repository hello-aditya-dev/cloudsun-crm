import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, SlaIndicator } from "@/components/cloudsun/shared/StatusBadge";

describe("StatusBadge", () => {
  it("renders the correct label for a lead stage", () => {
    render(<StatusBadge kind="leadStage" value="customer" />);
    expect(screen.getByText("Customer")).toBeInTheDocument();
  });

  it("renders multi-word labels humanised (at_risk)", () => {
    render(<StatusBadge kind="leadStage" value="at_risk" />);
    expect(screen.getByText("At risk")).toBeInTheDocument();
  });

  it("renders priority labels", () => {
    const { rerender } = render(<StatusBadge kind="priority" value="low" />);
    expect(screen.getByText("Low")).toBeInTheDocument();
    rerender(<StatusBadge kind="priority" value="urgent" />);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("renders conversation status labels", () => {
    render(<StatusBadge kind="conversationStatus" value="waiting_customer" />);
    expect(screen.getByText("Waiting for customer")).toBeInTheDocument();
  });

  it("renders SLA labels that always include the word SLA", () => {
    const { container } = render(<StatusBadge kind="sla" value="breached" />);
    expect(container.textContent).toContain("SLA");
    expect(container.textContent).toContain("breached");
  });

  it("renders customer status labels", () => {
    render(<StatusBadge kind="customerStatus" value="active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders call outcome labels", () => {
    render(<StatusBadge kind="callOutcome" value="voicemail" />);
    expect(screen.getByText("Voicemail")).toBeInTheDocument();
  });

  it("renders follow-up status labels", () => {
    render(<StatusBadge kind="followUpStatus" value="overdue" />);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("renders a custom badge with the supplied label", () => {
    render(
      <StatusBadge
        kind="custom"
        label="Custom status"
        meta={{ label: "Custom status", badge: "bg-muted", dot: "bg-muted" }}
      />,
    );
    expect(screen.getByText("Custom status")).toBeInTheDocument();
  });

  it("renders a dot indicator (aria-hidden) alongside the label", () => {
    const { container } = render(<StatusBadge kind="priority" value="high" />);
    const dot = container.querySelector("span[aria-hidden]");
    expect(dot).toBeInTheDocument();
  });

  it("falls back gracefully for an unknown value", () => {
    render(<StatusBadge kind="leadStage" value={"unknown_value" as never} />);
    // Should still render something (the capitalised value)
    expect(screen.getByText(/unknown_value/i)).toBeInTheDocument();
  });
});

describe("SlaIndicator", () => {
  it("renders the SLA label", () => {
    render(<SlaIndicator state="safe" />);
    expect(screen.getByText("SLA safe")).toBeInTheDocument();
  });

  it("shows a title tooltip with the due date when provided", () => {
    const dueAt = "2026-06-01T12:00:00Z";
    const { container } = render(<SlaIndicator state="approaching" dueAt={dueAt} />);
    const badge = container.querySelector("[title]");
    expect(badge).toBeInTheDocument();
    expect(badge?.getAttribute("title")).toContain("Due");
  });

  it("falls back to the label title when no due date is provided", () => {
    const { container } = render(<SlaIndicator state="paused" />);
    const badge = container.querySelector("[title]");
    expect(badge?.getAttribute("title")).toBe("SLA paused");
  });
});
