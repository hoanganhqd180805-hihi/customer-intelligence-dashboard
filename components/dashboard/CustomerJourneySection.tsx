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
  journeyStages,
} from "@/data/fixtures/journey.fixture";
import { journeyConversionWowByStep } from "@/data/fixtures/journey-comparison.fixture";
import { getActiveJourneyGraph } from "@/lib/journey/graph";
import { layoutJourney } from "@/lib/journey/layout";
import {
  announceAnalyticalTooltip,
  subscribeToOtherAnalyticalTooltips,
} from "@/lib/interaction/analytical-tooltip";

interface NodeBreakdownItem {
  id: string;
  label: string;
  value: number;
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
  currentConversionRate: number;
  conversionWow: number;
}
interface JourneyStepMetric extends JourneyStepMetricSource {
  previousConversionRate: number;
  currentDropoffRate: number;
  previousDropoffRate: number;
  dropoffWow: number;
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
  )!;
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
const formatRate = (rate: number) => percentageFormat.format(rate / 100);
const deriveJourneyStepMetric = (
  source: JourneyStepMetricSource,
): JourneyStepMetric => {
  const previousConversionRate =
      source.currentConversionRate - source.conversionWow,
    currentDropoffRate = 100 - source.currentConversionRate,
    previousDropoffRate = 100 - previousConversionRate,
    dropoffWow = currentDropoffRate - previousDropoffRate;
  return {
    ...source,
    previousConversionRate,
    currentDropoffRate,
    previousDropoffRate,
    dropoffWow,
  };
};
const platformTraffic = stageNodeTotal("MARKETPLACE");
const platformToContentFlow = stageLinkTotal(
  "MARKETPLACE",
  "CONTENT / ENTRY DRIVER",
);
const contentTraffic = stageNodeTotal("CONTENT / ENTRY DRIVER");
const contentToProductViewFlow = stageLinkTotal(
  "CONTENT / ENTRY DRIVER",
  "PRODUCT VIEW",
);
const transitionGridClass =
  "grid grid-cols-2 gap-2 @[600px]:grid-cols-3 @[1000px]:mx-[8.1%] @[1000px]:grid-cols-[305fr_305fr_337fr_273fr_305fr]";
