# Customer Intelligence Dashboard Implementation Plan

## 1. Purpose and implementation constraints

This plan defines how to build the prototype. It does not contain application implementation.

Source precedence:

1. `UI_SPEC.md` and the `REF/` screenshots control layout, section order, card proportions, chart placement, controls, visual hierarchy, and styling.
2. `DATA_SPEC.md` controls metrics, dimensions, business definitions, sample values, SQL semantics, and data-support status.
3. `Hanh_Trinh_Khach_Hang.html` controls Customer Journey Sankey behavior, motion, node/link interaction, and flow styling where it does not conflict with the dashboard placement in `UI_SPEC.md`.

Implementation must not:

- Redesign or “improve” the reference.
- Add sections or visible controls absent from `UI_SPEC.md`.
- Treat screenshot or HTML values as production data.
- calculate unresolved business metrics inside presentational components.
- silently resolve source conflicts.

## 2. Frontend technology stack

| Concern | Technology | Use |
|---|---|---|
| Application framework | Next.js, App Router | Page shell, routing, static prototype delivery, later server/API integration |
| UI runtime | React | Declarative component composition and interaction state |
| Language | TypeScript with strict mode | Dataset, chart, component, and state contracts |
| Styling | Tailwind CSS | Reference-faithful layout and component styling using project tokens |
| Standard charts | Apache ECharts with a React wrapper | Line chart, doughnuts, heatmap, and horizontal reason bars |
| Customer Journey | D3 utilities plus declarative React SVG | Sankey layout calculations, ribbons, nodes, labels, and hit targets |
| Icons | Lucide React | Only icons visibly required by the screenshots; do not introduce decorative icons |
| Motion | Framer Motion | Limited to interactions requiring coordinated enter/highlight transitions; not required for every component |
| Journey particle motion | SVG + `requestAnimationFrame` or Framer Motion path animation | Directional particles along computed Sankey centerlines |
| Testing | Vitest, React Testing Library, Playwright | Unit contracts, component behavior, accessibility, screenshot comparison |
| Formatting/linting | ESLint and Prettier | Consistency and CI checks |

### Dependency policy

- Use ECharts only for standard analytics visuals.
- Do not force the Journey into ECharts; its reference behavior requires custom SVG control.
- Use D3 modules selectively, such as scales, shapes, interpolation, and Sankey/layout helpers if their output can match the reference.
- Keep Framer Motion optional and localized. CSS transitions or SVG animation are sufficient for simple states.
- Do not introduce a component library whose default appearance would override the visual reference.

## 3. Proposed folder structure

```text
app/
  globals.css
  layout.tsx
  page.tsx

components/
  dashboard/
    DashboardHeader.tsx
    DashboardPage.tsx
    OverviewSection.tsx
    CustomerTypesSection.tsx
    PurchaseCancellationSection.tsx
    ShoppingTrendsSection.tsx
    CustomerJourneySection.tsx
    RecommendationsSection.tsx
  ui/
    Card.tsx
    SectionHeading.tsx
    SegmentedControl.tsx
    DateRangePill.tsx
    MetricCard.tsx
    DisclosureRow.tsx
    StatusPanel.tsx
    Skeleton.tsx
  charts/
    ChartFrame.tsx
    EChart.tsx
    CustomerTrendChart.tsx
    CompositionDoughnut.tsx
    PurchaseTimeHeatmap.tsx
    CancellationReasonBars.tsx
    ProductRankingList.tsx
  journey/
    JourneySpotlight.tsx
    JourneyHeader.tsx
    JourneyConversionGrid.tsx
    JourneySankey.tsx
    JourneyNode.tsx
    JourneyRibbon.tsx
    JourneyParticles.tsx
    JourneyDropoffGrid.tsx
    JourneyInsightPanel.tsx
    JourneyAccessibleTable.tsx
  recommendations/
    RecommendationSectionHeader.tsx
    RecommendationCard.tsx

data/
  contracts/
    dashboard.ts
    journey.ts
    recommendations.ts
  fixtures/
    overview.fixture.ts
    customer-types.fixture.ts
    purchase-timing.fixture.ts
    cancellations.fixture.ts
    shopping.fixture.ts
    products.fixture.ts
    product-pairs.fixture.ts
    journey.fixture.ts
    recommendations.fixture.ts
  adapters/
    mockDashboardAdapter.ts
    normalizePercent.ts
    normalizePeriod.ts
    normalizeAmounts.ts
  repositories/
    dashboardRepository.ts
    mockDashboardRepository.ts

hooks/
  useDashboardData.ts
  useReducedMotion.ts
  useElementVisibility.ts
  useResponsiveSankey.ts

lib/
  charts/
    echartsTheme.ts
    formatters.ts
  journey/
    layoutJourney.ts
    buildJourneyPaths.ts
    validateJourneyGraph.ts
  format/
    number.ts
    percent.ts
    date.ts
  accessibility/
    chartSummaries.ts

styles/
  tokens.css

tests/
  contracts/
  components/
  visual/
  accessibility/

public/
  fonts/
```

