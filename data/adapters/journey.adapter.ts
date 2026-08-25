import type {
  JourneyLinkData,
  JourneyMetricSemantic,
  JourneyNodeData,
} from "@/data/contracts/dashboard";

export interface RawJourneyWorkbookRow {
  row: number;
  stage: string | null;
  source: string;
  target: string;
  value: number;
  sourceStep: number;
  targetStep: number;
  rate: number | string | null;
  dataType?: string | null;
}

export interface JourneyFlowConflict {
  node: string;
  incoming: number;
  outgoing: number;
}

export interface JourneyContributionTotal {
  platform: string;
  incomingTraffic: number;
  providedShareTotal: number;
}

export interface JourneyPlatformTrafficTotal {
  platform: string;
  externalTraffic: number;
  directTraffic: number;
  totalTraffic: number;
}

interface JourneyAdapterOptions {
  stages: readonly string[];
  colorsByStep: readonly string[];
  colorByLabel: Record<string, string>;
}

const normalizeLabel = (label: string) =>
  label.trim().toLocaleLowerCase("en-US");
const slug = (label: string) =>
  normalizeLabel(label)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const formatRate = (rate: number | string | null) =>
  typeof rate === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(rate)
    : (rate ?? "");

export function getJourneyMetricSemantic(
  sourceStep: number,
  targetStep: number,
): JourneyMetricSemantic {
  if (sourceStep === 0 && targetStep === 1) return "contribution_share";
  if (sourceStep === 1 && targetStep === 2) return "distribution_share";
  return "conversion_rate";
}

