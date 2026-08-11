import { describe, expect, it } from "vitest";
import { journeyLinks, journeyNodes } from "@/data/fixtures/journey.fixture";
import { getActiveJourneyGraph, getDownstreamGraph, getUpstreamGraph } from "@/lib/journey/graph";
import { layoutJourney } from "@/lib/journey/layout";
import { journeyStages } from "@/data/fixtures/journey.fixture";

describe("journey graph traversal",()=>{
  it("traces upstream recursively",()=>expect([...getUpstreamGraph("complete",journeyLinks).nodeIds]).toEqual(expect.arrayContaining(["complete","order","productview","ads","shopee"])));
  it("traces downstream recursively",()=>expect([...getDownstreamGraph("ads",journeyLinks).nodeIds]).toEqual(expect.arrayContaining(["ads","productview","order","complete","cancel","goodreview","badreview","buyagain"])));
  it("combines full paths through a node",()=>expect(getActiveJourneyGraph("productview",journeyNodes,journeyLinks).linkIds.size).toBe(8));
});

describe("compact journey layout",()=>{
  const layout=layoutJourney(journeyNodes,journeyLinks,journeyStages);
  it("uses the compact coordinate height without changing the global linear scale",()=>{
    expect(layout.width).toBe(1820);
    expect(layout.height).toBe(540);
    expect(layout.scale).toBeCloseTo(470/93_760);
  });
  it("keeps branch node labels separated",()=>{
    for(const stage of ["ORDER RESULT","POST-PURCHASE"]){
      const centers=layout.nodes.filter((node)=>node.stage===stage).map((node)=>node.cy).sort((a,b)=>a-b);
      expect(Math.min(...centers.slice(1).map((center,index)=>center-centers[index]))).toBeGreaterThan(45);
    }
  });
});
