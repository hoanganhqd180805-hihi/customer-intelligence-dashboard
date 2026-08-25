import type {
  JourneyLinkData,
  JourneyNodeData,
} from "@/data/contracts/dashboard";

export interface LayoutNode extends JourneyNodeData {
  x: number;
  h: number;
  y0: number;
  y1: number;
  cy: number;
}
export interface LayoutLink extends JourneyLinkData {
  sy0: number;
  sy1: number;
  ty0: number;
  ty1: number;
  path: string;
  centerline: string;
  labelX: number;
  labelY: number;
  thickness: number;
}

export function getJourneyNodeBodyGeometry(
  node: Pick<LayoutNode, "id" | "stage" | "y0" | "y1" | "cy">,
  links: readonly LayoutLink[] = [],
) {
  const valueBasedHeight = node.y1 - node.y0;
  if (node.stage !== "MARKETPLACE" || links.length === 0) {
    return {
      y: node.y0,
      y0: node.y0,
      y1: node.y1,
      cy: node.cy,
      height: valueBasedHeight,
      valueBasedHeight,
      incomingTop: null,
      incomingBottom: null,
      outgoingTop: null,
      outgoingBottom: null,
      flowTop: node.y0,
      flowBottom: node.y1,
    };
  }

  const incoming = links.filter((link) => link.target === node.id);
  const outgoing = links.filter((link) => link.source === node.id);
  const incomingTop = incoming.length
    ? Math.min(...incoming.map((link) => link.ty0))
    : null;
  const incomingBottom = incoming.length
    ? Math.max(...incoming.map((link) => link.ty1))
    : null;
  const outgoingTop = outgoing.length
    ? Math.min(...outgoing.map((link) => link.sy0))
    : null;
  const outgoingBottom = outgoing.length
    ? Math.max(...outgoing.map((link) => link.sy1))
    : null;
  const attachedTops = [incomingTop, outgoingTop].filter(
    (value): value is number => value !== null,
  );
  const attachedBottoms = [incomingBottom, outgoingBottom].filter(
    (value): value is number => value !== null,
  );
  if (attachedTops.length === 0 || attachedBottoms.length === 0) {
    return {
      y: node.y0,
      y0: node.y0,
      y1: node.y1,
      cy: node.cy,
      height: valueBasedHeight,
      valueBasedHeight,
      incomingTop,
      incomingBottom,
      outgoingTop,
      outgoingBottom,
      flowTop: node.y0,
      flowBottom: node.y1,
    };
  }
  const flowTop = Math.min(...attachedTops);
  const flowBottom = Math.max(...attachedBottoms);
  const flowCenter = (flowTop + flowBottom) / 2;
  const height = Math.max(flowBottom - flowTop, valueBasedHeight);
  const y = flowCenter - height / 2;

  return {
    y,
    y0: y,
    y1: y + height,
    cy: flowCenter,
    height,
    valueBasedHeight,
    incomingTop,
    incomingBottom,
    outgoingTop,
    outgoingBottom,
    flowTop,
    flowBottom,
  };
}

export const JOURNEY_LAYOUT_GEOMETRY = {
  width: 1820,
  height: 440,
  margin: { top: 27, bottom: 7, left: 150, right: 145 },
  horizontalOffset: { "ADD TO CART": 32 } as Record<string, number>,
} as const;

export function getJourneyStageX(
  stage: string,
  index: number,
  stageCount: number,
) {
  const { width, margin, horizontalOffset } = JOURNEY_LAYOUT_GEOMETRY;
  const chartWidth = width - margin.left - margin.right;
  return (
    margin.left +
    (stageCount <= 1
      ? chartWidth / 2
      : (chartWidth * index) / (stageCount - 1)) +
    (horizontalOffset[stage] ?? 0)
  );
}

export function getJourneyTransitionCenterX(
  sourceStage: string,
  targetStage: string,
  stages: readonly string[],
) {
  const sourceIndex = stages.indexOf(sourceStage);
  const targetIndex = stages.indexOf(targetStage);
  if (sourceIndex < 0 || targetIndex < 0)
    throw new Error(
      `Unknown journey transition: ${sourceStage} -> ${targetStage}`,
    );
  return (
    (getJourneyStageX(sourceStage, sourceIndex, stages.length) +
      getJourneyStageX(targetStage, targetIndex, stages.length)) /
    2
  );
}

