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
  verified:  "bg-primary/10 text-primary",
  featured:  "bg-amber-100 text-amber-700",
  pending:   "bg-surface-low text-on-surface-variant",
  approved:  "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-600",
  free:      "bg-surface-low text-on-surface-variant",
  pro:       "bg-amber-100 text-amber-700",
};

export default function Badge({ variant = "pending", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
