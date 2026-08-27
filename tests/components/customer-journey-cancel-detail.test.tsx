import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerJourneySection } from "@/components/dashboard/CustomerJourneySection";

describe("Customer Journey Cancel details", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query === "(hover: hover)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("reveals reason-level lost revenue from More detail on hover", () => {
    render(<CustomerJourneySection />);

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /^Cancel 2,380$/ }),
    );

    const moreDetail = screen.getByRole("button", { name: "More detail" });
    expect(moreDetail.getAttribute("aria-expanded")).toBe("false");

    fireEvent.mouseEnter(moreDetail);

    expect(moreDetail.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Cancellation reason")).toBeTruthy();
    expect(screen.getByText("Lost revenue")).toBeTruthy();
    expect(
      screen.getByText(
        "modify existing order (colour, size, address, voucher, etc.)",
      ),
    ).toBeTruthy();
    expect(screen.getByText("3,749,246 ₫")).toBeTruthy();
    expect(screen.getByText("170,320 ₫")).toBeTruthy();
  });
});
