import type { ProductPairRow, ProductPerformanceRow, PurchaseTimeSlotTotal, RecommendationData, ShoppingCompositionMetric, Weekday, WeekdayOrderTotal } from "@/data/contracts/dashboard";
import { rawCustomerTypeWorkbookFixture } from "./customer-type-workbook.fixture";
import { rawOverviewApiFixture } from "./overview-api.fixture";
import { rawCancellationWorkbookFixture } from "./section02-workbook.fixture";

export const weekdays: Weekday[] = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
export const timeSlots = ["00:00 - 05:59", "06:00 - 08:59", "09:00 - 11:59", "12:00 - 14:59", "15:00 - 17:59", "18:00 - 23:59"];
const timeValues = [[22,7,10,7,12,10],[26,14,10,17,11,11],[30,25,6,10,11,5],[22,7,9,13,5,8],[30,15,10,15,4,6],[19,10,6,11,12,7],[24,10,19,8,11,5]];
export const purchaseTimeSlots: PurchaseTimeSlotTotal[] = weekdays.flatMap((weekday, row) => timeSlots.map((slot, col) => ({ weekday, slot, totalOrders: timeValues[row][col] })));
export const weekdayOrders: WeekdayOrderTotal[] = [68,89,87,64,80,65,77].map((totalOrders, index) => ({ weekday: weekdays[index], totalOrders }));

export const shoppingComposition: ShoppingCompositionMetric[] = [
  { type: "Combo", orderCount: 80, orderShare: 0.3238866397, revenue: 11_545_411, revenueShare: 0.3837 },
  { type: "Bán lẻ", orderCount: 137, orderShare: 0.5546558704, revenue: 13_507_069, revenueShare: 0.4489 },
  { type: "Hỗn hợp", orderCount: 30, orderShare: 0.1214574899, revenue: 5_034_040, revenueShare: 0.1673 },
];

export const products: ProductPerformanceRow[] = [
  { rank:1, productType:"retail", itemId:"15584241449", itemName:"Kẹo Mayora Cà Phê Kopiko 560G", totalQuantitySold:15, totalOrders:14, productSales:1_350_000 },
  { rank:2, productType:"retail", itemId:"15484234913", itemName:"Cà Phê Sữa Hòa Tan Mayora Kopiko Macchiato 400G", totalQuantitySold:12, totalOrders:11, productSales:1_128_000 },
  { rank:3, productType:"retail", itemId:"24956187823", itemName:"Bánh Quy Bơ Mayora Danisa 200G", totalQuantitySold:10, totalOrders:7, productSales:940_000 },
  { rank:4, productType:"retail", itemId:"15084234863", itemName:"Kẹo Cà Phê Sữa Mayora Kopiko 140G", totalQuantitySold:8, totalOrders:4, productSales:232_000 },
  { rank:5, productType:"retail", itemId:"16167874509", itemName:"Bánh Quy Bơ Mayora Danisa 681G", totalQuantitySold:7, totalOrders:7, productSales:2_219_000 },
  { rank:6, productType:"retail", itemId:"24616846046", itemName:"Bánh Xốp Mayora Wafello Chocolate 210G", totalQuantitySold:6, totalOrders:5, productSales:222_000 },
  { rank:7, productType:"retail", itemId:"12892358205", itemName:"Kẹo Cà Phê Sữa Mayora Kopiko 560G", totalQuantitySold:5, totalOrders:5, productSales:450_000 },
  { rank:8, productType:"retail", itemId:"16067874699", itemName:"Kẹo Mayora The Fres Barley 150G", totalQuantitySold:5, totalOrders:3, productSales:135_000 },
  { rank:9, productType:"retail", itemId:"16067874699", itemName:"Kẹo Mayora The Fres Barley 150G", totalQuantitySold:4, totalOrders:3, productSales:108_000 },
  { rank:10, productType:"retail", itemId:"15084234863", itemName:"Kẹo Cà Phê Sữa Mayora Kopiko 140G", totalQuantitySold:4, totalOrders:4, productSales:116_000 },
  { rank:1, productType:"combo", itemId:"20140942183", itemName:"Combo 2 Hủ Kẹo Cà Phê Sữa Kopiko 560G", totalQuantitySold:7, totalOrders:7, productSales:1_220_100 },
  { rank:2, productType:"combo", itemId:"15484234913", itemName:"Cà Phê Sữa Hòa Tan Mayora Kopiko Macchiato 400G", totalQuantitySold:7, totalOrders:6, productSales:3_130_400 },
  { rank:3, productType:"combo", itemId:"29233346058", itemName:"Bánh Quy Mayora Danisa Chocofello 150G", totalQuantitySold:6, totalOrders:4, productSales:565_800 },
  { rank:4, productType:"combo", itemId:"15484234913", itemName:"Cà Phê Sữa Hòa Tan Mayora Kopiko Macchiato 400G", totalQuantitySold:5, totalOrders:5, productSales:911_500 },
  { rank:5, productType:"combo", itemId:"49813936807", itemName:"Combo Best Seller", totalQuantitySold:5, totalOrders:5, productSales:261_500 },
  { rank:6, productType:"combo", itemId:"20540949887", itemName:"Combo 2 Kẹo Cà Phê Sữa Mayora Kopiko 135G", totalQuantitySold:4, totalOrders:4, productSales:209_200 },
  { rank:7, productType:"combo", itemId:"44552142483", itemName:"Combo 2 Loại Bánh Quy Mayora", totalQuantitySold:3, totalOrders:3, productSales:282_900 },
  { rank:8, productType:"combo", itemId:"52563959751", itemName:"Combo Coffee Premium", totalQuantitySold:2, totalOrders:2, productSales:348_600 },
  { rank:9, productType:"combo", itemId:"57313958189", itemName:"Combo Lucky Day", totalQuantitySold:1, totalOrders:1, productSales:113_300 },
  { rank:10, productType:"combo", itemId:"25893057187", itemName:"Combo 2 Bánh Quy Sữa Mới Mayora D-Maxx Marie – Túi  528G (24 Gói X 22G)", totalQuantitySold:1, totalOrders:1, productSales:84_000 },
];

