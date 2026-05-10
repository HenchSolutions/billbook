/**
 * Single source of truth for app routes used by the sidebar, command palette, and mobile nav.
 */
import type { ElementType } from "react";
import {
  ArrowDownLeft,
  BarChart3,
  Boxes,
  CalendarClock,
  FileMinus,
  FileText,
  HandCoins,
  Home,
  Landmark,
  LayoutGrid,
  Package,
  PackageCheck,
  Receipt,
  ReceiptIndianRupee,
  ScrollText,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { INVOICE_PAGE_ACCESS_KEYS, PAGE } from "@/constants/page-access";
import {
  reportCreditNoteRegister,
  reportDebtRegister,
  reportHub,
  reportInvoiceAging,
  reportInvoiceRegister,
  reportItemRegister,
  reportPayablesRegister,
  reportPayoutRegister,
  reportPurchaseRegister,
  reportReceiptRegister,
} from "@/lib/reports/report-labels";

export type CommandPaletteRouteSection =
  | "overview"
  | "master"
  | "parties"
  | "accounting"
  | "reports"
  | "settings"
  | "more";

export type CommandPaletteRouteDef = {
  section: CommandPaletteRouteSection;
  label: string;
  path: string;
  pageKey?: string;
  anyPageKey?: readonly string[];
  keywords?: readonly string[];
};

/** Registers without a dedicated page key — palette visibility when user has general reports or any register lane */
export const REPORT_ROUTE_FALLBACK_KEYS = [
  PAGE.reports,
  PAGE.reports_sales_register,
  PAGE.reports_purchase_register,
  PAGE.reports_receipt_register,
  PAGE.reports_debt_register,
  PAGE.reports_payables_register,
  PAGE.reports_item_register,
] as const;

export const COMMAND_PALETTE_SECTION_HEADINGS: Record<CommandPaletteRouteSection, string> = {
  overview: "Overview",
  master: "Master",
  parties: "Parties",
  accounting: "Accounting",
  reports: "Reports",
  settings: "Settings",
  more: "More",
};

export const COMMAND_PALETTE_SECTION_ORDER: CommandPaletteRouteSection[] = [
  "overview",
  "master",
  "parties",
  "accounting",
  "reports",
  "settings",
  "more",
];

export type AppNavEntryId =
  | "dashboard"
  | "items"
  | "stock"
  | "customers"
  | "vendors"
  | "invoices"
  | "invoice-sales"
  | "invoice-purchase"
  | "invoice-sales-return"
  | "invoice-purchase-return"
  | "receipts"
  | "credit-notes"
  | "payments"
  | "reports-hub"
  | "report-sales-register"
  | "report-purchase-register"
  | "report-receipt-register"
  | "report-debt-register"
  | "report-payables-register"
  | "report-item-register"
  | "report-credit-note-register"
  | "report-payout-register"
  | "report-receivables-aging"
  | "profile"
  | "business-settings"
  | "team"
  | "role-groups"
  | "tax"
  | "audit-logs";

export type AppNavEntry = {
  id: AppNavEntryId;
  path: string;
  /** Primary UI label (sidebar + palette) */
  label: string;
  pageKey?: string;
  anyPageKey?: readonly string[];
  activeMatch?: "exact" | "prefix";
  paletteSection: CommandPaletteRouteSection;
  keywords?: readonly string[];
  /** Top-level sidebar row */
  sidebar?: {
    sectionTitle: string;
    order: number;
    icon: ElementType;
  };
  /** Nested under Invoices */
  invoiceSub?: boolean;
  invoiceSubOrder?: number;
  /** Palette only: use REPORT_ROUTE_FALLBACK_KEYS for visibility */
  useReportFallbackKeys?: boolean;
};

export function reportSidebarIcon(reportPath: string): ElementType {
  const base = reportPath.replace(/\/$/, "") || "/";
  switch (base) {
    case "/reports":
      return LayoutGrid;
    case "/reports/invoice-register":
      return TrendingUp;
    case "/reports/purchase-register":
      return ShoppingCart;
    case "/reports/receipt-register":
      return ReceiptIndianRupee;
    case "/reports/debt-register":
      return HandCoins;
    case "/reports/payables-register":
      return Landmark;
    case "/reports/item-register":
      return Boxes;
    case "/reports/credit-note-register":
      return FileMinus;
    case "/reports/payout-register":
      return ArrowDownLeft;
    case "/reports/receivables-aging":
      return CalendarClock;
    default:
      return BarChart3;
  }
}

const APP_NAV_ENTRIES_LIST = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    paletteSection: "overview",
    keywords: ["home", "overview", "main"],
    sidebar: { sectionTitle: "Overview", order: 0, icon: Home },
  },
  {
    id: "items",
    path: "/items",
    label: "Items",
    pageKey: PAGE.items,
    paletteSection: "master",
    keywords: ["products", "catalog", "sku", "inventory", "master"],
    sidebar: { sectionTitle: "Master", order: 0, icon: Package },
  },
  {
    id: "stock",
    path: "/stock",
    label: "Stock",
    pageKey: PAGE.stock,
    paletteSection: "master",
    keywords: ["inventory", "warehouse", "quantity", "overview", "ledger"],
    sidebar: { sectionTitle: "Master", order: 1, icon: PackageCheck },
  },
  {
    id: "customers",
    path: "/parties",
    label: "Customers",
    pageKey: PAGE.parties,
    paletteSection: "parties",
    keywords: ["parties", "buyers", "clients", "accounts receivable"],
    sidebar: { sectionTitle: "Parties", order: 0, icon: Users },
  },
  {
    id: "vendors",
    path: "/vendors",
    label: "Vendors",
    pageKey: PAGE.vendors,
    paletteSection: "parties",
    keywords: ["suppliers", "accounts payable"],
    sidebar: { sectionTitle: "Parties", order: 1, icon: Truck },
  },
  {
    id: "invoices",
    path: "/invoices",
    label: "Invoices",
    anyPageKey: INVOICE_PAGE_ACCESS_KEYS,
    paletteSection: "accounting",
    keywords: ["bills", "sales", "purchase", "returns"],
    sidebar: { sectionTitle: "Accounting", order: 0, icon: FileText },
  },
  {
    id: "invoice-sales",
    path: "/invoices/sales",
    label: "Sales Invoice",
    pageKey: PAGE.invoices_sales,
    paletteSection: "accounting",
    keywords: ["sale", "bill", "sales invoice"],
    invoiceSub: true,
    invoiceSubOrder: 0,
  },
  {
    id: "invoice-purchase",
    path: "/invoices/purchases",
    label: "Purchase Invoice",
    pageKey: PAGE.invoices_purchases,
    paletteSection: "accounting",
    keywords: ["purchase", "bill", "supplier invoice"],
    invoiceSub: true,
    invoiceSubOrder: 1,
  },
  {
    id: "invoice-sales-return",
    path: "/invoices/sales-return",
    label: "Sales Return",
    pageKey: PAGE.invoices_sales_return,
    paletteSection: "accounting",
    keywords: ["return", "sales return", "credit"],
    invoiceSub: true,
    invoiceSubOrder: 2,
  },
  {
    id: "invoice-purchase-return",
    path: "/invoices/purchase-return",
    label: "Purchase Return",
    pageKey: PAGE.invoices_purchase_return,
    paletteSection: "accounting",
    keywords: ["return", "purchase return"],
    invoiceSub: true,
    invoiceSubOrder: 3,
  },
  {
    id: "receipts",
    path: "/receipts",
    label: "Receipts",
    pageKey: PAGE.receipts,
    paletteSection: "accounting",
    keywords: ["incoming payment", "money in", "collections"],
    sidebar: { sectionTitle: "Accounting", order: 1, icon: Wallet },
  },
  {
    id: "credit-notes",
    path: "/credit-notes",
    label: "Credit Notes",
    pageKey: PAGE.credit_notes,
    paletteSection: "accounting",
    keywords: ["cn", "returns", "adjustments"],
    sidebar: { sectionTitle: "Accounting", order: 2, icon: FileMinus },
  },
  {
    id: "payments",
    path: "/payments/outbound",
    label: "Payments",
    pageKey: PAGE.payments_outbound,
    paletteSection: "accounting",
    keywords: ["pay vendor", "voucher", "outbound", "paid"],
    sidebar: { sectionTitle: "Accounting", order: 3, icon: ArrowDownLeft },
  },
  {
    id: "reports-hub",
    path: "/reports",
    label: "Reports Dashboard",
    pageKey: PAGE.reports,
    activeMatch: "exact",
    paletteSection: "reports",
    keywords: [
      "reports dashboard",
      "hub",
      "summary",
      "analytics",
      "kpi",
      reportHub.title.toLowerCase(),
    ],
    sidebar: {
      sectionTitle: "Reports",
      order: 0,
      icon: reportSidebarIcon("/reports"),
    },
  },
  {
    id: "report-sales-register",
    path: "/reports/invoice-register",
    label: "Sales register",
    pageKey: PAGE.reports_sales_register,
    paletteSection: "reports",
    keywords: ["sales register", "sales invoices", "posted sales", "invoice register"],
    sidebar: {
      sectionTitle: "Reports",
      order: 1,
      icon: reportSidebarIcon("/reports/invoice-register"),
    },
  },
  {
    id: "report-purchase-register",
    path: "/reports/purchase-register",
    label: "Purchase register",
    pageKey: PAGE.reports_purchase_register,
    paletteSection: "reports",
    keywords: ["purchase register", "posted purchases"],
    sidebar: {
      sectionTitle: "Reports",
      order: 2,
      icon: reportSidebarIcon("/reports/purchase-register"),
    },
  },
  {
    id: "report-receipt-register",
    path: "/reports/receipt-register",
    label: "Receipt register",
    pageKey: PAGE.reports_receipt_register,
    paletteSection: "reports",
    keywords: ["money received", "collections register"],
    sidebar: {
      sectionTitle: "Reports",
      order: 3,
      icon: reportSidebarIcon("/reports/receipt-register"),
    },
  },
  {
    id: "report-debt-register",
    path: "/reports/debt-register",
    label: "Debt register",
    pageKey: PAGE.reports_debt_register,
    paletteSection: "reports",
    keywords: ["outstanding", "receivables", "owed to you", "open invoices"],
    sidebar: {
      sectionTitle: "Reports",
      order: 4,
      icon: reportSidebarIcon("/reports/debt-register"),
    },
  },
  {
    id: "report-payables-register",
    path: "/reports/payables-register",
    label: "Payables register",
    pageKey: PAGE.reports_payables_register,
    paletteSection: "reports",
    keywords: ["owed", "vendor balances", "you owe"],
    sidebar: {
      sectionTitle: "Reports",
      order: 5,
      icon: reportSidebarIcon("/reports/payables-register"),
    },
  },
  {
    id: "report-item-register",
    path: "/reports/item-register",
    label: "Item register",
    pageKey: PAGE.reports_item_register,
    paletteSection: "reports",
    keywords: ["stock by item", "item wise"],
    sidebar: {
      sectionTitle: "Reports",
      order: 6,
      icon: reportSidebarIcon("/reports/item-register"),
    },
  },
  {
    id: "report-credit-note-register",
    path: "/reports/credit-note-register",
    label: `${reportCreditNoteRegister.title} register`,
    useReportFallbackKeys: true,
    paletteSection: "reports",
    keywords: [
      "credit notes report",
      "cn register",
      "returns register",
      reportCreditNoteRegister.title.toLowerCase(),
    ],
  },
  {
    id: "report-payout-register",
    path: "/reports/payout-register",
    label: reportPayoutRegister.title,
    useReportFallbackKeys: true,
    paletteSection: "reports",
    keywords: ["payout register", "outbound payments report", "money paid out"],
  },
  {
    id: "report-receivables-aging",
    path: "/reports/receivables-aging",
    label: reportInvoiceAging.navLabel,
    useReportFallbackKeys: true,
    paletteSection: "reports",
    keywords: [
      "aging",
      "ageing",
      "due days",
      "old invoices",
      reportInvoiceAging.title.toLowerCase(),
    ],
  },
  {
    id: "profile",
    path: "/profile",
    label: "Profile",
    pageKey: PAGE.profile,
    paletteSection: "settings",
    keywords: ["account", "user", "me"],
    sidebar: { sectionTitle: "Settings", order: 0, icon: Users },
  },
  {
    id: "business-settings",
    path: "/settings",
    label: "Business Settings",
    pageKey: PAGE.settings,
    activeMatch: "exact",
    paletteSection: "settings",
    keywords: ["preferences", "configuration", "company", "business profile"],
    sidebar: { sectionTitle: "Settings", order: 1, icon: Settings },
  },
  {
    id: "team",
    path: "/team",
    label: "Team",
    pageKey: PAGE.team,
    paletteSection: "settings",
    keywords: ["members", "invite", "staff", "users"],
  },
  {
    id: "role-groups",
    path: "/settings/role-groups",
    label: "Role groups",
    anyPageKey: [PAGE.role_groups, PAGE.role_groups_manage],
    paletteSection: "settings",
    keywords: ["roles", "permissions", "access", "rbac"],
  },
  {
    id: "tax",
    path: "/tax",
    label: "Tax / GST",
    pageKey: PAGE.tax,
    paletteSection: "more",
    keywords: ["gst", "hsn", "rates", "tax"],
    sidebar: { sectionTitle: "More", order: 0, icon: Receipt },
  },
  {
    id: "audit-logs",
    path: "/audit-logs",
    label: "Audit Logs",
    pageKey: PAGE.audit_logs,
    paletteSection: "more",
    keywords: ["audit", "history", "changes", "trail"],
    sidebar: { sectionTitle: "More", order: 1, icon: ScrollText },
  },
] as const satisfies readonly AppNavEntry[];

