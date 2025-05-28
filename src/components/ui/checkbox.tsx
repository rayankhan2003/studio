
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  // The ref is now to an HTMLDivElement because the immediate child of asChild Root is a div
  HTMLDivElement,
  // Props are still those of CheckboxPrimitive.Root
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    asChild // Use asChild to render the component as its direct child
    {...props} // Pass all original props (checked, onCheckedChange, disabled, etc.)
  >
    <div // This div becomes the checkbox, receiving props and behaviors from CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className // Merge external className
      )}
      // Radix will handle applying necessary roles, aria attributes, and event handlers to this div
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </div>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = "Checkbox" // Or CheckboxPrimitive.Root.displayName

export { Checkbox }
