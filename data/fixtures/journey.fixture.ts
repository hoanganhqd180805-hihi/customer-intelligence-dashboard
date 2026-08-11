import type { JourneyLinkData, JourneyNodeData } from "@/data/contracts/dashboard";
import { rawOverviewApiFixture } from "./overview-api.fixture";
import { rawCancellationWorkbookFixture } from "./section02-workbook.fixture";

const completedOrders=rawOverviewApiFixture.total_orders;
if(completedOrders==null) throw new Error("Missing refreshed workbook total orders for Customer Journey");
const cancelledOrders=rawCancellationWorkbookFixture.reasons.reduce((sum,row)=>sum+row.cancelled_orders,0);
const createdOrders=completedOrders+cancelledOrders;
const percent=(value:number,total:number)=>`${(value/total*100).toFixed(1)}%`;

export const journeyStages = ["PLATFORM", "CONTENT", "PRODUCT VIEW", "ORDER", "ORDER RESULT", "POST-PURCHASE"] as const;

export const journeyNodes: JourneyNodeData[] = [
  { id:"shopee", stage:"PLATFORM", label:"Shopee", value:93_760, color:"#f0954a", meta:"Source platform for the available Ads data in the selected period" },
  { id:"ads", stage:"CONTENT", label:"Ads", value:93_760, color:"#f0724a", meta:"93,760 impressions" },
  { id:"productview", stage:"PRODUCT VIEW", label:"Product View", value:1_880, color:"#98dfff", meta:"2.0% from Ads" },
  { id:"order", stage:"ORDER", label:"Order", value:createdOrders, color:"#e0498f", meta:"33.8% from Product View" },
  { id:"complete", stage:"ORDER RESULT", label:"Complete", value:completedOrders, color:"#86eae9", meta:`${percent(completedOrders,createdOrders)} of Orders` },
  { id:"cancel", stage:"ORDER RESULT", label:"Cancel", value:cancelledOrders, color:"#e2504a", meta:`${percent(cancelledOrders,createdOrders)} of Orders` },
  { id:"goodreview", stage:"POST-PURCHASE", label:"Good Review", value:103, color:"#98dfff", meta:"19.4% of Completed Orders" },
  { id:"badreview", stage:"POST-PURCHASE", label:"Bad Review", value:5, color:"#e2504a", meta:"0.9% of Completed Orders" },
  { id:"buyagain", stage:"POST-PURCHASE", label:"Buy Again", value:35, color:"#4ade80", meta:"6.6% of Completed Orders" },
];

export const journeyLinks: JourneyLinkData[] = [
  { id:"shopee-ads", source:"shopee", target:"ads", value:93_760, label:"100%" },
  { id:"ads-productview", source:"ads", target:"productview", value:1_880, label:"2.0%" },
  { id:"productview-order", source:"productview", target:"order", value:createdOrders, label:percent(createdOrders,1_880) },
  { id:"order-complete", source:"order", target:"complete", value:completedOrders, label:percent(completedOrders,createdOrders) },
  { id:"order-cancel", source:"order", target:"cancel", value:cancelledOrders, label:percent(cancelledOrders,createdOrders) },
  { id:"complete-goodreview", source:"complete", target:"goodreview", value:103, label:"19.4%" },
  { id:"complete-badreview", source:"complete", target:"badreview", value:5, label:"0.9%" },
  { id:"complete-buyagain", source:"complete", target:"buyagain", value:35, label:"6.6%" },
];
