import * as React from "react";
import classNames from "classnames";

// Base styles for different card components
const cardBaseStyles = "rounded-lg border shadow-sm transition-all";
const cardHeaderStyles = "p-4 border-b";
const cardContentStyles = "p-4";
const cardFooterStyles = "p-4 border-t";
const cardTitleStyles = "text-lg font-semibold";
const cardDescriptionStyles = "text-sm text-gray-600";

// Card Component
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

// CardHeader Component
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

// CardContent Component
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

// CardFooter Component
const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={classNames(cardFooterStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});
CardFooter.displayName = "CardFooter";

// CardTitle Component
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

// CardDescription Component
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

// Export all components
export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };



















// import React from 'react';
// import PropTypes from 'prop-types';
// import classNames from 'classnames';

// // Card Component
// export const Card = ({ children, className }) => {
//   return (
//     <div className={classNames('bg-white shadow rounded-lg overflow-hidden', className)}>
//       {children}
//     </div>
//   );
// };

// // CardHeader Component
// export const CardHeader = ({ children, className }) => {
//   return (
//     <div className={classNames('px-6 py-4 border-b border-gray-200', className)}>
//       {children}
//     </div>
//   );
// };

// // CardTitle Component
// export const CardTitle = ({ children, className }) => {
//   return (
//     <h3 className={classNames('text-lg font-bold text-gray-800', className)}>
//       {children}
//     </h3>
//   );
// };

// // CardDescription Component
// export const CardDescription = ({ children, className }) => {
//   return (
//     <p className={classNames('text-sm text-gray-600 mt-1', className)}>
//       {children}
//     </p>
//   );
// };

// // CardContent Component
// export const CardContent = ({ children, className }) => {
//   return (
//     <div className={classNames('px-6 py-4', className)}>
//       {children}
//     </div>
//   );
// };

// // CardFooter Component
// export const CardFooter = ({ children, className }) => {
//   return (
//     <div className={classNames('px-6 py-4 border-t border-gray-200', className)}>
//       {children}
//     </div>
//   );
// };

// // PropType validation
// Card.propTypes = {
//   children: PropTypes.node.isRequired,
//   className: PropTypes.string,
// };

// CardHeader.propTypes = {
//   children: PropTypes.node.isRequired,
//   className: PropTypes.string,
// };

// CardTitle.propTypes = {
//   children: PropTypes.node.isRequired,
//   className: PropTypes.string,
// };

// CardDescription.propTypes = {
//   children: PropTypes.node.isRequired,
//   className: PropTypes.string,
// };

// CardContent.propTypes = {
//   children: PropTypes.node.isRequired,
//   className: PropTypes.string,
// };

// CardFooter.propTypes = {
//   children: PropTypes.node.isRequired,
//   className: PropTypes.string,
// };
