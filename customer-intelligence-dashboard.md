# Customer Intelligence

Current-state documentation for the implemented Customer Intelligence dashboard. The repository source and local TypeScript fixtures are the source of truth for this document.

The page currently contains:

- A centered **Customer Intelligence** heading
- A display-only date-range pill: **01/05/2026 – 17/05/2026**
- **Consolidate Recommendations**
- **01. Customer Segmentation**
- **02. Purchase Timing**
- **03. Product Type Sold**
- **04. Customer Journey**

## Dashboard Structure

```text
Customer Intelligence
│
├── Date Range (display-only)
│
├── Consolidate Recommendations
│   ├── Conversion
│   ├── Retention
│   ├── Purchase Timing
│   └── Shopping Behavior
│
├── Customer Analysis
│   ├── 01. Customer Segmentation
│   ├── 02. Purchase Timing
│   └── 03. Product Type Sold
│
└── 04. Customer Journey
    ├── Conversion Rate cards
    ├── Custom SVG Sankey
    └── Drop-off Rate cards
```

## Interaction Model

| Input | Current use |
|---|---|
| Hover/focus | Inspect analytical details, focus chart marks, show heatmap or Sankey detail, compare journey periods, and subtly focus a major dashboard part. |
| Click | Change segmented toggles, expand/collapse recommendation details, or activate explicit buttons. |
| Touch | Tap heatmap cells, donut slices, journey nodes, or comparison arrows to retain the equivalent analytical detail. |
| Keyboard | Focus states are visible. Enter/Space activate toggles and selectable chart marks where implemented. |

Analytical popovers share a small event coordinator: opening one section's analytical detail closes details owned by the other analytical sections.

### Current exceptions

- The date range is a styled `<div>`, not an interactive date picker.
- Customer Segmentation legend definitions are hover/focus driven and use a default cursor; click is not required.
- Product Type Sold legend rows are static. Only donut slices expose metric detail.
- Desktop Customer Journey nodes use hover/focus for inspection. Persistent selection is available through touch and keyboard, not ordinary desktop click.

## Major-Part Focus

The page groups content into three focusable visual parts:

1. Consolidate Recommendations
2. Customer Segmentation + Purchase Timing + Product Type Sold
3. Customer Journey

Hovering a part, or moving keyboard focus inside it, applies a subtle `1.01` scale at the small breakpoint and above plus a slight brightness increase. The transition lasts 220 ms. Leaving the part restores the default presentation.

## Date Range

### Purpose

Shows the sample reporting period used by date-aware section services.

### Metrics / Data

Start date, end date, and their formatted display value.

### Visualization

A left-aligned light-gray pill with a Lucide calendar icon.

### Interaction

None in the current implementation. The provider exposes `setDateRange`, but the rendered pill does not call it. Of the currently visible sections, Purchase Timing receives the date range through its data service.

### Current Mock Data

- Start: `2026-05-01`
- End: `2026-05-17`
- Display: `01/05/2026 – 17/05/2026`

## Consolidate Recommendations

### Purpose

Presents four action-oriented decisions before the analytical sections.

### Metrics / Data

Recommendations are generated from the current Journey, Segmentation, Purchase Timing, and Product Type fixtures.

| Category | Current recommendation | Highlighted signals |
|---|---|---|
| Conversion | Review content placement, product links, CTAs, offers, and landing experience for **Content → Product View**. This step has the highest current drop-off at **79.9%** and worsened by **1.8 pp** versus last week. | Action phrase, `Content → Product View`, `79.9%`, `1.8 pp` |
| Retention | Test targeted incentives and repurchase reminders for **Dormant and At Risk customers**. Together, these segments represent **194 customers (39.8%)** and contribute **41.6%** of revenue. | Action phrase, target segments, `41.6%` |
| Purchase Timing | Prioritize campaigns, vouchers, and promotional activity during **Wednesday and Friday · 00:00 - 05:59**. This window reaches the heatmap's joint peak of **30 orders each**. | Action phrase and peak window |
| Shopping Behavior | Prioritize visibility and conversion tests for **Single-item offers**. Single-item purchases lead the current mix with **55.5%** of orders and **44.9%** of revenue. | Action phrase and dominant product type |

