# Customer Intelligence UI Specification

## 1. Purpose and authority

This document records the supplied dashboard screenshots as the UI source of truth. It defines faithful reproduction requirements only; it does not authorize implementation or redesign.

### Source precedence

| Source | Authority |
|---|---|
| Screenshots in `REF/` | Overall layout, section order, desktop grid, chart placement, card proportions, controls, visual hierarchy, spacing, colors, and insight-card placement. |
| `DATA_SPEC.md` | Metrics, dimensions, SQL/query logic, business definitions, mock/sample values, and production-data status. |
| `Hanh_Trinh_Khach_Hang.html` | Customer Journey Sankey behavior, animation, node/link interaction, drop-off treatment, and conversion-trend presentation where present. |

### Reference inventory

Three screenshots were inspected, each `926 × 1326px`:

- `REF/Ảnh màn hình 2026-08-11 lúc 8.57.38 CH.png`
- `REF/Ảnh màn hình 2026-08-11 lúc 8.57.47 CH.png`
- `REF/Ảnh màn hình 2026-08-11 lúc 8.57.51 CH.png`

The screenshots are overlapping vertical captures of one desktop dashboard. The small chat/interface fragment above the first dashboard heading is not part of the dashboard.

### Conflict handling

If a visual element lacks production data, preserve its location and structure and render the correct unavailable state. Do not remove or repurpose it. If a screenshot value conflicts with `DATA_SPEC.md`, use the screenshot only as a visual/mock fixture and keep the data mismatch explicit.

## 2. Exact dashboard section order

The desktop page order is:

1. Dashboard header
   - Eyebrow: `Customer Intelligence`
   - Page title: `Customer Intelligence Overview`
   - Date-range control aligned right
2. Overview KPI grid
   - Total customers
   - Total orders
   - Revenue
   - AOV
   - Return/repeat rate card
   - Cancellation rate card
3. `01. Thống kê theo từng loại khách hàng`
   - Daily customer trend
   - Revenue composition by customer type
4. `02. Thời điểm mua hàng & Phân tích lý do huỷ đơn`
   - Purchase-time card
   - Cancellation-reason card
5. `03. Xu hướng mua sắm`
   - Shopping composition card
   - Best-selling product category/card
   - Full-width Combo recommendation summary strip
6. `04. Customer Journey`
   - Journey header/instructions
   - Four conversion summary cards
   - Sankey
   - Three drop-off cards
   - Full-width Journey insight panel
7. `05. Đề xuất tổng hợp`
   - Recommendation-section header
   - Four recommendation cards in a 2 × 2 grid

No additional dashboard section is visible or authorized.

## 3. Overall desktop layout

- Single vertically scrolling dashboard.
- Centered content column on a very light gray/off-white page background.
- Measured content width is approximately `748px` within the `926px` screenshots, leaving roughly `80–90px` side margins in the later captures. The first capture appears offset about `32px` left due to capture/crop alignment; the card width remains approximately `748px`.
- All numbered sections share the same content edges.
- Section titles sit outside cards, above their content.
- The design is compact, with no visible left navigation, top navigation, or sidebar.
- The only global control visible is the date-range pill at the upper right.
- There is no visible sticky header.

Exact production maximum width in CSS units is **NEEDS_CONFIRMATION** because screenshots do not reveal browser zoom/device scale. Preserve the observed proportions rather than assuming screenshot pixels equal CSS pixels.

## 4. Desktop grid structure and shared rows

| Region | Desktop grid | Cards sharing a row |
|---|---|---|
| Header | Two-column alignment | Title block left; date control right |
| KPI area | Three equal columns × two rows | Row 1: customers, orders, revenue. Row 2: AOV, repeat/return rate, cancellation rate. |
| Section 01 | One full-width compound card with asymmetric internal split | Trend chart left; revenue doughnut/legend right |
| Section 02 | Two equal columns | Purchase timing left; cancellation reasons right |
| Section 03 primary row | Two equal columns | Shopping composition left; best-selling products right |
| Section 03 secondary row | One full-width strip | Combo recommendation summary |
| Section 04 | One full-width column | Journey subcomponents stack vertically within the dark card |
| Journey summary | Two equal columns × two rows | Four conversion cards |
| Journey drop-offs | Three equal columns | Three transition drop-off cards |
| Journey insight | One full-width panel | Biggest drop-off, order quality, post-purchase signal stacked within it |
| Section 05 | Two equal columns × two rows | Four recommendation cards |

