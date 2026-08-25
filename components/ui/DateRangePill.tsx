"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

interface DateRangePillProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  minDate: string;
  maxDate: string;
  label?: string;
  dark?: boolean;
}

const dateLabelFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: string) {
  return dateLabelFormat.format(new Date(`${date}T00:00:00Z`));
}

export function DateRangePill({
  value,
  onChange,
  minDate,
  maxDate,
  label = "Time Range",
  dark = false,
}: DateRangePillProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}: ${formatDate(value.startDate)} – ${formatDate(value.endDate)}`}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6] ${
          dark
            ? "border-white/15 bg-white/[.07] text-[#eef1fb] hover:bg-white/[.1]"
            : "border-[#dfe4ec] bg-white text-[#333] hover:bg-[#f7f8fa]"
        }`}
      >
        <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">
          {formatDate(value.startDate)} – {formatDate(value.endDate)}
        </span>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={`${label} range`}
          className={`absolute right-0 top-full z-[1100] mt-2 grid min-w-[272px] gap-2 rounded-xl border p-3 shadow-xl ${
            dark
              ? "border-white/15 bg-[#070a1b] text-[#eef1fb]"
              : "border-[#dfe4ec] bg-white text-[#172033]"
          }`}
        >
          <label className="grid grid-cols-[54px_1fr] items-center gap-2 text-[11px]">
            <span className={dark ? "text-[#9aa3c9]" : "text-[#747d8b]"}>
              From
            </span>
            <input
              type="date"
              min={minDate}
              max={value.endDate}
              value={value.startDate}
              onInput={(event) =>
                onChange({ ...value, startDate: event.currentTarget.value })
              }
              className={`h-8 rounded-lg border px-2 text-[12px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b82f6] ${
                dark
                  ? "border-white/15 bg-white/[.08] text-white [color-scheme:dark]"
                  : "border-[#dfe4ec] bg-white"
              }`}
            />
          </label>
          <label className="grid grid-cols-[54px_1fr] items-center gap-2 text-[11px]">
            <span className={dark ? "text-[#9aa3c9]" : "text-[#747d8b]"}>
              To
            </span>
            <input
              type="date"
              min={value.startDate}
              max={maxDate}
              value={value.endDate}
              onInput={(event) =>
                onChange({ ...value, endDate: event.currentTarget.value })
              }
              className={`h-8 rounded-lg border px-2 text-[12px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b82f6] ${
                dark
                  ? "border-white/15 bg-white/[.08] text-white [color-scheme:dark]"
                  : "border-[#dfe4ec] bg-white"
              }`}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
