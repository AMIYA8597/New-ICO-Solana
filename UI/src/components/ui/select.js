"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return <div className={cn("relative", className)}>{children}</div>
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, ...props }, ref) => {
  return <span ref={ref} className={cn("block truncate", className)} {...props} />
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        position === "popper" && "translate-y-1",
        className,
      )}
      {...props}
    >
      <div className="w-full p-1">{children}</div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {/* Checkmark would go here for selected items */}
      </span>
      <span className="truncate">{children}</span>
    </div>
  )
})
SelectItem.displayName = "SelectItem"

// Create a context to manage the select state
const SelectContext = React.createContext(null)

// Export a wrapper component that provides the context
const SelectProvider = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleTriggerClick = () => {
    setIsOpen(!isOpen)
  }

  const handleItemClick = (itemValue) => {
    onValueChange(itemValue)
    setIsOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleItemClick, isOpen, setIsOpen }}>
      <Select {...props}>
        {React.Children.map(children, (child) => {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, { onClick: handleTriggerClick })
          }
          if (child.type === SelectContent) {
            return isOpen ? child : null
          }
          return child
        })}
      </Select>
    </SelectContext.Provider>
  )
}

// Modified Select component that includes state management
const SelectWithState = ({ value, onValueChange, children, ...props }) => {
  const [internalValue, setInternalValue] = React.useState(value || "")

  const actualValue = value !== undefined ? value : internalValue
  const handleValueChange = onValueChange || setInternalValue

  return (
    <SelectProvider value={actualValue} onValueChange={handleValueChange} {...props}>
      {children}
    </SelectProvider>
  )
}

// Export the components
export { SelectWithState as Select, SelectTrigger, SelectValue, SelectContent, SelectItem }

