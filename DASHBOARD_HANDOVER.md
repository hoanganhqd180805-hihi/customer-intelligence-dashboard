# Customer Intelligence Dashboard — Project Handover

Last audited: 2026-08-24 (Asia/Ho_Chi_Minh)

This document describes the current local implementation in this repository. It is intended to let a new ChatGPT/Codex conversation continue work without access to the prior conversation.

Current authority order:

1. Current runtime imports and components determine what is active in the dashboard.
2. `mapping data.xlsx` is the source for the currently displayed Customer Overview fixtures and the reference for customer/business logic.
3. `MOCK DATA.xlsx` is the source of truth for Customer Journey mock values.
4. The active TypeScript fixtures are deployment-ready extractions of the workbooks; the browser does not read `.xlsx` files at runtime.
5. Older specifications, exported Markdown, the standalone HTML dashboard, screenshots, and historical components must not be treated as the current runtime when they conflict with the imports from `app/page.tsx`.

## 1. Project Overview

### Project

- Package name: `customer-intelligence-dashboard`
- Product title: **Customer Intelligence**
- Purpose: a customer analytics prototype focused on customer acquisition/return behavior, customer segmentation, and a mock-data Customer Journey funnel.
- Current active sections: **01. Customer Overview** and **02. Customer Journey** only.

### Technology stack

- Next.js 16 App Router
- React 19
- TypeScript 6 with strict mode
- Tailwind CSS 4 through `@tailwindcss/postcss`
- D3 utilities for the custom New vs Returning path generation
- Custom SVG for the Customer Segmentation donut and Customer Journey Sankey
- Framer Motion for the small Customer Segmentation definition-popover entrance only
- Lucide React icons
- Vitest + jsdom for contract/unit tests
- ESLint 9 with Next.js Core Web Vitals and TypeScript rules
- pnpm lockfile/workspace; use **pnpm** as the package manager

`echarts`, `echarts-for-react`, and `d3-sankey` remain installed but are not used by the two currently rendered sections. Customer Journey deliberately uses the custom SVG layout, not `d3-sankey` or ECharts Sankey.

### Main entry points

```text
app/layout.tsx
└── app/page.tsx
    └── components/dashboard/DashboardPage.tsx
        ├── components/dashboard/DashboardHeader.tsx
        ├── components/dashboard/CustomerSegmentationSection.tsx
        └── components/dashboard/CustomerJourneySection.tsx
```

`DashboardPage.tsx` is the definitive section-order source. Do not infer active sections from stale documentation or the standalone export.

### Important folders

| Folder                  | Current responsibility                                                              |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `app/`                  | App Router entry point, root layout, and global styles.                             |
| `components/dashboard/` | The two active dashboard sections and page shell.                                   |
| `components/ui/`        | Shared cards, date control, segmented control, tag multi-select, and donut helpers. |
| `data/fixtures/`        | Local TypeScript data extracted from workbooks plus legacy fixtures.                |
| `data/adapters/`        | Workbook/raw-data normalization and validation.                                     |
| `data/contracts/`       | Shared TypeScript dashboard contracts.                                              |
| `data/definitions/`     | Customer segment display mapping and descriptive definitions.                       |
| `lib/journey/`          | Pure Customer Journey graph traversal and custom proportional SVG layout.           |
| `lib/interaction/`      | Cross-section analytical-tooltip coordination.                                      |
| `tests/contracts/`      | Data, sampling, graph, and layout contract tests.                                   |
| `standalone-dashboard/` | Historical static export; not part of the active Next.js runtime.                   |

### Local commands

```bash
pnpm install
pnpm dev
```

Default local URL: `http://localhost:3000/`

Validation commands:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

`package.json` does not define a `typecheck` script, so use `pnpm exec tsc --noEmit`. The production build script is `next build --webpack`.

### Environment variables

The current two-section local-fixture runtime requires no environment variables. `.env.example` documents older/future service boundaries:

- `NEXT_PUBLIC_DASHBOARD_DATA_MODE`
- `NEXT_PUBLIC_OVERVIEW_API_URL`
- `NEXT_PUBLIC_CUSTOMER_TYPE_API_URL`
- `NEXT_PUBLIC_PURCHASE_TIME_API_URL`

Those service files are not imported by the current `DashboardPage`. Do not assume they affect the visible page without tracing imports again.

### Repository and deployment

- GitHub remote: `https://github.com/hoanganhqd180805-hihi/customer-intelligence-dashboard.git`
- Production branch: `main`
- Current audited local HEAD: `bf19e258aaaaaecf0ce5ecb78b6534b01b78bcd0`
- At audit time, `HEAD` and `origin/main` match, but the current dashboard changes are uncommitted; therefore the current local UI is newer than GitHub/Vercel.
- The established deployment workflow uses the existing Vercel project's GitHub integration and deploys pushes to `main`.
- No local `.vercel/project.json`, Vercel project name, or Production URL is present in the repository. Verify those values in the existing Vercel project before manual CLI deployment. Do not create a second Vercel project.