Approximate gaps:

- Equal-column card gutters: `14–16px`.
- KPI gutters: approximately `12px` horizontally and vertically.
- Section title to card: approximately `12–16px`.
- Major section-to-section gap: approximately `28–34px`.
- Internal Journey card gaps: approximately `12px`.

## 5. Card dimensions and alignment

Measurements are approximate screenshot ratios, not CSS pixel mandates.

| Component | Approximate screenshot size | Width:height ratio | Alignment behavior |
|---|---:|---:|---|
| KPI card | `241 × 109px` | `2.2:1` | Equal width and height; content top-left |
| Section 01 compound card | `748 × 357px` | `2.1:1` | Full width; internal vertical divider |
| Section 01 trend pane | about 70% of card width | — | Left pane |
| Section 01 revenue pane | about 30% of card width | — | Right pane |
| Section 02 card | `366 × 343px` | `1.07:1` | Equal paired cards |
| Section 03 primary card | `366 × 337px` | `1.09:1` | Equal paired cards |
| Combo recommendation strip | `748 × 67px` | `11.2:1` | Full-width compact disclosure row |
| Journey spotlight | `748px` wide; tall/content-driven | approximately `0.55–0.65:1` overall | Full width; large vertical composition |
| Journey conversion card | approximately half inner width × `80px` | about `4:1` | Two columns, left-aligned text |
| Journey drop-off card | approximately one third inner width × `63px` | about `3.4:1` | Three equal columns |
| Journey insight panel | full inner width × about `273px` | about `2.4:1` | Three stacked insight blocks |
| Section 05 recommendation card | about `365 × 225px` | about `1.6:1` | Equal 2 × 2 cards |

Alignment rules:

- Section headings, subtitles, and outer cards share a common left edge.
- Paired cards share top and bottom alignment.
- Card titles and subtitles align top-left.
- Controls inside cards align top-right on the same header row as the card title block.
- KPI labels, values, and deltas form consistent vertical baselines across all six cards.
- Recommendation priority score aligns top-right within each recommendation card.

## 6. Header and overview KPI area

### Header

- Small muted eyebrow above a larger black page title.
- Date filter is a rounded light-gray pill aligned with the title region on the right.
- Visible date format: `DD/MM/YYYY – DD/MM/YYYY`.
- No visible page-level subtitle, export button, refresh button, or comparison selector.

### KPI cards

- Six lightly tinted/white cards with thin gray borders.
- First row and second row contain three equal cards each.
- Internal order: muted metric label, prominent deep-blue value, small blue change indicator.
- Change indicator uses an up/down arrow plus percentage.
- Cards do not show icons, sparklines, or menus.
- Values in screenshots are visual fixtures only; bind production values to `OverviewMetrics` from `DATA_SPEC.md`.

### Data mismatch

The screenshot labels the fifth KPI `Tỷ lệ quay lại`, which visually supports “repeat/returning customer rate.” This is consistent with the SQL formula but differs from the workbook sample label “Customer Return Rate.” Preserve the screenshot label structure and resolve final localized terminology through the data-definition decision in `DATA_SPEC.md`.

## 7. Section 01 — customer types

### Placement and card structure

- Full-width section directly below the KPI grid.
- Numbered section title on one line; muted one-line subtitle beneath.
- One compound rounded card divided vertically into a wide left pane and narrow right pane.

### Left pane: daily customer trend

- Title: `Xu hướng khách hàng theo ngày`.
- Supporting subtitle below the card title.
- Two-series line chart.
- Deep blue series: new customers.
- Green series: existing/returning customers.
- Legend centered above the plot.
- Small circular points at each date.
- Numeric data labels above points.
- Very light dotted horizontal gridlines.
- X-axis dates use compact day/month labels.
- Y-axis tick labels are not visibly emphasized.
- Bind to `CustomerTypeDailyPoint`.

