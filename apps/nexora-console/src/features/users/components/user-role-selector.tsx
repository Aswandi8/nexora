"use client";

import { SUPER_ADMIN_ROLE_CODE, type RoleListItem } from "@nexora/contracts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRoleSelectorProps {
  roles: RoleListItem[];
  selectedRoleId: string;
  disabled?: boolean;
  onChange: (roleId: string) => void;
}

export function UserRoleSelector({
  roles,
  selectedRoleId,
  disabled = false,
  onChange,
}: UserRoleSelectorProps) {
  const assignableRoles = roles.filter(
    (role) => role.code !== SUPER_ADMIN_ROLE_CODE,
  );

  return (
    <Select
      value={selectedRoleId || undefined}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger id="user-role" aria-label="Role" className="w-full">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>

      <SelectContent>
        {assignableRoles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
