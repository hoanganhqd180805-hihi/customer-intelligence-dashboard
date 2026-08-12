import { DateRangePill } from "@/components/ui/DateRangePill";

export function DashboardHeader() {
  return (
    <header className="mb-5 flex items-end justify-between gap-5">
      <div>
        <p className="mb-1.5 text-[13px] text-[#666]">Customer Intelligence</p>
        <h1 className="text-[27px] font-medium leading-none tracking-[-0.025em]">
          Customer Intelligence Overview
        </h1>
      </div>
      <DateRangePill />
    </header>
  );
}
