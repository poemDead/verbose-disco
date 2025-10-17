import * as React from "react";

import { cn } from "@/lib/utils";

export type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement>;

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          className,
        )}
        {...props}
      >
        <div className="h-full w-full overflow-y-auto">{children}</div>
      </div>
    );
  },
);
ScrollArea.displayName = "ScrollArea";
