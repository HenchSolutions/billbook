"use client";

import Link from "next/link";
import { ChevronDown, Shield, UserCog } from "lucide-react";
import { cn } from "@/lib/core/utils";
import { PAGE } from "@/constants/page-access";
import {
  ROLE_GROUPS_ROUTE_PATH,
  TEAM_MEMBERS_SIDEBAR_LABEL,
  TEAM_ROUTE_PATH,
} from "@/lib/navigation/app-nav-catalog";
import { SIDEBAR_NAV_ACTIVE } from "@/lib/ui/sidebar-nav-styles";

type CanFn = (key: string) => boolean;

interface TeamRolesSidebarBlockProps {
  collapsed: boolean;
  safePathname: string;
  can: CanFn;
  onNavigate?: () => void;
}

export function TeamRolesSidebarBlock({
  collapsed,
  safePathname,
  can,
  onNavigate,
}: TeamRolesSidebarBlockProps) {
  const canTeam = can(PAGE.team);
  const canRoles = can(PAGE.role_groups) || can(PAGE.role_groups_manage);

  if (!canTeam && !canRoles) return null;

  const p = (safePathname.split("?")[0] ?? "").replace(/\/$/, "") || "/";
  const inTeam = p === TEAM_ROUTE_PATH;
  const inRoles = safePathname.startsWith(ROLE_GROUPS_ROUTE_PATH);
  const inTeamOrRoles = inTeam || inRoles;

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
      active
        ? SIDEBAR_NAV_ACTIVE
        : "text-sidebar-foreground/90 hover:bg-sidebar-hover hover:text-sidebar-foreground",
    );

  const subLinkClass = (active: boolean) =>
    cn(
      "block rounded-lg px-3 py-2 text-sm transition-colors",
      active
        ? SIDEBAR_NAV_ACTIVE
        : "text-sidebar-foreground/90 hover:bg-sidebar-hover hover:text-sidebar-foreground",
    );

  /** Both areas: parent + expandable subs (mirrors Invoices). */
  if (canTeam && canRoles) {
    const parentHref = TEAM_ROUTE_PATH;
    const expanded = inTeamOrRoles;

    if (collapsed) {
      return (
        <Link
          href={parentHref}
          onClick={onNavigate}
          className={linkClass(inTeamOrRoles)}
          title="Team & roles"
          aria-label="Team & roles"
        >
          <UserCog className="h-4 w-4 shrink-0" />
        </Link>
      );
    }

    return (
      <div className="space-y-0.5">
        <Link href={parentHref} onClick={onNavigate} className={linkClass(inTeamOrRoles)}>
          <UserCog className="h-4 w-4 shrink-0" />
          <span>Team & roles</span>
          <ChevronDown
            className={cn("ml-auto h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
            aria-hidden
          />
        </Link>
        {expanded && (
          <div className="ml-6 mt-1 space-y-1">
            <Link href={TEAM_ROUTE_PATH} onClick={onNavigate} className={subLinkClass(inTeam)}>
              {TEAM_MEMBERS_SIDEBAR_LABEL}
            </Link>
            <Link
              href={ROLE_GROUPS_ROUTE_PATH}
              onClick={onNavigate}
              className={subLinkClass(inRoles)}
            >
              Role groups
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (canTeam) {
    return (
      <Link
        href={TEAM_ROUTE_PATH}
        onClick={onNavigate}
        className={linkClass(inTeam)}
        title={collapsed ? "Team" : undefined}
      >
        <UserCog className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Team</span>}
      </Link>
    );
  }

  return (
    <Link
      href={ROLE_GROUPS_ROUTE_PATH}
      onClick={onNavigate}
      className={linkClass(inRoles)}
      title={collapsed ? "Role groups" : undefined}
    >
      <Shield className="h-4 w-4 shrink-0" />
      {!collapsed && <span>Role groups</span>}
    </Link>
  );
}
