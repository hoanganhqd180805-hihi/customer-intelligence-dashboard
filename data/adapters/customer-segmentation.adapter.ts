import type {
  AverageRepurchaseDaysDataset,
  CustomerSegmentationDailyDataset,
  CustomerSegmentationDataset,
  NewReturningCustomersDataset,
  TopProductMetric,
} from "@/data/contracts/dashboard";
import { customerSegmentDefinitions } from "@/data/definitions/customer-segment-definitions";

export interface RawNewReturningDailyRow {
  date: string;
  newCustomers: number | null;
  returningCustomers: number | null;
  newRevenue: number | null;
  returningRevenue: number | null;
  newTopProducts?: TopProductMetric[];
  returningTopProducts?: TopProductMetric[];
}

export interface RawCustomerSegmentRow {
  segment: string;
  condition: string;
  customerCount: number;
  customerSharePercent: number;
  totalOrders: number;
  revenue: number;
  revenueSharePercent: number;
  averageRecencyDays: number;
  averageFrequency: number;
  averageRevenuePerCustomer: number;
}

export interface RawCustomerSegmentationTotals {
  totalCustomers: number;
  customerSharePercent: number;
  totalRevenue: number;
  revenueSharePercent: number;
}

export interface RawCustomerSegmentationDailyRow {
  date: string;
  customerSegment: string;
  totalCustomers: number;
  customerRatePercent: number;
  totalOrders: number;
  totalRevenue: number;
  revenueContributionPercent: number;
  averageRecencyDays: number;
  averageFrequency: number;
  averageMonetary: number;
}

export interface RawCustomerSegmentationDailyProductRow {
  date: string;
  customerSegment: string;
  totalCustomers: number;
  totalRevenue: number;
  topProducts: TopProductMetric[];
}

export interface RawAverageRepurchaseDaysRow {
  date: string;
  averageRepurchaseDays: number | null;
}

const normalizeDate = (value: string) => {
  const match = value.trim().match(/^\d{4}-\d{2}-\d{2}/);
  if (!match) throw new Error(`Invalid customer-segmentation date: ${value}`);
  return match[0];
};

const dateTimestamp = (value: string) =>
  Date.parse(`${normalizeDate(value)}T00:00:00Z`);

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getDailySamplingDates(startDate: string, endDate: string) {
  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);
  const start = dateTimestamp(normalizedStart);
  const end = dateTimestamp(normalizedEnd);
  if (end < start) return [];

  const inclusiveDayCount = Math.floor((end - start) / DAY_IN_MS) + 1;
  const interval =
    inclusiveDayCount <= 14
      ? 1
      : inclusiveDayCount <= 20
        ? 2
        : inclusiveDayCount <= 30
          ? 3
          : Math.ceil(inclusiveDayCount / 12);
  const dates: string[] = [];

  for (let offset = 0; offset < inclusiveDayCount; offset += interval) {
    dates.push(new Date(start + offset * DAY_IN_MS).toISOString().slice(0, 10));
  }
  if (dates.at(-1) !== normalizedEnd) dates.push(normalizedEnd);

  return dates;
}

const filterAndSampleDailyPoints = <T extends { date: string }>(
  points: T[],
  startDate: string,
  endDate: string,
) => {
  const pointsByDate = new Map(points.map((point) => [point.date, point]));

  // Sampling dates are the canonical rendered timeline. The helper appends the
  // selected final date before rows are resolved, so the line, markers, axis,
  // and tooltip can all consume the same ordered collection of complete rows.
  return getDailySamplingDates(startDate, endDate).flatMap((date) => {
    const point = pointsByDate.get(date);
    return point ? [point] : [];
  });
};

const validateNullableNonNegative = (
  value: number | null,
  field: string,
  date: string,
) => {
  if (value !== null && (!Number.isFinite(value) || value < 0))
    throw new Error(`Invalid ${field} for ${date}`);
};

