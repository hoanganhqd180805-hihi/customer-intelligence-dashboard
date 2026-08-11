import { describe, expect, it } from "vitest";
import { adaptOverviewResponse } from "@/data/adapters/overview.adapter";
import { rawOverviewApiFixture } from "@/data/fixtures/overview-api.fixture";

describe("adaptOverviewResponse", () => {
  it("adapts a successful raw response into OverviewMetrics", () => {
    const result = adaptOverviewResponse(rawOverviewApiFixture);
    expect(result?.totalCustomers.value).toBe(488);
    expect(result?.cancellationRate.value).toBe(0.1667);
  });

  it("returns unavailable for a fully empty response", () => {
    const result = adaptOverviewResponse({ total_customers:null,total_orders:null,revenue:null,average_order_value:null,repeat_customer_rate:null,cancellation_rate:null,comparisons:null });
    expect(result).toBeNull();
  });

  it("rejects a partially populated response", () => {
    expect(() => adaptOverviewResponse({ ...rawOverviewApiFixture, revenue:null })).toThrow("incomplete");
  });
});