## 2. Current Dashboard Structure

The active page order is:

```text
Customer Intelligence

01. Customer Overview
    [Date range] [Platform multi-select]
    [New vs Returning Customers — 2/3 width]
    [Customer Segmentation — 1/3 width]

02. Customer Journey
    [Independent date range]
    [Five Conversion Rate cards]
    [Custom proportional Sankey]
    [Five Drop-off Rate cards]
```

Layout notes:

- Main container: `width: min(94vw, 1600px)` with centered margins.
- Sections are stacked with a 40 px-equivalent Tailwind gap (`space-y-10`).
- Customer Overview stacks on smaller screens and switches to a `2fr / 1fr` desktop grid at 1280 px.
- Customer Journey is full width.
- Each major section is wrapped in `DashboardPart`, which applies a subtle `scale(1.01)` and brightness increase during mouse hover or focus-within. This is a visual focus treatment, not chart zoom/pan.
- The page-level background is `--page: #e6e8ec`; normal cards are white; Customer Journey uses its dark navy gradient card.

## 3. Section 01 — Customer Overview

### Purpose

Customer Overview combines daily acquisition/return behavior with a snapshot of customer distribution and revenue contribution by segment.

### Active component

`components/dashboard/CustomerSegmentationSection.tsx` exports `CustomerSegmentationSection`. The filename reflects an earlier scope, but this component currently renders the entire **01. Customer Overview** section.

### Filter order and independence

The section header renders controls in this order:

1. Date Range
2. Platforms

The Customer Overview date state is local to `CustomerSegmentationSection`. It is not shared with Customer Journey.

### Date Range

- Component: `components/ui/DateRangePill.tsx`
- Current minimum: `2026-05-01`
- Current maximum: `2026-05-17`
- It opens an accessible two-input date dialog.
- It filters New vs Returning rows before point sampling.
- It does **not** currently filter the Customer Segmentation snapshot.

### Platform multi-select

- Component: `components/ui/TagMultiSelect.tsx`
- Options: Shopee, TikTok Shop, Lazada
- Default: all three selected
- Minimum selection: one platform
- Interaction: selected platforms appear as removable tags; the chevron opens an accessible multi-select listbox; clicking outside or pressing Escape closes it.

Important current limitation:

- `CustomerSegmentationSection` supports an optional `platformDatasets` prop.
- `DashboardPage` does not pass `platformDatasets`.
- The fallback `availablePlatforms` array contains only one aggregate entry with id `all`.
- Therefore platform selection currently updates UI state but continues to render the aggregate New/Returning and Segmentation datasets. It is not yet a functioning data filter.
- Do not document or present the current platform selector as platform-filtered analytics until datasets for Shopee, TikTok Shop, and Lazada are supplied and passed in.

### New vs Returning Customers

#### Data source

```text
mapping data.xlsx
Customer journey!A8:C24
→ data/fixtures/customer-segmentation-workbook.fixture.ts
→ adaptNewReturningCustomers()
→ filterNewReturningCustomers()
→ NewReturningChart
```

The fixture contains one row per day from 2026-05-01 through 2026-05-17, including explicit zeroes.

#### Current customer definitions

The frontend does not calculate customer classification. It consumes workbook-extracted `newCustomers` and `returningCustomers` fields.

The SQL reference in `mapping data.xlsx`, sheet `SQL`, describes:

- **New**: the customer's `first_order_date` equals the current `order_date`.
- **Returning**: the customer has activity on the date and the dates are not equal.
- Customers are distinct at customer-day grain before daily counts.
- Cancelled/invalid orders are excluded by the query's current valid-order filters.

Known business-definition issue: the SQL computes `MIN(create_time::date)` after restricting `latest_orders` to the reporting window, despite a comment claiming full-history classification. A customer who purchased before the period can be misclassified as New. Do not reproduce this classification in the browser; resolve the historical scope in the backend/query first.

#### Chart structure

- Custom responsive SVG with fixed height `280` px.
- D3 `line()` + `curveLinear`; connections are straight between sampled points.
- New: `#3B82F6`.
- Returning: `#20A7A1`.
- Both lines, dots, X-axis, and tooltip consume the same canonical `finalChartData` array.
- The Y-axis starts at zero and adds approximately 10% headroom, rounded to a multiple of ten.

#### Date filtering and point sampling

Processing order:

```text
selected range
→ create canonical sampling dates
→ resolve actual source rows for those dates
→ render one shared ordered dataset
```

Sampling rules in `getDailySamplingDates()`:

- 1–14 inclusive days: one day per point.
- 15–20 inclusive days: every two days.
- 21–30 inclusive days: every three days.
- More than 30 days: `ceil(dayCount / 12)` interval.
- Always preserve the selected first and last date.
- Skipped days are not aggregated.
- If a sampled date has no source row, it is omitted rather than invented.
- New and Returning always use the same sampled dates.

#### Interaction and animation

- Hover/focus on a legend entry dims the other series.
- Hover/focus on a date hit area shows a compact New/Returning tooltip.
- Informational legend controls use a default cursor even though they are keyboard-focusable buttons.
- Entrance/replay animation has been removed. Lines and markers render immediately from final data.
- The remaining CSS transition changes opacity during legend focus only; it does not animate data between filters.

### Customer Segmentation

#### Data source

```text
mapping data.xlsx
Customer journey!A140:E145
→ data/fixtures/customer-segmentation-workbook.fixture.ts
→ adaptCustomerSegmentation()
→ SegmentationDonutCard
```

This is a six-row aggregate snapshot. It is not recalculated by the current date or platform controls.

#### Visualization

- Custom SVG donut, not ECharts/Recharts.
- Shared geometry from `components/ui/donutGeometry.ts`:
  - outer radius: 82
  - inner radius: 54
  - ring thickness: 28
  - canvas: 260 × 220
- External percentage labels render only for shares at or above 5%.
- Center content shows total or the active segment's value/share.
- Segmented toggle modes:
  - Customer Count
  - Revenue Contribution
- No entrance or arc-transition animation is used. Only hover stroke-width/opacity transitions remain.

#### Active segments and mapping

| Workbook label   | Display label | Current definition                                              |
| ---------------- | ------------- | --------------------------------------------------------------- |
| `Ngủ đông`       | Dormant       | Inactive customers who purchased infrequently in the past.      |
| `Khách mới`      | New           | Recent first-time customers who have made their first purchase. |
| `Khách thường`   | Regular       | Customers with typical, ongoing purchasing behavior.            |
| `Tiềm năng`      | Potential     | Recent repeat customers with potential to become loyal.         |
| `Nguy cơ rời bỏ` | At Risk       | Previously active customers who have not purchased recently.    |
| `VIP`            | VIP           | Recent, frequent, and high-value customers.                     |

`Loyal` is defined in `customer-segment-definitions.ts` for possible future source labels but is not present in the active six-row fixture and is not rendered.

The current code does not implement RFM thresholds or calculate these segments. It validates and maps workbook-provided labels. The English definitions are descriptive UX copy, not executable business rules.

#### Interaction

- Hover/focus on a donut slice emphasizes it and updates the center metric.
- Touch tap or Enter/Space can persist a slice selection; tapping the selected slice or empty donut area clears it.
- Hover/focus on a legend label focuses the same slice and opens its definition.
- The legend uses normal/default cursor treatment; no question-mark/help cursor.
- `announceAnalyticalTooltip()` closes analytical details in other sections when a new detail opens.

#### Customer Segmentation definition tooltip rule

- Definition appears on hover/focus of the legend label.
- It is an absolutely positioned overlay inside the chart area.
- It is positioned near the label with above/below/right fallbacks and donut-overlap avoidance.
- It must not push the donut, move the legend, change card height, or create layout shift.
- It may overlap nearby legend content when necessary; preserving chart position is more important.
- Current width is capped at 210 px and hide delay is 150 ms.

## 4. Section 02 — Customer Journey

### Purpose

Customer Journey visualizes mock traffic volume and conversion/drop-off behavior across the funnel while allowing users to inspect the sources and paths associated with each node.

### Active visible stages

```text
External Source
→ Platform
→ Content
→ Product View
→ Add to Cart
→ Order
→ Order Result
```

The internal stage array also contains `POST-PURCHASE`, but `CustomerJourneySection.tsx` currently hides that stage and its links from the main SVG. Post-purchase data is still available as the Complete node's secondary detail.

Active nodes discovered from the current dataset:

- External Source: Google, YouTube, Facebook, Instagram, Threads
- Platform: Shopee, TikTok Shop, Lazada
- Content: Ads, Affiliate, Livestream, Video, Product Card, Shop Tab
- Funnel: Product View, Add to Cart, Order
- Order Result: Complete, Cancel, Processing
- Hidden post-purchase detail: Return, Good Review, Bad Review, Buy Again

The Sankey also contains a direct `Product View → Order` route in addition to `Product View → Add to Cart → Order`.

### Independent date control

- Customer Journey owns its own `DateRangePill` state.
- Current bounds: 2026-05-01 through 2026-05-17.
- It is independent from Customer Overview.
- Customer Journey is mock-based and has no date-grained rows. Changing this control currently changes display state only and must not fabricate or rescale journey data.

## 5. Customer Journey Data Source

### Authoritative workbook

