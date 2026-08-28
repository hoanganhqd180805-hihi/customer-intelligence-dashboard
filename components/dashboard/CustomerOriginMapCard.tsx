"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CustomerOriginMetric,
  TopProductMetric,
} from "@/data/contracts/dashboard";
import { customerOriginMockData } from "@/data/fixtures/customer-origin.fixture";
import { mockTopProductsByProvinceId } from "@/data/fixtures/customer-overview-products.fixture";
import { TopProductsTooltipContent } from "@/components/dashboard/TopProductsTooltipContent";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type OriginMode = "customers" | "revenue";

interface CustomerOriginTooltip {
  metric: CustomerOriginMetric;
  products: TopProductMetric[];
  x: number;
  y: number;
}

const CHART_HEIGHT = 300;
const MARGIN = { top: 14, right: 52, bottom: 31, left: 91 };
const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatRevenue(value: number) {
  return `${compactFormat.format(value)} ₫`;
}

function niceMaximum(value: number, mode: OriginMode) {
  if (mode === "customers") return Math.max(10, Math.ceil(value / 10) * 10);
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, value)));
  return Math.ceil(value / magnitude) * magnitude;
}

function useElementWidth<T extends HTMLElement>(fallback = 480) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(Math.max(320, element.clientWidth));
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

