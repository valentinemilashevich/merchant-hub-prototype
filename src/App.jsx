import { useState } from "react";

/* ── Design Tokens (from Figma) ── */
const T = {
  font: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  white: "#fff",
  black: "#000",
  gray100: "#f5f5f5",
  gray200: "#ebebeb",
  gray300: "#e0e0e0",
  gray400: "#8f8f8f",
  gray500: "#666",
  gray600: "#3d3d3d",
  accent: "#0072e0",
  border: "rgba(0,0,0,0.08)",
  borderMid: "rgba(0,0,0,0.12)",
  shadow: "0 2px 4px -2px rgba(0,0,0,0.12)",
  radius: { sm: 4, md: 6, lg: 8 },
};

/* ── Inline SVG Icons ── */
const icons = {
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#8f8f8f" strokeWidth="1.5"/><path d="M11 11L14 14" stroke="#8f8f8f" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  chevronUpDown: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 6.5L8 3.5L11 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 9.5L8 12.5L11 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  inbox: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 9h3.5L7 11h2l1.5-2H14M2 9V12.5C2 13.3 2.7 14 3.5 14h9c.8 0 1.5-.7 1.5-1.5V9M2 9L4 3.5C4.2 3 4.6 2.5 5.2 2.5h5.6c.6 0 1 .4 1.2 1L14 9" stroke="#3d3d3d" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="#3d3d3d" strokeWidth="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="#3d3d3d" strokeWidth="1.2"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="#3d3d3d" strokeWidth="1.2"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="#3d3d3d" strokeWidth="1.2"/></svg>
  ),
  payments: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="#3d3d3d" strokeWidth="1.2"/><path d="M1.5 6.5h13" stroke="#3d3d3d" strokeWidth="1.2"/></svg>
  ),
  bank: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6L8 2L14 6M3 7v5M6.5 7v5M9.5 7v5M13 7v5M1 13h14" stroke="#3d3d3d" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  route: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="4" r="2.5" stroke="#3d3d3d" strokeWidth="1.2"/><circle cx="12" cy="12" r="2.5" stroke="#3d3d3d" strokeWidth="1.2"/><path d="M6.5 4H11c1.7 0 3 1.3 3 3v0c0 1.7-1.3 3-3 3H5" stroke="#3d3d3d" strokeWidth="1.2" strokeLinecap="round"/></svg>
  ),
  billing: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 1.5v13l2-1.5 2 1.5 2-1.5 2 1.5v-13l-2 1.5-2-1.5-2 1.5-2-1.5z" stroke="#3d3d3d" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6.5 6h3M6.5 9h3" stroke="#3d3d3d" strokeWidth="1.2" strokeLinecap="round"/></svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2.5 4v4c0 3.5 2.5 5.5 5.5 6.5 3-1 5.5-3 5.5-6.5V4L8 1.5z" stroke="#3d3d3d" strokeWidth="1.2" strokeLinejoin="round"/></svg>
  ),
  wallet: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="#3d3d3d" strokeWidth="1.2"/><path d="M11 8.5h1" stroke="#3d3d3d" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 6.5h12" stroke="#3d3d3d" strokeWidth="1.2"/></svg>
  ),
  taxes: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#3d3d3d" strokeWidth="1.2"/><path d="M5.5 5.5l5 5M5.5 8a.5.5 0 100-1 .5.5 0 000 1zM10.5 9a.5.5 0 100-1 .5.5 0 000 1z" stroke="#3d3d3d" strokeWidth="1.2"/></svg>
  ),
  reports: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12V7M8 12V4M12 12V9" stroke="#3d3d3d" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  code: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 4L1.5 8 5 12M11 4l3.5 4L11 12" stroke="#3d3d3d" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="#3d3d3d" strokeWidth="1.2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="#3d3d3d" strokeWidth="1.2" strokeLinecap="round"/></svg>
  ),
  filters: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  columns: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="10" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>
  ),
  export: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 5l3-3 3 3M3 11v2h10v-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  link: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 10l4-4M7 4.5L9 2.5a2.12 2.12 0 013 3L10 7.5M6 8.5L4 10.5a2.12 2.12 0 003 3L9 11.5" stroke="#0072e0" strokeWidth="1.2" strokeLinecap="round"/></svg>
  ),
};

