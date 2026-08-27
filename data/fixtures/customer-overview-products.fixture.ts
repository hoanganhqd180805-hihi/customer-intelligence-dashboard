import type { TopProductMetric } from "@/data/contracts/dashboard";

const products = {
  coffeeJoy: { productId: "coffee-joy", productName: "Coffee Joy Biscuits" },
  kopiko: { productId: "kopiko", productName: "Kopiko Coffee Candy" },
  danisa: { productId: "danisa", productName: "Danisa Butter Cookies" },
  roma: { productId: "roma", productName: "Roma Malkist Crackers" },
  bengBeng: { productId: "beng-beng", productName: "Beng-Beng Wafer" },
  chokiChoki: {
    productId: "choki-choki",
    productName: "Choki-Choki Chocolate",
  },
} as const;

function ranked(
  first: (typeof products)[keyof typeof products],
  second: (typeof products)[keyof typeof products],
  third: (typeof products)[keyof typeof products],
): TopProductMetric[] {
  return [first, second, third].map((product, index) => ({
    ...product,
    rank: index + 1,
  }));
}

/** Prototype-only product affinity for New and Returning customers. */
export const mockTopProductsByCustomerType: Record<
  "new" | "returning",
  TopProductMetric[]
> = {
  new: ranked(products.coffeeJoy, products.bengBeng, products.kopiko),
  returning: ranked(products.danisa, products.roma, products.kopiko),
};

/** Prototype-only product affinity for the four approved RFM segments. */
export const mockTopProductsBySegment: Record<string, TopProductMetric[]> = {
  vip: ranked(products.danisa, products.kopiko, products.roma),
  high_value: ranked(products.danisa, products.coffeeJoy, products.bengBeng),
  potential: ranked(products.coffeeJoy, products.chokiChoki, products.kopiko),
  low_value: ranked(products.roma, products.bengBeng, products.chokiChoki),
};

/** Prototype-only product affinity for the current top-ten provinces. */
export const mockTopProductsByProvinceId: Record<string, TopProductMetric[]> = {
  "79": ranked(products.kopiko, products.coffeeJoy, products.bengBeng),
  "01": ranked(products.danisa, products.roma, products.kopiko),
  "48": ranked(products.coffeeJoy, products.kopiko, products.chokiChoki),
  "75": ranked(products.bengBeng, products.roma, products.coffeeJoy),
  "31": ranked(products.danisa, products.kopiko, products.bengBeng),
  "92": ranked(products.roma, products.coffeeJoy, products.kopiko),
  "56": ranked(products.coffeeJoy, products.danisa, products.roma),
  "38": ranked(products.kopiko, products.bengBeng, products.roma),
  "24": ranked(products.danisa, products.coffeeJoy, products.chokiChoki),
  "68": ranked(products.roma, products.kopiko, products.coffeeJoy),
};
