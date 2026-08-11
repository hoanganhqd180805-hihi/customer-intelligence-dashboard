"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyCardContent } from "@/components/ui/EmptyCardContent";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { CustomerTypeDailyPoint, CustomerTypesDataset } from "@/data/contracts/dashboard";
import { getCustomerTypeData } from "@/data/services/customer-type.service";
import { useSectionData } from "@/lib/hooks/use-section-data";
import { useDashboardDateRange } from "./DashboardDateRangeContext";

const isCustomerTypeEmpty = (data: CustomerTypesDataset) => data.daily.length === 0 && data.revenueContribution.length === 0;

function SectionState({ status, message }: { status: "loading" | "empty" | "unavailable" | "error"; message?: string }) {
  const text = status === "loading" ? "Đang tải dữ liệu" : status === "empty" ? "Không có dữ liệu trong kỳ" : status === "unavailable" ? "Dữ liệu chưa khả dụng" : "Không thể tải dữ liệu";
  return <EmptyCardContent label={message ? `${text}: ${message}` : text} />;
}

function DailyTrend({ points }: { points: CustomerTypeDailyPoint[] }) {
  const chartRef=useRef<HTMLDivElement>(null);
  const [width,setWidth]=useState(430);
  const height=300,left=30,right=12,top=18,bottom=38;
  useEffect(()=>{
    const element=chartRef.current;
    if(!element)return;
    const observer=new ResizeObserver(([entry])=>setWidth(Math.max(1,Math.round(entry.contentRect.width))));
    observer.observe(element);
    return()=>observer.disconnect();
  },[]);
  const observedMax=Math.max(1,...points.flatMap((point)=>[point.newCustomers,point.returningCustomers]));
  const domainMax=Math.ceil((observedMax*1.1)/10)*10;
  const x=(index:number)=>left+(index*(width-left-right))/Math.max(1,points.length-1);
  const y=(value:number)=>top+(1-value/domainMax)*(height-top-bottom);
  const path=(key:"newCustomers"|"returningCustomers")=>points.map((point,index)=>`${index?"L":"M"}${x(index)},${y(point[key])}`).join(" ");
  const ticks=Array.from({length:domainMax/10+1},(_,index)=>index*10);
  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-2 flex gap-4 text-[11px] text-[#707070]"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#180bd4]"/>Khách hàng mới</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#16a085]"/>Khách hàng cũ</span></div>
      <div ref={chartRef} className="h-[300px] w-full min-w-0">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="block h-[300px] w-full" aria-label="Xu hướng khách hàng theo ngày">
        {ticks.map((tick)=><g key={tick}><line x1={left} y1={y(tick)} x2={width-right} y2={y(tick)} stroke="#e8ebf1" strokeWidth="1"/><text x={left-6} y={y(tick)+3} textAnchor="end" fontSize="8.5" fill="#929292">{tick}</text></g>)}
        <path d={path("newCustomers")} fill="none" stroke="#180bd4" strokeWidth="2.25"/>
        <path d={path("returningCustomers")} fill="none" stroke="#16a085" strokeWidth="2.25"/>
        {points.flatMap((point,index)=>{
          const pointX=x(index),newY=y(point.newCustomers),returningY=y(point.returningCustomers),sameValue=point.newCustomers===point.returningCustomers;
          return [
            <circle key={`n-${point.date}`} cx={pointX} cy={newY} r="3" fill="#180bd4"><title>{`${point.date}: ${point.newCustomers} khách hàng mới`}</title></circle>,
            <text key={`nv-${point.date}`} x={pointX} y={newY-7} textAnchor="middle" fontSize="8" fontWeight="600" fill="#180bd4">{point.newCustomers}</text>,
            <circle key={`r-${point.date}`} cx={pointX} cy={returningY} r="3.5" fill="#16a085"><title>{`${point.date}: ${point.returningCustomers} khách hàng cũ`}</title></circle>,
            <text key={`rv-${point.date}`} x={pointX} y={returningY-(sameValue?17:7)} textAnchor="middle" fontSize="8" fontWeight="600" fill="#12806b">{point.returningCustomers}</text>,
            ...(index%4===0||index===points.length-1?[<text key={`d-${point.date}`} x={pointX} y={height-9} textAnchor="middle" fontSize="9" fill="#858585">{point.date.slice(5).replace("-","/")}</text>]:[]),
          ];
        })}
      </svg>
      </div>
    </div>
  );
}

function RevenueContribution({ data }: { data: CustomerTypesDataset["revenueContribution"] }) {
  const colors = { new: "#180bd4", returning: "#16a085" } as const;
  const gradient = data.map((item, index) => { const start = data.slice(0, index).reduce((sum, entry) => sum + entry.revenueShare * 360, 0); const end = start + item.revenueShare * 360; return `${colors[item.customerType]} ${start}deg ${end}deg`; }).join(",");
  return <div className="@container flex h-full w-full items-center justify-center"><div className="flex w-full flex-col items-center justify-center gap-4 @[340px]:flex-row @[340px]:gap-3"><div aria-label="Cơ cấu doanh thu theo loại khách hàng" role="img" className="relative aspect-square w-[clamp(190px,18vw,230px)] max-w-[230px] shrink-0 rounded-full" style={{ background:`conic-gradient(${gradient})` }}><div className="absolute inset-[24%] rounded-full bg-white"/></div><div className="w-full min-w-[112px] max-w-[160px] space-y-2.5">{data.map((item) => <div key={item.customerType} className="grid grid-cols-[8px_1fr_auto] items-center gap-2 whitespace-nowrap text-[10px]"><i className="h-2 w-2 rounded-full" style={{background:colors[item.customerType]}}/><span>{item.customerType === "new" ? "Khách mới" : "Khách cũ"}</span><strong className="text-right">{item.revenue == null ? "" : `${new Intl.NumberFormat("vi-VN", { notation:"compact", maximumFractionDigits:1 }).format(item.revenue)} · `}{(item.revenueShare*100).toFixed(2)}%</strong></div>)}</div></div></div>;
}

function CustomerTypesContent({ startDate, endDate }: { startDate: string; endDate: string }) {
  const state = useSectionData(getCustomerTypeData, startDate, endDate, isCustomerTypeEmpty);
  const fallback = state.status === "success" ? null : <SectionState status={state.status} message={state.status === "error" ? state.message : undefined}/>;
  return <Card className="grid h-[430px] grid-cols-[7fr_3fr] overflow-hidden" aria-busy={state.status === "loading"}><div className="flex min-w-0 flex-col p-5"><h3 className="text-[15px] font-semibold">Xu hướng khách hàng theo ngày</h3><p className="mt-1 text-[12px] text-[#707070]">Số lượng khách mới và khách cũ quay lại</p><div className="mt-4 min-h-0 flex-1">{state.status === "success" ? <DailyTrend points={state.data.daily}/> : fallback}</div></div><div className="flex min-w-0 flex-col border-l border-[#dedede] p-5"><h3 className="text-[15px] font-semibold">Cơ cấu doanh thu</h3><p className="mt-1 text-[12px] text-[#707070]">Theo loại khách hàng</p><div className="mt-4 min-h-0 flex-1">{state.status === "success" ? <RevenueContribution data={state.data.revenueContribution}/> : fallback}</div></div></Card>;
}

export function CustomerTypesSection() {
  const { startDate, endDate } = useDashboardDateRange();
  return <section><SectionHeading title="01. Thống kê theo từng loại khách hàng" subtitle="Khách mới, khách quay lại và tỷ trọng doanh thu."/><CustomerTypesContent key={`${startDate}:${endDate}`} startDate={startDate} endDate={endDate}/></section>;
}