/* ── Navigation Data ── */
const NAV = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Payments", icon: "payments", chevron: true },
  { label: "Bank MIDs", icon: "bank", chevron: true },
  { label: "Orchestration", icon: "route", chevron: true },
  { label: "Billing", icon: "billing", chevron: true },
  { label: "Fraud prevention", icon: "shield", chevron: true },
  { label: "Finances", icon: "wallet", chevron: true },
  { label: "Taxes", icon: "taxes", chevron: true },
  { label: "Reports&Exports", icon: "reports", chevron: true },
  { label: "Developers", icon: "code", chevron: true },
  { label: "Account settings", icon: "settings", chevron: true },
];

/* ── Table Columns ── */
const COLUMNS = [
  { label: "Order ID", width: 160 },
  { label: "Channel", width: 88 },
  { label: "Amount", width: 112 },
  { label: "Description", width: 160 },
  { label: "Status", width: 120 },
  { label: "Substatus", width: 120 },
  { label: "Created date", width: 192 },
  { label: "Payment type", width: 160 },
  { label: "Payment method", width: 160 },
];

/* ── Mock Table Data ── */
const ROWS = Array.from({ length: 14 }, (_, i) => ({
  id: `${Math.floor(Math.random() * 9e15).toString().padStart(16, "0")}`,
  channel: "–",
  amount: `${(10 + Math.random() * 20).toFixed(2)} USD`,
  desc: "transaction description...",
  status: i % 3 === 0 ? "Refund" : "Settled",
  substatus: i % 3 === 0 ? "Refund" : "Settled",
  date: `Mar ${String(i + 1).padStart(2, "0")}, 2023 ${String(7 + (i % 12)).padStart(2, "0")}:${String(i * 7 % 60).padStart(2, "0")}`,
  payType: "Recurring",
  payMethod: "Card ****1234",
}));

/* ── Skeleton bar (placeholder for table content like in Figma) ── */
function Skel({ w }) {
  return <div style={{ width: w, height: 4, borderRadius: 2, background: "#ddd" }} />;
}

