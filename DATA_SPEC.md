# Customer Intelligence Data Specification

## 1. Purpose and authority

This document describes the data currently available for the Customer Intelligence dashboard. It is a data audit and provisional frontend data contract—not an overall dashboard design specification.

### Source precedence

| Source | Authority |
|---|---|
| `mapping data.xlsx` | Source of truth for metrics, dimensions, sample data, SQL/query logic, and business logic. |
| `Hanh_Trinh_Khach_Hang.html` | Reference implementation only for the Customer Journey Sankey, journey animations, node/link interactions, drop-off treatment, and conversion-trend presentation. Its hardcoded values are not authoritative data. |
| Existing dashboard visual reference | Source of truth for overall UI/UX, layout, section arrangement, chart placement, card structure, and visual hierarchy. This reference was not included among the files inspected for this audit. |

The workbook must not be used to redesign the dashboard. Any visualization or section-order suggestions in the earlier `DASHBOARD_SPEC.md` are nonbinding and are superseded by the authority model above.

## 2. Files inspected

The requested `/reference` directory was not present. The corresponding files were found at the workspace root:

- `mapping data.xlsx`
- `Hanh_Trinh_Khach_Hang.html`

The workbook contains:

| Sheet | Observed content |
|---|---|
| `Dashboard` | Blank placeholder. It supplies no UI requirements. |
| `Customer journey` | Metric labels and sample results for overview, customer type, purchase timing, cancellations, shopping composition, product performance, and product pairs. |
| `SQL` | PostgreSQL-style query logic. Some sections contain full queries; some contain labels or missing logic only. |

## 3. Status vocabulary

- **Supported:** metric/dimension has both a definition/query and corresponding sample output.
- **Partially supported:** sample output or some query logic exists, but the production definition/query is incomplete or inconsistent.
- **Prototype only:** mock/sample data may be used for frontend development, but not presented as live production truth.
- **Unsupported:** the inspected workbook does not provide the data or business definition.
- **Needs decision:** conflicting source logic prevents a single production definition from being inferred safely.

## 4. Shared source model

All supplied SQL reads from `order_detail` and uses PostgreSQL-specific features.

### Source fields referenced

| Field | Observed use |
|---|---|
| `order_sn` | Order identifier and deduplication key. |
| `buyer_user_id` | Customer identifier. |
| `create_time` | Reporting-period membership, order date, weekday, and hour. |
| `update_time` | Select latest record per order and, inconsistently, an upper date boundary in some queries. |
| `order_status` | Exclude cancellation-status variants in some—but not all—queries. |
| `cancel_reason` | Identify cancellation and group cancellation reasons. |
| `total_amount` | Order revenue, AOV, and cancellation lost revenue. |
| `item_list` | JSON/JSONB source for item-level product and pair analysis. |
| `user_email` | Store/account filter; hardcoded as `mayoravietnam_customer@gmail.com`. |

### Common mechanics

- Orders are generally deduplicated by `order_sn`, retaining the row with the latest `update_time` using `ROW_NUMBER()` or `DISTINCT ON`.
- Several analyses exclude orders with a nonblank `cancel_reason`.
- Some analyses additionally exclude normalized `order_status` values: `CANCELLED`, `IN_CANCEL`, `CANCEL`, and `TO_CANCEL`.
- Date filters are hardcoded rather than parameterized.
- The queries assume timestamps can be interpreted directly; no business timezone conversion is specified.

## 5. Metric and dataset inventory

### 5.1 Overview metrics

**Status:** Partially supported; query and sample exist, but valid-order consistency needs a decision.

Sample reporting label: `01/05/2026 - 18/05/2026`.

| Metric | Sample | SQL definition |
|---|---:|---|
| Total customers | 488 | Distinct `buyer_user_id` among valid deduplicated orders. |
| Total orders | 530 | Count of valid deduplicated orders. |
| Revenue | 57,671,416 | Sum of `total_amount` among valid deduplicated orders. Currency is not specified. |
| AOV | 108,813.99 | Revenue divided by valid order count, rounded to two decimals. |
| Repeat customer rate | 77.38 | Customers with at least two valid orders divided by purchasing customers, multiplied by 100. The sample sheet labels this “Customer Return Rate.” |
| Cancellation rate | 16.67 | Deduplicated orders with nonblank `cancel_reason` divided by all deduplicated created orders, multiplied by 100. |

#### Definition warning