export const productPairs: ProductPairRow[] = [
  { rank:1,item1:{id:"29233346058",name:"Bánh quy Danisa Chocofello 150g"},item2:{id:"42801105610",name:"Bánh Quy Bơ & Cacao Danisa Abbracci Hộp 168g"},ordersBoughtTogether:3 },
  { rank:2,item1:{id:"24956187823",name:"BÁNH QUY BƠ DANISA 200G"},item2:{id:"42801105610",name:"Bánh Quy Bơ & Cacao Danisa Abbracci Hộp 168g"},ordersBoughtTogether:2 },
  { rank:3,item1:{id:"26580532173",name:"BÁNH QUY SỮA MỚI MAYORA D-MAXX MARIE - HỘP GIẤY 308G (14 GÓI X 22G)"},item2:{id:"42801105610",name:"BÁNH QUY BƠ & CACAO MAYORA DANISA ABBRACCI HỘP 168G"},ordersBoughtTogether:2 },
  { rank:4,item1:{id:"15284234921",name:"Bánh Xốp Mayora Superstar Triple Choco Hộp 150G"},item2:{id:"24616846046",name:"Bánh Xốp Mayora Wafello Chocolate 210G"},ordersBoughtTogether:2 },
  { rank:5,item1:{id:"24956187823",name:"BÁNH QUY BƠ MAYORA DANISA 200G"},item2:{id:"42801105610",name:"BÁNH QUY BƠ & CACAO MAYORA DANISA ABBRACCI HỘP 168G"},ordersBoughtTogether:2 },
];

const requiredMetric = (value:number|null,name:string) => {
  if(value==null) throw new Error(`Missing refreshed workbook metric: ${name}`);
  return value;
};
const repeatRate = requiredMetric(rawOverviewApiFixture.repeat_customer_rate,"repeat customer rate") * 100;
const cancellationRate = requiredMetric(rawOverviewApiFixture.cancellation_rate,"cancellation rate") * 100;
const newCustomerRevenueShare = rawCustomerTypeWorkbookFixture.revenue_contribution?.find((row) => row.customer_type === "new")?.revenue_contribution ?? 0;
const totalLostRevenue = rawCancellationWorkbookFixture.total_lost_revenue;
const comboComposition = shoppingComposition.find((row) => row.type === "Combo")!;
const compactEvidence = new Intl.NumberFormat("en", { notation:"compact", maximumFractionDigits:2 });

export const recommendations: RecommendationData[] = [
  {id:"retention",category:"Giữ chân",status:"Ưu tiên xử lý",priority:92,severity:"high",title:"Tăng trọng tâm vào khả năng giữ chân khách hàng",description:"Ưu tiên cải thiện tỷ lệ mua lại của nhóm khách mới.",reason:"The refreshed workbook combines a high repeat-customer rate with revenue concentrated in customers classified as new.",evidence:[{metric:"Repeat customer rate",value:`${repeatRate.toFixed(2)}%`,relationship:"Customers with ≥2 valid orders / purchasing customers"},{metric:"New-customer revenue contribution",value:`${newCustomerRevenueShare.toFixed(2)}%`,relationship:"Workbook revenue contribution for customers classified as new"}]},
  {id:"conversion",category:"Conversion",status:"Ưu tiên xử lý",priority:90,severity:"high",title:"Tập trung cải thiện Ads → Product View",description:"Đây là điểm rơi lớn nhất trong Customer Journey mẫu.",reason:"Mock Journey transition shows the largest drop-off before product view.",evidence:[{metric:"Ads → Product View",value:"2.0%",relationship:"1,880 product views from 93,760 ad impressions"},{metric:"Drop-off",value:"98.0%",relationship:"Largest mock transition loss"}]},
  {id:"combo",category:"Danh mục",status:"Theo dõi & mở rộng",priority:81,severity:"medium",title:"Mở rộng nhóm Combo đang tạo hiệu quả tốt",description:"Ưu tiên các nhóm Combo có tỷ lệ đơn và đóng góp doanh thu tích cực.",reason:"Combo revenue share exceeds its order share in the refreshed workbook.",evidence:[{metric:"Combo order share",value:`${(comboComposition.orderShare*100).toFixed(2)}%`,relationship:`${comboComposition.orderCount} of ${shoppingComposition.reduce((sum,row)=>sum+row.orderCount,0)} classified orders`},{metric:"Combo revenue share",value:`${(comboComposition.revenueShare*100).toFixed(2)}%`,relationship:"Revenue share is higher than order share"}]},
  {id:"cancel",category:"Vận hành",status:"Theo dõi sát",priority:77,severity:"medium",title:"Giảm thất thoát từ các nhóm đơn huỷ giá trị cao",description:"Theo dõi Lost Revenue cùng các nguyên nhân huỷ chính.",reason:"Cancellation reasons account for material lost revenue in the refreshed workbook.",evidence:[{metric:"Cancellation rate",value:`${cancellationRate.toFixed(2)}%`,relationship:"Cancelled deduplicated orders / created orders"},{metric:"Lost revenue",value:compactEvidence.format(totalLostRevenue),relationship:"Sum of workbook cancellation-reason revenue"}]},
];
