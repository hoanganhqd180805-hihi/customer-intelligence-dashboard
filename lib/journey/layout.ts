import type { JourneyLinkData, JourneyNodeData } from "@/data/contracts/dashboard";

export interface LayoutNode extends JourneyNodeData { x:number; h:number; y0:number; y1:number; cy:number }
export interface LayoutLink extends JourneyLinkData { sy0:number; sy1:number; ty0:number; ty1:number; path:string; centerline:string; labelX:number; labelY:number; thickness:number }

export function layoutJourney(nodes: JourneyNodeData[], links: JourneyLinkData[], stages: readonly string[]) {
  const W=1820,H=440,margin={top:27,bottom:7,left:150,right:145};
  const chartW=W-margin.left-margin.right,chartH=H-margin.top-margin.bottom;
  const maxValue=Math.max(...nodes.map((node)=>node.value));
  const gapByStage:Record<string,number>={"EXTERNAL SOURCE":18,"MARKETPLACE":28,"CONTENT / ENTRY DRIVER":14,"ORDER RESULT":46,"POST-PURCHASE":46};
  const scaleByStage=stages.map((stage)=>{const column=nodes.filter((node)=>node.stage===stage);const gaps=(gapByStage[stage]??24)*Math.max(0,column.length-1);const total=column.reduce((sum,node)=>sum+node.value,0);return total>0?Math.max(0,(chartH-gaps)/total):Infinity;});
  const scale=Math.min(360/maxValue,...scaleByStage);
  const minRender=.45;
  const centerOffset:Record<string,number>={"PRODUCT VIEW":28,"ADD TO CART":-44,"ORDER":28};
  const horizontalOffset:Record<string,number>={"ADD TO CART":32};
  const positioned: LayoutNode[]=[];
  stages.forEach((stage,index)=>{
    const column=nodes.filter((node)=>node.stage===stage);
    const heights=column.map((node)=>Math.max(minRender,node.value*scale));
    const gap=gapByStage[stage]??24;
    const total=heights.reduce((sum,h)=>sum+h,0)+gap*Math.max(0,column.length-1);
    let y=margin.top+(chartH-total)/2+(centerOffset[stage]??0);
    column.forEach((node,nodeIndex)=>{const h=heights[nodeIndex],cy=y+h/2;positioned.push({...node,x:margin.left+(chartW*index)/(stages.length-1)+(horizontalOffset[stage]??0),h,y0:y,y1:y+h,cy});y+=h+gap;});
  });
  const nodeMap=new Map(positioned.map((node)=>[node.id,node]));
  const allocations=new Map<string,{source?:[number,number];target?:[number,number]}>();
  for(const node of positioned) for(const mode of ["source","target"] as const){const related=links.filter((link)=>mode==="source"?link.source===node.id:link.target===node.id);const total=related.reduce((sum,link)=>sum+link.value*scale,0);let acc=node.y0+(node.h-total)/2;for(const link of related){const thickness=Math.max(minRender,link.value*scale),pair:[number,number]=[acc,acc+thickness];allocations.set(link.id,{...allocations.get(link.id),[mode]:pair});acc+=thickness;}}
  const laidLinks:LayoutLink[]=links.map((link)=>{const source=nodeMap.get(link.source)!,target=nodeMap.get(link.target)!,allocation=allocations.get(link.id)!,sy0=allocation.source![0],sy1=allocation.source![1],ty0=allocation.target![0],ty1=allocation.target![1],x0=source.x+3,x1=target.x-3,xi=(x0+x1)/2,scy=(sy0+sy1)/2,tcy=(ty0+ty1)/2;const conversionKey=`${link.source}->${link.target}`;const labelOffset=conversionKey==="product-view->add-to-cart"?-16:conversionKey==="add-to-cart->order"?-12:conversionKey==="product-view->order"?18:-8;return {...link,sy0,sy1,ty0,ty1,thickness:Math.max(minRender,link.value*scale),path:`M${x0},${sy0} C${xi},${sy0} ${xi},${ty0} ${x1},${ty0} L${x1},${ty1} C${xi},${ty1} ${xi},${sy1} ${x0},${sy1} Z`,centerline:`M${x0},${scy} C${xi},${scy} ${xi},${tcy} ${x1},${tcy}`,labelX:(x0+x1)/2,labelY:(scy+tcy)/2+labelOffset};});
  return { width:W,height:H,nodes:positioned,links:laidLinks,scale };
}
