export interface CustomerSegmentDefinition {
  internalKey: string;
  displayName: string;
  definition: string;
  precedence: number;
}

export const customerSegmentDefinitions: CustomerSegmentDefinition[] = [
  {
    internalKey: "Khách mới",
    displayName: "New",
    definition: "Recent first-time customers who have made their first purchase.",
    precedence: 1,
  },
  {
    internalKey: "VIP",
    displayName: "VIP",
    definition: "Recent, frequent, and high-value customers.",
    precedence: 2,
  },
  {
    internalKey: "Trung thành",
    displayName: "Loyal",
    definition: "Frequent customers who continue to purchase regularly.",
    precedence: 3,
  },
  {
    internalKey: "Tiềm năng",
    displayName: "Potential",
    definition: "Recent repeat customers with potential to become loyal.",
    precedence: 4,
  },
  {
    internalKey: "Nguy cơ rời bỏ",
    displayName: "At Risk",
    definition: "Previously active customers who have not purchased recently.",
    precedence: 5,
  },
  {
    internalKey: "Ngủ đông",
    displayName: "Dormant",
    definition: "Inactive customers who purchased infrequently in the past.",
    precedence: 6,
  },
  {
    internalKey: "Khách thường",
    displayName: "Regular",
    definition: "Customers with typical, ongoing purchasing behavior.",
    precedence: 7,
  },
];

export const customerSegmentDefinitionByKey = new Map(
  customerSegmentDefinitions.map((definition) => [
    definition.internalKey,
    definition,
  ]),
);
