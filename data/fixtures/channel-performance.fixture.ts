import { adaptChannelPerformance } from "@/data/adapters/channel-performance.adapter";
import { journeyLinks, journeyNodes } from "@/data/fixtures/journey.fixture";

export const channelPerformanceDataset=adaptChannelPerformance(journeyNodes,journeyLinks);
