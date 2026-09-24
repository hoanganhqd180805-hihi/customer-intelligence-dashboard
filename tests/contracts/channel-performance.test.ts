import { describe, expect, it } from "vitest";
import { channelPerformanceDataset } from "@/data/fixtures/channel-performance.fixture";

describe("channel performance diagnostics", () => {
  it("aggregates all marketplace activity and maps Product View output", () => {
    expect(channelPerformanceDataset.channels).toHaveLength(4);
    expect(
      new Set(channelPerformanceDataset.channels.map((row) => row.id)),
    ).toEqual(new Set(["ads", "affiliate", "livestream", "video"]));
    const channel = (name: string) =>
      channelPerformanceDataset.channels.find((row) => row.channel === name)!;
    expect(channel("Ads")).toMatchObject({
      activity: 43500,
      productViews: 11900,
    });
    expect(channel("Affiliate")).toMatchObject({
      activity: 19000,
      productViews: 5000,
    });
    expect(channel("Livestream")).toMatchObject({
      activity: 13000,
      productViews: 5000,
    });
    expect(channel("Video")).toMatchObject({
      activity: 14000,
      productViews: 1800,
    });
  });
  it("uses the active-channel median and sorts actionable rows first", () => {
    expect(channelPerformanceDataset.benchmark).toBeCloseTo(
      (5 / 19 + 11.9 / 43.5) / 2,
    );
    expect(
      channelPerformanceDataset.channels.slice(0, 2).map((row) => row.channel),
    ).toEqual(["Affiliate", "Video"]);
    expect(channelPerformanceDataset.summary).toEqual({
      tracked: 4,
      needsAttention: 2,
      notActivated: 0,
      healthy: 2,
    });
  });
  it("attributes Product Views through content paths for each platform", () => {
    const platform = (name: string) =>
      channelPerformanceDataset.platforms.find((row) => row.channel === name)!;
    expect(platform("Shopee")).toMatchObject({
      activity: 52000,
      activeContentCount: 4,
      totalContentCount: 4,
      status: "healthy",
    });
    expect(platform("Lazada")).toMatchObject({
      activity: 7000,
      activeContentCount: 1,
      totalContentCount: 4,
      status: "healthy",
    });
    expect(platform("TikTok Shop")).toMatchObject({
      activity: 30500,
      activeContentCount: 4,
      totalContentCount: 4,
      status: "low_efficiency",
    });
    expect(platform("Shopee").productViews).toBeCloseTo(14889.75, 1);
    expect(platform("Lazada").productViews).toBeCloseTo(1914.94, 1);
    expect(platform("TikTok Shop").productViews).toBeCloseTo(6895.31, 1);
  });
});
