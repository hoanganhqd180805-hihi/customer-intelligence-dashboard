"use client";

import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  CustomerSegmentationDataset,
  CustomerSegmentMetric,
} from "@/data/contracts/dashboard";
import { customerSegmentationDataset } from "@/data/fixtures/customer-segmentation-workbook.fixture";
import {
  customerSegmentDefinitionByKey,
  type CustomerSegmentDefinition,
} from "@/data/definitions/customer-segment-definitions";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DonutPercentageLabels } from "@/components/ui/DonutPercentageLabels";
import { SHARED_DONUT_GEOMETRY } from "@/components/ui/donutGeometry";
import {
  announceAnalyticalTooltip,
  subscribeToOtherAnalyticalTooltips,
} from "@/lib/interaction/analytical-tooltip";

type SegmentMode = "customers" | "revenue";
const countFormat = new Intl.NumberFormat("en-US");
const revenueFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});
const circumference = 2 * Math.PI * SHARED_DONUT_GEOMETRY.centerlineRadius;
const segmentName = (value: string) =>
  customerSegmentDefinitionByKey.get(value)?.displayName ?? value;

interface SegmentDefinitionPopoverState {
  definition: CustomerSegmentDefinition;
  placement: "above" | "below" | "right";
  width: number;
  x: number;
  y: number;
}

function positionSegmentDefinition(
  itemRect: DOMRect,
  containerRect: DOMRect,
  legendRect: DOMRect,
  donutRect: DOMRect,
  tooltipHeight: number,
) {
  const gap = 8,
    pad = 4,
    donutGap = 6,
    width = Math.min(200, containerRect.width - pad * 2),
    height = tooltipHeight,
    itemX = itemRect.left - containerRect.left,
    itemTop = itemRect.top - containerRect.top,
    itemBottom = itemRect.bottom - containerRect.top,
    itemRight = itemRect.right - containerRect.left,
    itemCenterY = itemTop + itemRect.height / 2,
    legendProgress =
      (itemRect.top + itemRect.height / 2 - legendRect.top) / legendRect.height,
    verticalPlacements: Array<"above" | "below"> =
      legendProgress < 0.34
        ? ["below", "above"]
        : legendProgress > 0.66
          ? ["above", "below"]
          : ["above", "below"],
    donutLeft = donutRect.left - containerRect.left - donutGap,
    donutRight = donutRect.right - containerRect.left + donutGap,
    donutTop = donutRect.top - containerRect.top - donutGap,
    donutBottom = donutRect.bottom - containerRect.top + donutGap;

  const clampX = (value: number) =>
    Math.max(pad, Math.min(value, containerRect.width - width - pad));
  const overlapsDonut = (x: number, y: number) => {
    return (
      x < donutRight &&
      x + width > donutLeft &&
      y < donutBottom &&
      y + height > donutTop
    );
  };

  for (const placement of verticalPlacements) {
    const y =
      placement === "above"
        ? itemTop - height - gap
        : itemBottom + gap;
    if (y < pad || y + height > containerRect.height - pad) continue;
    let x = clampX(itemX);
    if (overlapsDonut(x, y))
      x = clampX(donutRight);
    if (!overlapsDonut(x, y))
      return { placement, width, x, y } as const;
  }

  const rightX = clampX(itemRight + gap),
    rightY = Math.max(
      pad,
      Math.min(itemCenterY - height / 2, containerRect.height - height - pad),
    );
  if (!overlapsDonut(rightX, rightY))
    return {
      placement: "right" as const,
      width,
      x: rightX,
      y: rightY,
    };

  const fallbackBelow = donutBottom + gap,
    fallbackAbove = donutTop - height - gap,
    fallbackY =
      fallbackBelow + height <= containerRect.height - pad
        ? fallbackBelow
        : fallbackAbove >= pad
          ? fallbackAbove
          : Math.max(
              pad,
              Math.min(itemBottom + gap, containerRect.height - height - pad),
            );
  return {
    placement:
      fallbackY < itemTop ? ("above" as const) : ("below" as const),
    width,
    x: clampX(Math.max(itemX, donutRight)),
    y: fallbackY,
  };
}

