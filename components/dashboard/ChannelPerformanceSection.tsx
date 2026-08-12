"use client";

import { useState } from "react";
import type {
  ChannelPerformance,
  ChannelPerformanceDataset,
  ChannelPerformanceStatus,
} from "@/data/contracts/dashboard";
import { channelPerformanceDataset } from "@/data/fixtures/channel-performance.fixture";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type AnalysisMode = "content" | "platform";
const numberFormat = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});
const percentFormat = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  maximumFractionDigits: 1,
});
const contentColors: Record<string, string> = {
  Ads: "#F2A93B",
  Affiliate: "#25C7B7",
  Livestream: "#9B6DFF",
  "Product Card": "#4ADE80",
  "Shop Tab": "#22D3EE",
  Video: "#4C8DFF",
};
const platformColors: Record<string, string> = {
  Shopee: "#EE4D2D",
  Lazada: "#5267D8",
  "TikTok Shop": "#25C9C5",
};
const statusMeta: Record<
  ChannelPerformanceStatus,
  { label: string; color: string; background: string; recommendation: string }
> = {
  active_no_result: {
    label: "Đã khai thác · Chưa tạo kết quả",
    color: "#d9564f",
    background: "#fff4f2",
    recommendation:
      "Kiểm tra khả năng đo lường và đường dẫn chuyển đổi trước khi tiếp tục tăng traffic.",
  },
  low_efficiency: {
    label: "Hiệu quả thấp",
    color: "#c87816",
    background: "#fff8e8",
    recommendation:
      "Tối ưu creative, CTA, placement hoặc targeting trước khi tiếp tục scale traffic.",
  },
  not_activated: {
    label: "Chưa khai thác",
    color: "#737b89",
    background: "#f4f5f7",
    recommendation:
      "Cân nhắc thử nghiệm nếu phù hợp với chiến lược thu hút khách hàng.",
  },
  healthy: {
    label: "Hoạt động tốt",
    color: "#14866d",
    background: "#edf9f5",
    recommendation: "Duy trì hiệu suất và cân nhắc mở rộng có kiểm soát.",
  },
};

function DiagnosticDetail({ row }: { row: ChannelPerformance }) {
  const noResult = row.status === "active_no_result";
  return (
    <div className="border-t border-[#e8ebf1] bg-[#fafbfd] px-3 py-2 text-[11px] leading-[1.45] text-[#596273]">
      <b className="text-[10px] tracking-[.07em] text-[#7c8492]">TÍN HIỆU</b>
      <p className="mt-0.5">
        {noResult
          ? "Có activity nhưng chưa tạo Product View."
          : "CVR thấp hơn median của nhóm đang hoạt động."}
      </p>
      <p className="mt-1">
        <b className="text-[10px] tracking-[.07em] text-[#7c8492]">
          NÊN KIỂM TRA
        </b>{" "}
        · Creative · CTA · Placement · Targeting
      </p>
      <p className="mt-1 font-medium text-[#31394a]">
        {statusMeta[row.status].recommendation}
      </p>
    </div>
  );
}

