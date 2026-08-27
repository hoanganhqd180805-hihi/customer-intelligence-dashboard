import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerSegmentationSection } from "@/components/dashboard/CustomerSegmentationSection";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("Customer Overview workbook product affinity", () => {
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

  it("shows date-specific workbook top products for New and Returning bars", () => {
    render(<CustomerSegmentationSection />);
    const dailyTarget = screen.getByRole("graphics-symbol", {
      name: /Jul 27: 28 new customers, 4 returning customers, 32 total/,
    });
    const chart = (dailyTarget as unknown as SVGGraphicsElement)
      .ownerSVGElement;
    vi.spyOn(chart!, "getBoundingClientRect").mockReturnValue({
      bottom: 280,
      height: 280,
      left: 0,
      right: 480,
      top: 0,
      width: 480,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.mouseMove(dailyTarget, { clientY: 100 });
    expect(screen.getByRole("tooltip").textContent).toContain(
      "Bánh Quy Bơ Mayora Danisa 200G",
    );

    fireEvent.mouseMove(dailyTarget, { clientY: 220 });
    expect(screen.getByRole("tooltip").textContent).toContain(
      "Bánh Quy Mayora Danisa Chocofello 150G",
    );
  });

  it("adds segment-specific definitions and top products to the daily segment hover detail", () => {
    render(<CustomerSegmentationSection />);

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Top Buyers" }));

    const tooltip = screen.getByRole("tooltip", {
      name: "Top Buyers segment details",
    });
    expect(tooltip.textContent).toContain(
      "Purchased recently, buy frequently, and spend highly.",
    );
    expect(tooltip.textContent).not.toContain("Top 3 products");

    fireEvent.mouseEnter(
      screen.getByRole("graphics-symbol", {
        name: "Jul 27, Big Spenders: 12 customers",
      }),
      { clientX: 200, clientY: 160 },
    );
    const dailyTooltip = screen.getByRole("tooltip", {
      name: "Big Spenders segment details",
    });
    expect(dailyTooltip.textContent).toContain(
      "Combo 2 Hủ Kẹo Cà Phê Sữa Mayora Kopiko 560G",
    );
    expect(dailyTooltip.textContent).toContain(
      "Bánh Quy Bơ Mayora Danisa 200G",
    );
  });
});
