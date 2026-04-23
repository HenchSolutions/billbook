/**
 * Fine-grained permission keys (legacy / API) — still used for in-page actions (e.g. invoice finalize).
 * Staff **sidebar and route access** use `page.*` keys from `@/constants/page-access`; `usePermissions().can()`
 * resolves both: holding e.g. `page.invoices.sales` implies the invoice.* keys listed in `PAGE_IMPLIES_LEGACY` for that lane.
 *
 * Role groups should store `page.*` keys; GET /business/permissions/catalog may be retired on the backend.
 */
export const P = {
  business: {
    profile: { view: "business.profile.view", update: "business.profile.update" },
    settings: { view: "business.settings.view", update: "business.settings.update" },
    business_types: {
      view: "business.business_types.view",
      manage: "business.business_types.manage",
    },
    industry_types: {
      view: "business.industry_types.view",
      manage: "business.industry_types.manage",
    },
    dashboard: { view: "business.dashboard.view" },
    team: {
      view: "business.team.view",
      invite: "business.team.invite",
      manage: "business.team.manage",
    },
    role_groups: { view: "business.role_groups.view", manage: "business.role_groups.manage" },
  },
  invoice: {
    create: "invoice.create",
    view: "invoice.view",
    update: "invoice.update",
    finalize: "invoice.finalize",
    cancel: "invoice.cancel",
    payment: { record: "invoice.payment.record" },
    communication: "invoice.communication",
    pdf: "invoice.pdf",
  },
  item: {
    create: "item.create",
    view: "item.view",
    update: "item.update",
    delete: "item.delete",
    stock: {
      view: "item.stock.view",
      manage: "item.stock.manage",
      summaryView: "item.stock.summary.view",
      ledgerView: "item.stock.ledger.view",
    },
    adjust_stock: "item.adjust_stock",
    unit: { manage: "item.unit.manage" },
    category: {
      create: "item.category.create",
      view: "item.category.view",
      update: "item.category.update",
      delete: "item.category.delete",
    },
  },
  party: {
    create: "party.create",
    view: "party.view",
    update: "party.update",
    delete: "party.delete",
    consignee: { manage: "party.consignee.manage" },
    ledger: {
      view: "party.ledger.view",
      customerView: "party.ledger.customer.view",
      vendorView: "party.ledger.vendor.view",
    },
    payment: { advance: "party.payment.advance" },
    statement: { view: "party.statement.view" },
  },
  credit_note: {
    create: "credit_note.create",
    view: "credit_note.view",
    update: "credit_note.update",
    delete: "credit_note.delete",
  },
  receipt: {
    create: "receipt.create",
    view: "receipt.view",
    update_allocations: "receipt.update_allocations",
    pdf: "receipt.pdf",
  },
  payment: {
    outbound: {
      create: "payment.outbound.create",
      view: "payment.outbound.view",
      pdf: "payment.outbound.pdf",
    },
  },
  reports: { view: "reports.view" },
  tax: { view: "tax.view" },
  alerts: { view: "alerts.view", manage: "alerts.manage" },
  audit: { view: "audit.view" },
} as const;
