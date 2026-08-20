"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { recommendations } from "@/data/fixtures/interaction.fixture";
import type { RecommendationData } from "@/data/contracts/dashboard";

type HighlightTone = "action" | "risk" | "opportunity";

interface HighlightSpec {
  text: string;
  tone: HighlightTone;
}

const highlightClass: Record<HighlightTone, string> = {
  action: "font-semibold text-[#2563eb]",
  risk: "font-semibold text-[#d94d47]",
  opportunity: "font-semibold text-[#128a78]",
};

function getHighlights(item: RecommendationData): HighlightSpec[] {
  const evidenceValue = (metric: string) =>
    item.evidence.find((entry) => entry.metric === metric)?.value ?? "";

  switch (item.id) {
    case "journey-conversion": {
      const wowValue = evidenceValue("WoW Change").replace(
        /^[↑↓—]\s*/,
        "",
      );
      return [
        {
          text: "content placement, product links, CTAs, offers, and landing experience",
          tone: "action",
        },
        { text: item.title, tone: "action" },
        { text: evidenceValue("Drop-off Rate"), tone: "risk" },
        { text: wowValue, tone: "risk" },
      ];
    }
    case "segment-retention":
      return [
        {
          text: "targeted incentives and repurchase reminders",
          tone: "action",
        },
        { text: item.title, tone: "opportunity" },
        {
          text: evidenceValue("Revenue Contribution"),
          tone: "opportunity",
        },
      ];
    case "purchase-timing":
      return [
        {
          text: "campaigns, vouchers, and promotional activity",
          tone: "action",
        },
        { text: item.title, tone: "opportunity" },
      ];
    case "shopping-behavior":
      return [
        {
          text: "visibility and conversion tests",
          tone: "action",
        },
        { text: item.title, tone: "opportunity" },
      ];
    default:
      return [];
  }
}

function HighlightedText({
  text,
  highlights,
}: {
  text: string;
  highlights: HighlightSpec[];
}) {
  const usableHighlights = highlights.filter(
    (highlight) => highlight.text && text.includes(highlight.text),
  );
  const parts: Array<{ text: string; tone?: HighlightTone }> = [];
  let cursor = 0;

  while (cursor < text.length) {
    const next = usableHighlights
      .map((highlight) => ({
        ...highlight,
        index: text.indexOf(highlight.text, cursor),
      }))
      .filter((highlight) => highlight.index >= cursor)
      .sort((a, b) => a.index - b.index || b.text.length - a.text.length)[0];

    if (!next) {
      parts.push({ text: text.slice(cursor) });
      break;
    }

    if (next.index > cursor) {
      parts.push({ text: text.slice(cursor, next.index) });
    }
    parts.push({ text: next.text, tone: next.tone });
    cursor = next.index + next.text.length;
  }

  return parts.map((part, index) =>
    part.tone ? (
      <strong key={`${part.text}-${index}`} className={highlightClass[part.tone]}>
        {part.text}
      </strong>
    ) : (
      <span key={`${part.text}-${index}`}>{part.text}</span>
    ),
  );
}

function RecommendationCard({
  item,
  expanded,
  onToggle,
}: {
  item: RecommendationData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const highlights = getHighlights(item);
  const category = item.category.toUpperCase();

  return (
    <Card
      className={`flex flex-col p-4 ${expanded ? "min-h-[240px]" : "h-[240px]"}`}
    >
      <div className="flex justify-start">
        <span
          className="rounded-full border border-[#3b82f6]/35 bg-[#3b82f6]/[.05] px-2 py-1 text-[9.5px] font-semibold tracking-[.08em] text-[#2563eb]"
        >
          {category}
        </span>
      </div>

      <p className="mt-4 text-justify text-[13px] leading-[1.55] text-[#4f5968] [text-align-last:left] [text-justify:inter-word]">
        <HighlightedText text={item.description} highlights={highlights} />{" "}
        <HighlightedText text={item.signal} highlights={highlights} />
      </p>

      <Disclosure
        expanded={expanded}
        onToggle={onToggle}
        collapsedLabel="More details"
        expandedLabel="Hide details"
        className="mt-auto border-t border-[#e3e6eb] pt-2.5"
      >
        <div className="mt-2.5 rounded-lg bg-[#f6f8fc] px-3 py-2.5">
          <p className="text-[9.5px] font-semibold tracking-[.08em] text-[#737b89]">
            SIGNALS
          </p>
          <dl className="mt-1.5 divide-y divide-[#e3e7ee]">
            {item.evidence.slice(0, 4).map((evidence) => (
              <div
                key={evidence.metric}
                className="flex items-center justify-between gap-3 py-1.5 text-[10.5px]"
              >
                <dt className="min-w-0 text-[#667080]">{evidence.metric}</dt>
                <dd className="shrink-0 text-right font-semibold text-[#30394a]">
                  {evidence.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Disclosure>
    </Card>
  );
}

export function RecommendationsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9dfe9] bg-white">
      <header className="flex h-[60px] items-center justify-between border-b border-[#d9dfe9] bg-[#f3f7ff] px-4">
        <div>
          <p className="text-[10.5px] text-[#3b82f6]">
            AI Insights{" "}
            <span className="text-[#777]">Customer Intelligence</span>
          </p>
          <h2 className="mt-1 text-[17px] font-semibold">
            Consolidate Recommendations
          </h2>
        </div>
        <p className="text-[12px] font-semibold text-[#3b82f6]">
          4 Recommendations
        </p>
      </header>
      <div className="grid grid-cols-1 items-start gap-3 p-3.5 md:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        {recommendations.map((item) => {
          const expanded = expandedId === item.id;
          return (
            <RecommendationCard
              key={item.id}
              item={item}
              expanded={expanded}
              onToggle={() => setExpandedId(expanded ? null : item.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
