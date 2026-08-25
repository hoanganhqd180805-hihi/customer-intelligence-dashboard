import { describe, expect, it } from "vitest";
import {
  ignoredWorkbookJourneyRows,
  journeyContributionRateConflicts,
  journeyContributionShareTotals,
  journeyFlowConflicts,
  journeyLinks,
  journeyNodes,
  journeyPlatformTrafficTotals,
  summaryWorkbookJourneyRows,
  validWorkbookJourneyRows,
} from "@/data/fixtures/journey.fixture";
import {
  getActiveJourneyGraph,
  getDownstreamGraph,
  getUpstreamGraph,
} from "@/lib/journey/graph";
import {
  getJourneyNodeBodyGeometry,
  layoutJourney,
} from "@/lib/journey/layout";
import { journeyStages } from "@/data/fixtures/journey.fixture";

const node = (label: string) =>
  journeyNodes.find((item) => item.label === label)!;
const link = (source: string, target: string) =>
  journeyLinks.find(
    (item) =>
      item.source === node(source).id && item.target === node(target).id,
  )!;

describe("latest Customer Journey workbook fixture", () => {
  it("uses the latest Sankey Data rows and keeps same-stage totals out of the graph", () => {
    expect(validWorkbookJourneyRows).toHaveLength(40);
    expect(journeyLinks).toHaveLength(40);
    expect(ignoredWorkbookJourneyRows.map((row) => row.row)).toEqual([3]);
    expect(
      summaryWorkbookJourneyRows.map(({ row, source, value }) => ({
        row,
        source,
        value,
      })),
    ).toEqual([
      { row: 17, source: "Shopee", value: 25_000 },
      { row: 18, source: "TikTok Shop", value: 20_000 },
      { row: 19, source: "Lazada", value: 10_000 },
    ]);
    expect(link("Google", "Shopee").value).toBe(7_500);
    expect(link("YouTube", "Lazada").value).toBe(3_000);
    expect(link("Facebook", "TikTok Shop").value).toBe(3_000);
    expect(link("Shopee", "Ads").value).toBe(25_000);
    expect(link("Ads", "Product View").value).toBe(8_000);
    expect(link("Product View", "Add to Cart").value).toBe(8_350);
    expect(link("Order", "Complete").value).toBe(9_150);
  });

  it("treats External Source links as contribution shares per platform", () => {
    expect(link("Google", "Shopee").metric).toBe("contribution_share");
    expect(link("Google", "Shopee").rate).toBeCloseTo(7_500 / 31_500, 10);
    expect(journeyContributionRateConflicts).toEqual([]);
    expect(journeyContributionShareTotals).toEqual([
      {
        platform: "Shopee",
        incomingTraffic: 31_500,
        providedShareTotal: 1,
      },
      {
        platform: "TikTok Shop",
        incomingTraffic: 23_000,
        providedShareTotal: 1,
      },
      {
        platform: "Lazada",
        incomingTraffic: 8_500,
        providedShareTotal: 1,
      },
    ]);
  });

  it("includes direct app traffic in normalized platform totals", () => {
    expect(node("Google").value).toBe(10_500);
    expect(node("Shopee").value).toBe(56_500);
    expect(node("TikTok Shop").value).toBe(43_000);
    expect(node("Lazada").value).toBe(18_500);
    expect(journeyPlatformTrafficTotals).toEqual([
      {
        platform: "Shopee",
        externalTraffic: 31_500,
        directTraffic: 25_000,
        totalTraffic: 56_500,
      },
      {
        platform: "TikTok Shop",
        externalTraffic: 23_000,
        directTraffic: 20_000,
        totalTraffic: 43_000,
      },
      {
        platform: "Lazada",
        externalTraffic: 8_500,
        directTraffic: 10_000,
        totalTraffic: 18_500,
      },
    ]);
    expect(node("Ads").value).toBe(32_000);
    expect(node("Affiliate").value).toBe(19_000);
    expect(node("Livestream").value).toBe(13_000);
    expect(node("Video").value).toBe(14_000);
    expect(node("Product Card").value).toBe(4_000);
    expect(node("Shop Tab").value).toBe(7_500);
    expect(node("Product View").value).toBe(23_700);
    expect(node("Add to Cart").value).toBe(8_350);
    expect(node("Order").value).toBe(11_900);
    expect(node("Complete").value).toBe(9_150);
    expect(journeyFlowConflicts).toEqual(
      expect.arrayContaining([
        { node: "Shopee", incoming: 31_500, outgoing: 52_000 },
        { node: "TikTok Shop", incoming: 23_000, outgoing: 30_500 },
        { node: "Lazada", incoming: 8_500, outgoing: 7_000 },
        { node: "Product View", incoming: 23_700, outgoing: 15_930 },
        { node: "Order", incoming: 11_900, outgoing: 11_890 },
        { node: "Complete", incoming: 9_150, outgoing: 10_380 },
      ]),
    );
  });

  it("derives all five workbook-backed CVRs from the required volume totals", () => {
    const stageTotal = (stage: string) =>
      journeyNodes
        .filter((item) => item.stage === stage)
        .reduce((sum, item) => sum + item.value, 0);
    const stageFlow = (sourceStage: string, targetStage: string) => {
      const sourceIds = new Set(
        journeyNodes
          .filter((item) => item.stage === sourceStage)
          .map((item) => item.id),
      );
      const targetIds = new Set(
        journeyNodes
          .filter((item) => item.stage === targetStage)
          .map((item) => item.id),
      );
      return journeyLinks
        .filter(
          (item) => sourceIds.has(item.source) && targetIds.has(item.target),
        )
        .reduce((sum, item) => sum + item.value, 0);
    };
    const platformIds = new Set(
      journeyNodes
        .filter((item) => item.stage === "MARKETPLACE")
        .map((item) => item.id),
    );
    const contentIds = new Set(
      journeyNodes
        .filter((item) => item.stage === "CONTENT / ENTRY DRIVER")
        .map((item) => item.id),
    );
    expect(
      journeyLinks
        .filter(
          (item) => platformIds.has(item.source) && contentIds.has(item.target),
        )
        .every((item) => item.metric === "distribution_share"),
    ).toBe(true);

    const rates = [
      stageFlow("MARKETPLACE", "CONTENT / ENTRY DRIVER") /
        stageTotal("MARKETPLACE"),
      stageFlow("CONTENT / ENTRY DRIVER", "PRODUCT VIEW") /
        stageTotal("CONTENT / ENTRY DRIVER"),
      link("Product View", "Add to Cart").rate!,
      link("Add to Cart", "Order").rate!,
      link("Order", "Complete").rate!,
    ];

    expect(rates).toEqual([
      89_500 / 118_000,
      23_700 / 89_500,
      8_350 / 23_700,
      4_320 / 8_350,
      9_150 / 11_900,
    ]);
    expect(Math.max(...rates.map((rate) => 1 - rate))).toBeCloseTo(
      1 - 23_700 / 89_500,
      10,
    );
    expect(rates.map((rate) => 1 - rate)).toEqual([
      1 - 89_500 / 118_000,
      1 - 23_700 / 89_500,
      1 - 8_350 / 23_700,
      1 - 4_320 / 8_350,
      1 - 9_150 / 11_900,
    ]);
    expect(journeyLinks.every((item) => item.dataType === null)).toBe(true);
  });
});

