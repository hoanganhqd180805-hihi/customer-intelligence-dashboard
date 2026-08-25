import { describe, expect, it } from "vitest";
import {
  adaptAverageRepurchaseDays,
  adaptCustomerSegmentation,
  adaptNewReturningCustomers,
  filterAverageRepurchaseDays,
  filterNewReturningCustomers,
  getDailySamplingDates,
} from "@/data/adapters/customer-segmentation.adapter";
import {
  averageRepurchaseDaysDataset,
  customerSegmentationDataset,
  newReturningCustomersDataset,
  rawAverageRepurchaseDaysWorkbookRows,
  rawCustomerSegmentationWorkbookRows,
  rawCustomerSegmentationWorkbookTotals,
  rawNewReturningWorkbookRows,
} from "@/data/fixtures/customer-segmentation-workbook.fixture";

describe("new and returning customer workbook fixture", () => {
  it("preserves chronological daily workbook values and explicit zeroes", () => {
    expect(newReturningCustomersDataset.points).toHaveLength(17);
    expect(newReturningCustomersDataset.points[0]).toEqual({
      date: "2026-05-01",
      newCustomers: 0,
      returningCustomers: 0,
    });
    expect(newReturningCustomersDataset.points[8]).toEqual({
      date: "2026-05-09",
      newCustomers: 25,
      returningCustomers: 12,
    });
    expect(newReturningCustomersDataset.points[16]).toEqual({
      date: "2026-05-17",
      newCustomers: 0,
      returningCustomers: 0,
    });
  });

  it("preserves missing values as null and rejects duplicate dates", () => {
    expect(
      adaptNewReturningCustomers([
        {
          date: "2026-05-01",
          newCustomers: null,
          returningCustomers: null,
        },
      ]).points[0],
    ).toMatchObject({ newCustomers: null, returningCustomers: null });
    expect(() =>
      adaptNewReturningCustomers([
        ...rawNewReturningWorkbookRows,
        rawNewReturningWorkbookRows[0],
      ]),
    ).toThrow(/Duplicate new\/returning customer row/);
  });

  it("renders actual daily values on the shared responsive sampling dates", () => {
    const sampledCustomers = filterNewReturningCustomers(
      newReturningCustomersDataset,
      "2026-05-01",
      "2026-05-17",
    );
    const sampledRepurchase = filterAverageRepurchaseDays(
      averageRepurchaseDaysDataset,
      "2026-05-01",
      "2026-05-17",
    );

    expect(sampledCustomers.points.map((point) => point.date)).toEqual([
      "2026-05-01",
      "2026-05-03",
      "2026-05-05",
      "2026-05-07",
      "2026-05-09",
      "2026-05-11",
      "2026-05-13",
      "2026-05-15",
      "2026-05-17",
    ]);
    expect(sampledRepurchase.points.map((point) => point.date)).toEqual(
      sampledCustomers.points.map((point) => point.date),
    );
    expect(sampledCustomers.points[1]).toMatchObject({
      newCustomers: 15,
      returningCustomers: 3,
    });
    expect(sampledRepurchase.points[1].averageRepurchaseDays).toBe(38.36);
  });
});

describe("daily point density", () => {
  it.each([
    ["2026-05-01", "2026-05-07", 7],
    ["2026-05-01", "2026-05-14", 14],
    ["2026-05-01", "2026-05-15", 8],
    ["2026-05-01", "2026-05-20", 11],
    ["2026-05-01", "2026-05-21", 8],
    ["2026-05-01", "2026-05-30", 11],
    ["2026-05-01", "2026-06-14", 12],
  ])(
    "samples %s through %s into %i rendered dates",
    (startDate, endDate, expectedCount) => {
      const dates = getDailySamplingDates(startDate, endDate);
      expect(dates).toHaveLength(expectedCount);
      expect(dates[0]).toBe(startDate);
      expect(dates.at(-1)).toBe(endDate);
    },
  );

  it.each([7, 14, 17, 20, 30])(
    "uses one ordered set of complete rows and preserves the final row for a %i-day range",
    (dayCount) => {
      const rows = Array.from({ length: 30 }, (_, index) => {
        const day = index + 1;
        return {
          date: `2026-05-${String(day).padStart(2, "0")}`,
          newCustomers: day === dayCount ? 0 : day,
          returningCustomers: day === dayCount ? 0 : day * 2,
        };
      });
      const finalDate = `2026-05-${String(dayCount).padStart(2, "0")}`;
      const sampled = filterNewReturningCustomers(
        adaptNewReturningCustomers(rows),
        "2026-05-01",
        finalDate,
      );

      expect(sampled.points[0]?.date).toBe("2026-05-01");
      expect(sampled.points.at(-1)).toEqual({
        date: finalDate,
        newCustomers: 0,
        returningCustomers: 0,
      });
      expect(sampled.points.map(({ date }) => date)).toEqual(
        getDailySamplingDates("2026-05-01", finalDate),
      );
    },
  );
});