### Right pane: revenue composition

- Title: `Cơ cấu doanh thu`.
- Supporting subtitle: by customer type.
- Doughnut chart centered in upper-middle of pane.
- `100%` appears in the doughnut center.
- Legend/value rows sit beneath the chart rather than beside it.
- New customer uses deep blue; existing customer uses cyan.
- Right-aligned percentage values.
- Bind to `CustomerRevenueContribution`.

### Data caution

Customer classification remains partially supported because first-order history is period-limited in the supplied SQL. Preserve this UI and use mock fixtures until the production definition is corrected.

## 8. Section 02 — purchase timing and cancellations

### Shared row

- Two equal-width cards.
- Section title joins both topics with `&`.
- One muted subtitle spans the section above both cards.

### Left card: purchase timing

- Title and subtitle top-left.
- Two-option segmented control top-right: `Khung giờ` and `Theo ngày`.
- `Khung giờ` is active in the screenshot with a solid medium-blue fill and white text.
- Inactive option uses gray text on a very light neutral background.
- Main visual is a 7-row × 6-column heatmap.
- Weekdays appear as left-side row labels from Monday through Sunday.
- Time-slot labels appear across the top.
- Cells are rounded rectangles/squares with a pale-lavender-to-deep-blue intensity scale.
- No numeric cell labels or visible legend are shown.
- Bind active heatmap to `PurchaseTimeSlotTotal`.
- Bind `Theo ngày` to `WeekdayOrderTotal` only if the screenshot’s intended alternate view is confirmed; the toggle label literally means “By day,” but its exact alternate chart rendering is not shown. Alternate rendering is **NEEDS_CONFIRMATION**.

### Time-slot visual/data mismatch

Screenshot labels appear shortened to `00–06`, `06–09`, `09–12`, `12–15`, `15–18`, and `18–24`. `DATA_SPEC.md` defines inclusive labels ending at `05:59`, `08:59`, `11:59`, `14:59`, `17:59`, and `23:59`. Preserve the compact screenshot label style while mapping each label to the exact source interval; do not change boundaries.

### Right card: cancellation reasons

- Title and subtitle top-left.
- Horizontal ranked-bar presentation.
- Six visible reason rows in the mock screenshot.
- Reason label left, blue progress bar center, bold percentage right.
- Tracks use a very light cool-gray/blue background.
- Two small bordered summary cards share the bottom row:
  - `Thiệt hại kỳ này` with a prominent blue lost-revenue value.
  - `So với kỳ trước` with a blue downward percentage.
- Bind reason bars to `CancellationReasonMetric`.
- Bind current-period loss to aggregate lost revenue from that dataset.
- Previous-period comparison is unsupported by `DATA_SPEC.md`; preserve its card position but show unavailable in production until a comparison contract exists.

## 9. Section 03 — shopping trends

### Shared primary row

- Two equal-width cards below the numbered heading/subtitle.

### Left card: shopping composition

- Title: `Cơ cấu mua sắm`.
- Subtitle references Combo, retail, and mixed.
- Two-option segmented control top-right: `Tỷ lệ đơn` active; `Doanh thu` inactive.
- Doughnut chart on the left with `100%` centered.
- Three category/value rows to the right: Combo, Retail, Mixed.
- Colors: deep blue, medium blue, cyan.
- A pale blue insight callout sits below the category rows with a strong blue left border.
- Bind `Tỷ lệ đơn` to the count/share form of `ShoppingCompositionMetric`.
- Bind `Doanh thu` to the revenue/share form of `ShoppingCompositionMetric`.
- Both datasets remain prototype-only until missing classification logic and reconciliation are resolved.

### Right card: best-selling products

- Title: `Danh mục sản phẩm bán chạy`.
- Subtitle: top products by purchase type.
- Segmented control top-right: `Bán lẻ` active; `Combo` inactive.
- Ranked list of five rows.
- Each row contains a zero-padded rank, product name, and right-aligned blue value.
- Thin horizontal separators between rows.
- No product image or chart is shown.
- Bind to `ProductPerformanceRow`, filtered by product type.
- Screenshot values appear as unit/count totals; exact displayed measure must map to the approved `total_quantity_sold` field. If the visual reference intended another measure, **NEEDS_CONFIRMATION**.

