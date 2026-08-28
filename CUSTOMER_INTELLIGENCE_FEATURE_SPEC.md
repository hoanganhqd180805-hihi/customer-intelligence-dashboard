# Customer Intelligence — Feature, Chart & API Specification

> Tài liệu mô tả implementation **đang chạy hiện tại** trong repository.  
> Ngày rà soát: **27/08/2026** · Múi giờ mặc định đề xuất: **Asia/Ho_Chi_Minh**.

## 1. Mục đích tài liệu

Tài liệu này trả lời các câu hỏi:

- Customer Intelligence đang có những tính năng nào?
- Mỗi visualization là loại chart gì?
- Người dùng nên đọc và tương tác với chart như thế nào?
- Chart nhận input gì và tạo output gì?
- Chart hỗ trợ quyết định kinh doanh nào?
- Dữ liệu hiện tại đến từ đâu?
- Backend cần xây những API nào để thay thế fixture/local data?
- Công thức chi tiết của từng metric và API là gì?
- Những định nghĩa nào đã rõ và những điểm nào còn cần business xác nhận?

Tài liệu **không** coi những component/section cũ còn nằm trong repository là tính năng đang hoạt động. Nguồn xác định runtime hiện tại là:

```text
app/page.tsx
→ components/dashboard/DashboardPage.tsx
→ CustomerSegmentationSection
→ CustomerJourneySection
```

## 2. Phạm vi dashboard hiện tại

Dashboard đang render hai section:

```text
Customer Intelligence

01. Customer Overview
    ├── Time Range
    ├── Platforms
    ├── New vs Returning Customers
    ├── Customer Segmentation
    └── Customer Origin

02. Customer Journey
    ├── Time Range
    ├── 5 Conversion Rate cards
    ├── Customer Journey Sankey
    └── 5 Drop-off Rate cards
```

### 2.1 Nguồn dữ liệu hiện tại

| Phần | Nguồn hiện tại | Trạng thái |
|---|---|---|
| New vs Returning | `mapping data.xlsx` → fixture TypeScript | Dữ liệu local đã extract; browser không đọc Excel khi chạy |
| Customer Segmentation theo ngày | `mapping data.xlsx` → fixture TypeScript | Dữ liệu local đã extract |
| Top 3 sản phẩm theo New/Returning và segment | `mapping data.xlsx` → fixture TypeScript | Dữ liệu local đã extract |
| Customer Origin | `customer-origin.fixture.ts` | **Prototype/mock**, chưa phải dữ liệu workbook/production |
| Customer Journey graph | `MOCK DATA.xlsx`, sheet `Sankey Data` → fixture TypeScript | Mock source được duyệt cho prototype |
| Cancellation detail trong node Cancel | `mapping data.xlsx` → fixture TypeScript | Dữ liệu local đã extract |
| Conversion/Drop-off comparison | Config local trong component | **Demo**, chưa có previous-period API |

Các range local đang được import trực tiếp:

| Dataset | Workbook/sheet/range | Phạm vi hiện tại |
|---|---|---|
| New/Returning + Top 3 | `mapping data.xlsx` · `Customer journey!B320:J327` | 27/07/2026–02/08/2026, 7 ngày |
| Daily Segmentation + Top 3 | `mapping data.xlsx` · `Customer journey!B331:F359` | Header + 7 ngày × 4 segment |
| Journey graph | `MOCK DATA.xlsx` · `Sankey Data!A2:G45` | 44 source rows trước validation |
| Cancel reason detail | `mapping data.xlsx` · `Customer journey!B275:F284` | 9 reason rows + total lost revenue |
| Customer Origin | TypeScript prototype fixture | Không có workbook range production |

### 2.2 Luồng dữ liệu mục tiêu

```text
Database / Warehouse
→ API response (raw DTO)
→ Adapter + validation
→ Typed dashboard model
→ Chart component nhận data qua props
→ User interaction chỉ thay đổi presentation state
```

UI không được:

- đọc trực tiếp field name của database;
- tự phân loại New/Returning;
- tự chấm điểm RFM từ transaction thô;
- tự suy đoán missing data là zero;
- tự tạo dữ liệu Journey để bù flow không khớp;
- silently fallback sang mock trong production.

## 3. Bộ lọc và quy tắc dùng chung

### 3.1 Time Range

Input:

```ts
interface DateRange {
  startDate: string; // YYYY-MM-DD, inclusive
  endDate: string;   // YYYY-MM-DD, inclusive
}
```

Quy ước production:

- `startDate` inclusive: `event_time >= startDate 00:00:00`.
- `endDate` inclusive ở UI nhưng backend nên chuyển thành exclusive boundary: `event_time < endDate + 1 day`.
- Múi giờ phải được truyền hoặc cố định rõ, đề xuất `Asia/Ho_Chi_Minh`.
- Không so sánh timestamp UTC trực tiếp với ngày local mà không convert timezone.
- Khoảng previous period có cùng số ngày:

```text
periodDays = DATE_DIFF(endDate, startDate) + 1
previousEndDate = startDate - 1 day
previousStartDate = startDate - periodDays days
```

### 3.2 Platforms

Các lựa chọn hiện tại:

- Shopee
- TikTok Shop
- Lazada

UI hỗ trợ multi-select và bắt buộc chọn ít nhất một platform.

Giới hạn hiện tại: `DashboardPage` chưa truyền các dataset riêng theo platform, vì vậy selector mới thay đổi UI state nhưng vẫn dùng aggregate dataset. Production API phải nhận `platformIds[]` và lọc thật ở backend.

