import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCustomerTypeResponse } from "@/data/adapters/customer-type.adapter";
import { adaptPurchaseTimeResponse } from "@/data/adapters/purchase-time.adapter";
import { fetchDashboardSection } from "@/data/services/api-transport";
import { rawCustomerTypeWorkbookFixture } from "@/data/fixtures/customer-type-workbook.fixture";
import { adaptCancellationWorkbookData } from "@/data/adapters/cancellation.adapter";
import { rawCancellationWorkbookFixture, rawPurchaseTimeWorkbookFixture } from "@/data/fixtures/section02-workbook.fixture";

afterEach(() => vi.unstubAllGlobals());

describe("Customer Type adapter", () => {
  it("maps the workbook extraction without dropping zero-value dates", () => {
    const result = adaptCustomerTypeResponse(rawCustomerTypeWorkbookFixture)!;
    expect(result.daily).toHaveLength(17);
    expect(result.daily.reduce((sum, point) => sum + point.newCustomers, 0)).toBe(267);
    expect(result.daily.reduce((sum, point) => sum + point.returningCustomers, 0)).toBe(97);
    expect(result.revenueContribution.map((item) => item.revenueShare)).toEqual([0.6911,0.3089]);
    expect(result.revenueContribution.every((item) => item.revenue === null)).toBe(true);
  });
  it("sorts dates, preserves explicit zeroes, and normalizes percent values", () => {
    const result = adaptCustomerTypeResponse({
      daily: [{ date:"2026-05-02",new_customers:0,existing_customers:3 },{ date:"2026-05-01",new_customers:4,existing_customers:0 }],
      revenue_contribution: [{ customer_type:"new",revenue:800,revenue_contribution:80 },{ customer_type:"returning",revenue:200,revenue_contribution:20 }],
      percentage_format:"percent",
    });
    expect(result?.daily.map((point) => point.date)).toEqual(["2026-05-01","2026-05-02"]);
    expect(result?.daily[1].newCustomers).toBe(0);
    expect(result?.revenueContribution[0].revenueShare).toBe(0.8);
  });
});

describe("date-range transport", () => {
  it("sends the selected start and end date as request parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok:true, json:async () => ({ rows:[] }) });
    vi.stubGlobal("fetch", fetchMock);
    await fetchDashboardSection("/api/customer-types", "Customer Type", { startDate:"2026-05-03",endDate:"2026-05-09" });
    expect(String(fetchMock.mock.calls[0][0])).toContain("startDate=2026-05-03");
    expect(String(fetchMock.mock.calls[0][0])).toContain("endDate=2026-05-09");
  });
});

describe("Purchase Time adapter", () => {
  const base = { time_slots:["00–06","06–09"],weekdays:["Thứ Hai","Thứ Ba"] as const,weekday_totals:[{weekday:"Thứ Ba" as const,total_orders:2},{weekday:"Thứ Hai" as const,total_orders:1}] };
  it("keeps missing cells absent when omission is not confirmed as zero", () => {
    const result = adaptPurchaseTimeResponse({ ...base, weekdays:[...base.weekdays],time_slot_totals:[{weekday:"Thứ Hai",time_slot:"00–06",total_orders:0}],omitted_combination_means_zero:false });
    expect(result?.timeSlotTotals).toHaveLength(1);
    expect(result?.timeSlotTotals[0].totalOrders).toBe(0);
    expect(result?.weekdayTotals.map((row) => row.weekday)).toEqual(["Thứ Hai","Thứ Ba"]);
  });
  it("completes the grid only when omission is confirmed as zero", () => {
    const result = adaptPurchaseTimeResponse({ ...base, weekdays:[...base.weekdays],time_slot_totals:[{weekday:"Thứ Hai",time_slot:"00–06",total_orders:1}],omitted_combination_means_zero:true });
    expect(result?.timeSlotTotals).toHaveLength(4);
    expect(result?.timeSlotTotals.find((row) => row.weekday === "Thứ Ba" && row.slot === "06–09")?.totalOrders).toBe(0);
  });
});

describe("latest Section 02 workbook extraction",()=>{
  it("keeps the approved time slots and reconciled weekday totals",()=>{
    const result=adaptPurchaseTimeResponse(rawPurchaseTimeWorkbookFixture)!;
    expect(result.timeSlots).toEqual(["00:00 - 05:59","06:00 - 08:59","09:00 - 11:59","12:00 - 14:59","15:00 - 17:59","18:00 - 23:59"]);
    expect(result.timeSlotTotals).toHaveLength(42);
    expect(result.weekdayTotals.map((row)=>row.totalOrders)).toEqual([68,89,87,64,80,65,77]);
  });
  it("reconciles cancellation counts and lost revenue",()=>{
    const result=adaptCancellationWorkbookData(rawCancellationWorkbookFixture);
    expect(result.totalCancelledOrders).toBe(106);
    expect(result.totalLostRevenue).toBe(13_275_204);
    expect(result.reasons.reduce((sum,row)=>sum+row.cancelledOrders,0)).toBe(106);
    expect(result.reasons.reduce((sum,row)=>sum+row.lostRevenue,0)).toBe(13_275_204);
    expect(result.reasons.reduce((sum,row)=>sum+row.orderShare,0)).toBeCloseTo(1);
    expect(result.reasons.reduce((sum,row)=>sum+row.lostRevenueShare,0)).toBeCloseTo(1);
  });
});
