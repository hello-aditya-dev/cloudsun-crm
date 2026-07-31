import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  EmptyState,
  FilteredEmptyState,
  ErrorState,
  NotFoundState,
  LoadingState,
} from "@/components/cloudsun/shared/EmptyState";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(<EmptyState title="No contacts yet" description="Create your first contact" />);
    expect(screen.getByText("No contacts yet")).toBeInTheDocument();
    expect(screen.getByText("Create your first contact")).toBeInTheDocument();
  });

  it("renders an action when provided", () => {
    render(<EmptyState title="Empty" action={<button>Add</button>} />);
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("does not render a description paragraph when omitted", () => {
    const { container } = render(<EmptyState title="Just a title" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});

describe("FilteredEmptyState", () => {
  it("renders default title and description", () => {
    render(<FilteredEmptyState />);
    expect(screen.getByText("No results match your filters")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting or clearing your filters to see more.")).toBeInTheDocument();
  });

  it("renders a Clear filters button when onClear is provided", () => {
    const onClear = vi.fn();
    render(<FilteredEmptyState onClear={onClear} />);
    const button = screen.getByText("Clear filters");
    fireEvent.click(button);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("does not render the button when onClear is omitted", () => {
    render(<FilteredEmptyState />);
    expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
  });

  it("accepts custom title and description", () => {
    render(<FilteredEmptyState title="Custom" description="Custom desc" />);
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByText("Custom desc")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders default title and description", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("fires onRetry when the Try again button is clicked", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("NotFoundState", () => {
  it("renders default title", () => {
    render(<NotFoundState />);
    expect(screen.getByText("Not found")).toBeInTheDocument();
  });

  it("fires onBack when the Go back button is clicked", () => {
    const onBack = vi.fn();
    render(<NotFoundState onBack={onBack} />);
    fireEvent.click(screen.getByText("Go back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe("LoadingState", () => {
  it("renders with role=status for screen readers", () => {
    const { container } = render(<LoadingState />);
    const status = container.querySelector('[role="status"]');
    expect(status).toBeInTheDocument();
  });

  it("renders the default label", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<LoadingState label="Fetching contacts" />);
    expect(screen.getByText("Fetching contacts")).toBeInTheDocument();
  });
});
