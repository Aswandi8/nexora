"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />;
}

export function SelectGroup(
  props: ComponentProps<typeof SelectPrimitive.Group>,
) {
  return <SelectPrimitive.Group {...props} />;
}

export function SelectValue(
  props: ComponentProps<typeof SelectPrimitive.Value>,
) {
  return <SelectPrimitive.Value {...props} />;
}

export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors",
        "hover:bg-accent",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-placeholder:text-muted-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}

      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectScrollUpButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "flex h-7 cursor-default items-center justify-center text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

export function SelectScrollDownButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "flex h-7 cursor-default items-center justify-center text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 6,
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        avoidCollisions
        className={cn(
          "relative z-70 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-32 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width)",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />

        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-(--radix-select-trigger-height) min-h-fit w-full",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>

        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectLabel({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-md py-2 pr-8 pl-2.5 text-sm text-muted-foreground outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>

      <span className="pointer-events-none absolute right-2.5 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}
