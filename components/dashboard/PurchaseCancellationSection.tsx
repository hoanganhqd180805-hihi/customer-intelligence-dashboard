"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { PurchaseTimeDataset } from "@/data/contracts/dashboard";
import { getPurchaseTimeData } from "@/data/services/purchase-time.service";
import { useSectionData } from "@/lib/hooks/use-section-data";
import { useDashboardDateRange } from "./DashboardDateRangeContext";
import { adaptCancellationWorkbookData } from "@/data/adapters/cancellation.adapter";
import { rawCancellationWorkbookFixture } from "@/data/fixtures/section02-workbook.fixture";
import type { CancellationAnalysisDataset } from "@/data/contracts/dashboard";

type CancellationView = "orders" | "revenue";
const cancellationOptions = [
  { value: "orders", label: "By Orders" },
  { value: "revenue", label: "Revenue" },
] as const;
const cancellationData = adaptCancellationWorkbookData(
  rawCancellationWorkbookFixture,
);
const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});
const fullNumber = new Intl.NumberFormat("en-US");
const weekdayNames: Record<string, string> = {
  "Thứ Hai": "Monday",
  "Thứ Ba": "Tuesday",
  "Thứ Tư": "Wednesday",
  "Thứ Năm": "Thursday",
  "Thứ Sáu": "Friday",
  "Thứ Bảy": "Saturday",
  "Chủ Nhật": "Sunday",
};

const isPurchaseTimeEmpty = (data: PurchaseTimeDataset) =>
  data.timeSlotTotals.length === 0 && data.weekdayTotals.length === 0;

function PurchaseVisualization({ data }: { data: PurchaseTimeDataset }) {
  const maxSlot = Math.max(
    1,
    ...data.timeSlotTotals.map((item) => item.totalOrders),
  );
  return (
    <div className="grid h-full grid-cols-[54px_repeat(6,1fr)] grid-rows-[22px_repeat(7,1fr)] gap-1.5">
      <span />
      {data.timeSlots.map((slot) => (
        <span
          key={slot}
          className="self-end text-center text-[9px] text-[#777]"
        >
          {slot}
        </span>
      ))}
      {data.weekdays.flatMap((day) => {
        const cells = data.timeSlots.map(
          (slot) =>
            data.timeSlotTotals.find(
              (item) => item.weekday === day && item.slot === slot,
            ) ?? null,
        );
        return [
          <span
            key={`${day}-label`}
            className="self-center text-[9px] text-[#777]"
          >
            {weekdayNames[day] ?? day}
          </span>,
          ...cells.map((cell, index) =>
            cell ? (
              <div
                key={`${day}-${cell.slot}`}
                title={`${weekdayNames[day] ?? day}, ${cell.slot}: ${cell.totalOrders} orders`}
                className="rounded-md"
                style={{
                  backgroundColor: `color-mix(in srgb, #180bd4 ${20 + (cell.totalOrders / maxSlot) * 80}%, white)`,
                }}
              />
            ) : (
              <div
                key={`${day}-${data.timeSlots[index]}`}
                title={`${weekdayNames[day] ?? day}, ${data.timeSlots[index]}: data not returned`}
                className="rounded-md border border-dashed border-[#d8dce5] bg-[#f7f7f7]"
              />
            ),
          ),
        ];
      })}
    </div>
  );
}

