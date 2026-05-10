import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/core/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary font-semibold text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive font-semibold text-destructive-foreground hover:bg-destructive/80",
        outline: "font-semibold text-foreground",
      },
      /** Pill = status/workflow chips; tag = role, org code, classification (see style guide). */
      shape: {
        pill: "rounded-full",
        tag: "rounded-md font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "pill",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, shape, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, shape }), className)} {...props} />;
}

export { Badge, badgeVariants };
