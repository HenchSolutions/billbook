"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, FileText, Grid2x2, MoreHorizontal, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/core/utils";
import {
  getNavPathById,
  MOBILE_BOTTOM_NAV_SLOTS,
  type MobileNavTabId,
} from "@/lib/navigation/app-nav-catalog";

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

function isRouteActive(pathname: string, base: string) {
  const clean = pathname.replace(/\/$/, "") || "/";
  const route = base.replace(/\/$/, "") || "/";
  return clean === route || clean.startsWith(`${route}/`);
}

/** Icons for the fixed mobile tab strip — aligned with {@link MOBILE_BOTTOM_NAV_SLOTS}. */
const MOBILE_TAB_ICONS: Record<MobileNavTabId, LucideIcon> = {
  dashboard: Grid2x2,
  invoices: FileText,
  customers: Users,
  items: Boxes,
  "reports-hub": BarChart3,
};

export default function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  const pathname = usePathname() ?? "";
  const { can } = usePermissions();

  const items = MOBILE_BOTTOM_NAV_SLOTS.filter((slot) => slot.enabled(can)).map((slot) => ({
    label: slot.tabLabel,
    path: getNavPathById(slot.routeId),
    icon: MOBILE_TAB_ICONS[slot.routeId],
  }));

  const visibleItems = items.slice(0, 4);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 md:hidden">
      <ul className="grid grid-cols-5 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1">
        {visibleItems.map((item) => {
          const active = isRouteActive(pathname, item.path);
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center rounded-md px-1 py-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="mb-0.5 h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onMoreClick}
            className="flex min-h-11 w-full flex-col items-center justify-center rounded-md px-1 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Open more navigation options"
          >
            <MoreHorizontal className="mb-0.5 h-4 w-4" />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
