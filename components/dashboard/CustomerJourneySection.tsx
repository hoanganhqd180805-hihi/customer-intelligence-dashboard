"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { JourneyNodeData } from "@/data/contracts/dashboard";
import {
  journeyLinks,
  journeyNodes,
  journeyPlatformTrafficTotals,
  journeyStages,
} from "@/data/fixtures/journey.fixture";
import { getActiveJourneyGraph } from "@/lib/journey/graph";
import {
  getJourneyNodeBodyGeometry,
  getJourneyStageX,
  layoutJourney,
} from "@/lib/journey/layout";
import {
  announceAnalyticalTooltip,
  subscribeToOtherAnalyticalTooltips,
} from "@/lib/interaction/analytical-tooltip";
import {
  DateRangePill,
  type DateRangeValue,
} from "@/components/ui/DateRangePill";

interface NodeBreakdownItem {
  id: string;
  label: string;
  value: number;
  share?: number;
  conversionRate?: number;
}
interface NodeBreakdownSection {
  kind: "share" | "conversion";
  title: string;
  total: number;
  items: NodeBreakdownItem[];
}
interface NodeBreakdown extends NodeBreakdownSection {
  unit: string;
  secondary?: NodeBreakdownSection;
}
type NodeDetailPlacement = "right" | "left" | "below" | "above";
interface NodeAnchorRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}
interface NodeDetailState {
  node: JourneyNodeData;
  breakdown: NodeBreakdown;
  anchor: NodeAnchorRect;
  placement: NodeDetailPlacement;
  width: number;
  x: number;
  y: number;
}
type JourneyMetricKind = "conversion" | "dropoff";
interface JourneyStepMetricSource {
  step: string;
  sourceStage: string;
  targetStage: string;
  currentConversionRate: number;
  conversionChange: number;
}
interface JourneyStepMetric extends JourneyStepMetricSource {
  currentDropoffRate: number;
  dropoffChange: number;
}
const numberFormat = new Intl.NumberFormat("en-US");
const percentageFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});
const sourceNode = (label: string) =>
  journeyNodes.find((node) => node.label === label)!;
const sourceLink = (source: string, target: string) =>
  journeyLinks.find(
    (link) =>
      link.source === sourceNode(source).id &&
      link.target === sourceNode(target).id,
  );
const stageNodeTotal = (stage: string) =>
  journeyNodes
    .filter((node) => node.stage === stage)
    .reduce((sum, node) => sum + node.value, 0);
const stageLinkTotal = (sourceStage: string, targetStage: string) => {
  const sourceIds = new Set(
      journeyNodes
        .filter((node) => node.stage === sourceStage)
        .map((node) => node.id),
    ),
    targetIds = new Set(
      journeyNodes
        .filter((node) => node.stage === targetStage)
        .map((node) => node.id),
    );
  return journeyLinks
    .filter((link) => sourceIds.has(link.source) && targetIds.has(link.target))
    .reduce((sum, link) => sum + link.value, 0);
};
const calculateConversionRate = (numerator: number, denominator: number) =>
  denominator > 0 ? (numerator / denominator) * 100 : 0;
const linkRatePercent = (source: string, target: string) => {
  const link = sourceLink(source, target);
  if (!link || link.metric !== "conversion_rate") return null;
  return link.rate === null || link.rate === undefined
    ? calculateConversionRate(link.value, sourceNode(source).value)
    : link.rate * 100;
};
const formatRate = (rate: number) => percentageFormat.format(rate / 100);
const deriveJourneyStepMetric = (
  source: JourneyStepMetricSource,
): JourneyStepMetric => ({
  ...source,
  currentDropoffRate: 100 - source.currentConversionRate,
  dropoffChange: -source.conversionChange,
});
const stageVolumeConversionRate = (
  sourceStage: string,
  targetStage: string,
) => {
  const sourceIds = new Set(
    journeyNodes
      .filter((node) => node.stage === sourceStage)
      .map((node) => node.id),
  );
  const targetIds = new Set(
    journeyNodes
      .filter((node) => node.stage === targetStage)
      .map((node) => node.id),
  );
  const links = journeyLinks.filter(
    (link) => sourceIds.has(link.source) && targetIds.has(link.target),
  );
  if (!links.length) return null;
  return calculateConversionRate(
    stageLinkTotal(sourceStage, targetStage),
    stageNodeTotal(sourceStage),
  );
};
const candidateJourneyStepSources: Array<
  Omit<JourneyStepMetricSource, "currentConversionRate"> & {
    currentConversionRate: number | null;
  }
