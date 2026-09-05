"use client";

import type { Permission, PermissionCode } from "@nexora/contracts";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface PermissionSelectorProps {
  permissions: Permission[];
  selectedPermissions: PermissionCode[];
  disabled?: boolean;
  onToggle: (permission: PermissionCode) => void;
}

interface PermissionGroup {
  key: string;
  label: string;
  permissions: Permission[];
}

function formatGroupLabel(group: string) {
  return group
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const grouped = new Map<string, Permission[]>();

  for (const permission of permissions) {
    const resource = permission.code.split(".")[0] ?? "other";

    const current = grouped.get(resource) ?? [];

    current.push(permission);

    grouped.set(resource, current);
  }

  return Array.from(grouped.entries()).map(([key, items]) => ({
    key,
    label: formatGroupLabel(key),
    permissions: items,
  }));
}

export function PermissionSelector({
  permissions,
  selectedPermissions,
  disabled = false,
  onToggle,
}: PermissionSelectorProps) {
  const groups = groupPermissions(permissions);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {groups.map((group) => (
        <section
          key={group.key}
          className="min-w-0 overflow-hidden rounded-lg border border-border bg-background"
        >
          <div className="border-b border-border bg-secondary/40 px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              {group.label}
            </h3>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Configure {group.label.toLowerCase()} permissions.
            </p>
          </div>

          <div className="divide-y divide-border">
            {group.permissions.map((permission) => {
              const checked = selectedPermissions.includes(permission.code);

              return (
                <button
                  key={permission.id}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  disabled={disabled}
                  onClick={() => onToggle(permission.code)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left outline-none transition-colors",
                    "hover:bg-secondary/40",
                    "focus-visible:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background",
                    )}
                  >
                    {checked ? <Check className="size-3" /> : null}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-sm font-medium text-foreground">
                      {permission.code}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {permission.description ?? permission.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
