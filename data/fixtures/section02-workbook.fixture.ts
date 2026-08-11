import type { RawCancellationWorkbookResponse, RawPurchaseTimeResponse } from "@/data/contracts/section-api";
import type { Weekday } from "@/data/contracts/dashboard";

export const section02Weekdays: Weekday[]=["Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy","Chủ Nhật"];
export const section02TimeSlots=["00:00 - 05:59","06:00 - 08:59","09:00 - 11:59","12:00 - 14:59","15:00 - 17:59","18:00 - 23:59"];
const timeValues=[[22,7,10,7,12,10],[26,14,10,17,11,11],[30,25,6,10,11,5],[22,7,9,13,5,8],[30,15,10,15,4,6],[19,10,6,11,12,7],[24,10,19,8,11,5]];

/** Exact extraction from mapping data.xlsx, Customer journey!A29:C82. */
export const rawPurchaseTimeWorkbookFixture: RawPurchaseTimeResponse={
  weekdays:section02Weekdays,time_slots:section02TimeSlots,
  time_slot_totals:section02Weekdays.flatMap((weekday,row)=>section02TimeSlots.map((time_slot,column)=>({weekday,time_slot,total_orders:timeValues[row][column]}))),
  weekday_totals:[68,89,87,64,80,65,77].map((total_orders,index)=>({weekday:section02Weekdays[index],total_orders})),
  omitted_combination_means_zero:true,
};

/** Exact extraction from mapping data.xlsx, Customer journey!A83:C96. */
export const rawCancellationWorkbookFixture: RawCancellationWorkbookResponse={
  reasons:[
    {reason:"modify existing order (colour, size, address, voucher, etc.)",cancelled_orders:29,lost_revenue:5_149_401},
    {reason:"other",cancelled_orders:19,lost_revenue:2_029_562},
    {reason:"need to input / change voucher code",cancelled_orders:13,lost_revenue:1_697_365},
    {reason:"need to change delivery address",cancelled_orders:10,lost_revenue:1_200_881},
    {reason:"need to modify order",cancelled_orders:9,lost_revenue:735_961},
    {reason:"unpaid order",cancelled_orders:7,lost_revenue:660_315},
    {reason:"found cheaper elsewhere",cancelled_orders:7,lost_revenue:492_519},
    {reason:"don't want to buy anymore",cancelled_orders:6,lost_revenue:802_900},
    {reason:"failed delivery",cancelled_orders:3,lost_revenue:305_000},
    {reason:"payment procedure too troublesome",cancelled_orders:2,lost_revenue:161_000},
    {reason:"out of stock",cancelled_orders:1,lost_revenue:40_300},
  ],
  total_lost_revenue:13_275_204,
};
