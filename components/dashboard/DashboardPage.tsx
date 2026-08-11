import { CustomerJourneySection } from "./CustomerJourneySection";
import { CustomerTypesSection } from "./CustomerTypesSection";
import { DashboardHeader } from "./DashboardHeader";
import { OverviewSection } from "./OverviewSection";
import { PurchaseCancellationSection } from "./PurchaseCancellationSection";
import { RecommendationsSection } from "./RecommendationsSection";
import { ShoppingTrendsSection } from "./ShoppingTrendsSection";
import { DashboardDateRangeProvider } from "./DashboardDateRangeContext";

export function DashboardPage() {
  return (
    <DashboardDateRangeProvider><main className="mx-auto w-[min(94vw,1600px)] max-w-none px-0 py-16">
      <DashboardHeader />
      <OverviewSection />
      <div className="mt-8 space-y-8">
        <CustomerTypesSection />
        <PurchaseCancellationSection />
        <ShoppingTrendsSection />
        <CustomerJourneySection />
        <RecommendationsSection />
      </div>
    </main></DashboardDateRangeProvider>
  );
}
