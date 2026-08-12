import { Card } from "./Card";
import type { OverviewMetric } from "@/data/contracts/dashboard";
import { formatComparison, formatMetricValue } from "@/lib/format/metric";

interface MetricCardProps {
  metric: OverviewMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card className="flex h-[109px] flex-col px-4 py-[17px]">
      <span className="text-[13px] font-normal text-[#707070]">
        {metric.label}
      </span>
      <strong className="mt-2 text-[22px] font-bold leading-none text-[#180bd4]">
        {formatMetricValue(metric.value, metric.unit)}
      </strong>
      <span className="mt-auto text-[12px] font-normal text-[#3b82f6]">
        {formatComparison(metric.comparison)}
      </span>
    </Card>
  );
}
