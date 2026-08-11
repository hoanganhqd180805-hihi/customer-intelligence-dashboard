"use client";

import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

export interface DashboardDateRange { startDate: string; endDate: string }
interface DashboardDateRangeValue extends DashboardDateRange { setDateRange: (range: DashboardDateRange) => void }
const DashboardDateRangeContext = createContext<DashboardDateRangeValue | null>(null);

export function DashboardDateRangeProvider({ children }: PropsWithChildren) {
  const [range, setDateRange] = useState<DashboardDateRange>({ startDate: "2026-05-01", endDate: "2026-05-17" });
  const value = useMemo(() => ({ ...range, setDateRange }), [range]);
  return <DashboardDateRangeContext.Provider value={value}>{children}</DashboardDateRangeContext.Provider>;
}

export function useDashboardDateRange() {
  const value = useContext(DashboardDateRangeContext);
  if (!value) throw new Error("useDashboardDateRange must be used inside DashboardDateRangeProvider");
  return value;
}
