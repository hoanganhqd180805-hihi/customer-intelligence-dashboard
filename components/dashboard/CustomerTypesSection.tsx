"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyCardContent } from "@/components/ui/EmptyCardContent";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DonutPercentageLabels } from "@/components/ui/DonutPercentageLabels";
import type {
  CustomerTypeDailyPoint,
  CustomerTypesDataset,
} from "@/data/contracts/dashboard";
import { getCustomerTypeData } from "@/data/services/customer-type.service";
import { useSectionData } from "@/lib/hooks/use-section-data";
import { useDashboardDateRange } from "./DashboardDateRangeContext";

const isCustomerTypeEmpty = (data: CustomerTypesDataset) =>
  data.daily.length === 0 && data.revenueContribution.length === 0;

function SectionState({
  status,
  message,
}: {
  status: "loading" | "empty" | "unavailable" | "error";
  message?: string;
}) {
  const text =
    status === "loading"
      ? "Loading data"
      : status === "empty"
        ? "No data for this period"
        : status === "unavailable"
          ? "Data unavailable"
          : "Unable to load data";
  return <EmptyCardContent label={message ? `${text}: ${message}` : text} />;
}

function DailyTrend({ points }: { points: CustomerTypeDailyPoint[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(430);
  const height = 300,
    left = 30,
    right = 12,
    top = 18,
    bottom = 38;
  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(1, Math.round(entry.contentRect.width))),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const observedMax = Math.max(
    1,
    ...points.flatMap((point) => [
      point.newCustomers,
      point.returningCustomers,
    ]),
  );
  const domainMax = Math.ceil((observedMax * 1.1) / 10) * 10;
  const x = (index: number) =>
    left + (index * (width - left - right)) / Math.max(1, points.length - 1);
  const y = (value: number) =>
    top + (1 - value / domainMax) * (height - top - bottom);
  const path = (key: "newCustomers" | "returningCustomers") =>
    points
      .map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point[key])}`)
      .join(" ");
  const ticks = Array.from(
    { length: domainMax / 10 + 1 },
    (_, index) => index * 10,
  );
  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-2 flex gap-4 text-[11px] text-[#707070]">
        <span>
          <i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#180bd4]" />
          New Customers
        </span>
        <span>
          <i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#16a085]" />
          Returning Customers
        </span>
      </div>
      <div ref={chartRef} className="h-[300px] w-full min-w-0">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block h-[300px] w-full"
          aria-label="Daily customer trend"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={left}
                y1={y(tick)}
                x2={width - right}
                y2={y(tick)}
                stroke="#e8ebf1"
                strokeWidth="1"
              />
              <text
                x={left - 6}
                y={y(tick) + 3}
                textAnchor="end"
                fontSize="8.5"
                fill="#929292"
              >
                {tick}
              </text>
            </g>
          ))}
          <path
            d={path("newCustomers")}
            fill="none"
            stroke="#180bd4"
            strokeWidth="2.25"
          />
          <path
            d={path("returningCustomers")}
            fill="none"
            stroke="#16a085"
            strokeWidth="2.25"
          />
          {points.flatMap((point, index) => {
            const pointX = x(index),
              newY = y(point.newCustomers),
              returningY = y(point.returningCustomers),
              sameValue = point.newCustomers === point.returningCustomers;
            return [
              <circle
                key={`n-${point.date}`}
                cx={pointX}
                cy={newY}
                r="3"
                fill="#180bd4"
              >
                <title>{`${point.date}: ${point.newCustomers} new customers`}</title>
              </circle>,
              <text
                key={`nv-${point.date}`}
                x={pointX}
                y={newY - 7}
                textAnchor="middle"
                fontSize="8"
                fontWeight="600"
                fill="#180bd4"
              >
                {point.newCustomers}
              </text>,
              <circle
                key={`r-${point.date}`}
                cx={pointX}
                cy={returningY}
                r="3.5"
                fill="#16a085"
              >
                <title>{`${point.date}: ${point.returningCustomers} returning customers`}</title>
              </circle>,
              <text
                key={`rv-${point.date}`}
                x={pointX}
                y={returningY - (sameValue ? 17 : 7)}
                textAnchor="middle"
                fontSize="8"
                fontWeight="600"
                fill="#12806b"
              >
                {point.returningCustomers}
              </text>,
              ...(index % 4 === 0 || index === points.length - 1
                ? [
                    <text
                      key={`d-${point.date}`}
                      x={pointX}
                      y={height - 9}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#858585"
                    >
                      {point.date.slice(5).replace("-", "/")}
                    </text>,
                  ]
                : []),
            ];
          })}
        </svg>
      </div>
    </div>
  );
}

function RevenueContribution({
  data,
}: {
  data: CustomerTypesDataset["revenueContribution"];
}) {
  const [selected, setSelected] = useState<"new" | "returning" | null>(null);
  const [hovered, setHovered] = useState<"new" | "returning" | null>(null);
  const colors = { new: "#180bd4", returning: "#16a085" } as const;
  const radius = 76,
    circumference = 2 * Math.PI * radius;
  const activeId = selected ?? hovered;
  const active = data.find((item) => item.customerType === activeId);
  const arcs = data.map((item, index) => ({
    item,
    offset: data
      .slice(0, index)
      .reduce((sum, entry) => sum + entry.revenueShare, 0),
  }));
  return (
    <div className="@container flex h-full w-full items-center justify-center">
      <div className="flex w-full flex-col items-center justify-center gap-3 @[340px]:flex-row @[340px]:gap-2">
        <div
          className="relative aspect-square w-[clamp(190px,18vw,230px)] max-w-[230px] shrink-0"
          onClick={() => setSelected(null)}
        >
          <svg
            viewBox="0 0 220 220"
            role="img"
            aria-label="Revenue composition by customer type"
            className="h-full w-full overflow-visible"
          >
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="#edf0f5"
              strokeWidth="34"
            />
            {arcs.map(({ item, offset }) => {
              const isActive = activeId === item.customerType;
              return (
                <circle
                  key={item.customerType}
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke={colors[item.customerType]}
                  strokeWidth={isActive ? 38 : 34}
                  strokeDasharray={`${item.revenueShare * circumference} ${circumference}`}
                  strokeDashoffset={-offset * circumference}
                  transform="rotate(-90 110 110)"
                  className="cursor-pointer transition-[stroke-width,opacity] duration-200 focus:outline-none focus-visible:stroke-[40px] motion-reduce:transition-none"
                  opacity={activeId && !isActive ? 0.45 : 1}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selected === item.customerType}
                  aria-label={`${item.customerType === "new" ? "New Customers" : "Returning Customers"}: ${formatPercent(item.revenueShare)}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelected((current) =>
                      current === item.customerType ? null : item.customerType,
                    );
                  }}
                  onMouseEnter={() => setHovered(item.customerType)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(item.customerType)}
                  onBlur={() => setHovered(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected((current) =>
                        current === item.customerType
                          ? null
                          : item.customerType,
                      );
                    }
                  }}
                >
                  <title>{`${item.customerType === "new" ? "New Customers" : "Returning Customers"}: ${formatPercent(item.revenueShare)}${item.revenue == null ? "" : ` · ${formatRevenue(item.revenue)}`}`}</title>
                </circle>
              );
            })}
            <DonutPercentageLabels
              data={data.map((item) => ({
                id: item.customerType,
                share: item.revenueShare,
                color: colors[item.customerType],
              }))}
              cx={110}
              cy={110}
              radius={96}
              format={formatPercent}
            />
          </svg>
          <div className="pointer-events-none absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-white px-2 text-center">
            <span className="text-[10px] text-[#747d8b]">
              {active
                ? active.customerType === "new"
                  ? "New Customers"
                  : "Returning Customers"
                : "Revenue Composition"}
            </span>
            <strong className="mt-1 text-[21px] leading-none text-[#17366f]">
              {active ? formatPercent(active.revenueShare) : "100%"}
            </strong>
            {active?.revenue != null && (
              <span className="mt-1 text-[10px] text-[#747d8b]">
                {formatRevenue(active.revenue)}
              </span>
            )}
          </div>
        </div>
        <div className="w-full min-w-[100px] max-w-[135px] space-y-3">
          {data.map((item) => (
            <div
              key={item.customerType}
              className="flex items-center gap-2 whitespace-nowrap text-[11px]"
            >
              <i
                className="h-2 w-2 rounded-full"
                style={{ background: colors[item.customerType] }}
              />
              <span>
                {item.customerType === "new"
                  ? "New Customers"
                  : "Returning Customers"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const formatPercent = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
const formatRevenue = (value: number) =>
  `${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)} ₫`;

function CustomerTypesContent({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const state = useSectionData(
    getCustomerTypeData,
    startDate,
    endDate,
    isCustomerTypeEmpty,
  );
  const fallback =
    state.status === "success" ? null : (
      <SectionState
        status={state.status}
        message={state.status === "error" ? state.message : undefined}
      />
    );
  return (
    <Card
      className="grid h-[430px] grid-cols-[7fr_3fr] overflow-hidden"
      aria-busy={state.status === "loading"}
    >
      <div className="flex min-w-0 flex-col p-5">
        <h3 className="text-[15px] font-semibold">Daily Customer Trend</h3>
        <p className="mt-1 text-[12px] text-[#707070]">
          New and returning customer counts
        </p>
        <div className="mt-4 min-h-0 flex-1">
          {state.status === "success" ? (
            <DailyTrend points={state.data.daily} />
          ) : (
            fallback
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-col border-l border-[#dedede] p-5">
        <h3 className="text-[15px] font-semibold">Revenue Composition</h3>
        <p className="mt-1 text-[12px] text-[#707070]">By customer type</p>
        <div className="mt-4 min-h-0 flex-1">
          {state.status === "success" ? (
            <RevenueContribution data={state.data.revenueContribution} />
          ) : (
            fallback
          )}
        </div>
      </div>
    </Card>
  );
}

export function CustomerTypesSection() {
  const { startDate, endDate } = useDashboardDateRange();
  return (
    <section>
      <SectionHeading
        title="01. Customer Type Overview"
        subtitle="New customers, returning customers, and revenue contribution."
      />
      <CustomerTypesContent
        key={`${startDate}:${endDate}`}
        startDate={startDate}
        endDate={endDate}
      />
    </section>
  );
}