### Full-width Combo recommendation strip

- Compact bordered disclosure row below the paired cards.
- Left side contains a small diamond-like icon, bold `Đề xuất Combo`, and a muted explanatory line.
- Right side shows a blue `5 đề xuất` action with a downward chevron.
- Bind count and expanded content to `ProductPairRow` (top five pairs in supplied SQL).
- Collapsed state is shown. Expanded layout and interaction are **NEEDS_CONFIRMATION**.

## 10. Section 04 — Customer Journey

### Overall placement and visual language

- Full-width, tall, dark navy spotlight card immediately after the Combo recommendation strip.
- Large rounded corners.
- Cyan eyebrow badge and uppercase `CUSTOMER JOURNEY` label.
- Main title and explanatory body copy below.
- Instruction pill with a glowing cyan dot: click a node to trace the full journey.
- Preserve the dark gradient, subtle star/particle field, cyan positive emphasis, orange/pink stage colors, red drop-off emphasis, thin translucent borders, and glow treatment from the screenshots and `Hanh_Trinh_Khach_Hang.html`.

The Journey headline appears near-black against the navy surface in the screenshots, while the standalone HTML establishes light foreground text on that surface. This is a direct visual-reference conflict. Headline color is **NEEDS_CONFIRMATION** and must not be silently “corrected” during faithful reproduction.

### Internal order

1. Eyebrow and title block
2. Instruction pill
3. Four conversion cards in a 2 × 2 grid
4. Sankey
5. Three drop-off cards in one row
6. One full-width insight panel

The screenshot Journey stage labels are:

- Platform
- Content
- Product View
- Order
- Order Result
- Post-Purchase

Visible mock nodes include Shopee, Ads, Product View, Order, Complete, Cancel, Good Review, Bad Review, and Buy Again. These values/stages are prototype-only unless a production Journey contract supplies them.

### Conversion cards

- Two columns and two rows.
- Large cyan percentage, smaller muted transition label beneath.
- Dark translucent card fill and subtle border.
- Screenshot transitions: Ads → Product View; Product View → Order; Order → Complete; Complete → Good Review.

### Sankey placement

- Full-width within the spotlight card, below conversion cards.
- Considerably wider than tall in the screenshot.
- Stage headers sit above nodes.
- Links are thin for most transitions, with a large translucent orange Ads flow block at the left.
- Labels and values remain attached to nodes.

### Drop-off cards

- Three equal cards in one row below the Sankey.
- Percentage on first line; transition on second.
- Largest drop-off card uses red border/fill emphasis and red value.
- Remaining cards use neutral dark styling with white values.

### Insight panel

- Full inner width beneath drop-off cards.
- Blue/cyan-tinted dark surface with cyan border.
- Three stacked blocks separated by thin dividers:
  1. `BIGGEST DROP-OFF`
  2. `ORDER QUALITY`
  3. `POST-PURCHASE SIGNAL`
- Each block uses a small uppercase muted label, cyan bold finding, and explanatory sentence.
- Bind all content to approved Journey data or deterministic backend insight rules. Production data is currently unsupported; preserve layout and use unavailable state rather than HTML constants.

## 11. Customer Journey interaction rules

The screenshots change the reference emphasis from the HTML’s hover-only behavior to an explicit click instruction. Required behavior:

1. Default state shows all available nodes and links.
2. Clicking a node selects it and highlights the complete connected journey/path through that node.
3. Unrelated links and nodes dim while the selection remains active.
4. Clicking the selected node again, clicking empty canvas, or using an explicit clear behavior restores the full graph. Exact clear affordance is **NEEDS_CONFIRMATION** because it is not visible.
5. Hover may provide transient highlighting consistent with the HTML, but click is the persistent primary interaction shown in the dashboard.
6. Keyboard focus and activation must provide the same behavior as click.
7. Touch uses tap-to-select.
8. Moving particles communicate flow direction, following the HTML interaction reference.
9. Continuous motion stops under `prefers-reduced-motion`; selected-path emphasis remains available without motion.
10. Tooltips may expose exact node/link values if the reference implementation does; tooltip styling/content is **NEEDS_CONFIRMATION** because screenshots do not show one.

