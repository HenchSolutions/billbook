import type { LucideIcon } from "lucide-react";
import {
  ArrowDownLeft,
  BarChart3,
  FileMinus,
  FileText,
  Package,
  PackageCheck,
  RotateCcw,
  ShoppingCart,
  Truck,
  Undo2,
  Users,
  Wallet,
} from "lucide-react";
import { PAGE } from "@/constants/page-access";

export type StaffWelcomeModuleId =
  | "items"
  | "stock"
  | "customers"
  | "vendors"
  | "sales"
  | "purchase"
  | "sales_return"
  | "purchase_return"
  | "receipts"
  | "credit_notes"
  | "payments"
  | "reports";

export type StaffTutorialVideoEntry = {
  watchUrl: string | null;
};

export const STAFF_TUTORIAL_VIDEOS: Record<StaffWelcomeModuleId, StaffTutorialVideoEntry> = {
  items: { watchUrl: null },
  stock: { watchUrl: null },
  customers: { watchUrl: null },
  vendors: { watchUrl: null },
  sales: { watchUrl: null },
  purchase: { watchUrl: null },
  sales_return: { watchUrl: null },
  purchase_return: { watchUrl: null },
  receipts: { watchUrl: null },
  credit_notes: { watchUrl: null },
  payments: { watchUrl: null },
  reports: { watchUrl: null },
};

export function getStaffTutorialWatchUrl(id: StaffWelcomeModuleId): string | null {
  const raw = STAFF_TUTORIAL_VIDEOS[id]?.watchUrl;
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

export type StaffWelcomeModule = {
  id: StaffWelcomeModuleId;
  label: string;
  keywords: string[];
  icon: LucideIcon;
  href: string;
  pageKey: string;
};

export const STAFF_WELCOME_MODULES: StaffWelcomeModule[] = [
  {
    id: "items",
    label: "Items",
    keywords: ["product", "sku", "catalog", "rate", "unit"],
    icon: Package,
    href: "/items",
    pageKey: PAGE.items,
  },
  {
    id: "stock",
    label: "Stock",
    keywords: ["inventory", "quantity", "warehouse", "low stock", "ledger"],
    icon: PackageCheck,
    href: "/stock",
    pageKey: PAGE.stock,
  },
  {
    id: "customers",
    label: "Customers",
    keywords: ["party", "client", "receivable", "ledger"],
    icon: Users,
    href: "/parties",
    pageKey: PAGE.parties,
  },
  {
    id: "vendors",
    label: "Vendors",
    keywords: ["supplier", "payable", "purchase party"],
    icon: Truck,
    href: "/vendors",
    pageKey: PAGE.vendors,
  },
  {
    id: "sales",
    label: "Sales invoice",
    keywords: ["invoice", "billing", "sale", "gst bill"],
    icon: FileText,
    href: "/invoices/sales",
    pageKey: PAGE.invoices_sales,
  },
  {
    id: "purchase",
    label: "Purchase invoice",
    keywords: ["vendor bill", "purchase bill", "buy"],
    icon: ShoppingCart,
    href: "/invoices/purchases",
    pageKey: PAGE.invoices_purchases,
  },
  {
    id: "sales_return",
    label: "Sales return",
    keywords: ["return", "credit note sale", "sr"],
    icon: RotateCcw,
    href: "/invoices/sales-return",
    pageKey: PAGE.invoices_sales_return,
  },
  {
    id: "purchase_return",
    label: "Purchase return",
    keywords: ["debit note", "pr", "return to vendor"],
    icon: Undo2,
    href: "/invoices/purchase-return",
    pageKey: PAGE.invoices_purchase_return,
  },
  {
    id: "receipts",
    label: "Receipts",
    keywords: ["incoming", "customer payment", "money in"],
    icon: Wallet,
    href: "/receipts",
    pageKey: PAGE.receipts,
  },
  {
    id: "credit_notes",
    label: "Credit notes",
    keywords: ["cn", "adjustment", "sales credit"],
    icon: FileMinus,
    href: "/credit-notes",
    pageKey: PAGE.credit_notes,
  },
  {
    id: "payments",
    label: "Payments",
    keywords: ["outbound", "pay vendor", "supplier payment"],
    icon: ArrowDownLeft,
    href: "/payments/outbound",
    pageKey: PAGE.payments_outbound,
  },
  {
    id: "reports",
    label: "Reports",
    keywords: ["register", "gst", "analytics", "sales register", "export"],
    icon: BarChart3,
    href: "/reports",
    pageKey: PAGE.reports,
  },
];

export type StaffPrimaryCta = {
  pageKey: string;
  label: string;
  href: string;
};

export const STAFF_PRIMARY_CTA_PRIORITY: readonly StaffPrimaryCta[] = [
  { pageKey: PAGE.invoices_sales, label: "Start with sales", href: "/invoices/sales" },
  { pageKey: PAGE.invoices_purchases, label: "Start with purchases", href: "/invoices/purchases" },
  { pageKey: PAGE.receipts, label: "Go to receipts", href: "/receipts" },
  { pageKey: PAGE.items, label: "Manage items", href: "/items" },
  { pageKey: PAGE.stock, label: "View stock", href: "/stock" },
  { pageKey: PAGE.parties, label: "Manage customers", href: "/parties" },
  { pageKey: PAGE.vendors, label: "Manage vendors", href: "/vendors" },
  { pageKey: PAGE.invoices_sales_return, label: "Sales returns", href: "/invoices/sales-return" },
  {
    pageKey: PAGE.invoices_purchase_return,
    label: "Purchase returns",
    href: "/invoices/purchase-return",
  },
  { pageKey: PAGE.credit_notes, label: "Credit notes", href: "/credit-notes" },
  { pageKey: PAGE.payments_outbound, label: "Payments", href: "/payments/outbound" },
  { pageKey: PAGE.reports, label: "View reports", href: "/reports" },
];