function PerformanceRow({
  row,
  maxActivity,
  color,
  expanded,
  onToggle,
  mode,
}: {
  row: ChannelPerformance;
  maxActivity: number;
  color: string;
  expanded: boolean;
  onToggle: () => void;
  mode: AnalysisMode;
}) {
  const meta = statusMeta[row.status],
    problem =
      row.status === "active_no_result" || row.status === "low_efficiency",
    tooltip = `${row.channel}\nActivity: ${numberFormat.format(row.activity)}\nProduct Views: ${numberFormat.format(row.productViews)}\nCVR: ${row.conversionRate === null ? "—" : percentFormat.format(row.conversionRate)}\nRelative benchmark: ${row.benchmark === null ? "—" : percentFormat.format(row.benchmark)}\nStatus: ${meta.label}`;
  return (
    <div className="border-t border-[#eef1f5] first:border-0">
      <button
        type="button"
        disabled={!problem}
        aria-expanded={problem ? expanded : undefined}
        title={tooltip}
        onClick={onToggle}
        className="w-full px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#3b82f6] disabled:cursor-default"
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: color }}
          />
          <strong className="min-w-0 flex-1 truncate text-[12px] text-[#172033]">
            {row.channel}
          </strong>
          <span className="text-[11.5px] font-semibold text-[#273247]">
            {row.conversionRate === null
              ? "—"
              : percentFormat.format(row.conversionRate)}
          </span>
          <span
            className="whitespace-nowrap rounded-full px-2 py-0.5 text-[9.5px] font-semibold"
            style={{ color: meta.color, background: meta.background }}
          >
            {meta.label}
            {problem ? (
              <span
                className={`ml-1 inline-block transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                ⌄
              </span>
            ) : null}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#edf1f6]">
          <span
            className="block h-full rounded-full opacity-55 transition-[width] duration-300"
            style={{
              background: color,
              width: `${maxActivity ? (row.activity / maxActivity) * 100 : 0}%`,
            }}
          >
            <span
              className="block h-full rounded-full opacity-100"
              style={{
                background: color,
                width: `${row.activity ? Math.min(100, (row.productViews / row.activity) * 100) : 0}%`,
              }}
            />
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between text-[10.5px] text-[#717b8b]">
          <span>
            {numberFormat.format(row.activity)} →{" "}
            <b style={{ color }}>{numberFormat.format(row.productViews)}</b>
          </span>
          {mode === "platform" && (
            <span>
              {row.activeContentCount}/{row.totalContentCount} Content hoạt động
            </span>
          )}
        </div>
      </button>
      {problem && expanded ? <DiagnosticDetail row={row} /> : null}
    </div>
  );
}

export function ChannelPerformanceSection({
  data = channelPerformanceDataset,
}: {
  data?: ChannelPerformanceDataset;
}) {
  const [mode, setMode] = useState<AnalysisMode>("content"),
    [expanded, setExpanded] = useState<string | null>(null);
  const rows = mode === "content" ? data.channels : data.platforms,
    benchmark = mode === "content" ? data.benchmark : data.platformBenchmark,
    maxActivity = Math.max(0, ...rows.map((row) => row.activity)),
    attention = rows.filter(
      (row) =>
        row.status === "active_no_result" || row.status === "low_efficiency",
    ).length,
    colors = mode === "content" ? contentColors : platformColors;
  const changeMode = (next: AnalysisMode) => {
    setMode(next);
    setExpanded(null);
  };
  return (
    <section className="flex min-w-0 flex-col min-[1050px]:h-full">
      <div className="min-[1050px]:min-h-[74px]">
        <SectionHeading
          title="06. Hiệu quả khai thác kênh"
          subtitle="Đánh giá mức độ khai thác và khả năng tạo chuyển đổi theo Content và nền tảng."
        />
      </div>
      <Card className="min-h-[420px] max-w-full flex-1 min-[1050px]:min-h-[520px]">
        <header className="px-4 pb-1.5 pt-3">
          <h3 className="text-[16px] font-semibold text-[#172033]">
            Tình trạng khai thác
          </h3>
          <p className="mt-0.5 text-[11.5px] text-[#747d8b]">
            Mức độ hoạt động và hiệu quả tạo Product View
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <SegmentedControl
              value={mode}
              onChange={changeMode}
              ariaLabel="Góc nhìn phân tích kênh"
              options={[
                { value: "content", label: "Theo Content" },
                { value: "platform", label: "Theo Nền tảng" },
              ]}
            />
            <span className="text-[10.5px] text-[#747d8b]">
              {rows.length} {mode === "content" ? "Content" : "nền tảng"} ·{" "}
              <b className="text-[#c87816]">{attention} cần chú ý</b>
            </span>
          </div>
          <p className="mt-1.5 text-[10px] text-[#8a92a0]">
            Median tương đối hiện tại:{" "}
            <b className="text-[#536176]">
              {benchmark === null ? "—" : percentFormat.format(benchmark)}
            </b>
          </p>
        </header>
        <div
          key={mode}
          className="animate-[fadeIn_.22s_ease-out] border-t border-[#e8ecf2]"
        >
          {rows.map((row) => (
            <PerformanceRow
              key={row.id}
              row={row}
              maxActivity={maxActivity}
              color={colors[row.channel] ?? "#3b82f6"}
              mode={mode}
              expanded={expanded === row.id}
              onToggle={() =>
                setExpanded((current) => (current === row.id ? null : row.id))
              }
            />
          ))}
        </div>
      </Card>
    </section>
  );
}