### Visualization

Four white recommendation cards with left-aligned outlined category badges. Recommendation paragraphs are justified; selected action, risk, and opportunity phrases use blue, coral, and teal emphasis.

### Interaction

- **More details** is click-based.
- Expansion uses an animated height/opacity disclosure.
- Only one card can be expanded at a time.
- Clicking the open card's **Hide details** control collapses it.

### Current Mock Data

#### Expanded signals

| Category | Signals shown after expansion |
|---|---|
| Conversion | Conversion Rate `20.1%`; Drop-off Rate `79.9%`; WoW Change `↑ 1.8 pp` |
| Retention | Customer Segments `Dormant and At Risk`; Customers `194 customers · 39.8%`; Revenue Contribution `41.6%` |
| Purchase Timing | Peak Day `Wednesday and Friday`; Peak Time Slot `00:00 - 05:59`; Peak Orders `30 orders each` |
| Shopping Behavior | Dominant Type `Single-item`; Order Share `55.5%`; Revenue Contribution `44.9%` |

## 01. Customer Segmentation

### Purpose

Groups customers by purchasing behavior and contribution value to support retention and growth decisions.

### Metrics / Data

- Customer count and customer share
- Revenue and revenue contribution share
- Total customers: **488**
- Total revenue: **57,671,416 ₫**

### Visualization

A custom SVG donut with a center metric, external percentage labels for shares of at least 5%, and a color-key legend. Both metric modes use the shared `outerRadius: 82` and `innerRadius: 54` geometry.

### Interaction

- **Customer Count / Revenue Contribution** is a click-based segmented toggle.
- Hovering or focusing a donut slice fades unrelated slices and shows that segment's current count or revenue plus share in the center.
- On touch, tapping a slice retains the detail; tapping the selected slice or empty donut space clears it. Enter/Space provides the same selection behavior.
- Hovering or focusing a legend item simultaneously focuses the matching donut slice, emphasizes the legend row, and shows its short definition in a floating panel to the **right** of the legend.
- The legend definition appears immediately and hides after 150 ms. Moving between legend items updates the same popover.
- Hovering a donut slice does not open the legend definition.

### Current Mock Data

| Display label | Customers | Customer share | Revenue | Revenue share |
|---|---:|---:|---:|---:|
| Dormant | 192 | 39.34% | 22,872,121 ₫ | 39.66% |
| New | 179 | 36.68% | 18,368,331 ₫ | 31.85% |
| Regular | 98 | 20.08% | 11,159,748 ₫ | 19.35% |
| Potential | 16 | 3.28% | 3,269,197 ₫ | 5.67% |
| At Risk | 2 | 0.41% | 1,113,299 ₫ | 1.93% |
| VIP | 1 | 0.20% | 888,720 ₫ | 1.54% |

`Loyal` is defined in the display configuration but is not present in the current six-row fixture, so it is not rendered.

### Segment Definitions

| Segment | Definition |
|---|---|
| Dormant | Inactive customers who purchased infrequently in the past. |
| New | Recent first-time customers who have made their first purchase. |
| Regular | Customers with typical, ongoing purchasing behavior. |
| Potential | Recent repeat customers with potential to become loyal. |
| At Risk | Previously active customers who have not purchased recently. |
| VIP | Recent, frequent, and high-value customers. |
| Loyal | Frequent customers who continue to purchase regularly. |

The definitions contain no visible RFM formula or scoring criteria. The card's current bottom insight reads: **Potential Loyalists represent 3.3% of customers but contribute 5.7% of revenue.**

## 02. Purchase Timing

### Purpose

Shows when customers are most likely to place orders.

### Metrics / Data

The displayed metric is **order count** for each weekday × time-slot cell. Revenue is not displayed and does not affect cell intensity.

### Visualization

A 7 × 6 CSS-grid heatmap. Cell intensity scales linearly against the highest order count in the current grid (`30`). Missing combinations would render as dashed unavailable cells; the current fixture supplies the complete grid and declares omitted combinations to mean zero.

### Interaction

