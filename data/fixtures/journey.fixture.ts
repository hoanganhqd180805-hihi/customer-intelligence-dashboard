import type { JourneyLinkData, JourneyNodeData } from "@/data/contracts/dashboard";

export const journeyStages = [
  "EXTERNAL SOURCE",
  "MARKETPLACE",
  "CONTENT / ENTRY DRIVER",
  "PRODUCT VIEW",
  "ADD TO CART",
  "ORDER",
  "ORDER RESULT",
  "POST-PURCHASE",
] as const;

const stageByStep = new Map<number,string>(journeyStages.map((stage,index)=>[index,stage]));
const colorsByStep = ["#4285f4","#ee4d2d","#f2a93b","#86eae9","#4ade80","#e0498f","#86eae9","#98dfff"] as const;
const colorByLabel:Record<string,string>={
  Google:"#4285F4",YouTube:"#FF0000",Facebook:"#1877F2",Instagram:"#E4405F",Threads:"#AFAFAF",
  Shopee:"#EE4D2D",Lazada:"#1E88E5","TikTok Shop":"#25F4EE",
  Ads:"#F2A93B",Affiliate:"#25C7B7",Livestream:"#9B6DFF","Product Card":"#4ADE80","Shop Tab":"#22D3EE",Video:"#4C8DFF",
  Cancel:"#E2504A","Bad Review":"#E2504A","Buy Again":"#4ADE80","Good Review":"#86EAE9",
};

interface WorkbookJourneyRow {
  row:number;
  source:string;
  target:string;
  value:number;
  stepFrom:number;
  stepTo:number;
  rate:number|string;
}

/** Exact rows freshly extracted from `MOCK DATA.xlsx`, `Sankey Data!B2:G42`. */
export const workbookJourneyRows: WorkbookJourneyRow[] = [
  [2,"Google","Shopee",32000,0,1,.2909090909090909],[3,"Google","Lazada",0,0,1,0],[4,"Google","TikTok Shop",8000,0,1,.13333333333333333],
  [5,"YouTube","Shopee",24000,0,1,.21818181818181817],[6,"YouTube","Lazada",4000,0,1,.27586206896551724],[7,"YouTube","TikTok Shop",18000,0,1,.3],
  [8,"Facebook","Shopee",28000,0,1,.2545454545454545],[9,"Facebook","Lazada",5500,0,1,.3793103448275862],[10,"Facebook","TikTok Shop",12000,0,1,.2],
  [11,"Instagram","Shopee",18000,0,1,.16363636363636364],[12,"Instagram","Lazada",3500,0,1,.2413793103448276],[13,"Instagram","TikTok Shop",16000,0,1,.26666666666666666],
  [14,"Threads","Shopee",8000,0,1,.07272727272727272],[15,"Threads","Lazada",1500,0,1,.10344827586206896],[16,"Threads","TikTok Shop",6000,0,1,.1],
  [17,"Shopee","Ads",70000,1,2,.8860759493670886],[18,"Shopee","Affiliate",18000,1,2,.782608695652174],[19,"Shopee","Livestream",12000,1,2,.8],[20,"Shopee","Video",10000,1,2,.45454545454545453],
  [21,"Lazada","Ads",9000,1,2,.11392405063291139],[22,"TikTok Shop","Affiliate",5000,1,2,.21739130434782608],[23,"TikTok Shop","Livestream",3000,1,2,.2],
  [24,"TikTok Shop","Product Card",4000,1,2,"Only Tiktok Shop"],[25,"TikTok Shop","Shop Tab",15000,1,2,"Only Tiktok Shop"],[26,"TikTok Shop","Video",12000,1,2,.5454545454545454],
  [27,"Ads","Product View",10000,2,3,.12658227848101267],[28,"Affiliate","Product View",8000,2,3,.34782608695652173],[29,"Livestream","Product View",8000,2,3,.5333333333333333],
  [30,"Product Card","Product View",1900,2,3,.475],[31,"Shop Tab","Product View",2000,2,3,.13333333333333333],[32,"Video","Product View",1800,2,3,.08181818181818182],
  [33,"Product View","Add to Cart",8350,3,4,.2634069400630915],[34,"Add to cart","Order",4320,4,5,.5173652694610779],[35,"Product View","Order",7580,3,5,.2391167192429022],
  [36,"Order","Complete",9150,5,6,.7689075630252101],[37,"Order","Cancel",2380,5,6,.2],[38,"Order","Processing",360,5,6,.030252100840336135],
  [39,"Complete","Return",120,6,7,.013114754098360656],[40,"Complete","Good Review",7450,6,7,.8142076502732241],[41,"Complete","Bad Review",1560,6,7,.17049180327868851],[42,"Complete","Buy Again",1250,6,7,.1366120218579235],
].map(([row,source,target,value,stepFrom,stepTo,rate])=>({row:Number(row),source:String(source),target:String(target),value:Number(value),stepFrom:Number(stepFrom),stepTo:Number(stepTo),rate:typeof rate==="number"?rate:String(rate)}));

