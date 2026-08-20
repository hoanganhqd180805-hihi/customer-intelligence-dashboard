"use client";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex rounded-[11px] border border-[#d5d5d5] bg-[#f4f4f4] p-1 text-[11px] leading-[15px]"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-lg px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6] ${active ? "bg-[#3b82f6] text-white" : "text-[#666] hover:text-[#333]"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