“Customer Return Rate” is not a merchandise-return calculation. The supplied SQL calculates a **repeat customer rate**. The production label should remain unresolved until the business owner confirms the intended terminology.

### 5.2 Customer type by date

**Status:** Partially supported; sample and SQL exist, but the customer-history definition is internally inconsistent.

Dimensions and measures:

- `order_date`
- `new_customers`
- `existing_customers`
- `total_customers` (returned by SQL, not shown as a separate sample column)

Observed sample period: 1–17 May 2026, including an explicit zero row for 1 May.

SQL intent:

1. Deduplicate orders.
2. Exclude cancelled orders.
3. Find each customer's first order date.
4. Classify a customer as new when the order date equals that first order date; otherwise classify as existing.
5. Generate all dates in the period so zero-activity days are retained.
6. Count each customer once per day using `SELECT DISTINCT` in `daily_customer`.

#### Production blocker: customer-history window

The SQL comment states that full history is retained to determine new vs existing customers, but `latest_orders` filters `create_time` to the reporting period before calculating `MIN(create_time::date)`. A customer who purchased before the reporting period can therefore be incorrectly classified as new.

Required resolution: compute first purchase date from the approved full historical population, then apply the reporting-period filter to activity. The approved scope of “full history” and account/store partitioning must be specified.

### 5.3 Customer type revenue contribution

**Status:** Partially supported; SQL and percentage samples exist, but timestamp filtering is inconsistent.

Dimensions and measures:

- `customer_type`: `Khách mới` / new, `Khách cũ` / existing
- `total_revenue`
- `revenue_contribution_percent`

Sample contribution:

| Customer type | Percent value |
|---|---:|
| New | 97.82 |
| Existing | 2.18 |

The percentages total 100.00 and are stored as percentage points rather than fractions.

#### Production blocker

The revenue query applies the lower boundary to `create_time` but the upper boundary to `update_time` inside `latest_orders`. Period membership is later filtered using `create_time`. This can omit orders created during the period but updated after its end. A canonical event-time rule is required.

### 5.4 Purchase timing: weekday × time slot

**Status:** Supported as a provisional definition; timezone and boundary conventions still require confirmation.

Dimensions and measure:

- `weekday_name`
- `purchase_time_slot`
- `total_orders` as count of distinct valid `order_sn`

The supplied SQL defines exactly six slots:

| Slot order | Inclusive hour test | Display label |
|---:|---|---|
| 1 | 00 through 05 | `00:00 - 05:59` |
| 2 | 06 through 08 | `06:00 - 08:59` |
| 3 | 09 through 11 | `09:00 - 11:59` |
| 4 | 12 through 14 | `12:00 - 14:59` |
| 5 | 15 through 17 | `15:00 - 17:59` |
| 6 | 18 through 23 | `18:00 - 23:59` |

Weekdays use ISO ordering: Monday = 1 through Sunday = 7. The query cross joins all seven weekdays with all six slots, ensuring a 42-cell result and explicit zeros.

#### Time-slot cautions

- Slot durations are unequal: 6 hours, then four 3-hour slots, then 6 hours. Raw order totals are therefore not directly comparable as hourly intensity without normalization. The workbook defines totals, not orders per hour.
- `EXTRACT(HOUR FROM create_time)` uses the database/session interpretation of the timestamp. No timezone conversion is shown.
- The date filter uses `create_time >= 2026-05-01 00:00:00` but `update_time < 2026-05-18 00:00:00` in this query. That mixes event-time fields and must be resolved.
- The SQL has exhaustive integer-hour coverage with no gap or overlap, assuming non-null valid timestamps.

### 5.5 Purchase timing: weekday total

**Status:** Prototype only / missing production query.

Sample values:

| Weekday | Total orders |
|---|---:|
| Monday | 68 |
| Tuesday | 89 |
| Wednesday | 87 |
| Thursday | 64 |
| Friday | 80 |
| Saturday | 65 |
| Sunday | 77 |

These values sum to 530, matching the overview total-order sample. The SQL sheet contains the label “Theo thứ” but no complete weekday-total query. A production query may aggregate the 42-cell timing result, but that equivalence must be adopted explicitly rather than assumed by frontend code.

### 5.6 Cancellation reasons

**Status:** Partially supported; query exists but uses a different reporting period from the sample dashboard.

Dimensions and measures:

- `cancel_reason`
- `cancelled_orders`
- `cancel_reason_rate_percent`
- `lost_revenue`
- `lost_revenue_rate_percent`

