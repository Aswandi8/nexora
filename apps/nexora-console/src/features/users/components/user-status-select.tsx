"use client";

import type { UserStatus } from "@nexora/contracts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserStatusSelectProps {
  value: UserStatus;
  disabled?: boolean;
  onChange: (value: UserStatus) => void;
}

const OPTIONS: Array<{
  value: UserStatus;
  label: string;
}> = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
  },
];

export function UserStatusSelect({
  value,
  disabled = false,
  onChange,
}: UserStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as UserStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        id="user-status"
        aria-label="Account status"
        className="w-full"
      >
        <SelectValue placeholder="Select account status" />
      </SelectTrigger>

      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
