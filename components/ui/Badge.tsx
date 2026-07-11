import { cn } from "@/lib/utils/cn";

type Variant =
  | "verified"
  | "featured"
  | "pending"
  | "approved"
  | "rejected"
  | "free"
  | "pro";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  verified:  "border border-accent-text text-accent-text bg-bg",
  featured:  "bg-primary text-primary-on",
  pending:   "bg-surface-low text-on-surface-variant",
  approved:  "bg-green-100 text-green-800",
  rejected:  "bg-red-100 text-red-700",
  free:      "bg-surface-low text-on-surface-variant",
  pro:       "bg-primary text-primary-on",
};

export default function Badge({ variant = "pending", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-[2px] font-sans text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
