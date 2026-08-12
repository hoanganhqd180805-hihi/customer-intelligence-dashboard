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

type SegmentMode = "customers" | "revenue";
const countFormat = new Intl.NumberFormat("vi-VN");
const revenueFormat = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentFormat = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  maximumFractionDigits: 1,
});
const radius = 72,
  circumference = 2 * Math.PI * radius;

function SegmentTooltip({ segment }: { segment: CustomerSegmentMetric }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[185px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] border border-[#dce2ec] bg-white/95 px-3 py-2 text-[10.5px] leading-[1.55] text-[#657084] shadow-[0_8px_24px_rgba(31,45,72,.16)] backdrop-blur"
    >
      <strong className="text-[12px] text-[#172033]">{segment.segment}</strong>
      <p className="mt-1">
        Khách hàng: <b>{countFormat.format(segment.customerCount)}</b>
      </p>
      <p>
        Tỷ trọng khách: <b>{percentFormat.format(segment.customerShare)}</b>
      </p>
      <p>
        Doanh thu: <b>{revenueFormat.format(segment.revenue)} ₫</b>
      </p>
      <p>
        Đóng góp doanh thu: <b>{percentFormat.format(segment.revenueShare)}</b>
      </p>
    </div>
  );
}

function SegmentationDonut({
  data,
  mode,
  hovered,
  onHover,
}: {
  data: CustomerSegmentationDataset;
  mode: SegmentMode;
  hovered: string | null;
  onHover: (id: string | null) => void;
}) {
  const arcs = data.segments.reduce<
    Array<{ segment: CustomerSegmentMetric; share: number; offset: number }>
  >((items, segment) => {
    const share =
        mode === "customers" ? segment.customerShare : segment.revenueShare,
      offset = items.reduce((sum, item) => sum + item.share, 0);
    return [...items, { segment, share, offset }];
  }, []);
  return (
    <div className="relative mx-auto h-[200px] w-[200px] shrink-0">
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={
          mode === "customers"
            ? "Cơ cấu tỷ trọng khách hàng"
            : "Cơ cấu đóng góp doanh thu"
        }
        className="h-full w-full -rotate-90 overflow-visible"
      >
        <circle
          cx="100"
          cy="100"
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
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={hovered === segment.id ? 32 : 28}
              strokeDasharray={`${dash} ${Math.max(0, circumference - dash)}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              className="cursor-pointer transition-[stroke-dasharray,stroke-dashoffset,stroke-width,opacity] duration-300 ease-out"
              opacity={hovered ? (hovered === segment.id ? 1 : 0.75) : 1}
              onMouseEnter={() => onHover(segment.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(segment.id)}
              onBlur={() => onHover(null)}
              tabIndex={0}
              role="button"
              aria-label={`${segment.segment}: ${percentFormat.format(share)}`}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10.5px] text-[#7b8492]">
          {mode === "customers" ? "Tổng khách hàng" : "Tổng doanh thu"}
        </span>
        <strong className="mt-0.5 text-[24px] leading-none text-[#17366f]">
          100%
        </strong>
        <span className="mt-1 text-[10px] text-[#8b93a0]">
          {mode === "customers"
            ? `${countFormat.format(data.totalCustomers)} khách`
            : `${revenueFormat.format(data.totalRevenue)} ₫`}
        </span>
      </div>
      {hovered && (
        <SegmentTooltip
          segment={data.segments.find((segment) => segment.id === hovered)!}
        />
      )}
    </div>
  );
}

export function CustomerSegmentationSection({
  data = customerSegmentationDataset,
}: {
  data?: CustomerSegmentationDataset;
}) {
  const [mode, setMode] = useState<SegmentMode>("customers"),
    [hovered, setHovered] = useState<string | null>(null);
  return (
    <section className="flex min-w-0 flex-col min-[1050px]:h-full">
      <div className="min-[1050px]:min-h-[74px]">
        <SectionHeading
          title="03. Phân khúc khách hàng"
          subtitle="Phân nhóm khách hàng theo hành vi mua và giá trị đóng góp để hỗ trợ chiến lược giữ chân và tăng trưởng."
        />
      </div>
      <Card className="flex min-h-[400px] flex-1 flex-col px-3.5 pb-2.5 pt-2.5 min-[1050px]:min-h-[460px]">
        <header>
          <h3 className="text-[16px] font-semibold text-[#172033]">
            Cơ cấu phân khúc
          </h3>
          <p className="mt-0.5 text-[11.5px] text-[#747d8b]">
            Phân bổ khách hàng và mức đóng góp của từng nhóm
          </p>
          <div className="mt-2.5 flex justify-start">
            <SegmentedControl
              value={mode}
              onChange={(next) => {
                setMode(next);
                setHovered(null);
              }}
              ariaLabel="Chỉ số phân khúc khách hàng"
              options={[
                { value: "customers", label: "Số lượng khách" },
                { value: "revenue", label: "Doanh thu đóng góp" },
              ]}
            />
          </div>
        </header>
        <div className="mt-3 grid flex-1 grid-cols-[210px_minmax(0,1fr)] items-center gap-3 max-[560px]:grid-cols-1">
          <SegmentationDonut
            data={data}
            mode={mode}
            hovered={hovered}
            onHover={setHovered}
          />
          <div className="min-w-0 space-y-1">
            {data.segments.map((segment) => {
              const share =
                  mode === "customers"
                    ? segment.customerShare
                    : segment.revenueShare,
                value =
                  mode === "customers"
                    ? `${countFormat.format(segment.customerCount)} khách`
                    : `${revenueFormat.format(segment.revenue)} ₫`;
              return (
                <div
                  key={segment.id}
                  onMouseEnter={() => setHovered(segment.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${hovered === segment.id ? "bg-[#f4f7fb]" : ""}`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: segment.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-medium text-[#273247]">
                      {segment.segment}
                    </p>
                    <p className="truncate text-[9.5px] text-[#858d9a]">
                      {value}
                    </p>
                  </div>
                  <strong className="text-[11.5px] text-[#172033]">
                    {percentFormat.format(share)}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2 border-t border-[#e8ecf2] pt-2.5 text-[11px] leading-relaxed text-[#5f6877]">
          <span className="mr-1 text-[#3b82f6]">●</span>
          {data.insight}
        </p>
      </Card>
    </section>
  );
}
