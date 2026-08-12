import { describe,expect,it } from "vitest";
import { customerSegmentationDataset } from "@/data/fixtures/customer-segmentation-workbook.fixture";

describe("customer segmentation workbook fixture",()=>{
  it("preserves the six workbook rows and order",()=>{
    expect(customerSegmentationDataset.segments.map((row)=>row.segment)).toEqual(["Ngủ đông","Khách mới","Khách thường","Tiềm năng","Nguy cơ rời bỏ","VIP"]);
    expect(customerSegmentationDataset.totalCustomers).toBe(488);
    expect(customerSegmentationDataset.totalRevenue).toBe(57_671_416);
  });
  it("normalizes workbook percentages and reconciles rounding",()=>{
    expect(customerSegmentationDataset.segments.reduce((sum,row)=>sum+row.customerShare,0)).toBeCloseTo(.9999,4);
    expect(customerSegmentationDataset.segments.reduce((sum,row)=>sum+row.revenueShare,0)).toBeCloseTo(1,4);
    expect(customerSegmentationDataset.segments.find((row)=>row.segment==="VIP")).toMatchObject({customerCount:1,customerShare:.002,revenue:888720,revenueShare:.0154});
  });
});
