"use strict";
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = new Intl.NumberFormat("en-US"),
  compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }),
  pct = (v) => `${(v * 100).toFixed(1)}%`;
const data = {
  overview: [
    ["Total Customers", 488, ""],
    ["Total Orders", 530, ""],
    ["Revenue", 57671416, "₫"],
    ["AOV", 108813.99, "₫"],
    ["Repeat Customer Rate", 0.7738, "%"],
    ["Cancellation Rate", 0.1667, "%"],
  ],
  customerDaily: [
    [0, 0],
    [4, 1],
    [15, 3],
    [24, 9],
    [29, 12],
    [29, 9],
    [14, 6],
    [22, 4],
    [25, 12],
    [24, 8],
    [24, 3],
    [22, 12],
    [17, 11],
    [9, 2],
    [8, 5],
    [1, 0],
    [0, 0],
  ],
  revenueTypes: [
    { name: "New Customers", share: 0.6911, color: "#180bd4" },
    { name: "Returning Customers", share: 0.3089, color: "#16a085" },
  ],
  weekdays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  slots: [
    "00:00 - 05:59",
    "06:00 - 08:59",
    "09:00 - 11:59",
    "12:00 - 14:59",
    "15:00 - 17:59",
    "18:00 - 23:59",
  ],
  heat: [
    [22, 7, 10, 7, 12, 10],
    [26, 14, 10, 17, 11, 11],
    [30, 25, 6, 10, 11, 5],
    [22, 7, 9, 13, 5, 8],
    [30, 15, 10, 15, 4, 6],
    [19, 10, 6, 11, 12, 7],
    [24, 10, 19, 8, 11, 5],
  ],
  segments: [
    ["Dormant", 192, 0.3934, 22872121, 0.3966, "#8A839C"],
    ["New Customers", 179, 0.3668, 18368331, 0.3185, "#3B82F6"],
    ["Regular Customers", 98, 0.2008, 11159748, 0.1935, "#7086A8"],
    ["Potential", 16, 0.0328, 3269197, 0.0567, "#20A7A1"],
    ["At Risk", 2, 0.0041, 1113299, 0.0193, "#E47B52"],
    ["VIP", 1, 0.002, 888720, 0.0154, "#7457D9"],
  ].map(([name, count, countShare, revenue, revenueShare, color]) => ({
    name,
    count,
    countShare,
    revenue,
    revenueShare,
    color,
  })),
  mix: [
    ["Bundle", 80, 0.3238866397, 11545411, 0.3837, "#180bd4"],
    ["Single-item", 137, 0.5546558704, 13507069, 0.4489, "#4a99d2"],
    ["Mixed", 30, 0.1214574899, 5034040, 0.1673, "#86eae9"],
  ].map(([name, orders, orderShare, revenue, revenueShare, color]) => ({
    name,
    orders,
    orderShare,
    revenue,
    revenueShare,
    color,
  })),
  products: {
    retail: [
      ["Kẹo Mayora Cà Phê Kopiko 560G", 15],
      ["Cà Phê Sữa Hòa Tan Mayora Kopiko Macchiato 400G", 12],
      ["Bánh Quy Bơ Mayora Danisa 200G", 10],
      ["Kẹo Cà Phê Sữa Mayora Kopiko 140G", 8],
      ["Bánh Quy Bơ Mayora Danisa 681G", 7],
    ],
    combo: [
      ["Combo 2 Hủ Kẹo Cà Phê Sữa Kopiko 560G", 7],
      ["Cà Phê Sữa Hòa Tan Mayora Kopiko Macchiato 400G", 7],
      ["Bánh Quy Mayora Danisa Chocofello 150G", 6],
      ["Cà Phê Sữa Hòa Tan Mayora Kopiko Macchiato 400G", 5],
      ["Combo Best Seller", 5],
    ],
  },
  pairs: [
    [
      "Bánh quy Danisa Chocofello 150g",
      "Bánh Quy Bơ & Cacao Danisa Abbracci Hộp 168g",
      3,
    ],
    [
      "BÁNH QUY BƠ DANISA 200G",
      "Bánh Quy Bơ & Cacao Danisa Abbracci Hộp 168g",
      2,
    ],
    [
      "BÁNH QUY SỮA MỚI MAYORA D-MAXX MARIE - HỘP GIẤY 308G",
      "BÁNH QUY BƠ & CACAO MAYORA DANISA ABBRACCI HỘP 168G",
      2,
    ],
    [
      "Bánh Xốp Mayora Superstar Triple Choco Hộp 150G",
      "Bánh Xốp Mayora Wafello Chocolate 210G",
      2,
    ],
    [
      "BÁNH QUY BƠ MAYORA DANISA 200G",
      "BÁNH QUY BƠ & CACAO MAYORA DANISA ABBRACCI HỘP 168G",
      2,
    ],
  ],
  cancellations: [
    [
      "modify existing order (colour, size, address, voucher, etc.)",
      29,
      5149401,
    ],
    ["other", 19, 2029562],
    ["need to input / change voucher code", 13, 1697365],
    ["need to change delivery address", 10, 1200881],
    ["need to modify order", 9, 735961],
    ["unpaid order", 7, 660315],
    ["found cheaper elsewhere", 7, 492519],
    ["don't want to buy anymore", 6, 802900],
    ["failed delivery", 3, 305000],
    ["payment procedure too troublesome", 2, 161000],
    ["out of stock", 1, 40300],
  ],
  channels: [
    ["Ads", 79000, 10000],
    ["Video", 22000, 1800],
    ["Shop Tab", 15000, 2000],
    ["Affiliate", 23000, 8000],
    ["Livestream", 15000, 8000],
    ["Product Card", 4000, 1900],
  ],
  platforms: [
    ["Shopee", 110000, 100000],
    ["TikTok Shop", 60000, 40000],
    ["Lazada", 14500, 9000],
  ],
  recommendations: [
    [
      "Conversion",
      94,
      "Ads generate 10,000 Product Views, but the transition rate is only 12.7%.",
      "Reduce Friction Before Product View",
      "Review product links, CTAs, offers, and the Ads landing experience before increasing traffic.",
    ],
    [
      "Channel Effectiveness",
      88,
      "Ads have the highest activity, but their 12.7% CVR is below the 24.1% Content median.",
      "Optimize Ads Before Scaling Traffic",
      "Check tracking, product links, CTAs, placements, targeting, and content relevance.",
    ],
    [
      "Operations",
      82,
      "The 16.7% cancellation rate is associated with 13.3M ₫ in revenue loss.",
      "Prioritize the Highest-Impact Cancellation Reason",
      "Review order modification and provide guidance before customers cancel.",
    ],
    [
      "Customer Segmentation",
      76,
      "Potential customers represent 3.3% of customers but contribute 5.7% of revenue.",
      "Increase Value Conversion from Potential",
      "Test repurchase reminders, bundles, or next-purchase offers.",
    ],
  ],
};
function segmented(root, options, value, onChange) {
  root.innerHTML = options
    .map(
      (o) =>
        `<button type="button" role="radio" aria-checked="${o[0] === value}" data-value="${o[0]}">${o[1]}</button>`,
    )
    .join("");
  $$("button", root).forEach((b) =>
    b.addEventListener("click", () => onChange(b.dataset.value)),
  );
}
function overview() {
  $("#overview").innerHTML = data.overview
    .map(([label, value, unit]) => {
      let display =
        unit === "%"
          ? pct(value)
          : unit === "₫"
            ? `${compact.format(value)} ₫`
            : fmt.format(value);
      return `<div class="kpi"><span>${label}</span><strong>${display}</strong><small>Comparison unavailable</small></div>`;
    })
    .join("");
}
function trend() {
  const root = $("#customer-trend"),
    w = 900,
    h = 310,
    p = { l: 35, r: 15, t: 25, b: 35 },
    max = 40,
    x = (i) => p.l + (i * (w - p.l - p.r)) / (data.customerDaily.length - 1),
    y = (v) => p.t + (1 - v / max) * (h - p.t - p.b),
    path = (k) =>
      data.customerDaily
        .map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d[k])}`)
        .join(" ");
  root.innerHTML = `<div style="font-size:11px;color:#707070">● <span style="color:#180bd4">New Customers</span> &nbsp; ● <span style="color:#16a085">Returning Customers</span></div><svg viewBox="0 0 ${w} ${h}">${[0, 10, 20, 30, 40].map((t) => `<line x1="${p.l}" y1="${y(t)}" x2="${w - p.r}" y2="${y(t)}" stroke="#e8ebf1"/><text x="28" y="${y(t) + 4}" text-anchor="end" font-size="9" fill="#888">${t}</text>`).join("")}<path d="${path(0)}" fill="none" stroke="#180bd4" stroke-width="2.5"/><path d="${path(1)}" fill="none" stroke="#16a085" stroke-width="2.5"/>${data.customerDaily.map((d, i) => `<circle cx="${x(i)}" cy="${y(d[0])}" r="3" fill="#180bd4"><title>May ${i + 1}: ${d[0]} new customers</title></circle><circle cx="${x(i)}" cy="${y(d[1])}" r="3" fill="#16a085"><title>May ${i + 1}: ${d[1]} returning customers</title></circle>`).join("")}</svg>`;
}
function donut(
  root,
  items,
  getShare,
  getPrimary,
  { threshold = 0, totalLabel = "Total", totalValue = "100%", size = 260 } = {},
) {
  let selected = null,
    hover = null;
  const render = () => {
    let off = 0,
      cx = 130,
      cy = 110,
      r = 68,
      c = 2 * Math.PI * r,
      active = items.find((x) => x.name === (selected || hover));
    let arcs = items.map((it) => {
      let share = getShare(it),
        start = off;
      off += share;
      return { it, share, start };
    });
    root.innerHTML = `<div style="position:relative;width:${size}px;max-width:100%;height:220px;margin:auto"><svg viewBox="0 0 260 220" aria-label="Donut chart"><circle cx="130" cy="110" r="68" fill="none" stroke="#edf0f5" stroke-width="28"/>${arcs.map(({ it, share, start }) => `<circle class="arc" tabindex="0" role="button" aria-pressed="${selected === it.name}" data-name="${it.name}" cx="130" cy="110" r="68" fill="none" stroke="${it.color}" stroke-width="${selected === it.name ? 31 : 28}" stroke-dasharray="${share * c} ${c}" stroke-dashoffset="${-start * c}" transform="rotate(-90 130 110)" opacity="${(selected || hover) && !(selected || hover === it.name) ? 1 : 1}"><title>${it.name}: ${getPrimary(it)} · ${pct(share)}</title></circle>`).join("")}${arcs
      .filter((a) => a.share >= threshold)
      .map(({ it, share, start }) => {
        let a = -Math.PI / 2 + (start + share / 2) * Math.PI * 2,
          lr = 82,
          x = cx + Math.cos(a) * lr,
          y = cy + Math.sin(a) * lr,
          anchor =
            Math.abs(Math.cos(a)) < 0.18
              ? "middle"
              : Math.cos(a) > 0
                ? "start"
                : "end";
        return `<text x="${x}" y="${y + 4}" text-anchor="${anchor}" fill="${it.color}" font-size="12" font-weight="700">${pct(share)}</text>`;
      })
      .join(
        "",
      )}</svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;text-align:center"><div><small style="color:#777">${active ? active.name : totalLabel}</small><strong style="display:block;color:#17366f;font-size:20px">${active ? getPrimary(active) : totalValue}</strong><small style="color:#777">${active ? pct(getShare(active)) : "100%"}</small></div></div></div>`;
    $$(".arc", root).forEach((a) => {
      const name = a.dataset.name;
      a.addEventListener("mouseenter", () => {
        if (!selected) {
          hover = name;
          render();
        }
      });
      a.addEventListener("mouseleave", () => {
        if (!selected) {
          hover = null;
          render();
        }
      });
      a.addEventListener("click", (e) => {
        e.stopPropagation();
        selected = selected === name ? null : name;
        render();
      });
      a.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selected = selected === name ? null : name;
          render();
        }
      });
    });
    root.firstElementChild.addEventListener("click", () => {
      selected = null;
      render();
    });
    root.dispatchEvent(
      new CustomEvent("donut-render", { detail: { selected } }),
    );
  };
  render();
  return { render };
}
function revenueDonut() {
  donut(
    $("#revenue-donut"),
    data.revenueTypes,
    (x) => x.share,
    (x) => pct(x.share),
    { totalLabel: "Revenue Composition", totalValue: "100%", size: 240 },
  );
  $("#revenue-donut").insertAdjacentHTML(
    "beforeend",
    `<div class="legend">${data.revenueTypes.map((x) => `<div><i class="dot" style="background:${x.color}"></i>${x.name}</div>`).join("")}</div>`,
  );
}
function heatmap() {
  let max = 30;
  $("#heatmap").innerHTML =
    `<div class="heatmap"><span></span>${data.slots.map((s) => `<span class="axis">${s}</span>`).join("")}${data.weekdays.map((d, r) => `<span class="axis">${d}</span>${data.heat[r].map((v, c) => `<div class="cell" title="${d}, ${data.slots[c]}: ${v} orders" style="background:color-mix(in srgb,#180bd4 ${20 + (v / max) * 80}%,white)"></div>`).join("")}`).join("")}</div>`;
}
let segmentMode = "count";
function segment() {
  segmented(
    $("#segment-controls"),
    [
      ["count", "Customer Count"],
      ["revenue", "Revenue Contribution"],
    ],
    segmentMode,
    (v) => {
      segmentMode = v;
      segment();
    },
  );
  let share = (x) => (segmentMode === "count" ? x.countShare : x.revenueShare),
    primary = (x) =>
      segmentMode === "count"
        ? fmt.format(x.count)
        : `${compact.format(x.revenue)} ₫`;
  donut($("#segment-donut"), data.segments, share, primary, {
    threshold: 0.05,
    totalLabel: segmentMode === "count" ? "Total Customers" : "Total Revenue",
    totalValue:
      segmentMode === "count" ? "488" : `${compact.format(57671416)} ₫`,
    size: 280,
  });
  $("#segment-legend").innerHTML = data.segments
    .map(
      (x) =>
        `<button data-name="${x.name}"><i class="dot" style="background:${x.color}"></i>${x.name}</button>`,
    )
    .join("");
}
let mixMode = "orders";
function mix() {
  segmented(
    $("#mix-controls"),
    [
      ["orders", "Order Share"],
      ["revenue", "Revenue"],
    ],
    mixMode,
    (v) => {
      mixMode = v;
      mix();
    },
  );
  let share = (x) => (mixMode === "orders" ? x.orderShare : x.revenueShare),
    primary = (x) =>
      mixMode === "orders"
        ? `${fmt.format(x.orders)} orders`
        : `${compact.format(x.revenue)} ₫`;
  donut($("#mix-donut"), data.mix, share, primary, {
    totalLabel: mixMode === "orders" ? "Order Share" : "Revenue",
    totalValue: "100%",
    size: 220,
  });
  $("#mix-legend").innerHTML = data.mix
    .map(
      (x) =>
        `<div><i class="dot" style="background:${x.color}"></i>${x.name}</div>`,
    )
    .join("");
  $("#mix-insight").textContent =
    mixMode === "orders"
      ? "Single-item purchases account for the largest share of orders."
      : "Single-item purchases lead revenue, while Bundles contribute disproportionately relative to their order share.";
}
let productMode = "retail";
function products() {
  segmented(
    $("#product-controls"),
    [
      ["retail", "Single-item"],
      ["combo", "Bundle"],
    ],
    productMode,
    (v) => {
      productMode = v;
      products();
    },
  );
  $("#product-list").innerHTML = data.products[productMode]
    .map(
      (x, i) =>
        `<li><span>${String(i + 1).padStart(2, "0")}</span><span>${x[0]}</span><strong>${x[1]}</strong></li>`,
    )
    .join("");
  $("#pair-list").innerHTML = data.pairs
    .map(
      (x, i) =>
        `<li>${String(i + 1).padStart(2, "0")} · <b>${x[0]}</b> + <b>${x[1]}</b> · ${x[2]} orders</li>`,
    )
    .join("");
}
$("#pair-toggle").addEventListener("click", () => {
  let l = $("#pair-list"),
    open = l.hidden;
  l.hidden = !open;
  $("#pair-toggle").setAttribute("aria-expanded", open);
});
const journeyRows = [
  ["Google", "Shopee", 32000, 0, 1, 0.2909],
  ["Google", "TikTok Shop", 8000, 0, 1, 0.1333],
  ["YouTube", "Shopee", 24000, 0, 1, 0.2182],
  ["YouTube", "Lazada", 4000, 0, 1, 0.2759],
  ["YouTube", "TikTok Shop", 18000, 0, 1, 0.3],
  ["Facebook", "Shopee", 28000, 0, 1, 0.2545],
  ["Facebook", "Lazada", 5500, 0, 1, 0.3793],
  ["Facebook", "TikTok Shop", 12000, 0, 1, 0.2],
  ["Instagram", "Shopee", 18000, 0, 1, 0.1636],
  ["Instagram", "Lazada", 3500, 0, 1, 0.2414],
  ["Instagram", "TikTok Shop", 16000, 0, 1, 0.2667],
  ["Threads", "Shopee", 8000, 0, 1, 0.0727],
  ["Threads", "Lazada", 1500, 0, 1, 0.1034],
  ["Threads", "TikTok Shop", 6000, 0, 1, 0.1],
  ["Shopee", "Ads", 70000, 1, 2, 0.8861],
  ["Shopee", "Affiliate", 18000, 1, 2, 0.7826],
  ["Shopee", "Livestream", 12000, 1, 2, 0.8],
  ["Shopee", "Video", 10000, 1, 2, 0.4545],
  ["Lazada", "Ads", 9000, 1, 2, 0.1139],
  ["TikTok Shop", "Affiliate", 5000, 1, 2, 0.2174],
  ["TikTok Shop", "Livestream", 3000, 1, 2, 0.2],
  ["TikTok Shop", "Product Card", 4000, 1, 2, 1],
  ["TikTok Shop", "Shop Tab", 15000, 1, 2, 1],
  ["TikTok Shop", "Video", 12000, 1, 2, 0.5455],
  ["Ads", "Product View", 10000, 2, 3, 0.1266],
  ["Affiliate", "Product View", 8000, 2, 3, 0.3478],
  ["Livestream", "Product View", 8000, 2, 3, 0.5333],
  ["Product Card", "Product View", 1900, 2, 3, 0.475],
  ["Shop Tab", "Product View", 2000, 2, 3, 0.1333],
  ["Video", "Product View", 1800, 2, 3, 0.0818],
  ["Product View", "Add to Cart", 8350, 3, 4, 0.2634],
  ["Add to Cart", "Order", 4320, 4, 5, 0.5174],
  ["Product View", "Order", 7580, 3, 5, 0.2391],
  ["Order", "Complete", 9150, 5, 6, 0.7689],
  ["Order", "Cancel", 2380, 5, 6, 0.2],
  ["Order", "Processing", 360, 5, 6, 0.0303],
  ["Complete", "Return", 120, 6, 7, 0.0131],
  ["Complete", "Good Review", 7450, 6, 7, 0.8142],
  ["Complete", "Bad Review", 1560, 6, 7, 0.1705],
  ["Complete", "Buy Again", 1250, 6, 7, 0.1366],
];
function sankey() {
  const svg = $("#sankey"),
    stages = [
      "EXTERNAL SOURCE",
      "MARKETPLACE",
      "CONTENT / ENTRY DRIVER",
      "PRODUCT VIEW",
      "ADD TO CART",
      "ORDER",
      "ORDER RESULT",
      "POST-PURCHASE",
    ],
    colors = {
      Google: "#4285F4",
      YouTube: "#FF0000",
      Facebook: "#1877F2",
      Instagram: "#E4405F",
      Threads: "#aaa",
      Shopee: "#EE4D2D",
      Lazada: "#1E88E5",
      "TikTok Shop": "#25F4EE",
      Ads: "#F2A93B",
      Affiliate: "#25C7B7",
      Livestream: "#9B6DFF",
      "Product Card": "#4ADE80",
      "Shop Tab": "#22D3EE",
      Video: "#4C8DFF",
      "Product View": "#86eae9",
      "Add to Cart": "#4ade80",
      Order: "#e0498f",
      Complete: "#86eae9",
      Cancel: "#E2504A",
      Processing: "#aaa",
      Return: "#aaa",
      "Good Review": "#86EAE9",
      "Bad Review": "#E2504A",
      "Buy Again": "#4ADE80",
    };
  let defs = new Map();
  journeyRows.forEach((r) => {
    defs.set(r[0], { name: r[0], step: r[3] });
    defs.set(r[1], { name: r[1], step: r[4] });
  });
  let nodes = [...defs.values()],
    byStep = Array.from({ length: 8 }, (_, s) =>
      nodes.filter((n) => n.step === s),
    );
  byStep.forEach((arr, s) =>
    arr.forEach((n, i) => {
      n.x = 120 + s * 220;
      n.y = 60 + ((i + 1) * 470) / (arr.length + 1);
      n.color = colors[n.name] || "#86eae9";
    }),
  );
  let map = new Map(nodes.map((n) => [n.name, n])),
    maxFlow = Math.max(...journeyRows.map((row) => row[2])),
    selected = null,
    hover = null;
  nodes.forEach((node) => {
    node.incoming = journeyRows
      .filter((row) => row[1] === node.name)
      .reduce((total, row) => total + row[2], 0);
    node.outgoing = journeyRows
      .filter((row) => row[0] === node.name)
      .reduce((total, row) => total + row[2], 0);
    node.value = Math.max(node.incoming, node.outgoing);
  });
  const ancestors = (id) => {
      let set = new Set([id]),
        changed = true;
      while (changed) {
        changed = false;
        journeyRows.forEach((r) => {
          if (set.has(r[1]) && !set.has(r[0])) {
            set.add(r[0]);
            changed = true;
          }
        });
      }
      return set;
    },
    desc = (id) => {
      let set = new Set([id]),
        changed = true;
      while (changed) {
        changed = false;
        journeyRows.forEach((r) => {
          if (set.has(r[0]) && !set.has(r[1])) {
            set.add(r[1]);
            changed = true;
          }
        });
      }
      return set;
    };
  const render = () => {
    let focus = selected || hover,
      active = focus ? new Set([...ancestors(focus), ...desc(focus)]) : null;
    svg.innerHTML = `<defs><filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${stages.map((s, i) => `<text x="${120 + i * 220}" y="24" text-anchor="middle" fill="#99a7cf" font-size="12" font-weight="700">${s}</text>`).join("")}${journeyRows
      .map((r, i) => {
        let a = map.get(r[0]),
          b = map.get(r[1]),
          on = !active || (active.has(r[0]) && active.has(r[1])),
          th = Math.max(0.7, (r[2] / maxFlow) * 18),
          d = `M${a.x},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x},${b.y}`;
        return `<g opacity="${on ? 0.86 : 0.05}"><path d="${d}" fill="none" stroke="${a.color}" stroke-opacity=".45" stroke-width="${th}"/><text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 4}" text-anchor="middle" fill="#c8d2f1" font-size="9">${pct(r[5])}</text>${!matchMedia("(prefers-reduced-motion: reduce)").matches ? `<circle r="2" fill="${a.color}"><animateMotion dur="${3 + (i % 3)}s" repeatCount="indefinite" path="${d}"/></circle>` : ""}</g>`;
      })
      .join(
        "",
      )}${nodes.map((n) => `<g class="snode" data-name="${n.name}" tabindex="0" role="button" aria-pressed="${selected === n.name}" opacity="${!active || active.has(n.name) ? 1 : 0.15}"><circle cx="${n.x}" cy="${n.y}" r="12" fill="#0a1024" stroke="${n.color}" stroke-width="${selected === n.name ? 4 : 2}" filter="url(#glow)"/><text x="${n.x + 18}" y="${n.y + 4}" fill="#eef1f8" font-size="12" font-weight="700">${n.name}</text></g>`).join("")}`;
    $$(".snode", svg).forEach((g) => {
      let n = g.dataset.name;
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        selected = selected === n ? null : n;
        render();
      });
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selected = selected === n ? null : n;
          render();
        }
      });
      g.addEventListener("mouseenter", (e) => {
        if (!selected) {
          hover = n;
          render();
        }
        let t = $("#journey-tooltip");
        t.hidden = false;
        const node = map.get(n);
        t.textContent = `${n} · ${fmt.format(node.value)} flow · ${fmt.format(node.incoming)} incoming · ${fmt.format(node.outgoing)} outgoing`;
        t.style.left = `${Math.min(innerWidth - 220, e.clientX + 12)}px`;
        t.style.top = `${Math.min(innerHeight - 60, e.clientY + 12)}px`;
      });
      g.addEventListener("mouseleave", () => {
        $("#journey-tooltip").hidden = true;
        if (!selected) {
          hover = null;
          render();
        }
      });
    });
    svg.onclick = () => {
      selected = null;
      render();
    };
  };
  render();
  $("#journey-kpis").innerHTML = [
    ["12.7%", "Ads → Product View"],
    ["23.9%", "Product View → Order"],
    ["76.9%", "Order → Complete"],
    ["81.4%", "Complete → Good Review"],
  ]
    .map((x) => `<div><strong>${x[0]}</strong><p>${x[1]}</p></div>`)
    .join("");
  $("#dropoffs").innerHTML = [
    ["↓87.3%", "Ads → Product View"],
    ["↓76.1%", "Product View → Order"],
    ["↓23.1%", "Order → Complete"],
  ]
    .map((x) => `<div><strong>${x[0]}</strong><p>${x[1]}</p></div>`)
    .join("");
  $("#journey-insights").innerHTML =
    `<div><b>BIGGEST DROP-OFF</b><p>Ads → Product View · 87.3%</p></div><div><b>ORDER QUALITY</b><p>9,150 / 11,900 completed orders</p></div><div><b>POST-PURCHASE SIGNAL</b><p>7,450 Good Review · 1,250 Buy Again</p></div>`;
}
let channelMode = "content";
function channels() {
  segmented(
    $("#channel-controls"),
    [
      ["content", "By Content"],
      ["platform", "By Platform"],
    ],
    channelMode,
    (v) => {
      channelMode = v;
      channels();
    },
  );
  let rows = channelMode === "content" ? data.channels : data.platforms,
    rates = rows.map((r) => r[2] / r[1]),
    median = [...rates].sort((a, b) => a - b)[Math.floor(rates.length / 2)],
    attention = rows.filter((r) => r[2] / r[1] < median).length;
  $("#channel-summary").innerHTML =
    `${rows.length} ${channelMode === "content" ? "Content Types" : "Platforms"} · <b>${attention} Need Attention</b> · Current Median Rate: ${pct(median)}`;
  $("#channel-list").innerHTML = rows
    .map((r) => {
      let rate = r[2] / r[1],
        status = rate < median ? "Low Performance" : "Performing Well";
      return `<div class="channel-row"><strong>${r[0]}</strong><div class="bar"><i style="width:${rate * 100}%"></i></div><span class="badge">${status}</span></div>`;
    })
    .join("");
}
let cancelMode = "orders";
function cancellations() {
  segmented(
    $("#cancel-controls"),
    [
      ["orders", "By Orders"],
      ["revenue", "Revenue"],
    ],
    cancelMode,
    (v) => {
      cancelMode = v;
      cancellations();
    },
  );
  let total = data.cancellations.reduce(
      (s, r) => s + r[cancelMode === "orders" ? 1 : 2],
      0,
    ),
    max = Math.max(
      ...data.cancellations.map((r) => r[cancelMode === "orders" ? 1 : 2]),
    );
  $("#cancel-list").innerHTML = data.cancellations
    .map((r) => {
      let v = r[cancelMode === "orders" ? 1 : 2];
      return `<div class="cancel-row" title="${r[0]}"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r[0]}</span><div class="bar"><i style="width:${(v / max) * 100}%"></i></div><strong>${pct(v / total)}</strong></div>`;
    })
    .join("");
  $("#cancel-summary").innerHTML =
    `<div><small>${cancelMode === "orders" ? "Cancelled Orders" : "Current Revenue Loss"}</small><strong>${cancelMode === "orders" ? fmt.format(total) : compact.format(total) + " ₫"}</strong></div><div><small>vs. Previous Period</small><strong>—</strong></div>`;
}
function recommendations() {
  let grid = $("#recommendation-grid");
  grid.innerHTML = data.recommendations
    .map(
      (r, i) =>
        `<article class="rec"><div class="rec-top"><span class="category">${r[0]}</span><span class="priority">Priority<strong>${r[1]}</strong>${r[1] >= 85 ? "HIGH" : "MEDIUM"}</span></div><small>SIGNAL</small><p>${r[2]}</p><small>RECOMMENDED ACTION</small><h3>${r[3]}</h3><p>${r[4]}</p><button aria-expanded="false" data-i="${i}">View Analysis Basis ⌄</button><div class="evidence" hidden><b>SUPPORTING EVIDENCE</b><p>Current metrics and relationships support this recommendation. Values are derived from the embedded approved dashboard dataset.</p></div></article>`,
    )
    .join("");
  $$(".rec button", grid).forEach((b) =>
    b.addEventListener("click", () => {
      let e = b.nextElementSibling,
        open = e.hidden;
      e.hidden = !open;
      b.setAttribute("aria-expanded", open);
      b.textContent = open ? "Hide Analysis Basis ⌃" : "View Analysis Basis ⌄";
    }),
  );
}
overview();
trend();
revenueDonut();
heatmap();
segment();
mix();
products();
sankey();
channels();
cancellations();
recommendations();
