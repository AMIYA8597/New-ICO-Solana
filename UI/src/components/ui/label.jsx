import * as React from "react";
import { cva } from "class-variance-authority";

const labelVariants = cva(
  "text-sm font-medium leading-none", // Default base styles
  {
    variants: {
      variant: {
        default: "text-gray-700",
        primary: "text-primary",
        secondary: "text-secondary",
        error: "text-red-600",
        subtle: "text-gray-500",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Label = React.forwardRef(
  ({ className, variant, size, htmlFor, ...props }, ref) => {
    return (
      <label
        className={`${labelVariants({ variant, size })} ${className}`}
        htmlFor={htmlFor}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label, labelVariants };