export const ignoredWorkbookJourneyRows=workbookJourneyRows.filter((row)=>!row.source.trim()||!row.target.trim()||!Number.isFinite(row.value)||row.value<=0);
const validWorkbookJourneyRows=workbookJourneyRows.filter((row)=>!ignoredWorkbookJourneyRows.includes(row));
const formatRate=(rate:number|string)=>typeof rate==="number"?new Intl.NumberFormat("en-US",{style:"percent",maximumFractionDigits:1}).format(rate):rate;

const normalizeLabel=(label:string)=>label.trim().toLocaleLowerCase("en-US");
const slug=(label:string)=>normalizeLabel(label).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const nodeDefinitions=new Map<string,{label:string;step:number}>();
for(const row of validWorkbookJourneyRows){
  const sourceKey=normalizeLabel(row.source),targetKey=normalizeLabel(row.target);
  const sourceExisting=nodeDefinitions.get(sourceKey),targetExisting=nodeDefinitions.get(targetKey);
  if(sourceExisting&&sourceExisting.step!==row.stepFrom)throw new Error(`Conflicting source step for workbook row ${row.row}: ${row.source}`);
  if(targetExisting&&targetExisting.step!==row.stepTo)throw new Error(`Conflicting target step for workbook row ${row.row}: ${row.target}`);
  nodeDefinitions.set(sourceKey,sourceExisting??{label:row.source.trim(),step:row.stepFrom});
  nodeDefinitions.set(targetKey,targetExisting??{label:row.target.trim(),step:row.stepTo});
}

const nodeId=(label:string)=>slug(label);
const incoming=(label:string)=>validWorkbookJourneyRows.filter((row)=>normalizeLabel(row.target)===normalizeLabel(label)).reduce((sum,row)=>sum+row.value,0);
const outgoing=(label:string)=>validWorkbookJourneyRows.filter((row)=>normalizeLabel(row.source)===normalizeLabel(label)).reduce((sum,row)=>sum+row.value,0);

export const journeyNodes: JourneyNodeData[] = [...nodeDefinitions.values()].map(({label,step})=>{
  const incomingFlow=incoming(label),outgoingFlow=outgoing(label),value=Math.max(incomingFlow,outgoingFlow);
  const emphasisColor=colorByLabel[label]??colorsByStep[step];
  return {id:nodeId(label),stage:stageByStep.get(step)!,label,value,color:emphasisColor,meta:`Incoming ${incomingFlow.toLocaleString("en-US")} · Outgoing ${outgoingFlow.toLocaleString("en-US")}`};
});

export const journeyLinks: JourneyLinkData[] = validWorkbookJourneyRows.map((row)=>({
  id:`row-${row.row}-${slug(row.source)}-${slug(row.target)}`,
  source:nodeId(row.source),
  target:nodeId(row.target),
  value:row.value,
  label:formatRate(row.rate),
}));

export const journeyFlowConflicts = journeyNodes
  .map((node)=>({node:node.label,incoming:incoming(node.label),outgoing:outgoing(node.label)}))
  .filter((flow)=>flow.incoming>0&&flow.outgoing>0&&flow.incoming!==flow.outgoing);