## 12. Section 05 — consolidated recommendations

### Outer section

- Large full-width light card/container after the Journey section.
- Header has a very pale blue tint.
- Header left: small blue `AI Insights` label plus muted `Customer Intelligence`; bold numbered section title below.
- Header right: muted `Phát hiện` label and prominent blue `4 đề xuất` count.
- Four recommendation cards arranged in two equal columns and two rows.

### Recommendation card anatomy

- Rounded white/off-white card with thin gray border.
- Top-left category pill.
- Small muted status line below pill.
- Top-right uppercase `MỨC ƯU TIÊN`, large numeric score, and severity label.
- Bold recommendation headline in the middle.
- Muted explanatory body copy below.
- Bottom divider.
- Blue `Hiện cơ sở phân tích` disclosure action with a downward chevron.

### Semantic colors visible

- High priority: red score and red/pink category pill.
- Medium priority: orange score and orange category pill.
- Links/actions: medium blue.
- Cards remain neutral; semantic color is concentrated in pills, scores, and actions.

### Data mapping

The four visible recommendation themes reference:

- Retention/repeat customer behavior → overview repeat rate and customer-type datasets.
- Ads → Product View conversion → Customer Journey data, currently unsupported for production.
- Combo expansion → shopping composition and product performance datasets, currently partially supported/prototype-only.
- High-value cancellation loss → cancellation reason dataset, with period/reconciliation issues.

`DATA_SPEC.md` does not define recommendation priority scores, severity thresholds, generated copy, or “analysis basis” payloads. Preserve the entire visual structure but treat recommendation content and scoring as **NEEDS_CONFIRMATION** for production. Screenshot content may be used as mock data only.

## 13. Visible tabs, toggles, buttons, and filters

| Control | Location | Visible options/state | Data mapping/status |
|---|---|---|---|
| Date-range pill | Page header, right | One displayed range | Global period metadata; picker behavior **NEEDS_CONFIRMATION** |
| `Khung giờ / Theo ngày` | Purchase-time card, top-right | `Khung giờ` active | Time-slot dataset / weekday dataset; alternate rendering **NEEDS_CONFIRMATION** |
| `Tỷ lệ đơn / Doanh thu` | Shopping-composition card, top-right | `Tỷ lệ đơn` active | Count-share / revenue-share shopping composition |
| `Bán lẻ / Combo` | Product-list card, top-right | `Bán lẻ` active | Product performance filtered by type |
| `5 đề xuất` + chevron | Combo recommendation strip, right | Collapsed | Product pair rows; expanded UI **NEEDS_CONFIRMATION** |
| Journey node selection | Sankey nodes | Instruction says click node | Journey nodes/links; mock-only currently |
| `Hiện cơ sở phân tích` + chevron | Each recommendation card | Collapsed | Explanation/evidence payload unsupported; expanded UI **NEEDS_CONFIRMATION** |

No visible store selector, export button, refresh button, search, chart menu, pagination, or navigation tabs are shown. Do not add them during faithful reproduction.

## 14. Typography hierarchy

The reference uses a clean modern sans-serif throughout. Exact family is not provable from screenshots; dashboard font family remains **NEEDS_CONFIRMATION**. Do not automatically apply the Journey HTML fonts globally.

Approximate hierarchy:

| Role | Approximate appearance |
|---|---|
| Page title | 24–26px, regular/medium, black |
| Section title | 18–20px, regular/medium, black |
| Card title | 14–16px, bold |
| KPI value | 19–21px, bold, deep blue |
| KPI label | 12–13px, regular, muted gray |
| Section/card subtitle | 11–12px, regular, muted gray |
| Chart label/legend | 10–11px |
| Toggle/button | 10–12px, medium |
| Recommendation headline | 14–16px, bold |
| Priority score | 27–30px, bold |
| Journey eyebrow | 11–12px, bold, uppercase, widely tracked, cyan |
| Journey conversion value | 20–23px, bold, cyan |
| Journey insight eyebrow | 10–11px, uppercase, tracked, muted blue-gray |

