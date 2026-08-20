"use client";

import { useDashboardDateRange } from "@/components/dashboard/DashboardDateRangeContext";
import { CalendarDays } from "lucide-react";

export function DateRangePill() {
  const { startDate, endDate } = useDashboardDateRange();
  const format = (date: string) => date.split("-").reverse().join("/");
  return (
    <div
      aria-label="Sample date range"
      className="inline-flex h-[41px] items-center gap-2.5 rounded-xl bg-[#f0f0f0] px-3.5 text-[14.5px] text-[#333]"
    >
      <CalendarDays aria-hidden="true" className="h-[17px] w-[17px] shrink-0" />
      <span>{format(startDate)} – {format(endDate)}</span>
    </div>
  );
}