const validateTopProducts = (
  products: TopProductMetric[] | undefined,
  context: string,
) => {
  if (!products) return;
  const ranks = new Set<number>();
  products.forEach((product) => {
    if (
      !product.productId ||
      !product.productName ||
      !Number.isInteger(product.rank) ||
      product.rank < 1 ||
      product.rank > 3 ||
      ranks.has(product.rank) ||
      (product.orders !== undefined &&
        (!Number.isFinite(product.orders) || product.orders < 0)) ||
      (product.quantitySold !== undefined &&
        (!Number.isFinite(product.quantitySold) || product.quantitySold < 0))
    )
      throw new Error(`Invalid top-product row for ${context}`);
    ranks.add(product.rank);
  });
};

export function adaptNewReturningCustomers(
  rows: RawNewReturningDailyRow[],
): NewReturningCustomersDataset {
  const dates = new Set<string>();
  const points = rows.map((row) => {
    const date = normalizeDate(row.date);
    if (dates.has(date))
      throw new Error(`Duplicate new/returning customer row for ${date}`);
    dates.add(date);
    validateNullableNonNegative(row.newCustomers, "new customer count", date);
    validateNullableNonNegative(
      row.returningCustomers,
      "returning customer count",
      date,
    );
    validateNullableNonNegative(row.newRevenue, "new customer revenue", date);
    validateNullableNonNegative(
      row.returningRevenue,
      "returning customer revenue",
      date,
    );
    validateTopProducts(row.newTopProducts, `${date}:new`);
    validateTopProducts(row.returningTopProducts, `${date}:returning`);
    return { ...row, date };
  });

  return {
    points: points.sort(
      (left, right) => dateTimestamp(left.date) - dateTimestamp(right.date),
    ),
    missingValueRule: "unavailable",
  };
}

export function filterNewReturningCustomers(
  data: NewReturningCustomersDataset,
  startDate: string,
  endDate: string,
): NewReturningCustomersDataset {
  return {
    ...data,
    points: filterAndSampleDailyPoints(data.points, startDate, endDate),
  };
}

export function adaptCustomerSegmentation(
  rows: RawCustomerSegmentRow[],
  expectedTotals?: RawCustomerSegmentationTotals,
): CustomerSegmentationDataset {
  const mappedIds = new Set<string>();
  const segments = rows.map((row) => {
    const definition = customerSegmentDefinitions.find((candidate) =>
      candidate.sourceLabels.includes(row.segment),
    );
    if (!definition)
      throw new Error(`Unsupported customer segment: ${row.segment}`);
    if (mappedIds.has(definition.id))
      throw new Error(`Duplicate customer segment: ${row.segment}`);
    mappedIds.add(definition.id);

    const numericFields = [
      row.customerCount,
      row.customerSharePercent,
      row.totalOrders,
      row.revenue,
      row.revenueSharePercent,
      row.averageRecencyDays,
      row.averageFrequency,
      row.averageRevenuePerCustomer,
    ];
    if (numericFields.some((value) => !Number.isFinite(value) || value < 0))
      throw new Error(`Invalid customer-segmentation metric: ${row.segment}`);

    return {
      id: definition.id,
      sourceSegment: row.segment,
      segment: definition.displayName,
      condition: row.condition,
      definition: definition.definition,
      customerCount: row.customerCount,
      customerShare: row.customerSharePercent / 100,
      totalOrders: row.totalOrders,
      revenue: row.revenue,
      revenueShare: row.revenueSharePercent / 100,
      averageRecencyDays: row.averageRecencyDays,
      averageFrequency: row.averageFrequency,
      averageRevenuePerCustomer: row.averageRevenuePerCustomer,
      color: definition.color,
    };
  });
  segments.sort(
    (left, right) =>
      customerSegmentDefinitions.findIndex(({ id }) => id === left.id) -
      customerSegmentDefinitions.findIndex(({ id }) => id === right.id),
  );
  const totalCustomers = segments.reduce(
    (sum, segment) => sum + segment.customerCount,
    0,
  );
  const totalRevenue = segments.reduce(
    (sum, segment) => sum + segment.revenue,
    0,
  );
  const totalOrders = segments.reduce(
    (sum, segment) => sum + segment.totalOrders,
    0,
  );
  const customerShare = segments.reduce(
    (sum, segment) => sum + segment.customerShare,
    0,
  );
  const revenueShare = segments.reduce(
    (sum, segment) => sum + segment.revenueShare,
    0,
  );
  const nearlyEqual = (left: number, right: number, tolerance = 1e-6) =>
    Math.abs(left - right) <= tolerance;

  if (
    !nearlyEqual(customerShare, 1, 0.0002) ||
    !nearlyEqual(revenueShare, 1, 0.0002)
  )
    throw new Error("Customer-segmentation shares must each reconcile to 100%");
  if (
    expectedTotals &&
    (totalCustomers !== expectedTotals.totalCustomers ||
      !nearlyEqual(totalRevenue, expectedTotals.totalRevenue) ||
      !nearlyEqual(expectedTotals.customerSharePercent, 100) ||
      !nearlyEqual(expectedTotals.revenueSharePercent, 100))
  )
    throw new Error(
      "Customer-segmentation rows do not reconcile with workbook totals",
    );

  return {
    segments,
    totalCustomers,
    totalOrders,
    totalRevenue,
  };
}

