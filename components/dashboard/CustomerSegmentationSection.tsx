"use client";

import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
  CustomerSegmentationDailyDataset,
  CustomerSegmentationDataset,
  CustomerSegmentMetric,
  NewReturningCustomersDataset,
  NewReturningDailyPoint,
} from "@/data/contracts/dashboard";
import { filterNewReturningCustomers } from "@/data/adapters/customer-segmentation.adapter";
import {
  customerSegmentationDailyDataset,
  customerSegmentationDataset,
  newReturningCustomersDataset,
} from "@/data/fixtures/customer-segmentation-workbook.fixture";
import { mockTopProductsBySegment } from "@/data/fixtures/customer-overview-products.fixture";
import { Card } from "@/components/ui/Card";
import { CustomerOriginMapCard } from "@/components/dashboard/CustomerOriginMapCard";
import { CustomerSegmentationDailyCard } from "@/components/dashboard/CustomerSegmentationDailyCard";
import { TopProductsTooltipContent } from "@/components/dashboard/TopProductsTooltipContent";
import {
  DateRangePill,
  type DateRangeValue,
} from "@/components/ui/DateRangePill";
import { DonutPercentageLabels } from "@/components/ui/DonutPercentageLabels";
import { SHARED_DONUT_GEOMETRY } from "@/components/ui/donutGeometry";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TagMultiSelect } from "@/components/ui/TagMultiSelect";
import {
  announceAnalyticalTooltip,
  subscribeToOtherAnalyticalTooltips,
} from "@/lib/interaction/analytical-tooltip";
import {
  DASHBOARD_STACKED_COLUMN_MARGIN_X,
  getDashboardStackedColumnWidth,
} from "@/lib/charts/stacked-column-geometry";

type SegmentMode = "customers" | "revenue";
type CustomerSeriesId = "new" | "returning";
type CustomerTrendMode = "customers" | "revenue";

const countFormat = new Intl.NumberFormat("en-US");
const decimalFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const compactNumberFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const formatCompactVnd = (value: number) =>
  value >= 1_000_000
    ? `${decimalFormat.format(value / 1_000_000)}M ₫`
    : `${decimalFormat.format(value / 1_000)}K ₫`;
const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const CUSTOMER_CHART_HEIGHT = 280;
const CHART_MARGIN = {
  top: 22,
  ...DASHBOARD_STACKED_COLUMN_MARGIN_X,
  bottom: 52,
};
const circumference = 2 * Math.PI * SHARED_DONUT_GEOMETRY.centerlineRadius;

interface CustomerChartPoint extends NewReturningDailyPoint {
  x: number;
  newValue: number | null;
  returningValue: number | null;
  totalValue: number | null;
  totalY: number;
  returningY: number;
}

interface SegmentDefinitionPopoverState {
  segment: CustomerSegmentMetric;
  placement: "above" | "below" | "right";
  width: number;
  x: number;
  y: number;
}

export interface CustomerOverviewPlatformDataset {
  id: string;
  label: string;
  newReturningData: NewReturningCustomersDataset;
  segmentationData: CustomerSegmentationDataset;
  segmentationDailyData?: CustomerSegmentationDailyDataset;
}

const CUSTOMER_OVERVIEW_PLATFORM_OPTIONS = [
  { id: "shopee", label: "Shopee" },
  { id: "tiktok-shop", label: "TikTok Shop" },
  { id: "lazada", label: "Lazada" },
] as const;
type CustomerOverviewPlatformId =
  (typeof CUSTOMER_OVERVIEW_PLATFORM_OPTIONS)[number]["id"];
const DEFAULT_SELECTED_PLATFORMS = CUSTOMER_OVERVIEW_PLATFORM_OPTIONS.map(
  ({ id }) => id,
);

function formatDate(date: string) {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}

