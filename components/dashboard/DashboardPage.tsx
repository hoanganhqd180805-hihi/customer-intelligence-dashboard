"use client";

import { useState, type ReactNode } from "react";
import { CustomerJourneySection } from "./CustomerJourneySection";
import { CustomerSegmentationSection } from "./CustomerSegmentationSection";
import { DashboardHeader } from "./DashboardHeader";

type DashboardPartId = "customer-segmentation" | "customer-journey";

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
    <div className="min-h-screen">
      <main className="mx-auto w-[min(94vw,1600px)] max-w-none px-0 py-16">
        <DashboardHeader />
        <div className="space-y-10">
          <DashboardPart
            id="customer-segmentation"
            active={activePart === "customer-segmentation"}
            onActivate={() => setActivePart("customer-segmentation")}
            onDeactivate={() => setActivePart(null)}
          >
            <CustomerSegmentationSection />
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
  );
}
