import { adaptCancellationWorkbookData } from "@/data/adapters/cancellation.adapter";
import type { RawCancellationWorkbookResponse } from "@/data/contracts/section-api";

/** Exact extraction from mapping data.xlsx, Customer journey!B275:F284. */
export const rawJourneyCancellationWorkbookFixture: RawCancellationWorkbookResponse = {
  reasons: [
    {
      reason:
        "modify existing order (colour, size, address, voucher, etc.)",
      cancelled_orders: 9,
      lost_revenue: 3_749_246,
    },
    { reason: "other", cancelled_orders: 7, lost_revenue: 1_000_619 },
    {
      reason: "need to modify order",
      cancelled_orders: 6,
      lost_revenue: 649_164,
    },
    {
      reason: "don't want to buy anymore",
      cancelled_orders: 6,
      lost_revenue: 586_993,
    },
    { reason: "unpaid order", cancelled_orders: 3, lost_revenue: 455_923 },
    {
      reason: "need to change delivery address",
      cancelled_orders: 4,
      lost_revenue: 378_219,
    },
    {
      reason: "found cheaper elsewhere",
      cancelled_orders: 2,
      lost_revenue: 233_510,
    },
    {
      reason: "need to input / change voucher code",
      cancelled_orders: 2,
      lost_revenue: 227_982,
    },
    {
      reason: "payment procedure too troublesome",
      cancelled_orders: 1,
      lost_revenue: 170_320,
    },
  ],
  total_lost_revenue: 7_451_976,
};

export const journeyCancellationDetailDataset =
  adaptCancellationWorkbookData(rawJourneyCancellationWorkbookFixture);
