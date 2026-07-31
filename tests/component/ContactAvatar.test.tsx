import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ContactAvatar,
  TeamAvatar,
  AvatarStack,
} from "@/components/cloudsun/shared/ContactAvatar";

describe("ContactAvatar", () => {
  it("renders initials derived from the name", () => {
    render(<ContactAvatar name="Ada Lovelace" />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("renders ? for an empty name", () => {
    render(<ContactAvatar name="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("uses only the first two words for initials", () => {
    render(<ContactAvatar name="Ada Augusta Lovelace King" />);
    // initials() slices to the first 2 words → "Ada" + "Augusta" = "AA"
    expect(screen.getByText("AA")).toBeInTheDocument();
  });

  it("marks the avatar as aria-hidden", () => {
    const { container } = render(<ContactAvatar name="Test User" />);
    const avatar = container.querySelector("[aria-hidden]");
    expect(avatar).toBeInTheDocument();
  });

  it("applies a custom background colour when provided", () => {
    const { container } = render(
      <ContactAvatar name="Custom" color="oklch(0.5 0.1 200)" />,
    );
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.style.backgroundColor).toBe("oklch(0.5 0.1 200)");
  });

  it("derives a deterministic colour from the name when none is provided", () => {
    const { container: c1 } = render(<ContactAvatar name="Ada" />);
    const { container: c2 } = render(<ContactAvatar name="Ada" />);
    const bg1 = (c1.firstChild as HTMLElement).style.backgroundColor;
    const bg2 = (c2.firstChild as HTMLElement).style.backgroundColor;
    expect(bg1).toBe(bg2);
  });
});

describe("TeamAvatar", () => {
  it("renders the supplied initials", () => {
    render(<TeamAvatar initials="AB" color="oklch(0.5 0.1 200)" />);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders a status dot when status is provided", () => {
    const { container } = render(
      <TeamAvatar initials="AB" color="oklch(0.5 0.1 200)" status="online" />,
    );
    // The status dot is the second child span (aria-hidden)
    const dots = container.querySelectorAll("span[aria-hidden]");
    expect(dots.length).toBeGreaterThanOrEqual(2);
  });

  it("does not render a status dot when status is omitted", () => {
    const { container } = render(
      <TeamAvatar initials="AB" color="oklch(0.5 0.1 200)" />,
    );
    const dots = container.querySelectorAll("span[aria-hidden]");
    expect(dots).toHaveLength(1);
  });
});

describe("AvatarStack", () => {
  it("renders up to the max number of avatars", () => {
    const items = [
      { id: "1", name: "Ada Lovelace" },
      { id: "2", name: "Bob Builder" },
      { id: "3", name: "Cara Dent" },
      { id: "4", name: "Dan Dare" },
      { id: "5", name: "Eve Stone" },
    ];
    render(<AvatarStack items={items} max={3} />);
    // 3 avatars shown + 1 overflow indicator
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("does not show an overflow indicator when items fit within max", () => {
    const items = [
      { id: "1", name: "Ada Lovelace" },
      { id: "2", name: "Bob Builder" },
    ];
    const { container } = render(<AvatarStack items={items} max={4} />);
    expect(container.textContent).not.toContain("+");
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<AvatarStack items={[]} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.textContent).not.toContain("+");
  });
});
