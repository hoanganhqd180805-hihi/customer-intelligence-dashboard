const outerRadius = 82;
const innerRadius = 54;

export const SHARED_DONUT_GEOMETRY = {
  canvasWidth: 260,
  canvasHeight: 220,
  centerX: 130,
  centerY: 110,
  outerRadius,
  innerRadius,
  centerlineRadius: (outerRadius + innerRadius) / 2,
  ringThickness: outerRadius - innerRadius,
  activeRingThickness: outerRadius - innerRadius + 3,
  centerDiameter: 112,
  percentageLabelRadius: 82,
} as const;
