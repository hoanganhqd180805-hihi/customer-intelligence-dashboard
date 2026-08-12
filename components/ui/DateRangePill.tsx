"use client";

import { useDashboardDateRange } from "@/components/dashboard/DashboardDateRangeContext";

export function DateRangePill() {
  const { startDate, endDate } = useDashboardDateRange();
  const format = (date: string) => date.split("-").reverse().join("/");
  return (
    <div
      aria-label="Sample date range"
      className="rounded-xl bg-[#f0f0f0] px-3 py-2 text-[12px] text-[#333]"
    >
      {format(startDate)} – {format(endDate)}
    </div>
  );
}
