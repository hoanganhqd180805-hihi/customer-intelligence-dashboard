import type { RecommendationData } from "@/data/contracts/dashboard";
import { journeyConversionWowByStep } from "@/data/fixtures/journey-comparison.fixture";
import { customerSegmentationDataset } from "@/data/fixtures/customer-segmentation-workbook.fixture";
import { journeyLinks, journeyNodes } from "@/data/fixtures/journey.fixture";
import { rawPurchaseTimeFixture } from "@/data/fixtures/section-api.fixture";
import { shoppingComposition } from "@/data/fixtures/shopping-composition.fixture";

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const list = new Intl.ListFormat("en-US", {
  style: "long",
  type: "conjunction",
});
const severity = (priority: number): RecommendationData["severity"] =>
  priority >= 85 ? "high" : priority >= 70 ? "medium" : "low";
const node = (label: string) =>
  journeyNodes.find((item) => item.label === label)!;
const link = (source: string, target: string) =>
  journeyLinks.find(
    (item) => item.source === node(source).id && item.target === node(target).id,
  )!;
const stageNodeTotal = (stage: string) =>
  journeyNodes
    .filter((item) => item.stage === stage)
    .reduce((sum, item) => sum + item.value, 0);
const stageLinkTotal = (sourceStage: string, targetStage: string) => {
  const sourceIds = new Set(
      journeyNodes
        .filter((item) => item.stage === sourceStage)
        .map((item) => item.id),
    ),
    targetIds = new Set(
      journeyNodes
        .filter((item) => item.stage === targetStage)
        .map((item) => item.id),
    );
  return journeyLinks
    .filter(
      (item) => sourceIds.has(item.source) && targetIds.has(item.target),
    )
    .reduce((sum, item) => sum + item.value, 0);
};
const ratio = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0;
const segmentName = (value: string) =>
  ({
    "Ngủ đông": "Dormant",
    "Khách mới": "New Customers",
    "Khách thường": "Regular Customers",
    "Tiềm năng": "Potential",
    "Nguy cơ rời bỏ": "At Risk",
    VIP: "VIP",
  })[value] ?? value;
const weekdayName = (value: string) =>
  ({
    "Thứ Hai": "Monday",
    "Thứ Ba": "Tuesday",
    "Thứ Tư": "Wednesday",
    "Thứ Năm": "Thursday",
    "Thứ Sáu": "Friday",
    "Thứ Bảy": "Saturday",
    "Chủ Nhật": "Sunday",
  })[value] ?? value;
const shoppingName = (value: string) =>
  ({ Combo: "Bundle", "Bán lẻ": "Single-item", "Hỗn hợp": "Mixed" })[
    value
  ] ?? value;

interface JourneyRecommendationMetric {
  step: keyof typeof journeyConversionWowByStep;
  conversionRate: number;
  dropoffRate: number;
  conversionWow: number;
  dropoffWow: number;
}

function getJourneyRecommendationMetrics(): JourneyRecommendationMetric[] {
  const sources = [
    {
      step: "Platform → Content",
      converted: stageLinkTotal("MARKETPLACE", "CONTENT / ENTRY DRIVER"),
      entered: stageNodeTotal("MARKETPLACE"),
    },
    {
      step: "Content → Product View",
      converted: stageLinkTotal("CONTENT / ENTRY DRIVER", "PRODUCT VIEW"),
      entered: stageNodeTotal("CONTENT / ENTRY DRIVER"),
    },
    {
      step: "Product View → Add to Cart",
      converted: link("Product View", "Add to Cart").value,
      entered: node("Product View").value,
    },
    {
      step: "Add to Cart → Order",
      converted: link("Add to Cart", "Order").value,
      entered: node("Add to Cart").value,
    },
    {
      step: "Order → Complete",
      converted: link("Order", "Complete").value,
      entered: node("Order").value,
    },
  ] as const;

  return sources.map(({ step, converted, entered }) => {
    const conversionRate = ratio(converted, entered),
      conversionWow = journeyConversionWowByStep[step];
    return {
      step,
      conversionRate,
      dropoffRate: 1 - conversionRate,
      conversionWow,
      dropoffWow: -conversionWow,
    };
  });
}