### 3.3 Quy tắc missing và zero

| Giá trị | Ý nghĩa |
|---|---|
| `0` | Có dữ liệu và kết quả thực tế bằng 0 |
| `null` | Metric không có/không khả dụng |
| Không có row | Không được tự hiểu là 0 nếu business chưa xác nhận |
| Empty array | Query thành công nhưng không có record trong phạm vi lọc |

## 4. Section 01 — Customer Overview

### 4.1 Mục đích tổng thể

Customer Overview trả lời ba nhóm câu hỏi:

1. Mỗi ngày có bao nhiêu khách mới và khách quay lại, tạo ra bao nhiêu doanh thu?
2. Tệp khách hàng đang phân bổ vào các nhóm RFM nào?
3. Khách hàng/doanh thu tập trung ở tỉnh thành nào?

Ba card được đặt cùng một hàng trên desktop để người dùng đối chiếu theo ba chiều: **lifecycle × value segment × geography**.

---

## 5. Chart 1 — New vs Returning Customers

### 5.1 Loại chart

**Stacked vertical column chart theo ngày** — biểu đồ cột đứng chồng.

- Trục X: ngày.
- Trục Y: Customer Count hoặc Revenue.
- Mỗi ngày là một cột.
- Phần `Returning` nằm dưới, `New` nằm trên.
- Tổng chiều cao cột bằng `New + Returning`.
- Không có trend line.
- Chiều cao chart cố định; chiều rộng co giãn theo card.

### 5.2 Mục đích sử dụng

Chart giúp:

- so sánh khả năng thu hút khách mới với giữ chân khách cũ theo ngày;
- phát hiện ngày acquisition tăng nhưng returning giảm, hoặc ngược lại;
- so sánh mix khách hàng bằng số lượng và bằng doanh thu;
- phát hiện nhóm nào tạo giá trị lớn hơn dù customer count nhỏ;
- xem Top 3 sản phẩm của New hoặc Returning tại từng ngày.

### 5.3 Cách sử dụng

1. Chọn **Time Range**.
2. Chọn một hoặc nhiều **Platforms**.
3. Chọn mode:
   - `Customer`: chiều cao segment dùng customer count.
   - `Revenue`: chiều cao segment dùng doanh thu tuyệt đối.
4. Hover/focus vào phần `New` hoặc `Returning` của một cột.
5. Tooltip xuất hiện ngay cạnh đúng phần cột đang được hover.
6. Bấm `Top 3 products ↓` để mở danh sách sản phẩm; danh sách không tự mở chỉ vì hover.
7. Tooltip không đóng khi con trỏ di chuyển từ bar sang vùng detail.

### 5.4 Input model hiện tại

```ts
interface NewReturningDailyPoint {
  date: string;
  newCustomers: number | null;
  returningCustomers: number | null;
  newRevenue: number | null;
  returningRevenue: number | null;
  newTopProducts?: TopProductMetric[];
  returningTopProducts?: TopProductMetric[];
}

interface TopProductMetric {
  productId: string;
  productName: string;
  rank: number;          // 1..3
  modelName?: string;
  orders?: number;
  quantitySold?: number;
}
```

### 5.5 Output hiển thị

Cho mỗi ngày:

```text
New segment height       = newCustomers hoặc newRevenue
Returning segment height = returningCustomers hoặc returningRevenue
Total column height      = New + Returning
Tooltip                  = date + New + Returning + Total
Disclosure               = Top 3 sản phẩm của segment được hover
```

### 5.6 Công thức business

#### 5.6.1 Tập valid orders

Trước khi tính customer type cần tạo tập đơn hợp lệ đã deduplicate:

```text
deduplicated_order = row mới nhất của mỗi order_id
valid_order = deduplicated_order
              AND cancel_reason IS NULL/blank
              AND normalized_order_status NOT IN approved_cancel_statuses
```

Danh sách cancellation status phải được business chốt. Các query lịch sử từng dùng các biến thể như `CANCELLED`, `IN_CANCEL`, `CANCEL`, `TO_CANCEL`.

#### 5.6.2 First order date

```text
first_order_date(customer)
= MIN(valid_order.order_date)
  trên TOÀN BỘ lịch sử được phê duyệt,
  không chỉ trong reporting window
```

Đây là điểm bắt buộc: nếu chỉ tìm `MIN(order_date)` sau khi đã lọc reporting window, returning customer cũ có thể bị phân loại sai thành New.

#### 5.6.3 New customer count

```text
new_customer_count(date)
= COUNT(DISTINCT customer_id)
  WHERE valid_order.order_date = date
    AND first_order_date(customer_id) = date
```

#### 5.6.4 Returning customer count

```text
returning_customer_count(date)
= COUNT(DISTINCT customer_id)
  WHERE valid_order.order_date = date
    AND first_order_date(customer_id) < date
```

Một customer chỉ được đếm một lần trong một ngày cho mỗi class dù có nhiều order.

#### 5.6.5 Revenue

Gọi `order_revenue` là field doanh thu canonical đã được business duyệt (gross, paid hay net phải thống nhất):

```text
new_revenue(date)
= SUM(order_revenue)
  WHERE order_date = date
    AND first_order_date(customer_id) = date

returning_revenue(date)
= SUM(order_revenue)
  WHERE order_date = date
    AND first_order_date(customer_id) < date

total_customer_revenue(date)
= new_revenue(date) + returning_revenue(date)
```

