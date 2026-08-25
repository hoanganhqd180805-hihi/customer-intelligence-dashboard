import type {
  AverageRepurchaseDaysDataset,
  CustomerSegmentationDataset,
  NewReturningCustomersDataset,
} from "@/data/contracts/dashboard";
import { customerSegmentDefinitions } from "@/data/definitions/customer-segment-definitions";

export interface RawNewReturningDailyRow {
  date: string;
  newCustomers: number | null;
  returningCustomers: number | null;
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