- File: `MOCK DATA.xlsx`
- Active sheet: `Sankey Data`
- Current inspected range: `A1:G45`
- Workbook modified at audit time: 2026-08-24 01:17:01 local time

Columns:

| Workbook column | Adapter field        | Meaning                                                                    |
| --------------- | -------------------- | -------------------------------------------------------------------------- |
| `MCOK`          | `stage`              | Sparse source grouping label inherited down until the next nonblank value. |
| `Source`        | `source`             | Source node label.                                                         |
| `Dest`          | `target`             | Target node label.                                                         |
| `Value`         | `value`              | Flow volume.                                                               |
| `Step from`     | `sourceStep`         | Source stage index.                                                        |
| `Step to`       | `targetStep`         | Target stage index.                                                        |
| `Rate`          | `rate` / `rateLabel` | Numeric share/rate or source text such as `Only Tiktok Shop`.              |

There is no `Data Type` column in the current workbook. `RawJourneyWorkbookRow.dataType` remains optional for future input.

### Runtime data pipeline

```text
MOCK DATA.xlsx / Sankey Data
→ manual exact extraction in data/fixtures/journey.fixture.ts
→ RawJourneyWorkbookRow[]
→ adaptJourneyWorkbookRows() in data/adapters/journey.adapter.ts
→ JourneyNodeData[] + JourneyLinkData[]
→ CustomerJourneySection metrics, Sankey, node details, and tooltips
```

The browser does not import or parse `MOCK DATA.xlsx`. When the workbook changes, re-read it from scratch and update `workbookJourneyRows`; do not edit rendered percentages or node labels independently.

### Adapter behavior

- Inherits sparse `MCOK` stage labels.
- Separates same-node/same-step summary rows from graph links so they do not create impossible self-loops.
- Ignores rows with blank source/target, nonfinite value, or value `<= 0`.
- Validates that a normalized node label does not appear at conflicting steps.
- Slugifies labels into stable node IDs.
- Node values:
  - Step 0 uses total outgoing flow.
  - Later steps use total incoming flow when available; otherwise total outgoing flow.
- Link metric semantics:
  - Step 0 → 1: `contribution_share`
  - Step 1 → 2: `distribution_share`
  - Remaining transitions: `conversion_rate`
- Numeric `Rate` becomes `rate`; text `Rate` becomes `rateLabel`.
- The adapter exposes ignored rows, summary rows, flow conflicts, and External Source contribution reconciliation for tests/audit.

Current extraction status:

- 44 source data rows
- 40 active graph links
- 1 ignored zero-value row (`Google → Lazada`)
- 3 same-stage platform summary rows retained for audit but not rendered as self-loops

## 6. Customer Journey Metric Logic

There is no Conversion Rate card for `External Source → Platform`. Those links represent traffic contribution into each platform.

Five supported Conversion Rate cards are rendered when their transitions exist:

| Card                       | Current implementation                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform → Content         | `SUM(Platform → Content link values) / SUM(Platform node values) × 100`                                                                      |
| Content → Product View     | `SUM(Content → Product View link values) / SUM(Content node values) × 100`                                                                   |
| Product View → Add to Cart | Numeric workbook `Rate`; fallback is link value / Product View node value.                                                                   |
| Add to Cart → Order        | Numeric workbook `Rate`; current rate is the `Add to Cart → Order` link value divided by Add to Cart node value, not total Order node value. |
| Order → Complete           | Numeric workbook `Rate`; fallback is Complete link value / Order node value.                                                                 |

Current values from the latest fixture:

| Transition                 | Numerator / denominator |    CVR |
| -------------------------- | ----------------------: | -----: |
| Platform → Content         |         89,500 / 63,000 | 142.1% |
| Content → Product View     |         23,700 / 89,500 |  26.5% |
| Product View → Add to Cart |          8,350 / 23,700 |  35.2% |
| Add to Cart → Order        |           4,320 / 8,350 |  51.7% |
| Order → Complete           |          9,150 / 11,900 |  76.9% |

The direct Product View → Order link remains visible but is intentionally not one of the five cards.

## 7. Drop-off Logic

For every active conversion metric:

```text
Drop-off Rate = 100% - Conversion Rate
```

Drop-off is not stored independently. `deriveJourneyStepMetric()` calculates it from the active CVR.

Current complementary values:

- Platform → Content: -42.1%
- Content → Product View: 73.5%
- Product View → Add to Cart: 64.8%
- Add to Cart → Order: 48.3%
- Order → Complete: 23.1%

`biggestCurrentDropoffRate` is `Math.max()` across active derived drop-offs. The badge is currently assigned to **Content → Product View (73.5%)**. Never hardcode the highlighted step.

The 142.1% Platform → Content rate and negative drop-off are direct consequences of the current workbook volumes. Do not clamp, rebalance, or replace them silently.

