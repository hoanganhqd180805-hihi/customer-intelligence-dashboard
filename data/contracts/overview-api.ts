/**
 * Required Overview API response contract. This is an integration requirement,
 * not a claim that a backend endpoint already implements it.
 */
export interface RawOverviewApiResponse {
  total_customers: number | null;
  total_orders: number | null;
  revenue: number | null;
  average_order_value: number | null;
  repeat_customer_rate: number | null;
  cancellation_rate: number | null;
  comparisons: {
    total_customers: number | null;
    total_orders: number | null;
    revenue: number | null;
    average_order_value: number | null;
    repeat_customer_rate: number | null;
    cancellation_rate: number | null;
  } | null;
}

export interface OverviewRequest {
  startDate: string;
  endDate: string;
  signal?: AbortSignal;
}
