import type { RecommendationData } from "@/data/contracts/dashboard";
import { channelPerformanceDataset } from "@/data/fixtures/channel-performance.fixture";
import { customerSegmentationDataset } from "@/data/fixtures/customer-segmentation-workbook.fixture";
import { journeyLinks, journeyNodes } from "@/data/fixtures/journey.fixture";
import { rawCancellationWorkbookFixture } from "@/data/fixtures/section02-workbook.fixture";
import { rawOverviewApiFixture } from "@/data/fixtures/overview-api.fixture";

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const severity = (priority: number): RecommendationData["severity"] =>
  priority >= 85 ? "high" : priority >= 70 ? "medium" : "low";
const node = (label: string) =>
  journeyNodes.find((item) => item.label === label)!;
const link = (source: string, target: string) =>
  journeyLinks.find(
    (item) =>
      item.source === node(source).id && item.target === node(target).id,
  )!;
const numericRate = (source: string, target: string) =>
  Number.parseFloat(link(source, target).label) / 100;
const segmentName = (value: string) =>
  ({
    "Ngủ đông": "Dormant",
    "Khách mới": "New Customers",
    "Khách thường": "Regular Customers",
    "Tiềm năng": "Potential",
    "Nguy cơ rời bỏ": "At Risk",
    VIP: "VIP",
  })[value] ?? value;