Folder names can be adapted to the generated Next.js conventions, but feature boundaries and data/presentation separation should remain.

## 4. Component hierarchy

```text
DashboardPage
├── DashboardHeader
│   ├── eyebrow/title block
│   └── DateRangePill
├── OverviewSection
│   └── MetricCard × 6
├── CustomerTypesSection
│   └── compound Card
│       ├── CustomerTrendChart
│       └── CompositionDoughnut
├── PurchaseCancellationSection
│   ├── SectionHeading
│   ├── purchase-time Card
│   │   ├── SegmentedControl
│   │   └── PurchaseTimeHeatmap
│   └── cancellation Card
│       ├── CancellationReasonBars
│       └── summary MetricCard × 2
├── ShoppingTrendsSection
│   ├── SectionHeading
│   ├── shopping-composition Card
│   │   ├── SegmentedControl
│   │   ├── CompositionDoughnut
│   │   └── inline insight callout
│   ├── product-ranking Card
│   │   ├── SegmentedControl
│   │   └── ProductRankingList
│   └── DisclosureRow for Combo recommendations
├── CustomerJourneySection
│   └── JourneySpotlight
│       ├── JourneyHeader
│       ├── JourneyConversionGrid
│       ├── JourneySankey
│       │   ├── JourneyRibbon × n
│       │   ├── JourneyNode × n
│       │   └── JourneyParticles
│       ├── JourneyDropoffGrid
│       ├── JourneyInsightPanel
│       └── JourneyAccessibleTable
└── RecommendationsSection
    ├── RecommendationSectionHeader
    └── RecommendationCard × 4
```

The top-level component order must match `UI_SPEC.md` exactly.

## 5. Shared UI components

### `Card`

- Provides standard light-card surface, border, radius, and optional internal divider.
- Variants limited to what the screenshots show: standard, compact strip, nested metric, Journey dark, and recommendation outer container.
- Must not include default shadows or padding that differ from the reference.

### `SectionHeading`

- Accepts the displayed section number/title and subtitle.
- Preserves the screenshot hierarchy and spacing.
- Journey uses its own header treatment rather than this light-theme component.

### `SegmentedControl`

- Exactly two options for the three controls shown in `UI_SPEC.md`.
- Supports controlled selection, keyboard arrow navigation, visible focus, and disabled/unavailable options.
- Does not add labels, icons, or dropdown behavior.

### `MetricCard`

- Supports primary KPI, nested cancellation summary, and Journey conversion only through explicit variants.
- Value, unit, delta, and semantic direction are separate props.
- A missing comparison renders the unavailable treatment instead of a manufactured delta.

### `DateRangePill`

- Initially renders the reference pill as a display/control shell.
- Picker behavior remains behind an interface until confirmed.
- Uses explicit `startInclusive` and `endExclusive` metadata for formatting.

### `DisclosureRow`

- Used by the Combo recommendation strip and as an internal pattern for recommendation evidence rows.
- Collapsed by default, matching the screenshots.
- Expanded content remains mock/placeholder state until its reference is confirmed.

### `StatusPanel` and `Skeleton`

- Shared loading, empty, error, and unavailable treatments.
- Preserve the target component’s measured height and grid position.
- Must visually distinguish unavailable from successful-empty.

## 6. Chart components

### `EChart`

- Thin client-side wrapper that owns ECharts initialization, resize, cleanup, reduced-motion options, and theme registration.
- Receives complete options from focused chart components.
- Does not contain business calculations.

### `CustomerTrendChart`

- Two-series line chart.
- Deep blue new-customer series and green existing-customer series.
- Point markers, direct point labels, compact legend, light dotted gridlines.
- Consumes `CustomerTypeDailyPoint[]`.

