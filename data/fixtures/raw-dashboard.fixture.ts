import type { RawDashboardResponse } from "@/data/contracts/raw-dashboard";
import { overviewMockData } from "./overview.fixture";
import { rawCustomerTypeWorkbookFixture } from "./customer-type-workbook.fixture";
import { productPairs, products, purchaseTimeSlots, recommendations, shoppingComposition, timeSlots, weekdayOrders, weekdays } from "./interaction.fixture";
import { journeyLinks, journeyNodes, journeyStages } from "./journey.fixture";
import { rawCancellationWorkbookFixture } from "./section02-workbook.fixture";

const totalCancelledOrders = rawCancellationWorkbookFixture.reasons.reduce((sum,row)=>sum+row.cancelled_orders,0);

/** API-shaped local payload sourced from the latest workbook extraction and the approved Journey reference. */
export const rawDashboardFixture: RawDashboardResponse = {
  overview: {
    total_customers: overviewMockData.totalCustomers.value,
    total_orders: overviewMockData.totalOrders.value,
    revenue: overviewMockData.revenue.value,
    average_order_value: overviewMockData.averageOrderValue.value,
    repeat_customer_rate_pct: overviewMockData.repeatCustomerRate.value * 100,
    cancellation_rate_pct: overviewMockData.cancellationRate.value * 100,
  },
  customer_types: {
    available:true,
    daily:(rawCustomerTypeWorkbookFixture.daily ?? []).map((row)=>({date:row.date,new_customers:row.new_customers,returning_customers:row.existing_customers})),
    revenue_contribution:(rawCustomerTypeWorkbookFixture.revenue_contribution ?? []).map((row)=>({customer_type:row.customer_type,revenue:row.revenue,revenue_share_pct:row.revenue_contribution})),
  },
  purchase_cancellation: {
    time_slots: timeSlots,
    weekdays,
    time_slot_totals: purchaseTimeSlots.map((row) => ({ weekday: row.weekday, slot: row.slot, total_orders: row.totalOrders })),
    weekday_totals: weekdayOrders.map((row) => ({ weekday: row.weekday, total_orders: row.totalOrders })),
    cancellation_reasons:rawCancellationWorkbookFixture.reasons.map((row)=>({reason:row.reason,share_pct:row.cancelled_orders/totalCancelledOrders*100,cancelled_orders:row.cancelled_orders,lost_revenue:row.lost_revenue})),
    cancellation_lost_revenue:rawCancellationWorkbookFixture.total_lost_revenue,
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
