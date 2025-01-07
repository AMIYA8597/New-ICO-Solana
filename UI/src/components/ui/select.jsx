import * as React from "react";
import { cva } from "class-variance-authority";

const selectVariants = cva(
  "inline-flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 text-gray-700",
        primary: "border-primary text-primary",
        error: "border-red-500 text-red-700",
        subtle: "border-gray-200 text-gray-500",
      },
      size: {
        default: "h-10",
        sm: "h-8 text-sm",
        lg: "h-12 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className={`relative ${className}`} ref={ref} {...props}>
      {children}
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={`${selectVariants({ variant, size })} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <span className={`truncate ${className}`} ref={ref} {...props}>
      {children}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <ul
      className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg focus:outline-none ${className}`}
      ref={ref}
      {...props}
    />
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <li
      className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </li>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
