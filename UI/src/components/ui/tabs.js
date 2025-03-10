"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const Tabs = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, active, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 hover:text-foreground",
        className,
      )}
      onClick={() => context?.onValueChange(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value

  if (!isActive) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

// Create a context to manage the active tab
const TabsContext = React.createContext(null)

// Export a wrapper component that provides the context
const TabsProvider = ({ children, value, onValueChange, ...props }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <Tabs {...props}>{children}</Tabs>
    </TabsContext.Provider>
  )
}

// Modified Tabs component that includes state management
const TabsWithState = ({ defaultValue, value, onValueChange, children, ...props }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")

  const actualValue = value !== undefined ? value : internalValue
  const handleValueChange = onValueChange || setInternalValue

  return (
    <TabsProvider value={actualValue} onValueChange={handleValueChange} {...props}>
      {children}
    </TabsProvider>
  )
}

// Export the components
export { TabsWithState as Tabs, TabsList, TabsTrigger, TabsContent }

