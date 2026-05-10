"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, LogOut, Menu } from "lucide-react";

import Logo from "@/components/Logo";
import { adminConsoleHomePath, adminConsoleNavItems } from "@/lib/admin/admin-nav";
import { useAuth } from "@/contexts/AuthContext";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/core/utils";
import { SIDEBAR_NAV_ACTIVE } from "@/lib/ui/sidebar-nav-styles";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";

  return (
    <ul className="flex flex-col gap-1" role="list">
      {adminConsoleNavItems.map(({ href, label, description, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--sidebar-background))]",
                active
                  ? cn(SIDEBAR_NAV_ACTIVE, "border-transparent shadow-sm")
                  : "border-transparent text-sidebar-foreground/90 hover:border-sidebar-border/50 hover:bg-sidebar-hover hover:text-sidebar-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border shadow-sm transition-colors",
                  active
                    ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground"
                    : "border-sidebar-border/40 bg-sidebar-accent/30 text-sidebar-foreground/90 group-hover:text-sidebar-foreground",
                )}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block leading-tight">{label}</span>
                {description ? (
                  <span className="mt-0.5 block text-xs font-normal text-sidebar-muted">
                    {description}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function NavIconRail() {
  const pathname = usePathname() ?? "";

  return (
    <ul className="flex flex-col items-center gap-2" role="list">
      {adminConsoleNavItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--sidebar-background))]",
                active
                  ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "border-sidebar-border/40 bg-sidebar-accent/30 text-sidebar-foreground/90 hover:bg-sidebar-hover hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AdminConsoleFrame({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const onSignOut = () => {
    void logout().then(() => router.replace("/"));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:gap-4 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))] lg:pl-[max(2rem,env(safe-area-inset-left,0px))] lg:pr-[max(2rem,env(safe-area-inset-right,0px))]">
        <div className="flex h-full w-full items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                  aria-label="Open admin navigation"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex w-[min(100%,20rem)] flex-col gap-0 border-r border-sidebar-border !bg-sidebar p-0 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] text-sidebar-foreground shadow-none [&>button]:right-3 [&>button]:top-4 [&>button]:text-sidebar-foreground"
              >
                <SheetHeader className="border-b border-sidebar-border/80 bg-sidebar px-4 py-4 text-left">
                  <SheetTitle className="text-base font-semibold text-sidebar-foreground">
                    Admin console
                  </SheetTitle>
                  <p className="text-xs font-normal text-sidebar-muted">Choose a section</p>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin console">
                  <NavLinks onNavigate={closeMobile} />
                </nav>
              </SheetContent>
            </Sheet>

            <Link
              href={adminConsoleHomePath}
              className="min-w-0 shrink-0 rounded-md outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="BillBook admin home"
            >
              <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
            </Link>

            <Separator orientation="vertical" className="hidden h-7 sm:block" />

            <Badge
              variant="secondary"
              className="hidden max-w-[10rem] truncate text-xs font-normal sm:inline-flex"
            >
              Admin
            </Badge>
            <span className="hidden text-xs text-muted-foreground md:inline">·</span>
            <span className="hidden text-xs text-muted-foreground md:inline">Internal tools</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="gap-1.5 shadow-sm"
              onClick={onSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-[calc(100vh-3.5rem)] w-full">
        <aside
          className={cn(
            "sticky top-14 z-30 hidden h-[calc(100vh-3.5rem)] min-h-0 shrink-0 flex-col border-r border-sidebar-border !bg-sidebar text-sidebar-foreground shadow-[2px_0_24px_-12px_hsl(var(--sidebar-foreground)_/_0.12)] transition-[width] duration-300 ease-in-out md:flex",
            sidebarCollapsed ? "w-16" : "w-64",
          )}
          aria-label="Admin console"
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute -right-3 top-5 z-40 hidden h-8 w-8 rounded-full border-border/60 bg-background shadow-sm transition-all duration-300 ease-in-out md:inline-flex"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {sidebarCollapsed ? (
            <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-2 py-5 transition-opacity duration-200 ease-in-out">
              <NavIconRail />
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-5 transition-opacity duration-200 ease-in-out">
              <p className="mb-3 shrink-0 px-2 text-xs font-medium uppercase tracking-wide text-sidebar-muted">
                Navigation
              </p>
              <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
                <NavLinks />
              </div>
            </div>
          )}
        </aside>

        <main className="admin-main-shell min-w-0 flex-1 pb-12 pt-6 sm:py-10">
          <div className="mx-auto w-full min-w-0 max-w-[min(100%,1600px)]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AdminConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRouteGuard>
      <AdminConsoleFrame>{children}</AdminConsoleFrame>
    </AdminRouteGuard>
  );
}