The sample sheet contains 12 reasons, order counts, and lost revenue. Sample lost revenue totals 13,275,204. The sample counts total 106, which is consistent with a 16.67% cancellation rate only if the denominator is approximately 636 orders (106 / 636 = 16.67%), but the exact reconciliation source is not explicitly supplied in the sheet.

#### Date inconsistency

- Overview/customer/product sample period: May 2026.
- Cancellation SQL period: `2026-07-27` inclusive to `2026-08-03` exclusive.

The cancellation sample therefore must not be assumed to be generated by the displayed cancellation SQL for the same dashboard period. Shared date parameters are required.

#### Definition inconsistency

Cancellation-reason SQL identifies cancellations using nonblank `cancel_reason`, without checking cancellation status. Other valid-order queries use both reason and status. A canonical cancellation definition is required.

### 5.7 Shopping composition by order count

**Status:** Prototype only / production logic missing.

| Order composition | Sample count | Sample percent value |
|---|---:|---:|
| Combo | 80 | 32.38866397 |
| Retail | 137 | 55.46558704 |
| Mixed | 30 | 12.14574899 |

Counts total 247. Percentages total approximately 100.00000000. The workbook contains a formula for at least the Combo share (`count / sum(counts) * 100`), confirming percentage-point storage.

“Mixed” is present as a sample category, but the SQL sheet does not provide the order-level classification logic that distinguishes Combo, Retail, and Mixed. The product-performance query only classifies individual items as Combo or Retail.

### 5.8 Shopping composition by revenue

**Status:** Prototype only / production logic missing.

| Order composition | Sample revenue | Sample percent |
|---|---:|---:|
| Combo | 11,545,411 | `38.37` |
| Retail | 13,507,069 | `44.89` |
| Mixed | 5,034,040 | `16.73` |

Sample revenue totals 30,086,520. The displayed percentages total 99.99 due to rounding. In the workbook these percentage entries are stored as text strings, unlike several other numeric percentage fields.

The relationship between this revenue subset and overview revenue of 57,671,416 is not defined. It may represent only the 247 classified orders or another subset, but that cannot be asserted from the supplied logic.

### 5.9 Product performance by product type

**Status:** Supported provisionally; classification logic requires business confirmation.

Dimensions and measures:

- `product_type`: Combo or Retail
- `item_id`
- `item_name`
- `model_name` in sample data where present
- `total_quantity_sold`
- `total_orders` as distinct orders
- `product_sales`
- `product_rank` in query logic

The supplied query:

1. Deduplicates orders.
2. Excludes rows with a nonblank cancellation reason.
3. Expands `item_list` as JSONB.
4. Parses array positions using `split_part`.
5. Classifies an item as Combo when item or model name contains `combo`, `set`, or `bộ`; otherwise Retail.
6. Excludes zero/nonpositive price and quantity, described as excluding gifts without revenue.
7. Aggregates and ranks products within type, returning the top ten.

#### Classification risks

- Keyword classification can produce false positives/negatives and depends on Vietnamese/English naming consistency.
- The fallback is Retail, even when the type is genuinely unknown.
- Parsed JSON array positions and `": "` delimiters are schema-fragile.
- Product grouping uses item ID and item name; model variants may be combined or separated differently than the sample presentation implies.
- Query validity filtering does not exclude cancellation-status variants unless a cancellation reason is also present.

### 5.10 Product pair recommendations

**Status:** Supported provisionally.

Dimensions and measure:

- Item 1 ID and name
- Item 2 ID and name
- `orders_bought_together`

The supplied SQL builds unique within-order item pairs and returns the top five by distinct co-purchased order count.

Important interpretation: this is co-purchase frequency only. The source supplies no support, confidence, lift, expected incremental revenue, or causal recommendation score. UI copy must not imply those metrics.

### 5.11 Customer Journey Sankey and trend

**Status:** Unsupported by the workbook; HTML mock data remains usable for frontend prototyping only.

The HTML prototype contains hardcoded stages and values for:

- Source: Threads, Instagram, Facebook, YouTube, Google
- Platform: TikTok Shop, Lazada, Shopee
- Content: Video, Shop Tab, Product Card, Livestream, Affiliate, Ads
- Product View
- Add to Cart
- Order
- Result: Cancel and Complete
- Post-purchase: Buy Again, Bad Review, Good Review, Return
- Stage conversion summaries
- Transition drop-off summaries
- Largest-drop-off insight text
- Conversion-rate and drop-off-rate trend series