export function layoutJourney(
  nodes: JourneyNodeData[],
  links: JourneyLinkData[],
  stages: readonly string[],
) {
  const { width: W, height: H, margin } = JOURNEY_LAYOUT_GEOMETRY;
  const chartH = H - margin.top - margin.bottom;
  const maxValue = Math.max(...nodes.map((node) => node.value));
  const gapByStage: Record<string, number> = {
    "EXTERNAL SOURCE": 18,
    MARKETPLACE: 28,
    "CONTENT / ENTRY DRIVER": 14,
    "ORDER RESULT": 46,
    "POST-PURCHASE": 46,
  };
  const scaleByStage = stages.map((stage) => {
    const column = nodes.filter((node) => node.stage === stage);
    const gaps = (gapByStage[stage] ?? 24) * Math.max(0, column.length - 1);
    const total = column.reduce((sum, node) => sum + node.value, 0);
    return total > 0 ? Math.max(0, (chartH - gaps) / total) : Infinity;
  });
  const scale = Math.min(360 / maxValue, ...scaleByStage);
  const minRender = 0.45;
  const centerOffset: Record<string, number> = {
    "PRODUCT VIEW": 28,
    "ADD TO CART": -44,
    ORDER: 28,
  };
  const positioned: LayoutNode[] = [];
  const orderByStage: Record<string, readonly string[]> = {
    MARKETPLACE: ["Shopee", "TikTok Shop", "Lazada"],
  };
  stages.forEach((stage, index) => {
    const preferredOrder = orderByStage[stage];
    const column = nodes
      .filter((node) => node.stage === stage)
      .sort((a, b) => {
        if (!preferredOrder) return 0;
        return (
          preferredOrder.indexOf(a.label) - preferredOrder.indexOf(b.label)
        );
      });
    const heights = column.map((node) =>
      Math.max(minRender, node.value * scale),
    );
    const gap = gapByStage[stage] ?? 24;
    const total =
      heights.reduce((sum, h) => sum + h, 0) +
      gap * Math.max(0, column.length - 1);
    let y = margin.top + (chartH - total) / 2 + (centerOffset[stage] ?? 0);
    column.forEach((node, nodeIndex) => {
      const h = heights[nodeIndex],
        cy = y + h / 2;
      positioned.push({
        ...node,
        x: getJourneyStageX(stage, index, stages.length),
        h,
        y0: y,
        y1: y + h,
        cy,
      });
      y += h + gap;
    });
  });
  const nodeMap = new Map(positioned.map((node) => [node.id, node]));
  const allocations = new Map<
    string,
    { source?: [number, number]; target?: [number, number] }
  >();
  for (const node of positioned)
    for (const mode of ["source", "target"] as const) {
      const related = links.filter((link) =>
        mode === "source" ? link.source === node.id : link.target === node.id,
      );
      const total = related.reduce(
        (sum, link) => sum + Math.max(minRender, link.value * scale),
        0,
      );
      let acc = node.cy - total / 2;
      for (const link of related) {
        const thickness = Math.max(minRender, link.value * scale),
          pairEnd = acc + thickness,
          pair: [number, number] = [acc, pairEnd];
        allocations.set(link.id, { ...allocations.get(link.id), [mode]: pair });
        acc = pairEnd;
      }
    }
  const laidLinks: LayoutLink[] = links.map((link) => {
    const source = nodeMap.get(link.source)!,
      target = nodeMap.get(link.target)!,
      allocation = allocations.get(link.id)!,
      sy0 = allocation.source![0],
      sy1 = allocation.source![1],
      ty0 = allocation.target![0],
      ty1 = allocation.target![1],
      x0 = source.x + 3,
      x1 = target.x - 3,
      xi = (x0 + x1) / 2,
      scy = (sy0 + sy1) / 2,
      tcy = (ty0 + ty1) / 2;
    const conversionKey = `${link.source}->${link.target}`;
    const labelOffset =
      conversionKey === "product-view->add-to-cart"
        ? -16
        : conversionKey === "add-to-cart->order"
          ? -12
          : conversionKey === "product-view->order"
            ? 18
            : -8;
    return {
      ...link,
      sy0,
      sy1,
      ty0,
      ty1,
      thickness: Math.max(minRender, link.value * scale),
      path: `M${x0},${sy0} C${xi},${sy0} ${xi},${ty0} ${x1},${ty0} L${x1},${ty1} C${xi},${ty1} ${xi},${sy1} ${x0},${sy1} Z`,
      centerline: `M${x0},${scy} C${xi},${scy} ${xi},${tcy} ${x1},${tcy}`,
      labelX: (x0 + x1) / 2,
      labelY: (scy + tcy) / 2 + labelOffset,
    };
  });
  return { width: W, height: H, nodes: positioned, links: laidLinks, scale };
}