Không dùng customer share, order share hoặc rate thay cho absolute revenue.

#### 5.6.6 Top 3 products

Backend phải trả rank đã tính sẵn ở grain:

```text
date × platform scope × customer_type × product
```

Các measure:

```text
product_orders = COUNT(DISTINCT order_id)
quantity_sold  = SUM(quantity)
```

`NEEDS_CONFIRMATION`: workbook cung cấp rank nhưng chưa khóa công thức xếp hạng production. Đề xuất:

```text
ROW_NUMBER() OVER (
  PARTITION BY date, platform_scope, customer_type
  ORDER BY quantity_sold DESC,
           product_orders DESC,
           product_revenue DESC,
           product_id ASC
)
```

UI chỉ lấy rank `1..3`, không tự xếp lại bằng tên sản phẩm.

### 5.7 Quy tắc sampling ngày trên frontend

Frontend lọc theo range trước, sau đó lấy ngày để render:

| Độ dài range | Khoảng lấy điểm |
|---:|---:|
| 1–14 ngày | 1 ngày/điểm |
| 15–20 ngày | 2 ngày/điểm |
| 21–30 ngày | 3 ngày/điểm |
| >30 ngày | `ceil(dayCount / 12)` ngày/điểm |

Luôn giữ ngày đầu và ngày cuối. Ngày bị bỏ qua không được aggregate vào ngày kế tiếp.

---

## 6. Chart 2 — Customer Segmentation

### 6.1 Loại chart

**Stacked vertical column chart theo ngày** với bốn segment RFM.

- Trục X: ngày.
- Trục Y: Customer Count hoặc Revenue.
- Mỗi cột ngày được chồng bởi bốn segment.
- Tổng chiều cao cột là tổng toàn bộ segment trong ngày.
- Màu segment giữ cố định giữa các ngày và giữa hai mode.

Fallback legacy là donut snapshot nhưng runtime hiện tại dùng daily stacked columns khi daily dataset có dữ liệu.

### 6.2 Mục đích sử dụng

Chart giúp:

- theo dõi quy mô từng nhóm khách theo ngày;
- đánh giá segment nào đóng góp doanh thu cao hơn quy mô customer;
- theo dõi tệp Potential có dịch chuyển thành Top Buyers/Big Spenders không;
- nhận biết tỷ trọng Occasional Buyers quá lớn;
- xem Top 3 sản phẩm gắn với từng segment và ngày.

### 6.3 Các segment hiện tại

| Source label | Display label | Ý nghĩa |
|---|---|---|
| `VIP` | Top Buyers | Mua gần đây, mua nhiều lần và chi tiêu cao |
| `High Value` | Big Spenders | Chi tiêu cao nhưng tần suất mua chưa nhiều |
| `Potential` | Potential | Mua gần đây nhưng tần suất và chi tiêu chưa cao |
| `Low Value` | Occasional Buyers | Mua không thường xuyên và chưa có mức chi tiêu nổi bật |

Điều kiện source hiện tại:

```text
Top Buyers       = R >= 4 AND F >= 4 AND M >= 4
Big Spenders     = R >= 3 AND F >= 2 AND M >= 4, excluding Top Buyers
Potential        = R >= 4, excluding Top Buyers and Big Spenders
Occasional Buyers = all remaining customers
```

### 6.4 Cách sử dụng

1. Chọn `Customers` hoặc `Revenue`.
2. Hover/focus vào segment trong một cột ngày để xem:
   - ngày;
   - customer count hoặc revenue;
   - share của segment trong ngày;
   - định nghĩa segment.
3. Bấm `Top 3 products ↓` để mở sản phẩm của đúng segment/ngày.
4. Hover/focus legend để xem định nghĩa segment mà không cần click.

### 6.5 Input model

```ts
interface CustomerSegmentationDailyMetric {
  id: "vip" | "high_value" | "potential" | "low_value";
  sourceSegment: string;
  segment: string;
  definition: string;
  customerCount: number;
  customerShare: number;  // ratio 0..1
  totalOrders: number | null;
  revenue: number;
  revenueShare: number;   // ratio 0..1
  averageRecencyDays: number | null;
  averageFrequency: number | null;
  averageMonetary: number | null;
  color: string;
  topProducts?: TopProductMetric[];
}

interface CustomerSegmentationDailyPoint {
  date: string;
  segments: CustomerSegmentationDailyMetric[];
  totalCustomers: number;
  totalOrders: number | null;
  totalRevenue: number;
}
```

### 6.6 Công thức metric

Cho một ngày `d`:

```text
total_customers(d) = SUM(segment_customer_count(d, segment))

customer_share(d, segment)
= segment_customer_count(d, segment) / total_customers(d)

total_revenue(d) = SUM(segment_revenue(d, segment))

revenue_share(d, segment)
= segment_revenue(d, segment) / total_revenue(d)
```

Nếu denominator bằng 0, share trả `0`, không trả `NaN/Infinity`.

Adapter hiện tại bắt buộc:

- đủ bốn segment cho mỗi ngày;
- không duplicate `date × segment`;
- customer share và revenue share reconcile về 100% trong tolerance `0.02 percentage point` khi source đã cung cấp share;
- numeric field không âm;
- Top Product rank hợp lệ và không trùng.

### 6.7 Công thức RFM đề xuất cho production

Tại ngày snapshot `d` và trong RFM lookback được duyệt:

