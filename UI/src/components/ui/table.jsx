import * as React from "react";
import { cva } from "class-variance-authority";

const tableVariants = cva("w-full border-collapse text-left text-sm", {
  variants: {
    variant: {
      default: "table-auto",
      bordered: "border border-gray-300",
      striped: "table-auto [&>tbody>tr:nth-child(odd)]:bg-gray-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const Table = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <table
      className={`${tableVariants({ variant })} ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Table.displayName = "Table";

const TableHead = React.forwardRef(({ className, ...props }, ref) => {
  return <thead className={`bg-gray-200 ${className}`} ref={ref} {...props} />;
});
TableHead.displayName = "TableHead";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <th
      className={`px-4 py-2 font-medium text-gray-700 ${className}`}
      ref={ref}
      {...props}
    />
  );
});
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => {
  return <tbody className={className} ref={ref} {...props} />;
});
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef(({ className, ...props }, ref) => {
  return <tr className={`hover:bg-gray-100 ${className}`} ref={ref} {...props} />;
});
TableRow.displayName = "TableRow";

const TableCell = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <td className={`border-t px-4 py-2 ${className}`} ref={ref} {...props} />
  );
});
TableCell.displayName = "TableCell";

export { Table, TableHead, TableHeader, TableBody, TableRow, TableCell };
