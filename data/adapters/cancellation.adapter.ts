import type { CancellationAnalysisDataset } from "@/data/contracts/dashboard";
import type { RawCancellationWorkbookResponse } from "@/data/contracts/section-api";

export function adaptCancellationWorkbookData(
  raw: RawCancellationWorkbookResponse,
): CancellationAnalysisDataset {
  const totalCancelledOrders = raw.reasons.reduce(
    (sum, row) => sum + row.cancelled_orders,
    0,
  );
  const calculatedLostRevenue = raw.reasons.reduce(
    (sum, row) => sum + row.lost_revenue,
    0,
  );
  if (calculatedLostRevenue !== raw.total_lost_revenue)
    throw new Error(
      "Cancellation lost revenue does not reconcile to the workbook total",
    );
  return {
    reasons: raw.reasons.map((row) => ({
      reason: row.reason,
      cancelledOrders: row.cancelled_orders,
      orderShare: row.cancelled_orders / totalCancelledOrders,
      lostRevenue: row.lost_revenue,
      lostRevenueShare: row.lost_revenue / raw.total_lost_revenue,
    })),
    totalCancelledOrders,
    totalLostRevenue: raw.total_lost_revenue,
    comparison: { direction: null, ratio: null },
  };
}