export const APP_NAV_ENTRIES: readonly AppNavEntry[] = APP_NAV_ENTRIES_LIST;

function commandPaletteLabel(entry: AppNavEntry): string {
  switch (entry.id) {
    case "reports-hub":
      return reportHub.title;
    case "report-sales-register":
      return reportInvoiceRegister.title;
    case "report-purchase-register":
      return reportPurchaseRegister.title;
    case "report-receipt-register":
      return reportReceiptRegister.title;
    case "report-debt-register":
      return reportDebtRegister.title;
    case "report-payables-register":
      return reportPayablesRegister.title;
    case "report-item-register":
      return reportItemRegister.title;
    default:
      return entry.label;
  }
}

/** Palette rows derived from catalog (labels aligned with `report-labels` where applicable). */
export const COMMAND_PALETTE_ROUTES: CommandPaletteRouteDef[] = APP_NAV_ENTRIES.map((e) => ({
  section: e.paletteSection,
  label: commandPaletteLabel(e),
  path: e.path,
  pageKey: e.pageKey,
  anyPageKey: e.useReportFallbackKeys ? REPORT_ROUTE_FALLBACK_KEYS : e.anyPageKey,
  keywords:
    e.id === "reports-hub" ? [...(e.keywords ?? []), reportHub.title.toLowerCase()] : e.keywords,
}));