> = [
  {
    step: "Platform → Content",
    sourceStage: "MARKETPLACE",
    targetStage: "CONTENT / ENTRY DRIVER",
    currentConversionRate: stageVolumeConversionRate(
      "MARKETPLACE",
      "CONTENT / ENTRY DRIVER",
    ),
    conversionChange: 3.2,
  },
  {
    step: "Content → Product View",
    sourceStage: "CONTENT / ENTRY DRIVER",
    targetStage: "PRODUCT VIEW",
    currentConversionRate: stageVolumeConversionRate(
      "CONTENT / ENTRY DRIVER",
      "PRODUCT VIEW",
    ),
    conversionChange: -1.8,
  },
  {
    step: "Product View → Add to Cart",
    sourceStage: "PRODUCT VIEW",
    targetStage: "ADD TO CART",
    currentConversionRate: linkRatePercent("Product View", "Add to Cart"),
    conversionChange: 2.4,
  },
  {
    step: "Add to Cart → Order",
    sourceStage: "ADD TO CART",
    targetStage: "ORDER",
    currentConversionRate: linkRatePercent("Add to Cart", "Order"),
    conversionChange: -0.9,
  },
  {
    step: "Order → Complete",
    sourceStage: "ORDER",
    targetStage: "ORDER RESULT",
    currentConversionRate: linkRatePercent("Order", "Complete"),
    conversionChange: 1.6,
  },
];
const journeyStepSources: JourneyStepMetricSource[] =
  candidateJourneyStepSources.flatMap((metric) =>
    metric.currentConversionRate === null
      ? []
      : [{ ...metric, currentConversionRate: metric.currentConversionRate }],
  );
const journeyStepMetrics = journeyStepSources.map(deriveJourneyStepMetric);
const biggestCurrentDropoffRate = Math.max(
  ...journeyStepMetrics.map((metric) => metric.currentDropoffRate),
);
const journeyMetricGridClass =
  "grid grid-cols-2 gap-2 @[600px]:grid-cols-3 @[1000px]:ml-[22.21%] @[1000px]:mr-[7.97%] @[1000px]:grid-cols-[254fr_254fr_286fr_222fr_254fr] @[1000px]:gap-2";
const hiddenStages = new Set(["POST-PURCHASE"]);
const visibleStages = journeyStages.filter((stage) => !hiddenStages.has(stage));
const visibleNodes = journeyNodes.filter(
  (node) => !hiddenStages.has(node.stage),
);
const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
const visibleLinks = journeyLinks.filter(
  (link) => visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target),
);
const labelsByStage = (stage: string) =>
  journeyNodes.filter((node) => node.stage === stage).map((node) => node.label);
const stageDisplayLabel = (stage: string) =>
  stage === "MARKETPLACE"
    ? "PLATFORM"
    : stage === "CONTENT / ENTRY DRIVER"
      ? "CONTENT"
      : stage;
