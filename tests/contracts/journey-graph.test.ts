import { describe, expect, it } from "vitest";
import { journeyLinks, journeyNodes } from "@/data/fixtures/journey.fixture";
import { getActiveJourneyGraph, getDownstreamGraph, getUpstreamGraph } from "@/lib/journey/graph";
import { layoutJourney } from "@/lib/journey/layout";
import { journeyStages } from "@/data/fixtures/journey.fixture";

describe("journey graph traversal",()=>{
  it("traces upstream recursively",()=>expect([...getUpstreamGraph("complete",journeyLinks).nodeIds]).toEqual(expect.arrayContaining(["complete","order","product-view","ads","shopee","google"])));
  it("traces downstream recursively",()=>expect([...getDownstreamGraph("ads",journeyLinks).nodeIds]).toEqual(expect.arrayContaining(["ads","product-view","order","complete","cancel","good-review","bad-review","buy-again"])));
  it("combines full paths through a node",()=>expect(getActiveJourneyGraph("product-view",journeyNodes,journeyLinks).linkIds.size).toBe(40));
});

describe("compact journey layout",()=>{
  const layout=layoutJourney(journeyNodes,journeyLinks,journeyStages);
  it("uses the compact coordinate height without changing the global linear scale",()=>{
    expect(layout.width).toBe(1820);
    expect(layout.height).toBe(440);
    expect(layout.scale).toBeGreaterThan(0);
  });
  it("keeps branch node labels separated",()=>{
    for(const stage of ["ORDER RESULT","POST-PURCHASE"]){
      const centers=layout.nodes.filter((node)=>node.stage===stage).map((node)=>node.cy).sort((a,b)=>a-b);
      expect(Math.min(...centers.slice(1).map((center,index)=>center-centers[index]))).toBeGreaterThan(45);
    }
  });
  it("keeps every stage free of node overlap and every link visible",()=>{
    for(const stage of journeyStages){
      const column=layout.nodes.filter((node)=>node.stage===stage).sort((a,b)=>a.y0-b.y0);
      expect(column.every((node,index)=>index===0||node.y0>=column[index-1].y1)).toBe(true);
    }
    expect(layout.links.every((link)=>Number.isFinite(link.thickness)&&link.thickness>0)).toBe(true);
  });
  it("forms the two-path Product View triangle",()=>{
    const node=(id:string)=>layout.nodes.find((item)=>item.id===id)!;
    expect(node("add-to-cart").cy).toBeLessThan(node("product-view").cy);
    expect(node("add-to-cart").cy).toBeLessThan(node("order").cy);
    expect(layout.links.some((link)=>link.source==="product-view"&&link.target==="add-to-cart")).toBe(true);
    expect(layout.links.some((link)=>link.source==="add-to-cart"&&link.target==="order")).toBe(true);
    expect(layout.links.some((link)=>link.source==="product-view"&&link.target==="order")).toBe(true);
  });
  it("keeps the Add to Cart selection on its own conversion route",()=>{
    const active=getActiveJourneyGraph("add-to-cart",journeyNodes,journeyLinks);
    const link=(source:string,target:string)=>journeyLinks.find((item)=>item.source===source&&item.target===target)!.id;
    expect(active.linkIds.has(link("product-view","add-to-cart"))).toBe(true);
    expect(active.linkIds.has(link("add-to-cart","order"))).toBe(true);
    expect(active.linkIds.has(link("product-view","order"))).toBe(false);
  });
  it("keeps both conversion routes upstream of Order",()=>{
    const active=getActiveJourneyGraph("order",journeyNodes,journeyLinks);
    const link=(source:string,target:string)=>journeyLinks.find((item)=>item.source===source&&item.target===target)!.id;
    expect(active.linkIds.has(link("product-view","add-to-cart"))).toBe(true);
    expect(active.linkIds.has(link("add-to-cart","order"))).toBe(true);
    expect(active.linkIds.has(link("product-view","order"))).toBe(true);
  });
});