export type SidebarNavItemModel = {
  id: AppNavEntryId;
  path: string;
  label: string;
  icon: ElementType;
  pageKey?: string;
  anyPageKey?: readonly string[];
  activeMatch?: "exact" | "prefix";
};

export type SidebarNavSectionModel = {
  title: string;
  items: SidebarNavItemModel[];
};

/** Groups main sidebar links (excludes invoice sub-rows and palette-only report extras). */
export function getSidebarNavSections(): SidebarNavSectionModel[] {
  const sectionOrder: string[] = [];
  const bySection = new Map<string, SidebarNavItemModel[]>();

  for (const e of APP_NAV_ENTRIES) {
    if (!e.sidebar || e.invoiceSub) continue;

    const row: SidebarNavItemModel = {
      id: e.id,
      path: e.path,
      label: e.label,
      icon: e.sidebar.icon,
      pageKey: e.pageKey,
      anyPageKey: e.anyPageKey,
      activeMatch: e.activeMatch,
    };

    const title = e.sidebar.sectionTitle;
    if (!bySection.has(title)) {
      bySection.set(title, []);
      sectionOrder.push(title);
    }
    bySection.get(title)!.push(row);
  }

  for (const title of sectionOrder) {
    const items = bySection.get(title)!;
    items.sort((a, b) => {
      const oa = APP_NAV_ENTRIES.find((e) => e.id === a.id)?.sidebar?.order ?? 0;
      const ob = APP_NAV_ENTRIES.find((e) => e.id === b.id)?.sidebar?.order ?? 0;
      return oa - ob;
    });
  }

  return sectionOrder.map((title) => ({
    title,
    items: bySection.get(title)!,
  }));
}

