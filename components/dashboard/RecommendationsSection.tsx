"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { recommendations } from "@/data/fixtures/interaction.fixture";
import type { RecommendationData } from "@/data/contracts/dashboard";

function RecommendationCard({ item }: { item: RecommendationData }) {
  const [expanded,setExpanded] = useState(false);
  const accent = item.severity === "high" ? "#e2504a" : "#f28c28";
  return (
    <Card className="flex min-h-[225px] flex-col p-4">
      <div className="flex justify-between gap-3"><div><span className="rounded-full border px-2 py-1 text-[10px]" style={{color:accent,borderColor:`${accent}55`,background:`${accent}0d`}}>{item.category}</span><p className="mt-3 text-[10px] text-[#777]">{item.status}</p></div><span className="text-right text-[10px] uppercase tracking-wider text-[#777]">Mức ưu tiên<br /><strong className="text-[29px] leading-none" style={{color:accent}}>{item.priority}</strong><small className="block" style={{color:accent}}>{item.severity === "high" ? "CAO" : "TRUNG BÌNH"}</small></span></div>
      <h3 className="mt-5 text-[16px] font-semibold leading-snug">{item.title}</h3><p className="mt-2 text-[13px] leading-relaxed text-[#707070]">{item.description}</p>
      <Disclosure expanded={expanded} onToggle={() => setExpanded(!expanded)} collapsedLabel="Hiện cơ sở phân tích" expandedLabel="Ẩn cơ sở phân tích" className="mt-auto border-t border-[#e3e3e3] pt-3">
        <div className="mt-3 rounded-lg bg-[#f6f8fc] p-3 text-[11px]"><dl className="space-y-2">{item.evidence.map((evidence) => <div key={evidence.metric}><dt className="font-semibold text-[#333]">{evidence.metric}: <span className="text-[#180bd4]">{evidence.value}</span></dt><dd className="mt-0.5 text-[#777]">{evidence.relationship}</dd></div>)}</dl><p className="mt-3 border-t border-[#e2e6ee] pt-2 text-[#555]"><strong>Lý do:</strong> {item.reason}</p></div>
      </Disclosure>
    </Card>
  );
}

export function RecommendationsSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9dfe9] bg-white">
      <header className="flex h-[64px] items-center justify-between border-b border-[#d9dfe9] bg-[#f3f7ff] px-4"><div><p className="text-[11px] text-[#3b82f6]">AI Insights <span className="text-[#777]">Customer Intelligence</span></p><h2 className="mt-1 text-[17px] font-semibold">05. Đề xuất tổng hợp</h2></div><div className="text-right"><p className="text-[11px] text-[#777]">Phát hiện</p><strong className="text-[18px] text-[#3b82f6]">4 đề xuất</strong></div></header>
      <div className="grid grid-cols-2 items-stretch gap-4 p-3.5">{recommendations.map((item) => <RecommendationCard key={item.id} item={item} />)}</div>
    </section>
  );
}
