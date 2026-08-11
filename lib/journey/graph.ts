import type { JourneyLinkData, JourneyNodeData } from "@/data/contracts/dashboard";

export interface ActiveJourneyGraph { nodeIds: Set<string>; linkIds: Set<string> }

export function getUpstreamGraph(nodeId: string, links: JourneyLinkData[]): ActiveJourneyGraph {
  const nodeIds = new Set([nodeId]);
  const linkIds = new Set<string>();
  const pending = [nodeId];
  while (pending.length) {
    const current = pending.pop()!;
    for (const link of links) if (link.target === current) {
      linkIds.add(link.id);
      if (!nodeIds.has(link.source)) { nodeIds.add(link.source); pending.push(link.source); }
    }
  }
  return { nodeIds, linkIds };
}

export function getDownstreamGraph(nodeId: string, links: JourneyLinkData[]): ActiveJourneyGraph {
  const nodeIds = new Set([nodeId]);
  const linkIds = new Set<string>();
  const pending = [nodeId];
  while (pending.length) {
    const current = pending.pop()!;
    for (const link of links) if (link.source === current) {
      linkIds.add(link.id);
      if (!nodeIds.has(link.target)) { nodeIds.add(link.target); pending.push(link.target); }
    }
  }
  return { nodeIds, linkIds };
}

export function getActiveJourneyGraph(nodeId: string, nodes: JourneyNodeData[], links: JourneyLinkData[]): ActiveJourneyGraph {
  if (!nodes.some((node) => node.id === nodeId)) return { nodeIds:new Set(), linkIds:new Set() };
  const upstream = getUpstreamGraph(nodeId, links);
  const downstream = getDownstreamGraph(nodeId, links);
  return { nodeIds:new Set([...upstream.nodeIds,...downstream.nodeIds]), linkIds:new Set([...upstream.linkIds,...downstream.linkIds]) };
}