### `CompositionDoughnut`

- Reusable geometry/presentation primitive with configuration for two or three categories.
- Center label fixed to the reference presentation (`100%`) only when normalized parts are valid.
- Customer version places legend rows beneath the chart.
- Shopping version places category rows beside the chart and an insight callout below.
- Consumers supply values and labels; component does not compute business categories.

### `PurchaseTimeHeatmap`

- Seven weekdays × six source-defined time slots.
- Rounded cells using a discrete/continuous lavender-to-blue scale calibrated to fixture min/max.
- Compact labels such as `00–06` map to the exact `00:00–05:59` interval.
- No visible color legend or cell values in default reference state.
- Consumes the complete 42-cell `PurchaseTimeSlotTotal[]` grid.

### `CancellationReasonBars`

- Ranked six-row visual in the initial viewport/fixture.
- Reason, track/bar, and right-aligned percent.
- Uses the approved percentage field when available; does not derive a new denominator in the component.
- Summary cards use pre-aggregated current-period loss and optional comparison.

### `ProductRankingList`

- Semantic list/table rather than a canvas chart.
- Five visible rows with zero-padded rank, product name, and right-aligned value.
- Filters already-normalized `ProductPerformanceRow[]` by selected type through section state.

### Chart accessibility

- Every chart has an accessible heading association and concise summary.
- Provide visually hidden tabular data for line, doughnut, heatmap, and bars.
- Do not rely on color alone for series/category identification.

## 7. Mock data architecture

### Principles

1. Keep reference fixtures separate from components.
2. Preserve workbook samples and screenshot/HTML mock values exactly where needed for visual reproduction.
3. Annotate provenance and support status.
4. Normalize data at repository/adapter boundaries, never inside charts.
5. Allow the mock repository to be replaced by production fetchers without changing component props.

### Repository boundary

`DashboardRepository` should expose section-oriented asynchronous methods or one aggregate `getDashboard` method. The prototype binds it to `MockDashboardRepository`.

Each returned dataset includes metadata:

```text
dataStatus: mock | production | unavailable
source: workbook | screenshot | journey-html | api
period: { startInclusive, endExclusive, timezone }
currencyCode: string | null
generatedAt: string | null
```

### Fixture sources

- Workbook fixtures: overview values, customer data, purchase timing, cancellations, shopping composition, products, and product pairs from `DATA_SPEC.md`.
- Screenshot fixtures: deltas, comparison values, recommendation scores/copy, and any visual-only names needed to match screenshots. Mark unsupported fields explicitly.
- Journey fixture: nodes, links, conversions, drop-offs, and insights required to reproduce the screenshot/HTML interaction. Mark all Journey analytics as mock-only.

### Normalization

- Percent fixtures normalize to one internal convention, preferably ratios from `0` to `1`.
- Store the original source value alongside normalized values only when useful for audit/testing.
- Dates use ISO strings and explicit inclusive/exclusive semantics.
- Currency remains `null` until confirmed; screenshot suffixes such as `B`, `M`, or `K` are compact number formatting, not proof of a currency code.
- Missing production fields use `null` plus support metadata rather than guessed defaults.

## 8. TypeScript interfaces

The following contracts define the required shape conceptually. Exact module syntax will be created during implementation.

```ts
type DataStatus = "mock" | "production" | "unavailable";
type DataSource = "workbook" | "screenshot" | "journey-html" | "api";

interface ReportingPeriod {
  startInclusive: string;
  endExclusive: string;
  timezone: string | null;
}

interface DatasetMeta {
  dataStatus: DataStatus;
  source: DataSource | DataSource[];
  period: ReportingPeriod;
  currencyCode: string | null;
  generatedAt: string | null;
}

interface DashboardDataset<T> {
  meta: DatasetMeta;
  data: T;
}
```

### Overview

```ts
interface MetricValue {
  value: number | null;
  unit: "count" | "amount" | "ratio";
  deltaRatio?: number | null;
  deltaDirection?: "up" | "down" | "flat" | null;
}

interface OverviewMetrics {
  totalCustomers: MetricValue;
  totalOrders: MetricValue;
  revenue: MetricValue;
  averageOrderValue: MetricValue;
  repeatCustomerRate: MetricValue;
  cancellationRate: MetricValue;
}
```