- Hover/focus subtly outlines and brightens a cell.
- The floating tooltip shows only `Day · Time Slot` and `N Orders`.
- The tooltip flips above/below and left/center/right according to cell position.
- Hover detail hides after 180 ms.
- Touch tap and Enter/Space retain a cell detail; tapping outside or pressing Escape clears it.

### Current Mock Data

| Day | 00:00–05:59 | 06:00–08:59 | 09:00–11:59 | 12:00–14:59 | 15:00–17:59 | 18:00–23:59 | Day total* |
|---|---:|---:|---:|---:|---:|---:|---:|
| Monday | 22 | 7 | 10 | 7 | 12 | 10 | 68 |
| Tuesday | 26 | 14 | 10 | 17 | 11 | 11 | 89 |
| Wednesday | 30 | 25 | 6 | 10 | 11 | 5 | 87 |
| Thursday | 22 | 7 | 9 | 13 | 5 | 8 | 64 |
| Friday | 30 | 15 | 10 | 15 | 4 | 6 | 80 |
| Saturday | 19 | 10 | 6 | 11 | 12 | 7 | 65 |
| Sunday | 24 | 10 | 19 | 8 | 11 | 5 | 77 |

\*Day totals exist in the adapted fixture but are not rendered as a separate chart or toggle in the current section.

## 03. Product Type Sold

### Purpose

Shows the composition of product types sold by order share or revenue contribution.

### Metrics / Data

Order count, order share, revenue, and revenue share for each product type.

### Visualization

A custom SVG donut using the same geometry as Customer Segmentation. The chart includes external percentage labels, a center detail, and a three-row static legend.

### Interaction

- **Order Share / Revenue** is a click-based segmented toggle. Changing it fades the chart content in over 180 ms.
- Hover/focus on a donut slice fades unrelated slices and replaces the center summary with the selected type's order count or revenue plus share.
- Touch tap and Enter/Space retain a slice detail; tapping the selected slice or empty donut space clears it.
- The legend currently has **no hover or click handler** and does not focus the donut.
- There is no separate floating tooltip; the donut center is the metric-detail surface.

### Current Mock Data

| Display label | Orders | Order share | Revenue | Revenue share |
|---|---:|---:|---:|---:|
| Combo | 80 | 32.4% | 11,545,411 ₫ | 38.4% |
| Single-item | 137 | 55.5% | 13,507,069 ₫ | 44.9% |
| Mixed | 30 | 12.1% | 5,034,040 ₫ | 16.7% |

## 04. Customer Journey

### Purpose

Shows where traffic converts or drops off across the customer journey and exposes source-level detail for each visible node.

### Metrics / Data

- Node volume
- Link flow value and proportional thickness
- Five current conversion rates
- Five complementary drop-off rates
- Demo week-over-week percentage-point comparisons
- External-source distribution, incoming conversion, order-result rate, and post-purchase detail in node tooltips

### Visualization

A custom declarative SVG Sankey with `viewBox="0 0 1820 440"`. Node bars and ribbons use one global linear scale; a `0.45` minimum render size protects extremely small flows. Ribbons use source-to-target gradients. Permanent percentage labels are not rendered on paths.

The visible stages are:

```text
Marketplace
→ Content / Entry Driver
→ Product View
→ Add to Cart → Order
                 ↑
  Product View ──┘
→ Order Result (Complete / Cancel / Processing)
```

`EXTERNAL SOURCE` and `POST-PURCHASE` remain in the fixture but are intentionally hidden from the main Sankey. They support Marketplace and Complete hover details.

### Current Mock Data

#### Visible node volumes

| Stage | Nodes and displayed volumes |
|---|---|
| Marketplace | Shopee `110,000`; TikTok Shop `60,000`; Lazada `14,500` |
| Content / Entry Driver | Ads `79,000`; Affiliate `23,000`; Livestream `15,000`; Video `22,000`; Product Card `4,000`; Shop Tab `15,000` |
| Product View | Product View `31,700` |
| Add to Cart | Add to Cart `8,350` |
| Order | Order `11,900` |
| Order Result | Complete `10,380`; Cancel `2,380`; Processing `360` |

Node volume is `max(total incoming, total outgoing)`. This is why **Complete displays 10,380**: its outgoing post-purchase signals total 10,380, while the incoming `Order → Complete` flow is 9,150.

#### Visible paths

