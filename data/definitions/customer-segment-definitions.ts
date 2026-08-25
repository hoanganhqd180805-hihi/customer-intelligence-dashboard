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
    displayName: "VIP",
    definition: "R ≥ 4, F ≥ 4, M ≥ 4.",
    color: "#7457D9",
    sourceLabels: ["VIP"],
  },
  {
    id: "high_value",
    displayName: "High Value",
    definition: "R ≥ 3, F ≥ 2, M ≥ 4; excluding VIP.",
    color: "#3B82F6",
    sourceLabels: ["High Value"],
  },
  {
    id: "potential",
    displayName: "Potential",
    definition: "R ≥ 4; excluding VIP and High Value.",
    color: "#20A7A1",
    sourceLabels: ["Potential"],
  },
  {
    id: "low_value",
    displayName: "Low Value",
    definition: "All remaining customers.",
    color: "#8A839C",
    sourceLabels: ["Low Value"],
  },
];

export const customerSegmentDefinitionByKey = new Map(
  customerSegmentDefinitions.flatMap((definition) => [
    [definition.id, definition] as const,
    [definition.displayName, definition] as const,
    ...definition.sourceLabels.map((label) => [label, definition] as const),
  ]),
);
