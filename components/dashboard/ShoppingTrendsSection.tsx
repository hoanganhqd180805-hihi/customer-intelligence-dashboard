"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DonutPercentageLabels } from "@/components/ui/DonutPercentageLabels";
import {
  productPairs,
  products,
  shoppingComposition,
} from "@/data/fixtures/interaction.fixture";
import type {
  ProductType,
  ShoppingCompositionMetric,
} from "@/data/contracts/dashboard";

type CompositionView = "orders" | "revenue";
const compositionOptions = [
  { value: "orders", label: "Order Share" },
  { value: "revenue", label: "Revenue" },
] as const;
const productOptions = [
  { value: "retail", label: "Single-item" },
  { value: "combo", label: "Combo" },
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
  Combo: "Bundle",
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
  const radius = 47,
    circumference = 2 * Math.PI * radius,
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
      className="relative h-[180px] w-[220px] max-w-full shrink-0"
      onClick={() => onSelect(null)}
    >
      <svg
        viewBox="0 0 220 180"
        role="img"
        aria-label={
          mode === "orders"
            ? "Shopping composition by order share"
            : "Shopping composition by revenue"
        }
        className="h-full w-full overflow-visible"
      >
        <circle
          cx="110"
          cy="90"
          r={radius}
          fill="none"
          stroke="#edf0f5"
          strokeWidth="20"
        />
        {arcs.map(({ item, index, offset }) => {
          const value = share(item);
          const isActive = activeId === item.type;
          return (
            <circle
              key={item.type}
              cx="110"
              cy="90"
              r={radius}
              fill="none"
              stroke={colors[index]}
              strokeWidth={isActive ? 23 : 20}
              strokeDasharray={`${value * circumference} ${circumference}`}
              strokeDashoffset={-offset * circumference}
              transform="rotate(-90 110 90)"
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
          cx={110}
          cy={90}
          radius={62}
          format={(value) => percentFormat.format(value)}
        />
      </svg>
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white px-1 text-center">
        <span className="text-[9px] leading-tight text-[#777]">
          {active
            ? shoppingName(active.type)
            : mode === "orders"
              ? "Order Share"
              : "Revenue"}
        </span>
        <strong className="mt-0.5 text-[14px] leading-none text-[#17366f]">
          {active ? detail(active) : "100%"}
        </strong>
        {active && (
          <span className="mt-1 text-[9px] text-[#777]">
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
  const [productType, setProductType] = useState<ProductType>("retail");
  const [pairsOpen, setPairsOpen] = useState(false);
  const selectedProducts = useMemo(
    () =>
      products.filter((item) => item.productType === productType).slice(0, 5),
    [productType],
  );
  const insight =
    compositionView === "orders"
      ? "Single-item purchases account for the largest share of orders."
      : "Single-item purchases lead revenue, while Bundles contribute disproportionately relative to their order share.";
  return (
    <section>
      <SectionHeading
        title="04. Shopping Behavior"
        subtitle="Basket composition, best-selling products, and bundle opportunities."
      />
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex h-[337px] flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold">Purchase Mix</h3>
              <p className="mt-1 text-[12px] text-[#707070]">
                Bundle, Single-item, and Mixed orders
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
              ariaLabel="Shopping composition metric"
            />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={compositionView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-2 grid flex-1 grid-cols-[230px_1fr] items-center gap-1 max-[560px]:grid-cols-1"
            >
              <CompositionDonut
                mode={compositionView}
                selected={compositionSelected}
                hovered={compositionHovered}
                onSelect={setCompositionSelected}
                onHover={setCompositionHovered}
              />
              <div className="flex flex-col gap-2.5">
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
                <div className="mt-1 rounded-lg border-l-2 border-[#3b82f6] bg-[#eef4fd] px-3 py-2.5 text-[11px] leading-relaxed">
                  {insight}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
        <Card className="flex h-[337px] flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold">
                Best-Selling Products
              </h3>
              <p className="mt-1 text-[12px] text-[#707070]">
                Top products by purchase type
              </p>
            </div>
            <SegmentedControl
              value={productType}
              options={productOptions}
              onChange={setProductType}
              ariaLabel="Product type"
            />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ol
              key={productType}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mt-4"
            >
              {selectedProducts.map((item) => (
                <li
                  key={`${item.productType}-${item.rank}-${item.itemId}`}
                  className="grid h-[43px] grid-cols-[28px_1fr_35px] items-center border-b border-[#e5e5e5] text-[11px] last:border-0"
                >
                  <span className="text-[#777]">
                    {String(item.rank).padStart(2, "0")}
                  </span>
                  <span className="truncate pr-2">{item.itemName}</span>
                  <strong className="text-right text-[#3b82f6]">
                    {item.totalQuantitySold}
                  </strong>
                </li>
              ))}
            </motion.ol>
          </AnimatePresence>
        </Card>
      </div>
      <Card className="mt-3.5 overflow-hidden">
        <div className="flex h-[67px] items-center justify-between px-4">
          <div>
            <h3 className="text-[14px] font-semibold">
              ◆ &nbsp;Bundle Recommendations
            </h3>
            <p className="mt-1 text-[11px] text-[#777]">
              Based on products frequently purchased together
            </p>
          </div>
          <Disclosure
            expanded={pairsOpen}
            onToggle={() => setPairsOpen(!pairsOpen)}
            collapsedLabel="5 recommendations"
            expandedLabel="5 recommendations"
          >
            <span />
          </Disclosure>
        </div>
        <AnimatePresence initial={false}>
          {pairsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <ol className="border-t border-[#e5e5e5] px-4 py-2">
                {productPairs.map((pair) => (
                  <li
                    key={pair.rank}
                    className="grid grid-cols-[24px_1fr_44px] items-center gap-2 border-b border-[#eee] py-2.5 text-[11px] last:border-0"
                  >
                    <span className="text-[#777]">
                      {String(pair.rank).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{pair.item1.name}</strong>
                      <span className="mx-2 text-[#3b82f6]">+</span>
                      <strong>{pair.item2.name}</strong>
                    </span>
                    <span className="text-right text-[#3b82f6]">
                      {pair.ordersBoughtTogether} orders
                    </span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </section>
  );
}