None of those node totals, links, percentages, comparisons, or trend points are supplied by `mapping data.xlsx`. They may be retained as explicitly marked mock fixtures to reproduce the Sankey behavior and presentation, but they must never be treated as production analytics.

### Minimum missing production contract for Customer Journey

At minimum, production journey data needs approved definitions and fields for:

- Cohort/session/customer/order identifier
- Event/stage name
- Event timestamp and timezone
- Source, platform, and content attribution
- Product-view, add-to-cart, order-created, and order-completed events
- Cancellation, repeat purchase, review sentiment, and return events where those stages remain in scope
- Node counts and source-target link counts, or event rows from which they can be derived
- Transition conversion/drop-off formulas
- Comparison period and percentage-point change rules
- Trend grain and numerator/denominator definitions
- Attribution window, multi-touch behavior, deduplication, and identity-resolution rules

## 6. Cross-source inconsistency register

| ID | Area | Evidence | Impact | Required decision/action |
|---|---|---|---|---|
| D-01 | Date label | Sheet says `01/05/2026 - 18/05/2026`; most SQL uses an exclusive upper bound at 18 May. | Users may read 18 May as included when it is excluded. | Standardize API fields as `startInclusive` and `endExclusive`, then format the displayed period explicitly. |
| D-02 | Mixed time fields | Several queries use `create_time` for the lower bound and `update_time` for the upper bound. | Orders can enter/leave cohorts based on update timing. | Choose the event timestamp for reporting-period membership; use `update_time` only for latest-record selection unless business logic says otherwise. |
| D-03 | Cancellation period | Cancellation SQL uses late July/early August while samples and most SQL use May. | Sample and query cannot be assumed to reconcile. | Parameterize all dates and regenerate aligned fixtures. |
| D-04 | Valid order | Overview checks cancellation reason; other queries also check status. | KPI totals can disagree with section totals. | Define one reusable canonical valid-order rule. |
| D-05 | Customer label | Sheet says “Customer Return Rate”; SQL calculates repeat purchasers. | Metric can be materially misinterpreted. | Confirm and rename or replace the formula. |
| D-06 | New customer | “Full history” comment conflicts with period-limited first-order calculation. | Existing customers may be counted as new. | Calculate first order from approved historical scope. |
| D-07 | Daily customer grain | Customer counts are distinct customer-day records, while overview counts distinct customers over the whole period. | Summing daily customers can exceed period-level customers. | Document grains and prevent inappropriate aggregation. |
| D-08 | Time slots | Six slots have unequal durations (6/3/3/3/3/6 hours). | Raw totals can visually overstate longer slots. | Preserve source totals, disclose slot duration, and add normalized intensity only if later approved as a separate metric. |
| D-09 | Timezone | No timezone conversion is defined before date/hour extraction. | Day and slot assignment may be wrong. | Set business timezone in the data contract/query. |
| D-10 | Percentage representation | Percentages appear as numeric percentage points, formula results multiplied by 100, and text strings. | Formatting can multiply values again or prevent numeric sorting. | Normalize API percentages consistently and document whether values are ratios or percentage points. |
| D-11 | Currency | Amounts have no currency code. | UI cannot safely add a currency symbol. | Add ISO currency code or approved store currency to responses. |
| D-12 | Shopping composition | Sample count/revenue exists without SQL/business logic for Mixed orders. | Production result cannot be reproduced. | Supply order-level classification query and scope. |
| D-13 | Revenue reconciliation | Shopping composition revenue is 30,086,520 vs overview revenue 57,671,416. | Sections may appear contradictory. | Define subset/exclusions and provide a reconciliation. |
| D-14 | Weekday query | Weekday sample totals exist; SQL is missing. | Frontend would depend on fixture-only data. | Add production query or formally derive from the approved heatmap result. |
| D-15 | Cancellation reconciliation | Sample cancellation counts total 106; denominator is not explicitly materialized with reason data. | Cancellation rate and reason table cannot be directly audited together. | Return total created and cancelled orders alongside reason breakdown. |
| D-16 | Product typing | Keyword rules classify unknowns as Retail. | Product mix may be biased. | Confirm rule or provide a maintained product-type mapping. |
| D-17 | HTML data | Journey HTML values have no workbook source. | Prototype numbers could be mistaken for real KPIs. | Keep them in mock fixtures with prominent nonproduction labeling; block production population until a journey source exists. |

## 7. Percentage and numeric formatting contract

### Current observations

