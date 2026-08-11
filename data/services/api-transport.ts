import type { SectionRequest } from "@/data/contracts/section-api";

export async function fetchDashboardSection<T>(endpoint: string | undefined, sectionName: string, request: SectionRequest): Promise<T> {
  if (!endpoint) throw new Error(`${sectionName} production endpoint is not configured`);
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set("startDate", request.startDate);
  url.searchParams.set("endDate", request.endDate);
  const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, signal: request.signal });
  if (!response.ok) throw new Error(`${sectionName} request failed (${response.status})`);
  return response.json() as Promise<T>;
}
