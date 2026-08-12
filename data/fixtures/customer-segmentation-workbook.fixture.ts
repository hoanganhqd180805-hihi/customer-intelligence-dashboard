import { adaptCustomerSegmentation, type RawCustomerSegmentRow } from "@/data/adapters/customer-segmentation.adapter";

/** Exact extracted values from `mapping data.xlsx`, `Customer journey!A140:E145`. */
export const rawCustomerSegmentationWorkbookRows:RawCustomerSegmentRow[]=[
  {segment:"Ngủ đông",customerCount:192,customerSharePercent:39.34,revenue:22872121,revenueSharePercent:39.66},
  {segment:"Khách mới",customerCount:179,customerSharePercent:36.68,revenue:18368331,revenueSharePercent:31.85},
  {segment:"Khách thường",customerCount:98,customerSharePercent:20.08,revenue:11159748,revenueSharePercent:19.35},
  {segment:"Tiềm năng",customerCount:16,customerSharePercent:3.28,revenue:3269197,revenueSharePercent:5.67},
  {segment:"Nguy cơ rời bỏ",customerCount:2,customerSharePercent:.41,revenue:1113299,revenueSharePercent:1.93},
  {segment:"VIP",customerCount:1,customerSharePercent:.2,revenue:888720,revenueSharePercent:1.54},
];

export const customerSegmentationDataset=adaptCustomerSegmentation(rawCustomerSegmentationWorkbookRows);