function SegmentationDonut({
  data,
  mode,
  hovered,
  selected,
  onHover,
  onSelect,
}: {
  data: CustomerSegmentationDataset;
  mode: SegmentMode;
  hovered: string | null;
  selected: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}) {
  const arcs = data.segments.reduce<
    Array<{ segment: CustomerSegmentMetric; share: number; offset: number }>
  >((items, segment) => {
    const share =
        mode === "customers" ? segment.customerShare : segment.revenueShare,
      offset = items.reduce((sum, item) => sum + item.share, 0);
    return [...items, { segment, share, offset }];
  }, []);
  const activeId = selected ?? hovered;
  const active = data.segments.find((segment) => segment.id === activeId);
  return (
    <div
      data-segmentation-donut="true"
      className="relative h-[200px] w-[230px] max-w-full shrink-0"
      onClick={() => {
        if (window.matchMedia("(hover: none)").matches) onSelect(null);
      }}
    >
      <svg
        viewBox={`0 0 ${SHARED_DONUT_GEOMETRY.canvasWidth} ${SHARED_DONUT_GEOMETRY.canvasHeight}`}
        role="img"
        aria-label={
          mode === "customers"
            ? "Customer distribution by segment"
            : "Revenue contribution by segment"
        }
        className="h-full w-full overflow-visible"
      >
        <circle
          cx={SHARED_DONUT_GEOMETRY.centerX}
          cy={SHARED_DONUT_GEOMETRY.centerY}
          r={SHARED_DONUT_GEOMETRY.centerlineRadius}
          fill="none"
          stroke="#edf0f5"
          strokeWidth={SHARED_DONUT_GEOMETRY.ringThickness}
        />
        {arcs.map(({ segment, share, offset }) => {
          const dash = Math.max(0, share * circumference),
            dashOffset = -offset * circumference;
          return (
            <circle
              key={segment.id}
              cx={SHARED_DONUT_GEOMETRY.centerX}
              cy={SHARED_DONUT_GEOMETRY.centerY}
              r={SHARED_DONUT_GEOMETRY.centerlineRadius}
              fill="none"
              stroke={segment.color}
              strokeWidth={
                activeId === segment.id
                  ? SHARED_DONUT_GEOMETRY.activeRingThickness
                  : SHARED_DONUT_GEOMETRY.ringThickness
              }
              strokeDasharray={`${dash} ${Math.max(0, circumference - dash)}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${SHARED_DONUT_GEOMETRY.centerX} ${SHARED_DONUT_GEOMETRY.centerY})`}
              strokeLinecap="butt"
              className="cursor-default transition-[stroke-dasharray,stroke-dashoffset,stroke-width,opacity] duration-300 ease-out focus:outline-none motion-reduce:transition-none"
              opacity={activeId ? (activeId === segment.id ? 1 : 0.48) : 1}
              onMouseEnter={() => onHover(segment.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(segment.id)}
              onBlur={() => onHover(null)}
              tabIndex={0}
              role="button"
              aria-pressed={selected === segment.id}
              aria-label={
                mode === "customers"
                  ? `${segmentName(segment.segment)}: ${countFormat.format(segment.customerCount)} customers, ${percentFormat.format(segment.customerShare)}`
                  : `${segmentName(segment.segment)}: ${revenueFormat.format(segment.revenue)} ₫, ${percentFormat.format(segment.revenueShare)}`
              }
              onClick={(event) => {
                event.stopPropagation();
                if (window.matchMedia("(hover: none)").matches)
                  onSelect(selected === segment.id ? null : segment.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(selected === segment.id ? null : segment.id);
                }
              }}
            />
          );
        })}
        <DonutPercentageLabels
          data={arcs.map(({ segment, share }) => ({
            id: segment.id,
            share,
            color: segment.color,
          }))}
          cx={SHARED_DONUT_GEOMETRY.centerX}
          cy={SHARED_DONUT_GEOMETRY.centerY}
          radius={SHARED_DONUT_GEOMETRY.percentageLabelRadius}
          labelOffset={10}
          minimumShare={0.05}
          format={(share) => percentFormat.format(share)}
        />
      </svg>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center"
        style={{
          width: SHARED_DONUT_GEOMETRY.centerDiameter,
          height: SHARED_DONUT_GEOMETRY.centerDiameter,
        }}
      >
        <span className="max-w-[118px] text-[10.5px] font-medium leading-tight text-[#596273]">
          {active
            ? segmentName(active.segment)
            : mode === "customers"
              ? "Total Customers"
              : "Total Revenue"}
        </span>
        {active ? (
          <>
            <strong className="mt-1 text-[12px] leading-tight text-[#17366f]">
              {mode === "customers"
                ? countFormat.format(active.customerCount)
                : `${revenueFormat.format(active.revenue)} ₫`}
            </strong>
            <span className="mt-1 text-[10px] leading-tight text-[#687284]">
              {percentFormat.format(
                mode === "customers"
                  ? active.customerShare
                  : active.revenueShare,
              )}
            </span>
          </>
        ) : (
          <>
            <strong className="mt-1 text-[20px] leading-none text-[#17366f]">
              {mode === "customers"
                ? countFormat.format(data.totalCustomers)
                : `${revenueFormat.format(data.totalRevenue)} ₫`}
            </strong>
            <span className="mt-1 text-[10px] text-[#8b93a0]">100%</span>
          </>
        )}
      </div>
    </div>
  );
}

export function CustomerSegmentationSection({
  data = customerSegmentationDataset,
}: {
  data?: CustomerSegmentationDataset;
}) {
  const [mode, setMode] = useState<SegmentMode>("customers"),
    [hovered, setHovered] = useState<string | null>(null),
    [selected, setSelected] = useState<string | null>(null),
    [activeDefinition, setActiveDefinition] =
      useState<CustomerSegmentDefinition | null>(null),
    [definitionPopover, setDefinitionPopover] =
      useState<SegmentDefinitionPopoverState | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const definitionPopoverRef = useRef<HTMLDivElement>(null);
  const definitionTriggerRef = useRef<HTMLButtonElement | null>(null);
  const hoverHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const definitionHideTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const showSegmentDetail = (id: string | null) => {
    if (hoverHideTimer.current) {
      clearTimeout(hoverHideTimer.current);
      hoverHideTimer.current = null;
    }
    if (id) {
      announceAnalyticalTooltip("customer-segmentation");
      setHovered(id);
      return;
    }
    hoverHideTimer.current = setTimeout(() => setHovered(null), 180);
  };
  const selectSegmentDetail = (id: string | null) => {
    if (id) announceAnalyticalTooltip("customer-segmentation");
    setSelected(id);
  };
  const showSegmentDefinition = (
    segment: CustomerSegmentMetric,
    trigger: HTMLButtonElement,
  ) => {
    if (definitionHideTimer.current) {
      clearTimeout(definitionHideTimer.current);
      definitionHideTimer.current = null;
    }
    const definition = customerSegmentDefinitionByKey.get(segment.segment);
    if (!definition) return;
    definitionTriggerRef.current = trigger;
    setActiveDefinition(definition);
    showSegmentDetail(segment.id);
  };
  const hideSegmentDefinition = () => {
    if (definitionHideTimer.current) clearTimeout(definitionHideTimer.current);
    definitionHideTimer.current = setTimeout(() => {
      definitionTriggerRef.current = null;
      setActiveDefinition(null);
      setDefinitionPopover(null);
    }, 150);
  };
  const showDonutDetail = (id: string | null) => {
    if (id) {
      if (definitionHideTimer.current) {
        clearTimeout(definitionHideTimer.current);
        definitionHideTimer.current = null;
      }
      definitionTriggerRef.current = null;
      setActiveDefinition(null);
      setDefinitionPopover(null);
    }
    showSegmentDetail(id);
  };
  useEffect(
    () =>
      subscribeToOtherAnalyticalTooltips("customer-segmentation", () => {
        if (hoverHideTimer.current) {
          clearTimeout(hoverHideTimer.current);
          hoverHideTimer.current = null;
        }
        setHovered(null);
        setSelected(null);
        setActiveDefinition(null);
        setDefinitionPopover(null);
      }),
    [],
  );
  useEffect(() => () => {
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
    if (definitionHideTimer.current) clearTimeout(definitionHideTimer.current);
  });
  useLayoutEffect(() => {
    const trigger = definitionTriggerRef.current,
      container = chartAreaRef.current,
      legend = legendRef.current,
      tooltip = definitionPopoverRef.current,
      donut = container?.querySelector<HTMLElement>(
        '[data-segmentation-donut="true"]',
      );
    if (
      !activeDefinition ||
      !trigger ||
      !container ||
      !legend ||
      !tooltip ||
      !donut
    )
      return;
    const position = positionSegmentDefinition(
      trigger.getBoundingClientRect(),
      container.getBoundingClientRect(),
      legend.getBoundingClientRect(),
      donut.getBoundingClientRect(),
      tooltip.scrollHeight ||
        tooltip.offsetHeight ||
        tooltip.getBoundingClientRect().height,
    );
    setDefinitionPopover({ definition: activeDefinition, ...position });
  }, [activeDefinition]);
  useEffect(() => {
    if (!selected) return;
    const closeTouchDetail = (event: PointerEvent) => {
      if (sectionRef.current?.contains(event.target as Node)) return;
      setSelected(null);
      setHovered(null);
    };
    document.addEventListener("pointerdown", closeTouchDetail);
    return () => document.removeEventListener("pointerdown", closeTouchDetail);
  }, [selected]);
  return (
    <section
      ref={sectionRef}
      className="relative flex min-w-0 flex-col min-[900px]:h-full"
    >
      <SectionHeading title="01. Customer Segmentation" />
      <Card className="flex min-h-[380px] flex-1 flex-col px-3.5 pb-2.5 pt-2.5 min-[900px]:h-[430px] min-[900px]:min-h-[430px]">
        <header>
          <h3 className="text-[16px] font-semibold text-[#172033]">
            Segment Distribution
          </h3>
          <p className="mt-0.5 text-[11.5px] text-[#747d8b]">
            Customer distribution and contribution by segment
          </p>
          <div className="mt-2.5 flex justify-start">
            <SegmentedControl
              value={mode}
              onChange={(next) => {
                setMode(next);
                setHovered(null);
                setSelected(null);
                setActiveDefinition(null);
                setDefinitionPopover(null);
              }}
              ariaLabel="Customer segmentation metric"
              options={[
                { value: "customers", label: "Customer Count" },
                { value: "revenue", label: "Revenue Contribution" },
              ]}
            />
          </div>
        </header>
        <div
          ref={chartAreaRef}
          className="relative mx-auto mt-2 flex w-full flex-1 items-center justify-center gap-7 max-[560px]:flex-col max-[560px]:gap-2"
        >
          <SegmentationDonut
            data={data}
            mode={mode}
            hovered={hovered}
            selected={selected}
            onHover={showDonutDetail}
            onSelect={selectSegmentDetail}
          />
          <div ref={legendRef} className="w-[132px] shrink-0 space-y-0.5">
            {data.segments.map((segment) => {
              const definitionOpen =
                activeDefinition?.internalKey === segment.segment;
              return (
                <button
                  key={segment.id}
                  type="button"
                  data-segment-definition-trigger="true"
                  aria-describedby={
                    definitionOpen ? "segment-definition-popover" : undefined
                  }
                  onMouseEnter={(event) =>
                    showSegmentDefinition(segment, event.currentTarget)
                  }
                  onMouseLeave={() => {
                    showSegmentDetail(null);
                    hideSegmentDefinition();
                  }}
                  onFocus={(event) =>
                    showSegmentDefinition(segment, event.currentTarget)
                  }
                  onBlur={() => {
                    showSegmentDetail(null);
                    hideSegmentDefinition();
                  }}
                  className={`flex w-full cursor-default items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-[#f4f7fb] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b82f6] ${definitionOpen || selected === segment.id ? "bg-[#f4f7fb]" : ""}`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: segment.color }}
                  />
                  <p className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-[#273247]">
                    {segmentName(segment.segment)}
                  </p>
                </button>
              );
            })}
          </div>
          {activeDefinition && (
            <motion.div
              ref={definitionPopoverRef}
              id="segment-definition-popover"
              role="tooltip"
              aria-label={`${activeDefinition.displayName} definition`}
              data-placement={definitionPopover?.placement}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="pointer-events-none absolute z-[100] rounded-lg border border-[#d8deea] bg-white px-3 py-2.5 text-left shadow-[0_10px_24px_rgba(28,39,63,.16)]"
              style={{
                left: definitionPopover?.x ?? 0,
                top: definitionPopover?.y ?? 0,
                width: definitionPopover?.width ?? 200,
                visibility: definitionPopover ? "visible" : "hidden",
              }}
            >
              <strong className="block text-[13px] font-semibold text-[#172033]">
                {activeDefinition.displayName}
              </strong>
              <p className="mt-1.5 text-[11px] leading-[1.45] text-[#566173]">
                {activeDefinition.definition}
              </p>
            </motion.div>
          )}
        </div>
        <p className="mt-2 border-t border-[#e8ecf2] pt-3 text-[11px] leading-relaxed text-[#5f6877]">
          <span className="mr-1 text-[#3b82f6]">●</span>
          Potential Loyalists represent 3.3% of customers but contribute 5.7% of
          revenue.
        </p>
      </Card>
    </section>
  );
}