const createIncomingBreakdown = (
  targetLabel: string,
  title: string,
  unit: string,
  sourceLabels: string[],
): NodeBreakdown => {
  const target = sourceNode(targetLabel),
    items = sourceLabels
      .map((label) => {
        const source = sourceNode(label);
        const link = journeyLinks.find(
          (candidate) =>
            candidate.source === source.id && candidate.target === target.id,
        );
        return {
          id: source.id,
          label: source.label,
          value: link?.value ?? 0,
          share:
            (link?.metric === "contribution_share" ||
              link?.metric === "distribution_share") &&
            typeof link.rate === "number"
              ? link.rate * 100
              : undefined,
        };
      })
      .sort((a, b) => b.value - a.value),
    total = items.reduce((sum, item) => sum + item.value, 0);
  return { kind: "share", title, total, unit, items };
};
const createOutgoingBreakdown = (
  sourceLabel: string,
  title: string,
  unit: string,
  targetLabels: string[],
): NodeBreakdown => {
  const source = sourceNode(sourceLabel),
    items = targetLabels
      .map((label) => {
        const target = sourceNode(label);
        return {
          id: target.id,
          label: target.label,
          value:
            journeyLinks.find(
              (link) => link.source === source.id && link.target === target.id,
            )?.value ?? 0,
        };
      })
      .sort((a, b) => b.value - a.value),
    total = items.reduce((sum, item) => sum + item.value, 0);
  return { kind: "share", title, total, unit, items };
};
const createConversionBreakdown = (
  targetLabel: string,
  unit: string,
  transitions: Array<{
    id: string;
    label: string;
    converted: number;
    eligible: number;
    rate?: number | null;
  }>,
): NodeBreakdown => ({
  kind: "conversion",
  title: `Conversion Rate to ${targetLabel}`,
  total: sourceNode(targetLabel).value,
  unit,
  items: transitions
    .map((transition) => ({
      id: transition.id,
      label: transition.label,
      value: transition.converted,
      conversionRate:
        typeof transition.rate === "number"
          ? transition.rate * 100
          : calculateConversionRate(transition.converted, transition.eligible),
    }))
    .sort((a, b) => (b.conversionRate ?? 0) - (a.conversionRate ?? 0)),
});
const createDirectIncomingConversionBreakdown = (
  targetLabel: string,
  unit: string,
): NodeBreakdown => {
  const target = sourceNode(targetLabel);
  return createConversionBreakdown(
    targetLabel,
    unit,
    journeyLinks
      .filter((link) => link.target === target.id)
      .map((link) => {
        const source = journeyNodes.find((node) => node.id === link.source)!;
        return {
          id: link.id,
          label: `${source.label} → ${target.label}`,
          converted: link.value,
          eligible: source.value,
          rate: link.rate,
        };
      }),
  );
};
const createDirectOutgoingConversionSection = (
  sourceLabel: string,
  title: string,
): NodeBreakdownSection => {
  const source = sourceNode(sourceLabel),
    items = journeyLinks
      .filter((link) => link.source === source.id)
      .map((link) => {
        const target = journeyNodes.find((node) => node.id === link.target)!;
        return {
          id: link.id,
          label: target.label,
          value: link.value,
          conversionRate:
            typeof link.rate === "number"
              ? link.rate * 100
              : calculateConversionRate(link.value, source.value),
        };
      })
      .sort((a, b) => (b.conversionRate ?? 0) - (a.conversionRate ?? 0));
  return {
    kind: "conversion",
    title,
    total: source.value,
    items,
  };
};
const contentNodeLabels = labelsByStage("CONTENT / ENTRY DRIVER");
const nodeBreakdownEntries: Array<[string, NodeBreakdown]> = [];
for (const externalSource of labelsByStage("EXTERNAL SOURCE")) {
  nodeBreakdownEntries.push([
    sourceNode(externalSource).id,
    createOutgoingBreakdown(
      externalSource,
      "Platform Distribution",
      "traffic",
      labelsByStage("MARKETPLACE"),
    ),
  ]);
}
for (const marketplace of labelsByStage("MARKETPLACE")) {
  const traffic = journeyPlatformTrafficTotals.find(
    (item) => item.platform === marketplace,
  )!;
  const externalBreakdown = createIncomingBreakdown(
    marketplace,
    "External Source Contribution",
    "traffic",
    labelsByStage("EXTERNAL SOURCE"),
  );
  nodeBreakdownEntries.push([
    sourceNode(marketplace).id,
    {
      kind: "share",
      title: "Traffic Source",
      total: traffic.totalTraffic,
      unit: "total traffic",
      items: [
        {
          id: `${sourceNode(marketplace).id}-external`,
          label: "External Sources",
          value: traffic.externalTraffic,
        },
        {
          id: `${sourceNode(marketplace).id}-direct`,
          label: "Direct Platform",
          value: traffic.directTraffic,
        },
      ],
      secondary: externalBreakdown,
    },
  ]);
}
for (const content of contentNodeLabels) {
  nodeBreakdownEntries.push([
    sourceNode(content).id,
    createIncomingBreakdown(
      content,
      "Platform Distribution",
      "traffic",
      labelsByStage("MARKETPLACE"),
    ),
  ]);
}
nodeBreakdownEntries.push(
  [
    sourceNode("Product View").id,
    createDirectIncomingConversionBreakdown("Product View", "views"),
  ],
  [
    sourceNode("Add to Cart").id,
    createDirectIncomingConversionBreakdown("Add to Cart", "actions"),
  ],
  [
    sourceNode("Order").id,
    createDirectIncomingConversionBreakdown("Order", "orders"),
  ],
  [
    sourceNode("Complete").id,
    {
      ...createDirectIncomingConversionBreakdown(
        "Complete",
        "completed orders",
      ),
      title: "Conversion Rate",
      secondary: createDirectOutgoingConversionSection(
        "Complete",
        "Post-purchase",
      ),
    },
  ],
  [
    sourceNode("Cancel").id,
    {
      ...createDirectIncomingConversionBreakdown("Cancel", "cancelled orders"),
      title: "Order Result Rate",
    },
  ],
  [
    sourceNode("Processing").id,
    {
      ...createDirectIncomingConversionBreakdown(
        "Processing",
        "processing orders",
      ),
      title: "Order Result Rate",
    },
  ],
);
const nodeBreakdowns = new Map(nodeBreakdownEntries);
const detailNodeIds = new Set(nodeBreakdowns.keys());
const getBreakdownSections = (
  breakdown: NodeBreakdown,
): NodeBreakdownSection[] => [
  breakdown,
  ...(breakdown.secondary ? [breakdown.secondary] : []),
];

