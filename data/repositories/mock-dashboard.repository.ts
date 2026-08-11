import { adaptDashboardResponse } from "@/data/adapters/dashboard.adapter";
import type { DashboardModel } from "@/data/contracts/dashboard";
import { rawDashboardFixture } from "@/data/fixtures/raw-dashboard.fixture";

export function getMockDashboard(): DashboardModel {
  return adaptDashboardResponse(rawDashboardFixture);
}
