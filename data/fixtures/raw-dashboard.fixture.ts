import type { RawDashboardResponse } from "@/data/contracts/raw-dashboard";
import { overviewMockData } from "./overview.fixture";
import { productPairs, products, purchaseTimeSlots, recommendations, shoppingComposition, timeSlots, weekdayOrders, weekdays } from "./interaction.fixture";
import { journeyLinks, journeyNodes, journeyStages } from "./journey.fixture";

/** API-shaped prototype payload. Its values remain sourced from DATA_SPEC and the approved Journey reference. */
export const rawDashboardFixture: RawDashboardResponse = {
  overview: {
    total_customers: overviewMockData.totalCustomers.value,
    total_orders: overviewMockData.totalOrders.value,
    revenue: overviewMockData.revenue.value,
    average_order_value: overviewMockData.averageOrderValue.value,
    repeat_customer_rate_pct: overviewMockData.repeatCustomerRate.value * 100,
    cancellation_rate_pct: overviewMockData.cancellationRate.value * 100,
  },
  customer_types: { available: false, daily: [], revenue_contribution: [] },
  purchase_cancellation: {
    time_slots: timeSlots,
    weekdays,
    time_slot_totals: purchaseTimeSlots.map((row) => ({ weekday: row.weekday, slot: row.slot, total_orders: row.totalOrders })),
    weekday_totals: weekdayOrders.map((row) => ({ weekday: row.weekday, total_orders: row.totalOrders })),
    cancellation_reasons: [
      ["Thay đổi ý định", 28.5], ["Giá tốt hơn", 22.1], ["Phí vận chuyển", 15.3],
      ["Giao lâu", 13.8], ["Thông tin SP", 11.2], ["Khác", 9.1],
    ].map(([reason, share]) => ({ reason: String(reason), share_pct: Number(share), cancelled_orders: null, lost_revenue: null })),
    cancellation_lost_revenue: 13_280_000,
  },
  shopping: {
    composition: shoppingComposition.map((row) => ({ type: row.type, order_count: row.orderCount, order_share_pct: row.orderShare * 100, revenue: row.revenue, revenue_share_pct: row.revenueShare * 100 })),
    products: products.map((row) => ({ rank: row.rank, product_type: row.productType, item_id: row.itemId, item_name: row.itemName, total_quantity_sold: row.totalQuantitySold, total_orders: row.totalOrders, product_sales: row.productSales })),
    product_pairs: productPairs.map((row) => ({ rank: row.rank, item_1_id: row.item1.id, item_1_name: row.item1.name, item_2_id: row.item2.id, item_2_name: row.item2.name, orders_bought_together: row.ordersBoughtTogether })),
  },
  journey: {
    stages: [...journeyStages],
    nodes: journeyNodes.map((row) => ({ id: row.id, stage: row.stage, label: row.label, value: row.value, color: row.color, metadata: row.meta })),
    links: journeyLinks.map((row) => ({ ...row })),
  },
  recommendations: recommendations.map((row) => ({ ...row, evidence: row.evidence.map((evidence) => ({ ...evidence })) })),
};