```text
RecencyDays(customer, d)
= DATE_DIFF(d, MAX(valid_order.order_date), DAY)

Frequency(customer, d)
= COUNT(DISTINCT valid_order.order_id)

Monetary(customer, d)
= SUM(valid_order.order_revenue)
```

`NEEDS_CONFIRMATION`: workbook cung cấp condition theo `R/F/M score` nhưng chưa xác định thuật toán biến raw Recency/Frequency/Monetary thành score 1–5. Phương án production thường dùng quintile:

```text
R_score = NTILE(5) OVER (ORDER BY RecencyDays DESC)
F_score = NTILE(5) OVER (ORDER BY Frequency ASC)
M_score = NTILE(5) OVER (ORDER BY Monetary ASC)
```

Như vậy recency càng nhỏ thì R càng cao; frequency/monetary càng lớn thì score càng cao. Cần khóa thêm:

- RFM lookback là lifetime, 90/180/365 ngày hay rolling window khác;
- cách xử lý tie ở biên quintile;
- segment được tính as-of từng ngày hay chỉ snapshot cuối kỳ;
- doanh thu segment là revenue phát sinh trong ngày hay lifetime value của member trong ngày.

Frontend không nên tự chấm RFM trước khi bốn điểm trên được duyệt.

---

## 7. Chart 3 — Customer Origin

### 7.1 Loại chart

**Horizontal ranked bar chart** — biểu đồ thanh ngang Top 10 tỉnh/thành.

- Trục Y: tỉnh/thành.
- Trục X: Customer Count hoặc Revenue.
- Danh sách được sort giảm dần theo mode đang chọn.
- Chỉ render Top 10.

### 7.2 Mục đích sử dụng

Chart giúp:

- xác định thị trường địa lý có nhiều khách nhất;
- xác định tỉnh có doanh thu cao nhất;
- so sánh tỉnh đông khách nhưng doanh thu thấp và ngược lại;
- ưu tiên campaign, inventory, logistics hoặc partnership theo địa phương;
- xem Top 3 sản phẩm theo tỉnh.

### 7.3 Cách sử dụng

1. Chọn `Customer` để rank theo customer count.
2. Chọn `Revenue` để rank theo doanh thu tuyệt đối.
3. Hover/focus một bar để xem customer count và revenue của tỉnh.
4. Bấm `Top 3 products ↓` trong tooltip để xem danh sách sản phẩm.

### 7.4 Input/output

```ts
interface CustomerOriginMetric {
  provinceId: string;
  province: string;
  customerCount: number;
  revenue: number;
}
```

Input bổ sung cho tooltip:

```ts
Record<provinceId, TopProductMetric[]>
```

Output:

```text
Customer mode → Top 10 sort by customerCount DESC
Revenue mode  → Top 10 sort by revenue DESC
Bar length    → value / niceAxisMaximum
```

### 7.5 Trạng thái dữ liệu

Customer Origin hiện vẫn là prototype fixture. Nó không được phép xuất hiện dưới nhãn “production actual” cho đến khi có source field địa chỉ/tỉnh chuẩn hóa.

### 7.6 Công thức production đề xuất

Trước hết cần normalize địa chỉ:

```text
province_id = canonical province code
province    = canonical province display name
```

Theo một quy tắc province attribution được business duyệt:

```text
customer_count(province)
= COUNT(DISTINCT customer_id)

revenue(province)
= SUM(valid_order.order_revenue)
```

`NEEDS_CONFIRMATION`: nếu một customer giao hàng ở nhiều tỉnh trong kỳ, cần chọn một trong các rule:

1. tỉnh của đơn hợp lệ gần nhất trong kỳ;
2. tỉnh trong customer master/profile;
3. đếm theo tỉnh của từng order — khi đó customer có thể xuất hiện ở nhiều tỉnh và tổng tỉnh không reconcile với unique customer toàn dashboard.

Khuyến nghị để customer count reconcile: dùng **latest valid shipping province as of endDate** cho customer count; revenue vẫn group theo shipping province của từng order.

Top Product theo tỉnh:

```text
province_product_orders = COUNT(DISTINCT order_id)
province_quantity_sold  = SUM(quantity)
province_product_revenue = SUM(line_revenue)
```

Ranking rule cần dùng cùng tie-breaker với Top Product ở chart New/Returning.

---

## 8. Section 02 — Customer Journey

### 8.1 Loại visualization

Section gồm ba lớp:

1. **Conversion Rate metric cards** — năm KPI card ở trên.
2. **Custom proportional Sankey diagram** — biểu đồ luồng chính.
3. **Drop-off Rate metric cards** — năm KPI card ở dưới.

Sankey không dùng `d3-sankey` hoặc ECharts Sankey. Geometry được tính bằng pure utility và render bằng SVG/React.

### 8.2 Mục đích sử dụng

Customer Journey giúp:

- nhìn toàn bộ hành trình từ nguồn ngoài đến kết quả đơn hàng;
- xác định flow nào mang nhiều traffic nhất qua độ dày ribbon;
- tìm bước có conversion thấp/drop-off cao;
- truy ngược upstream và downstream của một node;
- đánh giá đóng góp source/platform/content;
- kiểm tra Complete/Cancel/Processing;
- xem lý do hủy và doanh thu thất thoát;
- so sánh current period với previous period ở từng bước.

### 8.3 Các stage

```text
0 External Source
1 Marketplace / Platform
2 Content / Entry Driver
3 Product View
4 Add to Cart
5 Order
6 Order Result
7 Post-Purchase
```

