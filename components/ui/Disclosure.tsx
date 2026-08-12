"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface DisclosureProps {
  expanded: boolean;
  onToggle: () => void;
  collapsedLabel: string;
  expandedLabel?: string;
  children: ReactNode;
  className?: string;
}

export function Disclosure({
  expanded,
  onToggle,
  collapsedLabel,
  expandedLabel,
  children,
  className = "",
}: DisclosureProps) {
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 text-[11px] text-[#3b82f6] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
      >
        {expanded ? (expandedLabel ?? collapsedLabel) : collapsedLabel}
        <span
          aria-hidden
          className={`inline-block transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          ⌄
        </span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