- Overview rate samples use values such as `77.38` and `16.67`, meaning percentage points.
- Customer revenue contribution uses `97.82` and `2.18`, also percentage points.
- Shopping count shares are formula-derived as `count / total * 100`.
- Shopping revenue shares are text values such as `"38.37"`.
- Revenue and monetary totals have no currency metadata.

### Provisional frontend normalization

For mock adapters only, parse numeric strings and normalize every percent to a consistent internal representation. The production API must choose one convention:

- preferred: ratio (`0.7738`) plus UI formatting as `77.38%`; or
- percentage points (`77.38`) with explicit schema naming such as `...Percent`.

Do not infer the convention from magnitude on a field-by-field basis. Store count, amount, ratio, percentage, date, timestamp, and identifier as distinct types.

## 8. Date and time contract

Production responses should include:

- `startInclusive`
- `endExclusive`
- `timezone`
- optional human-readable label derived from those fields

All section queries should receive the same parameters. Date membership should use the approved business event timestamp. `update_time` should remain the record-version ordering field unless explicitly adopted for another business purpose.

Mock fixtures may retain the May 2026 period, but should encode it as:

```json
{
  "startInclusive": "2026-05-01T00:00:00",
  "endExclusive": "2026-05-18T00:00:00",
  "timezone": null,
  "status": "prototype-only"
}
```

`timezone: null` is deliberate: the source does not state one. The current workspace timezone must not silently become the business-data timezone.

## 9. Customer definition contract

The current workbook uses `buyer_user_id` as the customer key. Production requires decisions on:

- Whether IDs are stable across channels/platforms
- Whether customer identity is scoped by `user_email`/store
- Whether guest or missing IDs are excluded (current customer queries exclude null IDs)
- Whether repeat/new status uses all-time history or a bounded lookback
- Whether cancelled orders count as acquisition/purchase events (current customer logic uses valid orders)
- Whether daily new/existing counts count distinct customers or orders (current SQL counts distinct customer-day records)

Until resolved, the frontend may display workbook fixtures but must not calculate customer classifications locally.

## 10. Mock/sample data policy

Workbook and HTML samples remain useful for frontend prototyping under these rules:

1. Store them as fixtures separate from production API adapters.
2. Mark fixture payloads with `dataStatus: "mock"` or equivalent.
3. Show a visible mock-data indicator in nonproduction builds.
4. Preserve original values for visual regression and interaction testing.
5. Do not manufacture missing fields to make datasets look complete.
6. Use `null`/unsupported states for missing currency, timezone, comparison period, or journey definitions.
7. Do not use HTML Sankey values to validate workbook KPIs.
8. Do not promote a fixture-derived calculation into business logic without approval.

## 11. Provisional section data contracts

These names organize existing facts; they do not mandate dashboard layout or chart type.

```text
OverviewMetrics
CustomerTypeDailyPoint
CustomerRevenueContribution
PurchaseTimeSlotTotal
WeekdayOrderTotal
CancellationReasonMetric
ShoppingCompositionMetric
ProductPerformanceRow
ProductPairRow
JourneyNode                # mock-only until production source exists
JourneyLink                # mock-only until production source exists
JourneyTransition          # mock-only until production source exists
JourneyTrendPoint          # mock-only until production source exists
```

Every production response should carry enough metadata to identify period, timezone, account/store, units, and data freshness.

## 12. Nonbinding frontend notes

The following are implementation aids only and are not UI requirements:

- Mock adapters can translate workbook samples into the provisional contracts above.
- Production adapters should normalize source types without redefining business metrics.
- Calculation logic should remain in SQL/backend data services, not in chart components.
- The Customer Journey React implementation should preserve the HTML reference’s Sankey behavior, animation, interactions, drop-off emphasis, and trend presentation while replacing hardcoded values with props.
- Overall section arrangement, card structure, chart placement, and visual hierarchy must follow the separate existing dashboard visual reference.

## 13. Production readiness gates

Before implementation is connected to production data:

- Parameterize account/store, start time, end time, and timezone.
- Approve a canonical valid-order/cancelled-order definition.
- Correct the new-versus-existing customer historical lookup.
- Resolve `create_time` versus `update_time` boundary use.
- Align cancellation periods with global filters.
- Normalize percentage types.
- Provide currency metadata.
- Supply missing weekday and shopping-composition logic.
- Reconcile overview, cancellation, shopping-composition, and product-level totals.
- Supply and approve a production Customer Journey event contract.

No application implementation is included in this document.
