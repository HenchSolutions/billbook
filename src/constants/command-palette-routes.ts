import type {
  CommandPaletteRouteDef,
  CommandPaletteRouteSection,
} from "@/lib/navigation/app-nav-catalog";
import {
  COMMAND_PALETTE_ROUTES,
  COMMAND_PALETTE_SECTION_HEADINGS,
  COMMAND_PALETTE_SECTION_ORDER,
  REPORT_ROUTE_FALLBACK_KEYS,
} from "@/lib/navigation/app-nav-catalog";
import { INVOICE_PAGE_ACCESS_KEYS, PAGE } from "@/constants/page-access";

export type { CommandPaletteRouteDef, CommandPaletteRouteSection };

export {
  COMMAND_PALETTE_ROUTES,
  REPORT_ROUTE_FALLBACK_KEYS,
  COMMAND_PALETTE_SECTION_HEADINGS,
  COMMAND_PALETTE_SECTION_ORDER,
};

export type CommandPaletteQuickAddDef = {
  id: string;
  label: string;
  description: string;
  path: string;
  shortcut?: string;
  pageKey?: string;
  anyPageKey?: readonly string[];
  keywords?: readonly string[];
};

export const COMMAND_PALETTE_QUICK_ADD: CommandPaletteQuickAddDef[] = [
  {
    id: "new-sales-invoice",
    label: "New Sales Invoice",
    description: "Create a sale bill quickly",
    path: "/invoices/new?type=SALE_INVOICE",
    shortcut: "N",
    anyPageKey: INVOICE_PAGE_ACCESS_KEYS,
    keywords: ["create", "new", "sale", "invoice", "bill"],
  },
  {
    id: "new-customer",
    label: "New Customer",
    description: "Add party details",
    path: "/parties",
    shortcut: "P",
    pageKey: PAGE.parties,
    keywords: ["party", "customer", "buyer", "client", "add"],
  },
  {
    id: "new-item",
    label: "New Item",
    description: "Add product or service",
    path: "/items",
    shortcut: "I",
    pageKey: PAGE.items,
    keywords: ["product", "sku", "catalog", "create"],
  },
  {
    id: "new-payment",
    label: "New Payment",
    description: "Record outbound voucher",
    path: "/payments/outbound/new",
    shortcut: "O",
    pageKey: PAGE.payments_outbound,
    keywords: ["pay", "vendor", "outbound", "voucher"],
  },
];

function routeVisible(route: CommandPaletteRouteDef, can: (key: string) => boolean): boolean {
  if (route.anyPageKey?.length) return route.anyPageKey.some((k) => can(k));
  if (route.pageKey) return can(route.pageKey);
  return true;
}

function quickAddVisible(entry: CommandPaletteQuickAddDef, can: (key: string) => boolean): boolean {
  if (entry.anyPageKey?.length) return entry.anyPageKey.some((k) => can(k));
  if (entry.pageKey) return can(entry.pageKey);
  return true;
}

export function getCommandPaletteRoutesBySection(
  can: (key: string) => boolean,
): Partial<Record<CommandPaletteRouteSection, CommandPaletteRouteDef[]>> {
  const out: Partial<Record<CommandPaletteRouteSection, CommandPaletteRouteDef[]>> = {};
  for (const route of COMMAND_PALETTE_ROUTES) {
    if (!routeVisible(route, can)) continue;
    const list = out[route.section] ?? [];
    list.push(route);
    out[route.section] = list;
  }
  return out;
}

export function getVisibleQuickAddEntries(
  can: (key: string) => boolean,
): CommandPaletteQuickAddDef[] {
  return COMMAND_PALETTE_QUICK_ADD.filter((e) => quickAddVisible(e, can));
}
