"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DonutPercentageLabels } from "@/components/ui/DonutPercentageLabels";
import { SHARED_DONUT_GEOMETRY } from "@/components/ui/donutGeometry";
import { shoppingComposition } from "@/data/fixtures/interaction.fixture";
import type { ShoppingCompositionMetric } from "@/data/contracts/dashboard";

type CompositionView = "orders" | "revenue";
const compositionOptions = [
  { value: "orders", label: "Order Share" },
  { value: "revenue", label: "Revenue" },
] as const;
const colors = ["#180bd4", "#4a99d2", "#86eae9"];
const countFormat = new Intl.NumberFormat("en-US");
const revenueFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});
const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});
const shoppingNames: Record<string, string> = {
  Combo: "Combo",
  "Bán lẻ": "Single-item",
  "Hỗn hợp": "Mixed",
};
const shoppingName = (value: string) => shoppingNames[value] ?? value;

function CompositionDonut({
  mode,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  mode: CompositionView;
  selected: string | null;
  hovered: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const circumference =
      2 * Math.PI * SHARED_DONUT_GEOMETRY.centerlineRadius,
    activeId = selected ?? hovered;
  const active = shoppingComposition.find((item) => item.type === activeId);
  const detail = (item: ShoppingCompositionMetric) =>
    mode === "orders"
      ? `${countFormat.format(item.orderCount)} orders`
      : `${revenueFormat.format(item.revenue)} ₫`;
  const share = (item: ShoppingCompositionMetric) =>
    mode === "orders" ? item.orderShare : item.revenueShare;
  const arcs = shoppingComposition.map((item, index) => ({
    item,
    index,
    offset: shoppingComposition
      .slice(0, index)
      .reduce((sum, entry) => sum + share(entry), 0),
  }));
  return (
    <div
      className="relative h-[200px] w-[230px] max-w-full shrink-0"
      onClick={() => onSelect(null)}
    >
      <svg
        viewBox={`0 0 ${SHARED_DONUT_GEOMETRY.canvasWidth} ${SHARED_DONUT_GEOMETRY.canvasHeight}`}
        role="img"
        aria-label={
          mode === "orders"
            ? "Product type distribution by order share"
            : "Product type distribution by revenue"
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
        {arcs.map(({ item, index, offset }) => {
          const value = share(item);
          const isActive = activeId === item.type;
          return (
            <circle
              key={item.type}
              cx={SHARED_DONUT_GEOMETRY.centerX}
              cy={SHARED_DONUT_GEOMETRY.centerY}
              r={SHARED_DONUT_GEOMETRY.centerlineRadius}
              fill="none"
              stroke={colors[index]}
              strokeWidth={
                isActive
                  ? SHARED_DONUT_GEOMETRY.activeRingThickness
                  : SHARED_DONUT_GEOMETRY.ringThickness
              }
              strokeDasharray={`${value * circumference} ${circumference}`}
              strokeDashoffset={-offset * circumference}
              transform={`rotate(-90 ${SHARED_DONUT_GEOMETRY.centerX} ${SHARED_DONUT_GEOMETRY.centerY})`}
              opacity={activeId && !isActive ? 0.45 : 1}
              className="cursor-pointer transition-[stroke-width,opacity] duration-200 focus:outline-none motion-reduce:transition-none"
              role="button"
              tabIndex={0}
              aria-pressed={selected === item.type}
              aria-label={`${shoppingName(item.type)}: ${detail(item)}, ${percentFormat.format(value)}`}
              onMouseEnter={() => onHover(item.type)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(item.type)}
              onBlur={() => onHover(null)}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(selected === item.type ? null : item.type);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(selected === item.type ? null : item.type);
                }
              }}
            >
              <title>{`${shoppingName(item.type)}: ${detail(item)} · ${percentFormat.format(value)}`}</title>
            </circle>
          );
        })}
        <DonutPercentageLabels
          data={arcs.map(({ item, index }) => ({
            id: item.type,
            share: share(item),
            color: colors[index],
          }))}
          cx={SHARED_DONUT_GEOMETRY.centerX}
          cy={SHARED_DONUT_GEOMETRY.centerY}
          radius={SHARED_DONUT_GEOMETRY.percentageLabelRadius}
          labelOffset={10}
          minimumShare={0.05}
          format={(value) => percentFormat.format(value)}
        />
      </svg>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-1 text-center"
        style={{
          width: SHARED_DONUT_GEOMETRY.centerDiameter,
          height: SHARED_DONUT_GEOMETRY.centerDiameter,
        }}
      >
        <span className="max-w-[118px] text-[10.5px] font-medium leading-tight text-[#596273]">
          {active
            ? shoppingName(active.type)
            : mode === "orders"
              ? "Order Share"
              : "Revenue"}
        </span>
        <strong className="mt-1 text-[14px] leading-tight text-[#17366f]">
          {active ? detail(active) : "100%"}
        </strong>
        {active && (
          <span className="mt-1 text-[10px] leading-tight text-[#687284]">
            {percentFormat.format(share(active))}
          </span>
        )}
      </div>
    </div>
  );
}

export function ShoppingTrendsSection() {
  const [compositionView, setCompositionView] =
    useState<CompositionView>("orders");
  const [compositionSelected, setCompositionSelected] = useState<string | null>(
    null,
  );
  const [compositionHovered, setCompositionHovered] = useState<string | null>(
    null,
  );
  return (
    <section className="flex min-w-0 flex-col min-[900px]:h-full">
      <div className="min-[900px]:min-h-[92px]">
        <SectionHeading
          title="03. Product Type Sold"
          subtitle="Composition of product types sold by order share and revenue."
        />
      </div>
      <div className="flex flex-1">
        <Card className="flex min-h-[300px] w-full flex-1 flex-col p-3.5 min-[900px]:h-[430px] min-[900px]:min-h-[430px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold">
                Product Type Distribution
              </h3>
              <p className="mt-1 text-[12px] text-[#707070]">
                Combo, Single-item, and Mixed orders
              </p>
            </div>
            <SegmentedControl
              value={compositionView}
              options={compositionOptions}
              onChange={(next) => {
                setCompositionView(next);
                setCompositionSelected(null);
                setCompositionHovered(null);
              }}
              ariaLabel="Product type sold metric"
            />
          </div>
          <motion.div
            key={compositionView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 flex w-full flex-1 items-center justify-center gap-7 max-[560px]:flex-col max-[560px]:gap-2"
          >
            <CompositionDonut
              mode={compositionView}
              selected={compositionSelected}
              hovered={compositionHovered}
              onSelect={setCompositionSelected}
              onHover={setCompositionHovered}
            />
            <div className="flex w-[132px] shrink-0 flex-col gap-2.5">
              {shoppingComposition.map((item, index) => (
                <div
                  key={item.type}
                  className="flex items-center text-[12px]"
                >
                  <i
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ background: colors[index] }}
                  />
                  {shoppingName(item.type)}
                </div>
              ))}
            </div>
          </motion.div>
        </Card>
      </div>
    </section>
  );
}
