"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { productPairs, products, shoppingComposition } from "@/data/fixtures/interaction.fixture";
import type { ProductType } from "@/data/contracts/dashboard";

type CompositionView = "orders" | "revenue";
const compositionOptions = [{value:"orders",label:"Tỷ lệ đơn"},{value:"revenue",label:"Doanh thu"}] as const;
const productOptions = [{value:"retail",label:"Bán lẻ"},{value:"combo",label:"Combo"}] as const;
const colors = ["#180bd4","#4a99d2","#86eae9"];
const compact = new Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:2});

export function ShoppingTrendsSection() {
  const [compositionView,setCompositionView] = useState<CompositionView>("orders");
  const [productType,setProductType] = useState<ProductType>("retail");
  const [pairsOpen,setPairsOpen] = useState(false);
  const selectedProducts = useMemo(() => products.filter((item) => item.productType === productType),[productType]);
  const shares = shoppingComposition.map((item) => compositionView === "orders" ? item.orderShare : item.revenueShare);
  const stops = shares.reduce<number[]>((acc,value,index) => [...acc,(acc[index-1] ?? 0)+value*360],[]);
  const gradient = `conic-gradient(${colors[0]} 0deg ${stops[0]}deg,${colors[1]} ${stops[0]}deg ${stops[1]}deg,${colors[2]} ${stops[1]}deg 360deg)`;
  const insight = compositionView === "orders" ? "Bán lẻ chiếm tỷ trọng đơn hàng lớn nhất." : "Bán lẻ dẫn đầu doanh thu; Combo đóng góp cao hơn tỷ trọng đơn.";
  return (
    <section>
      <SectionHeading title="04. Xu hướng mua sắm" subtitle="Cơ cấu giỏ hàng, danh mục bán chạy và cơ hội Combo." />
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex h-[337px] flex-col p-4">
          <div className="flex items-start justify-between gap-3"><div><h3 className="text-[15px] font-semibold">Cơ cấu mua sắm</h3><p className="mt-1 text-[12px] text-[#707070]">Combo, bán lẻ và hỗn hợp</p></div><SegmentedControl value={compositionView} options={compositionOptions} onChange={setCompositionView} ariaLabel="Chỉ số cơ cấu mua sắm" /></div>
          <AnimatePresence mode="wait" initial={false}><motion.div key={compositionView} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.18}} className="mt-6 grid flex-1 grid-cols-[118px_1fr] gap-4"><div className="relative mt-2 h-[110px] w-[110px] rounded-full" style={{background:gradient}}><div className="absolute inset-[28px] flex items-center justify-center rounded-full bg-white text-[13px] font-bold">100%</div></div><div className="flex flex-col gap-3">{shoppingComposition.map((item,index) => { const value = compositionView === "orders" ? item.orderShare : item.revenueShare; const raw = compositionView === "orders" ? item.orderCount.toString() : compact.format(item.revenue); return <div key={item.type} className="flex items-center justify-between text-[12px]"><span><i className="mr-2 inline-block h-2 w-2 rounded-full" style={{background:colors[index]}} />{item.type}</span><strong>{raw} · {(value*100).toFixed(1)}%</strong></div>})}<div className="mt-1 rounded-lg border-l-2 border-[#3b82f6] bg-[#eef4fd] p-3 text-[11px] leading-relaxed">{insight}</div></div></motion.div></AnimatePresence>
        </Card>
        <Card className="flex h-[337px] flex-col p-4">
          <div className="flex items-start justify-between gap-3"><div><h3 className="text-[15px] font-semibold">Danh mục sản phẩm bán chạy</h3><p className="mt-1 text-[12px] text-[#707070]">Top sản phẩm theo loại mua</p></div><SegmentedControl value={productType} options={productOptions} onChange={setProductType} ariaLabel="Loại sản phẩm" /></div>
          <AnimatePresence mode="wait" initial={false}><motion.ol key={productType} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:.18}} className="mt-4">{selectedProducts.map((item) => <li key={item.itemId} className="grid h-[43px] grid-cols-[28px_1fr_35px] items-center border-b border-[#e5e5e5] text-[11px] last:border-0"><span className="text-[#777]">{String(item.rank).padStart(2,"0")}</span><span className="truncate pr-2">{item.itemName}</span><strong className="text-right text-[#3b82f6]">{item.totalQuantitySold}</strong></li>)}</motion.ol></AnimatePresence>
        </Card>
      </div>
      <Card className="mt-3.5 overflow-hidden">
        <div className="flex h-[67px] items-center justify-between px-4"><div><h3 className="text-[14px] font-semibold">◆ &nbsp;Đề xuất Combo</h3><p className="mt-1 text-[11px] text-[#777]">Dựa trên các sản phẩm thường được mua cùng</p></div><Disclosure expanded={pairsOpen} onToggle={() => setPairsOpen(!pairsOpen)} collapsedLabel="5 đề xuất" expandedLabel="5 đề xuất"><span /></Disclosure></div>
        <AnimatePresence initial={false}>{pairsOpen && <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.22}} className="overflow-hidden"><ol className="border-t border-[#e5e5e5] px-4 py-2">{productPairs.map((pair) => <li key={pair.rank} className="grid grid-cols-[24px_1fr_44px] items-center gap-2 border-b border-[#eee] py-2.5 text-[11px] last:border-0"><span className="text-[#777]">{String(pair.rank).padStart(2,"0")}</span><span><strong>{pair.item1.name}</strong><span className="mx-2 text-[#3b82f6]">+</span><strong>{pair.item2.name}</strong></span><span className="text-right text-[#3b82f6]">{pair.ordersBoughtTogether} đơn</span></li>)}</ol></motion.div>}</AnimatePresence>
      </Card>
    </section>
  );
}
