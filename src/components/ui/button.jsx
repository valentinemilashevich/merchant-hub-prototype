import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

/* Variants + Processing state — Unit UI Kit Button (Figma 724:35543) */
const buttonVariants = cva(
  "group/button relative inline-flex w-fit max-w-full shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-[pending]:cursor-wait [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80 active:bg-primary/90",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 active:bg-muted/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground active:bg-secondary/70",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 active:bg-muted/70",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40 active:bg-destructive/25",
        link: "text-primary underline-offset-4 hover:underline active:opacity-80",
        /* Figma: Type=Alert (solid) */
        alert:
          "bg-[var(--color-burgundy-700)] text-[var(--color-soft-100)] hover:bg-[var(--color-burgundy-800)] active:bg-[var(--color-burgundy-900)] focus-visible:border-[var(--color-burgundy-500)] focus-visible:ring-[var(--color-burgundy-300)]",
        /* Figma: Type=Success */
        success:
          "bg-[var(--color-eden-700)] text-[var(--color-soft-100)] hover:bg-[var(--color-eden-800)] active:bg-[var(--color-eden-900)] focus-visible:border-[var(--color-eden-500)] focus-visible:ring-[var(--color-eden-300)]",
        /* Figma: Type=Muted */
        muted:
          "border-[var(--color-soft-600)] bg-[var(--color-soft-300)] text-[var(--color-dense-700)] hover:bg-[var(--color-soft-400)] active:bg-[var(--color-soft-500)] focus-visible:ring-[var(--color-dense-900-opacity-400)]",
        /* Figma: Type=Accent */
        accent:
          "bg-[var(--color-violet-800)] text-[var(--color-soft-100)] hover:bg-[var(--color-violet-900)] active:brightness-95 focus-visible:border-[var(--color-violet-600)] focus-visible:ring-[var(--color-violet-400)]",
        /* Figma: Type=Alert Accent (soft) */
        alertAccent:
          "border-[var(--color-burgundy-300)] bg-[var(--color-burgundy-100)] text-[var(--color-burgundy-800)] hover:bg-[var(--color-burgundy-200)] active:bg-[var(--color-burgundy-300)] focus-visible:ring-[var(--color-burgundy-400)]",
        /* Figma: Type=Success Accent */
        successAccent:
          "border-[var(--color-eden-300)] bg-[var(--color-eden-100)] text-[var(--color-eden-800)] hover:bg-[var(--color-eden-200)] active:bg-[var(--color-eden-300)] focus-visible:ring-[var(--color-eden-400)]",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  pending = false,
  disabled,
  children,
  ...props
}) {
  const useSlot = Boolean(asChild && !pending)
  const Comp = useSlot ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-pending={pending ? "true" : undefined}
      disabled={disabled || pending}
      aria-busy={pending ? true : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {pending ? (
        <>
          <span
            className="inline-flex items-center justify-center gap-[inherit] invisible"
            aria-hidden
          >
            {children}
          </span>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[inherit]">
            <Spinner className="size-4" />
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants }
