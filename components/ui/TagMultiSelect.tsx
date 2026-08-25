"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface TagMultiSelectOption<T extends string> {
  value: T;
  label: string;
}

interface TagMultiSelectProps<T extends string> {
  label: string;
  options: readonly TagMultiSelectOption<T>[];
  value: readonly T[];
  onChange: (value: T[]) => void;
  minimumSelected?: number;
  className?: string;
}

export function TagMultiSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  minimumSelected = 1,
  className = "",
}: TagMultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = new Set(value);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const toggleOption = (optionValue: T) => {
    if (selected.has(optionValue)) {
      if (value.length <= minimumSelected) return;
      onChange(value.filter((item) => item !== optionValue));
      return;
    }
    const next = new Set([...value, optionValue]);
    onChange(
      options.flatMap((option) =>
        next.has(option.value) ? [option.value] : [],
      ),
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <span className="mb-1 block text-[12.5px] font-medium leading-none text-[#747d8b]">
        {label}
      </span>
      <div
        className="flex h-9 max-w-full items-center gap-1 rounded-[10px] border border-[#dfe4ec] bg-white px-1.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#3b82f6]"
        onClick={() => setOpen(true)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          {options.flatMap((option) =>
            selected.has(option.value) ? (
              <button
                key={option.value}
                type="button"
                aria-label={`Remove ${option.label}`}
                aria-disabled={value.length <= minimumSelected}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleOption(option.value);
                }}
                className="inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-[6px] bg-[#edf1f6] pl-2 pr-1.5 text-[11px] font-medium text-[#354052] transition-colors hover:bg-[#e3e9f1] aria-disabled:cursor-not-allowed aria-disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b82f6]"
              >
                <span>{option.label}</span>
                <X aria-hidden="true" className="h-3 w-3 text-[#697386]" />
              </button>
            ) : (
              []
            ),
          )}
        </div>
        <button
          type="button"
          aria-label={`Choose ${label.toLowerCase()}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((current) => !current);
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#747d8b] hover:bg-[#f4f6f9] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b82f6]"
        >
          <ChevronDown
            aria-hidden="true"
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open ? (
        <div
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
          className="absolute left-0 top-full z-[1100] mt-2 w-full min-w-[220px] rounded-xl border border-[#dfe4ec] bg-white p-1.5 shadow-[0_12px_28px_rgba(28,39,63,.16)]"
        >
          {options.map((option) => {
            const isSelected = selected.has(option.value);
            const removalDisabled =
              isSelected && value.length <= minimumSelected;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-disabled={removalDisabled}
                onClick={() => toggleOption(option.value)}
                className="flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-left text-[11.5px] font-medium text-[#354052] hover:bg-[#f4f6f9] aria-disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#3b82f6]"
              >
                <span>{option.label}</span>
                {isSelected ? (
                  <Check
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-[#2563b8]"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