| From | To and flow value |
|---|---|
| Shopee | Ads `70,000`; Affiliate `18,000`; Livestream `12,000`; Video `10,000` |
| Lazada | Ads `9,000` |
| TikTok Shop | Affiliate `5,000`; Livestream `3,000`; Product Card `4,000`; Shop Tab `15,000`; Video `12,000` |
| Ads | Product View `10,000` |
| Affiliate | Product View `8,000` |
| Livestream | Product View `8,000` |
| Product Card | Product View `1,900` |
| Shop Tab | Product View `2,000` |
| Video | Product View `1,800` |
| Product View | Add to Cart `8,350`; Order `7,580` |
| Add to Cart | Order `4,320` |
| Order | Complete `9,150`; Cancel `2,380`; Processing `360` |

#### Conversion and drop-off cards

| Step | Conversion | Previous | Conversion change | Drop-off | Previous | Drop-off change |
|---|---:|---:|---:|---:|---:|---:|
| Platform → Content | 85.6% | 82.4% | ↑ 3.2 pp | 14.4% | 17.6% | ↓ 3.2 pp |
| Content → Product View | 20.1% | 21.9% | ↓ 1.8 pp | **79.9%** | 78.1% | ↑ 1.8 pp |
| Product View → Add to Cart | 26.3% | 23.9% | ↑ 2.4 pp | 73.7% | 76.1% | ↓ 2.4 pp |
| Add to Cart → Order | 51.7% | 52.6% | ↓ 0.9 pp | 48.3% | 47.4% | ↑ 0.9 pp |
| Order → Complete | 76.9% | 75.3% | ↑ 1.6 pp | 23.1% | 24.7% | ↓ 1.6 pp |

The **Content → Product View** drop-off card carries the current **Biggest drop-off** indicator. The previous-period values are derived from demo-only conversion changes; the current rates come from Journey fixture values.

Hover/focus on a trend arrow opens a compact comparison tooltip with Current, Previous, and Change. It hides after 180 ms; touch tap toggles it.

### Node Hover Details

| Node type | Current tooltip calculation |
|---|---|
| Marketplace | External-source value ÷ total external traffic entering that marketplace. |
| Content | Platform → Content link value ÷ the source platform's displayed node value. |
| Product View | Content → Product View link value ÷ the source content node value. |
| Add to Cart | `8,350 ÷ 31,700 = 26.3%`. |
| Order | `Product View → Order: 7,580 ÷ 31,700 = 23.9%`; `Add to Cart → Order: 4,320 ÷ 8,350 = 51.7%`. |
| Complete | `Order → Complete: 9,150 ÷ 11,900 = 76.9%`; also shows post-purchase flows divided by the displayed Complete node value (`10,380`). |
| Cancel | `2,380 ÷ 11,900 = 20.0%`. |
| Processing | `360 ÷ 11,900 = 3.0%`. |

#### Marketplace external-source breakdown

| Source | Shopee | Lazada | TikTok Shop |
|---|---:|---:|---:|
| Google | 29.1% | 0.0% | 13.3% |
| YouTube | 21.8% | 27.6% | 30.0% |
| Facebook | 25.5% | 37.9% | 20.0% |
| Instagram | 16.4% | 24.1% | 26.7% |
| Threads | 7.3% | 10.3% | 10.0% |

#### Content → Product View conversion detail

| Content | Product Views | Current tooltip rate |
|---|---:|---:|
| Ads | 10,000 | 12.7% |
| Affiliate | 8,000 | 34.8% |
| Livestream | 8,000 | 53.3% |
| Product Card | 1,900 | 47.5% |
| Shop Tab | 2,000 | 13.3% |
| Video | 1,800 | 8.2% |

#### Complete post-purchase detail

| Signal | Flow | Current tooltip rate (`flow ÷ 10,380`) |
|---|---:|---:|
| Good Review | 7,450 | 71.8% |
| Bad Review | 1,560 | 15.0% |
| Buy Again | 1,250 | 12.0% |
| Return | 120 | 1.2% |

### Interaction

