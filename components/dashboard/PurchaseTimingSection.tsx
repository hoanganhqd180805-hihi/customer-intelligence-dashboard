"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PurchaseTimeDataset } from "@/data/contracts/dashboard";
import { getPurchaseTimeData } from "@/data/services/purchase-time.service";
import { useSectionData } from "@/lib/hooks/use-section-data";
import { useDashboardDateRange } from "./DashboardDateRangeContext";

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
  data.timeSlotTotals.length === 0;
const orderFormat = new Intl.NumberFormat("en-US");

function PurchaseHeatmap({ data }: { data: PurchaseTimeDataset }) {
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const maxSlot = Math.max(
    1,
    ...data.timeSlotTotals.map((item) => item.totalOrders),
  );
  const activeCellId = selectedCellId ?? hoveredCellId;

  useEffect(() => {
    if (!selectedCellId) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (heatmapRef.current?.contains(event.target as Node)) return;
      setSelectedCellId(null);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [selectedCellId]);

  return (
    <div
      ref={heatmapRef}
      className="relative grid h-full grid-cols-[58px_repeat(6,1fr)] grid-rows-[22px_repeat(7,1fr)] gap-1"
    >
      <span />
      {data.timeSlots.map((slot) => (
        <span
          key={slot}
          className="self-end text-center text-[8px] text-[#777]"
        >
          {slot}
        </span>
      ))}
      {data.weekdays.flatMap((day, row) => {
        const cells = data.timeSlots.map(
          (slot) =>
            data.timeSlotTotals.find(
              (item) => item.weekday === day && item.slot === slot,
            ) ?? null,
        );

        return [
          <span
            key={`${day}-label`}
            className="self-center text-[8.5px] text-[#777]"
          >
            {weekdayNames[day] ?? day}
          </span>,
          ...cells.map((cell, index) => {
            if (!cell)
              return (
              <div
                key={`${day}-${data.timeSlots[index]}`}
                title={`${weekdayNames[day] ?? day}, ${data.timeSlots[index]}: data not returned`}
                className="rounded-md border border-dashed border-[#d8dce5] bg-[#f7f7f7]"
              />
              );

            const cellId = `${day}-${cell.slot}`;
            const tooltipId = `purchase-time-tooltip-${day}-${index}`;
            const active = activeCellId === cellId;
            const horizontalPosition =
              index === 0
                ? "left-0"
                : index >= data.timeSlots.length - 2
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";
            const verticalPosition =
              row <= 2
                ? "top-[calc(100%+8px)]"
                : "bottom-[calc(100%+8px)]";
            const dayLabel = weekdayNames[day] ?? day;

            return (
              <button
                key={cellId}
                type="button"
                aria-label={`${dayLabel}, ${cell.slot}: ${orderFormat.format(cell.totalOrders)} orders`}
                aria-describedby={active ? tooltipId : undefined}
                className={`relative appearance-none rounded-md border-0 p-0 transition-[box-shadow,filter] duration-150 focus-visible:z-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b82f6] ${
                  active
                    ? "z-30 ring-2 ring-[#3b82f6]/60 ring-offset-1 brightness-[1.04]"
                    : "hover:brightness-[1.03]"
                }`}
                style={{
                  backgroundColor: `color-mix(in srgb, #180bd4 ${20 + (cell.totalOrders / maxSlot) * 80}%, white)`,
                }}
                onMouseEnter={() => setHoveredCellId(cellId)}
                onMouseLeave={() => setHoveredCellId(null)}
                onFocus={() => setHoveredCellId(cellId)}
                onBlur={() => setHoveredCellId(null)}
                onPointerUp={(event) => {
                  if (event.pointerType === "mouse") return;
                  setSelectedCellId((current) =>
                    current === cellId ? null : cellId,
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedCellId((current) =>
                      current === cellId ? null : cellId,
                    );
                  }
                  if (event.key === "Escape") setSelectedCellId(null);
                }}
              >
                {active && (
                  <span
                    id={tooltipId}
                    role="tooltip"
                    data-purchase-time-tooltip="true"
                    className={`pointer-events-none absolute z-50 w-[164px] rounded-lg border border-[#d8deea] bg-white px-3 py-2.5 text-left shadow-[0_10px_28px_rgba(28,39,63,.18)] ${horizontalPosition} ${verticalPosition}`}
                  >
                    <strong className="block text-[10.5px] font-semibold leading-snug text-[#27334a]">
                      {dayLabel} · {cell.slot}
                    </strong>
                    <strong className="mt-2 block text-[12px] font-semibold text-[#253047]">
                      {orderFormat.format(cell.totalOrders)} Orders
                    </strong>
                  </span>
                )}
              </button>
            );
          }),
        ];
      })}
    </div>
  );
}

export function PurchaseTimingSection() {
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
    <section className="flex min-w-0 flex-col min-[900px]:h-full">
      <div className="min-[900px]:min-h-[92px]">
        <SectionHeading
          title="02. Purchase Timing"
          subtitle="Identify when customers are most likely to place orders."
        />
      </div>
      <Card className="flex min-h-[340px] w-full flex-1 flex-col p-3.5 min-[900px]:h-[430px] min-[900px]:min-h-[430px]">
        <div>
          <h3 className="text-[15px] font-semibold">Purchase Timing</h3>
          <p className="mt-1 text-[12px] text-[#707070]">
            Orders by weekday and time slot
          </p>
        </div>
        <div className="mt-3 h-[300px] min-h-0">
          {state.status === "success" ? (
            <PurchaseHeatmap data={state.data} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-[#fbfbfb] px-4 text-center text-[12px] text-[#aaa]">
              {stateLabel}
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