## 8. Sankey Geometry and Scaling

### Coordinate system

`lib/journey/layout.ts` defines:

- Width: 1820
- Height: 440
- Margins: top 27, bottom 7, left 150, right 145
- Add to Cart horizontal offset: +32
- Product View / Add to Cart / Order center offsets create the compact two-route triangle.
- The SVG uses `width: 100%`, the returned `viewBox`, and `preserveAspectRatio="xMidYMid meet"`; it scales uniformly with the dashboard width.

### Global linear scale

The layout computes one global `scale` as the minimum of:

- `360 / maxNodeValue`
- each stage's available vertical height divided by that stage's total node value after stage gaps

Then:

- `node.h = max(0.45, node.value × scale)`
- `node.y0` and `node.y1` define its vertical extent
- `node.cy` drives icon/label positioning
- `link.thickness = max(0.45, link.value × scale)`

Node height and ribbon thickness therefore share the same global linear scale. The 0.45 minimum is only a rendering floor for extremely small positive flows.

Each link is a custom cubic Bézier ribbon plus a centerline used by moving particles. Do not replace this with `d3-sankey`, ECharts Sankey, CSS stretching, or independently normalized stages.

### Platform containment invariant and current caveat

Locked visual intent: a Platform node must visually contain the complete flow passing through it, and its height must remain data-driven rather than a fixed cosmetic height.

Current node values for Platform are deliberately derived from External Source incoming flow. The latest workbook has larger Platform → Content outbound totals than Platform incoming totals. The layout centers link allocations around `node.y0`/`node.y1`; when allocated outbound thickness exceeds `node.h`, ribbons can extend beyond the node's data-driven extent.

Do not hide this by assigning arbitrary fixed heights. Resolve the source reconciliation or obtain explicit approval for a revised node-value/flow-containment rule before changing geometry.

## 9. Customer Journey Interaction Rules

### Full-path emphasis

Pure utilities in `lib/journey/graph.ts` recursively compute:

- `getUpstreamGraph()`
- `getDownstreamGraph()`
- `getActiveJourneyGraph()`

The active graph is the union of all upstream ancestors/links and downstream descendants/links through the focused node. Unrelated nodes and links dim; active paths glow; active-path particles stay visible.

### Desktop hover/focus

- Hovering a detail-capable node immediately opens its node-detail popover and highlights the full path.
- Hovering a node without a detail model temporarily highlights its full path.
- Leaving schedules a 200 ms hide, and entering the popover cancels the hide to avoid flicker.
- Ordinary desktop click on a node is intentionally ignored; hover is the primary informational interaction.
- Keyboard Enter/Space can persist selection and open details.

### Touch fallback

- On devices without hover, tapping a node selects it and opens details.
- Tapping the selected node again clears it.
- Pointer-down outside the node/popover clears selection and detail.

### Node details

- External Source: Platform Distribution
- Platform: External Source Contribution
- Content: Platform Distribution
- Product View: source-to-Product-View conversion rates
- Add to Cart: Product View → Add to Cart
- Order: Add to Cart → Order and direct Product View → Order
- Complete: Order → Complete plus hidden post-purchase detail
- Cancel / Processing: Order Result Rate

The popover is absolutely positioned within the dark Journey container using node-relative right/left/below/above fallbacks and viewport-safe clamping. It must not resize or reflow the Sankey.

### Links and particles

- Links are not directly hoverable/clickable in the current component; they are emphasized through node path traversal.
- Permanent percentage labels on ribbons were removed. Thickness communicates magnitude.
- Particles follow each link centerline.
- `prefers-reduced-motion` hides particles and minimizes transitions.

### Cursor and focus conventions

- Informational nodes and legends use a normal/default cursor.
- Genuine controls such as Date Range, segmented toggles, tag removal, and Reset use button behavior and visible focus states.
- Do not introduce a question-mark/help cursor for normal analytical hover areas.
- There is no pan/zoom UI. The only page-level focus effect is the subtle `DashboardPart` scale/brightness treatment.

## 10. Locked Product Decisions

- Customer Overview and Customer Journey are separate sections.
- They have independent date controls and local state.
- Customer Journey remains mock-data based.
- Customer Journey date selection must not fabricate or dynamically rescale data without date-grained source rows.
- External Source remains visible in the Customer Journey Sankey.
- There is no External Source → Platform CVR card.
- Platform → Content CVR exists and uses total Content volume divided by total Platform volume.
- Customer Overview contains New vs Returning Customers and Customer Segmentation.
- Customer Overview filter order is Date Range, then Platform multi-select.
- Average Repurchase Days is not rendered.
- Recommendation sections must not be restored unless explicitly requested.
- Purchase Timing and Product Type sections must not be restored unless explicitly requested.
- Cancellation Analysis, Channel Effectiveness, Overview KPI cards, shopping/product performance, and bundle recommendations are not active sections and must not be restored implicitly.
- Removed section-level explanatory subtitles must remain removed. Chart-level subtitles inside active cards remain.
- Avoid layout shift on hover; analytical details are overlays.
- Prefer hover/focus for informational detail and click for genuine controls.
- Preserve the custom proportional Sankey algorithm, paths, particles, node order, and full-path traversal unless explicitly asked to change them.

