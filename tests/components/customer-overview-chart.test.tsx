import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerSegmentationSection } from "@/components/dashboard/CustomerSegmentationSection";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("Customer Overview stacked daily chart", () => {
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

  afterEach(() => vi.unstubAllGlobals());

  it("renders one stacked column and date label per day without a trend line", () => {
    const { container } = render(<CustomerSegmentationSection />);
    const customerChart = container.querySelector(
      'svg[aria-label="Daily new and returning customer counts"]',
    );

    expect(customerChart).toBeTruthy();
    expect(
      customerChart?.querySelectorAll("[data-stacked-customer-bar]").length,
    ).toBe(7);
    expect(
      customerChart?.querySelector('[data-customer-series="total"]'),
    ).toBeNull();

    const chartLabels = Array.from(
      customerChart?.querySelectorAll("text") ?? [],
    ).map((node) => node.textContent);
    expect(chartLabels).toContain("Jul 27");
    expect(chartLabels).toContain("Aug 2");

    const firstDay = customerChart?.querySelector(
      '[role="graphics-symbol"]',
    );
    expect(firstDay?.getAttribute("aria-label")).toContain("32 total");

    const metricToggle = screen.getByRole("radiogroup", {
      name: "New versus returning metric",
    });
    fireEvent.click(within(metricToggle).getByRole("radio", { name: "Revenue" }));
    expect(
      container.querySelector(
        'svg[aria-label="Daily new and returning customer revenue"]',
      ),
    ).toBeTruthy();
  });
});
