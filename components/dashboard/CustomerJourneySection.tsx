"use client";

import { useEffect, useMemo, useState } from "react";
import type { JourneyNodeData } from "@/data/contracts/dashboard";
import { journeyLinks, journeyNodes, journeyStages } from "@/data/fixtures/journey.fixture";
import { getActiveJourneyGraph } from "@/lib/journey/graph";
import { layoutJourney } from "@/lib/journey/layout";

interface TooltipState { node: JourneyNodeData; x:number; y:number }
const numberFormat=new Intl.NumberFormat("en-US");
const sourceNodeMap=new Map(journeyNodes.map((node)=>[node.id,node]));
const sourceLinkMap=new Map(journeyLinks.map((link)=>[link.id,link]));
const linkLabel=(id:string)=>sourceLinkMap.get(id)!.label;
const dropOffLabel=(id:string)=>`↓${(100-Number.parseFloat(linkLabel(id))).toFixed(1)}%`;
const conversionRates=[[linkLabel("ads-productview"),"Ads → Product View"],[linkLabel("productview-order"),"Product View → Order"],[linkLabel("order-complete"),"Order → Complete"],[linkLabel("complete-goodreview"),"Complete → Good Review"]];
const dropoffs=[[dropOffLabel("ads-productview"),"Ads → Product View"],[dropOffLabel("productview-order"),"Product View → Order"],[dropOffLabel("order-complete"),"Order → Complete"]];
const orderValue=sourceNodeMap.get("order")!.value;
const completeValue=sourceNodeMap.get("complete")!.value;
const goodReviewValue=sourceNodeMap.get("goodreview")!.value;
const buyAgainValue=sourceNodeMap.get("buyagain")!.value;

function clampTooltip(clientX:number,clientY:number){const width=230,height=82,pad=14;return {x:Math.max(pad,Math.min(clientX+14,window.innerWidth-width-pad)),y:Math.max(pad,Math.min(clientY+14,window.innerHeight-height-pad))};}