## 11. Removed / Do Not Restore

The following are absent from the active `DashboardPage` and should not be reintroduced from Git history, old specs, or the standalone export without an explicit user request:

- Customer Intelligence Overview KPI row
- Separate Customer Type section and revenue-composition donut
- Average Repurchase Days card
- Purchase Timing section
- Product Type Sold / Shopping Behavior sections
- Bundle Recommendations / Product Pair disclosure
- Channel Effectiveness
- Cancellation Analysis
- Consolidate(d) Recommendations / AI Insights
- Old Customer Journey trend chart and old Journey insight panels
- Old global `DashboardDateRangeContext`

Files currently deleted in the working tree as part of this cleanup:

- `components/dashboard/DashboardDateRangeContext.tsx`
- `components/dashboard/PurchaseTimingSection.tsx`
- `components/dashboard/RecommendationsSection.tsx`
- `components/dashboard/ShoppingTrendsSection.tsx`
- `data/fixtures/journey-comparison.fixture.ts`
- `data/recommendations/recommendation-engine.ts`
- `tests/contracts/recommendation-engine.test.ts`

Still-present but inactive/legacy sources:

- `standalone-dashboard/`: old static dashboard with many removed sections and stale values.
- `customer-intelligence-dashboard.md`: an older implementation export whose section list is stale.
- `data/fixtures/raw-dashboard.fixture.ts` and `data/repositories/mock-dashboard.repository.ts`: aggregate/legacy model path not imported by the active page.
- Overview, Customer Type, Purchase Time, Cancellation, Shopping, Channel Performance services/adapters/fixtures: retained for tests or future integration but not rendered by the current page.
- `Customer Journey Mayora (1:5 -> 17:5:2026.html`: historical Customer Journey visual/interaction reference, not runtime code and not authoritative numerical data.
- `DATA_SPEC.md`, `UI_SPEC.md`, and `IMPLEMENTATION_PLAN.md`: useful historical specifications, but some names, section order, and journey-source statements are outdated. Current imports and latest workbooks take precedence.

## 12. Data Files

### `mapping data.xlsx`

- Current workbook sheets: blank `Dashboard`, populated `Customer journey`, and `SQL`.
- Active Customer Overview extraction:
  - New vs Returning: `Customer journey!A8:C24`
  - Customer Segmentation snapshot: `Customer journey!A140:E145`
- Business/query reference: `SQL`, including New/Returning classification logic.
- The workbook also contains data for removed sections; presence in the workbook does not make those sections active.
- `Customer journey!B239:C255` is extracted into an Average Repurchase Days fixture but is not rendered.
- Browser/deployment runtime does not read this file.

### `MOCK DATA.xlsx`

- Single source of truth for Customer Journey mock values.
- Active dataset: `Sankey Data!A1:G45`.
- `Notes` records that the file is for mock/Sankey visualization use.
- Browser/deployment runtime uses the synchronized TypeScript fixture rather than reading the workbook.

### Customer Overview fixtures

- `data/fixtures/customer-segmentation-workbook.fixture.ts`
- `data/adapters/customer-segmentation.adapter.ts`
- `data/definitions/customer-segment-definitions.ts`

### Customer Journey fixtures

- `data/fixtures/journey.fixture.ts`
- `data/adapters/journey.adapter.ts`
- `data/contracts/dashboard.ts`

## 13. Important Source Files