export function generateRecommendations(): RecommendationData[] {
  const biggestDropoff = [...getJourneyRecommendationMetrics()].sort(
    (a, b) => b.dropoffRate - a.dropoffRate,
  )[0];
  const dropoffDirection =
    biggestDropoff.dropoffWow > 0
      ? "worsened"
      : biggestDropoff.dropoffWow < 0
        ? "improved"
        : "was unchanged";
  const dropoffWowValue = `${Math.abs(biggestDropoff.dropoffWow).toFixed(1)} pp`;
  const dropoffWowSignal = `${biggestDropoff.dropoffWow > 0 ? "↑" : biggestDropoff.dropoffWow < 0 ? "↓" : "—"} ${dropoffWowValue}`;

  const retentionNames = new Set(["Ngủ đông", "Nguy cơ rời bỏ"]);
  const retentionSegments = customerSegmentationDataset.segments.filter(
    (segment) => retentionNames.has(segment.segment),
  );
  const supportedRetentionSegments =
    retentionSegments.length > 0
      ? retentionSegments
      : [
          [...customerSegmentationDataset.segments].sort(
            (a, b) => b.revenue - a.revenue,
          )[0],
        ];
  const retentionLabels = supportedRetentionSegments.map((segment) =>
    segmentName(segment.segment),
  );
  const retentionCustomerCount = supportedRetentionSegments.reduce(
    (sum, segment) => sum + segment.customerCount,
    0,
  );
  const retentionCustomerShare = supportedRetentionSegments.reduce(
    (sum, segment) => sum + segment.customerShare,
    0,
  );
  const retentionRevenue = supportedRetentionSegments.reduce(
    (sum, segment) => sum + segment.revenue,
    0,
  );
  const retentionRevenueShare = supportedRetentionSegments.reduce(
    (sum, segment) => sum + segment.revenueShare,
    0,
  );
  const retentionTarget = `${list.format(retentionLabels)} customers`;
  const retentionCustomerSignal = `${integer.format(retentionCustomerCount)} customers · ${percent.format(retentionCustomerShare)}`;
  const retentionCustomerNarrative = `${integer.format(retentionCustomerCount)} customers (${percent.format(retentionCustomerShare)})`;

  const purchaseRows = rawPurchaseTimeFixture.time_slot_totals ?? [];
  const peakOrders = Math.max(
    0,
    ...purchaseRows.map((row) => row.total_orders),
  );
  const peakRows = purchaseRows.filter(
    (row) => row.total_orders === peakOrders && peakOrders > 0,
  );
  const peakDays = [
    ...new Set(peakRows.map((row) => weekdayName(row.weekday))),
  ];
  const peakSlots = [...new Set(peakRows.map((row) => row.time_slot))];
  const peakDayLabel = list.format(peakDays);
  const peakSlotLabel = list.format(peakSlots);
  const peakWindow = `${peakDayLabel} · ${peakSlotLabel}`;
  const peakOrderSignal = `${integer.format(peakOrders)} orders${peakRows.length > 1 ? " each" : ""}`;

  const dominantPurchaseType = [...shoppingComposition].sort(
    (a, b) => b.orderShare - a.orderShare,
  )[0];
  const dominantPurchaseLabel = shoppingName(dominantPurchaseType.type);

  const items: RecommendationData[] = [
    {
      id: "journey-conversion",
      category: "Conversion",
      status: "Action Required",
      priority: 94,
      severity: "high",
      signal: `This step has the highest current drop-off at ${percent.format(biggestDropoff.dropoffRate)} and ${dropoffDirection} by ${dropoffWowValue} versus last week.`,
      title: biggestDropoff.step,
      action:
        "Review content placement, product links, CTAs, offers, and landing experience.",
      relationship: `${biggestDropoff.step} converts at ${percent.format(biggestDropoff.conversionRate)} and drops off at ${percent.format(biggestDropoff.dropoffRate)}.`,
      rationale:
        "This is the highest observed drop-off among the five Customer Journey transitions.",
      description: `Review content placement, product links, CTAs, offers, and landing experience for ${biggestDropoff.step}.`,
      reason: `${biggestDropoff.step} is the largest current Customer Journey drop-off.`,
      evidence: [
        {
          metric: "Conversion Rate",
          value: percent.format(biggestDropoff.conversionRate),
          relationship: biggestDropoff.step,
        },
        {
          metric: "Drop-off Rate",
          value: percent.format(biggestDropoff.dropoffRate),
          relationship: "Highest current Journey drop-off",
        },
        {
          metric: "WoW Change",
          value: dropoffWowSignal,
          relationship: "Percentage-point change in drop-off rate",
        },
      ],
    },
    {
      id: "segment-retention",
      category: "Retention",
      status: "Revenue Protection",
      priority: 90,
      severity: "high",
      signal: `Together, these segments represent ${retentionCustomerNarrative} and contribute ${percent.format(retentionRevenueShare)} of revenue.`,
      title: retentionTarget,
      action: "Test targeted incentives and repurchase reminders.",
      relationship: `${retentionLabels.join(" and ")} account for ${money.format(retentionRevenue)} ₫ in current revenue contribution.`,
      rationale:
        "These retention-oriented segments have the largest combined customer and revenue exposure available in the segmentation analysis.",
      description: `Test targeted incentives and repurchase reminders for ${retentionTarget}.`,
      reason: `${retentionTarget} account for ${percent.format(retentionRevenueShare)} of revenue.`,
      evidence: [
        {
          metric: "Customer Segments",
          value: list.format(retentionLabels),
          relationship: "Retention-oriented segments",
        },
        {
          metric: "Customers",
          value: retentionCustomerSignal,
          relationship: "Combined customer count and share",
        },
        {
          metric: "Revenue Contribution",
          value: percent.format(retentionRevenueShare),
          relationship: `${money.format(retentionRevenue)} ₫`,
        },
      ],
    },
    {
      id: "purchase-timing",
      category: "Purchase Timing",
      status: "Timing Opportunity",
      priority: 80,
      severity: "medium",
      signal: `This window reaches the heatmap's joint peak of ${peakOrderSignal}.`,
      title: peakWindow,
      action: "Prioritize campaigns, vouchers, and promotional activity.",
      relationship: `${peakWindow} has the highest order count in the current heatmap.`,
      rationale:
        "The recommendation targets the observed peak purchasing window without assuming why it performs best.",
      description: `Prioritize campaigns, vouchers, and promotional activity during ${peakWindow}.`,
      reason: `${peakWindow} is the current heatmap peak with ${peakOrderSignal}.`,
      evidence: [
        {
          metric: "Peak Day",
          value: peakDayLabel,
          relationship: "Highest heatmap cell",
        },
        {
          metric: "Peak Time Slot",
          value: peakSlotLabel,
          relationship: "Highest heatmap cell",
        },
        {
          metric: "Peak Orders",
          value: peakOrderSignal,
          relationship: "Orders per peak cell",
        },
      ],
    },
    {
      id: "shopping-behavior",
      category: "Shopping Behavior",
      status: "Purchase Mix Opportunity",
      priority: 75,
      severity: "medium",
      signal: `${dominantPurchaseLabel} purchases lead the current mix with ${percent.format(dominantPurchaseType.orderShare)} of orders and ${percent.format(dominantPurchaseType.revenueShare)} of revenue.`,
      title: `${dominantPurchaseLabel} offers`,
      action: "Prioritize visibility and conversion tests.",
      relationship: `${dominantPurchaseLabel} is the largest purchase type by order share and revenue contribution.`,
      rationale:
        "The recommendation follows the dominant observed purchase type instead of assuming a bundle opportunity.",
      description: `Prioritize visibility and conversion tests for ${dominantPurchaseLabel} offers.`,
      reason: `${dominantPurchaseLabel} leads both order share and revenue contribution.`,
      evidence: [
        {
          metric: "Dominant Type",
          value: dominantPurchaseLabel,
          relationship: "Largest order share",
        },
        {
          metric: "Order Share",
          value: percent.format(dominantPurchaseType.orderShare),
          relationship: `${integer.format(dominantPurchaseType.orderCount)} orders`,
        },
        {
          metric: "Revenue Contribution",
          value: percent.format(dominantPurchaseType.revenueShare),
          relationship: `${money.format(dominantPurchaseType.revenue)} ₫`,
        },
      ],
    },
  ];

  return items.map((item) => ({
    ...item,
    severity: severity(item.priority),
  }));
}

export const recommendations = generateRecommendations();
