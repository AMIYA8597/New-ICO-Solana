import * as React from "react";
import classNames from "classnames";

// Base styles for all components
const cardBaseStyles = "rounded-lg border shadow-sm transition-all";
const cardHeaderStyles = "p-4 border-b";
const cardContentStyles = "p-4";
const cardFooterStyles = "p-4 border-t";
const cardTitleStyles = "text-lg font-bold";
const cardDescriptionStyles = "text-sm text-gray-600";

const buttonBaseStyles = "px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-all";
const inputBaseStyles = "px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
const tableBaseStyles = "table-auto w-full border-collapse";
const tableCellStyles = "border px-4 py-2 text-left";
const tableHeaderStyles = "bg-gray-100 font-semibold";

// Card component
const Card = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={classNames(cardBaseStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

// Card Header
const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={classNames(cardHeaderStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

// Card Content
const CardContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={classNames(cardContentStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});
CardContent.displayName = "CardContent";

// Card Title
const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h2
      className={classNames(cardTitleStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </h2>
  );
});
CardTitle.displayName = "CardTitle";

// Card Description
const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      className={classNames(cardDescriptionStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  );
});
CardDescription.displayName = "CardDescription";

// Button Component
const Button = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      className={classNames(buttonBaseStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

// Input Component
const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      className={classNames(inputBaseStyles, className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Table Components
const Table = ({ className, children, ...props }) => {
  return (
    <table className={classNames(tableBaseStyles, className)} {...props}>
      {children}
    </table>
  );
};

const TableHead = ({ className, children, ...props }) => {
  return (
    <thead className={classNames(className)} {...props}>
      {children}
    </thead>
  );
};

const TableRow = ({ className, children, ...props }) => {
  return (
    <tr className={classNames(className)} {...props}>
      {children}
    </tr>
  );
};

const TableHeader = ({ className, children, ...props }) => {
  return (
    <th className={classNames(tableHeaderStyles, tableCellStyles, className)} {...props}>
      {children}
    </th>
  );
};

const TableBody = ({ className, children, ...props }) => {
  return (
    <tbody className={classNames(className)} {...props}>
      {children}
    </tbody>
  );
};

const TableCell = ({ className, children, ...props }) => {
  return (
    <td className={classNames(tableCellStyles, className)} {...props}>
      {children}
    </td>
  );
};

export {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
};
