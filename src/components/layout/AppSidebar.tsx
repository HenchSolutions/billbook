"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/core/utils";
import { SIDEBAR_NAV_ACTIVE } from "@/lib/ui/sidebar-nav-styles";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BusinessIdentity } from "@/components/BusinessIdentity";
import { usePermissions } from "@/hooks/use-permissions";
import {
  getInvoiceSubNavItems,
  getSidebarNavSections,
  type SidebarNavItemModel,
  type SidebarNavSectionModel,
} from "@/lib/navigation/app-nav-catalog";
import { TeamRolesSidebarBlock } from "@/components/layout/TeamRolesSidebarBlock";

/** Static invoice lane links — derived once from the nav catalog. */
const INVOICE_SUB_NAV_ITEMS = getInvoiceSubNavItems();

type SectionTitle = SidebarNavSectionModel["title"];

/** Sidebar sections follow the active route until the user folds/expands; then we store explicit open state (including “none”). */
type SectionFoldMode = { kind: "route" } | { kind: "custom"; open: SectionTitle | null };

interface AppSidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function AppSidebar({ collapsed, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { can } = usePermissions();
  const [sectionFold, setSectionFold] = useState<SectionFoldMode>({ kind: "route" });
  const safePathname = pathname ?? "";
  const normalizedPathname = (safePathname.split("?")[0] ?? "").replace(/\/$/, "") || "/";
  const ledgerSource = searchParams.get("from");
  const isPartyLedgerRoute = /^\/parties\/[^/]+\/ledger\/?$/.test(safePathname);

  const handleLogout = async () => {
    onNavigate?.();
    router.replace("/?loggedOut=1");
    await logout();
  };

  const isPathActive = useCallback(
    (path: string, activeMatch: SidebarNavItemModel["activeMatch"] = "prefix") => {
      if (isPartyLedgerRoute && ledgerSource === "vendors") {
        if (path === "/vendors") return true;
        if (path === "/parties") return false;
      }

      const base = path.replace(/\/$/, "") || "/";
      if (base === "/dashboard") return normalizedPathname === "/dashboard";
      if (activeMatch === "exact") return normalizedPathname === base;
      return normalizedPathname === base || normalizedPathname.startsWith(`${base}/`);
    },
    [isPartyLedgerRoute, ledgerSource, normalizedPathname],
  );

  const isInvoiceTypeActive = (path: string) => {
    if (safePathname.startsWith(path)) return true;
    if (safePathname !== "/invoices/new") return false;

    const type = searchParams.get("type");
    const typeToPath: Record<string, string> = {
      SALE_INVOICE: "/invoices/sales",
      PURCHASE_INVOICE: "/invoices/purchases",
      SALE_RETURN: "/invoices/sales-return",
      PURCHASE_RETURN: "/invoices/purchase-return",
    };

    return typeToPath[type ?? ""] === path;
  };

  const invoicesExpanded =
    normalizedPathname === "/invoices" || normalizedPathname.startsWith("/invoices/");
  const visibleSections = useMemo((): SidebarNavSectionModel[] => {
    return getSidebarNavSections()
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (item.anyPageKey?.length) {
            if (!item.anyPageKey.some((key) => can(key))) return false;
          } else if (item.pageKey && !can(item.pageKey)) {
            return false;
          }
          return true;
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [can]);

  const isSettingsSidebarRoute =
    normalizedPathname === "/profile" ||
    normalizedPathname === "/settings" ||
    normalizedPathname === "/team" ||
    normalizedPathname.startsWith("/settings/role-groups");

  const activeSection = useMemo(() => {
    return (
      visibleSections.find((section) => {
        if (section.title === "Settings") {
          return (
            isSettingsSidebarRoute ||
            section.items.some((item) => isPathActive(item.path, item.activeMatch))
          );
        }

        return section.items.some((item) => isPathActive(item.path, item.activeMatch));
      })?.title ?? null
    );
  }, [isPathActive, isSettingsSidebarRoute, visibleSections]);

  useEffect(() => {
    setSectionFold({ kind: "route" });
  }, [activeSection]);

  const openSection: SectionTitle | null =
    sectionFold.kind === "route" ? activeSection : sectionFold.open;

  const handleSectionToggle = (sectionTitle: SectionTitle) => {
    setSectionFold((prev) => {
      const currentlyOpen = prev.kind === "route" ? activeSection : prev.open;
      if (currentlyOpen === sectionTitle) {
        return { kind: "custom", open: null };
      }
      return { kind: "custom", open: sectionTitle };
    });
  };

  const sectionButtonClass = (active: boolean) =>
    cn(
      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
      active
        ? "text-sidebar-foreground"
        : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground",
    );

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[2px_0_24px_-12px_hsl(var(--sidebar-foreground)_/_0.12)] transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <Link
        href="/dashboard"
        className={cn(
          "flex h-14 shrink-0 items-center px-4 transition-opacity hover:opacity-80",
          collapsed && "justify-center px-2",
          !collapsed && "w-full",
        )}
        onClick={onNavigate}
        aria-label="Dashboard"
      >
        <BusinessIdentity
          name={user?.businessName}
          logoUrl={user?.businessLogoUrl}
          size="sm"
          showName={!collapsed}
          className={cn("min-w-0", !collapsed && "w-full overflow-hidden")}
          nameClassName="min-w-0 truncate text-sm font-semibold text-sidebar-foreground"
        />
      </Link>

      <Separator className="bg-sidebar-border" />

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {visibleSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <button
                type="button"
                onClick={() => handleSectionToggle(section.title)}
                className={cn(sectionButtonClass(openSection === section.title), "justify-between")}
                aria-expanded={openSection === section.title}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{section.title}</span>
                </span>
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform",
                    openSection === section.title && "rotate-90",
                  )}
                  aria-hidden
                />
              </button>
            )}
            {(collapsed || openSection === section.title) && (
              <div className="space-y-1">
                {section.title === "Settings" && (
                  <TeamRolesSidebarBlock
                    collapsed={collapsed}
                    safePathname={safePathname}
                    can={can}
                    onNavigate={onNavigate}
                  />
                )}
                {section.items.map((item) =>
                  item.id === "invoices" && !collapsed ? (
                    <div key={item.id} className="space-y-0.5">
                      <Link
                        href={item.path}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isPathActive(item.path, item.activeMatch)
                            ? SIDEBAR_NAV_ACTIVE
                            : "text-sidebar-foreground/90 hover:bg-sidebar-hover hover:text-sidebar-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>Invoices</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto h-3.5 w-3.5 transition-transform",
                            invoicesExpanded && "rotate-180",
                          )}
                        />
                      </Link>
                      {invoicesExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {INVOICE_SUB_NAV_ITEMS.filter((invoiceItem) =>
                            can(invoiceItem.pageKey),
                          ).map((invoiceItem) => (
                            <Link
                              key={invoiceItem.path}
                              href={invoiceItem.path}
                              onClick={onNavigate}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-sm transition-colors",
                                isInvoiceTypeActive(invoiceItem.path)
                                  ? SIDEBAR_NAV_ACTIVE
                                  : "text-sidebar-foreground/90 hover:bg-sidebar-hover hover:text-sidebar-foreground",
                              )}
                            >
                              {invoiceItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isPathActive(item.path, item.activeMatch)
                          ? SIDEBAR_NAV_ACTIVE
                          : "text-sidebar-foreground/90 hover:bg-sidebar-hover hover:text-sidebar-foreground",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className="shrink-0 space-y-1 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-lg text-sidebar-foreground/90 hover:bg-sidebar-hover hover:text-sidebar-foreground"
          onClick={handleLogout}
          title="Log out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-3">Log out</span>}
        </Button>

        {!collapsed && (
          <>
            <Separator className="bg-sidebar-border" />
            <div className="flex w-full flex-nowrap items-center justify-start gap-2 px-2 py-2">
              <span className="shrink-0 text-xs font-semibold tracking-wide text-sidebar-foreground/55 sm:text-sm">
                Billbook
              </span>
              <img
                src="/hench-logo.png"
                alt="Hench Solutions"
                width={560}
                height={186}
                className="h-10 max-h-10 w-auto min-w-0 max-w-[70%] shrink object-contain object-left"
                decoding="async"
                draggable={false}
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
