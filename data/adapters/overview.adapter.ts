import type {
  MetricComparison,
  MetricDirection,
  OverviewMetrics,
} from "@/data/contracts/dashboard";
import type { RawOverviewApiResponse } from "@/data/contracts/overview-api";

const direction = (ratio: number): MetricDirection =>
  ratio > 0 ? "up" : ratio < 0 ? "down" : "flat";
const comparison = (ratio: number | null | undefined): MetricComparison =>
  ratio == null
    ? { direction: null, ratio: null }
    : { direction: direction(ratio), ratio };

export function adaptOverviewResponse(
  raw: RawOverviewApiResponse,
): OverviewMetrics | null {
  const values = [
    raw.total_customers,
    raw.total_orders,
    raw.revenue,
    raw.average_order_value,
    raw.repeat_customer_rate,
    raw.cancellation_rate,
  ];
  if (values.every((value) => value == null)) return null;
  if (values.some((value) => value == null))
    throw new Error("Overview response is incomplete");
  return {
    totalCustomers: {
      label: "Total Customers",
      value: raw.total_customers!,
      unit: "count",
      comparison: comparison(raw.comparisons?.total_customers),
    },
    totalOrders: {
      label: "Total Orders",
      value: raw.total_orders!,
      unit: "count",
      comparison: comparison(raw.comparisons?.total_orders),
    },
    revenue: {
      label: "Revenue",
      value: raw.revenue!,
      unit: "amount",
      comparison: comparison(raw.comparisons?.revenue),
    },
    averageOrderValue: {
      label: "AOV",
      value: raw.average_order_value!,
      unit: "amount",
      comparison: comparison(raw.comparisons?.average_order_value),
    },
    repeatCustomerRate: {
      label: "Repeat Customer Rate",
      value: raw.repeat_customer_rate!,
      unit: "ratio",
      comparison: comparison(raw.comparisons?.repeat_customer_rate),
    },
    cancellationRate: {
      label: "Cancellation Rate",
      value: raw.cancellation_rate!,
      unit: "ratio",
      comparison: comparison(raw.comparisons?.cancellation_rate),
    },
  };
}