const snapshotRect = (rect: DOMRect): NodeAnchorRect => ({
  left: rect.left,
  right: rect.right,
  top: rect.top,
  bottom: rect.bottom,
  width: rect.width,
  height: rect.height,
});
const getNodeDetailWidth = (
  breakdown: NodeBreakdown,
  containerWidth: number,
) => {
  const itemCount =
      breakdown.items.length + (breakdown.secondary?.items.length ?? 0),
    preferredWidth = itemCount <= 1 ? 260 : itemCount <= 2 ? 290 : 340;
  return Math.max(220, Math.min(preferredWidth, containerWidth - 28));
};
const estimateNodeDetailHeight = (breakdown: NodeBreakdown) => {
  const sections = getBreakdownSections(breakdown),
    itemCount = sections.reduce(
      (total, section) => total + section.items.length,
      0,
    );
  return 58 + sections.length * 25 + itemCount * 22;
};
const preferredPlacements = (node: JourneyNodeData): NodeDetailPlacement[] => {
  if (node.stage === "ORDER" || node.stage === "ORDER RESULT")
    return ["left", "right", "below", "above"];
  if (node.stage === "ADD TO CART") return ["below", "above", "right", "left"];
  if (node.stage === "PRODUCT VIEW") return ["right", "below", "left", "above"];
  return ["right", "left", "below", "above"];
};
const positionNodeDetail = (
  node: JourneyNodeData,
  anchor: NodeAnchorRect,
  container: DOMRect,
  width: number,
  height: number,
) => {
  const gap = 16,
    pad = 14,
    anchorLeft = anchor.left - container.left,
    anchorRight = anchor.right - container.left,
    anchorTop = anchor.top - container.top,
    anchorBottom = anchor.bottom - container.top,
    anchorCenterX = anchorLeft + anchor.width / 2,
    anchorCenterY = anchorTop + anchor.height / 2,
    candidates: Record<NodeDetailPlacement, { x: number; y: number }> = {
      right: {
        x: anchorRight + gap,
        y: anchorCenterY - height / 2,
      },
      left: {
        x: anchorLeft - width - gap,
        y: anchorCenterY - height / 2,
      },
      below: {
        x: anchorCenterX - width / 2,
        y: anchorBottom + gap,
      },
      above: {
        x: anchorCenterX - width / 2,
        y: anchorTop - height - gap,
      },
    },
    fits = ({ x, y }: { x: number; y: number }) =>
      x >= pad &&
      y >= pad &&
      x + width <= container.width - pad &&
      y + height <= container.height - pad,
    placement =
      preferredPlacements(node).find((candidate) =>
        fits(candidates[candidate]),
      ) ?? preferredPlacements(node)[0],
    candidate = candidates[placement],
    maxX = Math.max(pad, container.width - width - pad),
    maxY = Math.max(pad, container.height - height - pad);
  return {
    placement,
    x: Math.max(pad, Math.min(candidate.x, maxX)),
    y: Math.max(pad, Math.min(candidate.y, maxY)),
  };
};

