"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { TopProductMetric } from "@/data/contracts/dashboard";

export function TopProductsTooltipContent({
  products,
  contextLabel,
}: {
  products: TopProductMetric[];
  contextLabel?: string;
}) {
  const disclosureKey = `${contextLabel ?? "all"}:${products
    .map(({ productId, rank }) => `${productId}:${rank}`)
    .join("|")}`;
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const expanded = expandedKey === disclosureKey;
  const contentId = useId();

  if (products.length === 0) return null;

  return (
    <div className="mt-2 border-t border-[#e8ecf2] pt-2">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        aria-label={`${expanded ? "Hide" : "Show"} top 3 products${contextLabel ? ` for ${contextLabel}` : ""}`}
        onClick={() =>
          setExpandedKey((current) =>
            current === disclosureKey ? null : disclosureKey,
          )
        }
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-1 text-left outline-none transition-colors hover:bg-[#f5f8fd] focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
      >
        <span className="block text-[10px] font-semibold text-[#4f5d73]">
          Top 3 products{contextLabel ? ` · ${contextLabel}` : ""}
        </span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#3b82f6]">
          <ChevronDown
            aria-hidden="true"
            size={13}
            strokeWidth={2.25}
            className={`transition-transform duration-150 motion-reduce:transition-none ${expanded ? "rotate-180" : "rotate-0"}`}
          />
        </span>
      </button>
      {expanded ? (
        <ol id={contentId} className="mt-1.5 space-y-1 px-1">
          {products.map((product) => (
            <li
              key={`${product.productId}:${product.rank}`}
              className="grid grid-cols-[14px_1fr] gap-1.5 text-[10.5px] leading-[1.35] text-[#344054]"
            >
              <span className="font-semibold text-[#3b82f6]">
                {product.rank}.
              </span>
              <span>{product.productName}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