export function getInvoiceSubNavItems(): {
  path: string;
  label: string;
  pageKey: string;
}[] {
  return APP_NAV_ENTRIES.filter((e): e is AppNavEntry & { invoiceSub: true; pageKey: string } =>
    Boolean(e.invoiceSub && e.pageKey),
  )
    .slice()
    .sort((a, b) => (a.invoiceSubOrder ?? 0) - (b.invoiceSubOrder ?? 0))
    .map((e) => ({
      path: e.path,
      label: e.label,
      pageKey: e.pageKey,
    }));
}

/** Paths used by TeamRolesSidebarBlock — labels for collapsed single-link modes come from catalog `label`. */
export const TEAM_ROUTE_PATH = APP_NAV_ENTRIES.find((e) => e.id === "team")?.path ?? "/team";
export const ROLE_GROUPS_ROUTE_PATH =
  APP_NAV_ENTRIES.find((e) => e.id === "role-groups")?.path ?? "/settings/role-groups";

/** Nested label under “Team & roles” parent */
export const TEAM_MEMBERS_SIDEBAR_LABEL = "Members";

/** Bottom bar tab destinations — subset of {@link AppNavEntryId}. */
export type MobileNavTabId = Extract<
  AppNavEntryId,
  "dashboard" | "invoices" | "customers" | "items" | "reports-hub"
>;

export type MobileBottomNavSlot = {
  routeId: MobileNavTabId;
  tabLabel: string;
  enabled: (can: (key: string) => boolean) => boolean;
};

export const MOBILE_BOTTOM_NAV_SLOTS: MobileBottomNavSlot[] = [
  {
    routeId: "dashboard",
    tabLabel: "Home",
    enabled: () => true,
  },
  {
    routeId: "invoices",
    tabLabel: "Bills",
    enabled: (can) => INVOICE_PAGE_ACCESS_KEYS.some((key) => can(key)),
  },
  {
    routeId: "customers",
    tabLabel: "Parties",
    enabled: (can) => can(PAGE.parties) || can(PAGE.vendors),
  },
  {
    routeId: "items",
    tabLabel: "Inventory",
    enabled: (can) => can(PAGE.items) || can(PAGE.stock),
  },
  {
    routeId: "reports-hub",
    tabLabel: "Reports",
    enabled: (can) => can(PAGE.reports),
  },
];

export function getNavPathById(id: AppNavEntryId): string {
  const e = APP_NAV_ENTRIES.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown nav id: ${id}`);
  return e.path;
}
