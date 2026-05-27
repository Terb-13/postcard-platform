/**
 * Role utilities for internal operations access.
 * Currently relies on the `role` field on User.
 * Can be extended to also check Clerk organization roles.
 */

export const ADMIN_ROLES = ["ADMIN", "OPERATIONS"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && ADMIN_ROLES.includes(role as AdminRole);
}