Typography rules:

- Use black/near-black for primary headings on light surfaces.
- Use medium gray for explanatory text.
- Use deep blue for dashboard KPI values and primary actions.
- Use cyan for Journey emphasis on the dark surface.
- Avoid excessive bold; reserve it for titles, values, and recommendation findings.

## 15. Spacing system

The screenshot consistently suggests a compact approximately 4px-based rhythm, commonly using 8, 12, 16, 24, and 32px intervals.

Observed approximate spacing:

- Page side inset relative to content: about `80–90px` in the 926px capture.
- Header to KPI grid: `18–22px`.
- KPI internal padding: `16px`.
- Section title to subtitle: `6–8px`.
- Subtitle to card: `12–16px`.
- Major section separation: `28–34px`.
- Paired-card gutter: `14–16px`.
- Card internal padding: `16px` for standard cards.
- Recommendation card internal padding: `14–16px`.
- Journey outer padding: approximately `32px`.
- Journey internal gaps: approximately `12px` between cards and `18–22px` between major blocks.

Exact CSS tokens are **NEEDS_CONFIRMATION** because screenshot scaling is unknown. Preserve relative density and alignment.

## 16. Radius, borders, backgrounds, and color

### Light dashboard surfaces

- Page background: very light gray/off-white, approximately `#FAFAFA` to `#F7F7F7`.
- Standard cards: white or subtly warm off-white.
- Standard border: thin `1px` light gray, approximately `#D9D9D9` to `#E2E2E2`.
- Standard card radius: approximately `14–16px`.
- KPI/card shadows are absent or extremely subtle; borders define structure.
- Dividers use a thin pale gray.
- Section 05 outer header uses a pale blue tint.

### Controls

- Segmented-control container: pale neutral fill, thin gray border, approximately `10–12px` radius.
- Active segment: medium blue, white text, approximately `7–9px` radius.
- Date pill: light gray fill, no prominent border, rounded approximately `10–12px`.
- Category pills: small outlined/soft-filled capsules with semantic red or orange color.

### Core light-theme colors

- Primary deep blue: approximately `#1608D4` to `#1B00D6`.
- Interactive medium blue: approximately `#3B82F6`.
- Green customer series: approximately `#22A657`.
- Cyan secondary share: approximately `#79E1DF`.
- Main text: approximately `#111111`.
- Secondary text: approximately `#666666`.
- Light tracks/callouts: cool pale blue, approximately `#EEF4FD`.

### Journey surface

- Outer radius: approximately `22–24px`.
- Background: deep navy/near-black gradient, consistent with HTML reference (`#0A0F2B` toward `#050714`).
- Inner cards: translucent navy with thin blue-gray borders.
- Insight panel: dark blue/cyan-tinted fill with cyan border.
- Positive/accent: cyan (`#86EAE9` reference).
- Negative/drop-off: red (`#E2504A` reference).
- Stage-specific orange, magenta, cyan, green, and red are retained from the Sankey reference.

Exact sampled color tokens remain **NEEDS_CONFIRMATION** pending source design tokens or an original-resolution design file. The approximate palette above is sufficient for faithful visual matching, not brand-token declaration.

## 17. Chart presentation rules

### General

- Charts sit inside bordered rounded cards; section titles remain outside the cards except card-specific titles.
- Legends and labels use compact text and avoid heavy axes.
- Gridlines are very light and sparse.
- Values are directly labeled where the screenshot shows them.
- Color usage is consistent across related visuals.
- Tooltips are not visible in screenshots; tooltip content and styling are **NEEDS_CONFIRMATION**.
- Never substitute unsupported metrics to fill a visual.
- Preserve zero, empty, unavailable, and error as distinct states.
- Mock values require explicit prototype labeling outside production.

### Confirmed visual types

