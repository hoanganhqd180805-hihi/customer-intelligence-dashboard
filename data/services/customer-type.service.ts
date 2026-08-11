import { adaptCustomerTypeResponse } from "@/data/adapters/customer-type.adapter";
import type { CustomerTypesDataset } from "@/data/contracts/dashboard";
import type { RawCustomerTypeResponse, SectionRequest } from "@/data/contracts/section-api";
import { rawCustomerTypeFixture } from "@/data/fixtures/section-api.fixture";
import { fetchDashboardSection } from "./api-transport";
import { getDashboardDataMode } from "./overview.service";

export async function getCustomerTypeData(request: SectionRequest): Promise<CustomerTypesDataset | null> {
  const raw = getDashboardDataMode() === "mock" ? rawCustomerTypeFixture : await fetchDashboardSection<RawCustomerTypeResponse>(process.env.NEXT_PUBLIC_CUSTOMER_TYPE_API_URL, "Customer Type", request);
  return adaptCustomerTypeResponse(raw);
}
