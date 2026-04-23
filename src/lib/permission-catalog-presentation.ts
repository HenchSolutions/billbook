import type { PermissionCatalogNode } from "@/types/role-group";

const sidebarSections: Array<{ id: string; label: string; match: (key: string) => boolean }> = [
  {
    id: "overview",
    label: "Overview",
    match: (key) => key.startsWith("business.dashboard."),
  },
  {
    id: "invoicing",
    label: "Invoicing",
    match: (key) => key.startsWith("invoice."),
  },
  {
    id: "money-credit",
    label: "Money & credit",
    match: (key) =>
      key.startsWith("receipt.") ||
      key.startsWith("payment.outbound.") ||
      key.startsWith("credit_note."),
  },
  {
    id: "catalog",
    label: "Catalog",
    match: (key) => key.startsWith("item."),
  },
  {
    id: "parties",
    label: "Parties",
    match: (key) => key.startsWith("party."),
  },
  {
    id: "reports-tax",
    label: "Reports & tax",
    match: (key) => key.startsWith("reports.") || key.startsWith("tax."),
  },
  {
    id: "organization",
    label: "Organization",
    match: (key) =>
      key.startsWith("business.profile.") ||
      key.startsWith("business.settings.") ||
      key.startsWith("business.team.") ||
      key.startsWith("business.role_groups.") ||
      key.startsWith("business.business_types.") ||
      key.startsWith("business.industry_types.") ||
      key.startsWith("alerts.") ||
      key.startsWith("audit."),
  },
];

const domainLabelMap: Record<string, string> = {
  "business.dashboard": "Dashboard",
  "business.profile": "Business profile",
  "business.settings": "Business settings",
  "business.team": "Team members",
  "business.role_groups": "Role groups",
  "business.business_types": "Business types",
  "business.industry_types": "Industry types",
  invoice: "Invoices",
  "invoice.payment": "Invoice payments",
  item: "Items",
  "item.stock": "Stock",
  "item.unit": "Units",
  "item.category": "Categories",
  party: "Parties",
  "party.ledger": "Party ledgers",
  "party.payment": "Party payments",
  "party.statement": "Party statements",
  receipt: "Receipts",
  "payment.outbound": "Outbound payouts",
  credit_note: "Credit notes",
  reports: "Reports",
  tax: "Tax / GST",
  alerts: "Alerts",
  audit: "Audit logs",
};

const actionLabelMap: Record<string, string> = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  manage: "Manage",
  invite: "Invite",
  finalize: "Finalize",
  cancel: "Cancel draft",
  communication: "Log communication",
  pdf: "Download PDF",
  record: "Record",
  outbound: "Outbound",
  payment: "Payment",
  stock: "Stock",
  adjust_stock: "Adjust stock",
  update_allocations: "Update allocations",
  advance: "Record advance",
};

function toTitle(token: string): string {
  if (!token) return token;
  const mapped = actionLabelMap[token];
  if (mapped) return mapped;
  return token
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function resolveDomainLabel(subject: string): string {
  if (domainLabelMap[subject]) return domainLabelMap[subject];
  const segments = subject.split(".");
  for (let i = segments.length - 1; i > 0; i -= 1) {
    const parent = segments.slice(0, i).join(".");
    if (domainLabelMap[parent]) {
      const suffix = segments.slice(i).map(toTitle).join(" ");
      return suffix ? `${domainLabelMap[parent]} · ${suffix}` : domainLabelMap[parent];
    }
  }
  return toTitle(subject);
}

function prettyPermissionLabel(key: string): string {
  const parts = key.split(".");
  if (parts.length === 1) return toTitle(parts[0]);
  const action = parts[parts.length - 1] ?? "";
  const subject = parts.slice(0, -1).join(".");
  return `${resolveDomainLabel(subject)} — ${toTitle(action)}`;
}

function collectKeys(nodes: PermissionCatalogNode[]): string[] {
  const keys: string[] = [];
  const walk = (node: PermissionCatalogNode) => {
    if (node.type === "permission") {
      keys.push(node.key);
      return;
    }
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return keys;
}

export function buildSidebarAlignedCatalog(data: {
  keys?: string[];
  catalog?: PermissionCatalogNode[];
}): PermissionCatalogNode[] {
  const rawKeys = data.keys?.length ? data.keys : collectKeys(data.catalog ?? []);
  const keys = [...new Set(rawKeys)].sort((a, b) => a.localeCompare(b));

  const sectionBuckets = new Map<string, string[]>();
  for (const section of sidebarSections) {
    sectionBuckets.set(section.id, []);
  }
  const other: string[] = [];

  for (const key of keys) {
    const section = sidebarSections.find((s) => s.match(key));
    if (!section) {
      other.push(key);
      continue;
    }
    sectionBuckets.get(section.id)?.push(key);
  }

  const output: PermissionCatalogNode[] = [];
  for (const section of sidebarSections) {
    const sectionKeys = sectionBuckets.get(section.id) ?? [];
    if (!sectionKeys.length) continue;
    const byDomain = new Map<string, string[]>();
    for (const key of sectionKeys) {
      const parts = key.split(".");
      const domain = parts.length >= 3 ? parts.slice(0, 2).join(".") : (parts[0] ?? "other");
      if (!byDomain.has(domain)) byDomain.set(domain, []);
      byDomain.get(domain)?.push(key);
    }
    const domainNodes: PermissionCatalogNode[] = Array.from(byDomain.entries())
      .sort(([a], [b]) => resolveDomainLabel(a).localeCompare(resolveDomainLabel(b)))
      .map(([domain, domainKeys]) => ({
        type: "folder" as const,
        id: `sidebar-${section.id}-${domain}`,
        label: resolveDomainLabel(domain),
        children: domainKeys
          .sort((a, b) => prettyPermissionLabel(a).localeCompare(prettyPermissionLabel(b)))
          .map((key) => ({
            type: "permission" as const,
            key,
            label: prettyPermissionLabel(key),
          })),
      }));
    output.push({
      type: "folder",
      id: `sidebar-${section.id}`,
      label: section.label,
      children: domainNodes,
    });
  }

  if (other.length) {
    output.push({
      type: "folder",
      id: "sidebar-other",
      label: "Other",
      children: other
        .sort((a, b) => prettyPermissionLabel(a).localeCompare(prettyPermissionLabel(b)))
        .map((key) => ({
          type: "permission",
          key,
          label: prettyPermissionLabel(key),
        })),
    });
  }

  return output;
}
