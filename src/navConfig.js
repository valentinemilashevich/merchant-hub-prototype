/** Повторює навігацію з https://side-panel-chi.vercel.app/ */

export const SKIP_RECENT_IDS = new Set(["dashboard", "bank-mid"]);

export const NAV_SECTIONS = [
  { type: "item", id: "dashboard", label: "Dashboard", icon: "dashboard" },
  {
    type: "group",
    id: "payments",
    label: "Payments",
    icon: "payments",
    children: [
      { id: "orders", label: "Orders" },
      { id: "payment-analytics", label: "Payment analytics" },
      { id: "disputes", label: "Disputes" },
      { id: "dispute-analytics", label: "Dispute analytics" },
      { id: "fraud-notifications", label: "Fraud notifications" },
      { id: "payment-links", label: "Payment links" },
      { id: "risk-analytics", label: "Risk analytics" },
    ],
  },
  {
    type: "group",
    id: "orchestration",
    label: "Orchestration",
    icon: "orchestration",
    children: [
      { id: "available-connectors", label: "Available connectors" },
      { id: "connector-accounts", label: "Connector accounts" },
      { id: "routing-configuration", label: "Routing configuration" },
      { id: "orchestration-analytics", label: "Orchestration analytics" },
    ],
  },
  { type: "item", id: "bank-mid", label: "Bank MID", icon: "bankMids" },
  {
    type: "group",
    id: "billing",
    label: "Billing",
    icon: "billing",
    children: [
      { id: "subscriptions", label: "Subscriptions" },
      { id: "products", label: "Products" },
      { id: "coupons", label: "Coupons" },
      { id: "billing-invoices", label: "Invoices" },
      { id: "billing-dashboard", label: "Billing dashboard" },
      { id: "billing-settings", label: "Billing settings" },
    ],
  },
  {
    type: "group",
    id: "fraud-prevention",
    label: "Fraud prevention",
    icon: "fraudPrevention",
    children: [
      { id: "lists", label: "Lists" },
      { id: "rules", label: "Rules" },
      { id: "alerts-list", label: "Alerts list" },
      { id: "alerts-analytics", label: "Alerts analytics" },
    ],
  },
  {
    type: "group",
    id: "finances",
    label: "Finances",
    icon: "finances",
    children: [
      { id: "settlements", label: "Settlements" },
      { id: "monthly-report", label: "Monthly report" },
      { id: "finances-invoices", label: "Invoices" },
    ],
  },
  {
    type: "group",
    id: "developers",
    label: "Developers",
    icon: "developers",
    children: [
      { id: "channels", label: "Channels" },
      { id: "apple-pay-domains", label: "Apple Pay Domains" },
      { id: "api-limits", label: "API Limits" },
      { id: "api-logs", label: "API Logs" },
    ],
  },
  { type: "item", id: "reports-exports", label: "Reports&Exports", icon: "reportsExports" },
  {
    type: "group",
    id: "taxes",
    label: "Taxes",
    icon: "taxes",
    children: [
      { id: "locations", label: "Locations" },
      { id: "tax-settings", label: "Tax settings" },
    ],
  },
  {
    type: "group",
    id: "account-settings",
    label: "Account settings",
    icon: "accountSettings",
    children: [
      { id: "user-management", label: "User management" },
      { id: "agreements", label: "Agreements" },
      { id: "questionaries", label: "Questionaries" },
      { id: "legal-entities", label: "Legal entities" },
      { id: "audit-log", label: "Audit log" },
    ],
  },
];

export function buildSearchIndex(sections) {
  const idx = [];
  for (const s of sections) {
    if (s.type === "item") {
      idx.push({ id: s.id, label: s.label, parentLabel: null });
    } else {
      for (const c of s.children) {
        idx.push({ id: c.id, label: c.label, parentLabel: s.label });
      }
    }
  }
  return idx;
}

export function getMetaForId(sections, id) {
  for (const s of sections) {
    if (s.type === "item" && s.id === id) {
      return { label: s.label, parentLabel: null };
    }
    if (s.type === "group") {
      const ch = s.children.find((c) => c.id === id);
      if (ch) return { label: ch.label, parentLabel: s.label };
    }
  }
  return { label: id, parentLabel: null };
}

export function findParentGroupId(sections, itemId) {
  for (const s of sections) {
    if (s.type === "group" && s.children.some((c) => c.id === itemId)) {
      return s.id;
    }
  }
  return null;
}