Node hiện có gồm:

- External Source: Google, YouTube, Facebook, Instagram, Threads.
- Platform: Shopee, TikTok Shop, Lazada.
- Content: Ads, Affiliate, Livestream, Product Card, Shop Tab, Video.
- Product View.
- Add to Cart.
- Order.
- Order Result: Complete, Cancel, Processing.
- Post-Purchase: Return, Good Review, Bad Review, Buy Again.

Stage Post-Purchase hiện bị ẩn khỏi SVG chính nhưng vẫn được dùng trong detail của Complete.

### 8.4 Cách đọc Sankey

- Độ dày ribbon biểu thị `link.value`.
- Chiều cao node biểu thị `node.value`.
- Node và ribbon dùng cùng một global linear scale.
- Màu ribbon là gradient từ màu source sang target.
- Particle chuyển động theo centerline để gợi ý hướng luồng.
- Không hiển thị percentage cố định trên ribbon để tránh clutter.

### 8.5 Cách tương tác

- Hover/focus node: highlight toàn bộ upstream + downstream path đi qua node.
- Node không liên quan bị dim.
- Node có detail mở popover cạnh node.
- Rời node có delay 200 ms; đi vào popover sẽ hủy hide timer để người dùng đọc/click detail.
- Keyboard Enter/Space hoặc touch tap có thể giữ selection.
- Click/tap bên ngoài đóng detail.
- Hover/focus trend arrow trên card hiển thị current, previous và delta.
- Hover/focus `More detail` của Cancel mở cancellation reason + lost revenue.
- `prefers-reduced-motion` tắt moving particles.

### 8.6 Input model

```ts
interface JourneyNode {
  id: string;
  stage: string;
  label: string;
  value: number;
  color: string;
  meta: string;
}

type JourneyMetricSemantic =
  | "contribution_share"
  | "distribution_share"
  | "conversion_rate";

interface JourneyLink {
  id: string;
  source: string;
  target: string;
  value: number;
  label: string;
  rate?: number | null;       // ratio 0..1
  rateLabel?: string | null;
  metric?: JourneyMetricSemantic;
  sourceStep?: number;
  targetStep?: number;
  sourceGroup?: string | null;
  dataType?: string | null;
}
```

### 8.7 Tạo node/link từ raw Journey row

Raw row:

```ts
interface RawJourneyRow {
  source: string;
  target: string;
  value: number;
  sourceStep: number;
  targetStep: number;
  rate: number | string | null;
  stage?: string | null;
}
```

Ignore row chỉ khi:

- source blank;
- target blank;
- value blank/không phải number;
- `value <= 0`.

Self-link cùng step (`Shopee → Shopee`) được xem là platform direct-traffic summary, không render thành ribbon.

#### Node value trong adapter hiện tại

```text
Step 0 External Source:
node.value = SUM(outgoing link values)

Step 1 Marketplace:
node.value = SUM(external incoming links) + direct platform traffic

Step >= 2:
node.value = incomingTotal nếu incomingTotal > 0
             nếu không thì outgoingTotal
```

Nếu một intermediate node có incoming khác outgoing, adapter ghi nhận flow conflict; không tự rebalance.

#### Link semantic

```text
step 0 → 1 = contribution_share
step 1 → 2 = distribution_share
all other transitions = conversion_rate
```

### 8.8 Công thức tỷ lệ link

#### External Source → Platform

Đây là contribution, không phải funnel conversion:

```text
external_source_share(source, platform)
= traffic(source → platform)
  / SUM(all external-source traffic → platform)
  × 100
```

#### Platform → Content

Workbook hiện biểu diễn tỷ trọng đóng góp của platform vào từng content target:

```text
platform_distribution(platform, content)
= traffic(platform → content)
  / SUM(all platform traffic → content)
  × 100
```

#### Conversion link từ Content trở đi

```text
link_conversion_rate(source → target)
= converted_entity_count(source → target)
  / eligible_entity_count_at_source
  × 100
```

Production API nên trả cả `value`, `eligibleValue` và `rate`; không bắt frontend suy denominator từ node khi một node có nhiều loại unit.

### 8.9 Năm Conversion Rate cards

Card được hiển thị theo đúng thứ tự:

1. Platform → Content
2. Content → Product View
3. Product View → Add to Cart
4. Add to Cart → Order
5. Order → Complete

#### Platform → Content

```text
CVR_platform_content
= SUM(value of Platform → Content links)
  / SUM(Platform node values)
  × 100
```

#### Content → Product View

```text
CVR_content_product_view
= SUM(value of Content → Product View links)
  / SUM(Content node values)
  × 100
```

#### Product View → Add to Cart

```text
CVR_product_view_add_to_cart
= add_to_cart_count / product_view_count × 100
```

#### Add to Cart → Order

```text
CVR_add_to_cart_order
= orders_attributed_to_add_to_cart / add_to_cart_count × 100
```

#### Order → Complete

```text
CVR_order_complete
= completed_orders / total_orders × 100
```

Direct path `Product View → Order` vẫn xuất hiện trong Sankey nhưng không có conversion card riêng.

### 8.10 Drop-off Rate

Cho mỗi conversion step:

```text
dropoff_rate = 100% - conversion_rate
```

Biggest Drop-off:

```text
biggest_dropoff_step
= ARG_MAX(dropoff_rate across the five cards)
```

