"use client"

import * as React from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Learn more about @tanstack/react-charts:
// https://tanstack.com/charts/latest/docs/react/overview
// https://tanstack.com/charts/latest/docs/react/api/ChartContainer
// https://tanstack.com/charts/latest/docs/react/api/ChartTooltip
// https://tanstack.com/charts/latest/docs/react/api/ChartTooltipContent

const Chart = ({
  config,
  className,
  children,
  ...props
}: { config: ChartConfig } & React.ComponentProps<typeof ChartContainer>) => {
  const id = React.useId()
  return (
    <ChartContainer id={id} config={config} className={cn("flex aspect-video w-full", className)} {...props}>
      {children}
      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
    </ChartContainer>
  )
}

// Helper component to use with Chart to add a switch for data
const ChartCrosshair = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "absolute left-0 top-0 h-full w-full",
      "[&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:inset-0 [&>svg]:h-full [&>svg]:w-full",
      className,
    )}
    {...props}
  />
)

// Helper component to use with Chart to add a switch for data
const ChartLegend = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props} />
)

// Helper component to use with Chart to add a switch for data
const ChartLegendContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props} />
  ),
)
ChartLegendContent.displayName = "ChartLegendContent"

// Helper component to use with Chart to add a switch for data
const ChartLegendItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:fill-current", className)}
      {...props}
    >
      {children}
    </div>
  ),
)
ChartLegendItem.displayName = "ChartLegendItem"

// Helper component to use with Chart to add a switch for data
const ChartSelect = ({
  config,
  className,
  children,
  ...props
}: { config: ChartConfig } & React.ComponentProps<typeof Select>) => {
  const id = React.useId()
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Select {...props}>
        <SelectTrigger
          id={id}
          className="h-9 w-fit rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SelectValue placeholder="Select a value" />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      <div className="flex items-center gap-4">
        {Object.entries(config).map(([key, item]) => (
          <div key={key} className="flex items-center gap-1.5">
            <item.icon className="h-3 w-3 shrink-0" />
            <Label htmlFor={id}>{item.label}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Chart, ChartCrosshair, ChartLegend, ChartLegendContent, ChartLegendItem, ChartSelect }
