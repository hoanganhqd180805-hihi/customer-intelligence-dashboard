# Excel Data Mapping

## Source and extraction rules

- Requested preferred file `mapping data(1).xlsx`: **not present** in the project.
- Source workbook used: `mapping data.xlsx`.
- Dashboard sample-value source: `Customer journey`.
- Business-logic reference: `SQL`.
- `Dashboard` sheet: ignored because its used range is only blank cell `A1`.
- Extraction was performed from the workbook afresh; no previous fixture was treated as authoritative.
- Percentages stored as percentage points in Excel are normalized to ratios only in adapters.

## Overview

| Source workbook | Source sheet | Source range | Extracted value | Destination dashboard field | Previous value | New value |
|---|---|---:|---:|---|---:|---:|
| mapping data.xlsx | Customer journey | A4 | 488 | `OverviewMetrics.totalCustomers.value` | 488 | 488 |
| mapping data.xlsx | Customer journey | B4 | 530 | `OverviewMetrics.totalOrders.value` | 530 | 530 |
| mapping data.xlsx | Customer journey | C4 | 57,671,416 | `OverviewMetrics.revenue.value` | 57,671,416 | 57,671,416 |
| mapping data.xlsx | Customer journey | D4 | 108,813.99 | `OverviewMetrics.averageOrderValue.value` | 108,813.99 | 108,813.99 |
| mapping data.xlsx | Customer journey | E4 | 77.38% | `OverviewMetrics.repeatCustomerRate.value` | 77.38% | 77.38% |
| mapping data.xlsx | Customer journey | F4 | 16.67% | `OverviewMetrics.cancellationRate.value` | 16.67% | 16.67% |

The Overview UI continues to receive `OverviewMetrics` through `adaptOverviewResponse()`; comparison values remain unavailable because the workbook supplies no comparison period.

## Customer Type — daily customer activity

Source columns: `Customer journey!A7:C24`. Excel serial dates 46143–46159 map to 2026-05-01–2026-05-17.

| Source range | Date | Destination fields | Previous new / existing | New new / existing |
|---|---|---|---:|---:|
| A8:C8 | 2026-05-01 | `daily[].newCustomers / returningCustomers` | 0 / 0 | 0 / 0 |
| A9:C9 | 2026-05-02 | same | 5 / 0 | 4 / 1 |
| A10:C10 | 2026-05-03 | same | 18 / 0 | 15 / 3 |
| A11:C11 | 2026-05-04 | same | 32 / 1 | 24 / 9 |
| A12:C12 | 2026-05-05 | same | 40 / 1 | 29 / 12 |
| A13:C13 | 2026-05-06 | same | 37 / 1 | 29 / 9 |
| A14:C14 | 2026-05-07 | same | 20 / 0 | 14 / 6 |
| A15:C15 | 2026-05-08 | same | 26 / 0 | 22 / 4 |
| A16:C16 | 2026-05-09 | same | 35 / 2 | 25 / 12 |
| A17:C17 | 2026-05-10 | same | 32 / 1 | 24 / 8 |
| A18:C18 | 2026-05-11 | same | 27 / 1 | 24 / 3 |
| A19:C19 | 2026-05-12 | same | 42 / 4 | 22 / 12 |
| A20:C20 | 2026-05-13 | same | 41 / 3 | 17 / 11 |
| A21:C21 | 2026-05-14 | same | 42 / 1 | 9 / 2 |
| A22:C22 | 2026-05-15 | same | 50 / 2 | 8 / 5 |
| A23:C23 | 2026-05-16 | same | 19 / 2 | 1 / 0 |
| A24:C24 | 2026-05-17 | same | 22 / 3 | 0 / 0 |

Refreshed daily occurrence totals are 267 new and 97 existing. These are daily distinct-customer occurrences and are not expected to equal the period-level 488 unique customers.

## Customer Type — revenue contribution