export function CustomerJourneySection() {
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [hoveredId,setHoveredId]=useState<string|null>(null);
  const [tooltip,setTooltip]=useState<TooltipState|null>(null);
  const [reducedMotion,setReducedMotion]=useState(false);
  const layout=useMemo(()=>layoutJourney(journeyNodes,journeyLinks,journeyStages),[]);
  const nodeMap=useMemo(()=>new Map(layout.nodes.map((node)=>[node.id,node])),[layout]);
  const focusId=selectedId??hoveredId;
  const active=useMemo(()=>focusId?getActiveJourneyGraph(focusId,journeyNodes,journeyLinks):null,[focusId]);
  useEffect(()=>{const media=window.matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReducedMotion(media.matches);update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update);},[]);
  const selectNode=(id:string)=>setSelectedId((current)=>current===id?null:id);
  const showTooltip=(node:JourneyNodeData,clientX:number,clientY:number)=>setTooltip({node,...clampTooltip(clientX,clientY)});
  return (
    <section className="rounded-[24px] border border-[#1c2350] bg-[radial-gradient(1200px_500px_at_15%_-10%,rgba(74,153,210,.18),transparent_60%),radial-gradient(1000px_480px_at_90%_110%,rgba(134,234,233,.12),transparent_60%),linear-gradient(180deg,#0a0f2b,#050714)] p-5 text-[#eef1fb] shadow-[0_22px_60px_rgba(9,14,42,.18)]">
      <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-[.14em] text-[#86eae9]"><span className="rounded-full bg-[#86eae9] px-2 py-1 text-[11px] text-[#04231f]">05</span>CUSTOMER JOURNEY</div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 lg:grid-cols-4">{conversionRates.map(([value,label])=><div key={label} className="flex min-h-[52px] flex-col justify-center rounded-[12px] border border-white/[.08] bg-white/[.04] px-3 py-1.5"><strong className="text-[22px] leading-none text-[#86eae9]">{value}</strong><p className="mt-1 text-[11px] text-[#9aa3c9]">{label}</p></div>)}</div>
      <div className="relative mt-1.5 overflow-hidden rounded-[18px]">
        {selectedId&&<div className="absolute right-3 top-[9px] z-10 flex items-center gap-2 rounded-[10px] border border-[#86eae9]/25 bg-[#070a1b]/90 px-[9px] py-[7px] text-[11px] text-[#c9d4f5] backdrop-blur"><span>Showing the full journey through: {nodeMap.get(selectedId)?.label}</span><button type="button" onClick={()=>setSelectedId(null)} className="font-semibold text-[#86eae9] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#86eae9]">Reset</button></div>}
        <svg viewBox={`0 0 ${layout.width} ${layout.height}`} preserveAspectRatio="xMidYMid meet" aria-label="Customer journey chart" className="block w-full touch-manipulation" onClick={()=>setSelectedId(null)}>
          <defs><filter id="journeyGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="journeySoftGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>{layout.links.map((link)=>{const source=nodeMap.get(link.source)!,target=nodeMap.get(link.target)!;return <linearGradient key={link.id} id={`journey-gradient-${link.id}`}><stop stopColor={source.color} stopOpacity=".62"/><stop offset="100%" stopColor={target.color} stopOpacity=".62"/></linearGradient>})}</defs>
          {Array.from({length:58},(_,index)=><circle key={index} cx={(index*347)%layout.width} cy={(index*173)%layout.height} r={.6+(index%3)*.35} fill="#fff" opacity={.05+(index%5)*.035}/>)}
          {journeyStages.map((stage,index)=>{const x=150+((1820-150-145)*index)/(journeyStages.length-1);return <g key={stage}><text x={x} y="18" textAnchor="middle" fontSize="11.5" fontWeight="700" letterSpacing="1.5" fill="#7d8aa8">{stage}</text><line x1={x-34} y1="27" x2={x+34} y2="27" stroke="#232b52"/></g>})}
          {layout.links.map((link,index)=>{const emphasized=!active||active.linkIds.has(link.id);return <g key={link.id} opacity={emphasized ? .92 : .035} style={{transition:"opacity .25s ease"}}><path d={link.path} fill={`url(#journey-gradient-${link.id})`} style={{filter:active&&emphasized?"url(#journeySoftGlow)":"none"}}/>{index>0&&<g opacity={emphasized?1:.09}><rect x={link.labelX-24} y={link.labelY-11} width="48" height="18" rx="9" fill="#080c20" stroke="#27305a"/><text x={link.labelX} y={link.labelY+2} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#c8d2f1">{link.label}</text></g>}{!reducedMotion&&Array.from({length:Math.max(2,Math.min(6,Math.round(Math.log10(link.value+1)*1.35)))},(_,particle)=><circle key={particle} r={index===0?1.9:2.15} fill={nodeMap.get(link.source)!.color} opacity={emphasized?1:0} style={{filter:`drop-shadow(0 0 3px ${nodeMap.get(link.source)!.color})`}}><animateMotion dur={`${3+(particle%3)}s`} begin={`${-(particle*.7)}s`} repeatCount="indefinite" path={link.centerline}/></circle>)}</g>})}
          {layout.nodes.map((node)=>{const emphasized=!active||active.nodeIds.has(node.id),selected=selectedId===node.id;return <g key={node.id} role="button" tabIndex={0} aria-label={`${node.label} ${numberFormat.format(node.value)}`} aria-pressed={selected} onClick={(event)=>{event.stopPropagation();selectNode(node.id)}} onKeyDown={(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();selectNode(node.id)}}} onMouseEnter={(event)=>{if(!selectedId)setHoveredId(node.id);showTooltip(node,event.clientX,event.clientY)}} onMouseMove={(event)=>showTooltip(node,event.clientX,event.clientY)} onMouseLeave={()=>{setTooltip(null);if(!selectedId)setHoveredId(null)}} onFocus={()=>{if(!selectedId)setHoveredId(node.id)}} onBlur={()=>{if(!selectedId)setHoveredId(null)}} opacity={emphasized?1:.14} className="cursor-pointer focus-visible:outline-none" style={{transition:"opacity .24s ease"}}><rect x={node.x-31} y={node.cy-23} width="118" height="46" rx="10" fill="transparent"/><rect x={node.x-3} y={node.y0} width="6" height={node.h} rx="3" fill={node.color} style={{filter:`drop-shadow(0 0 ${emphasized?10:6}px ${node.color})`}}/><circle cx={node.x-22} cy={node.cy} r="11" fill="#0a1024" stroke={node.color} strokeWidth={selected?3.2:2} filter="url(#journeyGlow)"/><text x={node.x-22} y={node.cy+4} textAnchor="middle" fontSize="11" fontWeight="700" fill={node.color}>{node.label[0]}</text><text x={node.x+12} y={node.cy-3} fontSize="12.5" fontWeight="700" fill="#eef1f8">{node.label}</text><text x={node.x+12} y={node.cy+13} fontSize="11" fill="#7d8aa8">{numberFormat.format(node.value)}</text></g>})}
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">{dropoffs.map(([value,label],index)=><div key={label} className={`rounded-[12px] border px-3 py-2 text-[12px] text-[#9aa3c9] ${index===0?"border-[#e2504a]/50 bg-[#e2504a]/[.12]":"border-white/[.08] bg-white/[.04]"}`}><b className={`mb-0.5 block text-[15px] ${index===0?"text-[#ff8f89]":"text-white"}`}>{value}</b>{label}</div>)}</div>
      <div className="mt-2.5 rounded-[14px] border border-[#86eae9]/25 bg-[#86eae9]/[.08] p-3 text-[12px] leading-[1.55] text-[#cfe9ff]"><div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1fr_1fr]"><div><p className="mb-0.5 text-[10px] tracking-[.08em] text-[#7d8aa8]">BIGGEST DROP-OFF</p><b className="text-[#86eae9]">Ads → Product View · {dropOffLabel("ads-productview").slice(1)}</b><br/>{numberFormat.format(sourceNodeMap.get("ads")!.value)} ad impressions generated {numberFormat.format(sourceNodeMap.get("productview")!.value)} product views, equivalent to a {linkLabel("ads-productview")} conversion rate.</div><div className="lg:border-l lg:border-white/[.08] lg:pl-3"><p className="mb-0.5 text-[10px] tracking-[.08em] text-[#7d8aa8]">ORDER QUALITY</p><b className="text-[#86eae9]">{numberFormat.format(completeValue)} / {numberFormat.format(orderValue)} completed orders</b><br/>The completion rate reached {linkLabel("order-complete")}, while cancelled orders accounted for {linkLabel("order-cancel")} of total orders.</div><div className="lg:border-l lg:border-white/[.08] lg:pl-3"><p className="mb-0.5 text-[10px] tracking-[.08em] text-[#7d8aa8]">POST-PURCHASE SIGNAL</p><b className="text-[#86eae9]">{numberFormat.format(goodReviewValue)} Good Review · {numberFormat.format(buyAgainValue)} Buy Again</b><br/>Good Reviews represented {linkLabel("complete-goodreview")} and Buy Again represented {linkLabel("complete-buyagain")} of completed orders.</div></div></div>
      {tooltip&&<div role="tooltip" className="pointer-events-none fixed z-[1000] max-w-[230px] rounded-[10px] border border-[#86eae9]/25 bg-[#070a1b]/95 px-[11px] py-[9px] text-[12px] leading-5 text-[#eef1fb] shadow-xl" style={{left:tooltip.x,top:tooltip.y}}><strong className="text-[12.5px] text-white">{tooltip.node.label}</strong><br/><span>{numberFormat.format(tooltip.node.value)}</span><br/><span className="text-[#8e99be]">{tooltip.node.meta}</span></div>}
    </section>
  );
}
