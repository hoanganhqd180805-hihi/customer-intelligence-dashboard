"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { PurchaseTimeDataset } from "@/data/contracts/dashboard";
import { getPurchaseTimeData } from "@/data/services/purchase-time.service";
import { useSectionData } from "@/lib/hooks/use-section-data";
import { useDashboardDateRange } from "./DashboardDateRangeContext";
import { adaptCancellationWorkbookData } from "@/data/adapters/cancellation.adapter";
import { rawCancellationWorkbookFixture } from "@/data/fixtures/section02-workbook.fixture";
import type { CancellationAnalysisDataset } from "@/data/contracts/dashboard";

type PurchaseView = "slots" | "days";
type CancellationView = "orders" | "revenue";
const purchaseOptions = [{ value:"slots", label:"Khung giờ" },{ value:"days", label:"Theo ngày" }] as const;
const cancellationOptions=[{value:"orders",label:"Theo đơn"},{value:"revenue",label:"Doanh thu"}] as const;
const cancellationData=adaptCancellationWorkbookData(rawCancellationWorkbookFixture);
const compactNumber=new Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:2});
const fullNumber=new Intl.NumberFormat("vi-VN");

const isPurchaseTimeEmpty = (data: PurchaseTimeDataset) => data.timeSlotTotals.length === 0 && data.weekdayTotals.length === 0;

