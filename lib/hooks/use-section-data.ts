"use client";

import { useEffect, useState } from "react";
import type { SectionRequest } from "@/data/contracts/section-api";

export type SectionDataState<T> = { status: "loading" } | { status: "success"; data: T } | { status: "empty" } | { status: "unavailable" } | { status: "error"; message: string };

export function useSectionData<T>(service: (request: SectionRequest) => Promise<T | null>, startDate: string, endDate: string, isEmpty: (data: T) => boolean): SectionDataState<T> {
  const [state, setState] = useState<SectionDataState<T>>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    service({ startDate, endDate, signal: controller.signal }).then((data) => setState(data == null ? { status: "unavailable" } : isEmpty(data) ? { status: "empty" } : { status: "success", data })).catch((error: unknown) => { if (!controller.signal.aborted) setState({ status: "error", message: error instanceof Error ? error.message : "Unknown data error" }); });
    return () => controller.abort();
  }, [service, startDate, endDate, isEmpty]);
  return state;
}