describe("journey graph traversal", () => {
  it("traces upstream recursively", () =>
    expect([...getUpstreamGraph("complete", journeyLinks).nodeIds]).toEqual(
      expect.arrayContaining([
        "complete",
        "order",
        "product-view",
        "ads",
        "shopee",
        "google",
      ]),
    ));
  it("traces downstream recursively", () =>
    expect([...getDownstreamGraph("ads", journeyLinks).nodeIds]).toEqual(
      expect.arrayContaining([
        "ads",
        "product-view",
        "order",
        "complete",
        "cancel",
        "good-review",
        "bad-review",
        "buy-again",
      ]),
    ));
  it("combines full paths through a node", () =>
    expect(
      getActiveJourneyGraph("product-view", journeyNodes, journeyLinks).linkIds
        .size,
    ).toBe(40));
});

describe("compact journey layout", () => {
  const layout = layoutJourney(journeyNodes, journeyLinks, journeyStages);
  it("uses the compact coordinate height without changing the global linear scale", () => {
    expect(layout.width).toBe(1820);
    expect(layout.height).toBe(440);
    expect(layout.scale).toBeGreaterThan(0);
  });
  it("keeps branch node labels separated", () => {
    for (const stage of ["ORDER RESULT", "POST-PURCHASE"]) {
      const centers = layout.nodes
        .filter((node) => node.stage === stage)
        .map((node) => node.cy)
        .sort((a, b) => a - b);
      expect(
        Math.min(
          ...centers.slice(1).map((center, index) => center - centers[index]),
        ),
      ).toBeGreaterThan(45);
    }
  });
  it("keeps every stage free of node overlap and every link visible", () => {
    for (const stage of journeyStages) {
      const column = layout.nodes
        .filter((node) => node.stage === stage)
        .sort((a, b) => a.y0 - b.y0);
      expect(
        column.every(
          (node, index) => index === 0 || node.y0 >= column[index - 1].y1,
        ),
      ).toBe(true);
    }
    expect(
      layout.links.every(
        (link) => Number.isFinite(link.thickness) && link.thickness > 0,
      ),
    ).toBe(true);
  });
  it("keeps proportional platform nodes ordered and visibly separated", () => {
    const platforms = layout.nodes
      .filter((item) => item.stage === "MARKETPLACE")
      .sort((a, b) => a.y0 - b.y0);
    expect(platforms.map((item) => item.label)).toEqual([
      "Shopee",
      "TikTok Shop",
      "Lazada",
    ]);
    expect(platforms.map((item) => item.value)).toEqual([
      56_500, 43_000, 18_500,
    ]);
    expect(platforms[1].y0 - platforms[0].y1).toBeGreaterThanOrEqual(20);
    expect(platforms[2].y0 - platforms[1].y1).toBeGreaterThanOrEqual(20);
    expect(platforms[0].h / platforms[1].h).toBeCloseTo(56_500 / 43_000, 10);
    expect(platforms[1].h / platforms[2].h).toBeCloseTo(43_000 / 18_500, 10);
    for (const platform of platforms) {
      const attached = layout.links.filter(
        (item) => item.source === platform.id || item.target === platform.id,
      );
      expect(
        attached.every((item) =>
          item.source === platform.id
            ? item.sy0 >= platform.y0 && item.sy1 <= platform.y1
            : item.ty0 >= platform.y0 && item.ty1 <= platform.y1,
        ),
      ).toBe(true);

      const incoming = attached.filter((item) => item.target === platform.id);
      const outgoing = attached.filter((item) => item.source === platform.id);
      const incomingTop = Math.min(...incoming.map((item) => item.ty0));
      const incomingBottom = Math.max(...incoming.map((item) => item.ty1));
      const outgoingTop = Math.min(...outgoing.map((item) => item.sy0));
      const outgoingBottom = Math.max(...outgoing.map((item) => item.sy1));
      const body = getJourneyNodeBodyGeometry(platform, layout.links);
      const flowTop = Math.min(incomingTop, outgoingTop);
      const flowBottom = Math.max(incomingBottom, outgoingBottom);
      expect(body).toEqual(
        expect.objectContaining({
          incomingTop,
          incomingBottom,
          outgoingTop,
          outgoingBottom,
          flowTop,
          flowBottom,
          valueBasedHeight: platform.y1 - platform.y0,
          height: Math.max(
            flowBottom - flowTop,
            platform.y1 - platform.y0,
          ),
        }),
      );
      expect(body.y0).toBeLessThanOrEqual(flowTop);
      expect(body.y1).toBeGreaterThanOrEqual(flowBottom);
      expect((incomingTop + incomingBottom) / 2).toBeCloseTo(platform.cy, 10);
      expect((outgoingTop + outgoingBottom) / 2).toBeCloseTo(platform.cy, 10);
    }
  });
  it("forms the two-path Product View triangle", () => {
    const node = (id: string) => layout.nodes.find((item) => item.id === id)!;
    expect(node("add-to-cart").cy).toBeLessThan(node("product-view").cy);
    expect(node("add-to-cart").cy).toBeLessThan(node("order").cy);
    expect(
      layout.links.some(
        (link) =>
          link.source === "product-view" && link.target === "add-to-cart",
      ),
    ).toBe(true);
    expect(
      layout.links.some(
        (link) => link.source === "add-to-cart" && link.target === "order",
      ),
    ).toBe(true);
    expect(
      layout.links.some(
        (link) => link.source === "product-view" && link.target === "order",
      ),
    ).toBe(true);
  });
  it("keeps the Add to Cart selection on its own conversion route", () => {
    const active = getActiveJourneyGraph(
      "add-to-cart",
      journeyNodes,
      journeyLinks,
    );
    const link = (source: string, target: string) =>
      journeyLinks.find(
        (item) => item.source === source && item.target === target,
      )!.id;
    expect(active.linkIds.has(link("product-view", "add-to-cart"))).toBe(true);
    expect(active.linkIds.has(link("add-to-cart", "order"))).toBe(true);
    expect(active.linkIds.has(link("product-view", "order"))).toBe(false);
  });
  it("keeps both conversion routes upstream of Order", () => {
    const active = getActiveJourneyGraph("order", journeyNodes, journeyLinks);
    const link = (source: string, target: string) =>
      journeyLinks.find(
        (item) => item.source === source && item.target === target,
      )!.id;
    expect(active.linkIds.has(link("product-view", "add-to-cart"))).toBe(true);
    expect(active.linkIds.has(link("add-to-cart", "order"))).toBe(true);
    expect(active.linkIds.has(link("product-view", "order"))).toBe(true);
  });
});
