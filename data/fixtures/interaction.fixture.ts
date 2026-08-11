import type { ProductPairRow, ProductPerformanceRow, PurchaseTimeSlotTotal, RecommendationData, ShoppingCompositionMetric, Weekday, WeekdayOrderTotal } from "@/data/contracts/dashboard";

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
  { rank:2, productType:"retail", itemId:"15484234913", itemName:"Cà Phê Sữa Kopiko Macchiato 400G", totalQuantitySold:12, totalOrders:11, productSales:1_128_000 },
  { rank:3, productType:"retail", itemId:"24956187823", itemName:"Bánh Quy Bơ Mayora Danisa 200G", totalQuantitySold:10, totalOrders:7, productSales:940_000 },
  { rank:4, productType:"retail", itemId:"15084234863", itemName:"Kẹo Cà Phê Sữa Mayora Kopiko 140G", totalQuantitySold:8, totalOrders:4, productSales:232_000 },
  { rank:5, productType:"retail", itemId:"16167874509", itemName:"Bánh Quy Bơ Mayora Danisa 681G", totalQuantitySold:7, totalOrders:7, productSales:2_219_000 },
  { rank:1, productType:"combo", itemId:"20140942183", itemName:"Combo 2 Hủ Kẹo Cà Phê Sữa Kopiko 560G", totalQuantitySold:7, totalOrders:7, productSales:1_220_100 },
  { rank:2, productType:"combo", itemId:"15484234913", itemName:"Kopiko Macchiato 400G · Combo 5 gói", totalQuantitySold:7, totalOrders:6, productSales:3_130_400 },
  { rank:3, productType:"combo", itemId:"29233346058", itemName:"Bánh Quy Danisa Chocofello 150G · Combo 2", totalQuantitySold:6, totalOrders:4, productSales:565_800 },
  { rank:4, productType:"combo", itemId:"15484234913-2", itemName:"Kopiko Macchiato 400G · Combo 2 gói", totalQuantitySold:5, totalOrders:5, productSales:911_500 },
  { rank:5, productType:"combo", itemId:"49813936807", itemName:"Combo Best Seller", totalQuantitySold:5, totalOrders:5, productSales:261_500 },
];

export const productPairs: ProductPairRow[] = [
  { rank:1,item1:{id:"29233346058",name:"Danisa Chocofello 150g"},item2:{id:"42801105610",name:"Danisa Abbracci 168g"},ordersBoughtTogether:3 },
  { rank:2,item1:{id:"24956187823",name:"Danisa 200G"},item2:{id:"42801105610",name:"Danisa Abbracci 168g"},ordersBoughtTogether:2 },
  { rank:3,item1:{id:"26580532173",name:"D-Maxx Marie 308G"},item2:{id:"42801105610",name:"Danisa Abbracci 168G"},ordersBoughtTogether:2 },
  { rank:4,item1:{id:"15284234921",name:"Superstar Triple Choco 150G"},item2:{id:"24616846046",name:"Wafello Chocolate 210G"},ordersBoughtTogether:2 },
  { rank:5,item1:{id:"24956187823",name:"Danisa 200G"},item2:{id:"42801105610",name:"Danisa Abbracci 168G"},ordersBoughtTogether:2 },
];

export const recommendations: RecommendationData[] = [
  {id:"retention",category:"Giữ chân",status:"Ưu tiên xử lý",priority:92,severity:"high",title:"Tăng trọng tâm vào khả năng giữ chân khách hàng",description:"Ưu tiên cải thiện tỷ lệ mua lại của nhóm khách mới.",reason:"Repeat rate is high in the fixture, but customer-history logic needs validation.",evidence:[{metric:"Repeat customer rate",value:"77.38%",relationship:"Customers with ≥2 valid orders / purchasing customers"},{metric:"New-customer contribution",value:"97.82%",relationship:"Revenue is concentrated in customers classified as new"}]},
  {id:"conversion",category:"Conversion",status:"Ưu tiên xử lý",priority:90,severity:"high",title:"Tập trung cải thiện Ads → Product View",description:"Đây là điểm rơi lớn nhất trong Customer Journey mẫu.",reason:"Mock Journey transition shows the largest drop-off before product view.",evidence:[{metric:"Ads → Product View",value:"2.0%",relationship:"1,880 product views from 93,760 ad impressions"},{metric:"Drop-off",value:"98.0%",relationship:"Largest mock transition loss"}]},
  {id:"combo",category:"Danh mục",status:"Theo dõi & mở rộng",priority:81,severity:"medium",title:"Mở rộng nhóm Combo đang tạo hiệu quả tốt",description:"Ưu tiên các nhóm Combo có tỷ lệ đơn và đóng góp doanh thu tích cực.",reason:"Combo revenue share exceeds its order share in the workbook fixture.",evidence:[{metric:"Combo order share",value:"32.39%",relationship:"80 of 247 classified orders"},{metric:"Combo revenue share",value:"38.37%",relationship:"Revenue share is higher than order share"}]},
  {id:"cancel",category:"Vận hành",status:"Theo dõi sát",priority:77,severity:"medium",title:"Giảm thất thoát từ các nhóm đơn huỷ giá trị cao",description:"Theo dõi Lost Revenue cùng các nguyên nhân huỷ chính.",reason:"Cancellation reasons account for material mock lost revenue.",evidence:[{metric:"Cancellation rate",value:"16.67%",relationship:"Cancelled deduplicated orders / created orders"},{metric:"Lost revenue",value:"13.28M",relationship:"Sum of sample cancellation-reason revenue"}]},
];
