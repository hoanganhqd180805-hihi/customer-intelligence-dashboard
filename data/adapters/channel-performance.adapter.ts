import type { ChannelPerformance, ChannelPerformanceDataset, ChannelPerformanceStatus, JourneyLinkData, JourneyNodeData } from "@/data/contracts/dashboard";

export const channelDiagnosticConfig={
  channels:["Ads","Affiliate","Livestream","Product Card","Shop Tab","Video"],
  platforms:["Shopee","Lazada","TikTok Shop"],
  statusPriority:{active_no_result:0,low_efficiency:1,not_activated:2,healthy:3} satisfies Record<ChannelPerformanceStatus,number>,
} as const;

const median=(values:number[])=>{
  if(!values.length)return null;
  const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
};

export function calculateRelativeBenchmark(rows:Pick<ChannelPerformance,"activity"|"productViews"|"conversionRate">[]){
  return median(rows.filter((row)=>row.activity>0&&row.productViews>0&&row.conversionRate!==null).map((row)=>row.conversionRate!));
}

export function adaptChannelPerformance(nodes:JourneyNodeData[],links:JourneyLinkData[]):ChannelPerformanceDataset{
  const normalizedId=(label:string)=>label.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
  const nodeById=new Map(nodes.map((node)=>[node.id,node]));
  const base=channelDiagnosticConfig.channels.map((channel)=>{
    const channelNode=nodes.find((node)=>node.label===channel);
    const activity=channelNode?links.filter((link)=>link.target===channelNode.id&&nodeById.get(link.source)?.stage==="MARKETPLACE").reduce((sum,link)=>sum+link.value,0):0;
    const productViewNode=nodes.find((node)=>node.label==="Product View");
    const productViews=channelNode&&productViewNode?links.filter((link)=>link.source===channelNode.id&&link.target===productViewNode.id).reduce((sum,link)=>sum+link.value,0):0;
    return {id:normalizedId(channel),channel,activity,productViews,conversionRate:activity>0?productViews/activity:null};
  });
  const benchmark=calculateRelativeBenchmark(base);
  const classify=(row:Omit<ChannelPerformance,"status"|"benchmark">,relativeBenchmark:number|null):ChannelPerformance=>{
    let status:ChannelPerformanceStatus;
    if(row.activity===0&&row.productViews===0)status="not_activated";
    else if(row.activity>0&&row.productViews===0)status="active_no_result";
    else if(relativeBenchmark!==null&&row.conversionRate!==null&&row.conversionRate<relativeBenchmark)status="low_efficiency";
    else status="healthy";
    return {...row,benchmark:relativeBenchmark,status};
  };
  const channels:ChannelPerformance[]=base.map((row)=>classify(row,benchmark)).sort((a,b)=>channelDiagnosticConfig.statusPriority[a.status]-channelDiagnosticConfig.statusPriority[b.status]||b.activity-a.activity);
  const contentById=new Map(channels.map((row)=>[nodes.find((node)=>node.label===row.channel)!.id,row]));
  const platformBase=channelDiagnosticConfig.platforms.map((platform)=>{
    const platformNode=nodes.find((node)=>node.label===platform)!;
    const distributed=links.filter((link)=>link.source===platformNode.id&&contentById.has(link.target));
    const activity=distributed.reduce((sum,link)=>sum+link.value,0);
    const productViews=distributed.reduce((sum,link)=>{const content=contentById.get(link.target)!;return sum+(content.conversionRate??0)*link.value;},0);
    return {id:normalizedId(platform),channel:platform,activity,productViews,conversionRate:activity>0?productViews/activity:null,activeContentCount:new Set(distributed.filter((link)=>link.value>0).map((link)=>link.target)).size,totalContentCount:channelDiagnosticConfig.channels.length};
  });
  const platformBenchmark=calculateRelativeBenchmark(platformBase);
  const platforms=platformBase.map((row)=>classify(row,platformBenchmark)).sort((a,b)=>channelDiagnosticConfig.statusPriority[a.status]-channelDiagnosticConfig.statusPriority[b.status]||b.activity-a.activity);
  return {benchmark,channels,platformBenchmark,platforms,summary:{tracked:channels.length,needsAttention:channels.filter((row)=>row.status==="active_no_result"||row.status==="low_efficiency").length,notActivated:channels.filter((row)=>row.status==="not_activated").length,healthy:channels.filter((row)=>row.status==="healthy").length}};
}
