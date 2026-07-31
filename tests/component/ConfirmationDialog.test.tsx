import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/** Reusable confirmation dialog built from the shadcn AlertDialog primitives. */
function ConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: {
  open?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger asChild>
        <button>Open dialog</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("ConfirmationDialog", () => {
  it("renders the title and description when open", () => {
    render(
      <ConfirmationDialog
        open
        title="Archive contact?"
        description="The contact will be hidden from lists."
      />,
    );
    expect(screen.getByText("Archive contact?")).toBeInTheDocument();
    expect(
      screen.getByText("The contact will be hidden from lists."),
    ).toBeInTheDocument();
  });

  it("fires onConfirm when the confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmationDialog open onConfirm={onConfirm} confirmLabel="Archive" />);
    fireEvent.click(screen.getByText("Archive"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("fires onCancel when the cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmationDialog open onCancel={onCancel} cancelLabel="Keep" />);
    fireEvent.click(screen.getByText("Keep"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("uses default labels when none are provided", () => {
    render(<ConfirmationDialog open />);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders a trigger button when not controlled open", () => {
    render(<ConfirmationDialog />);
    expect(screen.getByText("Open dialog")).toBeInTheDocument();
  });

  it("distinguishes confirm and cancel buttons by their label", () => {
    render(
      <ConfirmationDialog
        open
        confirmLabel="Yes, delete"
        cancelLabel="No, keep it"
      />,
    );
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
    expect(screen.getByText("No, keep it")).toBeInTheDocument();
  });
});
