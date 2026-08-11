import type { OverviewMetrics } from "@/data/contracts/dashboard";

const unavailableComparison = {
  direction: null,
  ratio: null,
} as const;

/**
 * Exact local extraction from `mapping data.xlsx`, Customer journey!A3:F4.
 * Comparison-period values are intentionally null because the source does not
 * provide a supported comparison dataset.
 */
export const overviewMockData: OverviewMetrics = {
  totalCustomers: {
    label: "Tổng số khách hàng",
    value: 488,
    unit: "count",
    comparison: unavailableComparison,
  },
  totalOrders: {
    label: "Tổng đơn hàng",
    value: 530,
    unit: "count",
    comparison: unavailableComparison,
  },
  revenue: {
    label: "Doanh thu",
    value: 57_671_416,
    unit: "amount",
    comparison: unavailableComparison,
  },
  averageOrderValue: {
    label: "AOV",
    value: 108_813.99,
    unit: "amount",
    comparison: unavailableComparison,
  },
  repeatCustomerRate: {
    label: "Tỷ lệ quay lại",
    value: 0.7738,
    unit: "ratio",
    comparison: unavailableComparison,
  },
  cancellationRate: {
    label: "Tỷ lệ huỷ",
    value: 0.1667,
    unit: "ratio",
    comparison: unavailableComparison,
  },
};
