import type { RawCustomerTypeResponse } from "@/data/contracts/section-api";

/** Exact local extraction from `mapping data.xlsx`, Customer journey!A7:C27. */
export const rawCustomerTypeWorkbookFixture: RawCustomerTypeResponse = {
  daily: [
    ["2026-05-01",0,0],["2026-05-02",5,0],["2026-05-03",18,0],["2026-05-04",32,1],
    ["2026-05-05",40,1],["2026-05-06",37,1],["2026-05-07",20,0],["2026-05-08",26,0],
    ["2026-05-09",35,2],["2026-05-10",32,1],["2026-05-11",27,1],["2026-05-12",42,4],
    ["2026-05-13",41,3],["2026-05-14",42,1],["2026-05-15",50,2],["2026-05-16",19,2],
    ["2026-05-17",22,3],
  ].map(([date, newCustomers, existingCustomers]) => ({ date:String(date),new_customers:Number(newCustomers),existing_customers:Number(existingCustomers) })),
  revenue_contribution: [
    { customer_type:"new",revenue:null,revenue_contribution:97.82 },
    { customer_type:"returning",revenue:null,revenue_contribution:2.18 },
  ],
  percentage_format: "percent",
};
