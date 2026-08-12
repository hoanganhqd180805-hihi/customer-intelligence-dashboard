import type { CustomerSegmentationDataset } from "@/data/contracts/dashboard";

export interface RawCustomerSegmentRow { segment:string; customerCount:number; customerSharePercent:number; revenue:number; revenueSharePercent:number }

const segmentColors:Record<string,string>={VIP:"#7457D9","Trung thành":"#3976D5","Tiềm năng":"#20A7A1","Khách mới":"#3B82F6","Khách thường":"#7086A8","Nguy cơ rời bỏ":"#E47B52","Ngủ đông":"#8A839C"};
const slug=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("en-US").replace(/đ/g,"d").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
const percent=new Intl.NumberFormat("vi-VN",{style:"percent",maximumFractionDigits:1});

export function adaptCustomerSegmentation(rows:RawCustomerSegmentRow[]):CustomerSegmentationDataset{
  const segments=rows.map((row,index)=>({id:slug(row.segment),segment:row.segment,customerCount:row.customerCount,customerShare:row.customerSharePercent/100,revenue:row.revenue,revenueShare:row.revenueSharePercent/100,color:segmentColors[row.segment]??["#526FD1","#3E9A9A","#A16CC1","#6385A8"][index%4]}));
  const strongest=[...segments].sort((a,b)=>(b.revenueShare-b.customerShare)-(a.revenueShare-a.customerShare))[0];
  const insight=strongest&&strongest.revenueShare>strongest.customerShare?`${strongest.segment} chiếm ${percent.format(strongest.customerShare)} khách hàng nhưng đóng góp ${percent.format(strongest.revenueShare)} doanh thu.`:"Tỷ trọng khách hàng và doanh thu giữa các phân khúc đang tương đối cân bằng.";
  return {segments,totalCustomers:segments.reduce((sum,row)=>sum+row.customerCount,0),totalRevenue:segments.reduce((sum,row)=>sum+row.revenue,0),insight};
}
