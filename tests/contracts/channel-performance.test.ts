import { describe, expect, it } from "vitest";
import { channelPerformanceDataset } from "@/data/fixtures/channel-performance.fixture";

describe("channel performance diagnostics", () => {
  it("aggregates all marketplace activity and maps Product View output", () => {
    expect(channelPerformanceDataset.channels).toHaveLength(6);
    expect(
      new Set(channelPerformanceDataset.channels.map((row) => row.id)),
    ).toEqual(
      new Set([
        "ads",
        "affiliate",
        "livestream",
        "product_card",
        "shop_tab",
        "video",
      ]),
    );
    const channel = (name: string) =>
      channelPerformanceDataset.channels.find((row) => row.channel === name)!;
    expect(channel("Ads")).toMatchObject({
      activity: 32000,
      productViews: 8000,
    });
    expect(channel("Affiliate")).toMatchObject({
      activity: 19000,
      productViews: 5000,
    });
    expect(channel("Livestream")).toMatchObject({
      activity: 13000,
      productViews: 5000,
    });
    expect(channel("Product Card")).toMatchObject({
      activity: 4000,
      productViews: 1900,
    });
    expect(channel("Shop Tab")).toMatchObject({
      activity: 7500,
      productViews: 2000,
    });
    expect(channel("Video")).toMatchObject({
      activity: 14000,
      productViews: 1800,
    });
  });
  it("uses the active-channel median and sorts actionable rows first", () => {
    expect(channelPerformanceDataset.benchmark).toBeCloseTo(
      (5 / 19 + 2 / 7.5) / 2,
    );
    expect(
      channelPerformanceDataset.channels.slice(0, 3).map((row) => row.channel),
    ).toEqual(["Ads", "Affiliate", "Video"]);
    expect(channelPerformanceDataset.summary).toEqual({
      tracked: 6,
      needsAttention: 3,
      notActivated: 0,
      healthy: 3,
    });
  });
  it("attributes Product Views through content paths for each platform", () => {
    const platform = (name: string) =>
      channelPerformanceDataset.platforms.find((row) => row.channel === name)!;
    expect(platform("Shopee")).toMatchObject({
      activity: 52000,
      activeContentCount: 4,
      totalContentCount: 6,
      status: "healthy",
    });
    expect(platform("Lazada")).toMatchObject({
      activity: 7000,
      activeContentCount: 1,
      totalContentCount: 6,
      status: "low_efficiency",
    });
    expect(platform("TikTok Shop")).toMatchObject({
      activity: 30500,
      activeContentCount: 5,
      totalContentCount: 6,
      status: "healthy",
    });
    expect(platform("Shopee").productViews).toBeCloseTo(14300.67, 1);
    expect(platform("Lazada").productViews).toBeCloseTo(1750, 1);
    expect(platform("TikTok Shop").productViews).toBeCloseTo(7649.34, 1);
  });
});