Không hardcode card được highlight. Nếu conversion >100% do data conflict thì drop-off có thể âm; backend/data pipeline phải report conflict, không clamp âm về 0 một cách im lặng.

### 8.11 Current vs Previous

Production:

```text
conversion_change_pp
= current_conversion_rate - previous_conversion_rate

current_dropoff_rate
= 100 - current_conversion_rate

previous_dropoff_rate
= 100 - previous_conversion_rate

dropoff_change_pp
= current_dropoff_rate - previous_dropoff_rate
= -conversion_change_pp
```

Trong UI:

- Conversion tăng: mũi tên xanh.
- Conversion giảm: mũi tên đỏ.
- Drop-off tăng: mũi tên đỏ.
- Drop-off giảm: mũi tên xanh.

Comparison change hiện tại là demo config local; production phải thay bằng previous-period API.

### 8.12 Cancellation detail

Input:

```ts
interface CancellationReasonMetric {
  reason: string;
  cancelledOrders: number;
  orderShare: number;
  lostRevenue: number;
  lostRevenueShare: number;
}
```

Công thức:

```text
cancelled_orders(reason)
= COUNT(DISTINCT cancelled_order_id)

total_cancelled_orders
= SUM(cancelled_orders(reason))

order_share(reason)
= cancelled_orders(reason) / total_cancelled_orders

lost_revenue(reason)
= SUM(order_revenue of cancelled orders for reason)

total_lost_revenue
= SUM(lost_revenue(reason))

lost_revenue_share(reason)
= lost_revenue(reason) / total_lost_revenue
```

Adapter từ chối data nếu `SUM(reason.lost_revenue) != total_lost_revenue`.

### 8.13 Full-path graph traversal

Với node được focus:

```text
upstream = DFS/BFS theo mọi link có target = current node
downstream = DFS/BFS theo mọi link có source = current node
activeNodes = union(upstream.nodes, downstream.nodes)
activeLinks = union(upstream.links, downstream.links)
```

Do đó focus `Product View` không chỉ highlight link kề trực tiếp mà giữ toàn bộ path thực sự đi qua node này.

### 8.14 Proportional SVG geometry

Coordinate system hiện tại:

```text
viewBox = 0 0 1820 440
margin = top 27, bottom 7, left 150, right 145
```

Global linear scale:

```text
scale = MIN(
  360 / maxNodeValue,
  availableHeight(stage) / SUM(node values in stage)
  cho mọi stage
)

nodeHeight = MAX(0.45, node.value × scale)
linkThickness = MAX(0.45, link.value × scale)
```

`0.45` chỉ là minimum render size để flow cực nhỏ vẫn nhìn thấy; node và link vẫn dùng cùng một scale.

## 9. Danh sách API cần xây

Đề xuất prefix:

```text
/api/v1/customer-intelligence
```

### API 1 — Filter metadata

```http
GET /api/v1/customer-intelligence/filters
```

Mục đích:

- trả platform khả dụng;
- trả min/max date;
- trả timezone, currency và data freshness;
- tránh hardcode filter option trong UI.

Output đề xuất:

```json
{
  "timezone": "Asia/Ho_Chi_Minh",
  "currency": "VND",
  "minDate": "2026-01-01",
  "maxDate": "2026-08-26",
  "platforms": [
    { "id": "shopee", "label": "Shopee" },
    { "id": "tiktok-shop", "label": "TikTok Shop" },
    { "id": "lazada", "label": "Lazada" }
  ],
  "lastUpdatedAt": "2026-08-27T00:00:00+07:00"
}
```

### API 2 — New vs Returning daily

```http
GET /api/v1/customer-intelligence/overview/new-returning
  ?startDate=YYYY-MM-DD
  &endDate=YYYY-MM-DD
  &platformIds=shopee,tiktok-shop,lazada
```

Output:

```json
{
  "points": [
    {
      "date": "2026-07-27",
      "newCustomers": 28,
      "returningCustomers": 4,
      "newRevenue": 2413802,
      "returningRevenue": 381800,
      "newTopProducts": [],
      "returningTopProducts": []
    }
  ],
  "missingValueRule": "unavailable",
  "currency": "VND",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

Backend áp dụng công thức tại mục 5.6. API trả tất cả ngày trong range hoặc explicit `null`; frontend mới áp dụng sampling để render.

### API 3 — Customer Segmentation daily

```http
GET /api/v1/customer-intelligence/overview/segmentation-daily
  ?startDate=YYYY-MM-DD
  &endDate=YYYY-MM-DD
  &platformIds=...
```

Output:

```json
{
  "points": [
    {
      "date": "2026-07-27",
      "totalCustomers": 100,
      "totalRevenue": 12000000,
      "segments": [
        {
          "id": "vip",
          "sourceSegment": "VIP",
          "segment": "Top Buyers",
          "customerCount": 12,
          "customerShare": 0.12,
          "revenue": 3600000,
          "revenueShare": 0.30,
          "averageRecencyDays": 4.2,
          "averageFrequency": 4.8,
          "averageMonetary": 300000,
          "topProducts": []
        }
      ]
    }
  ]
}
```

Backend áp dụng mục 6.6–6.7. API phải trả đủ bốn segment trên mỗi ngày, kể cả segment có value 0.

### API 4 — Customer Origin

```http
GET /api/v1/customer-intelligence/overview/origins
  ?startDate=YYYY-MM-DD
  &endDate=YYYY-MM-DD
  &platformIds=...
