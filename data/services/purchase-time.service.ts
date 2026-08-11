import { adaptPurchaseTimeResponse } from "@/data/adapters/purchase-time.adapter";
import type { PurchaseTimeDataset } from "@/data/contracts/dashboard";
import type { RawPurchaseTimeResponse, SectionRequest } from "@/data/contracts/section-api";
import { rawPurchaseTimeFixture } from "@/data/fixtures/section-api.fixture";
import { fetchDashboardSection } from "./api-transport";
import { getDashboardDataMode } from "./overview.service";

export async function getPurchaseTimeData(request: SectionRequest): Promise<PurchaseTimeDataset | null> {
  const raw = getDashboardDataMode() === "mock" ? rawPurchaseTimeFixture : await fetchDashboardSection<RawPurchaseTimeResponse>(process.env.NEXT_PUBLIC_PURCHASE_TIME_API_URL, "Purchase Time", request);
  return adaptPurchaseTimeResponse(raw);
}
