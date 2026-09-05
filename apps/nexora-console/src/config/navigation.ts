import {
  PERMISSIONS,
  type PermissionCode,
} from "@nexora/contracts/permissions";

export type NavigationIcon =
  | "dashboard"
  | "shortlinks"
  | "users"
  | "roles"
  | "permissions"
  | "settings";

export interface NavigationChild {
  title: string;
  href: string;
  permission?: PermissionCode;
}

export interface NavigationItem {
  title: string;
  href?: string;
  icon: NavigationIcon;
  permission?: PermissionCode;
  children?: NavigationChild[];
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    title: "General",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Shortlinks",
        href: "/shortlinks",
        icon: "shortlinks",
        permission: PERMISSIONS.SHORTLINKS_READ,
      },
    ],
  },
  {
    title: "Identity",
    items: [
      {
        title: "Users",
        href: "/users",
        icon: "users",
        permission: PERMISSIONS.USERS_READ,
      },
      {
        title: "Roles",
        href: "/roles",
        icon: "roles",
        permission: PERMISSIONS.ROLES_READ,
      },
      {
        title: "Permissions",
        href: "/permissions",
        icon: "permissions",
        permission: PERMISSIONS.PERMISSIONS_READ,
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Settings",
        icon: "settings",
      },
    ],
  },
];

function canAccess(
  permissions: PermissionCode[],
  permission?: PermissionCode,
): boolean {
  return !permission || permissions.includes(permission);
}

export function getNavigationGroups(
  permissions: PermissionCode[],
): NavigationGroup[] {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          const children = item.children?.filter((child) =>
            canAccess(permissions, child.permission),
          );

          return {
            ...item,
            children,
          };
        })
        .filter((item) => {
          if (item.children) {
            return item.children.length > 0;
          }

          return canAccess(permissions, item.permission);
        }),
    }))
    .filter((group) => group.items.length > 0);
}
