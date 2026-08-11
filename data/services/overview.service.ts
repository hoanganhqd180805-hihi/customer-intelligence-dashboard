import { adaptOverviewResponse } from "@/data/adapters/overview.adapter";
import type { OverviewMetrics } from "@/data/contracts/dashboard";
import type { OverviewRequest, RawOverviewApiResponse } from "@/data/contracts/overview-api";
import { rawOverviewApiFixture } from "@/data/fixtures/overview-api.fixture";
import { fetchDashboardSection } from "./api-transport";

export type DashboardDataMode = "mock" | "production";
export type OverviewResult =
  | { status: "success"; data: OverviewMetrics }
  | { status: "unavailable"; data: null };

export function getDashboardDataMode(): DashboardDataMode {
  const mode = process.env.NEXT_PUBLIC_DASHBOARD_DATA_MODE;
  if (mode === "production") return "production";
  if (mode === "mock" || mode == null) return "mock";
  throw new Error(`Unsupported NEXT_PUBLIC_DASHBOARD_DATA_MODE: ${mode}`);
}

export async function getOverview(request: OverviewRequest): Promise<OverviewResult> {
  const raw = getDashboardDataMode() === "mock" ? rawOverviewApiFixture : await fetchDashboardSection<RawOverviewApiResponse>(process.env.NEXT_PUBLIC_OVERVIEW_API_URL, "Overview", request);
  const data = adaptOverviewResponse(raw);
  return data ? { status: "success", data } : { status: "unavailable", data: null };
}