### Customer and purchase behavior

```ts
interface CustomerTypeDailyPoint {
  date: string;
  newCustomers: number;
  existingCustomers: number;
  totalCustomers: number | null;
}

interface CustomerRevenueContribution {
  customerType: "new" | "existing";
  revenue: number | null;
  contributionRatio: number;
}

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type TimeSlotId = "00-06" | "06-09" | "09-12" | "12-15" | "15-18" | "18-24";

interface PurchaseTimeSlotTotal {
  weekday: Weekday;
  timeSlotId: TimeSlotId;
  sourceLabel: string;
  totalOrders: number;
}

interface WeekdayOrderTotal {
  weekday: Weekday;
  totalOrders: number;
}
```

### Cancellation, shopping, products, and pairs

```ts
interface CancellationReasonMetric {
  reason: string;
  cancelledOrders: number;
  cancellationReasonRatio: number | null;
  lostRevenue: number;
  lostRevenueRatio: number | null;
}

type ShoppingComposition = "combo" | "retail" | "mixed";

interface ShoppingCompositionMetric {
  composition: ShoppingComposition;
  orderCount: number;
  orderShareRatio: number;
  revenue: number;
  revenueShareRatio: number;
}

type ProductType = "combo" | "retail";

interface ProductPerformanceRow {
  rank: number;
  productType: ProductType;
  itemId: string;
  itemName: string;
  modelName: string | null;
  totalQuantitySold: number;
  totalOrders: number;
  productSales: number;
}

interface ProductPairRow {
  rank: number;
  item1: { id: string; name: string };
  item2: { id: string; name: string };
  ordersBoughtTogether: number;
}
```

### Customer Journey

```ts
interface JourneyStage {
  id: string;
  label: string;
  order: number;
}

interface JourneyNode {
  id: string;
  stageId: string;
  label: string;
  value: number;
  color: string;
}

interface JourneyLink {
  id: string;
  sourceId: string;
  targetId: string;
  value: number;
}

interface JourneyTransition {
  id: string;
  sourceLabel: string;
  targetLabel: string;
  conversionRatio: number | null;
  dropoffRatio: number | null;
  isLargestDropoff: boolean;
}

interface JourneyInsight {
  id: string;
  kind: "biggest-dropoff" | "order-quality" | "post-purchase";
  eyebrow: string;
  finding: string;
  explanation: string;
}

interface JourneyDataset {
  stages: JourneyStage[];
  nodes: JourneyNode[];
  links: JourneyLink[];
  transitions: JourneyTransition[];
  insights: JourneyInsight[];
}
```

### Consolidated recommendations

```ts
interface RecommendationCardData {
  id: string;
  category: string;
  statusLabel: string;
  priorityScore: number | null;
  severity: "high" | "medium" | null;
  title: string;
  description: string;
  evidence: string[] | null;
  supportStatus: "mock" | "unsupported" | "production";
}
```

Do not introduce additional business fields until supported by `DATA_SPEC.md` or a later approved contract.

## 9. Design tokens

Tokens should encode the screenshot measurements and semantic roles without turning approximations into brand claims.

### Layout tokens

```text
--dashboard-content-width: provisional 748px-equivalent ratio
--page-inline-padding: responsive, preserving reference centered width
--grid-gap-sm: 12px
--grid-gap-md: 16px
--section-gap: 32px
--card-padding: 16px
--journey-padding: 32px
```

The actual CSS maximum width should be calibrated through screenshot comparison because browser scale is unknown.

### Radius tokens

```text
--radius-control: 10px
--radius-card: 16px
--radius-pill: 999px where the reference uses capsules
--radius-journey: 24px
--radius-journey-inner: 14px
```

### Color tokens

```text
--color-page: #f8f8f8 approximately
--color-surface: #ffffff
--color-border: #dedede approximately
--color-text: #111111
--color-muted: #666666
--color-primary-deep: #180bd4 approximately
--color-action: #3b82f6 approximately
--color-success-series: #22a657 approximately
--color-cyan: #86eae9
--color-danger: #e2504a
--color-warning: orange sampled/calibrated from reference
--color-track: #eef4fd approximately
--color-journey-top: #0a0f2b
--color-journey-bottom: #050714
```

### Typography tokens

