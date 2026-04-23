import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types/auth";
import {
  DEPRECATED_PAGE_INVOICES_UNIFIED,
  INVOICE_PAGE_ACCESS_KEYS,
  PAGE,
  PAGE_IMPLIES_LEGACY,
  PAGE_IMPLIES_PAGE_KEYS,
  type PageAccessKey,
} from "@/constants/page-access";
import { P } from "@/constants/permissions";

/**
 * RBAC helpers — permission keys come from GET /auth/me (`user.permissions`).
 * Supports page-wise keys (`page.*`) from role groups: see `PAGE_IMPLIES_LEGACY` for legacy `P.*` coverage.
 * Owners are treated as allowed for all checks (belt-and-suspenders if the session predates `permissions`).
 */
function legacyKeysImpliedByHeldPageKeys(held: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const k of held) {
    const implied = PAGE_IMPLIES_LEGACY[k as PageAccessKey];
    if (implied) implied.forEach((x) => out.add(x));
    if (k === PAGE.role_groups_manage) out.add(P.business.role_groups.view);
    if (k === DEPRECATED_PAGE_INVOICES_UNIFIED) {
      for (const pk of INVOICE_PAGE_ACCESS_KEYS) {
        PAGE_IMPLIES_LEGACY[pk]?.forEach((x) => out.add(x));
      }
    }
  }
  if (held.has(P.business.role_groups.manage)) {
    out.add(P.business.role_groups.view);
  }
  return out;
}

/** True if user holds a broader `page.*` key that implies `requested` (see `PAGE_IMPLIES_PAGE_KEYS`). */
function heldBroaderPageGrants(requested: PageAccessKey, held: Set<string>): boolean {
  for (const h of held) {
    if (!h.startsWith("page.")) continue;
    const impliedNarrower = PAGE_IMPLIES_PAGE_KEYS[h as PageAccessKey];
    if (impliedNarrower?.includes(requested)) return true;
  }
  return false;
}

export function usePermissions() {
  const { user } = useAuth();

  const permissionSet = useMemo(() => new Set(user?.permissions ?? []), [user?.permissions]);

  const legacyImpliedByPages = useMemo(
    () => legacyKeysImpliedByHeldPageKeys(permissionSet),
    [permissionSet],
  );

  const can = useCallback(
    (key: string) => {
      if (!user) return false;
      if (user.role === "OWNER") return true;
      if (permissionSet.has(key)) return true;
      if (key.startsWith("page.")) {
        if (heldBroaderPageGrants(key as PageAccessKey, permissionSet)) return true;
        if (
          permissionSet.has(DEPRECATED_PAGE_INVOICES_UNIFIED) &&
          (INVOICE_PAGE_ACCESS_KEYS as readonly string[]).includes(key)
        ) {
          return true;
        }
        if (key === DEPRECATED_PAGE_INVOICES_UNIFIED) {
          return (
            INVOICE_PAGE_ACCESS_KEYS.some((pk) => permissionSet.has(pk)) ||
            permissionSet.has(DEPRECATED_PAGE_INVOICES_UNIFIED)
          );
        }
        const implied = PAGE_IMPLIES_LEGACY[key as PageAccessKey];
        if (implied?.some((leg) => permissionSet.has(leg))) return true;
        if (key === PAGE.role_groups && permissionSet.has(P.business.role_groups.manage))
          return true;
        return false;
      }
      return legacyImpliedByPages.has(key);
    },
    [user, permissionSet, legacyImpliedByPages],
  );

  return useMemo(
    () => ({
      isOwner: user?.role === "OWNER",
      isStaff: user?.role === "STAFF",
      role: user?.role as Role | undefined,
      user,
      can,
      permissionSet,
    }),
    [user, can, permissionSet],
  );
}
