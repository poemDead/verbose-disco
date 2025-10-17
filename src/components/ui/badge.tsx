import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "outline" | "secondary";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  outline: "border border-border text-foreground",
  secondary: "bg-secondary text-secondary-foreground",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