| Visual | Type | Placement |
|---|---|---|
| Customer trend | Two-series line chart with point/value labels | Section 01, wide left pane |
| Customer revenue composition | Doughnut plus two-row legend | Section 01, narrow right pane |
| Purchase time | 7 × 6 intensity heatmap | Section 02, left card |
| Cancellation reasons | Ranked horizontal progress bars | Section 02, right card |
| Shopping composition | Doughnut plus three-row values and callout | Section 03, left card |
| Product performance | Ranked five-row list/table | Section 03, right card |
| Customer Journey | Animated Sankey | Section 04, central full-width plot |
| Journey trend | Not visible in the supplied dashboard screenshots | Do not add to the visible layout solely because the standalone HTML contains it; placement **NEEDS_CONFIRMATION** |

The last point is a source reconciliation: the HTML is authoritative for conversion-trend presentation, but the supplied dashboard screenshots do not visibly include a trend panel. Preserve the screenshot layout. A trend should only be added if another screenshot/state confirms its intended placement.

## 18. Responsive behavior

Only the desktop reference is supplied. Desktop layout is fixed by Sections 3–5. Tablet and mobile compositions remain **NEEDS_CONFIRMATION**.

Faithful responsive constraints:

- Preserve exact section order.
- Preserve within-section reading order when columns stack: left card/pane before right card/pane.
- KPI cards should retain the screenshot order when reducing columns.
- Do not reorder recommendation cards by priority unless the reference specifies it.
- Do not remove toggles, legends, or insight cards.
- Tables/lists may wrap or scroll; required values must remain accessible.
- Journey stage order must remain left-to-right semantically even if the viewport requires horizontal scrolling.
- The HTML reference confirms that Journey conversion summaries change from four columns to two below `980px` in that version; the dashboard screenshot already uses a 2 × 2 summary grid at its desktop content width. Preserve 2 × 2 unless a wider reference shows otherwise.
- Journey insight content stacks vertically as shown.
- Reduced motion disables continuous particles without removing selected-path highlighting.

Breakpoint values, mobile date-filter placement, mobile toggle wrapping, mobile Sankey scale/scroll, and Section 05 card stacking are **NEEDS_CONFIRMATION**.

## 19. Insight and recommendation layout rules

### Inline analytical insight

- Shopping composition includes one small pale-blue callout under the value list.
- It has a strong blue left border, compact body text, and no icon.
- Content derives from the displayed shopping dataset; because production classification is incomplete, use mock content only in prototype mode.

### Journey insights

- One large full-width insight panel inside the dark Journey card.
- Three vertically stacked findings separated by dividers.
- Uses uppercase micro-label, cyan bold finding, then light explanatory sentence.
- No separate conversion-trend card appears in the dashboard screenshots.

### Consolidated recommendations

- Four equal recommendation cards in 2 × 2 layout within a larger outer section.
- Priority score is always top-right.
- Category/status remains top-left.
- Evidence disclosure remains anchored at the bottom.
- Card bodies align so evidence rows form consistent baselines.
- Recommendation scoring and evidence payload are not defined in `DATA_SPEC.md`; production remains **NEEDS_CONFIRMATION**.

## 20. Loading, empty, error, and unavailable states

The screenshots show populated states only. Exact icons, copy, and colors are **NEEDS_CONFIRMATION**, but state geometry must preserve the reference layout.

### Loading

- Keep section title, card boundaries, and active controls visible.
- Use skeletons shaped like the eventual content: KPI lines, line plot, doughnut, heatmap cells, ranked rows, list rows, Sankey, or recommendation text blocks.
- Preserve card heights to prevent page reflow.
- Do not show temporary zeroes.
- Journey particles remain stopped until valid links load.

### Empty

- Use when a successful response has no records for the active period/filters.
- Preserve the card and chart area.
- Show concise no-data copy and active period context.
- Do not render a misleading all-zero visual, except source queries intentionally returning a complete zero grid.

### Error

- Preserve the affected card footprint.
- Show concise failure copy and retry where supported.
- Retain current control selections.
- Do not expose SQL or raw backend errors.
- Other successfully loaded sections remain intact.

### Unavailable data

- Use when the visual component is required but the production metric/query is unsupported or unresolved.
- Preserve the exact visual component position and approximate dimensions.
- Label unavailable distinctly from empty or zero.
- Never insert screenshot/HTML mock values into production.
- In prototype mode, mock values may populate the reference layout only with a visible mock-data indicator.

