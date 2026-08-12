interface DonutLabelDatum {
  id: string;
  share: number;
  color: string;
}

interface DonutPercentageLabelsProps {
  data: DonutLabelDatum[];
  cx: number;
  cy: number;
  radius: number;
  format: (share: number) => string;
  labelOffset?: number;
  minimumShare?: number;
}

interface PositionedLabel extends DonutLabelDatum {
  x: number;
  naturalY: number;
  targetY: number;
  side: "left" | "right";
  textAnchor: "start" | "middle" | "end";
}

function resolveTextCollisions(labels: PositionedLabel[]) {
  if (labels.length < 2) return labels;
  const minimumGap = 13;
  const maximumShift = 12;
  const sorted = [...labels].sort((a, b) => a.targetY - b.targetY);
  for (let index = 1; index < sorted.length; index += 1) {
    sorted[index].targetY = Math.max(
      sorted[index].targetY,
      sorted[index - 1].targetY + minimumGap,
    );
  }
  for (let index = sorted.length - 2; index >= 0; index -= 1) {
    sorted[index].targetY = Math.min(
      sorted[index].targetY,
      sorted[index + 1].targetY - minimumGap,
    );
  }
  sorted.forEach((label) => {
    label.targetY = Math.max(
      label.naturalY - maximumShift,
      Math.min(label.naturalY + maximumShift, label.targetY),
    );
  });
  return sorted;
}

export function DonutPercentageLabels({
  data,
  cx,
  cy,
  radius,
  format,
  labelOffset = 10,
  minimumShare = 0,
}: DonutPercentageLabelsProps) {
  let offset = 0;
  const positioned = data.flatMap((datum) => {
    const angle = -Math.PI / 2 + (offset + datum.share / 2) * Math.PI * 2;
    offset += datum.share;
    if (datum.share < minimumShare) return [];
    const cosine = Math.cos(angle);
    const side = cosine >= 0 ? "right" : "left";
    const labelRadius = radius + labelOffset;
    const naturalY = cy + Math.sin(angle) * labelRadius;
    return [
      {
        ...datum,
        side,
        x: cx + cosine * labelRadius,
        naturalY,
        targetY: naturalY,
        textAnchor:
          Math.abs(cosine) < 0.18
            ? "middle"
            : side === "right"
              ? "start"
              : "end",
      } satisfies PositionedLabel,
    ];
  });
  const labels = [
    ...resolveTextCollisions(
      positioned.filter((label) => label.side === "left"),
    ),
    ...resolveTextCollisions(
      positioned.filter((label) => label.side === "right"),
    ),
  ];
  return labels.map((label) => (
    <text
      key={label.id}
      x={label.x}
      y={label.targetY + 4}
      textAnchor={label.textAnchor}
      fill={label.color}
      fontSize="12"
      fontWeight="700"
      aria-hidden="true"
    >
      {format(label.share)}
    </text>
  ));
}
