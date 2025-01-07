import * as React from "react";
import { cva } from "class-variance-authority";

const switchVariants = cva(
  "relative inline-flex items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gray-200 border-gray-300",
        primary: "bg-primary border-primary",
        secondary: "bg-secondary border-secondary",
        error: "bg-red-200 border-red-500",
      },
      size: {
        default: "w-10 h-6",
        sm: "w-8 h-4",
        lg: "w-14 h-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const SwitchThumbVariants = cva(
  "block rounded-full bg-white shadow transform transition-transform",
  {
    variants: {
      size: {
        default: "w-4 h-4",
        sm: "w-3 h-3",
        lg: "w-6 h-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const Switch = React.forwardRef(
  ({ className, variant, size, checked, onChange, ...props }, ref) => {
    return (
      <button
        role="switch"
        aria-checked={checked}
        className={`${switchVariants({ variant, size })} ${className}`}
        onClick={() => onChange(!checked)}
        ref={ref}
        {...props}
      >
        <span
          className={`${SwitchThumbVariants({ size })} ${
            checked ? "translate-x-full" : "translate-x-0"
          }`}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch, switchVariants };