export function generateRecommendations(): RecommendationData[] {
  const ads = channelPerformanceDataset.channels.find(
    (row) => row.channel === "Ads",
  )!;
  const highValueSegment = [...customerSegmentationDataset.segments].sort(
    (a, b) =>
      b.revenueShare - b.customerShare - (a.revenueShare - a.customerShare),
  )[0];
  const displaySegment = segmentName(highValueSegment.segment);
  const topCancellation = [...rawCancellationWorkbookFixture.reasons].sort(
    (a, b) => b.lost_revenue - a.lost_revenue,
  )[0];
  const adsJourneyRate = numericRate("Ads", "Product View");
  const adsDrop = 1 - adsJourneyRate;
  const cancellationRate = rawOverviewApiFixture.cancellation_rate ?? 0;
  const shareGap =
    (highValueSegment.revenueShare - highValueSegment.customerShare) * 100;
  const items: RecommendationData[] = [
    {
      id: "journey-conversion",
      category: "Conversion",
      status: "Action Required",
      priority: Math.round(85 + adsDrop * 10),
      severity: "high",
      signal: `Ads generate ${integer.format(link("Ads", "Product View").value)} Product Views, but the transition rate is only ${percent.format(adsJourneyRate)}.`,
      title: "Reduce Friction Before Product View",
      action:
        "Review product links, CTAs, offers, and the Ads landing experience before increasing traffic.",
      relationship: `Ads → Product View loses ${percent.format(adsDrop)} of activity based on the Journey rate.`,
      rationale:
        "This is the largest drop-off among the primary transitions, so improving it can expand volume throughout downstream conversion stages.",
      description:
        "Review product links, CTAs, offers, and the Ads landing experience before increasing traffic.",
      reason:
        "Ads → Product View is the largest current Customer Journey drop-off.",
      evidence: [
        {
          metric: "Ads Activity",
          value: integer.format(ads.activity),
          relationship: "Marketplace activity allocated to Ads",
        },
        {
          metric: "Product Views",
          value: integer.format(ads.productViews),
          relationship: "Downstream result from Ads",
        },
        {
          metric: "Ads → Product View",
          value: percent.format(adsJourneyRate),
          relationship: "Rate supplied by the Sankey workbook",
        },
      ],
    },
    {
      id: "channel-efficiency",
      category: "Channel Effectiveness",
      status: "Optimization Priority",
      priority: 88,
      severity: "high",
      signal: `Ads have the highest activity, but their ${percent.format(ads.conversionRate!)} CVR is below the ${percent.format(ads.benchmark!)} Content median.`,
      title: "Optimize Ads Before Scaling Traffic",
      action:
        "Check tracking, product links, CTAs, placements, targeting, and content relevance for each Marketplace source.",
      relationship: `${integer.format(ads.activity)} activities generate ${integer.format(ads.productViews)} Product Views; performance is below the ${percent.format(ads.benchmark!)} relative benchmark.`,
      rationale:
        "A high-volume channel performing below the median offers broad optimization potential without requiring assumptions about the underlying cause.",
      description:
        "Check tracking, product links, CTAs, placements, targeting, and content relevance for each Marketplace source.",
      reason:
        "Ads have the highest Content activity but a CVR below the current benchmark.",
      evidence: [
        {
          metric: "Activity",
          value: integer.format(ads.activity),
          relationship: "Total Marketplace → Ads",
        },
        {
          metric: "Product Views",
          value: integer.format(ads.productViews),
          relationship: "Ads → Product View",
        },
        {
          metric: "CVR / Median",
          value: `${percent.format(ads.conversionRate!)} / ${percent.format(ads.benchmark!)}`,
          relationship: "Comparison with the median for active Content",
        },
      ],
    },
    {
      id: "cancellation-impact",
      category: "Operations",
      status: "Monitor Closely",
      priority: 82,
      severity: "medium",
      signal: `The ${percent.format(cancellationRate)} cancellation rate is associated with ${money.format(rawCancellationWorkbookFixture.total_lost_revenue)} ₫ in revenue loss.`,
      title: "Prioritize the Highest-Impact Cancellation Reason",
      action:
        "Review the order-modification process and provide guidance for color, size, address, or voucher changes before customers cancel.",
      relationship: `“${topCancellation.reason}” causes ${topCancellation.cancelled_orders} cancellations and ${money.format(topCancellation.lost_revenue)} ₫ in revenue loss.`,
      rationale:
        "Prioritizing revenue loss focuses remediation on financial impact rather than cancellation volume alone.",
      description:
        "Review the order-modification process and provide guidance before customers cancel.",
      reason:
        "The leading reason has both the highest cancellation count and revenue loss.",
      evidence: [
        {
          metric: "Cancellation Rate",
          value: percent.format(cancellationRate),
          relationship: "Cancelled orders / total created orders",
        },
        {
          metric: "Revenue Loss",
          value: `${money.format(rawCancellationWorkbookFixture.total_lost_revenue)} ₫`,
          relationship: "Total revenue across cancellation-reason groups",
        },
        {
          metric: "Top Reason",
          value: `${money.format(topCancellation.lost_revenue)} ₫`,
          relationship: topCancellation.reason,
        },
      ],
    },
    {
      id: "segment-value",
      category: "Customer Segmentation",
      status: "Value Opportunity",
      priority: 76,
      severity: "medium",
      signal: `${displaySegment} customers represent ${percent.format(highValueSegment.customerShare)} of customers but contribute ${percent.format(highValueSegment.revenueShare)} of revenue.`,
      title: `Increase Value Conversion from ${displaySegment}`,
      action:
        "Test repurchase reminders, bundles, or next-purchase offers and measure subsequent revenue per customer.",
      relationship: `Revenue share exceeds customer share${shareGap < 1 ? "" : ` by ${shareGap.toFixed(1)} percentage points`}.`,
      rationale:
        "A small segment with relatively high revenue contribution is a suitable signal for controlled retention and upsell experiments.",
      description:
        "Test repurchase reminders, bundles, or next-purchase offers.",
      reason: "The segment’s revenue share exceeds its customer share.",
      evidence: [
        {
          metric: "Customers",
          value: integer.format(highValueSegment.customerCount),
          relationship: percent.format(highValueSegment.customerShare),
        },
        {
          metric: "Revenue",
          value: `${money.format(highValueSegment.revenue)} ₫`,
          relationship: percent.format(highValueSegment.revenueShare),
        },
        {
          metric: "Share Difference",
          value: `${shareGap.toFixed(1)} pp`,
          relationship: "Revenue share minus customer share",
        },
      ],
    },
  ];
  return items
    .map((item) => ({ ...item, severity: severity(item.priority) }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);
}

export const recommendations = generateRecommendations();