describe("customer segmentation workbook fixture", () => {
  it("maps only the four RFM segments in fixed business order", () => {
    expect(
      customerSegmentationDataset.segments.map((row) => row.segment),
    ).toEqual(["VIP", "High Value", "Potential", "Low Value"]);
    expect(customerSegmentationDataset.totalCustomers).toBe(352);
    expect(customerSegmentationDataset.totalOrders).toBe(592);
    expect(customerSegmentationDataset.totalRevenue).toBe(72_985_135);
  });

  it("preserves workbook-provided customer and revenue contributions", () => {
    expect(
      customerSegmentationDataset.segments.reduce(
        (sum, row) => sum + row.customerShare,
        0,
      ),
    ).toBeCloseTo(1, 3);
    expect(
      customerSegmentationDataset.segments.reduce(
        (sum, row) => sum + row.revenueShare,
        0,
      ),
    ).toBeCloseTo(1, 4);
    const vip = customerSegmentationDataset.segments.find(
      (row) => row.id === "vip",
    );
    expect(vip).toMatchObject({
      condition: "R ≥ 4, F ≥ 4, M ≥ 4",
      customerCount: 35,
      totalOrders: 111,
      revenue: 17_718_184,
      averageRecencyDays: 4.69,
      averageFrequency: 3.17,
      averageRevenuePerCustomer: 506_233.83,
    });
    expect(vip?.customerShare).toBeCloseTo(0.0994, 6);
    expect(vip?.revenueShare).toBeCloseTo(0.2428, 6);
  });

  it("reconciles row values against the workbook total row", () => {
    expect(() =>
      adaptCustomerSegmentation(rawCustomerSegmentationWorkbookRows, {
        ...rawCustomerSegmentationWorkbookTotals,
        totalCustomers: 999,
      }),
    ).toThrow(/do not reconcile with workbook totals/);
  });

  it("does not silently discard or duplicate source segments", () => {
    expect(() =>
      adaptCustomerSegmentation([
        ...rawCustomerSegmentationWorkbookRows,
        rawCustomerSegmentationWorkbookRows[0],
      ]),
    ).toThrow(/Duplicate customer segment/);
    expect(() =>
      adaptCustomerSegmentation([
        {
          segment: "Chưa được ánh xạ",
          condition: "n/a",
          customerCount: 1,
          customerSharePercent: 100,
          totalOrders: 1,
          revenue: 1,
          revenueSharePercent: 100,
          averageRecencyDays: 1,
          averageFrequency: 1,
          averageRevenuePerCustomer: 1,
        },
      ]),
    ).toThrow(/Unsupported customer segment/);
  });
});

describe("average repurchase days workbook fixture", () => {
  it("preserves the DATE-level first, middle, and last workbook values", () => {
    expect(averageRepurchaseDaysDataset.points).toHaveLength(17);
    expect(averageRepurchaseDaysDataset.points[0]).toEqual({
      date: "2026-05-01",
      averageRepurchaseDays: 38.38,
    });
    expect(averageRepurchaseDaysDataset.points[8]).toEqual({
      date: "2026-05-09",
      averageRepurchaseDays: 39.27,
    });
    expect(averageRepurchaseDaysDataset.points[16]).toEqual({
      date: "2026-05-17",
      averageRepurchaseDays: 40.1,
    });
  });

  it("preserves missing days as null and rejects duplicate dates", () => {
    expect(
      adaptAverageRepurchaseDays([
        { date: "2026-05-01", averageRepurchaseDays: null },
      ]).points[0].averageRepurchaseDays,
    ).toBeNull();
    expect(() =>
      adaptAverageRepurchaseDays([
        ...rawAverageRepurchaseDaysWorkbookRows,
        rawAverageRepurchaseDaysWorkbookRows[0],
      ]),
    ).toThrow(/Duplicate average-repurchase row/);
  });
});
