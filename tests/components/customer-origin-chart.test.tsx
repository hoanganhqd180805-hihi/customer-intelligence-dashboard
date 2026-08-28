import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CustomerOriginMapCard } from "@/components/dashboard/CustomerOriginMapCard";

describe("Customer Origin top-province chart", () => {
  afterEach(cleanup);

  it("renders exactly ten provinces in descending customer order", () => {
    const { container } = render(<CustomerOriginMapCard />);
    const rows = container.querySelectorAll('[role="graphics-symbol"]');

    expect(rows).toHaveLength(10);
    expect(rows[0]?.getAttribute("aria-label")).toBe(
      "1. TP. Hồ Chí Minh: 60 customers",
    );
    expect(rows[9]?.getAttribute("aria-label")).toBe(
      "10. Lâm Đồng: 10 customers",
    );
  });

  it("keeps the tooltip open and reveals province products on disclosure", () => {
    render(<CustomerOriginMapCard />);
    const hoChiMinhCity = screen.getByRole("graphics-symbol", {
      name: "1. TP. Hồ Chí Minh: 60 customers",
    });

    fireEvent.mouseEnter(hoChiMinhCity, { clientX: 120, clientY: 160 });

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toContain("TP. Hồ Chí Minh");
    expect(tooltip.textContent).not.toContain("Kopiko Coffee Candy");
    const disclosure = screen.getByRole("button", {
      name: "Show top 3 products",
    });

    fireEvent.mouseLeave(hoChiMinhCity, { relatedTarget: disclosure });
    expect(screen.getByRole("tooltip")).toBeTruthy();
    fireEvent.click(disclosure);

    expect(tooltip.textContent).toContain("Kopiko Coffee Candy");
    expect(tooltip.textContent).toContain("Coffee Joy Biscuits");
    expect(tooltip.textContent).toContain("Beng-Beng Wafer");
    expect(tooltip.textContent).not.toContain("Mock");
  });

  it("switches the ranked bars from customers to revenue", () => {
    render(<CustomerOriginMapCard />);
    const control = screen.getByRole("radiogroup", {
      name: "Customer origin metric",
    });

    fireEvent.click(within(control).getByRole("radio", { name: "Revenue" }));

    expect(
      screen.getByRole("img", { name: "Top 10 provinces by revenue" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("graphics-symbol", {
        name: "1. TP. Hồ Chí Minh: 15.6M ₫ revenue",
      }),
    ).toBeTruthy();
  });
});
