/**
 * YFNIcon — Yoga Founders Network branded icon component.
 * Replaces emojis with a styled capital letter in the Digital Atrium palette.
 *
 * Usage:
 *   <YFNIcon letter="S" />               // default md / soft
 *   <YFNIcon letter="T" size="lg" variant="solid" />
 */

import { cn } from "@/lib/utils/cn";

type Size    = "xs" | "sm" | "md" | "lg" | "xl";
type Variant = "solid" | "soft" | "ghost";

interface YFNIconProps {
  letter:    string;
  size?:     Size;
  variant?:  Variant;
  className?: string;
}

const SIZE_CLASSES: Record<Size, string> = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
};

const VARIANT_CLASSES: Record<Variant, string> = {
  solid: "bg-primary text-white",
  soft:  "bg-secondary-container text-primary",
  ghost: "bg-surface-low text-on-surface-variant border border-outline-variant/30",
};

export default function YFNIcon({
  letter,
  size    = "md",
  variant = "soft",
  className,
}: YFNIconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl flex-shrink-0",
        "font-serif italic font-bold leading-none select-none",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
      aria-hidden="true"
    >
      {letter.charAt(0).toUpperCase()}
    </span>
  );
}