| File                                                      | Responsibility                                                                       | Active? | Notes                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------: | --------------------------------------------------------------------------- |
| `app/layout.tsx`                                          | Root metadata, document language, and global stylesheet import.                      |     Yes | `lang="vi"` remains even though the active UI is English; see Current Work. |
| `app/page.tsx`                                            | Next.js route entry.                                                                 |     Yes | Renders `DashboardPage`.                                                    |
| `app/globals.css`                                         | Page tokens, base background/type, reduced-motion rules.                             |     Yes | `styles/tokens.css` is only a placeholder.                                  |
| `components/dashboard/DashboardPage.tsx`                  | Current section order, responsive page width, major-part focus effect.               |     Yes | Definitive active-section source.                                           |
| `components/dashboard/DashboardHeader.tsx`                | Centered Customer Intelligence page title.                                           |     Yes | No subtitle.                                                                |
| `components/dashboard/CustomerSegmentationSection.tsx`    | Entire Customer Overview section, filters, line chart, segmentation donut, tooltips. |     Yes | Name is narrower than current responsibility.                               |
| `components/dashboard/CustomerJourneySection.tsx`         | CVR/drop-off cards, Sankey rendering, node details, date UI.                         |     Yes | All displayed Journey values derive from active fixture/graph.              |
| `components/ui/DateRangePill.tsx`                         | Independent date range dialog.                                                       |     Yes | Used by both active sections.                                               |
| `components/ui/TagMultiSelect.tsx`                        | Platform tag multi-select.                                                           |     Yes | Untracked at audit time; must be included in a future commit.               |
| `components/ui/SegmentedControl.tsx`                      | Customer Count / Revenue Contribution switch.                                        |     Yes | Shared generic control.                                                     |
| `components/ui/Card.tsx`                                  | Standard white card shell.                                                           |     Yes | Rounded border, no shadow by default.                                       |
| `components/ui/donutGeometry.ts`                          | Shared donut radii and thickness.                                                    |     Yes | Segmentation consumes it.                                                   |
| `components/ui/DonutPercentageLabels.tsx`                 | External donut labels and collision handling.                                        |     Yes | Minimum share set by caller.                                                |
| `data/fixtures/customer-segmentation-workbook.fixture.ts` | Local Overview rows extracted from `mapping data.xlsx`.                              |     Yes | Also contains inactive Average Repurchase Days data.                        |
| `data/adapters/customer-segmentation.adapter.ts`          | Date validation/sampling and segment mapping.                                        |     Yes | Does not calculate customer segments.                                       |
| `data/definitions/customer-segment-definitions.ts`        | Display labels, colors, descriptive definitions, source-label aliases.               |     Yes | `Loyal` exists but is not active.                                           |
| `data/fixtures/journey.fixture.ts`                        | Exact local extraction of latest Journey workbook rows and normalized exports.       |     Yes | Active Journey data source at runtime.                                      |
| `data/adapters/journey.adapter.ts`                        | Workbook-row normalization, node/link derivation, semantics, and audits.             |     Yes | Untracked at audit time; must be included in a future commit.               |
| `data/contracts/dashboard.ts`                             | Shared UI data contracts.                                                            |     Yes | Contains active and legacy contracts.                                       |
| `lib/journey/layout.ts`                                   | Custom global-linear-scale Sankey geometry.                                          |     Yes | Fixed 1820 × 440 coordinate system.                                         |
| `lib/journey/graph.ts`                                    | Pure recursive upstream/downstream/full-path traversal.                              |     Yes | Unit-testable and must remain declarative.                                  |
| `lib/interaction/analytical-tooltip.ts`                   | Closes other analytical popovers when a new one opens.                               |     Yes | Window CustomEvent coordinator.                                             |
| `tests/contracts/customer-segmentation.test.ts`           | Overview fixture and sampling contract tests.                                        |     Yes | Includes inactive Average Repurchase tests.                                 |
| `tests/contracts/journey-graph.test.ts`                   | Latest Journey rows, rates, traversal, proportional geometry, and triangle tests.    |     Yes | Update when MOCK DATA changes.                                              |
| `mapping data.xlsx`                                       | Overview samples and SQL/business reference.                                         |  Source | Not read at runtime.                                                        |
| `MOCK DATA.xlsx`                                          | Customer Journey mock source of truth.                                               |  Source | Not read at runtime.                                                        |
| `standalone-dashboard/index.html`                         | Old static export.                                                                   |      No | Contains removed sections and stale values; do not use as current UI.       |
| `customer-intelligence-dashboard.md`                      | Old implementation snapshot.                                                         |      No | Stale section structure.                                                    |

## 14. Current Work / Next Steps

Immediate ongoing task:

> Keep Customer Journey synchronized with the latest MOCK DATA and ensure all Sankey node values, flow values, Conversion Rate cards, Drop-off Rate cards, Biggest Drop-off, and hover details derive from the same active dataset.

Genuinely unfinished or unresolved work discovered during audit:

1. **Commit the current local dashboard when approved.** Local `main` and `origin/main` both point to `bf19e25`, but the active two-section implementation and refreshed workbooks are uncommitted.
2. **Complete Platform filter data integration.** The control exists, but per-platform Overview datasets are not passed, so all selections currently render aggregate data.
3. **Resolve Journey data-quality conflicts rather than hiding them:**
   - Platform incoming total: 63,000; Platform → Content total: 89,500.
   - Platform → Content CVR: 142.1%; derived drop-off: -42.1%.
   - Workbook same-stage summaries do not match External Source-derived platform totals: Shopee 25,000 vs 31,500; TikTok Shop 20,000 vs 23,000; Lazada 10,000 vs 8,500.
   - Complete + Cancel + Processing = 11,890 versus Order = 11,900 (difference 10).
   - Hidden Complete outbound post-purchase links total 10,380 versus Complete = 9,150 (difference +1,230).
