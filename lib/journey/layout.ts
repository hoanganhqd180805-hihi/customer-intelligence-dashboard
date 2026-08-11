import type { JourneyLinkData, JourneyNodeData } from "@/data/contracts/dashboard";

export interface LayoutNode extends JourneyNodeData { x:number; h:number; y0:number; y1:number; cy:number }
export interface LayoutLink extends JourneyLinkData { sy0:number; sy1:number; ty0:number; ty1:number; path:string; centerline:string; labelX:number; labelY:number; thickness:number }

export function layoutJourney(nodes: JourneyNodeData[], links: JourneyLinkData[], stages: readonly string[]) {
  const W=1820,H=540,margin={top:34,bottom:8,left:150,right:145};
  const chartW=W-margin.left-margin.right,chartH=H-margin.top-margin.bottom;
  const maxValue=Math.max(...nodes.map((node)=>node.value));
  const scale=470/maxValue;
  const minRender=.45;
  const positioned: LayoutNode[]=[];
  stages.forEach((stage,index)=>{
    const column=nodes.filter((node)=>node.stage===stage);
    const heights=column.map((node)=>Math.max(minRender,node.value*scale));
    const gap=stage==="POST-PURCHASE"?62:78;
    const total=heights.reduce((sum,h)=>sum+h,0)+gap*Math.max(0,column.length-1);
    let y=margin.top+(chartH-total)/2;
    column.forEach((node,nodeIndex)=>{const h=heights[nodeIndex],cy=y+h/2;positioned.push({...node,x:margin.left+(chartW*index)/(stages.length-1),h,y0:y,y1:y+h,cy});y+=h+gap;});
  });
  const nodeMap=new Map(positioned.map((node)=>[node.id,node]));
  const allocations=new Map<string,{source?:[number,number];target?:[number,number]}>();
  for(const node of positioned) for(const mode of ["source","target"] as const){const related=links.filter((link)=>mode==="source"?link.source===node.id:link.target===node.id);const total=related.reduce((sum,link)=>sum+link.value*scale,0);let acc=node.y0+(node.h-total)/2;for(const link of related){const thickness=Math.max(minRender,link.value*scale),pair:[number,number]=[acc,acc+thickness];allocations.set(link.id,{...allocations.get(link.id),[mode]:pair});acc+=thickness;}}
  const laidLinks:LayoutLink[]=links.map((link)=>{const source=nodeMap.get(link.source)!,target=nodeMap.get(link.target)!,allocation=allocations.get(link.id)!,sy0=allocation.source![0],sy1=allocation.source![1],ty0=allocation.target![0],ty1=allocation.target![1],x0=source.x+3,x1=target.x-3,xi=(x0+x1)/2,scy=(sy0+sy1)/2,tcy=(ty0+ty1)/2;return {...link,sy0,sy1,ty0,ty1,thickness:Math.max(minRender,link.value*scale),path:`M${x0},${sy0} C${xi},${sy0} ${xi},${ty0} ${x1},${ty0} L${x1},${ty1} C${xi},${ty1} ${xi},${sy1} ${x0},${sy1} Z`,centerline:`M${x0},${scy} C${xi},${scy} ${xi},${tcy} ${x1},${tcy}`,labelX:(x0+x1)/2,labelY:(scy+tcy)/2-8};});
  return { width:W,height:H,nodes:positioned,links:laidLinks,scale };
}
