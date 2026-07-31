import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  SearchField,
  FilterChip,
  FilterBar,
  ClearFiltersButton,
  Select,
  ViewToggle,
} from "@/components/cloudsun/shared/FilterBar";

describe("SearchField", () => {
  it("renders the current value", () => {
    render(<SearchField value="ada" onChange={() => {}} />);
    expect(screen.getByDisplayValue("ada")).toBeInTheDocument();
  });

  it("fires onChange when typing", () => {
    const onChange = vi.fn();
    render(<SearchField value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("shows a clear button when value is non-empty", () => {
    render(<SearchField value="query" onChange={() => {}} />);
    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("hides the clear button when value is empty", () => {
    render(<SearchField value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
  });

  it("clears the value when the clear button is clicked", () => {
    const onChange = vi.fn();
    render(<SearchField value="query" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Clear search"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("uses a custom placeholder", () => {
    render(<SearchField value="" onChange={() => {}} placeholder="Find a contact" />);
    expect(screen.getByPlaceholderText("Find a contact")).toBeInTheDocument();
  });
});

describe("FilterChip", () => {
  it("renders the label", () => {
    render(<FilterChip label="Cybersecurity" />);
    expect(screen.getByText("Cybersecurity")).toBeInTheDocument();
  });

  it("fires onClick when clicked", () => {
    const onClick = vi.fn();
    render(<FilterChip label="Active" onClick={onClick} />);
    fireEvent.click(screen.getByText("Active"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("fires onRemove when the remove control is clicked", () => {
    const onRemove = vi.fn();
    render(<FilterChip label="Active" onRemove={onRemove} />);
    fireEvent.click(screen.getByLabelText("Remove Active filter"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("does not render the remove control when onRemove is omitted", () => {
    render(<FilterChip label="Active" />);
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });
});

describe("FilterBar", () => {
  it("renders its children", () => {
    render(
      <FilterBar>
        <FilterChip label="Chip A" />
        <FilterChip label="Chip B" />
      </FilterBar>,
    );
    expect(screen.getByText("Chip A")).toBeInTheDocument();
    expect(screen.getByText("Chip B")).toBeInTheDocument();
  });
});

describe("ClearFiltersButton", () => {
  it("fires onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ClearFiltersButton onClick={onClick} />);
    fireEvent.click(screen.getByText("Clear all"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Select", () => {
  it("renders the provided options", () => {
    render(
      <Select
        value=""
        onChange={() => {}}
        options={[
          { value: "a", label: "Option A" },
          { value: "b", label: "Option B" },
        ]}
      />,
    );
    // Select element exposes options via get_by_role('listbox') or getByRole
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("fires onChange with the selected value", () => {
    const onChange = vi.fn();
    render(
      <Select
        value=""
        onChange={onChange}
        options={[
          { value: "a", label: "Option A" },
          { value: "b", label: "Option B" },
        ]}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("applies the aria-label", () => {
    render(
      <Select
        value=""
        onChange={() => {}}
        ariaLabel="Filter by stage"
        options={[{ value: "new", label: "New" }]}
      />,
    );
    expect(screen.getByLabelText("Filter by stage")).toBeInTheDocument();
  });
});

describe("ViewToggle", () => {
  it("renders Table and Cards tabs", () => {
    render(<ViewToggle view="table" onChange={() => {}} />);
    expect(screen.getByText("Table")).toBeInTheDocument();
    expect(screen.getByText("Cards")).toBeInTheDocument();
  });

  it("marks the active tab as aria-selected", () => {
    render(<ViewToggle view="cards" onChange={() => {}} />);
    const cardsTab = screen.getByText("Cards");
    expect(cardsTab).toHaveAttribute("aria-selected", "true");
    const tableTab = screen.getByText("Table");
    expect(tableTab).toHaveAttribute("aria-selected", "false");
  });

  it("fires onChange with the selected view", () => {
    const onChange = vi.fn();
    render(<ViewToggle view="table" onChange={onChange} />);
    fireEvent.click(screen.getByText("Cards"));
    expect(onChange).toHaveBeenCalledWith("cards");
  });
});