export function CustomerOriginMapCard({
  data = customerOriginMockData,
  productsByProvinceId = mockTopProductsByProvinceId,
}: {
  data?: CustomerOriginMetric[];
  productsByProvinceId?: Record<string, TopProductMetric[]>;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [mode, setMode] = useState<OriginMode>("customers");
  const [tooltip, setTooltip] = useState<CustomerOriginTooltip | null>(null);
  const topProvinces = useMemo(() => {
    const valueFor = (metric: CustomerOriginMetric) =>
      mode === "customers" ? metric.customerCount : metric.revenue;
    return [...data]
      .sort((first, second) => valueFor(second) - valueFor(first))
      .slice(0, 10);
  }, [data, mode]);
  const values = topProvinces.map((metric) =>
    mode === "customers" ? metric.customerCount : metric.revenue,
  );
  const maximum = niceMaximum(Math.max(1, ...values), mode);
  const plotWidth = Math.max(1, width - MARGIN.left - MARGIN.right);
  const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const rowHeight = plotHeight / Math.max(1, topProvinces.length);
  const barHeight = Math.min(16, rowHeight * 0.62);
  const ticks = Array.from({ length: 5 }, (_, index) =>
    Math.round((maximum / 4) * index),
  );
  const barColor = mode === "customers" ? "#3B82F6" : "#20A7A1";

  const showTooltip = (
    metric: CustomerOriginMetric,
    clientX: number,
    clientY: number,
  ) => {
    const container = ref.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const tooltipWidth = 222;
    const tooltipHeight = 150;
    setTooltip({
      metric,
      products: productsByProvinceId[metric.provinceId] ?? [],
      x: Math.max(
        4,
        Math.min(clientX - rect.left + 10, rect.width - tooltipWidth - 4),
      ),
      y: Math.max(
        4,
        Math.min(clientY - rect.top - 58, rect.height - tooltipHeight - 4),
      ),
    });
  };

  const showKeyboardTooltip = (
    metric: CustomerOriginMetric,
    target: SVGRectElement,
  ) => {
    const rect = target.getBoundingClientRect();
    showTooltip(metric, rect.right, rect.top + rect.height / 2);
  };

  return (
    <Card className="h-full min-h-[420px] px-5 pb-4 pt-4 min-[1280px]:h-[430px] min-[1280px]:min-h-[430px]">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[16px] font-semibold text-[#172033]">
            Customer Origin
          </h3>
          <p className="mt-0.5 text-[11.5px] text-[#747d8b]">
            Top 10 provinces by{" "}
            {mode === "customers" ? "customer volume" : "revenue"}
          </p>
        </div>
        <SegmentedControl
          value={mode}
          onChange={(value) => {
            setMode(value);
            setTooltip(null);
          }}
          ariaLabel="Customer origin metric"
          options={[
            { value: "customers", label: "Customer" },
            { value: "revenue", label: "Revenue" },
          ]}
        />
      </header>

      <div
        ref={ref}
        className="relative mt-2 w-full"
        onMouseLeave={() => setTooltip(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setTooltip(null);
        }}
      >
        <svg
          width="100%"
          height={CHART_HEIGHT}
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          role="img"
          aria-label={`Top 10 provinces by ${mode}`}
          className="block overflow-visible"
        >
          {ticks.map((tick) => {
            const x = MARGIN.left + (tick / maximum) * plotWidth;
            return (
              <g key={tick}>
                <line
                  x1={x}
                  x2={x}
                  y1={MARGIN.top}
                  y2={CHART_HEIGHT - MARGIN.bottom}
                  stroke="#e6eaf0"
                />
                <text
                  x={x}
                  y={CHART_HEIGHT - 9}
                  textAnchor="middle"
                  fill="#727b89"
                  fontSize="9.5"
                >
                  {compactFormat.format(tick)}
                </text>
              </g>
            );
          })}

          {topProvinces.map((metric, index) => {
            const value =
              mode === "customers" ? metric.customerCount : metric.revenue;
            const y = MARGIN.top + rowHeight * index + rowHeight / 2;
            const barWidth = (value / maximum) * plotWidth;
            const active = tooltip?.metric.provinceId === metric.provinceId;
            const formattedValue =
              mode === "customers"
                ? numberFormat.format(value)
                : formatRevenue(value);
            return (
              <g key={metric.provinceId}>
                <text
                  x={MARGIN.left - 9}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#465166"
                  fontSize="10"
                  fontWeight="500"
                >
                  {metric.province}
                </text>
                <rect
                  x={MARGIN.left}
                  y={y - barHeight / 2}
                  width={barWidth}
                  height={barHeight}
                  rx={3.5}
                  fill={barColor}
                  opacity={tooltip && !active ? 0.58 : active ? 1 : 0.86}
                  stroke={active ? "#172e63" : "none"}
                  strokeWidth={active ? 1.2 : 0}
                  role="graphics-symbol"
                  tabIndex={0}
                  aria-label={`${index + 1}. ${metric.province}: ${formattedValue}${mode === "customers" ? " customers" : " revenue"}`}
                  onMouseEnter={(event) =>
                    showTooltip(metric, event.clientX, event.clientY)
                  }
                  onMouseMove={(event) =>
                    showTooltip(metric, event.clientX, event.clientY)
                  }
                  onFocus={(event) =>
                    showKeyboardTooltip(metric, event.currentTarget)
                  }
                  onClick={(event) =>
                    showTooltip(metric, event.clientX, event.clientY)
                  }
                  className="cursor-default outline-none focus-visible:stroke-[#172e63] focus-visible:stroke-2"
                />
                <text
                  x={Math.min(
                    MARGIN.left + barWidth + 6,
                    width - MARGIN.right + 5,
                  )}
                  y={y + 3.5}
                  fill="#17366f"
                  fontSize="9.5"
                  fontWeight="600"
                >
                  {mode === "customers"
                    ? numberFormat.format(value)
                    : compactFormat.format(value)}
                </text>
              </g>
            );
          })}
        </svg>

        {tooltip ? (
          <div
            role="tooltip"
            className="pointer-events-auto absolute z-40 w-[222px] rounded-lg border border-[#d8deea] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(28,39,63,.16)]"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <strong className="block text-[12px] font-semibold text-[#172033]">
              {tooltip.metric.province}
            </strong>
            <div className="mt-1 grid grid-cols-[1fr_auto] gap-x-3 text-[10.5px]">
              <span className="text-[#687284]">Customers</span>
              <strong className="text-[#17366f]">
                {numberFormat.format(tooltip.metric.customerCount)}
              </strong>
              <span className="text-[#687284]">Revenue</span>
              <strong className="text-[#17366f]">
                {formatRevenue(tooltip.metric.revenue)}
              </strong>
            </div>
            <TopProductsTooltipContent products={tooltip.products} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