export function adaptCustomerSegmentationDaily(
  rows: RawCustomerSegmentationDailyRow[],
  sourceRange = "Customer journey!B288:K316",
): CustomerSegmentationDailyDataset {
  const grouped = new Map<
    string,
    CustomerSegmentationDailyDataset["points"][number]["segments"]
  >();
  const uniqueRows = new Set<string>();

  rows.forEach((row) => {
    const date = normalizeDate(row.date);
    const definition = customerSegmentDefinitions.find((candidate) =>
      candidate.sourceLabels.includes(row.customerSegment),
    );
    if (!definition)
      throw new Error(`Unsupported customer segment: ${row.customerSegment}`);
    const uniqueKey = `${date}:${definition.id}`;
    if (uniqueRows.has(uniqueKey))
      throw new Error(`Duplicate daily customer segment: ${uniqueKey}`);
    uniqueRows.add(uniqueKey);

    const numericFields = [
      row.totalCustomers,
      row.customerRatePercent,
      row.totalOrders,
      row.totalRevenue,
      row.revenueContributionPercent,
      row.averageRecencyDays,
      row.averageFrequency,
      row.averageMonetary,
    ];
    if (numericFields.some((value) => !Number.isFinite(value) || value < 0))
      throw new Error(
        `Invalid daily customer-segmentation metric: ${uniqueKey}`,
      );

    const segments = grouped.get(date) ?? [];
    segments.push({
      id: definition.id,
      sourceSegment: row.customerSegment,
      segment: definition.displayName,
      definition: definition.definition,
      customerCount: row.totalCustomers,
      customerShare: row.customerRatePercent / 100,
      totalOrders: row.totalOrders,
      revenue: row.totalRevenue,
      revenueShare: row.revenueContributionPercent / 100,
      averageRecencyDays: row.averageRecencyDays,
      averageFrequency: row.averageFrequency,
      averageMonetary: row.averageMonetary,
      color: definition.color,
    });
    grouped.set(date, segments);
  });

  const points = [...grouped.entries()]
    .map(([date, segments]) => {
      segments.sort(
        (left, right) =>
          customerSegmentDefinitions.findIndex(({ id }) => id === left.id) -
          customerSegmentDefinitions.findIndex(({ id }) => id === right.id),
      );
      if (segments.length !== customerSegmentDefinitions.length)
        throw new Error(`Incomplete daily customer segmentation for ${date}`);
      const customerShare = segments.reduce(
        (sum, segment) => sum + segment.customerShare,
        0,
      );
      const revenueShare = segments.reduce(
        (sum, segment) => sum + segment.revenueShare,
        0,
      );
      if (
        Math.abs(customerShare - 1) > 0.0002 ||
        Math.abs(revenueShare - 1) > 0.0002
      )
        throw new Error(
          `Daily segmentation shares do not reconcile for ${date}`,
        );
      return {
        date,
        segments,
        totalCustomers: segments.reduce(
          (sum, segment) => sum + segment.customerCount,
          0,
        ),
        totalOrders: segments.reduce(
          (sum, segment) => sum + (segment.totalOrders ?? 0),
          0,
        ),
        totalRevenue: segments.reduce(
          (sum, segment) => sum + segment.revenue,
          0,
        ),
      };
    })
    .sort(
      (left, right) => dateTimestamp(left.date) - dateTimestamp(right.date),
    );

  return { points, sourceRange };
}

