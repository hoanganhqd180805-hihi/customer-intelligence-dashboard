import type { CustomerSegmentId } from "@/data/contracts/dashboard";

export interface CustomerSegmentDefinition {
  id: CustomerSegmentId;
  displayName: string;
  definition: string;
  color: string;
  sourceLabels: string[];
}

export const customerSegmentDefinitions: CustomerSegmentDefinition[] = [
  {
    id: "vip",
    displayName: "Top Buyers",
    definition: "Purchased recently, buy frequently, and spend highly.",
    color: "#7457D9",
    sourceLabels: ["VIP", "Top Buyers"],
  },
  {
    id: "high_value",
    displayName: "Big Spenders",
    definition: "Spend highly, but their purchase frequency is still limited.",
    color: "#3B82F6",
    sourceLabels: ["High Value", "Big Spenders"],
  },
  {
    id: "potential",
    displayName: "Potential",
    definition:
      "Purchased recently, but frequency and spending are not yet high.",
    color: "#20A7A1",
    sourceLabels: ["Potential"],
  },
  {
    id: "low_value",
    displayName: "Occasional Buyers",
    definition: "Purchase infrequently and do not yet show notable spending.",
    color: "#8A839C",
    sourceLabels: ["Low Value", "Occasional Buyers"],
  },
];

export const customerSegmentDefinitionByKey = new Map(
  customerSegmentDefinitions.flatMap((definition) => [
    [definition.id, definition] as const,
    [definition.displayName, definition] as const,
    ...definition.sourceLabels.map((label) => [label, definition] as const),
  ]),
);
