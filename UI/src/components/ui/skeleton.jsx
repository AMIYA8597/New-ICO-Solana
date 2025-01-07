import * as React from "react";
import classNames from "classnames";

// Base styles for Dropdown Menu
const dropdownMenuBaseStyles = "relative inline-block text-left";
const dropdownMenuContentStyles = "absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10";
const dropdownMenuItemStyles = "cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
const dropdownMenuLabelStyles = "block px-4 py-2 text-sm font-semibold text-gray-500";
const dropdownMenuSeparatorStyles = "my-1 border-t border-gray-200";

// DropdownMenu
const DropdownMenu = ({ children, className, ...props }) => {
  return (
    <div className={classNames(dropdownMenuBaseStyles, className)} {...props}>
      {children}
    </div>
  );
};

// DropdownMenuTrigger
const DropdownMenuTrigger = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={classNames("inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", className)}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// DropdownMenuContent
const DropdownMenuContent = ({ children, className, ...props }) => {
  return (
    <div className={classNames(dropdownMenuContentStyles, className)} {...props}>
      {children}
    </div>
  );
};

// DropdownMenuItem
const DropdownMenuItem = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={classNames(dropdownMenuItemStyles, className)} {...props}>
      {children}
    </div>
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

// DropdownMenuLabel
const DropdownMenuLabel = ({ children, className, ...props }) => {
  return (
    <span className={classNames(dropdownMenuLabelStyles, className)} {...props}>
      {children}
    </span>
  );
};

// DropdownMenuSeparator
const DropdownMenuSeparator = ({ className, ...props }) => {
  return (
    <div className={classNames(dropdownMenuSeparatorStyles, className)} {...props} />
  );
};

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};

// Skeleton Component
const skeletonBaseStyles = "bg-gray-200 animate-pulse";
const skeletonVariants = {
  text: "h-4 rounded",
  circle: "rounded-full",
  rectangle: "rounded-md",
};

const Skeleton = ({ variant = "text", className, ...props }) => {
  return (
    <div
      className={classNames(skeletonBaseStyles, skeletonVariants[variant], className)}
      {...props}
    ></div>
  );
};

export { Skeleton };
