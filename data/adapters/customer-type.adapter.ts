import type { CustomerTypesDataset } from "@/data/contracts/dashboard";
import type { RawCustomerTypeResponse } from "@/data/contracts/section-api";

export function adaptCustomerTypeResponse(
  raw: RawCustomerTypeResponse,
): CustomerTypesDataset | null {
  if (raw.daily == null && raw.revenue_contribution == null) return null;
  if (raw.daily == null || raw.revenue_contribution == null)
    throw new Error("Customer Type response is incomplete");
  const divisor = raw.percentage_format === "percent" ? 100 : 1;
  const revenueShareTotal = raw.revenue_contribution.reduce(
    (sum, row) => sum + row.revenue_contribution / divisor,
    0,
  );
  if (Math.abs(revenueShareTotal - 1) > 0.001)
    throw new Error("Customer revenue contributions do not total 100%");
  return {
    availability: "available",
    daily: raw.daily
      .map((row) => ({
        date: row.date,
        newCustomers: row.new_customers,
        returningCustomers: row.existing_customers,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    revenueContribution: raw.revenue_contribution.map((row) => ({
      customerType: row.customer_type,
      revenue: row.revenue,
      revenueShare: row.revenue_contribution / divisor,
    })),
  };
}
