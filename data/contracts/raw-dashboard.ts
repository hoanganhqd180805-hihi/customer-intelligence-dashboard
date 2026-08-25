import type {
  CustomerType,
  ProductType,
  ShoppingType,
  Weekday,
} from "./dashboard";

export interface RawOverviewResponse {
  total_customers: number;
  total_orders: number;
  revenue: number;
  average_order_value: number;
  repeat_customer_rate_pct: number;
  cancellation_rate_pct: number;
}
export interface RawCustomerTypeDailyRow {
  date: string;
  new_customers: number;
  returning_customers: number;
}
export interface RawCustomerRevenueRow {
  customer_type: CustomerType;
  revenue: number | null;
  revenue_share_pct: number;
}
export interface RawPurchaseSlotRow {
  weekday: Weekday;
  slot: string;
  total_orders: number;
  total_revenue: number | null;
}
export interface RawWeekdayOrderRow {
  weekday: Weekday;
  total_orders: number;
}
export interface RawCancellationReasonRow {
  reason: string;
  cancelled_orders: number | null;
  share_pct: number;
  lost_revenue: number | null;
}
export interface RawShoppingCompositionRow {
  type: ShoppingType;
  order_count: number;
  order_share_pct: number;
  revenue: number;
  revenue_share_pct: number;
}
export interface RawProductRow {
  rank: number;
  product_type: ProductType;
  item_id: string;
  item_name: string;
  total_quantity_sold: number;
  total_orders: number;
  product_sales: number;
}
export interface RawProductPairRow {
  rank: number;
  item_1_id: string;
  item_1_name: string;
  item_2_id: string;
  item_2_name: string;
  orders_bought_together: number;
}
export interface RawJourneyNodeRow {
  id: string;
  stage: string;
  label: string;
  value: number;
  color: string;
  metadata: string;
}
export interface RawJourneyLinkRow {
  id: string;
  source: string;
  target: string;
  value: number;
  label: string;
  rate?: number | null;
  rateLabel?: string | null;
  metric?: "contribution_share" | "distribution_share" | "conversion_rate";
  sourceStep?: number;
  targetStep?: number;
  sourceGroup?: string | null;
  dataType?: string | null;
}
export interface RawRecommendationRow {
  id: string;
  category: string;
  status: string;
  priority: number;
  severity: "high" | "medium" | "low";
  signal: string;
  title: string;
  action: string;
  relationship: string;
  rationale: string;
  description: string;
  reason: string;
  evidence: { metric: string; value: string; relationship: string }[];
}

export interface RawDashboardResponse {
  overview: RawOverviewResponse;
  customer_types: {
    available: boolean;
    daily: RawCustomerTypeDailyRow[];
    revenue_contribution: RawCustomerRevenueRow[];
  };
  purchase_cancellation: {
    time_slots: string[];
    weekdays: Weekday[];
    time_slot_totals: RawPurchaseSlotRow[];
    weekday_totals: RawWeekdayOrderRow[];
    cancellation_reasons: RawCancellationReasonRow[];
    cancellation_lost_revenue: number;
  };
  shopping: {
    composition: RawShoppingCompositionRow[];
    products: RawProductRow[];
    product_pairs: RawProductPairRow[];
  };
  journey: {
    stages: string[];
    nodes: RawJourneyNodeRow[];
    links: RawJourneyLinkRow[];
  };
  recommendations: RawRecommendationRow[];
}
