import type { MetricComparison, MetricUnit } from "@/data/contracts/dashboard";

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});
const percentFormatter = new Intl.NumberFormat("en", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMetricValue(value: number, unit: MetricUnit): string {
  if (unit === "ratio") return percentFormatter.format(value);
  if (unit === "amount") return compactFormatter.format(value);
  return integerFormatter.format(value);
}

export function formatComparison(comparison: MetricComparison): string {
  if (comparison.ratio === null || comparison.direction === null) return "↑ —";

  const arrow =
    comparison.direction === "down"
      ? "↓"
      : comparison.direction === "flat"
        ? "→"
        : "↑";
  return `${arrow} ${percentFormatter.format(Math.abs(comparison.ratio))}`;
}