export function adaptJourneyWorkbookRows(
  rows: RawJourneyWorkbookRow[],
  { stages, colorsByStep, colorByLabel }: JourneyAdapterOptions,
) {
  let inheritedStage: string | null = null;
  const normalizedRows = rows.map((row) => {
    if (row.stage?.trim()) inheritedStage = row.stage.trim();
    return { ...row, stage: inheritedStage };
  });
  const summaryRows = normalizedRows.filter(
    (row) =>
      normalizeLabel(row.source) === normalizeLabel(row.target) &&
      row.sourceStep === row.targetStep,
  );
  const summaryRowNumbers = new Set(summaryRows.map((row) => row.row));
  const ignoredRows = normalizedRows.filter(
    (row) =>
      !row.source.trim() ||
      !row.target.trim() ||
      !Number.isFinite(row.value) ||
      row.value <= 0,
  );
  const ignoredRowNumbers = new Set(ignoredRows.map((row) => row.row));
  const validRows = normalizedRows.filter(
    (row) => !ignoredRowNumbers.has(row.row) && !summaryRowNumbers.has(row.row),
  );
  const nodeDefinitions = new Map<string, { label: string; step: number }>();

  for (const row of validRows) {
    const sourceKey = normalizeLabel(row.source);
    const targetKey = normalizeLabel(row.target);
    const sourceExisting = nodeDefinitions.get(sourceKey);
    const targetExisting = nodeDefinitions.get(targetKey);
    if (sourceExisting && sourceExisting.step !== row.sourceStep)
      throw new Error(
        `Conflicting source step for workbook row ${row.row}: ${row.source}`,
      );
    if (targetExisting && targetExisting.step !== row.targetStep)
      throw new Error(
        `Conflicting target step for workbook row ${row.row}: ${row.target}`,
      );
    nodeDefinitions.set(
      sourceKey,
      sourceExisting ?? { label: row.source.trim(), step: row.sourceStep },
    );
    nodeDefinitions.set(
      targetKey,
      targetExisting ?? { label: row.target.trim(), step: row.targetStep },
    );
  }

  const incoming = (label: string) =>
    validRows
      .filter((row) => normalizeLabel(row.target) === normalizeLabel(label))
      .reduce((sum, row) => sum + row.value, 0);
  const outgoing = (label: string) =>
    validRows
      .filter((row) => normalizeLabel(row.source) === normalizeLabel(label))
      .reduce((sum, row) => sum + row.value, 0);
  const directTraffic = (label: string) =>
    summaryRows
      .filter((row) => normalizeLabel(row.source) === normalizeLabel(label))
      .reduce((sum, row) => sum + row.value, 0);
  const nodeValue = (label: string, step: number) => {
    const incomingFlow = incoming(label);
    const outgoingFlow = outgoing(label);
    if (step === 0) return outgoingFlow;
    if (step === 1) return incomingFlow + directTraffic(label);
    return incomingFlow || outgoingFlow;
  };

  const nodes: JourneyNodeData[] = [...nodeDefinitions.values()].map(
    ({ label, step }) => {
      const incomingFlow = incoming(label);
      const outgoingFlow = outgoing(label);
      const directFlow = step === 1 ? directTraffic(label) : 0;
      return {
        id: slug(label),
        stage: stages[step],
        label,
        value: nodeValue(label, step),
        color: colorByLabel[label] ?? colorsByStep[step],
        meta:
          step === 1
            ? `External ${incomingFlow.toLocaleString("en-US")} · Direct ${directFlow.toLocaleString("en-US")} · Outgoing ${outgoingFlow.toLocaleString("en-US")}`
            : `Incoming ${incomingFlow.toLocaleString("en-US")} · Outgoing ${outgoingFlow.toLocaleString("en-US")}`,
      };
    },
  );

  const links: JourneyLinkData[] = validRows.map((row) => ({
    id: `row-${row.row}-${slug(row.source)}-${slug(row.target)}`,
    source: slug(row.source),
    target: slug(row.target),
    value: row.value,
    label: formatRate(row.rate),
    rate: typeof row.rate === "number" ? row.rate : null,
    rateLabel: typeof row.rate === "string" ? row.rate : null,
    metric: getJourneyMetricSemantic(row.sourceStep, row.targetStep),
    sourceStep: row.sourceStep,
    targetStep: row.targetStep,
    sourceGroup: row.stage,
    dataType: row.dataType ?? null,
  }));

  const flowConflicts: JourneyFlowConflict[] = nodes
    .map((node) => ({
      node: node.label,
      incoming: incoming(node.label),
      outgoing: outgoing(node.label),
    }))
    .filter(
      (flow) =>
        flow.incoming > 0 &&
        flow.outgoing > 0 &&
        flow.incoming !== flow.outgoing,
    );

  const contributionLinks = links.filter(
    (link) => link.metric === "contribution_share",
  );
  const contributionShareTotals: JourneyContributionTotal[] = [
    ...new Set(contributionLinks.map((link) => link.target)),
  ].map((platformId) => {
    const platformLinks = contributionLinks.filter(
      (link) => link.target === platformId,
    );
    return {
      platform:
        nodes.find((node) => node.id === platformId)?.label ?? platformId,
      incomingTraffic: platformLinks.reduce((sum, link) => sum + link.value, 0),
      providedShareTotal: platformLinks.reduce(
        (sum, link) => sum + (link.rate ?? 0),
        0,
      ),
    };
  });

  const contributionRateConflicts = contributionLinks.filter((link) => {
    const total = contributionShareTotals.find(
      (item) => slug(item.platform) === link.target,
    )?.incomingTraffic;
    if (!total || typeof link.rate !== "number") return true;
    return Math.abs(link.rate - link.value / total) > 0.000_001;
  });

  const platformTrafficTotals: JourneyPlatformTrafficTotal[] = nodes
    .filter((node) => node.stage === stages[1])
    .map((node) => {
      const externalTraffic = incoming(node.label);
      const direct = directTraffic(node.label);
      return {
        platform: node.label,
        externalTraffic,
        directTraffic: direct,
        totalTraffic: externalTraffic + direct,
      };
    });

  return {
    nodes,
    links,
    validRows,
    summaryRows,
    ignoredRows,
    flowConflicts,
    contributionShareTotals,
    contributionRateConflicts,
    platformTrafficTotals,
  };
}