4. **Confirm platform flow-containment behavior** once the data mismatch is resolved. Do not compensate with fixed node heights.
5. **Document/implement true historical New classification** before production integration; current SQL history is period-limited.
6. **Consider changing `<html lang="vi">` to English** if the dashboard remains fully English. This is an accessibility/metadata cleanup, not yet performed.
7. There are no active production APIs. The old service boundary is retained but disconnected from the visible page.

No source-code `TODO` or `FIXME` markers were found for additional current work.

## 15. Data Consistency Rule

Customer Journey must follow one directional pipeline:

```text
latest MOCK DATA
→ normalized data model
→ Sankey nodes and links
→ node totals
→ Conversion Rates
→ Drop-off Rates
→ Biggest Drop-off
→ node detail/tooltips
```

Do not maintain duplicated hardcoded numerical values in JSX, comparison fixtures, insight strings, or tooltips. A number displayed in multiple places must derive from the same active node/link model.

For a future workbook refresh:

1. Inspect `MOCK DATA.xlsx` from scratch and confirm the latest sheet/range/mtime.
2. Re-extract all rows into `workbookJourneyRows`; do not merge with old fixture rows.
3. Preserve zero/invalid and same-stage summary row audit handling.
4. Run Journey contract tests and compare representative source rows, node totals, all five CVRs, all five drop-offs, and Biggest Drop-off.
5. Verify the rendered DOM/visualization before reporting completion.

## 16. Git and Vercel Workflow

### Inspect state

```bash
git status -sb
git diff
git diff --check
git branch --show-current
git log -3 --oneline
git remote -v
```

The current branch must remain `main` unless the user explicitly requests another workflow.

### Validate before commit

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

### Commit and push

Only after explicit user approval:

```bash
git add <approved files>
git commit -m "<approved commit message>"
git push origin main
```

Avoid `git add .` when unrelated changes exist. Never commit `.next`, `node_modules`, `.env*` secrets, temporary Office lock files (`~$*`), or local caches.

### Verify local and GitHub commits

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
```

The two SHAs must match after push.

### Vercel behavior

- Pushing the approved commit to `origin/main` should trigger the existing Vercel project's Production deployment through Git integration.
- Verify repository, Production Branch `main`, project root, detected Git SHA, build command, and deployment status in the existing project.
- Compare Local HEAD, `origin/main`, and Vercel Production commit; do not report success while Vercel serves an older SHA.
- If auto-deploy does not trigger, inspect Git integration, ignored-build settings, root directory, and build configuration first.
- Use `vercel --prod` only if the local directory is already linked to the correct existing Vercel project. This repository currently has no local `.vercel/project.json`, so do not run it blindly.
- Never create a new repository, branch, or Vercel project unless explicitly requested.

## 17. Current Git Status at Handover Creation

Branch and commit:

- Branch: `main`
- Local HEAD: `bf19e258aaaaaecf0ce5ecb78b6534b01b78bcd0`
- `origin/main`: `bf19e258aaaaaecf0ce5ecb78b6534b01b78bcd0`
- Tracking: `main...origin/main`, no committed divergence

The working tree is not clean. It contains the current approved/in-progress dashboard implementation:

- Modified: both workbooks, active dashboard components, UI controls, contracts, adapters, fixtures, Journey layout, and contract tests.
- Deleted: the old global date context, Purchase Timing, Recommendations, Shopping Trends, Journey comparison fixture, recommendation engine, and recommendation-engine test.
- Untracked before this handover: `components/ui/TagMultiSelect.tsx` and `data/adapters/journey.adapter.ts`.
- `DASHBOARD_HANDOVER.md` is newly created by this task and must be reviewed/staged explicitly if the user later requests a commit.

Do not reset, checkout, or discard this dirty working tree. The local files are the current source of truth.

## Instructions for the Next ChatGPT/Codex Session

1. Read this entire file first.
2. Inspect the current repository state before modifying code.
3. Treat current runtime imports, current code, and the latest data files as the source of truth.
4. Do not restore removed features from old files, old commits, specifications, the standalone export, or stale Markdown.
5. Preserve Locked Product Decisions unless the user explicitly changes them.
6. For Customer Journey numerical changes, inspect the latest `MOCK DATA.xlsx` first.
7. Keep calculations centralized in adapters/derived models rather than hardcoding UI values.
8. For Customer Overview changes, distinguish workbook snapshot data from missing per-platform/date-grained data; do not invent it.
9. Preserve overlay-based hover details and avoid layout shift.
10. After application changes, run TypeScript, lint, relevant tests, and the production build.
11. Report every file changed and any source-data mismatch.
12. Do not commit, push, or deploy unless explicitly requested.
