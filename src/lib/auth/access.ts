import { can, canPersonally, PERMISSIONS, type PermissionMap } from "./permissions";

// Which areas of the app the signed-in person may open, from their /auth/me permissions. One map
// for the sidebar (items they can't open are hidden), the route guards (./guard) and the screens'
// own action buttons. The backend still enforces every rule; this only decides what's shown.
//
// Home-scoped permissions (staff.view, staff.manage, tasks.*) count in any scope: a Home manager
// sees Staff management for their homes. Provider permissions (roles.manage, org.manage) must be
// provider-wide.

export interface AppAccess {
  /** Messages: send and receive messages (messaging.use). */
  messages: boolean;
  /** All staff, staff profiles and Home assignments (staff.view). */
  viewStaff: boolean;
  /** Add staff, Assign role, Assign homes, deactivate, invitations (staff.manage). */
  manageStaff: boolean;
  /** Roles & permissions overview (staff.manage, or roles.manage). */
  viewRoles: boolean;
  /** Edit role definitions (roles.manage, provider-wide). */
  manageRoles: boolean;
  /** Staff tasks list and drawer (tasks.view, tasks.assign or org.manage). */
  viewTasks: boolean;
  /** Assign, cancel, edit and reassign tasks (tasks.assign or org.manage). */
  assignTasks: boolean;
  /** Any Staff management page, i.e. whether the sidebar group shows at all. */
  staffArea: boolean;
}

export function appAccess(permissions: PermissionMap | undefined): AppAccess {
  const any = (key: string) => canPersonally(permissions, key);
  const manageRoles = can(permissions, PERMISSIONS.manageRoles);
  const assignTasks = any("tasks.assign") || can(permissions, PERMISSIONS.manageOrg);
  const viewStaff = any(PERMISSIONS.staffView);
  const manageStaff = any(PERMISSIONS.staffManage);
  const viewRoles = manageStaff || manageRoles;
  const viewTasks = any("tasks.view") || assignTasks;
  return {
    messages: any(PERMISSIONS.messagingUse),
    viewStaff,
    manageStaff,
    viewRoles,
    manageRoles,
    viewTasks,
    assignTasks,
    staffArea: viewStaff || viewRoles || viewTasks,
  };
}

export type AccessArea = Exclude<keyof AppAccess, "staffArea">;
