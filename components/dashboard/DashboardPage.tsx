import { CustomerJourneySection } from "./CustomerJourneySection";
import { CustomerSegmentationSection } from "./CustomerSegmentationSection";
import { DashboardHeader } from "./DashboardHeader";
import { RecommendationsSection } from "./RecommendationsSection";
import { ShoppingTrendsSection } from "./ShoppingTrendsSection";
import { PurchaseTimingSection } from "./PurchaseTimingSection";
import { DashboardDateRangeProvider } from "./DashboardDateRangeContext";

const dashboardPartClassName =
  "rounded-[18px] border border-[#e1e5eb] bg-[#f7f8fa] p-4 transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-[#cfd6e1] hover:bg-white hover:shadow-[0_8px_24px_rgba(30,58,95,0.06)] focus-within:border-[#cfd6e1] focus-within:bg-white focus-within:shadow-[0_8px_24px_rgba(30,58,95,0.06)] min-[1280px]:p-5";

export function DashboardPage() {
  return (
    <DashboardDateRangeProvider>
      <main className="mx-auto w-[min(94vw,1600px)] max-w-none px-0 py-16">
        <DashboardHeader />
        <div className="space-y-7">
          <div
            data-dashboard-part="recommendations"
            className={dashboardPartClassName}
          >
            <RecommendationsSection />
          </div>
          <div
            data-dashboard-part="customer-analysis"
            className={dashboardPartClassName}
          >
            <div className="grid grid-cols-1 items-stretch gap-4 min-[900px]:grid-cols-2 min-[1420px]:grid-cols-3">
              <CustomerSegmentationSection />
              <PurchaseTimingSection />
              <ShoppingTrendsSection />
            </div>
          </div>
          <div
            data-dashboard-part="customer-journey"
            className={dashboardPartClassName}
          >
            <CustomerJourneySection />
          </div>
        </div>
      </main>
    </DashboardDateRangeProvider>
  );
}
