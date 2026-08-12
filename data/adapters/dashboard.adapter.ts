import type {
  DashboardModel,
  JourneyLink,
  MetricComparison,
} from "@/data/contracts/dashboard";
import type { RawDashboardResponse } from "@/data/contracts/raw-dashboard";

const unavailableComparison: MetricComparison = {
  direction: null,
  ratio: null,
};
const toRatio = (percentagePoints: number) => percentagePoints / 100;

function transitionFromLink(link: JourneyLink) {
  const conversionRate = toRatio(Number.parseFloat(link.label));
  return {
    id: link.id,
    source: link.source,
    target: link.target,
    conversionRate,
    dropOffRate: 1 - conversionRate,
  };
}

export function adaptDashboardResponse(
  raw: RawDashboardResponse,
): DashboardModel {
  const links: JourneyLink[] = raw.journey.links.map((row) => ({ ...row }));
  const transitions = links.map(transitionFromLink);
  const transition = (id: string) =>
    transitions.find((item) => item.id === id)!;
  const node = (id: string) =>
    raw.journey.nodes.find((item) => item.id === id)!;
  const percentage = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;
  return {
    overview: {
      totalCustomers: {
        label: "Total Customers",
        value: raw.overview.total_customers,
        unit: "count",
        comparison: unavailableComparison,
      },
      totalOrders: {
        label: "Total Orders",
        value: raw.overview.total_orders,
        unit: "count",
        comparison: unavailableComparison,
      },
      revenue: {
        label: "Revenue",
        value: raw.overview.revenue,
        unit: "amount",
        comparison: unavailableComparison,
      },
      averageOrderValue: {
        label: "AOV",
        value: raw.overview.average_order_value,
        unit: "amount",
        comparison: unavailableComparison,
      },
      repeatCustomerRate: {
        label: "Repeat Customer Rate",
        value: toRatio(raw.overview.repeat_customer_rate_pct),
        unit: "ratio",
        comparison: unavailableComparison,
      },
      cancellationRate: {
        label: "Cancellation Rate",
        value: toRatio(raw.overview.cancellation_rate_pct),
        unit: "ratio",
        comparison: unavailableComparison,
      },
    },
    customerTypes: {
      availability: raw.customer_types.available ? "available" : "unavailable",
      daily: raw.customer_types.daily.map((row) => ({
        date: row.date,
        newCustomers: row.new_customers,
        returningCustomers: row.returning_customers,
      })),
      revenueContribution: raw.customer_types.revenue_contribution.map(
        (row) => ({
          customerType: row.customer_type,
          revenue: row.revenue,
          revenueShare: toRatio(row.revenue_share_pct),
        }),
      ),
    },
    purchaseCancellation: {
      timeSlots: [...raw.purchase_cancellation.time_slots],
      weekdays: [...raw.purchase_cancellation.weekdays],
      timeSlotTotals: raw.purchase_cancellation.time_slot_totals.map((row) => ({
        weekday: row.weekday,
        slot: row.slot,
        totalOrders: row.total_orders,
      })),
      weekdayTotals: raw.purchase_cancellation.weekday_totals.map((row) => ({
        weekday: row.weekday,
        totalOrders: row.total_orders,
      })),
      cancellationReasons: raw.purchase_cancellation.cancellation_reasons.map(
        (row) => ({
          reason: row.reason,
          cancelledOrders: row.cancelled_orders ?? 0,
          orderShare: toRatio(row.share_pct),
          lostRevenue: row.lost_revenue ?? 0,
          lostRevenueShare: 0,
        }),
      ),
      cancellationLostRevenue:
        raw.purchase_cancellation.cancellation_lost_revenue,
      cancellationComparison: unavailableComparison,
    },
    shopping: {
      composition: raw.shopping.composition.map((row) => ({
        type: row.type,
        orderCount: row.order_count,
        orderShare: toRatio(row.order_share_pct),
        revenue: row.revenue,
        revenueShare: toRatio(row.revenue_share_pct),
      })),
      products: raw.shopping.products.map((row) => ({
        rank: row.rank,
        productType: row.product_type,
        itemId: row.item_id,
        itemName: row.item_name,
        totalQuantitySold: row.total_quantity_sold,
        totalOrders: row.total_orders,
        productSales: row.product_sales,
      })),
      productPairs: raw.shopping.product_pairs.map((row) => ({
        rank: row.rank,
        item1: { id: row.item_1_id, name: row.item_1_name },
        item2: { id: row.item_2_id, name: row.item_2_name },
        ordersBoughtTogether: row.orders_bought_together,
      })),
    },
    journey: {
      stages: [...raw.journey.stages],
      nodes: raw.journey.nodes.map((row) => ({
        id: row.id,
        stage: row.stage,
        label: row.label,
        value: row.value,
        color: row.color,
        meta: row.metadata,
      })),
      links,
      transitions,
      summaryCards: [
        {
          value: percentage(transition("ads-productview").conversionRate),
          label: "Ads → Product View",
        },
        {
          value: percentage(transition("productview-order").conversionRate),
          label: "Product View → Order",
        },
        {
          value: percentage(transition("order-complete").conversionRate),
          label: "Order → Complete",
        },
        {
          value: percentage(transition("complete-goodreview").conversionRate),
          label: "Complete → Good Review",
        },
      ],
      dropOffCards: [
        "ads-productview",
        "productview-order",
        "order-complete",
      ].map((id, index) => ({
        value: `↓${(transition(id).dropOffRate * 100).toFixed(1)}%`,
        label: `${raw.journey.nodes.find((node) => node.id === transition(id).source)!.label} → ${raw.journey.nodes.find((node) => node.id === transition(id).target)!.label}`,
        emphasized: index === 0,
      })),
      insights: [
        {
          eyebrow: "BIGGEST DROP-OFF",
          headline: `Ads → Product View · ${percentage(transition("ads-productview").dropOffRate)}`,
          detail: `${node("ads").value.toLocaleString("en-US")} ad impressions generated ${node("productview").value.toLocaleString("en-US")} product views, equivalent to a ${percentage(transition("ads-productview").conversionRate)} conversion rate.`,
        },
        {
          eyebrow: "ORDER QUALITY",
          headline: `${node("complete").value.toLocaleString("en-US")} / ${node("order").value.toLocaleString("en-US")} completed orders`,
          detail: `The completion rate reached ${percentage(transition("order-complete").conversionRate)}, while cancelled orders accounted for ${percentage(transition("order-cancel").conversionRate)} of total orders.`,
        },
        {
          eyebrow: "POST-PURCHASE SIGNAL",
          headline: `${node("goodreview").value.toLocaleString("en-US")} Good Review · ${node("buyagain").value.toLocaleString("en-US")} Buy Again`,
          detail: `Good Reviews represented ${percentage(transition("complete-goodreview").conversionRate)} and Buy Again represented ${percentage(transition("complete-buyagain").conversionRate)} of completed orders.`,
        },
      ],
    },
    recommendations: raw.recommendations.map((row) => ({
      ...row,
      evidence: row.evidence.map((evidence) => ({ ...evidence })),
    })),
  };
}
