import type { RawCustomerTypeResponse } from "@/data/contracts/section-api";

/** Exact local extraction from `mapping data.xlsx`, Customer journey!A7:C27. */
export const rawCustomerTypeWorkbookFixture: RawCustomerTypeResponse = {
  daily: [
    ["2026-05-01",0,0],["2026-05-02",4,1],["2026-05-03",15,3],["2026-05-04",24,9],
    ["2026-05-05",29,12],["2026-05-06",29,9],["2026-05-07",14,6],["2026-05-08",22,4],
    ["2026-05-09",25,12],["2026-05-10",24,8],["2026-05-11",24,3],["2026-05-12",22,12],
    ["2026-05-13",17,11],["2026-05-14",9,2],["2026-05-15",8,5],["2026-05-16",1,0],
    ["2026-05-17",0,0],
  ].map(([date, newCustomers, existingCustomers]) => ({ date:String(date),new_customers:Number(newCustomers),existing_customers:Number(existingCustomers) })),
  revenue_contribution: [
    { customer_type:"new",revenue:null,revenue_contribution:69.11 },
    { customer_type:"returning",revenue:null,revenue_contribution:30.89 },
  ],
  percentage_format: "percent",
};
