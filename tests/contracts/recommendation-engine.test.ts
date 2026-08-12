import { describe,expect,it } from "vitest";
import { recommendations } from "@/data/recommendations/recommendation-engine";

describe("recommendation engine",()=>{
  it("returns exactly four distinct themes sorted by priority",()=>{
    expect(recommendations).toHaveLength(4);
    expect(new Set(recommendations.map((item)=>item.category)).size).toBe(4);
    expect(recommendations.map((item)=>item.priority)).toEqual([...recommendations.map((item)=>item.priority)].sort((a,b)=>b-a));
  });
  it("uses journey, channel, cancellation and segmentation evidence",()=>{
    expect(recommendations.map((item)=>item.id)).toEqual(["journey-conversion","channel-efficiency","cancellation-impact","segment-value"]);
    expect(recommendations.every((item)=>item.evidence.length>=2&&item.signal&&item.action&&item.relationship&&item.rationale)).toBe(true);
  });
});