function PurchaseVisualization({ view, data }: { view: PurchaseView; data: PurchaseTimeDataset }) {
  const maxSlot = Math.max(1, ...data.timeSlotTotals.map((item) => item.totalOrders));
  const maxDay = Math.max(1, ...data.weekdayTotals.map((item) => item.totalOrders));
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={view} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }} transition={{ duration:0.18 }} className="h-full">
        {view === "slots" ? (
          <div className="grid h-full grid-cols-[54px_repeat(6,1fr)] grid-rows-[22px_repeat(7,1fr)] gap-1.5 pt-2">
            <span />{data.timeSlots.map((slot) => <span key={slot} className="self-end text-center text-[9px] text-[#777]">{slot}</span>)}
            {data.weekdays.flatMap((day) => {
              const cells = data.timeSlots.map((slot) => data.timeSlotTotals.find((item) => item.weekday === day && item.slot === slot) ?? null);
              return [<span key={`${day}-label`} className="self-center text-[9px] text-[#777]">{day}</span>, ...cells.map((cell, index) => cell ? <div key={`${day}-${cell.slot}`} title={`${day}, ${cell.slot}: ${cell.totalOrders} đơn`} className="rounded-md" style={{ backgroundColor:`color-mix(in srgb, #180bd4 ${20 + (cell.totalOrders/maxSlot)*80}%, white)` }} /> : <div key={`${day}-${data.timeSlots[index]}`} title={`${day}, ${data.timeSlots[index]}: dữ liệu chưa được trả về`} className="rounded-md border border-dashed border-[#d8dce5] bg-[#f7f7f7]" />)];
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center gap-3 px-2">
            {data.weekdayTotals.map((item) => <div key={item.weekday} className="grid grid-cols-[58px_1fr_26px] items-center gap-2"><span className="text-[10px] text-[#666]">{item.weekday}</span><div className="h-3 overflow-hidden rounded-full bg-[#eef4fd]"><motion.div initial={{ width:0 }} animate={{ width:`${(item.totalOrders/maxDay)*100}%` }} transition={{ duration:0.3 }} className="h-full rounded-full bg-[#3b82f6]" /></div><strong className="text-right text-[10px]">{item.totalOrders}</strong></div>)}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function CancellationVisualization({view,data}:{view:CancellationView;data:CancellationAnalysisDataset}){
  const rows=useMemo(()=>[...data.reasons].sort((a,b)=>view==="orders"?b.cancelledOrders-a.cancelledOrders:b.lostRevenue-a.lostRevenue),[data,view]);
  const share=(row:CancellationAnalysisDataset["reasons"][number])=>view==="orders"?row.orderShare:row.lostRevenueShare;
  const maxShare=Math.max(...rows.map(share));
  return <AnimatePresence mode="wait" initial={false}><motion.div key={view} initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}} transition={{duration:.18}} className="mt-2 flex min-h-0 flex-1 flex-col justify-center gap-2">{rows.map((row)=><div key={row.reason} title={`${row.reason} · ${view==="orders"?`${row.cancelledOrders} đơn huỷ`:`${fullNumber.format(row.lostRevenue)} doanh thu thất thoát`}`} className="grid grid-cols-[minmax(120px,1.3fr)_2fr_42px] items-center gap-2"><span className="truncate text-[9px]">{row.reason}</span><div className="h-2 overflow-hidden rounded-full bg-[#eef4fd]"><motion.div layout className="h-full rounded-full bg-[#3b82f6]" animate={{width:`${share(row)/maxShare*100}%`}} transition={{duration:.22}}/></div><strong className="text-right text-[9px]">{(share(row)*100).toFixed(1)}%</strong></div>)}</motion.div></AnimatePresence>;
}

export function PurchaseCancellationSection() {
  const [view,setView] = useState<PurchaseView>("slots");
  const [cancellationView,setCancellationView]=useState<CancellationView>("orders");
  const { startDate, endDate } = useDashboardDateRange();
  const state = useSectionData(getPurchaseTimeData, startDate, endDate, isPurchaseTimeEmpty);
  const stateLabel = state.status === "loading" ? "Đang tải dữ liệu" : state.status === "empty" ? "Không có dữ liệu trong kỳ" : state.status === "unavailable" ? "Dữ liệu chưa khả dụng" : state.status === "error" ? `Không thể tải dữ liệu: ${state.message}` : null;
  return (
    <div className="grid grid-cols-1 gap-8 min-[1050px]:grid-cols-2 min-[1050px]:gap-4">
      <section className="flex min-w-0 flex-col">
        <SectionHeading title="02. Thời điểm mua hàng" subtitle="Khách hàng thường phát sinh đơn vào thời điểm nào?" />
        <Card className="flex min-h-[368px] w-full flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3"><div><h3 className="text-[15px] font-semibold">Thời điểm mua hàng</h3><p className="mt-1 text-[12px] text-[#707070]">Khách thường mua khi nào?</p></div><SegmentedControl value={view} options={purchaseOptions} onChange={setView} ariaLabel="Chế độ phân tích thời điểm mua hàng" /></div>
          <div className="mt-4 h-[250px] min-h-0">{state.status === "success" ? <PurchaseVisualization view={view} data={state.data} /> : <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-[#fbfbfb] px-4 text-center text-[12px] text-[#aaa]">{stateLabel}</div>}</div>
        </Card>
      </section>
      <section className="flex min-w-0 flex-col">
        <SectionHeading title="03. Phân tích lý do huỷ đơn" subtitle="Nguyên nhân huỷ đơn và giá trị doanh thu thất thoát." />
        <Card className="flex min-h-[368px] w-full flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3"><div><h3 className="text-[15px] font-semibold">Phân tích lý do huỷ đơn</h3><p className="mt-1 text-[12px] text-[#707070]">Tỷ trọng theo từng nguyên nhân</p></div><SegmentedControl value={cancellationView} options={cancellationOptions} onChange={setCancellationView} ariaLabel="Chỉ số phân tích lý do huỷ đơn"/></div>
          <CancellationVisualization view={cancellationView} data={cancellationData}/>
          <div className="mt-4 grid grid-cols-2 gap-2.5"><div className="rounded-xl border border-[#dedede] p-2"><span className="text-[9px] text-[#777]">{cancellationView==="orders"?"Tổng đơn huỷ":"Thiệt hại kỳ này"}</span><strong className="mt-1 block text-[16px] text-[#180bd4]">{cancellationView==="orders"?fullNumber.format(cancellationData.totalCancelledOrders):compactNumber.format(cancellationData.totalLostRevenue)}</strong></div><div className="rounded-xl border border-[#dedede] p-2"><span className="text-[9px] text-[#777]">So với kỳ trước</span><strong className="mt-1 block text-[16px] text-[#3b82f6]">—</strong></div></div>
        </Card>
      </section>
    </div>
  );
}
