import type {
  PurchaseTimeDataset,
  PurchaseTimeSlotTotal,
} from "@/data/contracts/dashboard";
import type { RawPurchaseTimeResponse } from "@/data/contracts/section-api";

export function adaptPurchaseTimeResponse(
  raw: RawPurchaseTimeResponse,
): PurchaseTimeDataset | null {
  if (raw.time_slot_totals == null && raw.weekday_totals == null) return null;
  if (raw.time_slot_totals == null || raw.weekday_totals == null)
    throw new Error("Purchase Time response is incomplete");
  const supplied = new Map(
    raw.time_slot_totals.map((row) => [`${row.weekday}:${row.time_slot}`, row]),
  );
  const timeSlotTotals: PurchaseTimeSlotTotal[] =
    raw.omitted_combination_means_zero
      ? raw.weekdays.flatMap((weekday) =>
          raw.time_slots.map((slot) => ({
            weekday,
            slot,
            totalOrders: supplied.get(`${weekday}:${slot}`)?.total_orders ?? 0,
          })),
        )
      : raw.time_slot_totals.map((row) => ({
          weekday: row.weekday,
          slot: row.time_slot,
          totalOrders: row.total_orders,
        }));
  const weekdayOrder = new Map(
    raw.weekdays.map((weekday, index) => [weekday, index]),
  );
  return {
    weekdays: [...raw.weekdays].sort(
      (a, b) => weekdayOrder.get(a)! - weekdayOrder.get(b)!,
    ),
    timeSlots: [...raw.time_slots],
    timeSlotTotals,
    weekdayTotals: raw.weekday_totals
      .map((row) => ({ weekday: row.weekday, totalOrders: row.total_orders }))
      .sort(
        (a, b) => weekdayOrder.get(a.weekday)! - weekdayOrder.get(b.weekday)!,
      ),
    missingCombinationsMeanZero: raw.omitted_combination_means_zero,
  };
}