function useElementWidth<T extends HTMLElement>(fallback = 720) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(Math.max(320, element.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

function positionSegmentDefinition(
  itemRect: DOMRect,
  containerRect: DOMRect,
  legendRect: DOMRect,
  donutRect: DOMRect,
  tooltipHeight: number,
) {
  const gap = 8;
  const pad = 4;
  const donutGap = 6;
  const width = Math.min(240, containerRect.width - pad * 2);
  const height = tooltipHeight;
  const itemX = itemRect.left - containerRect.left;
  const itemTop = itemRect.top - containerRect.top;
  const itemBottom = itemRect.bottom - containerRect.top;
  const itemRight = itemRect.right - containerRect.left;
  const itemCenterY = itemTop + itemRect.height / 2;
  const legendProgress =
    (itemRect.top + itemRect.height / 2 - legendRect.top) / legendRect.height;
  const verticalPlacements: Array<"above" | "below"> =
    legendProgress < 0.34
      ? ["below", "above"]
      : legendProgress > 0.66
        ? ["above", "below"]
        : ["above", "below"];
  const donutLeft = donutRect.left - containerRect.left - donutGap;
  const donutRight = donutRect.right - containerRect.left + donutGap;
  const donutTop = donutRect.top - containerRect.top - donutGap;
  const donutBottom = donutRect.bottom - containerRect.top + donutGap;
  const clampX = (value: number) =>
    Math.max(pad, Math.min(value, containerRect.width - width - pad));
  const overlapsDonut = (x: number, y: number) =>
    x < donutRight &&
    x + width > donutLeft &&
    y < donutBottom &&
    y + height > donutTop;

  for (const placement of verticalPlacements) {
    const y = placement === "above" ? itemTop - height - gap : itemBottom + gap;
    if (y < pad || y + height > containerRect.height - pad) continue;
    let x = clampX(itemX);
    if (overlapsDonut(x, y)) x = clampX(donutRight);
    if (!overlapsDonut(x, y)) return { placement, width, x, y } as const;
  }

  const rightX = clampX(itemRight + gap);
  const rightY = Math.max(
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

  const fallbackBelow = donutBottom + gap;
  const fallbackAbove = donutTop - height - gap;
  const fallbackY =
    fallbackBelow + height <= containerRect.height - pad
      ? fallbackBelow
      : fallbackAbove >= pad
        ? fallbackAbove
        : Math.max(
            pad,
            Math.min(itemBottom + gap, containerRect.height - height - pad),
          );
  return {
    placement: fallbackY < itemTop ? ("above" as const) : ("below" as const),
    width,
    x: clampX(Math.max(itemX, donutRight)),
    y: fallbackY,
  };
}

function NewReturningChart({
  data,
  mode,
}: {
  data: NewReturningCustomersDataset;
  mode: CustomerTrendMode;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [activeSeries, setActiveSeries] = useState<CustomerSeriesId | null>(
    null,
  );
  const [tooltipTarget, setTooltipTarget] = useState<{
    date: string;
    series: CustomerSeriesId | null;
  } | null>(null);
  const finalChartData = data.points;
  const metricValues = (point: NewReturningDailyPoint) =>
    mode === "customers"
      ? [point.newCustomers, point.returningCustomers]
      : [point.newRevenue, point.returningRevenue];
  const plotWidth = Math.max(1, width - CHART_MARGIN.left - CHART_MARGIN.right);
  const plotHeight =
    CUSTOMER_CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;
  const observedValues = finalChartData.flatMap((point) => {
    const values = metricValues(point).filter(
      (value): value is number => value !== null,
    );
    return values.length ? [values.reduce((sum, value) => sum + value, 0)] : [];
  });

  if (!finalChartData.length || !observedValues.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-[13px] text-[#747d8b]">
        New and returning {mode === "customers" ? "customer" : "revenue"} data
        is unavailable for this date range.
      </div>
    );
  }

  const observedMax = Math.max(...observedValues);
  const paddedMaximum = Math.max(1, observedMax * 1.1);
  const magnitude = 10 ** Math.floor(Math.log10(paddedMaximum));
  const normalizedMaximum = paddedMaximum / magnitude;
  const niceFactor =
    normalizedMaximum <= 1
      ? 1
      : normalizedMaximum <= 2
        ? 2
        : normalizedMaximum <= 5
          ? 5
          : 10;
  const yMax =
    mode === "customers"
      ? Math.max(10, Math.ceil(paddedMaximum / 10) * 10)
      : Math.max(1_000, niceFactor * magnitude);
  const columnWidth = plotWidth / Math.max(1, finalChartData.length);
  const barWidth = getDashboardStackedColumnWidth(columnWidth);
  const rotateDateLabels = columnWidth < 48;
  const xForIndex = (index: number) =>
    CHART_MARGIN.left + columnWidth * (index + 0.5);
  const yForValue = (value: number) =>
    CHART_MARGIN.top + plotHeight - (value / yMax) * plotHeight;
  const chartPoints: CustomerChartPoint[] = finalChartData.map(
    (point, index) => {
      const [newValue, returningValue] = metricValues(point);
      const totalValue =
        newValue === null || returningValue === null
          ? null
          : newValue + returningValue;
      return {
        ...point,
        x: xForIndex(index),
        newValue,
        returningValue,
        totalValue,
        totalY:
          totalValue === null
            ? CHART_MARGIN.top + plotHeight
            : yForValue(totalValue),
        returningY:
          returningValue === null
            ? CHART_MARGIN.top + plotHeight
            : yForValue(returningValue),
      };
    },
  );
  const tooltip =
    chartPoints.find((point) => point.date === tooltipTarget?.date) ?? null;
  const yTicks = Array.from({ length: 5 }, (_, index) => (yMax / 4) * index);
  const series = [
    {
      id: "new" as const,
      label: "New",
      color: "#3B82F6",
    },
    {
      id: "returning" as const,
      label: "Returning",
      color: "#20A7A1",
    },
  ];

  return (
    <div ref={ref} className="relative mt-2.5 w-full">
      <div className="flex items-center gap-3">
        {series.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-[11.5px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b82f6] ${activeSeries && activeSeries !== item.id ? "opacity-35" : "opacity-100"}`}
            onMouseEnter={() => setActiveSeries(item.id)}
            onMouseLeave={() => setActiveSeries(null)}
            onFocus={() => setActiveSeries(item.id)}
            onBlur={() => setActiveSeries(null)}
          >
            <span
              className="h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </button>
        ))}
      </div>
      <div className="relative mt-1 h-[280px] w-full">
        <svg
          width="100%"
          height={CUSTOMER_CHART_HEIGHT}
          viewBox={`0 0 ${width} ${CUSTOMER_CHART_HEIGHT}`}
          role="img"
          aria-label={`Daily new and returning customer ${mode === "customers" ? "counts" : "revenue"}`}
          className="block overflow-visible"
          onMouseLeave={() => setTooltipTarget(null)}
        >
          {yTicks.map((tick) => {
            const y = yForValue(tick);
            return (
              <g key={tick}>
                <line
                  x1={CHART_MARGIN.left}
                  x2={width - CHART_MARGIN.right}
                  y1={y}
                  y2={y}
                  stroke="#e6eaf0"
                />
                <text
                  x={CHART_MARGIN.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#727b89"
                  fontSize="11"
                >
                  {mode === "customers"
                    ? countFormat.format(tick)
                    : compactNumberFormat.format(tick)}
                </text>
              </g>
            );
          })}
          <text
            x="13"
            y={CHART_MARGIN.top + plotHeight / 2}
            textAnchor="middle"
            fill="#727b89"
            fontSize="10.5"
            transform={`rotate(-90 13 ${CHART_MARGIN.top + plotHeight / 2})`}
          >
            {mode === "customers" ? "Customers" : "Revenue"}
          </text>
          {chartPoints.map((point) => (
            <text
              key={point.date}
              x={point.x}
              y={CUSTOMER_CHART_HEIGHT - 9}
              textAnchor={rotateDateLabels ? "end" : "middle"}
              fill="#727b89"
              fontSize="10"
              transform={
                rotateDateLabels
                  ? `rotate(-38 ${point.x} ${CUSTOMER_CHART_HEIGHT - 9})`
                  : undefined
              }
            >
              {formatDate(point.date)}
            </text>
          ))}
          {chartPoints.map((point) => {
            const baselineY = CHART_MARGIN.top + plotHeight;
            const returningHeight =
              point.returningValue === null ? 0 : baselineY - point.returningY;
            const newHeight =
              point.newValue === null || point.totalValue === null
                ? 0
                : point.returningY - point.totalY;
            const isHovered = tooltip?.date === point.date;
            return (
              <g
                key={`${point.date}-bars`}
                data-stacked-customer-bar={point.date}
              >
                {returningHeight > 0 ? (
                  <rect
                    x={point.x - barWidth / 2}
                    y={point.returningY}
                    width={barWidth}
                    height={returningHeight}
                    rx="2"
                    fill="#20A7A1"
                    opacity={
                      activeSeries && activeSeries !== "returning" ? 0.25 : 1
                    }
                    stroke={isHovered ? "#ffffff" : "none"}
                    strokeWidth={isHovered ? 1.5 : 0}
                    className="transition-opacity duration-150 motion-reduce:transition-none"
                  />
                ) : null}
                {newHeight > 0 ? (
                  <rect
                    x={point.x - barWidth / 2}
                    y={point.totalY}
                    width={barWidth}
                    height={newHeight}
                    rx="3"
                    fill="#3B82F6"
                    opacity={activeSeries && activeSeries !== "new" ? 0.25 : 1}
                    stroke={isHovered ? "#ffffff" : "none"}
                    strokeWidth={isHovered ? 1.5 : 0}
                    className="transition-opacity duration-150 motion-reduce:transition-none"
                  />
                ) : null}
              </g>
            );
          })}
          {chartPoints.map((point, index) => (
            <g key={point.date}>
              <rect
                x={CHART_MARGIN.left + index * columnWidth}
                y={CHART_MARGIN.top}
                width={columnWidth}
                height={plotHeight}
                fill="transparent"
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${formatDate(point.date)}: ${point.newValue ?? "unavailable"} new ${mode === "customers" ? "customers" : "revenue"}, ${point.returningValue ?? "unavailable"} returning ${mode === "customers" ? "customers" : "revenue"}, ${point.totalValue ?? "unavailable"} total`}
                onMouseEnter={() =>
                  setTooltipTarget({ date: point.date, series: null })
                }
                onMouseMove={(event) => {
                  const svg = event.currentTarget.ownerSVGElement;
                  if (!svg) return;
                  const svgRect = svg.getBoundingClientRect();
                  const pointerY =
                    ((event.clientY - svgRect.top) / svgRect.height) *
                    CUSTOMER_CHART_HEIGHT;
                  const baselineY = CHART_MARGIN.top + plotHeight;
                  const series =
                    point.returningValue !== null &&
                    point.returningValue > 0 &&
                    pointerY >= point.returningY &&
                    pointerY <= baselineY
                      ? "returning"
                      : point.newValue !== null &&
                          point.newValue > 0 &&
                          pointerY >= point.totalY &&
                          pointerY < point.returningY
                        ? "new"
                        : null;
                  setTooltipTarget({ date: point.date, series });
                }}
                onMouseLeave={() => setTooltipTarget(null)}
                onFocus={() =>
                  setTooltipTarget({ date: point.date, series: null })
                }
                onBlur={() => setTooltipTarget(null)}
              />
            </g>
          ))}
        </svg>
        {tooltip ? (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-40 min-w-[170px] rounded-lg border border-[#d8deea] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(28,39,63,.16)]"
            style={{
              left: tooltip.x,
              top: Math.max(4, tooltip.totalY - 12),
              transform:
                tooltip.x > width - 210
                  ? "translate(-100%, -100%)"
                  : "translate(10px, -100%)",
            }}
          >
            <strong className="block text-[12.5px] font-semibold text-[#172033]">
              {formatDate(tooltip.date)}
            </strong>
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[11px]">
              <span className="text-[#687284]">New</span>
              <strong className="text-[#17366f]">
                {tooltip.newValue === null
                  ? "Unavailable"
                  : mode === "customers"
                    ? `${countFormat.format(tooltip.newValue)} customers`
                    : `${compactNumberFormat.format(tooltip.newValue)} revenue`}
              </strong>
              <span className="text-[#687284]">Returning</span>
              <strong className="text-[#17366f]">
                {tooltip.returningValue === null
                  ? "Unavailable"
                  : mode === "customers"
                    ? `${countFormat.format(tooltip.returningValue)} customers`
                    : `${compactNumberFormat.format(tooltip.returningValue)} revenue`}
              </strong>
              <span className="border-t border-[#e8ecf2] pt-1 text-[#687284]">
                Total
              </span>
              <strong className="border-t border-[#e8ecf2] pt-1 text-[#172e63]">
                {tooltip.totalValue === null
                  ? "Unavailable"
                  : mode === "customers"
                    ? `${countFormat.format(tooltip.totalValue)} customers`
                    : `${compactNumberFormat.format(tooltip.totalValue)} revenue`}
              </strong>
            </div>
            {tooltipTarget?.series ? (
              <TopProductsTooltipContent
                products={
                  tooltipTarget.series === "new"
                    ? (tooltip.newTopProducts ?? [])
                    : (tooltip.returningTopProducts ?? [])
                }
                contextLabel={
                  tooltipTarget.series === "new" ? "New" : "Returning"
                }
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
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
  onHover: (id: string | null, trigger?: Element) => void;
  onSelect: (id: string, trigger: Element) => void;
}) {
  const arcs = data.segments.reduce<
    Array<{ segment: CustomerSegmentMetric; share: number; offset: number }>
  >((items, segment) => {
    const share =
      mode === "customers" ? segment.customerShare : segment.revenueShare;
    const offset = items.reduce((sum, item) => sum + item.share, 0);
    return [...items, { segment, share, offset }];
  }, []);
  const activeId = hovered ?? selected;
  const active = data.segments.find((segment) => segment.id === activeId);

  return (
    <div
      data-segmentation-donut="true"
      className="relative h-[190px] w-[190px] max-w-full shrink-0 min-[1500px]:h-[210px] min-[1500px]:w-[210px]"
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
          const dash = Math.max(0, share * circumference);
          const dashOffset = -offset * circumference;
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
              className="cursor-pointer transition-[stroke-width,stroke-dasharray,stroke-dashoffset,opacity] duration-300 ease-out focus:outline-none motion-reduce:transition-none"
              opacity={activeId ? (activeId === segment.id ? 1 : 0.45) : 1}
              onMouseEnter={(event) => onHover(segment.id, event.currentTarget)}
              onMouseLeave={() => onHover(null)}
              onFocus={(event) => onHover(segment.id, event.currentTarget)}
              onBlur={() => onHover(null)}
              tabIndex={0}
              role="button"
              aria-pressed={selected === segment.id}
              aria-label={
                mode === "customers"
                  ? `${segment.segment}: ${countFormat.format(segment.customerCount)} customers, ${percentFormat.format(segment.customerShare)}`
                  : `${segment.segment}: ${formatCompactVnd(segment.revenue)}, ${percentFormat.format(segment.revenueShare)}`
              }
              onClick={(event) => {
                event.stopPropagation();
                if (window.matchMedia("(hover: none)").matches)
                  onSelect(segment.id, event.currentTarget);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(segment.id, event.currentTarget);
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
        {active ? (
          <>
            <span className="max-w-[118px] text-[10.5px] font-medium leading-tight text-[#596273]">
              {active.segment}
            </span>
            <strong className="mt-1 text-[12px] leading-tight text-[#17366f]">
              {mode === "customers"
                ? countFormat.format(active.customerCount)
                : formatCompactVnd(active.revenue)}
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
            <strong className="text-[20px] leading-none text-[#17366f]">
              {mode === "customers"
                ? countFormat.format(data.totalCustomers)
                : formatCompactVnd(data.totalRevenue)}
            </strong>
            <span className="mt-1 text-[10.5px] font-medium text-[#596273]">
              {mode === "customers" ? "Customers" : "Revenue"}
            </span>
            <span className="mt-1 whitespace-nowrap text-[7.5px] leading-tight text-[#8b93a0]">
              {mode === "customers"
                ? "100% customer base"
                : "100% contribution"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function LegacySegmentationDonutCard({
  data,
}: {
  data: CustomerSegmentationDataset;
}) {
  const [mode, setMode] = useState<SegmentMode>("customers");
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeDefinition, setActiveDefinition] =
    useState<CustomerSegmentMetric | null>(null);
  const [definitionPopover, setDefinitionPopover] =
    useState<SegmentDefinitionPopoverState | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const definitionPopoverRef = useRef<HTMLDivElement>(null);
  const definitionTriggerRef = useRef<Element | null>(null);
  const selectedTriggerRef = useRef<Element | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const hoverHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const definitionHideTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const showSegmentDetail = (id: string | null) => {
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
    if (id) {
      announceAnalyticalTooltip("customer-segmentation");
      setHovered(id);
      return;
    }
    hoverHideTimer.current = setTimeout(() => setHovered(null), 180);
  };
  const showSegmentDefinition = (
    segment: CustomerSegmentMetric,
    trigger: Element,
  ) => {
    if (definitionHideTimer.current) clearTimeout(definitionHideTimer.current);
    definitionTriggerRef.current = trigger;
    setActiveDefinition(segment);
    showSegmentDetail(segment.id);
  };
  const hideSegmentDefinition = () => {
    if (definitionHideTimer.current) clearTimeout(definitionHideTimer.current);
    definitionHideTimer.current = setTimeout(() => {
      const selectedSegment = data.segments.find(
        ({ id }) => id === selectedIdRef.current,
      );
      if (selectedSegment && selectedTriggerRef.current) {
        definitionTriggerRef.current = selectedTriggerRef.current;
        setActiveDefinition(selectedSegment);
      } else {
        definitionTriggerRef.current = null;
        setActiveDefinition(null);
        setDefinitionPopover(null);
      }
    }, 150);
  };
  const showDonutDetail = (id: string | null, trigger?: Element) => {
    const segment = data.segments.find((candidate) => candidate.id === id);
    if (segment && trigger) {
      showSegmentDefinition(segment, trigger);
      return;
    }
    showSegmentDetail(id);
    hideSegmentDefinition();
  };
  const selectSegment = (id: string, trigger: Element) => {
    const segment = data.segments.find((candidate) => candidate.id === id);
    if (!segment) return;
    announceAnalyticalTooltip("customer-segmentation");
    selectedIdRef.current = id;
    selectedTriggerRef.current = trigger;
    definitionTriggerRef.current = trigger;
    setSelected(id);
    setActiveDefinition(segment);
  };

  useEffect(
    () =>
      subscribeToOtherAnalyticalTooltips("customer-segmentation", () => {
        if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
        setHovered(null);
        setSelected(null);
        selectedIdRef.current = null;
        selectedTriggerRef.current = null;
        setActiveDefinition(null);
        setDefinitionPopover(null);
      }),
    [],
  );
  useEffect(
    () => () => {
      if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
      if (definitionHideTimer.current)
        clearTimeout(definitionHideTimer.current);
    },
    [],
  );
  useLayoutEffect(() => {
    const trigger = definitionTriggerRef.current;
    const container = chartAreaRef.current;
    const legend = legendRef.current;
    const tooltip = definitionPopoverRef.current;
    const donut = container?.querySelector<HTMLElement>(
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
      tooltip.scrollHeight || tooltip.getBoundingClientRect().height,
    );
    setDefinitionPopover({ segment: activeDefinition, ...position });
  }, [activeDefinition, hovered, mode, selected]);
  useEffect(() => {
    if (!selected) return;
    const closeTouchDetail = (event: PointerEvent) => {
      if (sectionRef.current?.contains(event.target as Node)) return;
      setSelected(null);
      setHovered(null);
      selectedIdRef.current = null;
      selectedTriggerRef.current = null;
      setActiveDefinition(null);
      setDefinitionPopover(null);
    };
    document.addEventListener("pointerdown", closeTouchDetail);
    return () => document.removeEventListener("pointerdown", closeTouchDetail);
  }, [selected]);

  return (
    <Card className="flex h-full min-h-[430px] flex-col px-5 pb-4 pt-4">
      <div ref={sectionRef} className="relative flex h-full flex-col">
        <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="min-w-[190px] flex-1">
            <h3 className="text-[16px] font-semibold text-[#172033]">
              Customer Segmentation
            </h3>
            <p className="mt-0.5 text-[11.5px] text-[#747d8b]">
              Customer groups based on RFM behavior and value
            </p>
          </div>
          <div className="w-fit max-w-full flex-none">
            <SegmentedControl
              value={mode}
              onChange={(next) => {
                setMode(next);
              }}
              ariaLabel="Customer segmentation metric"
              options={[
                { value: "customers", label: "Customers" },
                { value: "revenue", label: "Revenue" },
              ]}
            />
          </div>
        </header>
        <div
          ref={chartAreaRef}
          className="relative mx-auto mt-3 flex w-full flex-1 flex-col items-center justify-center gap-2 min-[1450px]:flex-row min-[1450px]:gap-4"
        >
          <SegmentationDonut
            data={data}
            mode={mode}
            hovered={hovered}
            selected={selected}
            onHover={showDonutDetail}
            onSelect={selectSegment}
          />
          <div
            ref={legendRef}
            className="grid w-full shrink-0 grid-cols-2 gap-x-2 gap-y-1 min-[1450px]:block min-[1450px]:w-[205px] min-[1450px]:space-y-1"
          >
            {data.segments.map((segment) => {
              const definitionOpen = activeDefinition?.id === segment.id;
              return (
                <button
                  key={segment.id}
                  type="button"
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
                  onClick={(event) => {
                    if (window.matchMedia("(hover: none)").matches)
                      selectSegment(segment.id, event.currentTarget);
                  }}
                  className={`flex w-full cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#f4f7fb] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b82f6] ${definitionOpen || selected === segment.id ? "bg-[#f4f7fb]" : ""}`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: segment.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-[#273247]">
                    {segment.segment}
                  </span>
                </button>
              );
            })}
          </div>
          {activeDefinition ? (
            <motion.div
              ref={definitionPopoverRef}
              id="segment-definition-popover"
              role="tooltip"
              aria-label={`${activeDefinition.segment} RFM logic`}
              data-placement={definitionPopover?.placement}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="pointer-events-none absolute z-[100] rounded-lg border border-[#d8deea] bg-white px-3 py-2.5 text-left shadow-[0_10px_24px_rgba(28,39,63,.16)]"
              style={{
                left: definitionPopover?.x ?? 0,
                top: definitionPopover?.y ?? 0,
                width: definitionPopover?.width ?? 210,
                visibility: definitionPopover ? "visible" : "hidden",
              }}
            >
              <strong className="block text-[13px] font-semibold text-[#172033]">
                {activeDefinition.segment}
              </strong>
              <p className="mt-1 text-[10.5px] leading-[1.45] text-[#596273]">
                {activeDefinition.condition}
              </p>
              <p className="mt-2 border-t border-[#e8ecf2] pt-2 text-[9.5px] leading-[1.45] text-[#747d8b]">
                R = Recency · F = Frequency · M = Monetary
              </p>
              <TopProductsTooltipContent
                products={mockTopProductsBySegment[activeDefinition.id] ?? []}
                contextLabel={activeDefinition.segment}
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function SegmentationDonutCard({
  data,
  dailyData,
}: {
  data: CustomerSegmentationDataset;
  dailyData?: CustomerSegmentationDailyDataset;
}) {
  return dailyData?.points.length ? (
    <CustomerSegmentationDailyCard data={dailyData} />
  ) : (
    <LegacySegmentationDonutCard data={data} />
  );
}

export function CustomerSegmentationSection({
  newReturningData = newReturningCustomersDataset,
  segmentationData = customerSegmentationDataset,
  segmentationDailyData = customerSegmentationDailyDataset,
  platformDatasets,
}: {
  newReturningData?: NewReturningCustomersDataset;
  segmentationData?: CustomerSegmentationDataset;
  segmentationDailyData?: CustomerSegmentationDailyDataset;
  platformDatasets?: CustomerOverviewPlatformDataset[];
}) {
  const availablePlatforms = useMemo<CustomerOverviewPlatformDataset[]>(
    () =>
      platformDatasets?.length
        ? platformDatasets
        : [
            {
              id: "all",
              label: "All Platforms",
              newReturningData,
              segmentationData,
              segmentationDailyData,
            },
          ],
    [
      newReturningData,
      platformDatasets,
      segmentationDailyData,
      segmentationData,
    ],
  );
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<
    CustomerOverviewPlatformId[]
  >([...DEFAULT_SELECTED_PLATFORMS]);
  const [customerTrendMode, setCustomerTrendMode] =
    useState<CustomerTrendMode>("customers");
  const activePlatform =
    (selectedPlatformIds.length === 1
      ? availablePlatforms.find(({ id }) => id === selectedPlatformIds[0])
      : availablePlatforms.find(({ id }) => id === "all")) ??
    availablePlatforms[0];
  const sourceDates = activePlatform.newReturningData.points.map(
    ({ date }) => date,
  );
  const minDate = sourceDates[0] ?? "2026-05-01";
  const maxDate = sourceDates.at(-1) ?? "2026-05-17";
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    startDate: minDate,
    endDate: maxDate,
  });
  const filteredNewReturningData = useMemo(
    () =>
      filterNewReturningCustomers(
        activePlatform.newReturningData,
        dateRange.startDate,
        dateRange.endDate,
      ),
    [activePlatform.newReturningData, dateRange.endDate, dateRange.startDate],
  );
  return (
    <section className="min-w-0">
      <header className="mb-4 flex flex-col items-start gap-3">
        <h2 className="text-[21px] font-medium leading-tight text-[#111]">
          01. Customer Overview
        </h2>
        <div className="flex w-fit max-w-full flex-none flex-wrap items-end gap-2">
          <div className="grid gap-1">
            <span className="text-[12.5px] font-medium text-[#747d8b]">
              Time Range
            </span>
            <DateRangePill
              value={dateRange}
              onChange={setDateRange}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
          <TagMultiSelect
            label="Platforms"
            options={CUSTOMER_OVERVIEW_PLATFORM_OPTIONS.map(
              ({ id, label }) => ({
                value: id,
                label,
              }),
            )}
            value={selectedPlatformIds}
            onChange={setSelectedPlatformIds}
            minimumSelected={1}
            className="w-[390px] max-w-full flex-none"
          />
        </div>
      </header>
      <div className="grid grid-cols-1 items-stretch gap-4 min-[1280px]:grid-cols-3">
        <Card className="h-full min-h-[420px] px-5 pb-4 pt-4 min-[1280px]:h-[430px] min-[1280px]:min-h-[430px]">
          <header className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
            <div>
              <h3 className="text-[16px] font-semibold text-[#172033]">
                New vs Returning Customers
              </h3>
              <p className="mt-0.5 text-[11.5px] text-[#747d8b]">
                Daily customer acquisition and return trend
              </p>
            </div>
            <SegmentedControl
              value={customerTrendMode}
              options={[
                { value: "customers", label: "Customer" },
                { value: "revenue", label: "Revenue" },
              ]}
              onChange={setCustomerTrendMode}
              ariaLabel="New versus returning metric"
            />
          </header>
          <NewReturningChart
            data={filteredNewReturningData}
            mode={customerTrendMode}
          />
        </Card>
        <SegmentationDonutCard
          data={activePlatform.segmentationData}
          dailyData={
            activePlatform.segmentationDailyData ?? segmentationDailyData
          }
        />
        <CustomerOriginMapCard />
      </div>
    </section>
  );
}
