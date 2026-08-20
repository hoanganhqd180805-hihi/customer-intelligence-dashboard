"use client";

import { useState, type ReactNode } from "react";
import { CustomerJourneySection } from "./CustomerJourneySection";
import { CustomerSegmentationSection } from "./CustomerSegmentationSection";
import { DashboardHeader } from "./DashboardHeader";
import { RecommendationsSection } from "./RecommendationsSection";
import { ShoppingTrendsSection } from "./ShoppingTrendsSection";
import { PurchaseTimingSection } from "./PurchaseTimingSection";
import { DashboardDateRangeProvider } from "./DashboardDateRangeContext";

type DashboardPartId = "recommendations" | "customer-analysis" | "customer-journey";

function DashboardPart({
  id,
  active,
  onActivate,
  onDeactivate,
  children,
}: {
  id: DashboardPartId;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  children: ReactNode;
}) {
  return (
    <div
      data-dashboard-part={id}
      data-active={active}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocusCapture={onActivate}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onDeactivate();
      }}
      className={`relative origin-center transform-gpu bg-transparent transition-[transform,filter] duration-[220ms] ease-out ${
        active ? "z-10 brightness-[1.01] sm:scale-[1.01]" : "z-0"
      }`}
    >
      {children}
    </div>
  );
}

export function DashboardPage() {
  const [activePart, setActivePart] = useState<DashboardPartId | null>(null);

  return (
    <DashboardDateRangeProvider>
      <div className="min-h-screen">
        <main className="mx-auto w-[min(94vw,1600px)] max-w-none px-0 py-16">
          <DashboardHeader />
          <div className="space-y-8">
            <DashboardPart
              id="recommendations"
              active={activePart === "recommendations"}
              onActivate={() => setActivePart("recommendations")}
              onDeactivate={() => setActivePart(null)}
            >
              <RecommendationsSection />
            </DashboardPart>
            <DashboardPart
              id="customer-analysis"
              active={activePart === "customer-analysis"}
              onActivate={() => setActivePart("customer-analysis")}
              onDeactivate={() => setActivePart(null)}
            >
              <div className="grid grid-cols-1 items-stretch gap-4 min-[900px]:grid-cols-2 min-[1420px]:grid-cols-3">
                <CustomerSegmentationSection />
                <PurchaseTimingSection />
                <ShoppingTrendsSection />
              </div>
            </DashboardPart>
            <DashboardPart
              id="customer-journey"
              active={activePart === "customer-journey"}
              onActivate={() => setActivePart("customer-journey")}
              onDeactivate={() => setActivePart(null)}
            >
              <CustomerJourneySection />
            </DashboardPart>
          </div>
        </main>
      </div>
    </DashboardDateRangeProvider>
  );
}
