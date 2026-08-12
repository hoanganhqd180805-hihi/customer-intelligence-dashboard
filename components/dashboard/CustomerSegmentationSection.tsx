"use client";

import { useState } from "react";
import type {
  CustomerSegmentationDataset,
  CustomerSegmentMetric,
} from "@/data/contracts/dashboard";
import { customerSegmentationDataset } from "@/data/fixtures/customer-segmentation-workbook.fixture";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DonutPercentageLabels } from "@/components/ui/DonutPercentageLabels";

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
const radius = 68,
  circumference = 2 * Math.PI * radius;
const segmentNames: Record<string, string> = {
  "Ngủ đông": "Dormant",
  "Khách mới": "New Customers",
  "Khách thường": "Regular Customers",
  "Tiềm năng": "Potential",
  "Nguy cơ rời bỏ": "At Risk",
  VIP: "VIP",
};
const segmentName = (value: string) => segmentNames[value] ?? value;

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
      className="relative mx-auto h-[220px] w-[280px] max-w-full shrink-0"
      onClick={() => onSelect(null)}
    >
      <svg
        viewBox="0 0 260 220"
        role="img"
        aria-label={
          mode === "customers"
            ? "Customer distribution by segment"
            : "Revenue contribution by segment"
        }
        className="h-full w-full overflow-visible"
      >
        <circle
          cx="130"
          cy="110"
          r={radius}
          fill="none"
          stroke="#edf0f5"
          strokeWidth="28"
        />
        {arcs.map(({ segment, share, offset }) => {
          const dash = Math.max(0, share * circumference),
            dashOffset = -offset * circumference;
          return (
            <circle
              key={segment.id}
              cx="130"
              cy="110"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={activeId === segment.id ? 31 : 28}
              strokeDasharray={`${dash} ${Math.max(0, circumference - dash)}`}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 130 110)"
              strokeLinecap="butt"
              className="cursor-pointer transition-[stroke-dasharray,stroke-dashoffset,stroke-width,opacity] duration-300 ease-out focus:outline-none motion-reduce:transition-none"
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
                onSelect(selected === segment.id ? null : segment.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(selected === segment.id ? null : segment.id);
                }
              }}
            >
              <title>
                {mode === "customers"
                  ? `${segmentName(segment.segment)} · ${countFormat.format(segment.customerCount)} customers · ${percentFormat.format(segment.customerShare)}`
                  : `${segmentName(segment.segment)} · ${revenueFormat.format(segment.revenue)} ₫ · ${percentFormat.format(segment.revenueShare)}`}
              </title>
            </circle>
          );
        })}
        <DonutPercentageLabels
          data={arcs.map(({ segment, share }) => ({
            id: segment.id,
            share,
            color: segment.color,
          }))}
          cx={130}
          cy={110}
          radius={82}
          labelOffset={10}
          minimumShare={0.05}
          format={(share) => percentFormat.format(share)}
        />
      </svg>
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center">
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
    [selected, setSelected] = useState<string | null>(null);
  return (
    <section className="flex min-w-0 flex-col min-[1050px]:h-full">
      <div className="min-[1050px]:min-h-[74px]">
        <SectionHeading
          title="03. Customer Segmentation"
          subtitle="Group customers by purchase behavior and contribution value to support retention and growth."
        />
      </div>
      <Card className="flex min-h-[380px] flex-1 flex-col px-3.5 pb-2.5 pt-2.5 min-[1050px]:min-h-[420px]">
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
              }}
              ariaLabel="Customer segmentation metric"
              options={[
                { value: "customers", label: "Customer Count" },
                { value: "revenue", label: "Revenue Contribution" },
              ]}
            />
          </div>
        </header>
        <div className="mt-2 grid flex-1 grid-cols-[minmax(0,58fr)_minmax(0,42fr)] items-center gap-1 max-[560px]:grid-cols-1">
          <SegmentationDonut
            data={data}
            mode={mode}
            hovered={hovered}
            selected={selected}
            onHover={setHovered}
            onSelect={setSelected}
          />
          <div className="min-w-0 space-y-0.5">
            {data.segments.map((segment) => {
              return (
                <div
                  key={segment.id}
                  onMouseEnter={() => setHovered(segment.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors ${selected === segment.id ? "bg-[#f4f7fb]" : ""}`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: segment.color }}
                  />
                  <p className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-[#273247]">
                    {segmentName(segment.segment)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2 border-t border-[#e8ecf2] pt-3 text-[11px] leading-relaxed text-[#5f6877]">
          <span className="mr-1 text-[#3b82f6]">●</span>
          Potential customers represent 3.3% of customers but contribute 5.7% of
          revenue.
        </p>
      </Card>
    </section>
  );
}
