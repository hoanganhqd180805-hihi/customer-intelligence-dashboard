export const DASHBOARD_STACKED_COLUMN_MARGIN_X = {
  left: 58,
  right: 24,
} as const;

export function getDashboardStackedColumnWidth(columnWidth: number) {
  return Math.min(48, Math.max(12, columnWidth * 0.56));
}
