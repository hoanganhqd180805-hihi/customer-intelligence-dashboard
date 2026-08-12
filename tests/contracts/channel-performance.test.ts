import { describe,expect,it } from "vitest";
import { channelPerformanceDataset } from "@/data/fixtures/channel-performance.fixture";

describe("channel performance diagnostics",()=>{
  it("aggregates all marketplace activity and maps Product View output",()=>{
    expect(channelPerformanceDataset.channels).toHaveLength(6);
    expect(new Set(channelPerformanceDataset.channels.map((row)=>row.id))).toEqual(new Set(["ads","affiliate","livestream","product_card","shop_tab","video"]));
    const channel=(name:string)=>channelPerformanceDataset.channels.find((row)=>row.channel===name)!;
    expect(channel("Ads")).toMatchObject({activity:79000,productViews:10000});
    expect(channel("Affiliate")).toMatchObject({activity:23000,productViews:8000});
    expect(channel("Livestream")).toMatchObject({activity:15000,productViews:8000});
    expect(channel("Product Card")).toMatchObject({activity:4000,productViews:1900});
    expect(channel("Shop Tab")).toMatchObject({activity:15000,productViews:2000});
    expect(channel("Video")).toMatchObject({activity:22000,productViews:1800});
  });
  it("uses the active-channel median and sorts actionable rows first",()=>{
    expect(channelPerformanceDataset.benchmark).toBeCloseTo((2/15+8/23)/2);
    expect(channelPerformanceDataset.channels.slice(0,3).map((row)=>row.channel)).toEqual(["Ads","Video","Shop Tab"]);
    expect(channelPerformanceDataset.summary).toEqual({tracked:6,needsAttention:3,notActivated:0,healthy:3});
  });
  it("attributes Product Views through content paths for each platform",()=>{
    const platform=(name:string)=>channelPerformanceDataset.platforms.find((row)=>row.channel===name)!;
    expect(platform("Shopee")).toMatchObject({activity:110000,activeContentCount:4,totalContentCount:6,status:"healthy"});
    expect(platform("Lazada")).toMatchObject({activity:9000,activeContentCount:1,totalContentCount:6,status:"low_efficiency"});
    expect(platform("TikTok Shop")).toMatchObject({activity:39000,activeContentCount:5,totalContentCount:6,status:"healthy"});
    expect(platform("Shopee").productViews).toBeCloseTo(22339.81,1);
    expect(platform("Lazada").productViews).toBeCloseTo(1139.24,1);
    expect(platform("TikTok Shop").productViews).toBeCloseTo(8220.95,1);
  });
});