function CancellationVisualization({
  view,
  data,
}: {
  view: CancellationView;
  data: CancellationAnalysisDataset;
}) {
  const rows = useMemo(
    () =>
      [...data.reasons].sort((a, b) =>
        view === "orders"
          ? b.cancelledOrders - a.cancelledOrders
          : b.lostRevenue - a.lostRevenue,
      ),
    [data, view],
  );
  const share = (row: CancellationAnalysisDataset["reasons"][number]) =>
    view === "orders" ? row.orderShare : row.lostRevenueShare;
  const maxShare = Math.max(...rows.map(share));
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -3 }}
        transition={{ duration: 0.18 }}
        className="mt-2 flex flex-col gap-2"
      >
        {rows.map((row) => (
          <div
            key={row.reason}
            title={`${row.reason} · ${view === "orders" ? `${row.cancelledOrders} cancelled orders` : `${fullNumber.format(row.lostRevenue)} revenue loss`}`}
            className="grid grid-cols-[minmax(120px,1.3fr)_2fr_42px] items-center gap-2"
          >
            <span className="truncate text-[9px]">{row.reason}</span>
            <div className="h-2 overflow-hidden rounded-full bg-[#eef4fd]">
              <motion.div
                layout
                className="h-full rounded-full bg-[#3b82f6]"
                animate={{ width: `${(share(row) / maxShare) * 100}%` }}
                transition={{ duration: 0.22 }}
              />
            </div>
            <strong className="text-right text-[9px]">
              {(share(row) * 100).toFixed(1)}%
            </strong>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export function PurchaseTimeSection() {
  const { startDate, endDate } = useDashboardDateRange();
  const state = useSectionData(
    getPurchaseTimeData,
    startDate,
    endDate,
    isPurchaseTimeEmpty,
  );
  const stateLabel =
    state.status === "loading"
      ? "Loading data"
      : state.status === "empty"
        ? "No data for this period"
        : state.status === "unavailable"
          ? "Data unavailable"
          : state.status === "error"
            ? `Unable to load data: ${state.message}`
            : null;
  return (
    <section className="flex min-w-0 flex-col min-[1050px]:h-full">
      <div className="min-[1050px]:min-h-[74px]">
        <SectionHeading
          title="02. Purchase Timing"
          subtitle="When do customers typically place orders?"
        />
      </div>
      <Card className="flex min-h-[340px] w-full flex-1 flex-col p-3.5 min-[1050px]:min-h-[420px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold">Purchase Timing</h3>
            <p className="mt-1 text-[12px] text-[#707070]">
              When do customers usually purchase?
            </p>
          </div>
        </div>
        <div className="mt-2 flex min-h-0 flex-1 items-start">
          <div className="h-[250px] w-full">
            {state.status === "success" ? (
              <PurchaseVisualization data={state.data} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-[#fbfbfb] px-4 text-center text-[12px] text-[#aaa]">
                {stateLabel}
              </div>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}

export function CancellationAnalysisSection() {
  const [cancellationView, setCancellationView] =
    useState<CancellationView>("orders");
  return (
    <section className="flex min-w-0 flex-col min-[1050px]:h-full">
      <div className="min-[1050px]:min-h-[74px]">
        <SectionHeading
          title="07. Cancellation Analysis"
          subtitle="Cancellation reasons and associated revenue loss."
        />
      </div>
      <Card className="flex min-h-[368px] w-full flex-1 flex-col p-3.5 min-[1050px]:min-h-[520px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold">Cancellation Analysis</h3>
            <p className="mt-1 text-[12px] text-[#707070]">
              Share by Cancellation Reason
            </p>
          </div>
          <SegmentedControl
            value={cancellationView}
            options={cancellationOptions}
            onChange={setCancellationView}
            ariaLabel="Cancellation analysis metric"
          />
        </div>
        <CancellationVisualization
          view={cancellationView}
          data={cancellationData}
        />
        <div className="mt-auto grid grid-cols-2 gap-2.5 pt-4">
          <div className="rounded-xl border border-[#dedede] p-2">
            <span className="text-[9px] text-[#777]">
              {cancellationView === "orders"
                ? "Cancelled Orders"
                : "Current Revenue Loss"}
            </span>
            <strong className="mt-1 block text-[16px] text-[#180bd4]">
              {cancellationView === "orders"
                ? fullNumber.format(cancellationData.totalCancelledOrders)
                : compactNumber.format(cancellationData.totalLostRevenue)}
            </strong>
          </div>
          <div className="rounded-xl border border-[#dedede] p-2">
            <span className="text-[9px] text-[#777]">Vs. Previous Period</span>
            <strong className="mt-1 block text-[16px] text-[#3b82f6]">—</strong>
          </div>
        </div>
      </Card>
    </section>
  );
}

export function PurchaseCancellationSection() {
  return (
    <div className="grid grid-cols-1 gap-8 min-[1050px]:grid-cols-2 min-[1050px]:gap-4">
      <PurchaseTimeSection />
      <CancellationAnalysisSection />
    </div>
  );
}
