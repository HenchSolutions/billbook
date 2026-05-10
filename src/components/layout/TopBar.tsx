import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/core/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { useRoleGroupsList } from "@/hooks/use-role-groups";
import {
  COMMAND_PALETTE_SECTION_HEADINGS,
  COMMAND_PALETTE_SECTION_ORDER,
  getCommandPaletteRoutesBySection,
  getVisibleQuickAddEntries,
} from "@/constants/command-palette-routes";
import { INVOICE_PAGE_ACCESS_KEYS, PAGE } from "@/constants/page-access";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TopBarProps {
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
  /** When true, sidebar is not visible as a rail — show business name in the top bar. */
  isMobile?: boolean;
}

export default function TopBar({
  onMenuClick,
  onSidebarToggle,
  sidebarCollapsed = false,
  isMobile = false,
}: TopBarProps) {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [modifierKeyLabel, setModifierKeyLabel] = useState("Ctrl");

  const displayName = user ? `${user.firstName} ${user.lastName}` : "";
  const userEmail = user?.email?.trim();
  const organizationCode = user?.organizationCode?.trim();
  const businessName = user?.businessName?.trim();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleNavigateAndClose = (path: string) => {
    setProfileOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    router.replace("/?loggedOut=1");
    await logout();
  };

  const canListRoleGroups = can(PAGE.role_groups) || can(PAGE.role_groups_manage);
  const canViewProfile = can(PAGE.profile);
  const canViewSettings = can(PAGE.settings);
  const canViewTeam = can(PAGE.team);
  const canQuickAddInvoice = INVOICE_PAGE_ACCESS_KEYS.some((key) => can(key));
  const canQuickAddParty = can(PAGE.parties);
  const canQuickAddItem = can(PAGE.items);
  const canPayments = can(PAGE.payments_outbound);
  const canReceipts = can(PAGE.receipts);
  const canReports = can(PAGE.reports);
  const shouldResolveRoleGroupName =
    user?.role === "STAFF" &&
    !user.roleGroupName?.trim() &&
    user.roleGroupId != null &&
    canListRoleGroups;

  const { data: roleGroups = [] } = useRoleGroupsList(shouldResolveRoleGroupName);

  const routesBySection = useMemo(() => getCommandPaletteRoutesBySection(can), [can]);

  const quickAddEntries = useMemo(() => getVisibleQuickAddEntries(can), [can]);

  const roleBadgeLabel = useMemo(() => {
    if (!user) return "";
    if (user.role === "OWNER") return "Owner";
    if (user.role === "ADMIN") return "Admin";
    if (user.role === "STAFF") {
      const fromSession = user.roleGroupName?.trim();
      if (fromSession) return fromSession;
      if (user.roleGroupId != null && roleGroups.length > 0) {
        const g = roleGroups.find((r) => r.id === user.roleGroupId);
        const n = g?.name?.trim();
        if (n) return n;
      }
      return "Staff";
    }
    return user.role;
  }, [user, roleGroups]);

  /** Desktop + expanded rail: org code only. Otherwise (mobile or collapsed rail): business name + optional org badge. */
  const desktopSidebarExpanded = !isMobile && !sidebarCollapsed;

  const handleNavigate = useCallback(
    (path: string) => {
      setCommandOpen(false);
      router.push(path);
    },
    [router],
  );

  useEffect(() => {
    const ua = typeof window !== "undefined" ? window.navigator.userAgent : "";
    const platform = typeof window !== "undefined" ? window.navigator.platform : "";
    /** Prefer `userAgent` — `platform` is deprecated and unreliable on some mobile browsers. */
    const appleLike = /Mac OS|iPhone|iPad|iPod/i.test(ua) || /Mac|iPhone|iPad|iPod/i.test(platform);
    setModifierKeyLabel(appleLike ? "⌘" : "Ctrl");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typingField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable === true;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
        return;
      }

      if (typingField) return;

      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        const key = event.key.toLowerCase();
        if (key === "n" && canQuickAddInvoice) {
          event.preventDefault();
          void handleNavigate("/invoices/new?type=SALE_INVOICE");
        } else if (key === "p" && canQuickAddParty) {
          event.preventDefault();
          void handleNavigate("/parties");
        } else if (key === "i" && canQuickAddItem) {
          event.preventDefault();
          void handleNavigate("/items");
        } else if (key === "o" && canPayments) {
          event.preventDefault();
          void handleNavigate("/payments/outbound/new");
        } else if (key === "r" && canReceipts) {
          event.preventDefault();
          void handleNavigate("/receipts");
        } else if (key === "g" && canReports) {
          event.preventDefault();
          void handleNavigate("/reports");
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    canPayments,
    canQuickAddInvoice,
    canQuickAddItem,
    canQuickAddParty,
    canReceipts,
    canReports,
    handleNavigate,
  ]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background px-2 sm:px-3">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {onSidebarToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={onSidebarToggle}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" aria-hidden />
            ) : (
              <PanelLeftClose className="h-5 w-5" aria-hidden />
            )}
          </Button>
        )}
        <div className="flex min-w-0 items-center gap-2">
          {desktopSidebarExpanded ? (
            organizationCode ? (
              <Badge variant="secondary" shape="tag" className="px-2 py-0.5 text-xs">
                {organizationCode}
              </Badge>
            ) : null
          ) : (
            <>
              {businessName ? (
                <p
                  className={cn(
                    "truncate text-sm font-semibold text-foreground",
                    isMobile
                      ? "max-w-[min(100%,11rem)] sm:max-w-md"
                      : "max-w-[min(100%,14rem)] sm:max-w-md lg:max-w-lg",
                  )}
                  title={businessName}
                >
                  {businessName}
                </p>
              ) : organizationCode ? (
                <Badge variant="secondary" shape="tag" className="px-2 py-0.5 text-xs">
                  {organizationCode}
                </Badge>
              ) : null}
              {organizationCode && businessName ? (
                <Badge variant="secondary" shape="tag" className="shrink-0 px-2 py-0.5 text-xs">
                  {organizationCode}
                </Badge>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden h-9 min-w-[11rem] items-center justify-between rounded-md border-border/70 bg-card px-3 text-muted-foreground hover:bg-muted/40 hover:text-foreground md:inline-flex"
          onClick={() => setCommandOpen(true)}
          aria-label="Open command menu"
          title="Search and quick actions"
        >
          <span className="inline-flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search actions</span>
          </span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {modifierKeyLabel}+K
          </kbd>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 md:hidden"
          onClick={() => setCommandOpen(true)}
          aria-label="Open command menu"
          title="Search and quick actions"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Popover open={profileOpen} onOpenChange={setProfileOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors hover:bg-muted/80"
              aria-label="Open profile menu"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <Badge
                  variant="secondary"
                  shape="tag"
                  className="mt-0.5 max-w-[11rem] truncate px-1.5 py-0 text-[10px]"
                  title={roleBadgeLabel}
                >
                  {roleBadgeLabel}
                </Badge>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-sm font-semibold text-foreground shadow-sm">
                {user?.firstName?.charAt(0) || "U"}
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-64 p-0">
            {/* User identity header */}
            <div className="px-4 py-3">
              <p className="text-sm font-semibold leading-tight text-foreground">{displayName}</p>
              {userEmail && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{userEmail}</p>
              )}
              {businessName && (
                <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                  {businessName}
                </p>
              )}
            </div>
            <Separator />
            {/* Navigation actions */}
            <div className="py-1.5">
              {canViewProfile && (
                <button
                  type="button"
                  onClick={() => handleNavigateAndClose("/profile")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/60"
                >
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  My Profile
                </button>
              )}
              {canViewSettings && (
                <button
                  type="button"
                  onClick={() => handleNavigateAndClose("/settings")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/60"
                >
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  Business Settings
                </button>
              )}
              {(canViewTeam || canListRoleGroups) && (
                <button
                  type="button"
                  onClick={() => handleNavigateAndClose("/team")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/60"
                >
                  <Settings className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  Team & Roles
                </button>
              )}
            </div>
            <Separator />
            <div className="py-1.5">
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                Log out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search pages, create actions, shortcuts..." />
        <CommandList>
          <CommandEmpty className="px-6 text-center">
            <div className="mx-auto max-w-[18rem] space-y-2">
              <p className="text-sm font-medium text-foreground">No matches</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Try a page name, route, or action. Clear the search to browse everything.
              </p>
            </div>
          </CommandEmpty>
          {quickAddEntries.length > 0 ? (
            <CommandGroup heading="Quick add">
              {quickAddEntries.map((entry) => (
                <CommandItem
                  key={entry.id}
                  value={`quick:${entry.id}`}
                  keywords={[entry.label, entry.description, entry.path, ...(entry.keywords ?? [])]}
                  onSelect={() => handleNavigate(entry.path)}
                >
                  <div className="flex flex-col">
                    <span>{entry.label}</span>
                    <span className="cmdk-item-desc text-xs text-muted-foreground">
                      {entry.description}
                    </span>
                  </div>
                  {entry.shortcut ? <CommandShortcut>{entry.shortcut}</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {COMMAND_PALETTE_SECTION_ORDER.map((section) => {
            const routes = routesBySection[section];
            if (!routes?.length) return null;
            return (
              <CommandGroup key={section} heading={COMMAND_PALETTE_SECTION_HEADINGS[section]}>
                {routes.map((route) => {
                  const pathTokens = route.path.replace(/^\//, "").replace(/\//g, " ");
                  return (
                    <CommandItem
                      key={`${section}:${route.path}`}
                      value={`goto:${route.path}`}
                      keywords={[route.label, route.path, pathTokens, ...(route.keywords ?? [])]}
                      onSelect={() => handleNavigate(route.path)}
                    >
                      {route.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
          <CommandGroup heading="Help">
            <CommandItem
              value="keyboard shortcuts hotkeys"
              keywords={["shortcuts", "keys", "cheatsheet"]}
              onSelect={() => {
                setCommandOpen(false);
                setShortcutsOpen(true);
              }}
            >
              <div className="flex flex-col">
                <span>View Keyboard Shortcuts</span>
                <span className="cmdk-item-desc text-xs text-muted-foreground">
                  See all productivity hotkeys
                </span>
              </div>
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Open command menu</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">{modifierKeyLabel}+K</kbd>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>New sales invoice</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">N</kbd>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Go to customers</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">P</kbd>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Go to items</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">I</kbd>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>New payment</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">O</kbd>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Go to receipts</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">R</kbd>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Go to reports</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">G</kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