| Source workbook | Source sheet | Source range | Extracted value | Destination dashboard field | Previous value | New value |
|---|---|---:|---:|---|---:|---:|
| mapping data.xlsx | Customer journey | B28 | 69.11% | new customer `revenueShare` | 97.82% | 69.11% |
| mapping data.xlsx | Customer journey | C28 | 30.89% | returning customer `revenueShare` | 2.18% | 30.89% |
| mapping data.xlsx | Customer journey | B28:C28 | no revenue amounts | both `revenue` fields | unavailable | unavailable (`null`) |

Row 27 is order-count contribution (74.08%/25.92%) and is deliberately not used by the revenue doughnut.

## Purchase Time

| Source workbook | Source sheet | Source range | Extracted value | Destination dashboard field | Previous value | New value |
|---|---|---:|---|---|---|---|
| mapping data.xlsx | Customer journey | A32:C73 | 42 weekday × time-slot totals: `[[22,7,10,7,12,10],[26,14,10,17,11,11],[30,25,6,10,11,5],[22,7,9,13,5,8],[30,15,10,15,4,6],[19,10,6,11,12,7],[24,10,19,8,11,5]]` | `PurchaseTimeSlotTotal[]` | same matrix | same matrix |
| mapping data.xlsx | Customer journey | A76:B82 | Monday→Sunday: `68, 89, 87, 64, 80, 65, 77` | `WeekdayOrderTotal[]` | same | same |

The six approved time slots remain exactly `00:00–05:59`, `06:00–08:59`, `09:00–11:59`, `12:00–14:59`, `15:00–17:59`, `18:00–23:59`. Weekday totals sum to 530 orders.

## Cancellation Analysis

Source: `Customer journey!A84:C96`.

| Source rows | Extracted value | Destination | Previous value | New value |
|---|---|---|---|---|
| A85:C95 | 11 reason rows with counts `29,19,13,10,9,7,7,6,3,2,1` | `CancellationReasonMetric[]` | same | same |
| C85:C95 | lost revenue `5,149,401; 2,029,562; 1,697,365; 1,200,881; 735,961; 660,315; 492,519; 802,900; 305,000; 161,000; 40,300` | reason-level `lostRevenue` | same | same |
| C96 | formula `SUM(C84:C95)` = 13,275,204 | `totalLostRevenue` | 13,275,204 | 13,275,204 |
| B85:B95 | sum = 106 | `totalCancelledOrders` | 106 | 106 |

The obsolete consolidated fallback categories (“Thay đổi ý định”, “Giá tốt hơn”, etc.) were removed; the consolidated raw model now uses the exact workbook reasons.

## Shopping Composition

| Source range | Type | Extracted orders / share | Extracted revenue / share | Destination | Previous | New |
|---|---|---:|---:|---|---|---|
| A99:C99 and A103:C103 | Combo | 80 / 32.3886639676% | 11,545,411 / 38.37% | `ShoppingCompositionMetric` | same | same |
| A100:C100 and A104:C104 | Bán lẻ | 137 / 55.4655870445% | 13,507,069 / 44.89% | same | same | same |
| A101:C101 and A105:C105 | Hỗn hợp | 30 / 12.1457489879% | 5,034,040 / 16.73% | same | same | same |

Order shares sum to 100%; displayed revenue shares sum to 99.99% because the workbook stores them rounded to two decimals.

## Product Performance

Source: `Customer journey!A107:G129`. The workbook and SQL support ranks 1–10 per product type. All 20 rows are retained locally; the approved UI continues to display the first five for the selected type.

| Source rows | Destination | Previous | New |
|---|---|---|---|
| A108:G117 | Combo ranks 1–10 | ranks 1–5 only, with abbreviated/combined names and a synthetic rank-4 ID | exact workbook ranks 1–10, exact IDs, names, quantities, orders, and revenue |
| A119:G128 | Retail ranks 1–10 | ranks 1–5 only; rank-2 name abbreviated | exact workbook ranks 1–10, exact IDs, names, quantities, orders, and revenue |

Changed visible product fields:

| Source cell(s) | Destination row | Previous value | New value |
|---|---|---|---|
| B109:C109 | Combo rank 2 | `Kopiko Macchiato 400G · Combo 5 gói` | `Cà Phê Sữa Hòa Tan Mayora Kopiko Macchiato 400G` |
| B110:C110 | Combo rank 3 | `Bánh Quy Danisa Chocofello 150G · Combo 2` | `Bánh Quy Mayora Danisa Chocofello 150G` |
| B111:C111 | Combo rank 4 | synthetic ID `15484234913-2`; abbreviated name | exact ID `15484234913`; `Cà Phê Sữa Hòa Tan Mayora Kopiko Macchiato 400G` |
| B120:C120 | Retail rank 2 | `Cà Phê Sữa Kopiko Macchiato 400G` | `Cà Phê Sữa Hòa Tan Mayora Kopiko Macchiato 400G` |
| A113:G117 | Combo ranks 6–10 | missing | added exactly from workbook |
| A124:G128 | Retail ranks 6–10 | missing | added exactly from workbook |

Column D contains combo model descriptors, but the production-facing `ProductPerformanceRow` contract corresponds to the SQL output and retains the workbook item name from column B without inventing a combined display name.

## Product Pair / Combo Recommendations

Source: `Customer journey!A130:F135`.

| Source range | Destination | Previous | New |
|---|---|---|---|
| A131:F135 | `ProductPairRow[]` ranks 1–5 | IDs and counts matched, names were abbreviated | exact workbook IDs, full item names, and counts |

Counts remain `3, 2, 2, 2, 2`; all ten item-name fields were re-extracted exactly, including workbook capitalization.

## Customer Journey support

The workbook contains no Platform → Content → Product View → Order → Post-Purchase graph table. Therefore Ads impressions, Product Views, reviews, and Buy Again remain sourced from the separately approved Customer Journey reference, not invented from Excel.

Workbook-supported Journey fields are derived locally:

| Source range | Extracted / derived value | Destination | Previous | New |
|---|---:|---|---:|---:|
| B4 | 530 completed/valid orders | Complete node/link and Order Quality insight | 530 | 530 |
| B85:B95 | 106 cancelled orders | Cancel node/link | 106 | 106 |
| B4 + SUM(B85:B95) | 636 created orders | Order node/link | 636 | 636 |
| derived 530/636 and 106/636 | 83.3% / 16.7% | Journey labels and insight text | hardcoded equivalents | model-derived equivalents |

## Metric-dependent recommendations

- Repeat-customer evidence now derives from `rawOverviewApiFixture.repeat_customer_rate` (77.38%).
- New-customer revenue evidence changed from the stale 97.82% to the refreshed 69.11% and derives from `rawCustomerTypeWorkbookFixture`.
- Combo evidence derives from `ShoppingCompositionMetric` instead of duplicated strings.
- Cancellation evidence derives from Overview and Cancellation fixtures instead of duplicated strings.

## Workbook / SQL inconsistencies and limitations

1. Workbook title says `01/05/2026 - 18/05/2026`; SQL uses an exclusive upper boundary `< 2026-05-18`, and daily output ends 2026-05-17. The dashboard retains 2026-05-01–2026-05-17 as the inclusive display range.
2. Customer Type SQL says “first order in all history” but its `latest_orders` CTE is already filtered to 2026-05-01–2026-05-18. This does not truly inspect pre-period customer history.
3. Customer revenue SQL mixes a `create_time` lower bound with an `update_time` upper bound in its initial CTE, unlike the daily query’s create-time boundary.
4. Cancellation SQL uses 2026-07-27–2026-08-03, while the sample table is positioned in the May dashboard workbook. The sample values were used as requested; the SQL date mismatch must be resolved before production integration.
5. Percentage storage is mixed: Overview and Customer Type use percentage points, shopping-order share includes an Excel formula returning percentage points, and shopping-revenue percentages are stored as text. Adapters normalize these formats for the dashboard.
6. Customer revenue amounts are not present in the sample table; only contribution percentages are available, so revenue amounts remain `null`.
7. Shopping composition covers 247 classified orders and 30,086,520 revenue, not the entire 530-order / 57,671,416 Overview population. It must not be silently reconciled as a full-population breakdown.
8. No production comparison-period values are supplied; KPI comparisons and cancellation comparison remain unavailable.