### Known unavailable/partial placements

- Journey Sankey, conversion cards, drop-off cards, and insight panel: production unsupported.
- Cancellation comparison mini-card: comparison contract unsupported.
- Shopping composition: production SQL/classification incomplete.
- Weekday alternate view: production query missing and rendering unshown.
- Consolidated recommendation scores, severity, generated copy, and evidence: unsupported.
- Combo disclosure expanded content: not shown.

## 21. Visual component to data mapping

| Visual component | `DATA_SPEC.md` dataset/field | Status/mismatch |
|---|---|---|
| Six KPI cards | `OverviewMetrics` | Partially supported; valid-order consistency and repeat-rate label unresolved |
| KPI delta arrows | No comparison dataset specified | Mock-only / unavailable in production |
| Date pill | Period metadata | Date boundary display must reflect start-inclusive/end-exclusive contract |
| Daily two-line chart | `CustomerTypeDailyPoint` | First-order history logic requires correction |
| Revenue doughnut | `CustomerRevenueContribution` | Timestamp filtering inconsistency |
| Purchase heatmap | `PurchaseTimeSlotTotal` | Supported provisionally; timezone unresolved; compact labels map to exact slots |
| `Theo ngày` alternate | `WeekdayOrderTotal` | Sample only; SQL and alternate visual unconfirmed |
| Cancellation bars | `CancellationReasonMetric` | Query period conflicts with main sample period |
| Cancellation loss mini-card | Aggregate `lost_revenue` | Reconciliation required |
| Cancellation comparison mini-card | No supplied dataset | Unsupported |
| Shopping doughnut, count mode | `ShoppingCompositionMetric` count/share | Prototype-only; Mixed definition missing |
| Shopping doughnut, revenue mode | `ShoppingCompositionMetric` revenue/share | Prototype-only; overview reconciliation missing |
| Shopping insight callout | Derived from shopping composition | Rule/copy unsupported |
| Product ranked list | `ProductPerformanceRow` | Provisional; keyword classification risk |
| Retail/Combo toggle | `product_type` | Supported provisionally |
| Combo recommendation count/list | `ProductPairRow` | Top-five co-purchase pairs; not causal recommendations |
| Journey conversion summaries | `JourneyTransition` | Mock-only; no production source |
| Journey Sankey | `JourneyNode`, `JourneyLink` | Mock-only; no production source |
| Journey drop-offs | `JourneyTransition` | Mock-only; denominator/attribution undefined |
| Journey insight panel | Journey metrics plus insight rules | Unsupported |
| Four consolidated recommendation cards | No consolidated recommendation contract | Unsupported; themes can reference existing datasets but scores/copy cannot be inferred |

## 22. Remaining confirmations

- **NEEDS_CONFIRMATION:** exact CSS content width and browser/device scale
- **NEEDS_CONFIRMATION:** exact dashboard font family and weights
- **NEEDS_CONFIRMATION:** exact brand/design color tokens
- **NEEDS_CONFIRMATION:** tooltip design and behavior
- **NEEDS_CONFIRMATION:** date pill picker/dropdown behavior
- **NEEDS_CONFIRMATION:** purchase-time `Theo ngày` alternate visualization
- **NEEDS_CONFIRMATION:** Combo recommendation expanded state
- **NEEDS_CONFIRMATION:** recommendation evidence expanded state
- **NEEDS_CONFIRMATION:** Journey selection-clear affordance
- **NEEDS_CONFIRMATION:** Journey tooltip behavior
- **NEEDS_CONFIRMATION:** Journey headline color conflict between screenshots and standalone HTML
- **NEEDS_CONFIRMATION:** whether/where the standalone HTML conversion trend belongs, since it is absent from screenshots
- **NEEDS_CONFIRMATION:** tablet and mobile grids/breakpoints
- **NEEDS_CONFIRMATION:** exact populated-state transition animations outside Customer Journey
- **NEEDS_CONFIRMATION:** exact loading/empty/error/unavailable visual treatments

No application code is included or authorized by this specification.
