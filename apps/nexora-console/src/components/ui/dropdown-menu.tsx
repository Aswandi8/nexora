"use client";

import type { ComponentProps } from "react";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

export function DropdownMenu({
  modal = false,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root modal={modal} {...props} />;
}

export function DropdownMenuPortal(
  props: ComponentProps<typeof DropdownMenuPrimitive.Portal>,
) {
  return <DropdownMenuPrimitive.Portal {...props} />;
}

export function DropdownMenuTrigger(
  props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>,
) {
  return <DropdownMenuPrimitive.Trigger {...props} />;
}

export function DropdownMenuGroup(
  props: ComponentProps<typeof DropdownMenuPrimitive.Group>,
) {
  return <DropdownMenuPrimitive.Group {...props} />;
}

export function DropdownMenuSub(
  props: ComponentProps<typeof DropdownMenuPrimitive.Sub>,
) {
  return <DropdownMenuPrimitive.Sub {...props} />;
}

export function DropdownMenuRadioGroup(
  props: ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>,
) {
  return <DropdownMenuPrimitive.RadioGroup {...props} />;
}

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        avoidCollisions
        className={cn(
          "z-70 min-w-40 max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors",
        "text-muted-foreground focus:bg-accent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "data-[inset=true]:pl-8",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-md py-2 pr-2.5 pl-8 text-sm text-muted-foreground outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="size-4 text-primary" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>

      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        "relative flex cursor-default select-none items-center rounded-md py-2 pr-2.5 pl-8 text-sm text-muted-foreground outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="size-2 fill-primary text-primary" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>

      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-inset={inset}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium text-muted-foreground",
        "data-[inset=true]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export function DropdownMenuShortcut({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-inset={inset}
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm text-muted-foreground outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        "data-[inset=true]:pl-8",
        className,
      )}
      {...props}
    >
      {children}

      <ChevronRight className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      collisionPadding={collisionPadding}
      avoidCollisions
      className={cn(
        "z-70 min-w-40 max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  );
}
