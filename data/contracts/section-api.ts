import type { CustomerType, Weekday } from "./dashboard";

export interface SectionRequest { startDate: string; endDate: string; signal?: AbortSignal }

export interface RawCustomerTypeResponse {
  daily: Array<{ date: string; new_customers: number; existing_customers: number }> | null;
  revenue_contribution: Array<{ customer_type: CustomerType; revenue: number | null; revenue_contribution: number }> | null;
  percentage_format: "ratio" | "percent";
}

export interface RawPurchaseTimeResponse {
  time_slots: string[];
  weekdays: Weekday[];
  time_slot_totals: Array<{ weekday: Weekday; time_slot: string; total_orders: number; total_revenue: number | null }> | null;
  weekday_totals: Array<{ weekday: Weekday; total_orders: number }> | null;
  omitted_combination_means_zero: boolean;
}

export interface RawCancellationWorkbookResponse {
  reasons: Array<{ reason: string; cancelled_orders: number; lost_revenue: number }>;
  total_lost_revenue: number;
}
