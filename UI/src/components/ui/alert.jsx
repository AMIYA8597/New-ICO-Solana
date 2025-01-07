import * as React from "react";
import classNames from "classnames";

const alertBaseStyles = "rounded-lg border-l-4 p-4";
const alertVariants = {
  success: "bg-green-100 border-green-500 text-green-700",
  error: "bg-red-100 border-red-500 text-red-700",
  warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
  info: "bg-blue-100 border-blue-500 text-blue-700",
};

const Alert = React.forwardRef(({ variant = "info", className, children, ...props }, ref) => {
  return (
    <div
      className={classNames(alertBaseStyles, alertVariants[variant], className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});
Alert.displayName = "Alert";

const alertTitleStyles = "font-bold mb-1";
const AlertTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h4
      className={classNames(alertTitleStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </h4>
  );
});
AlertTitle.displayName = "AlertTitle";

const alertDescriptionStyles = "text-sm";
const AlertDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      className={classNames(alertDescriptionStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  );
});
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
