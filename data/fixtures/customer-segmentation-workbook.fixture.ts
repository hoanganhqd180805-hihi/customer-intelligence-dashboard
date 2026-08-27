import {
  adaptAverageRepurchaseDays,
  adaptCustomerSegmentation,
  adaptCustomerSegmentationDailyProducts,
  adaptNewReturningCustomers,
  type RawAverageRepurchaseDaysRow,
  type RawCustomerSegmentRow,
  type RawCustomerSegmentationTotals,
} from "@/data/adapters/customer-segmentation.adapter";
import {
  latestCustomerSegmentationDailyWorkbookRows,
  latestNewReturningWorkbookRows,
} from "@/data/fixtures/customer-overview-latest-workbook.fixture";

/** Exact rows from `mapping data.xlsx`, `Customer journey!B320:J327`. */
export const rawNewReturningWorkbookRows = latestNewReturningWorkbookRows;

export const newReturningCustomersDataset = adaptNewReturningCustomers(
  rawNewReturningWorkbookRows,
);

/** Current RFM segmentation snapshot supplied for Customer Segmentation. */
export const rawCustomerSegmentationWorkbookRows: RawCustomerSegmentRow[] = [
  {
    segment: "VIP",
    condition: "R ≥ 4, F ≥ 4, M ≥ 4",
    customerCount: 35,
    customerSharePercent: 9.94,
    totalOrders: 111,
    revenue: 17_718_184,
    revenueSharePercent: 24.28,
    averageRecencyDays: 4.69,
    averageFrequency: 3.17,
    averageRevenuePerCustomer: 506_233.83,
  },
  {
    segment: "High Value",
    condition: "R ≥ 3, F ≥ 2, M ≥ 4; excluding VIP",
    customerCount: 38,
    customerSharePercent: 10.8,
    totalOrders: 65,
    revenue: 11_723_010,
    revenueSharePercent: 16.06,
    averageRecencyDays: 6.95,
    averageFrequency: 1.71,
    averageRevenuePerCustomer: 308_500.26,
  },
  {
    segment: "Potential",
    condition: "R ≥ 4; excluding VIP and High Value",
    customerCount: 92,
    customerSharePercent: 26.14,
    totalOrders: 105,
    revenue: 6_600_447,
    revenueSharePercent: 9.04,
    averageRecencyDays: 5.12,
    averageFrequency: 1.14,
    averageRevenuePerCustomer: 71_743.99,
  },
  {
    segment: "Low Value",
    condition: "All remaining customers",
    customerCount: 187,
    customerSharePercent: 53.13,
    totalOrders: 311,
    revenue: 36_943_494,
    revenueSharePercent: 50.62,
    averageRecencyDays: 11.23,
    averageFrequency: 1.66,
    averageRevenuePerCustomer: 197_558.79,
  },
];

/** Totals reconciled from the supplied RFM snapshot. */
export const rawCustomerSegmentationWorkbookTotals: RawCustomerSegmentationTotals =
  {
    totalCustomers: 352,
    customerSharePercent: 100,
    totalRevenue: 72_985_135,
    revenueSharePercent: 100,
  };

export const customerSegmentationDataset = adaptCustomerSegmentation(
  rawCustomerSegmentationWorkbookRows,
  rawCustomerSegmentationWorkbookTotals,
);

/** Exact rows from `mapping data.xlsx`, `Customer journey!B331:F359`. */
export const rawCustomerSegmentationDailyWorkbookRows =
  latestCustomerSegmentationDailyWorkbookRows;

export const customerSegmentationDailyDataset =
  adaptCustomerSegmentationDailyProducts(
    rawCustomerSegmentationDailyWorkbookRows,
  );

/** Exact extracted values from `mapping data.xlsx`, `Customer journey!B239:C255`. */
export const rawAverageRepurchaseDaysWorkbookRows: RawAverageRepurchaseDaysRow[] =
  [
    { date: "2026-05-01", averageRepurchaseDays: 38.38 },
    { date: "2026-05-02", averageRepurchaseDays: 38.37 },
    { date: "2026-05-03", averageRepurchaseDays: 38.36 },
    { date: "2026-05-04", averageRepurchaseDays: 38.61 },
    { date: "2026-05-05", averageRepurchaseDays: 38.73 },
    { date: "2026-05-06", averageRepurchaseDays: 38.76 },
    { date: "2026-05-07", averageRepurchaseDays: 38.94 },
    { date: "2026-05-08", averageRepurchaseDays: 39.02 },
    { date: "2026-05-09", averageRepurchaseDays: 39.27 },
    { date: "2026-05-10", averageRepurchaseDays: 39.47 },
    { date: "2026-05-11", averageRepurchaseDays: 39.64 },
    { date: "2026-05-12", averageRepurchaseDays: 39.67 },
    { date: "2026-05-13", averageRepurchaseDays: 39.84 },
    { date: "2026-05-14", averageRepurchaseDays: 39.9 },
    { date: "2026-05-15", averageRepurchaseDays: 39.95 },
    { date: "2026-05-16", averageRepurchaseDays: 40.13 },
    { date: "2026-05-17", averageRepurchaseDays: 40.1 },
  ];

export const averageRepurchaseDaysDataset = adaptAverageRepurchaseDays(
  rawAverageRepurchaseDaysWorkbookRows,
);
