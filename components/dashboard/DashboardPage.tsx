import { CustomerJourneySection } from "./CustomerJourneySection";
import { ChannelPerformanceSection } from "./ChannelPerformanceSection";
import { CustomerTypesSection } from "./CustomerTypesSection";
import { CustomerSegmentationSection } from "./CustomerSegmentationSection";
import { DashboardHeader } from "./DashboardHeader";
import { OverviewSection } from "./OverviewSection";
import {
  CancellationAnalysisSection,
  PurchaseTimeSection,
} from "./PurchaseCancellationSection";
import { RecommendationsSection } from "./RecommendationsSection";
import { ShoppingTrendsSection } from "./ShoppingTrendsSection";
import { DashboardDateRangeProvider } from "./DashboardDateRangeContext";

export function DashboardPage() {
  return (
    <DashboardDateRangeProvider>
      <main className="mx-auto w-[min(94vw,1600px)] max-w-none px-0 py-16">
        <DashboardHeader />
        <OverviewSection />
        <div className="mt-8 space-y-8">
          <CustomerTypesSection />
          <div className="grid grid-cols-1 items-start gap-8 min-[1050px]:grid-cols-2 min-[1050px]:items-stretch min-[1050px]:gap-4">
            <PurchaseTimeSection />
            <CustomerSegmentationSection />
          </div>
          <ShoppingTrendsSection />
          <CustomerJourneySection />
          <div className="grid grid-cols-1 items-start gap-4 min-[1050px]:grid-cols-2 min-[1050px]:items-stretch">
            <ChannelPerformanceSection />
            <CancellationAnalysisSection />
          </div>
          <RecommendationsSection />
        </div>
      </main>
    </DashboardDateRangeProvider>
  );
}
