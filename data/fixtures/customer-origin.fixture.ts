import type { CustomerOriginMetric } from "@/data/contracts/dashboard";

/**
 * Prototype-only distribution. Counts reconcile to the current 352-customer
 * segmentation snapshot. Province geometry is sourced from the MIT-licensed
 * post-2025 dataset at https://github.com/lamngockhuong/vietnam-3d-map.
 */
export const customerOriginMockData: CustomerOriginMetric[] = [
  {
    provinceId: "91",
    province: "An Giang",
    customerCount: 8,
    revenue: 1_420_000,
  },
  {
    provinceId: "24",
    province: "Bắc Ninh",
    customerCount: 10,
    revenue: 2_850_000,
  },
  { provinceId: "96", province: "Cà Mau", customerCount: 5, revenue: 870_000 },
  {
    provinceId: "92",
    province: "Cần Thơ",
    customerCount: 12,
    revenue: 2_650_000,
  },
  {
    provinceId: "04",
    province: "Cao Bằng",
    customerCount: 2,
    revenue: 310_000,
  },
  {
    provinceId: "48",
    province: "Đà Nẵng",
    customerCount: 18,
    revenue: 4_150_000,
  },
  {
    provinceId: "66",
    province: "Đắk Lắk",
    customerCount: 9,
    revenue: 1_680_000,
  },
  {
    provinceId: "11",
    province: "Điện Biên",
    customerCount: 2,
    revenue: 280_000,
  },
  {
    provinceId: "75",
    province: "Đồng Nai",
    customerCount: 17,
    revenue: 3_780_000,
  },
  {
    provinceId: "82",
    province: "Đồng Tháp",
    customerCount: 7,
    revenue: 1_260_000,
  },
  {
    provinceId: "52",
    province: "Gia Lai",
    customerCount: 8,
    revenue: 1_530_000,
  },
  {
    provinceId: "01",
    province: "Hà Nội",
    customerCount: 38,
    revenue: 10_800_000,
  },
  { provinceId: "42", province: "Hà Tĩnh", customerCount: 5, revenue: 920_000 },
  {
    provinceId: "31",
    province: "Hải Phòng",
    customerCount: 14,
    revenue: 3_400_000,
  },
  { provinceId: "46", province: "Huế", customerCount: 6, revenue: 1_280_000 },
  {
    provinceId: "33",
    province: "Hưng Yên",
    customerCount: 9,
    revenue: 2_120_000,
  },
  {
    provinceId: "56",
    province: "Khánh Hòa",
    customerCount: 11,
    revenue: 2_950_000,
  },
  {
    provinceId: "12",
    province: "Lai Châu",
    customerCount: 2,
    revenue: 260_000,
  },
  {
    provinceId: "68",
    province: "Lâm Đồng",
    customerCount: 10,
    revenue: 2_450_000,
  },
  {
    provinceId: "20",
    province: "Lạng Sơn",
    customerCount: 4,
    revenue: 760_000,
  },
  {
    provinceId: "15",
    province: "Lào Cai",
    customerCount: 5,
    revenue: 1_060_000,
  },
  {
    provinceId: "40",
    province: "Nghệ An",
    customerCount: 9,
    revenue: 1_920_000,
  },
  {
    provinceId: "37",
    province: "Ninh Bình",
    customerCount: 7,
    revenue: 1_580_000,
  },
  {
    provinceId: "25",
    province: "Phú Thọ",
    customerCount: 8,
    revenue: 1_790_000,
  },
  {
    provinceId: "51",
    province: "Quảng Ngãi",
    customerCount: 6,
    revenue: 1_120_000,
  },
  {
    provinceId: "22",
    province: "Quảng Ninh",
    customerCount: 10,
    revenue: 2_380_000,
  },
  {
    provinceId: "44",
    province: "Quảng Trị",
    customerCount: 5,
    revenue: 890_000,
  },
  { provinceId: "14", province: "Sơn La", customerCount: 4, revenue: 670_000 },
  {
    provinceId: "80",
    province: "Tây Ninh",
    customerCount: 10,
    revenue: 2_210_000,
  },
  {
    provinceId: "19",
    province: "Thái Nguyên",
    customerCount: 8,
    revenue: 1_740_000,
  },
  {
    provinceId: "38",
    province: "Thanh Hóa",
    customerCount: 11,
    revenue: 2_150_000,
  },
  {
    provinceId: "79",
    province: "TP. Hồ Chí Minh",
    customerCount: 60,
    revenue: 15_600_000,
  },
  {
    provinceId: "08",
    province: "Tuyên Quang",
    customerCount: 5,
    revenue: 810_000,
  },
  {
    provinceId: "86",
    province: "Vĩnh Long",
    customerCount: 7,
    revenue: 1_340_000,
  },
];
