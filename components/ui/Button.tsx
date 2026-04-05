import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size    = "sm" | "md" | "lg";

interface ButtonProps {
  variant?:   Variant;
  size?:      Size;
  href?:      string;
  onClick?:   () => void;
  disabled?:  boolean;
  loading?:   boolean;
  className?: string;
  children:   React.ReactNode;
  type?:      "button" | "submit" | "reset";
  target?:    string;
  rel?:       string;
}

const variantClasses: Record<Variant, string> = {
  primary:   "text-white hover:opacity-90 disabled:opacity-50",
  secondary: "bg-secondary-container text-primary hover:bg-secondary-container/80 disabled:opacity-50",
  ghost:     "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-low disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled,
  loading,
  className,
  children,
  type = "button",
  target,
  rel,
}: ButtonProps) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold",
    "transition-all duration-400 cursor-pointer select-none",
    variantClasses[variant],
    sizeClasses[size],
    (disabled || loading) && "pointer-events-none",
    className
  );

  const inlineStyle =
    variant === "primary"
      ? { background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }
      : undefined;

  const content = loading ? (
    <>
      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      {children}
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <Link href={href} className={base} style={inlineStyle} target={target} rel={rel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={base}
      style={inlineStyle}
    >
      {content}
    </button>
  );
}