```text
--font-sans: NEEDS_CONFIRMATION; use one neutral local/system fallback during prototype calibration
--text-page-title: 24–26px
--text-section-title: 18–20px
--text-card-title: 14–16px
--text-kpi-value: 19–21px
--text-body: 12–13px
--text-caption: 10–11px
--text-priority-score: 27–30px
```

### Border/shadow tokens

- Default border: `1px` solid light gray.
- Default shadow: none or effectively imperceptible.
- Journey inner border: translucent blue-gray.
- Journey highlighted drop-off: danger border and translucent danger fill.

Calibrate tokens against the screenshots before refining individual components. Avoid one-off values unless a unique reference element requires them.

## 10. Section-by-section implementation order

### Phase 0 — project and visual baseline

1. Scaffold Next.js, TypeScript, Tailwind, linting, and tests.
2. Load fixture repository and base contracts.
3. Establish global page width, background, typography fallback, tokens, card, section heading, and segmented control.
4. Create a Playwright screenshot target at the same reference viewport.

### Phase 1 — header and Overview

1. Dashboard header and date pill.
2. Three-column × two-row KPI grid.
3. Compact number and delta formatters.
4. Match card width, height, border, radius, and spacing before proceeding.

### Phase 2 — Section 01

1. Full-width compound card and asymmetric divider.
2. Customer trend line chart.
3. Revenue composition doughnut and rows.
4. Validate overall card ratio and plot density.

### Phase 3 — Section 02

1. Two-card row.
2. Purchase-time segmented control and heatmap.
3. Cancellation reason bars and nested summary cards.
4. Keep comparison summary populated only from explicitly mock metadata.

### Phase 4 — Section 03

1. Shopping composition doughnut, control, and callout.
2. Product-ranking control and list.
3. Full-width Combo recommendation disclosure strip.
4. Keep both disclosures collapsed by default.

### Phase 5 — Section 04 Journey

1. Dark spotlight shell and header.
2. Conversion card grid.
3. Static declarative Sankey geometry.
4. Node selection and connected-path highlighting.
5. Directional particles and reduced-motion behavior.
6. Drop-off grid and full-width insight panel.
7. Accessible relationship table.

### Phase 6 — Section 05 recommendations

1. Outer recommendation container and header.
2. Four-card 2 × 2 grid.
3. Priority/category styles.
4. Collapsed evidence rows.

### Phase 7 — state, responsive, and QA pass

1. Loading, empty, error, and unavailable variants for every section.
2. Keyboard/focus behavior.
3. Tablet/mobile best-effort reflow under unresolved constraints.
4. Reference screenshot comparison and targeted token adjustment.
5. Unit, interaction, accessibility, and visual-regression checks.

The phase order mirrors the exact page order, with shared primitives established first.

## 11. Customer Journey implementation strategy

### Data validation

- Validate unique node IDs.
- Validate every link source/target exists.
- Validate stage ordering.
- Reject negative/nonfinite values.
- Preserve zero-value semantics without rendering misleading ribbons.
- Treat screenshot/HTML Journey data as `mock` provenance.

### Layout

- Use stages as fixed x-columns in the screenshot order.
- Compute node vertical positions and heights from values with minimum readable node size.
- Stack incoming and outgoing ribbon segments independently.
- Generate cubic Bézier ribbon paths between source and target columns.
- Maintain stable positions across selection changes; selection changes opacity/emphasis, not layout.
- Keep the SVG viewBox responsive while retaining screenshot aspect and stage order.

### Rendering

- React renders SVG nodes, labels, ribbons, stage headers, and hit areas declaratively.
- Use gradients keyed by link/source-target colors.
- Use filters/glows sparingly to match the reference.
- Place decorative star dots in a noninteractive background layer.
- Keep hit targets larger than visible node marks.

### Interaction

- Click/tap/keyboard activation persistently selects a node.
- Traverse incoming and outgoing graph relationships to compute the full connected path.
- Highlight selected-path nodes, ribbons, and particles; dim unrelated elements.
- Support clear via repeated activation and background activation; final visible clear affordance remains configurable.
- Hover can provide transient preview only when no persistent selection is active.

### Animation

- Build hidden centerline paths for particles.
- Animate particles using a single managed frame loop, not one loop per link.
- Pause when the section is offscreen or the document is hidden.
- Disable particles and nonessential transitions under reduced motion.
- Framer Motion may animate conversion/drop-off card entry only if this is required to match the reference; otherwise avoid it.

