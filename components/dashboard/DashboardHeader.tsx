import { DateRangePill } from "@/components/ui/DateRangePill";

export function DashboardHeader() {
  return (
    <header className="mb-4 flex flex-col items-start gap-2.5">
      <h1 className="w-full whitespace-nowrap text-center text-[17px] font-bold leading-tight text-[#3b82f6]">
        Customer Intelligence
      </h1>
      <DateRangePill />
    </header>
  );
}