/* ── App ── */
export default function App() {
  const [activeNav] = useState("Payments");

  const s = {
    label: { fontFamily: T.font, fontSize: 14, fontWeight: 500, lineHeight: "24px", margin: 0 },
    caption: { fontFamily: T.font, fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: 0.12, margin: 0 },
    title: { fontFamily: T.font, fontSize: 21, fontWeight: 600, lineHeight: "32px", letterSpacing: -0.21, margin: 0 },
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.white, fontFamily: T.font, color: T.black }}>
      {/* ══ SIDEBAR ══ */}
      <div style={{ width: 280, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 16, flexShrink: 0, borderRight: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Account */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 4, borderRadius: T.radius.lg, cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: T.radius.md, background: T.black, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, flexShrink: 0 }}>D</div>
              <span style={{ ...s.label, color: T.gray600, flex: 1 }}>Demo Solidgate</span>
              <span style={{ color: T.gray400 }}>{icons.chevronUpDown}</span>
            </div>

            {/* Search */}
            <div style={{ padding: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 4, border: `1px solid ${T.border}`, borderRadius: T.radius.md, boxShadow: T.shadow, background: T.white }}>
                {icons.search}
                <span style={{ ...s.label, color: T.gray400, fontWeight: 400 }}>Find category</span>
              </div>
            </div>

            {/* Notifications */}
            <div style={{ padding: "0 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 4, borderRadius: T.radius.md, cursor: "pointer" }}>
                <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{icons.inbox}</span>
                <span style={{ ...s.label, color: T.gray600 }}>Notifications</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div style={{ padding: "0 4px" }}>
            <div style={{ padding: 8 }}>
              <p style={{ ...s.caption, color: T.gray500 }}>Categories</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {NAV.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: 4, borderRadius: T.radius.md, cursor: "pointer" }}>
                  <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{icons[item.icon]}</span>
                  <span style={{ ...s.label, color: T.gray600, flex: 1 }}>{item.label}</span>
                  {item.chevron && <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: T.gray400 }}>{icons.chevronDown}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 4, borderRadius: T.radius.lg }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#c4c4c4", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...s.caption, fontWeight: 500, color: T.gray600 }}>Jane Doe</p>
            <p style={{ ...s.caption, color: "rgba(0,0,0,0.48)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>jane.doe@solidgate.com</p>
          </div>
          <span style={{ color: T.gray400 }}>{icons.chevronUpDown}</span>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, padding: "16px 24px 72px", overflow: "auto", minWidth: 0 }}>
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ ...s.title, color: T.black }}>Orders</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <span style={{ ...s.label, color: T.accent, fontSize: 14 }}>Learn about Orders</span>
              {icons.link}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { icon: "filters", label: "Filters" },
              { icon: "columns", label: "Columns" },
              { icon: "export", label: "Export" },
            ].map((btn) => (
              <button key={btn.label} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", border: `1px solid ${T.borderMid}`, borderRadius: T.radius.sm, background: T.white, boxShadow: T.shadow, cursor: "pointer", fontFamily: T.font, fontSize: 14, fontWeight: 500, color: T.black }}>
                <span style={{ display: "flex", padding: "4px 0" }}>{icons[btn.icon]}</span>
                <span style={{ padding: "0 4px" }}>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters bar */}
        <div style={{ display: "flex", gap: 12, padding: 12, background: T.gray100, borderRadius: T.radius.md, alignItems: "flex-end" }}>
          <div style={{ flex: 1, display: "flex", gap: 12 }}>
            {[
              { label: "Order ID", type: "text" },
              { label: "Customer email", type: "text" },
              { label: "Channel", type: "select" },
              { label: "Payment type", type: "select" },
            ].map((f) => (
              <div key={f.label} style={{ flex: 1, maxWidth: 320, display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ fontFamily: T.font, fontSize: 14, fontWeight: 500, lineHeight: "20px", margin: 0 }}>{f.label}</p>
                <div style={{ height: 32, background: T.white, borderRadius: T.radius.sm, border: `1px solid ${T.gray300}`, boxShadow: T.shadow, display: "flex", alignItems: "center", padding: "0 8px" }}>
                  <input style={{ flex: 1, border: "none", outline: "none", fontFamily: T.font, fontSize: 14, fontWeight: 500, background: "transparent" }} />
                  {f.type === "select" && <span style={{ color: T.gray400, marginLeft: 4 }}>{icons.chevronDown}</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button style={{ padding: "4px 12px", background: T.black, color: T.white, border: "none", borderRadius: T.radius.sm, fontFamily: T.font, fontSize: 14, fontWeight: 500, lineHeight: "24px", cursor: "pointer", opacity: 0.32 }}>Apply</button>
            <button style={{ padding: "4px 12px", background: "transparent", color: T.black, border: "none", borderRadius: T.radius.sm, fontFamily: T.font, fontSize: 14, fontWeight: 500, lineHeight: "24px", cursor: "pointer", opacity: 0.32 }}>Clear All</button>
          </div>
        </div>

        {/* Table */}
        <div style={{ border: `1px solid ${T.gray200}`, borderRadius: 6, overflow: "hidden", flex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", borderBottom: `1px solid ${T.gray200}` }}>
            {COLUMNS.map((col) => (
              <div key={col.label} style={{ width: col.width, flexShrink: 0, padding: "8px 12px", borderBottom: `1px solid ${T.gray200}`, background: T.white, display: "flex", alignItems: "center" }}>
                <Skel w={col.width * 0.6} />
              </div>
            ))}
          </div>
          {/* Rows */}
          {ROWS.map((row, i) => (
            <div key={i} style={{ display: "flex", borderBottom: i < ROWS.length - 1 ? `1px solid ${T.white}` : "none" }}>
              {[
                { w: 160, sw: 129 },
                { w: 88, sw: 20 },
                { w: 112, sw: 70 },
                { w: 160, sw: 134 },
                { w: 120, badge: true },
                { w: 120, badge: true },
                { w: 192, sw: 135 },
                { w: 160, sw: 61 },
                { w: 160, sw: 106 },
              ].map((cell, j) => (
                <div key={j} style={{ width: cell.w, flexShrink: 0, padding: "8px 12px", display: "flex", alignItems: "center", height: 40 }}>
                  {cell.badge ? (
                    <div style={{ background: T.gray300, borderRadius: T.radius.sm, padding: "0 8px", display: "flex", alignItems: "center", height: 24 }}>
                      <Skel w={45} />
                    </div>
                  ) : (
                    <Skel w={cell.sw} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
