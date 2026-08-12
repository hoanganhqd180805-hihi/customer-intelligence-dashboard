interface EmptyCardContentProps {
  label?: string;
}

export function EmptyCardContent({
  label = "Chart content",
}: EmptyCardContentProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-[#fbfbfb] text-[12px] text-[#aaa]">
      {label}
    </div>
  );
}