```

Output:

```json
{
  "origins": [
    {
      "provinceId": "79",
      "province": "TP. Hồ Chí Minh",
      "customerCount": 60,
      "revenue": 15600000,
      "topProducts": []
    }
  ],
  "provinceAttributionRule": "latest_valid_shipping_province",
  "currency": "VND"
}
```

API nên trả toàn bộ province có dữ liệu; UI tự sort và lấy Top 10 theo mode. Công thức ở mục 7.6.

### API 5 — Customer Journey graph

```http
GET /api/v1/customer-intelligence/journey/graph
  ?startDate=YYYY-MM-DD
  &endDate=YYYY-MM-DD
  &platformIds=...
```

Output đề xuất:

```json
{
  "stages": [
    { "step": 0, "id": "external-source", "label": "External Source" }
  ],
  "nodes": [
    {
      "id": "product-view",
      "stage": "PRODUCT VIEW",
      "label": "Product View",
      "value": 23700,
      "unit": "views"
    }
  ],
  "links": [
    {
      "id": "product-view-add-to-cart",
      "source": "product-view",
      "target": "add-to-cart",
      "sourceStep": 3,
      "targetStep": 4,
      "value": 8350,
      "eligibleValue": 23700,
      "rate": 0.3523,
      "metric": "conversion_rate"
    }
  ],
  "flowConflicts": []
}
```

Backend phải:

- loại invalid rows theo mục 8.7;
- tính rate theo mục 8.8;
- báo incoming/outgoing conflict;
- không tự cân bằng flow;
- không gửi negative value;
- giữ stable node/link id giữa các request để interaction không remount vô cớ.

### API 6 — Customer Journey step comparison

```http
GET /api/v1/customer-intelligence/journey/step-metrics
  ?startDate=YYYY-MM-DD
  &endDate=YYYY-MM-DD
  &platformIds=...
  &comparison=previous_period
```

Output:

```json
{
  "metrics": [
    {
      "stepId": "platform-content",
      "label": "Platform → Content",
      "currentConversionRate": 75.8,
      "previousConversionRate": 72.6,
      "conversionChangePp": 3.2,
      "currentDropoffRate": 24.2,
      "previousDropoffRate": 27.4,
      "dropoffChangePp": -3.2
    }
  ],
  "currentPeriod": {
    "startDate": "2026-08-01",
    "endDate": "2026-08-17"
  },
  "previousPeriod": {
    "startDate": "2026-07-15",
    "endDate": "2026-07-31"
  }
}
```

Formulas ở mục 8.9–8.11. Backend nên lấy cùng event snapshot với graph API để card và Sankey không lệch số.

### API 7 — Cancellation reasons

```http
GET /api/v1/customer-intelligence/journey/cancellations
  ?startDate=YYYY-MM-DD
  &endDate=YYYY-MM-DD
  &platformIds=...
```

Output:

```json
{
  "reasons": [
    {
      "reason": "need to modify order",
      "cancelledOrders": 6,
      "orderShare": 0.15,
      "lostRevenue": 649164,
      "lostRevenueShare": 0.087
    }
  ],
  "totalCancelledOrders": 40,
  "totalLostRevenue": 7451976,
  "currency": "VND"
}
```

Formulas ở mục 8.12. Tổng reason phải reconcile với totals.

## 10. API có thể gộp hay tách như thế nào

Để giảm request, có thể có endpoint orchestration:

```http
GET /api/v1/customer-intelligence/dashboard
```

Nhưng nội bộ vẫn nên giữ các service/query độc lập:

```text
CustomerOverviewService
├── getNewReturningDaily()
├── getSegmentationDaily()
└── getCustomerOrigins()