### Accessibility

- Nodes are focusable buttons or button-like SVG groups with accessible labels.
- Announce stage, node value, and connection summary.
- Mirror graph data in a visually hidden or collapsible semantic table.
- Selection is indicated by focus styling and opacity, not color alone.

### Source conflicts

- The screenshot uses click-to-trace; implement persistent click selection as primary.
- The HTML supplies detailed hover and particle behavior; incorporate it without changing screenshot placement.
- Do not add the standalone HTML conversion-trend card because it is absent from the dashboard screenshots. Keep it as a dormant component/data contract only if future confirmation places it.
- Journey headline color remains tokenized because screenshots and HTML conflict.

## 12. Responsive strategy

Only desktop is fully specified. Prototype responsiveness should be conservative and preserve hierarchy.

### Desktop

- Reproduce the measured single centered content column.
- Preserve all row-sharing rules from `UI_SPEC.md`.
- Use the reference viewport for visual-regression calibration.

### Tablet best-effort

- Keep KPI cards in three columns while they remain readable; move to two columns only when required.
- Stack the asymmetric Section 01 panes only when labels/plot become unreadable.
- Convert equal two-card rows to one column when their minimum chart widths cannot be maintained.
- Preserve left-before-right reading order.
- Keep Journey conversion cards in 2 × 2 and drop-off cards in three columns while legible.

### Mobile best-effort

- One content column.
- KPI cards in one or two columns based on minimum value/label fit.
- Stack paired cards and recommendation cards in screenshot order.
- Allow segmented controls to remain in card headers if they fit; otherwise move below title without changing option order.
- Use horizontal overflow for the Sankey rather than merging/removing stages.
- Preserve all data through accessible tabular fallbacks.

### Responsive safeguards

- No semantic section reordering.
- No hidden controls or insights.
- No chart label clipping.
- No business metric changes at breakpoints.
- Treat breakpoint values as implementation calibration until mobile/tablet references are supplied.

## 13. Known unresolved items that do not block the prototype

These items should remain configurable, mocked, unavailable, or conservatively inferred. They do not block building the approved desktop prototype.

### Visual uncertainties

- Exact CSS content width versus screenshot/device scale.
- Exact global font family and font files.
- Exact source design color tokens.
- Tooltips for standard charts and Journey.
- Date-pill picker interaction.
- Purchase-time `Theo ngày` alternate chart form.
- Expanded Combo recommendation layout.
- Expanded recommendation evidence layout.
- Visible Journey clear-selection affordance.
- Journey headline color conflict between screenshots and HTML.
- Tablet/mobile breakpoints and compositions.
- Exact populated-state animations outside Journey.
- Exact visual styling/copy for loading, empty, error, and unavailable states.

### Data uncertainties

- Canonical valid-order definition.
- Repeat-rate label versus “Customer Return Rate.”
- Full-history new/existing customer calculation.
- `create_time` versus `update_time` period membership.
- Business timezone.
- Currency code.
- Percentage source normalization.
- Cancellation date/reconciliation issues.
- Weekday-total production SQL.
- Shopping Mixed-order classification and revenue reconciliation.
- Product keyword classification accuracy.
- Journey production event contract.
- Comparison-period data for KPI deltas and cancellation summary.
- Recommendation priority formula, severity thresholds, generated copy, and evidence payload.

### Prototype handling

- Use audited fixtures with `dataStatus: "mock"`.
- Keep unsupported production fields nullable.
- Show the unavailable state when the application is switched from prototype fixtures to production mode without a backing contract.
- Record unresolved choices in code comments/configuration during implementation rather than embedding them as immutable business logic.

## 14. Verification and completion criteria

The prototype implementation phase will be complete when:

- Desktop section order exactly matches `UI_SPEC.md`.
- Every card shares the correct row and approximates the recorded ratio.
- No unapproved section or visible control exists.
- Each visual consumes its mapped typed fixture through the repository boundary.
- Standard charts reproduce the reference type, placement, density, labels, and color roles.
- Journey selection, connected-path highlighting, particles, and reduced-motion behavior work.
- Loading, empty, error, and unavailable states preserve layout.
- Keyboard navigation and accessible summaries are present.
- Reference-viewport screenshots are visually compared against all three source captures.
- Data mismatches remain visible in metadata/configuration and are not silently resolved.

No application code is created by this planning document.
