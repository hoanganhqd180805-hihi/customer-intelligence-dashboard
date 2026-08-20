export type MetricUnit = "count" | "amount" | "ratio";
export type MetricDirection = "up" | "down" | "flat" | null;
export type DataAvailability = "available" | "unavailable";

export interface MetricComparison {
  direction: MetricDirection;
  ratio: number | null;
}

export interface OverviewMetric {
  label: string;
  value: number;
  unit: MetricUnit;
  comparison: MetricComparison;
}

export interface OverviewMetrics {
  totalCustomers: OverviewMetric;
  totalOrders: OverviewMetric;
  revenue: OverviewMetric;
  averageOrderValue: OverviewMetric;
  repeatCustomerRate: OverviewMetric;
  cancellationRate: OverviewMetric;
}

export type CustomerType = "new" | "returning";
export interface CustomerTypeDailyPoint {
  date: string;
  newCustomers: number;
  returningCustomers: number;
}
export interface CustomerRevenueContribution {
  customerType: CustomerType;
  revenue: number | null;
  revenueShare: number;
}

export type Weekday = "Thứ Hai" | "Thứ Ba" | "Thứ Tư" | "Thứ Năm" | "Thứ Sáu" | "Thứ Bảy" | "Chủ Nhật";
export interface PurchaseTimeSlotTotal { weekday: Weekday; slot: string; totalOrders: number; revenue: number | null }
export interface WeekdayOrderTotal { weekday: Weekday; totalOrders: number }
export interface PurchaseTimeDataset {
  weekdays: Weekday[];
  timeSlots: string[];
  timeSlotTotals: PurchaseTimeSlotTotal[];
  weekdayTotals: WeekdayOrderTotal[];
  missingCombinationsMeanZero: boolean;
}
export interface CancellationReasonMetric { reason: string; cancelledOrders: number; orderShare: number; lostRevenue: number; lostRevenueShare: number }
export interface CancellationAnalysisDataset { reasons: CancellationReasonMetric[]; totalCancelledOrders: number; totalLostRevenue: number; comparison: MetricComparison }

export type ShoppingType = "Combo" | "Bán lẻ" | "Hỗn hợp";
export interface ShoppingCompositionMetric { type: ShoppingType; orderCount: number; orderShare: number; revenue: number; revenueShare: number }

export type ProductType = "retail" | "combo";
export interface ProductPerformanceRow { rank: number; productType: ProductType; itemId: string; itemName: string; totalQuantitySold: number; totalOrders: number; productSales: number }
export interface ProductPairItem { id: string; name: string }
export interface ProductPairRow { rank: number; item1: ProductPairItem; item2: ProductPairItem; ordersBoughtTogether: number }

export interface JourneyNode { id: string; stage: string; label: string; value: number; color: string; meta: string }
export interface JourneyLink { id: string; source: string; target: string; value: number; label: string }
export interface JourneyTransition { id: string; source: string; target: string; conversionRate: number; dropOffRate: number }
export interface JourneySummaryCard { value: string; label: string }
export interface JourneyDropOffCard { value: string; label: string; emphasized: boolean }
export interface JourneyInsight { eyebrow: string; headline: string; detail: string }

export type ChannelPerformanceStatus = "not_activated" | "active_no_result" | "low_efficiency" | "healthy";
export interface ChannelPerformance {
  id: string;
  channel: string;
  activity: number;
  productViews: number;
  conversionRate: number | null;
  benchmark: number | null;
  status: ChannelPerformanceStatus;
  activeContentCount?: number;
  totalContentCount?: number;
}
export interface ChannelPerformanceDataset {
  benchmark: number | null;
  channels: ChannelPerformance[];
  platformBenchmark: number | null;
  platforms: ChannelPerformance[];
  summary: { tracked: number; needsAttention: number; notActivated: number; healthy: number };
}

export interface CustomerSegmentMetric {
  id: string;
  segment: string;
  customerCount: number;
  customerShare: number;
  revenue: number;
  revenueShare: number;
  color: string;
}
export interface CustomerSegmentationDataset {
  segments: CustomerSegmentMetric[];
  totalCustomers: number;
  totalRevenue: number;
  insight: string;
}

export interface RecommendationEvidence { metric: string; value: string; relationship: string }
export interface RecommendationCardData { id: string; category: string; status: string; priority: number; severity: "high" | "medium" | "low"; signal: string; title: string; action: string; relationship: string; rationale: string; description: string; reason: string; evidence: RecommendationEvidence[] }

export interface CustomerTypesDataset {
  availability: DataAvailability;
  daily: CustomerTypeDailyPoint[];
  revenueContribution: CustomerRevenueContribution[];
}
export interface PurchaseCancellationDataset {
  timeSlots: string[];
  weekdays: Weekday[];
  timeSlotTotals: PurchaseTimeSlotTotal[];
  weekdayTotals: WeekdayOrderTotal[];
  cancellationReasons: CancellationReasonMetric[];
  cancellationLostRevenue: number;
  cancellationComparison: MetricComparison;
}
export interface ShoppingDataset {
  composition: ShoppingCompositionMetric[];
  products: ProductPerformanceRow[];
  productPairs: ProductPairRow[];
}
export interface JourneyDataset {
  stages: string[];
  nodes: JourneyNode[];
  links: JourneyLink[];
  transitions: JourneyTransition[];
  summaryCards: JourneySummaryCard[];
  dropOffCards: JourneyDropOffCard[];
  insights: JourneyInsight[];
}
export interface DashboardModel {
  overview: OverviewMetrics;
  customerTypes: CustomerTypesDataset;
  purchaseCancellation: PurchaseCancellationDataset;
  shopping: ShoppingDataset;
  journey: JourneyDataset;
  recommendations: RecommendationCardData[];
}

// Compatibility aliases for layout/traversal utilities while callers migrate.
export type JourneyNodeData = JourneyNode;
export type JourneyLinkData = JourneyLink;
export type RecommendationData = RecommendationCardData;
