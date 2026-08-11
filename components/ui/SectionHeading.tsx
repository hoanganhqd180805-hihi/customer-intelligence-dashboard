interface SectionHeadingProps {
  title: string;
  subtitle: string;
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <header className="mb-3.5">
      <h2 className="text-[21px] font-medium leading-tight text-[#111]">{title}</h2>
      <p className="mt-1.5 text-[12px] leading-relaxed text-[#6b6b6b]">{subtitle}</p>
    </header>
  );
}
