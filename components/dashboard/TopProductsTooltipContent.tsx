import type { TopProductMetric } from "@/data/contracts/dashboard";

export function TopProductsTooltipContent({
  products,
  contextLabel,
}: {
  products: TopProductMetric[];
  contextLabel?: string;
}) {
  if (products.length === 0) return null;

  return (
    <div className="mt-2 border-t border-[#e8ecf2] pt-2">
      <span className="block text-[9.5px] font-semibold uppercase tracking-[.06em] text-[#7a8494]">
        Top 3 products{contextLabel ? ` · ${contextLabel}` : ""}
      </span>
      <ol className="mt-1.5 space-y-1">
        {products.map((product) => (
          <li
            key={product.productId}
            className="grid grid-cols-[14px_1fr] gap-1.5 text-[10.5px] leading-[1.35] text-[#344054]"
          >
            <span className="font-semibold text-[#3b82f6]">
              {product.rank}.
            </span>
            <span>{product.productName}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
