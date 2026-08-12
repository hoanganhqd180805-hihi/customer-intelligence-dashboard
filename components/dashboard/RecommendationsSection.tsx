"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { recommendations } from "@/data/fixtures/interaction.fixture";
import type { RecommendationData } from "@/data/contracts/dashboard";

const accentByLevel={high:"#e2504a",medium:"#d98724",low:"#3b82f6"} as const;
const levelLabel={high:"CAO",medium:"TRUNG BÌNH",low:"THẤP"} as const;

function RecommendationCard({item,expanded,onToggle}:{item:RecommendationData;expanded:boolean;onToggle:()=>void}){
  const accent=accentByLevel[item.severity];
  return <Card className="flex min-h-[270px] flex-col p-3.5"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full border px-2 py-1 text-[10px] font-medium" style={{color:accent,borderColor:`${accent}55`,background:`${accent}0d`}}>{item.category}</span><p className="mt-3 text-[9.5px] font-semibold tracking-[.08em] text-[#8a8f99]">TÍN HIỆU</p></div><div className="text-right text-[9px] uppercase tracking-[.08em] text-[#858a94]">Mức ưu tiên<strong className="mt-0.5 block text-[27px] leading-none" style={{color:accent}}>{item.priority}</strong><small className="mt-0.5 block font-semibold" style={{color:accent}}>{levelLabel[item.severity]}</small></div></div><p className="mt-1 text-[11.5px] leading-[1.45] text-[#6c7480]">{item.signal}</p><p className="mt-2.5 text-[9.5px] font-semibold tracking-[.08em] text-[#8a8f99]">HÀNH ĐỘNG ĐỀ XUẤT</p><h3 className="mt-1 text-[16px] font-semibold leading-snug text-[#182033]">{item.title}</h3><p className="mt-1.5 text-[12px] leading-[1.5] text-[#616a78]">{item.action}</p><Disclosure expanded={expanded} onToggle={onToggle} collapsedLabel="Xem cơ sở phân tích" expandedLabel="Ẩn cơ sở phân tích" className="mt-auto border-t border-[#e3e6eb] pt-2.5"><div className="mt-2.5 rounded-lg bg-[#f6f8fc] p-2.5 text-[10.5px]"><p className="font-semibold tracking-[.06em] text-[#737b89]">CƠ SỞ PHÂN TÍCH</p><div className="mt-2 flex flex-wrap gap-1.5">{item.evidence.map((evidence)=><span key={evidence.metric} className="rounded-md border border-[#e0e5ee] bg-white px-2 py-1 text-[#596273]"><b className="text-[#30394a]">{evidence.metric}</b> · {evidence.value}</span>)}</div><p className="mt-2 leading-relaxed text-[#626b79]"><b className="text-[#3b4555]">Mối quan hệ:</b> {item.relationship}</p><p className="mt-1.5 border-t border-[#e1e5ec] pt-1.5 leading-relaxed text-[#626b79]"><b className="text-[#3b4555]">Lý do đề xuất:</b> {item.rationale}</p></div></Disclosure></Card>;
}

export function RecommendationsSection(){
  const [expandedByRow,setExpandedByRow]=useState<Record<number,string|null>>({});
  return <section className="overflow-hidden rounded-2xl border border-[#d9dfe9] bg-white"><header className="flex h-[60px] items-center justify-between border-b border-[#d9dfe9] bg-[#f3f7ff] px-4"><div><p className="text-[10.5px] text-[#3b82f6]">AI Insights <span className="text-[#777]">Customer Intelligence</span></p><h2 className="mt-1 text-[17px] font-semibold">08. Đề xuất tổng hợp</h2></div><p className="text-[12px] font-semibold text-[#3b82f6]">4 đề xuất ưu tiên</p></header><div className="grid grid-cols-1 items-stretch gap-3 p-3.5 md:grid-cols-2">{recommendations.map((item,index)=>{const row=Math.floor(index/2),expanded=expandedByRow[row]===item.id;return <RecommendationCard key={item.id} item={item} expanded={expanded} onToggle={()=>setExpandedByRow((current)=>({...current,[row]:expanded?null:item.id}))}/>})}</div></section>;
}