interface JourneyMetricCardProps {
  metric: JourneyStepMetric;
  kind: JourneyMetricKind;
  isBiggestDropoff?: boolean;
}
function JourneyMetricCard({
  metric,
  kind,
  isBiggestDropoff = false,
}: JourneyMetricCardProps) {
  const currentRate =
    kind === "conversion"
      ? metric.currentConversionRate
      : metric.currentDropoffRate;
  const change =
    kind === "conversion" ? metric.conversionChange : metric.dropoffChange;
  const previousRate = currentRate - change;
  const improving = kind === "conversion" ? change > 0 : change < 0;
  const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
  const trendColor =
    change === 0
      ? "text-[#9aa3c9]"
      : improving
        ? "text-[#58d3b2]"
        : "text-[#ff8f89]";
  const cardTone =
    kind === "conversion"
      ? "border-[#86eae9]/45 bg-white/[.04]"
      : isBiggestDropoff
        ? "border-[#ff8f89]/70 bg-[#ff8f89]/[.12]"
        : "border-[#ff8f89]/45 bg-white/[.04]";

  return (
    <div
      className={`relative flex h-[80px] min-w-0 flex-col items-center justify-center rounded-[12px] border px-2.5 py-1.5 text-center ${cardTone}`}
    >
      {isBiggestDropoff && (
        <span className="absolute right-1 top-1 rounded-full border border-[#ff8f89]/35 bg-[#ff8f89]/[.06] px-1 py-[1px] text-[7px] font-semibold uppercase leading-none tracking-[.04em] text-[#ff8f89]">
          Biggest drop-off
        </span>
      )}
      <p className="w-full text-center text-[10.5px] font-medium leading-tight text-[#9aa3c9]">
        {metric.step}
      </p>
      <div className="mt-1.5 flex items-center justify-center gap-1.5">
        <strong className="text-[20.4px] leading-none text-[#eef1fb]">
          {formatRate(currentRate)}
        </strong>
        <button
          type="button"
          className={`group relative cursor-default rounded-sm text-[15px] font-bold leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#86eae9] ${trendColor}`}
          aria-label={`${Math.abs(change).toFixed(1)} percentage points ${change > 0 ? "up" : change < 0 ? "down" : "unchanged"}`}
        >
          {arrow}
          <span
            role="tooltip"
            className={`invisible absolute left-1/2 z-40 w-[190px] -translate-x-1/2 rounded-[10px] border border-[#86eae9]/20 bg-[#070a1b]/[.98] p-2.5 text-left text-[10px] font-normal leading-normal text-[#9aa3c9] opacity-0 shadow-2xl transition-opacity group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 motion-reduce:transition-none ${kind === "conversion" ? "bottom-full mb-2" : "top-full mt-2"}`}
          >
            <strong className="mb-1.5 block font-semibold text-[#dce5ff]">
              Compared with previous period
            </strong>
            <span className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
              <span>Current period</span>
              <strong className="text-[#eef1fb]">
                {formatRate(currentRate)}
              </strong>
              <span>Previous period</span>
              <strong className="text-[#eef1fb]">
                {formatRate(previousRate)}
              </strong>
              <span>{change > 0 ? "Increase" : change < 0 ? "Decrease" : "Change"}</span>
              <strong className={trendColor}>
                {arrow} {Math.abs(change).toFixed(1)} pp
              </strong>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

export function CustomerJourneySection() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    startDate: "2026-05-01",
    endDate: "2026-05-17",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [nodeDetail, setNodeDetail] = useState<NodeDetailState | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const nodeDetailPopoverRef = useRef<HTMLDivElement>(null);
  const nodeDetailHideTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const layout = useMemo(
    () => layoutJourney(visibleNodes, visibleLinks, visibleStages),
    [],
  );
  const nodeMap = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout],
  );
  const focusId = selectedId ?? hoveredId;
  const active = useMemo(
    () =>
      focusId
        ? getActiveJourneyGraph(focusId, visibleNodes, visibleLinks)
        : null,
    [focusId],
  );
  const cancelNodeDetailHide = () => {
    if (!nodeDetailHideTimer.current) return;
    clearTimeout(nodeDetailHideTimer.current);
    nodeDetailHideTimer.current = null;
  };
  const scheduleNodeDetailHide = () => {
    cancelNodeDetailHide();
    nodeDetailHideTimer.current = setTimeout(() => {
      setNodeDetail(null);
      setHoveredId(null);
    }, 200);
  };
  const openNodeDetail = (node: JourneyNodeData, nodeElement: SVGGElement) => {
    const breakdown = nodeBreakdowns.get(node.id),
      section = sectionRef.current;
    if (!breakdown || !section) return;
    announceAnalyticalTooltip("customer-journey");
    const anchor = snapshotRect(nodeElement.getBoundingClientRect()),
      container = section.getBoundingClientRect(),
      width = getNodeDetailWidth(breakdown, container.width),
      initialPosition = positionNodeDetail(
        node,
        anchor,
        container,
        width,
        estimateNodeDetailHeight(breakdown),
      );
    cancelNodeDetailHide();
    if (window.matchMedia("(hover: hover)").matches) setSelectedId(null);
    setHoveredId(node.id);
    setNodeDetail({
      node,
      breakdown,
      anchor,
      width,
      ...initialPosition,
    });
  };
  useLayoutEffect(() => {
    const popover = nodeDetailPopoverRef.current,
      section = sectionRef.current;
    if (!nodeDetail || !popover || !section) return;
    const nextPosition = positionNodeDetail(
      nodeDetail.node,
      nodeDetail.anchor,
      section.getBoundingClientRect(),
      popover.offsetWidth,
      popover.offsetHeight,
    );
    if (
      nextPosition.x === nodeDetail.x &&
      nextPosition.y === nodeDetail.y &&
      nextPosition.placement === nodeDetail.placement
    )
      return;
    setNodeDetail((current) =>
      current?.node.id === nodeDetail.node.id
        ? { ...current, ...nextPosition }
        : current,
    );
  }, [nodeDetail]);
  useEffect(() => {
    return subscribeToOtherAnalyticalTooltips("customer-journey", () => {
      cancelNodeDetailHide();
      setNodeDetail(null);
      setSelectedId(null);
      setHoveredId(null);
    });
  }, []);
  useEffect(() => {
    const closeNodeDetail = (event: PointerEvent) => {
      const target = event.target as Element;
      if (nodeDetailPopoverRef.current?.contains(target)) return;
      if (target.closest('[data-node-detail-trigger="true"]')) return;
      setNodeDetail(null);
      setSelectedId(null);
      setHoveredId(null);
    };
    document.addEventListener("pointerdown", closeNodeDetail);
    return () => {
      cancelNodeDetailHide();
      document.removeEventListener("pointerdown", closeNodeDetail);
    };
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <section className="min-w-0">
      <header className="mb-4 flex flex-col items-start gap-3">
        <h2 className="text-[21px] font-medium leading-tight text-[#111]">
          02. Customer Journey
        </h2>
        <div className="grid gap-1">
          <span className="text-[12.5px] font-medium text-[#747d8b]">
            Time Range
          </span>
          <DateRangePill
            value={dateRange}
            onChange={setDateRange}
            minDate="2026-05-01"
            maxDate="2026-05-17"
          />
        </div>
      </header>
      <div
        ref={sectionRef}
        className="relative isolate @container rounded-[24px] border border-[#1c2350] bg-[radial-gradient(1200px_500px_at_15%_-10%,rgba(74,153,210,.18),transparent_60%),radial-gradient(1000px_480px_at_90%_110%,rgba(134,234,233,.12),transparent_60%),linear-gradient(180deg,#0a0f2b,#050714)] p-5 text-[#eef1fb] shadow-[0_22px_60px_rgba(9,14,42,.18)]"
      >
        <div className="relative mt-2.5">
          <span className="mb-1.5 flex items-center justify-center whitespace-nowrap text-center text-[21px] font-semibold leading-none tracking-[.09em] text-[#86eae9] @[1000px]:absolute @[1000px]:inset-y-0 @[1000px]:left-0 @[1000px]:mb-0 @[1000px]:w-[16%]">
            <span>CONVERSION RATE</span>
          </span>
          <div className={journeyMetricGridClass}>
            {journeyStepMetrics.map((metric) => (
              <div
                key={metric.step}
                className="min-w-0"
              >
                <JourneyMetricCard metric={metric} kind="conversion" />
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-1.5 overflow-hidden rounded-[18px]">
          {selectedId && (
            <div className="absolute right-3 top-[9px] z-10 flex items-center gap-2 rounded-[10px] border border-[#86eae9]/25 bg-[#070a1b]/90 px-[9px] py-[7px] text-[11px] text-[#c9d4f5] backdrop-blur">
              <span>
                Showing the full journey through:{" "}
                {nodeMap.get(selectedId)?.label}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setNodeDetail(null);
                }}
                className="cursor-pointer font-semibold text-[#86eae9] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#86eae9]"
              >
                Reset
              </button>
            </div>
          )}
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            preserveAspectRatio="xMidYMid meet"
            aria-label="Customer journey chart"
            className="block w-full touch-manipulation"
          >
            <defs>
              <filter
                id="journeyGlow"
                x="-200%"
                y="-200%"
                width="500%"
                height="500%"
              >
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="journeySoftGlow"
                x="-200%"
                y="-200%"
                width="500%"
                height="500%"
              >
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {layout.links.map((link) => {
                const source = nodeMap.get(link.source)!,
                  target = nodeMap.get(link.target)!;
                return (
                  <linearGradient
                    key={link.id}
                    id={`journey-gradient-${link.id}`}
                  >
                    <stop stopColor={source.color} stopOpacity=".62" />
                    <stop
                      offset="100%"
                      stopColor={target.color}
                      stopOpacity=".62"
                    />
                  </linearGradient>
                );
              })}
            </defs>
            {Array.from({ length: 58 }, (_, index) => (
              <circle
                key={index}
                cx={(index * 347) % layout.width}
                cy={(index * 173) % layout.height}
                r={0.6 + (index % 3) * 0.35}
                fill="#fff"
                opacity={0.05 + (index % 5) * 0.035}
              />
            ))}
            {visibleStages.map((stage, index) => {
              const x = getJourneyStageX(stage, index, visibleStages.length);
              return (
                <g key={stage}>
                  <text
                    x={x}
                    y="16"
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="700"
                    letterSpacing="1.5"
                    fill="#99a7cf"
                  >
                    {stageDisplayLabel(stage)}
                  </text>
                  <line
                    x1={x - 34}
                    y1="23"
                    x2={x + 34}
                    y2="23"
                    stroke="#303966"
                  />
                </g>
              );
            })}
            {layout.links.map((link, linkIndex) => {
              const emphasized = !active || active.linkIds.has(link.id),
                particleCount =
                  link.thickness >= 12 ? 3 : link.thickness >= 3 ? 2 : 1,
                particleDuration = 5 + (linkIndex % 4),
                particleRadius =
                  particleCount === 3
                    ? 1.75
                    : particleCount === 2
                      ? 1.55
                      : 1.25;
              return (
                <g
                  key={link.id}
                  opacity={emphasized ? 0.92 : 0.035}
                  style={{ transition: "opacity .25s ease" }}
                >
                  <path
                    d={link.path}
                    fill={`url(#journey-gradient-${link.id})`}
                    style={{
                      filter:
                        active && emphasized ? "url(#journeySoftGlow)" : "none",
                    }}
                  />
                  {!reducedMotion &&
                    Array.from(
                      { length: particleCount },
                      (_, particleIndex) => (
                        <circle
                          key={particleIndex}
                          r={particleRadius}
                          fill={nodeMap.get(link.source)!.color}
                          opacity={emphasized ? 0.58 : 0}
                          style={{
                            filter: `drop-shadow(0 0 2.5px ${nodeMap.get(link.source)!.color})`,
                            transition: "opacity .25s ease",
                          }}
                        >
                          <animateMotion
                            path={link.centerline}
                            dur={`${particleDuration}s`}
                            begin={`${(particleIndex * particleDuration) / particleCount}s`}
                            calcMode="linear"
                            repeatCount="indefinite"
                          />
                        </circle>
                      ),
                    )}
                </g>
              );
            })}
            {layout.nodes.map((node) => {
              const emphasized = !active || active.nodeIds.has(node.id),
                selected = selectedId === node.id,
                hasDetail = detailNodeIds.has(node.id),
                detailActive = nodeDetail?.node.id === node.id,
                nodeBody = getJourneyNodeBodyGeometry(node, layout.links);
              return (
                <g
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.label} ${numberFormat.format(node.value)}`}
                  aria-pressed={selected}
                  aria-expanded={hasDetail ? detailActive : undefined}
                  data-node-detail-trigger={hasDetail ? "true" : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!window.matchMedia("(hover: none)").matches) return;
                    if (selectedId === node.id) {
                      setSelectedId(null);
                      setHoveredId(null);
                      setNodeDetail(null);
                      return;
                    }
                    if (hasDetail) openNodeDetail(node, event.currentTarget);
                    setSelectedId(node.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (selectedId === node.id) {
                        setSelectedId(null);
                        setHoveredId(null);
                        setNodeDetail(null);
                      } else {
                        if (hasDetail)
                          openNodeDetail(node, event.currentTarget);
                        setSelectedId(node.id);
                      }
                    }
                  }}
                  onMouseEnter={(event) => {
                    if (hasDetail) openNodeDetail(node, event.currentTarget);
                    else if (!selectedId) setHoveredId(node.id);
                  }}
                  onMouseLeave={() => {
                    if (hasDetail) scheduleNodeDetailHide();
                    else if (!selectedId) setHoveredId(null);
                  }}
                  onFocus={(event) => {
                    if (hasDetail) openNodeDetail(node, event.currentTarget);
                    else if (!selectedId) setHoveredId(node.id);
                  }}
                  onBlur={() => {
                    if (hasDetail) scheduleNodeDetailHide();
                    else if (!selectedId) setHoveredId(null);
                  }}
                  opacity={emphasized ? 1 : 0.14}
                  className="cursor-default focus-visible:outline-none"
                  style={{ transition: "opacity .24s ease" }}
                >
                  <rect
                    x={node.x - 31}
                    y={nodeBody.cy - 23}
                    width="118"
                    height="46"
                    rx="10"
                    fill="transparent"
                  />
                  <rect
                    data-journey-node-body={node.id}
                    x={node.x - 3}
                    y={nodeBody.y}
                    width="6"
                    height={nodeBody.height}
                    rx="3"
                    fill={node.color}
                    style={{
                      filter: `drop-shadow(0 0 ${detailActive ? 14 : emphasized ? 10 : 6}px ${node.color})`,
                    }}
                  />
                  <circle
                    cx={node.x - 22}
                    cy={nodeBody.cy}
                    r="11"
                    fill="#0a1024"
                    stroke={node.color}
                    strokeWidth={selected || detailActive ? 3.2 : 2}
                    filter="url(#journeyGlow)"
                  />
                  <text
                    x={node.x - 22}
                    y={nodeBody.cy + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill={node.color}
                  >
                    {node.label[0]}
                  </text>
                  <text
                    x={node.x + 12}
                    y={nodeBody.cy - 3}
                    fontSize="12.5"
                    fontWeight="700"
                    fill="#eef1f8"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x + 12}
                    y={nodeBody.cy + 13}
                    fontSize="11"
                    fill="#7d8aa8"
                  >
                    {numberFormat.format(node.value)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="relative mt-2">
          <span className="mb-1.5 flex items-center justify-center whitespace-nowrap text-center text-[21px] font-semibold leading-none tracking-[.09em] text-[#ff8f89] @[1000px]:absolute @[1000px]:inset-y-0 @[1000px]:left-0 @[1000px]:mb-0 @[1000px]:w-[16%]">
            <span>DROP-OFF RATE</span>
          </span>
          <div className={journeyMetricGridClass}>
            {journeyStepMetrics.map((metric) => (
              <div
                key={metric.step}
                className="min-w-0"
              >
                <JourneyMetricCard
                  metric={metric}
                  kind="dropoff"
                  isBiggestDropoff={
                    metric.currentDropoffRate === biggestCurrentDropoffRate
                  }
                />
              </div>
            ))}
          </div>
        </div>
        {nodeDetail && (
          <div
            ref={nodeDetailPopoverRef}
            role="tooltip"
            aria-label={`${nodeDetail.node.label} ${nodeDetail.breakdown.title.toLowerCase()}`}
            data-placement={nodeDetail.placement}
            className="absolute z-[1000] rounded-[12px] border border-[#86eae9]/25 bg-[#070a1b]/95 px-3 py-2.5 text-[11px] text-[#eef1fb] shadow-2xl backdrop-blur"
            style={{
              left: nodeDetail.x,
              top: nodeDetail.y,
              width: nodeDetail.width,
            }}
            onMouseEnter={cancelNodeDetailHide}
            onMouseLeave={scheduleNodeDetailHide}
          >
            <strong className="text-[13px] text-white">
              {nodeDetail.node.label}
            </strong>
            <p className="text-[#86eae9]">
              {numberFormat.format(nodeDetail.breakdown.total)}{" "}
              {nodeDetail.breakdown.unit}
            </p>
            {getBreakdownSections(nodeDetail.breakdown).map(
              (section, sectionIndex) => (
                <div
                  key={section.title}
                  className={
                    sectionIndex === 0
                      ? "mt-1.5 border-t border-white/[.09] pt-1.5"
                      : "mt-2 border-t border-white/[.09] pt-2"
                  }
                >
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.08em] text-[#9aa3c9]">
                    {section.title}
                  </p>
                  <div className="space-y-1.5">
                    {section.items.map((item) => {
                      const rate =
                          section.kind === "conversion"
                            ? (item.conversionRate ?? 0)
                            : (item.share ??
                              (section.total > 0
                                ? (item.value / section.total) * 100
                                : 0)),
                        boundedRate = Math.max(0, Math.min(rate, 100));
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-[minmax(0,1fr)_44px_80px] items-center gap-2"
                        >
                          <span className="truncate text-[#dce5ff]">
                            {item.label}
                          </span>
                          <strong className="text-right text-[#cfe9ff]">
                            {formatRate(rate)}
                          </strong>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                            <div
                              className="h-full rounded-full bg-[#86eae9]"
                              style={{ width: `${boundedRate}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}
