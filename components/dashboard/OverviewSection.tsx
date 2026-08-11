"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import type { OverviewMetrics } from "@/data/contracts/dashboard";
import { getOverview } from "@/data/services/overview.service";
import { useDashboardDateRange } from "./DashboardDateRangeContext";

type OverviewState = { status: "loading" } | { status: "error"; message: string } | { status: "unavailable" } | { status: "success"; data: OverviewMetrics };

function OverviewCards({ data }: { data: OverviewMetrics }) {
  const metrics = [data.totalCustomers, data.totalOrders, data.revenue, data.averageOrderValue, data.repeatCustomerRate, data.cancellationRate];
  return <>{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</>;
}

function StatusCards({ status, message }: { status: "loading" | "error" | "unavailable"; message?: string }) {
  const label = status === "loading" ? "Đang tải dữ liệu" : status === "unavailable" ? "Dữ liệu chưa khả dụng" : "Không thể tải dữ liệu";
  return <>{Array.from({ length: 6 }, (_, index) => <Card key={index} className={`flex h-[109px] flex-col justify-center px-4 py-[17px] ${status === "loading" ? "animate-pulse" : ""}`}><span className="text-[13px] text-[#707070]">{label}</span>{index === 0 && message ? <span className="mt-2 truncate text-[11px] text-[#3b82f6]" title={message}>{message}</span> : <span className="mt-3 h-4 w-20 rounded bg-[#eef4fd]" />}</Card>)}</>;
}

function OverviewLoader({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [state, setState] = useState<OverviewState>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    getOverview({ startDate, endDate, signal: controller.signal }).then((result) => setState(result.status === "success" ? { status: "success", data: result.data } : { status: "unavailable" })).catch((error: unknown) => { if (!controller.signal.aborted) setState({ status: "error", message: error instanceof Error ? error.message : "Unknown Overview error" }); });
    return () => controller.abort();
  }, [startDate, endDate]);
  return <section aria-label="Tổng quan" aria-busy={state.status === "loading"} className="grid grid-cols-3 gap-3">{state.status === "success" ? <OverviewCards data={state.data} /> : <StatusCards status={state.status} message={state.status === "error" ? state.message : undefined} />}</section>;
}

export function OverviewSection() {
  const { startDate, endDate } = useDashboardDateRange();
  return <OverviewLoader key={`${startDate}:${endDate}`} startDate={startDate} endDate={endDate} />;
}