CustomerJourneyService
├── getJourneyGraph()
├── getStepMetrics()
└── getCancellationReasons()
```

Ưu điểm tách:

- một chart lỗi không làm hỏng toàn dashboard;
- cache theo dataset;
- test công thức dễ hơn;
- chart có thể loading độc lập.

Ưu điểm gộp ở BFF:

- giảm round trip;
- đảm bảo cùng reporting snapshot;
- đơn giản hóa initial page load.

Phương án phù hợp: frontend gọi một **BFF dashboard endpoint**, BFF gọi/compose các domain query độc lập.

## 11. Response envelope và trạng thái UI

Response production nên có metadata chung:

```ts
interface DashboardResponse<T> {
  data: T | null;
  status: "success" | "empty" | "unavailable";
  generatedAt: string;
  sourceAsOf: string;
  timezone: string;
  currency?: string;
  warnings?: Array<{
    code: string;
    message: string;
  }>;
}
```

Quy tắc:

- HTTP `200 + success`: có data.
- HTTP `200 + empty`: query hợp lệ, không có record.
- HTTP `200 + unavailable`: source chưa hỗ trợ metric/filter.
- HTTP `400`: invalid date/platform/filter.
- HTTP `401/403`: authentication/authorization.
- HTTP `409` hoặc `200 + warnings`: data conflict cần hiển thị/audit.
- HTTP `500/503`: query/service lỗi.

## 12. Data quality checks bắt buộc

### Customer Overview

- Không duplicate `date` ở New/Returning.
- Count/revenue không âm.
- New và Returning không dùng cùng một customer trong cùng ngày.
- `newRevenue + returningRevenue` reconcile với relevant total revenue.
- Mỗi ngày segmentation đủ bốn segment.
- Segment shares reconcile 100%.
- Top Product rank 1–3, không trùng rank trong cùng context.
- Province code normalize và không duplicate.

### Customer Journey

- Source/target không blank.
- Value > 0.
- Node label không xuất hiện ở nhiều step khác nhau.
- `rate` ratio nằm trong 0..1 đối với conversion/share bình thường; rate >1 phải có warning và business explanation.
- Contribution share vào mỗi platform reconcile 100%.
- Order Result flow nên reconcile:

```text
Complete + Cancel + Processing = Total Orders
```

- Cancellation reason totals reconcile.
- Current và previous period dùng cùng metric definition.
- Link/node unit phải rõ: traffic, view, action, order hay customer.

## 13. Những gì dashboard giúp doanh nghiệp làm được

| Câu hỏi kinh doanh | Visualization hỗ trợ |
|---|---|
| Khách mới hay khách quay lại đang tăng? | New vs Returning stacked columns |
| Nhóm nào tạo doanh thu nhiều dù ít khách? | Customer Segmentation Revenue mode |
| Segment nào nên retention/upsell? | Customer Segmentation + Top Products |
| Khu vực nào nên ưu tiên campaign/logistics? | Customer Origin ranked bars |
| Traffic đến từ đâu và đi qua content nào? | Sankey source/platform/content flows |
| Funnel rơi mạnh nhất ở bước nào? | Drop-off cards + Biggest Drop-off |
| Conversion đang tốt lên hay xấu đi? | Trend arrow current/previous tooltip |
| Vì sao đơn bị hủy và mất bao nhiêu doanh thu? | Cancel node More detail |
| Sản phẩm nào phù hợp với từng tệp khách? | Top 3 product disclosures |

## 14. Giới hạn hiện tại cần biết trước khi production hóa

1. Không có production API nào đang được Customer Overview/Customer Journey active runtime gọi.
2. Platform selector chưa lọc data thật vì không có per-platform dataset được truyền vào section.
3. Date Range của Customer Journey chỉ thay đổi UI state; Journey mock chưa có date-grained rows.
4. Date Range của Customer Overview hiện chỉ lọc New/Returning; daily segmentation và origin chưa đồng bộ filter.
5. Customer Origin là prototype/mock.
6. Customer Journey là mock workbook data, không phải production event stream.
7. Journey comparison changes đang là demo config local.
8. RFM threshold có nhưng cách chấm raw value thành score 1–5 chưa được source xác định đầy đủ.
9. Canonical valid-order và revenue definition cần được thống nhất giữa mọi API.
10. Journey intermediate flow có thể incoming/outgoing không khớp; production pipeline phải báo conflict thay vì che giấu.

## 15. Thứ tự triển khai API khuyến nghị

1. Chốt canonical order/customer/revenue/timezone definitions.
2. Xây Filter Metadata API.
3. Xây New vs Returning API và test full-history classification.
4. Chốt RFM scoring, sau đó xây Customer Segmentation Daily API.
5. Chốt province attribution, sau đó xây Customer Origin API.
6. Xây Journey event model và Journey Graph API.
7. Xây Step Comparison API bằng cùng query definitions.
8. Xây Cancellation Reasons API và reconcile Order Result.
9. Thêm adapter frontend cho từng raw DTO.
10. Bật production mode theo environment; không silent fallback về fixture.

## 16. Definition of Done cho production integration

- Tất cả chart nhận typed model qua props.
- Không component nào đọc raw API field trực tiếp.
- Mọi filter được backend áp dụng thật.
- Cùng date/platform filter tạo cùng reporting scope ở ba Overview card.
- Customer Journey graph và metric cards dùng cùng source snapshot.
- Có loading, empty, unavailable và error state độc lập cho từng dataset.
- Không có mock/fallback trong production nếu API lỗi.
- Metric test cover toàn bộ công thức và boundary date.
- Contract test kiểm tra percentage format là ratio hay percent.
- Data quality warnings được log/quan sát được.
- Dashboard không đọc file Excel từ máy người dùng ở runtime.

## 17. File implementation liên quan

| File | Vai trò |
|---|---|
| `components/dashboard/DashboardPage.tsx` | Page structure và section order |
| `components/dashboard/CustomerSegmentationSection.tsx` | Overview header/filter + New/Returning chart |
| `components/dashboard/CustomerSegmentationDailyCard.tsx` | Daily segmentation stacked chart |
| `components/dashboard/CustomerOriginMapCard.tsx` | Customer Origin horizontal bar chart |
| `components/dashboard/TopProductsTooltipContent.tsx` | Disclosure Top 3 sản phẩm dùng lại |
| `components/dashboard/CustomerJourneySection.tsx` | Journey cards, Sankey và node detail |
| `data/contracts/dashboard.ts` | Typed dashboard models |
| `data/adapters/customer-segmentation.adapter.ts` | Overview normalization/validation/sampling |
| `data/adapters/journey.adapter.ts` | Journey raw rows → nodes/links/audit |
| `data/adapters/cancellation.adapter.ts` | Cancellation reason normalization/reconciliation |
| `lib/journey/graph.ts` | Upstream/downstream/full-path traversal |
| `lib/journey/layout.ts` | Global proportional SVG geometry |
| `data/fixtures/customer-overview-latest-workbook.fixture.ts` | Latest Overview Excel-derived local rows |
| `data/fixtures/customer-origin.fixture.ts` | Prototype Customer Origin rows |
| `data/fixtures/journey.fixture.ts` | Latest Journey mock workbook extraction |
| `data/fixtures/journey-cancellation.fixture.ts` | Excel-derived cancellation detail |
