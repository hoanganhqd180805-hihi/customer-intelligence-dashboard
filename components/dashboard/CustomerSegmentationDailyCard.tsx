"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CustomerSegmentationDailyDataset,
  CustomerSegmentationDailyMetric,
  CustomerSegmentationDailyPoint,
} from "@/data/contracts/dashboard";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TopProductsTooltipContent } from "@/components/dashboard/TopProductsTooltipContent";
import {
  DASHBOARD_STACKED_COLUMN_MARGIN_X,
  getDashboardStackedColumnWidth,
} from "@/lib/charts/stacked-column-geometry";

type SegmentMode = "customers" | "revenue";

interface SegmentTooltipState {
  point: CustomerSegmentationDailyPoint | null;
  segment: CustomerSegmentationDailyMetric;
  x: number;
  y: number;
}

const CHART_HEIGHT = 270;
const MARGIN = {
  top: 8,
  ...DASHBOARD_STACKED_COLUMN_MARGIN_X,
  bottom: 40,
};
const countFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatDate(date: string) {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}

function formatVnd(value: number) {
  return `${compactFormat.format(value)} ₫`;
}

function useElementWidth<T extends HTMLElement>(fallback = 480) {
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

function niceMaximum(value: number, mode: SegmentMode) {
  if (mode === "customers") return Math.max(10, Math.ceil(value / 50) * 50);
  const padded = Math.max(1, value * 1.08);
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  const normalized = padded / magnitude;
  const factor = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * magnitude;
}

export function CustomerSegmentationDailyCard({
  data,
}: {
  data: CustomerSegmentationDailyDataset;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [mode, setMode] = useState<SegmentMode>("customers");
  const [tooltip, setTooltip] = useState<SegmentTooltipState | null>(null);
  const segmentDefinitions = data.points[0]?.segments ?? [];
  const plotWidth = Math.max(1, width - MARGIN.left - MARGIN.right);
  const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const columnWidth = plotWidth / Math.max(1, data.points.length);
  const barWidth = getDashboardStackedColumnWidth(columnWidth);
  const totals = data.points.map((point) =>
    mode === "customers" ? point.totalCustomers : point.totalRevenue,
  );
  const yMax = niceMaximum(Math.max(0, ...totals), mode);
  const yForValue = (value: number) =>
    MARGIN.top + plotHeight - (value / yMax) * plotHeight;
  const yTicks = Array.from({ length: 5 }, (_, index) => (yMax / 4) * index);
  const showTooltip = (
    point: CustomerSegmentationDailyPoint | null,
    segment: CustomerSegmentationDailyMetric,
    clientX: number,
    clientY: number,
  ) => {
    const container = ref.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const tooltipWidth = 232;
    const tooltipHeight = 184;
    setTooltip({
      point,
      segment,
      x: Math.max(
        4,
        Math.min(clientX - rect.left + 10, rect.width - tooltipWidth - 4),
      ),
      y: Math.max(
        42,
        Math.min(clientY - rect.top - 72, rect.height - tooltipHeight - 4),
      ),
    });
  };

  const showKeyboardTooltip = (
    point: CustomerSegmentationDailyPoint | null,
    segment: CustomerSegmentationDailyMetric,
    target: Element,
  ) => {
    const rect = target.getBoundingClientRect();
    showTooltip(point, segment, rect.right, rect.top + rect.height / 2);
  };

  return (
    <Card className="h-full min-h-[420px] px-5 pb-4 pt-4 min-[1280px]:h-[430px] min-[1280px]:min-h-[430px]">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[16px] font-semibold text-[#172033]">
            Customer Segmentation
          </h3>
          <p className="mt-0.5 text-[11.5px] text-[#747d8b]">
            Daily customer distribution by segment
          </p>
        </div>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          ariaLabel="Customer segmentation metric"
          options={[
            { value: "customers", label: "Customers" },
            { value: "revenue", label: "Revenue" },
          ]}
        />
      </header>

      <div
        ref={ref}
        className="relative mt-2 w-full"
        onMouseLeave={() => setTooltip(null)}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {segmentDefinitions.map((segment) => (
            <button
              key={segment.id}
              type="button"
              onMouseEnter={(event) =>
                showTooltip(null, segment, event.clientX, event.clientY)
              }
              onFocus={(event) =>
                showKeyboardTooltip(null, segment, event.currentTarget)
              }
              onBlur={() => setTooltip(null)}
              className="flex cursor-default items-center gap-1 rounded px-1 py-0.5 text-[9.5px] font-medium text-[#465166] outline-none hover:bg-[#f4f7fb] focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
            >
              <span
                className="h-2 w-2 rounded-[2px]"
                style={{ backgroundColor: segment.color }}
              />
              {segment.segment}
            </button>
          ))}
        </div>

        <svg
          width="100%"
          height={CHART_HEIGHT}
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          role="img"
          aria-label={`Daily customer segmentation by ${mode}`}
          className="mt-1 block overflow-visible"
        >
          {yTicks.map((tick) => {
            const y = yForValue(tick);
            return (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={width - MARGIN.right}
                  y1={y}
                  y2={y}
                  stroke="#e6eaf0"
                />
                <text
                  x={MARGIN.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#727b89"
                  fontSize="9.5"
                >
                  {mode === "customers"
                    ? countFormat.format(tick)
                    : compactFormat.format(tick)}
                </text>
              </g>
            );
          })}

          {data.points.map((point, pointIndex) => {
            const x = MARGIN.left + columnWidth * (pointIndex + 0.5);
            let cumulative = 0;
            return (
              <g key={point.date} data-segmentation-day={point.date}>
                {point.segments.map((segment) => {
                  const value =
                    mode === "customers"
                      ? segment.customerCount
                      : segment.revenue;
                  const previous = cumulative;
                  cumulative += value;
                  const top = yForValue(cumulative);
                  const bottom = yForValue(previous);
                  const active =
                    tooltip?.point?.date === point.date &&
                    tooltip.segment.id === segment.id;
                  return (
                    <rect
                      key={segment.id}
                      x={x - barWidth / 2}
                      y={top}
                      width={barWidth}
                      height={Math.max(0, bottom - top)}
                      fill={segment.color}
                      opacity={tooltip && !active ? 0.6 : 1}
                      stroke={active ? "#ffffff" : "none"}
                      strokeWidth={active ? 1.2 : 0}
                      tabIndex={0}
                      role="graphics-symbol"
                      aria-label={`${formatDate(point.date)}, ${segment.segment}: ${mode === "customers" ? `${countFormat.format(segment.customerCount)} customers` : formatVnd(segment.revenue)}`}
                      onMouseEnter={(event) =>
                        showTooltip(
                          point,
                          segment,
                          event.clientX,
                          event.clientY,
                        )
                      }
                      onMouseMove={(event) =>
                        showTooltip(
                          point,
                          segment,
                          event.clientX,
                          event.clientY,
                        )
                      }
                      onFocus={(event) =>
                        showKeyboardTooltip(point, segment, event.currentTarget)
                      }
                      onBlur={() => setTooltip(null)}
                      className="cursor-default outline-none focus-visible:stroke-[#172e63] focus-visible:stroke-2"
                    />
                  );
                })}
                <text
                  x={x}
                  y={CHART_HEIGHT - 10}
                  textAnchor="middle"
                  fill="#727b89"
                  fontSize="8.5"
                >
                  {formatDate(point.date)}
                </text>
              </g>
            );
          })}
        </svg>

        {tooltip ? (
          <div
            role="tooltip"
            aria-label={`${tooltip.segment.segment} segment details`}
            className="pointer-events-none absolute z-50 w-[232px] rounded-lg border border-[#d8deea] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(28,39,63,.16)]"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: tooltip.segment.color }}
              />
              <div>
                <strong className="block text-[12px] font-semibold text-[#172033]">
                  {tooltip.segment.segment}
                </strong>
                {tooltip.point ? (
                  <span className="mt-0.5 block text-[10px] text-[#747d8b]">
                    {formatDate(tooltip.point.date)}
                  </span>
                ) : null}
              </div>
            </div>
            {tooltip.point ? (
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-x-3 text-[10.5px]">
                <span className="text-[#687284]">
                  {mode === "customers" ? "Customers" : "Revenue"}
                </span>
                <strong className="text-[#17366f]">
                  {mode === "customers"
                    ? countFormat.format(tooltip.segment.customerCount)
                    : formatVnd(tooltip.segment.revenue)}
                </strong>
                <span className="text-[#687284]">Share</span>
                <strong className="text-[#17366f]">
                  {percentFormat.format(
                    mode === "customers"
                      ? tooltip.segment.customerShare
                      : tooltip.segment.revenueShare,
                  )}
                </strong>
              </div>
            ) : null}
            <p className="mt-2 border-t border-[#e8ecf2] pt-2 text-[10px] leading-[1.4] text-[#596273]">
              {tooltip.segment.definition}
            </p>
            {tooltip.point ? (
              <TopProductsTooltipContent
                products={tooltip.segment.topProducts ?? []}
                contextLabel={tooltip.segment.segment}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
