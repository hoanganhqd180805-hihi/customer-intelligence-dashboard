const ANALYTICAL_TOOLTIP_OPEN_EVENT =
  "customer-intelligence:analytical-tooltip-open";

export function announceAnalyticalTooltip(source: string) {
  window.dispatchEvent(
    new CustomEvent<string>(ANALYTICAL_TOOLTIP_OPEN_EVENT, {
      detail: source,
    }),
  );
}

export function subscribeToOtherAnalyticalTooltips(
  source: string,
  onOtherTooltipOpen: () => void,
) {
  const handleOpen = (event: Event) => {
    if ((event as CustomEvent<string>).detail !== source)
      onOtherTooltipOpen();
  };
  window.addEventListener(ANALYTICAL_TOOLTIP_OPEN_EVENT, handleOpen);
  return () =>
    window.removeEventListener(ANALYTICAL_TOOLTIP_OPEN_EVENT, handleOpen);
}