// Demo-only comparison values, kept separate from the live conversion formulas.
const journeyStepSources: JourneyStepMetricSource[] = [
  {
    step: "Platform → Content",
    currentConversionRate: calculateConversionRate(
      platformToContentFlow,
      platformTraffic,
    ),
    conversionWow: journeyConversionWowByStep["Platform → Content"],
  },
  {
    step: "Content → Product View",
    currentConversionRate: calculateConversionRate(
      contentToProductViewFlow,
      contentTraffic,
    ),
    conversionWow: journeyConversionWowByStep["Content → Product View"],
  },
  {
    step: "Product View → Add to Cart",
    currentConversionRate: calculateConversionRate(
      sourceLink("Product View", "Add to Cart").value,
      sourceNode("Product View").value,
    ),
    conversionWow: journeyConversionWowByStep["Product View → Add to Cart"],
  },
  {
    step: "Add to Cart → Order",
    currentConversionRate: calculateConversionRate(
      sourceLink("Add to Cart", "Order").value,
      sourceNode("Add to Cart").value,
    ),
    conversionWow: journeyConversionWowByStep["Add to Cart → Order"],
  },
  {
    step: "Order → Complete",
    currentConversionRate: calculateConversionRate(
      sourceLink("Order", "Complete").value,
      sourceNode("Order").value,
    ),
    conversionWow: journeyConversionWowByStep["Order → Complete"],
  },
];
const journeyStepMetrics = journeyStepSources.map(deriveJourneyStepMetric);
const biggestCurrentDropoffRate = Math.max(
  ...journeyStepMetrics.map((metric) => metric.currentDropoffRate),
);
const hiddenStages = new Set(["EXTERNAL SOURCE", "POST-PURCHASE"]);
const visibleStages = journeyStages.filter((stage) => !hiddenStages.has(stage));
const visibleNodes = journeyNodes.filter(
  (node) => !hiddenStages.has(node.stage),
);
const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
const visibleLinks = journeyLinks.filter(
  (link) => visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target),
);
const labelsByStage = (stage: string) =>
  journeyNodes
    .filter((node) => node.stage === stage)
    .map((node) => node.label);
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
        return {
          id: source.id,
          label: source.label,
          value:
            journeyLinks.find(
              (link) =>
                link.source === source.id && link.target === target.id,
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
      conversionRate: calculateConversionRate(
        transition.converted,
        transition.eligible,
      ),
    }))
    .sort(
      (a, b) => (b.conversionRate ?? 0) - (a.conversionRate ?? 0),
    ),
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
          conversionRate: calculateConversionRate(link.value, source.value),
        };
      })
      .sort(
        (a, b) => (b.conversionRate ?? 0) - (a.conversionRate ?? 0),
      );
  return {
    kind: "conversion",
    title,
    total: source.value,
    items,
  };
};
const contentNodeLabels = labelsByStage("CONTENT / ENTRY DRIVER");
const nodeBreakdownEntries: Array<[string, NodeBreakdown]> = [];
for (const marketplace of labelsByStage("MARKETPLACE")) {
  nodeBreakdownEntries.push([
    sourceNode(marketplace).id,
    createIncomingBreakdown(
      marketplace,
      "External Traffic Sources",
      "traffic",
      labelsByStage("EXTERNAL SOURCE"),
    ),
  ]);
}
for (const content of contentNodeLabels) {
  nodeBreakdownEntries.push([
    sourceNode(content).id,
    createDirectIncomingConversionBreakdown(content, "traffic"),
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
      ...createDirectIncomingConversionBreakdown(
        "Cancel",
        "cancelled orders",
      ),
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
  if (node.stage === "ADD TO CART")
    return ["below", "above", "right", "left"];
  if (node.stage === "PRODUCT VIEW")
    return ["right", "below", "left", "above"];
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
      preferredPlacements(node).find((candidate) => fits(candidates[candidate])) ??
      preferredPlacements(node)[0],
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
  index: number;
  openKey: string | null;
  onOpen: (key: string) => void;
  onClose: () => void;
  onCancelClose: () => void;
  onTouchToggle: (key: string) => void;
  isBiggestDropoff?: boolean;
}

function JourneyMetricCard({
  metric,
  kind,
  index,
  openKey,
  onOpen,
  onClose,
  onCancelClose,
  onTouchToggle,
  isBiggestDropoff = false,
}: JourneyMetricCardProps) {
  const isConversion = kind === "conversion",
    currentRate = isConversion
      ? metric.currentConversionRate
      : metric.currentDropoffRate,
    previousRate = isConversion
      ? metric.previousConversionRate
      : metric.previousDropoffRate,
    change = isConversion ? metric.conversionWow : metric.dropoffWow,
    arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→",
    isPositive = isConversion ? change > 0 : change < 0,
    trendColor =
      change === 0
        ? "text-[#9aa3c9]"
        : isPositive
          ? "text-[#58d3b2]"
          : "text-[#ff8f89]",
    comparisonKey = `${kind}-${index}`,
    comparisonId = `journey-${comparisonKey}-comparison`,
    isOpen = openKey === comparisonKey;

  return (
    <div
      className={`relative flex h-[80px] min-w-0 flex-col items-center justify-center rounded-[12px] border bg-white/[.04] px-2.5 py-1.5 text-center ${isBiggestDropoff ? "border-[#ff8f89]/45" : "border-white/[.08]"}`}
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
          data-comparison-control="true"
          aria-label={`Compare ${metric.step} ${kind} with previous period`}
          aria-expanded={isOpen}
          aria-controls={comparisonId}
          onMouseEnter={() => onOpen(comparisonKey)}
          onMouseLeave={onClose}
          onFocus={() => onOpen(comparisonKey)}
          onBlur={onClose}
          onClick={() => {
            if (window.matchMedia("(hover: none)").matches)
              onTouchToggle(comparisonKey);
          }}
          className={`inline-flex h-5 w-5 shrink-0 cursor-default items-center justify-center rounded-full bg-white/[.04] text-[12px] font-bold leading-none opacity-80 transition hover:bg-white/[.1] hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#86eae9] ${trendColor}`}
        >
          <span aria-hidden="true">{arrow}</span>
        </button>
      </div>
      {isOpen && (
        <div
          id={comparisonId}
          data-comparison-popover="true"
          role="tooltip"
          aria-label={`${metric.step} ${kind} comparison`}
          className={`absolute left-1/2 z-30 w-[188px] -translate-x-1/2 rounded-[10px] border border-[#86eae9]/20 bg-[#070a1b]/[.98] p-2.5 text-left text-[10px] text-[#9aa3c9] shadow-2xl ${isConversion ? "bottom-full mb-2" : "top-full mt-2"}`}
          onMouseEnter={onCancelClose}
          onMouseLeave={onClose}
        >
          <p className="mb-1.5 font-semibold text-[#dce5ff]">
            Compared with previous period
          </p>
          <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
            <span>Current</span>
            <strong className="text-[#eef1fb]">{formatRate(currentRate)}</strong>
            <span>Previous</span>
            <strong className="text-[#eef1fb]">
              {formatRate(previousRate)}
            </strong>
            <span>Change</span>
            <strong className={trendColor}>
              {arrow} {Math.abs(change).toFixed(1)} pp
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomerJourneySection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [nodeDetail, setNodeDetail] = useState<NodeDetailState | null>(null);
  const [openComparison, setOpenComparison] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const nodeDetailPopoverRef = useRef<HTMLDivElement>(null);
  const nodeDetailHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comparisonHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const cancelComparisonHide = () => {
    if (!comparisonHideTimer.current) return;
    clearTimeout(comparisonHideTimer.current);
    comparisonHideTimer.current = null;
  };
  const scheduleComparisonHide = () => {
    cancelComparisonHide();
    comparisonHideTimer.current = setTimeout(
      () => setOpenComparison(null),
      180,
    );
  };
  const openComparisonDetail = (key: string) => {
    announceAnalyticalTooltip("customer-journey");
    cancelComparisonHide();
    cancelNodeDetailHide();
    setNodeDetail(null);
    setSelectedId(null);
    setHoveredId(null);
    setOpenComparison(key);
  };
  const toggleTouchComparison = (key: string) => {
    announceAnalyticalTooltip("customer-journey");
    cancelComparisonHide();
    setOpenComparison((current) => (current === key ? null : key));
  };
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
  const openNodeDetail = (
    node: JourneyNodeData,
    nodeElement: SVGGElement,
  ) => {
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
    cancelComparisonHide();
    setOpenComparison(null);
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
      cancelComparisonHide();
      setNodeDetail(null);
      setOpenComparison(null);
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
      cancelComparisonHide();
      document.removeEventListener("pointerdown", closeNodeDetail);
    };
  }, []);
  useEffect(() => {
    const closeComparison = (event: PointerEvent) => {
      const target = event.target as Element;
      if (target.closest('[data-comparison-control="true"]')) return;
      if (target.closest('[data-comparison-popover="true"]')) return;
      setOpenComparison(null);
    };
    document.addEventListener("pointerdown", closeComparison);
    return () => document.removeEventListener("pointerdown", closeComparison);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <section
      ref={sectionRef}
      className="relative isolate @container rounded-[24px] border border-[#1c2350] bg-[radial-gradient(1200px_500px_at_15%_-10%,rgba(74,153,210,.18),transparent_60%),radial-gradient(1000px_480px_at_90%_110%,rgba(134,234,233,.12),transparent_60%),linear-gradient(180deg,#0a0f2b,#050714)] p-5 text-[#eef1fb] shadow-[0_22px_60px_rgba(9,14,42,.18)]"
    >
      <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-[.14em] text-[#86eae9]">
        <span className="rounded-full bg-[#86eae9] px-2 py-1 text-[11px] text-[#04231f]">
          04
        </span>
        CUSTOMER JOURNEY
      </div>
      <div className="relative mt-2.5">
        <span className="mb-1.5 flex flex-col items-center text-center text-[9px] font-semibold leading-[1.15] tracking-[.11em] text-[#86eae9] @[1000px]:absolute @[1000px]:inset-y-0 @[1000px]:left-0 @[1000px]:mb-0 @[1000px]:w-[7.6%] @[1000px]:justify-center">
          <span>CONVERSION</span>
          <span>RATE</span>
        </span>
        <div className={transitionGridClass}>
          {journeyStepMetrics.map((metric, index) => (
            <JourneyMetricCard
              key={metric.step}
              metric={metric}
              kind="conversion"
              index={index}
              openKey={openComparison}
              onOpen={openComparisonDetail}
              onClose={scheduleComparisonHide}
              onCancelClose={cancelComparisonHide}
              onTouchToggle={toggleTouchComparison}
            />
          ))}
        </div>
      </div>
      <div className="relative mt-1.5 overflow-hidden rounded-[18px]">
        {selectedId && (
          <div className="absolute right-3 top-[9px] z-10 flex items-center gap-2 rounded-[10px] border border-[#86eae9]/25 bg-[#070a1b]/90 px-[9px] py-[7px] text-[11px] text-[#c9d4f5] backdrop-blur">
            <span>
              Showing the full journey through: {nodeMap.get(selectedId)?.label}
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
            const x =
              150 + ((1820 - 150 - 145) * index) / (visibleStages.length - 1);
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
                  {stage}
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
                particleCount === 3 ? 1.75 : particleCount === 2 ? 1.55 : 1.25;
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
                  Array.from({ length: particleCount }, (_, particleIndex) => (
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
                  ))}
              </g>
            );
          })}
          {layout.nodes.map((node) => {
            const emphasized = !active || active.nodeIds.has(node.id),
              selected = selectedId === node.id,
              hasDetail = detailNodeIds.has(node.id),
              detailActive = nodeDetail?.node.id === node.id;
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
                  y={node.cy - 23}
                  width="118"
                  height="46"
                  rx="10"
                  fill="transparent"
                />
                <rect
                  x={node.x - 3}
                  y={node.y0}
                  width="6"
                  height={node.h}
                  rx="3"
                  fill={node.color}
                  style={{
                    filter: `drop-shadow(0 0 ${detailActive ? 14 : emphasized ? 10 : 6}px ${node.color})`,
                  }}
                />
                <circle
                  cx={node.x - 22}
                  cy={node.cy}
                  r="11"
                  fill="#0a1024"
                  stroke={node.color}
                  strokeWidth={selected || detailActive ? 3.2 : 2}
                  filter="url(#journeyGlow)"
                />
                <text
                  x={node.x - 22}
                  y={node.cy + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={node.color}
                >
                  {node.label[0]}
                </text>
                <text
                  x={node.x + 12}
                  y={node.cy - 3}
                  fontSize="12.5"
                  fontWeight="700"
                  fill="#eef1f8"
                >
                  {node.label}
                </text>
                <text
                  x={node.x + 12}
                  y={node.cy + 13}
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
        <span className="mb-1.5 flex flex-col items-center text-center text-[9px] font-semibold leading-[1.15] tracking-[.11em] text-[#ff8f89] @[1000px]:absolute @[1000px]:inset-y-0 @[1000px]:left-0 @[1000px]:mb-0 @[1000px]:w-[7.6%] @[1000px]:justify-center">
          <span>DROP-OFF</span>
          <span>RATE</span>
        </span>
        <div className={transitionGridClass}>
          {journeyStepMetrics.map((metric, index) => (
            <JourneyMetricCard
              key={metric.step}
              metric={metric}
              kind="dropoff"
              index={index}
              openKey={openComparison}
              onOpen={openComparisonDetail}
              onClose={scheduleComparisonHide}
              onCancelClose={cancelComparisonHide}
              onTouchToggle={toggleTouchComparison}
              isBiggestDropoff={
                metric.currentDropoffRate === biggestCurrentDropoffRate
              }
            />
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
                          : section.total > 0
                            ? (item.value / section.total) * 100
                            : 0,
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
    </section>
  );
}
