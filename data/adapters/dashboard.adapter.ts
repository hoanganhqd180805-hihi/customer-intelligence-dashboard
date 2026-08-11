import type { DashboardModel, JourneyLink, MetricComparison } from "@/data/contracts/dashboard";
import type { RawDashboardResponse } from "@/data/contracts/raw-dashboard";

const unavailableComparison: MetricComparison = { direction: null, ratio: null };
const toRatio = (percentagePoints: number) => percentagePoints / 100;

function transitionFromLink(link: JourneyLink) {
  const conversionRate = toRatio(Number.parseFloat(link.label));
  return { id: link.id, source: link.source, target: link.target, conversionRate, dropOffRate: 1 - conversionRate };
}

export function adaptDashboardResponse(raw: RawDashboardResponse): DashboardModel {
  const links: JourneyLink[] = raw.journey.links.map((row) => ({ ...row }));
  const transitions = links.map(transitionFromLink);
  const transition = (id: string) => transitions.find((item) => item.id === id)!;
  return {
    overview: {
      totalCustomers: { label: "Tổng số khách hàng", value: raw.overview.total_customers, unit: "count", comparison: unavailableComparison },
      totalOrders: { label: "Tổng đơn hàng", value: raw.overview.total_orders, unit: "count", comparison: unavailableComparison },
      revenue: { label: "Doanh thu", value: raw.overview.revenue, unit: "amount", comparison: unavailableComparison },
      averageOrderValue: { label: "AOV", value: raw.overview.average_order_value, unit: "amount", comparison: unavailableComparison },
      repeatCustomerRate: { label: "Tỷ lệ quay lại", value: toRatio(raw.overview.repeat_customer_rate_pct), unit: "ratio", comparison: unavailableComparison },
      cancellationRate: { label: "Tỷ lệ huỷ", value: toRatio(raw.overview.cancellation_rate_pct), unit: "ratio", comparison: unavailableComparison },
    },
    customerTypes: {
      availability: raw.customer_types.available ? "available" : "unavailable",
      daily: raw.customer_types.daily.map((row) => ({ date: row.date, newCustomers: row.new_customers, returningCustomers: row.returning_customers })),
      revenueContribution: raw.customer_types.revenue_contribution.map((row) => ({ customerType: row.customer_type, revenue: row.revenue, revenueShare: toRatio(row.revenue_share_pct) })),
    },
    purchaseCancellation: {
      timeSlots: [...raw.purchase_cancellation.time_slots], weekdays: [...raw.purchase_cancellation.weekdays],
      timeSlotTotals: raw.purchase_cancellation.time_slot_totals.map((row) => ({ weekday: row.weekday, slot: row.slot, totalOrders: row.total_orders })),
      weekdayTotals: raw.purchase_cancellation.weekday_totals.map((row) => ({ weekday: row.weekday, totalOrders: row.total_orders })),
      cancellationReasons: raw.purchase_cancellation.cancellation_reasons.map((row) => ({ reason: row.reason, cancelledOrders: row.cancelled_orders ?? 0, orderShare: toRatio(row.share_pct), lostRevenue: row.lost_revenue ?? 0, lostRevenueShare: 0 })),
      cancellationLostRevenue: raw.purchase_cancellation.cancellation_lost_revenue,
      cancellationComparison: unavailableComparison,
    },
    shopping: {
      composition: raw.shopping.composition.map((row) => ({ type: row.type, orderCount: row.order_count, orderShare: toRatio(row.order_share_pct), revenue: row.revenue, revenueShare: toRatio(row.revenue_share_pct) })),
      products: raw.shopping.products.map((row) => ({ rank: row.rank, productType: row.product_type, itemId: row.item_id, itemName: row.item_name, totalQuantitySold: row.total_quantity_sold, totalOrders: row.total_orders, productSales: row.product_sales })),
      productPairs: raw.shopping.product_pairs.map((row) => ({ rank: row.rank, item1: { id: row.item_1_id, name: row.item_1_name }, item2: { id: row.item_2_id, name: row.item_2_name }, ordersBoughtTogether: row.orders_bought_together })),
    },
    journey: {
      stages: [...raw.journey.stages], nodes: raw.journey.nodes.map((row) => ({ id: row.id, stage: row.stage, label: row.label, value: row.value, color: row.color, meta: row.metadata })), links, transitions,
      summaryCards: [
        { value: "2.0%", label: "Ads → Product View" }, { value: "33.8%", label: "Product View → Order" },
        { value: "83.3%", label: "Order → Complete" }, { value: "19.4%", label: "Complete → Good Review" },
      ],
      dropOffCards: ["ads-productview", "productview-order", "order-complete"].map((id, index) => ({ value: `↓${(transition(id).dropOffRate * 100).toFixed(1)}%`, label: `${raw.journey.nodes.find((node) => node.id === transition(id).source)!.label} → ${raw.journey.nodes.find((node) => node.id === transition(id).target)!.label}`, emphasized: index === 0 })),
      insights: [
        { eyebrow: "BIGGEST DROP-OFF", headline: "Ads → Product View · 98.0%", detail: "93,760 ad impressions generated 1,880 product views, equivalent to a 2.0% conversion rate." },
        { eyebrow: "ORDER QUALITY", headline: "530 / 636 completed orders", detail: "The completion rate reached 83.3%, while cancelled orders accounted for 16.7% of total orders." },
        { eyebrow: "POST-PURCHASE SIGNAL", headline: "103 Good Review · 35 Buy Again", detail: "Good Reviews represented 19.4% and Buy Again represented 6.6% of completed orders." },
      ],
    },
    recommendations: raw.recommendations.map((row) => ({ ...row, evidence: row.evidence.map((evidence) => ({ ...evidence })) })),
  };
}
