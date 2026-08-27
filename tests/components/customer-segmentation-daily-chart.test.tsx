import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerSegmentationSection } from "@/components/dashboard/CustomerSegmentationSection";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("daily customer segmentation chart", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
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

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders 7 daily columns with all four renamed segments", () => {
    const { container } = render(<CustomerSegmentationSection />);
    const chart = screen.getByRole("img", {
      name: "Daily customer segmentation by customers",
    });

    expect(container.querySelectorAll("[data-segmentation-day]")).toHaveLength(
      7,
    );
    expect(within(chart).getAllByRole("graphics-symbol")).toHaveLength(28);
    expect(screen.getByRole("button", { name: "Top Buyers" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Big Spenders" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Potential" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Occasional Buyers" }),
    ).toBeTruthy();
    [
      "Jul 27",
      "Jul 28",
      "Jul 29",
      "Jul 30",
      "Jul 31",
      "Aug 1",
      "Aug 2",
    ].forEach((dateLabel) => expect(chart.textContent).toContain(dateLabel));

    const newReturningBar = container.querySelector(
      "[data-stacked-customer-bar] rect",
    );
    const segmentationBar = container.querySelector(
      "[data-segmentation-day] rect",
    );
    expect(segmentationBar?.getAttribute("width")).toBe(
      newReturningBar?.getAttribute("width"),
    );
  });

  it("switches the same daily stacks from customer count to revenue", () => {
    render(<CustomerSegmentationSection />);

    const metricControl = screen.getByRole("radiogroup", {
      name: "Customer segmentation metric",
    });
    fireEvent.click(
      within(metricControl).getByRole("radio", { name: "Revenue" }),
    );

    expect(
      screen.getByRole("img", {
        name: "Daily customer segmentation by revenue",
      }),
    ).toBeTruthy();
  });
});