- Hover/focus opens an anchored, collision-aware node tooltip and highlights the recursively connected upstream and downstream path through that node.
- Unrelated nodes fade to `0.14`; unrelated links fade to `0.035`.
- Desktop mouse leave schedules tooltip/path cleanup after 200 ms, allowing movement into the tooltip without flicker.
- Touch tap or keyboard Enter/Space persistently selects a node. A **Reset** control appears, and tapping empty space/outside clears the selection.
- Animated particles move along link centerlines. Each link gets one to three particles based on thickness and a 5–8 second duration. Unrelated particles disappear while a path is active.
- `prefers-reduced-motion` prevents particles from rendering and globally reduces transition/animation durations.

## Technical Implementation

### Stack

| Area | Current implementation |
|---|---|
| Framework | Next.js `16.3.0`, React `19.2.8`, TypeScript `6.0.2` |
| Styling | Tailwind CSS `4.3.3` plus `app/globals.css` tokens |
| Charts | Custom SVG donuts, CSS-grid heatmap, and custom proportional SVG Sankey |
| Motion | Framer Motion `13.1.0` for recommendation disclosures and Product Type mode fades |
| Icons | Lucide React `1.31.0` for the calendar icon |
| Installed but not used by current rendered charts | D3, d3-sankey, ECharts, and echarts-for-react |
| Package manager | pnpm (`pnpm-lock.yaml`) |

### Main Source Files

- `components/dashboard/DashboardPage.tsx` — page composition and major-part focus
- `components/dashboard/DashboardHeader.tsx` — title and date pill
- `components/dashboard/RecommendationsSection.tsx`
- `components/dashboard/CustomerSegmentationSection.tsx`
- `components/dashboard/PurchaseTimingSection.tsx`
- `components/dashboard/ShoppingTrendsSection.tsx` — Product Type Sold
- `components/dashboard/CustomerJourneySection.tsx`
- `components/ui/SegmentedControl.tsx`
- `components/ui/Disclosure.tsx`
- `components/ui/DonutPercentageLabels.tsx`
- `app/globals.css` — global tokens, typography, page background, and reduced-motion rules
- `lib/interaction/analytical-tooltip.ts` — cross-section analytical-detail coordination
- `lib/journey/graph.ts` — recursive upstream/downstream traversal
- `lib/journey/layout.ts` — proportional node/ribbon geometry

### Current Data and Mock Files

- `data/fixtures/customer-segmentation-workbook.fixture.ts`
- `data/definitions/customer-segment-definitions.ts`
- `data/fixtures/section02-workbook.fixture.ts`
- `data/fixtures/shopping-composition.fixture.ts`
- `data/fixtures/journey.fixture.ts`
- `data/fixtures/journey-comparison.fixture.ts`
- `data/recommendations/recommendation-engine.ts`

The displayed segmentation and Purchase Timing fixtures identify `mapping data.xlsx` ranges in source comments. Journey data is a local TypeScript extraction of `MOCK DATA.xlsx`. The browser does not read either workbook at runtime.

`NEXT_PUBLIC_DASHBOARD_DATA_MODE` defaults to `mock`. Purchase Timing has a production service boundary, but the currently rendered mock mode uses the local fixture. Segmentation, Product Type, Journey, and Recommendations directly consume local fixture/generated data in their current components.

Node, comparison, heatmap, segmentation-definition, and donut details are declarative React elements. Anchored Journey and Segmentation popovers measure their trigger and container bounds; Purchase Timing uses cell-relative placement. `lib/interaction/analytical-tooltip.ts` ensures only one analytical section owns an open detail at a time.

### Styling and Responsive Rules

- Page canvas token: `--page: #e6e8ec`
- Main width: `min(94vw, 1600px)`
- Standard cards: white, 1 px `#dedede` border, 16 px radius
- Recommendations: 1 column by default, 2 at `md`, 4 at `xl`
- Customer Analysis: 1 column by default, 2 at 900 px, 3 at 1420 px
- Analytical cards: 430 px desktop height at 900 px and above
- Donut/legend layouts stack below 560 px where applicable
- Journey comparison cards: 2 columns by default, 3 at a 600 px container, 5 at a 1000 px container
- Sankey SVG scales to the available width while preserving its viewBox aspect ratio

### Build

```bash
pnpm build
```

This runs `next build --webpack`.