export function adaptCustomerSegmentationDailyProducts(
  rows: RawCustomerSegmentationDailyProductRow[],
  sourceRange = "Customer journey!B331:F359",
): CustomerSegmentationDailyDataset {
  const grouped = new Map<string, RawCustomerSegmentationDailyProductRow[]>();
  const uniqueRows = new Set<string>();

  rows.forEach((row) => {
    const date = normalizeDate(row.date);
    const definition = customerSegmentDefinitions.find((candidate) =>
      candidate.sourceLabels.includes(row.customerSegment),
    );
    if (!definition)
      throw new Error(`Unsupported customer segment: ${row.customerSegment}`);
    const uniqueKey = `${date}:${definition.id}`;
    if (uniqueRows.has(uniqueKey))
      throw new Error(`Duplicate daily customer segment: ${uniqueKey}`);
    uniqueRows.add(uniqueKey);
    validateNullableNonNegative(row.totalCustomers, "customer count", date);
    validateNullableNonNegative(row.totalRevenue, "segment revenue", date);
    validateTopProducts(row.topProducts, uniqueKey);
    grouped.set(date, [...(grouped.get(date) ?? []), { ...row, date }]);
  });

  const points = [...grouped.entries()]
    .map(([date, rowsForDate]) => {
      if (rowsForDate.length !== customerSegmentDefinitions.length)
        throw new Error(`Incomplete daily customer segmentation for ${date}`);
      const totalCustomers = rowsForDate.reduce(
        (sum, row) => sum + row.totalCustomers,
        0,
      );
      const totalRevenue = rowsForDate.reduce(
        (sum, row) => sum + row.totalRevenue,
        0,
      );
      const segments = rowsForDate
        .map((row) => {
          const definition = customerSegmentDefinitions.find((candidate) =>
            candidate.sourceLabels.includes(row.customerSegment),
          );
          if (!definition)
            throw new Error(
              `Unsupported customer segment: ${row.customerSegment}`,
            );
          return {
            id: definition.id,
            sourceSegment: row.customerSegment,
            segment: definition.displayName,
            definition: definition.definition,
            customerCount: row.totalCustomers,
            customerShare:
              totalCustomers === 0 ? 0 : row.totalCustomers / totalCustomers,
            totalOrders: null,
            revenue: row.totalRevenue,
            revenueShare:
              totalRevenue === 0 ? 0 : row.totalRevenue / totalRevenue,
            averageRecencyDays: null,
            averageFrequency: null,
            averageMonetary: null,
            color: definition.color,
            topProducts: row.topProducts,
          };
        })
        .sort(
          (left, right) =>
            customerSegmentDefinitions.findIndex(({ id }) => id === left.id) -
            customerSegmentDefinitions.findIndex(({ id }) => id === right.id),
        );
      return {
        date,
        segments,
        totalCustomers,
        totalOrders: null,
        totalRevenue,
      };
    })
    .sort(
      (left, right) => dateTimestamp(left.date) - dateTimestamp(right.date),
    );

  return { points, sourceRange };
}

export function adaptAverageRepurchaseDays(
  rows: RawAverageRepurchaseDaysRow[],
): AverageRepurchaseDaysDataset {
  const normalizedRows = rows.map((row) => ({
    ...row,
    date: normalizeDate(row.date),
  }));
  const dates = new Set<string>();

  normalizedRows.forEach((row) => {
    if (dates.has(row.date))
      throw new Error(`Duplicate average-repurchase row for ${row.date}`);
    dates.add(row.date);
    validateNullableNonNegative(
      row.averageRepurchaseDays,
      "average-repurchase value",
      row.date,
    );
  });

  return {
    points: normalizedRows.sort(
      (left, right) => dateTimestamp(left.date) - dateTimestamp(right.date),
    ),
    missingValueRule: "unavailable",
  };
}

export function filterAverageRepurchaseDays(
  data: AverageRepurchaseDaysDataset,
  startDate: string,
  endDate: string,
): AverageRepurchaseDaysDataset {
  return {
    ...data,
    points: filterAndSampleDailyPoints(data.points, startDate, endDate),
  };
}
