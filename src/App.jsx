import { createElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import avtrImg from "./assets/avtr.png";
import AccountSettingsGlyph from "./assets/icons/account-settings.svg?react";
import BankMidsGlyph from "./assets/icons/bank-mids.svg?react";
import BillingGlyph from "./assets/icons/billing.svg?react";
import ChevronDownGlyph from "./assets/icons/chevron-down.svg?react";
import ChevronVerticalGlyph from "./assets/icons/chevron-vertical.svg?react";
import DashboardGlyph from "./assets/icons/dashboard.svg?react";
import DevelopersGlyph from "./assets/icons/developers.svg?react";
import ExternalLinkGlyph from "./assets/icons/external-link.svg?react";
import FiltersGlyph from "./assets/icons/filters.svg?react";
import PlusGlyph from "./assets/icons/plus.svg?react";
import SettingsCustomizeGlyph from "./assets/icons/settings-customize.svg?react";
import SettingsViewGlyph from "./assets/icons/settings-view.svg?react";
import SortGlyph from "./assets/icons/sort.svg?react";
import FinancesGlyph from "./assets/icons/finances.svg?react";
import FraudPreventionGlyph from "./assets/icons/fraud-prevention.svg?react";
import PaymentsGlyph from "./assets/icons/payments.svg?react";
import ReportsExportsGlyph from "./assets/icons/reports-exports.svg?react";
import RouteGlyph from "./assets/icons/route.svg?react";
import SearchGlyph from "./assets/icons/search.svg?react";
import SidebarCollapseGlyph from "./assets/icons/sidebar-collapse.svg?react";
import TaxesGlyph from "./assets/icons/taxes.svg?react";
import ChevronLeftGlyph from "../svg icons/chevron-left.svg?react";

import {
  NAV_SECTIONS_V2,
  SKIP_RECENT_IDS,
  buildSearchIndex,
  findParentGroupId,
  getMetaForId,
} from "./navConfig.js";

/** Inline calendar icon for date filter fields (Figma: calendar on date inputs) */
function CalendarGlyph({ className }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 1.5v1M11 1.5v1M2.75 6.25h10.5M4 2.75h8a1.25 1.25 0 011.25 1.25v8a1.25 1.25 0 01-1.25 1.25H4A1.25 1.25 0 012.75 12V4A1.25 1.25 0 014 2.75z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Customize Filters: full filter catalogue (kind = main panel input) ─── */
const ALL_FILTERS = [
  { id: "order-id",        label: "Order ID",         description: "By order identifier",           kind: "text",   group: "Order" },
  { id: "email",           label: "Email",            description: "By customer email address",     kind: "text",   group: "Customer" },
  {
    id: "created",
    label: "Created",
    description: "By creation date range",
    kind: "dateRange",
    group: "Date",
    fromId: "created-from",
    toId: "created-to",
  },
  {
    id: "updated",
    label: "Updated",
    description: "By last update date range",
    kind: "dateRange",
    group: "Date",
    fromId: "updated-from",
    toId: "updated-to",
  },
  { id: "channel",         label: "Channel",          description: "Transaction channel",            kind: "select", group: "Transaction" },
  { id: "amount",          label: "Amount",           description: "Amount in USD, EUR, GBP or other", kind: "amount", group: "Transaction" },
  { id: "currency",        label: "Currency",         description: "USD, EUR, GBP and more",        kind: "select", group: "Transaction" },
  { id: "customer-id",     label: "Customer ID",      description: "By customer identifier",        kind: "text",   group: "Customer" },
  { id: "status",          label: "Status",           description: "Actual transaction status",      kind: "select", group: "Transaction" },
  { id: "refund",          label: "Refund",           description: "Refund status",                  kind: "select", group: "Transaction" },
  { id: "payment-type",    label: "Payment type",     description: "One-time or recurring",          kind: "select", group: "Payment" },
  { id: "payment-method",  label: "Payment method",   description: "Card, Apple Pay, Google Pay…",   kind: "select", group: "Payment" },
  { id: "auth-code",       label: "Auth code",        description: "Authorization code",             kind: "text",   group: "Payment" },
  { id: "decline-code",    label: "Decline code",     description: "Decline reason code",            kind: "text",   group: "Payment" },
  { id: "card-number",     label: "Card number",      description: "Masked card number",             kind: "text",   group: "Card" },
  { id: "card-id",         label: "Card ID",          description: "Internal card identifier",       kind: "text",   group: "Card" },
  { id: "card-brand",      label: "Card brand",       description: "Visa, Mastercard, Amex…",        kind: "select", group: "Card" },
  { id: "cardholder-name", label: "Cardholder name",  description: "First name, last name",          kind: "text",   group: "Card" },
  { id: "secured",         label: "Secured",          description: "3DS authentication status",      kind: "select", group: "Card" },
  { id: "solidgate-id",    label: "Solidgate ID",     description: "Internal Solidgate identifier",  kind: "text",   group: "System" },
  { id: "website",         label: "Website",          description: "Merchant website domain",        kind: "text",   group: "System" },
  { id: "ip-address",      label: "IP address",       description: "Customer IP address",            kind: "text",   group: "Customer" },
  { id: "ip-country",      label: "IP country",       description: "Country by IP geolocation",      kind: "select", group: "Customer" },
  { id: "descriptor",      label: "Descriptor",       description: "Statement descriptor text",      kind: "select", group: "Transaction" },
  { id: "traffic-source",  label: "Traffic source",   description: "Referral traffic source",        kind: "select", group: "System" },
  { id: "issuing-bank",    label: "Issuing bank",     description: "Card issuing bank name",         kind: "text",   group: "Card" },
  { id: "product-id",      label: "Product ID",       description: "Product identifier",             kind: "text",   group: "System" },
  { id: "product-type",    label: "Product type",     description: "Type of product",                kind: "select", group: "System" },
  { id: "arn-code",        label: "ARN code",         description: "Acquirer reference number",      kind: "text",   group: "Payment" },
];

const FILTER_GROUP_ORDER = ["Order", "Date", "Transaction", "Payment", "Card", "Customer", "System"];

/** Always on the panel / in “Added”; no toggle — drag only to reorder. */
const LOCKED_FILTER_IDS = new Set(["order-id", "email"]);

const DEFAULT_ADDED_IDS = ["order-id", "email", "created", "updated"];

/** Map legacy per-endpoint ids to combined range filters (one slot each). */
function migrateLegacyFilterIds(ids) {
  const out = [];
  let haveCreated = false;
  let haveUpdated = false;
  for (const id of ids) {
    if (id === "created-from" || id === "created-to") {
      if (!haveCreated) {
        out.push("created");
        haveCreated = true;
      }
      continue;
    }
    if (id === "updated-from" || id === "updated-to") {
      if (!haveUpdated) {
        out.push("updated");
        haveUpdated = true;
      }
      continue;
    }
    out.push(id);
  }
  return out;
}

/** Dedupe, drop unknown ids, ensure locked filters exist (order preserved). */
function normalizeActiveFilterIds(orderedIds) {
  const migrated = migrateLegacyFilterIds(orderedIds);
  const known = new Set(ALL_FILTERS.map((f) => f.id));
  const seen = new Set();
  const out = [];
  for (const id of migrated) {
    if (!known.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  if (!seen.has("order-id")) {
    const emailIdx = out.indexOf("email");
    if (emailIdx === -1) out.unshift("order-id");
    else out.splice(emailIdx, 0, "order-id");
    seen.add("order-id");
  }
  if (!seen.has("email")) {
    const orderIdx = out.indexOf("order-id");
    out.splice(orderIdx + 1, 0, "email");
    seen.add("email");
  }
  return out;
}

function emptyFilterValues() {
  const o = {};
  for (const f of ALL_FILTERS) {
    if (f.kind === "dateRange") {
      o[f.fromId] = "";
      o[f.toId] = "";
    } else {
      o[f.id] = "";
    }
  }
  return o;
}

/** Run on Apply: only non-empty drafts are validated. */
function validateFilterPanel(activeIds, draft, toolbarDraft) {
  const fieldErrors = {};
  for (const id of activeIds) {
    const v = (draft[id] ?? "").trim();
    if (!v) continue;
    if (id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      fieldErrors[id] = "Enter a valid email address";
    } else if ((id === "order-id" || id === "customer-id") && v.length < 2) {
      fieldErrors[id] = "Use at least 2 characters";
    } else if (id === "amount" && /[^\d.,\s]/.test(v)) {
      fieldErrors[id] = "Use numbers only";
    }
  }
  const t = toolbarDraft.trim();
  const toolbarError = t.length === 1 ? "Use at least 2 characters" : null;
  return { fieldErrors, toolbarError };
}

const DEFAULT_PRESETS = [
  {
    id: "finances",
    label: "Finances",
    filters: ["order-id", "amount", "currency", "status", "created", "updated"],
  },
  {
    id: "data-analytics",
    label: "Data analytics",
    filters: ["order-id", "channel", "status", "amount", "currency", "created"],
  },
  {
    id: "customer-support",
    label: "Customer support",
    filters: ["order-id", "email", "customer-id", "status", "cardholder-name"],
  },
  {
    id: "management",
    label: "Management",
    filters: ["order-id", "amount", "currency", "status", "channel"],
  },
];

const DATE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "last-7-days", label: "Last 7 days" },
  { id: "last-30-days", label: "Last 30 days" },
  { id: "all-time", label: "All time" },
];

const DATE_MODES = ["Single", "Range", "After", "Before"];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function sameDay(a, b) {
  return Boolean(
    a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
  );
}

function formatDateValue(date) {
  if (!date) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd} / ${mm} / ${date.getFullYear()}`;
}

function normalizeToHms(raw) {
  if (raw == null || raw === "") return "00:00:00";
  const parts = String(raw).trim().split(":");
  const h = Math.min(23, Math.max(0, parseInt(parts[0] || "0", 10) || 0));
  const m = Math.min(59, Math.max(0, parseInt(parts[1] || "0", 10) || 0));
  const s = Math.min(59, Math.max(0, parseInt(parts[2] || "0", 10) || 0));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Optional trailing time HH:mm:ss (24h). */
function parseDateTimeValue(value) {
  const s = String(value ?? "").trim();
  const match = s.match(
    /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (!match) return { date: null, timeHms: null };
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return { date: null, timeHms: null };
  }
  const timeHms =
    match[4] !== undefined
      ? normalizeToHms(
          `${match[4]}:${match[5]}:${match[6] !== undefined ? match[6] : "00"}`
        )
      : null;
  return { date, timeHms };
}

function parseDateValue(value) {
  return parseDateTimeValue(value).date;
}

function formatDateTimeForFilter(date, timeHms) {
  if (!date) return "";
  const d = formatDateValue(date);
  const t = normalizeToHms(timeHms);
  if (t === "00:00:00") return d;
  return `${d} ${t}`;
}

function cloneDate(d) {
  return d ? new Date(d.getTime()) : null;
}

function createEmptyTabDraft(fromDate, toDate, timeFrom, timeTo) {
  const base = fromDate || toDate || startOfDay(new Date());
  const vm = new Date(base.getFullYear(), base.getMonth(), 1);
  return {
    fromDate: cloneDate(fromDate),
    toDate: cloneDate(toDate),
    visibleMonth: vm,
    selectedPreset: null,
    timeFrom: normalizeToHms(timeFrom),
    timeTo: normalizeToHms(timeTo),
  };
}

/** DD / MM / YYYY — digits only; static / separators (Figma). */
function SegmentedDateInput({ valueDate, onCommitDate, className, ariaLabel }) {
  const dRef = useRef(null);
  const mRef = useRef(null);
  const yRef = useRef(null);
  const [dv, setDv] = useState(() => (valueDate ? String(valueDate.getDate()).padStart(2, "0") : ""));
  const [mv, setMv] = useState(() =>
    valueDate ? String(valueDate.getMonth() + 1).padStart(2, "0") : ""
  );
  const [yv, setYv] = useState(() => (valueDate ? String(valueDate.getFullYear()) : ""));

  const syncFromProp = useCallback((d) => {
    if (!d) {
      setDv("");
      setMv("");
      setYv("");
      return;
    }
    setDv(String(d.getDate()).padStart(2, "0"));
    setMv(String(d.getMonth() + 1).padStart(2, "0"));
    setYv(String(d.getFullYear()));
  }, []);

  useEffect(() => {
    syncFromProp(valueDate);
  }, [valueDate, syncFromProp]);

  const commitIfValid = useCallback(() => {
    if (!dv && !mv && !yv) {
      onCommitDate(null);
      return;
    }
    const y = parseInt(yv, 10);
    const m = parseInt(mv, 10);
    const d = parseInt(dv, 10);
    if (!yv || yv.length !== 4 || !Number.isFinite(y)) {
      syncFromProp(valueDate);
      return;
    }
    if (!mv || !Number.isFinite(m) || m < 1 || m > 12) {
      syncFromProp(valueDate);
      return;
    }
    if (!dv || !Number.isFinite(d) || d < 1 || d > 31) {
      syncFromProp(valueDate);
      return;
    }
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
      syncFromProp(valueDate);
      return;
    }
    onCommitDate(startOfDay(date));
    setDv(String(d).padStart(2, "0"));
    setMv(String(m).padStart(2, "0"));
    setYv(String(y));
  }, [dv, mv, yv, onCommitDate, valueDate, syncFromProp]);

  const onDigits = (raw, maxLen, setFn, nextRef) => {
    const v = raw.replace(/\D/g, "").slice(0, maxLen);
    setFn(v);
    if (v.length >= maxLen && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const focusFirstEmpty = useCallback(() => {
    if (!dv) dRef.current?.focus();
    else if (!mv) mRef.current?.focus();
    else if (!yv || yv.length < 4) yRef.current?.focus();
    else dRef.current?.focus();
  }, [dv, mv, yv]);

  return (
    <div
      className={className}
      onMouseDown={(e) => {
        if (e.target.tagName === "DIV") {
          e.preventDefault();
          focusFirstEmpty();
        }
      }}
    >
      <div className="df-seg-date" role="group" aria-label={ariaLabel}>
        <input
          ref={dRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="df-seg-date__inp df-seg-date__inp--dd"
          placeholder="DD"
          aria-label={`${ariaLabel} — day`}
          value={dv}
          onChange={(e) => onDigits(e.target.value, 2, setDv, mRef)}
          onBlur={commitIfValid}
        />
        <span className="df-seg-date__sep" aria-hidden>
          /
        </span>
        <input
          ref={mRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="df-seg-date__inp df-seg-date__inp--mm"
          placeholder="MM"
          aria-label={`${ariaLabel} — month`}
          value={mv}
          onChange={(e) => onDigits(e.target.value, 2, setMv, yRef)}
          onBlur={commitIfValid}
        />
        <span className="df-seg-date__sep" aria-hidden>
          /
        </span>
        <input
          ref={yRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="df-seg-date__inp df-seg-date__inp--yyyy"
          placeholder="YYYY"
          aria-label={`${ariaLabel} — year`}
          value={yv}
          onChange={(e) => onDigits(e.target.value, 4, setYv, null)}
          onBlur={commitIfValid}
        />
      </div>
    </div>
  );
}

/** HH : MM (and optional : SS) — digits only; static : separators (Figma). */
function SegmentedTimeInput({ valueHms, onCommit, ariaLabel, withSeconds = false }) {
  const hRef = useRef(null);
  const mRef = useRef(null);
  const sRef = useRef(null);
  const t = normalizeToHms(valueHms);
  const [hv, setHv] = useState(() => t.slice(0, 2));
  const [mv, setMv] = useState(() => t.slice(3, 5));
  const [sv, setSv] = useState(() => t.slice(6, 8));

  useEffect(() => {
    const n = normalizeToHms(valueHms);
    setHv(n.slice(0, 2));
    setMv(n.slice(3, 5));
    setSv(n.slice(6, 8));
  }, [valueHms]);

  const commit = useCallback(() => {
    const out = normalizeToHms(`${hv}:${mv}:${withSeconds ? sv : "00"}`);
    onCommit(out);
    setHv(out.slice(0, 2));
    setMv(out.slice(3, 5));
    setSv(out.slice(6, 8));
  }, [hv, mv, sv, onCommit, withSeconds]);

  const onDigits = (raw, maxLen, setFn, nextRef) => {
    const v = raw.replace(/\D/g, "").slice(0, maxLen);
    setFn(v);
    if (v.length >= maxLen && nextRef?.current) nextRef.current.focus();
  };

  const focusFirstEmpty = () => {
    if (!hv) hRef.current?.focus();
    else if (!mv) mRef.current?.focus();
    else if (withSeconds && !sv) sRef.current?.focus();
    else hRef.current?.focus();
  };

  return (
    <div
      className="df-seg-time"
      role="group"
      aria-label={ariaLabel}
      onMouseDown={(e) => {
        if (e.target.tagName === "DIV") {
          e.preventDefault();
          focusFirstEmpty();
        }
      }}
    >
      <input
        ref={hRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="df-seg-time__inp"
        placeholder="HH"
        aria-label={`${ariaLabel} — hours`}
        value={hv}
        onChange={(e) => onDigits(e.target.value, 2, setHv, mRef)}
        onBlur={commit}
      />
      <span className="df-seg-time__sep" aria-hidden>
        :
      </span>
      <input
        ref={mRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="df-seg-time__inp"
        placeholder="MM"
        aria-label={`${ariaLabel} — minutes`}
        value={mv}
        onChange={(e) => onDigits(e.target.value, 2, setMv, withSeconds ? sRef : null)}
        onBlur={commit}
      />
      {withSeconds ? (
        <>
          <span className="df-seg-time__sep" aria-hidden>
            :
          </span>
          <input
            ref={sRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="df-seg-time__inp"
            placeholder="SS"
            aria-label={`${ariaLabel} — seconds`}
            value={sv}
            onChange={(e) => onDigits(e.target.value, 2, setSv, null)}
            onBlur={commit}
          />
        </>
      ) : null}
    </div>
  );
}

function monthLabel(date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function buildMonthDays(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = addDays(first, -mondayOffset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function applyDatePreset(id) {
  const today = startOfDay(new Date());
  switch (id) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const d = addDays(today, -1);
      return { from: d, to: d };
    }
    case "tomorrow": {
      const d = addDays(today, 1);
      return { from: d, to: d };
    }
    case "last-7-days":
      return { from: addDays(today, -6), to: today };
    case "last-30-days":
      return { from: addDays(today, -29), to: today };
    case "all-time":
      return { from: null, to: null };
    default:
      return { from: null, to: null };
  }
}

function DateFilterPopover({ anchorEl, field, values, onApply, onClose }) {
  const popoverRef = useRef(null);
  const fromParsed = parseDateTimeValue(values[field.fromId]);
  const toParsed = parseDateTimeValue(values[field.toId]);
  const initialFrom = fromParsed.date;
  const initialTo = toParsed.date;
  const initialTimeFrom = normalizeToHms(fromParsed.timeHms);
  const initialTimeTo = normalizeToHms(toParsed.timeHms);

  const [mode, setMode] = useState("Range");
  const [draftsByMode, setDraftsByMode] = useState(() => ({
    Single: createEmptyTabDraft(initialFrom, initialTo, initialTimeFrom, initialTimeTo),
    Range: createEmptyTabDraft(initialFrom, initialTo, initialTimeFrom, initialTimeTo),
    After: createEmptyTabDraft(initialFrom, null, initialTimeFrom, "00:00"),
    Before: createEmptyTabDraft(null, initialTo, "00:00", initialTimeTo),
  }));
  const [positioned, setPositioned] = useState(false);

  const draft = draftsByMode[mode];
  const { fromDate, toDate, visibleMonth, selectedPreset, timeFrom, timeTo } = draft;

  const updateDraft = useCallback((patch) => {
    setDraftsByMode((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], ...patch },
    }));
  }, [mode]);

  useLayoutEffect(() => {
    const pop = popoverRef.current;
    if (!pop || !anchorEl) return;

    const reposition = () => {
      const p = popoverRef.current;
      if (!p || !anchorEl) return;
      const ar = anchorEl.getBoundingClientRect();
      const pw = p.offsetWidth;
      const ph = p.offsetHeight;
      const margin = 8;

      let top = ar.bottom + margin;
      if (top + ph > window.innerHeight - margin) top = ar.top - ph - margin;
      if (top < margin) top = margin;

      let left = ar.right - pw;
      if (left + pw > window.innerWidth - margin) left = window.innerWidth - pw - margin;
      if (left < margin) left = margin;

      p.style.top = `${top}px`;
      p.style.left = `${left}px`;
      setPositioned(true);
    };

    const scheduleReposition = () => requestAnimationFrame(reposition);
    scheduleReposition();
    window.addEventListener("resize", scheduleReposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", scheduleReposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [anchorEl]);

  useEffect(() => {
    const handler = (e) => {
      if (anchorEl?.contains(e.target)) return;
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [anchorEl, onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handlePreset = useCallback(
    (presetId) => {
      setDraftsByMode((prev) => {
        const cur = prev[mode];
        const next = applyDatePreset(presetId);
        let nf = next.from;
        let nt = next.to;
        if (mode === "Single") {
          const anchor = nt ?? nf;
          nf = anchor;
          nt = anchor;
        }
        const base = nf || nt || startOfDay(new Date());
        const vm = new Date(base.getFullYear(), base.getMonth(), 1);
        return {
          ...prev,
          [mode]: {
            ...cur,
            fromDate: nf,
            toDate: nt,
            visibleMonth: vm,
            selectedPreset: presetId,
          },
        };
      });
    },
    [mode]
  );

  const handleDayClick = useCallback(
    (day) => {
      const d = startOfDay(day);
      setDraftsByMode((prev) => {
        const cur = prev[mode];
        let nextFrom = cur.fromDate;
        let nextTo = cur.toDate;
        if (mode === "Single") {
          nextFrom = d;
          nextTo = d;
        } else if (mode === "After") {
          nextFrom = d;
          nextTo = null;
        } else if (mode === "Before") {
          nextFrom = null;
          nextTo = d;
        } else {
          if (!cur.fromDate || (cur.fromDate && cur.toDate)) {
            nextFrom = d;
            nextTo = null;
          } else if (d < cur.fromDate) {
            nextTo = cur.fromDate;
            nextFrom = d;
          } else {
            nextTo = d;
          }
        }
        return {
          ...prev,
          [mode]: { ...cur, fromDate: nextFrom, toDate: nextTo, selectedPreset: null },
        };
      });
    },
    [mode]
  );

  const renderMonth = (monthDate) => {
    const days = buildMonthDays(monthDate);
    return (
      <div className="df-month">
        <div className="df-month__header">
          <button
            type="button"
            className="df-month__nav"
            aria-label="Previous month"
            onClick={() =>
              setDraftsByMode((prev) => ({
                ...prev,
                [mode]: {
                  ...prev[mode],
                  visibleMonth: addMonths(prev[mode].visibleMonth, -1),
                },
              }))
            }
          >
            <SideIcon icon={ChevronLeftGlyph} />
          </button>
          <span className="df-month__title">{monthLabel(monthDate)}</span>
          <button
            type="button"
            className="df-month__nav df-month__nav--next"
            aria-label="Next month"
            onClick={() =>
              setDraftsByMode((prev) => ({
                ...prev,
                [mode]: {
                  ...prev[mode],
                  visibleMonth: addMonths(prev[mode].visibleMonth, 1),
                },
              }))
            }
          >
            <SideIcon icon={ChevronLeftGlyph} />
          </button>
        </div>
        <div className="df-days">
          {days.map((day) => {
            const outside = day.getMonth() !== monthDate.getMonth();
            const selected = sameDay(day, fromDate) || sameDay(day, toDate);
            const inRange =
              mode !== "Single" && fromDate && toDate && day > fromDate && day < toDate;
            return (
              <button
                key={day.toISOString()}
                type="button"
                className={[
                  "df-day",
                  outside ? "df-day--outside" : "",
                  selected ? "df-day--selected" : "",
                  inRange ? "df-day--range" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleDayClick(startOfDay(day))}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={popoverRef}
      className={`df-popover${positioned ? " df-popover--visible" : ""}`}
      role="dialog"
      aria-label={`${field.label} date filter`}
    >
      <div className="df-popover__main">
        <aside className="df-presets">
          <div className="df-preset-heading">Presets</div>
          <div className="df-preset-list">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`df-preset-item${selectedPreset === preset.id ? " is-selected" : ""}`}
                onClick={() => handlePreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="df-calendar">
          <div className="df-calendar__body">
            <div className="df-mode">
              <div className="df-mode__label">Date</div>
              <div className="df-mode__group" role="tablist" aria-label="Date mode">
                {DATE_MODES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`df-mode__btn${mode === item ? " is-selected" : ""}`}
                    onClick={() => setMode(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="df-calendar__stack">
              <div className="df-months">
                {renderMonth(visibleMonth)}
                {renderMonth(addMonths(visibleMonth, 1))}
              </div>

            {mode === "Single" ? (
              <div className="df-date-fields df-date-fields--single">
                <div className="df-date-field">
                  <span className="df-date-field__label">On day</span>
                  <SegmentedDateInput
                    className="df-date-field__value"
                    valueDate={fromDate || toDate}
                    onCommitDate={(d) =>
                      d ? updateDraft({ fromDate: d, toDate: d }) : updateDraft({ fromDate: null, toDate: null })
                    }
                    ariaLabel={`${field.label} — on day`}
                  />
                </div>
                <div className="df-date-field">
                  <span className="df-date-field__label">From</span>
                  <div className="df-time-field df-time-field--fill">
                    <SegmentedTimeInput
                      valueHms={timeFrom}
                      onCommit={(t) => updateDraft({ timeFrom: t })}
                      ariaLabel={`${field.label} — from time`}
                      withSeconds
                    />
                  </div>
                </div>
                <div className="df-date-field">
                  <span className="df-date-field__label">To</span>
                  <div className="df-time-field df-time-field--fill">
                    <SegmentedTimeInput
                      valueHms={timeTo}
                      onCommit={(t) => updateDraft({ timeTo: t })}
                      ariaLabel={`${field.label} — to time`}
                      withSeconds
                    />
                  </div>
                </div>
              </div>
            ) : mode === "Range" ? (
              <div className="df-date-fields df-date-fields--range">
                <div className="df-date-field-group">
                  <span className="df-date-field__label">From</span>
                  <div className="df-date-field__inline">
                    <SegmentedDateInput
                      className="df-date-field__value df-date-field__value--flex"
                      valueDate={fromDate}
                      onCommitDate={(d) => updateDraft({ fromDate: d })}
                      ariaLabel={`${field.label} — from date`}
                    />
                    <div className="df-time-field">
                      <SegmentedTimeInput
                        valueHms={timeFrom}
                        onCommit={(t) => updateDraft({ timeFrom: t })}
                        ariaLabel={`${field.label} — from time`}
                      />
                    </div>
                  </div>
                </div>
                <div className="df-date-field-group">
                  <span className="df-date-field__label">To</span>
                  <div className="df-date-field__inline">
                    <SegmentedDateInput
                      className="df-date-field__value df-date-field__value--flex"
                      valueDate={toDate}
                      onCommitDate={(d) => updateDraft({ toDate: d })}
                      ariaLabel={`${field.label} — to date`}
                    />
                    <div className="df-time-field">
                      <SegmentedTimeInput
                        valueHms={timeTo}
                        onCommit={(t) => updateDraft({ timeTo: t })}
                        ariaLabel={`${field.label} — to time`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : mode === "After" ? (
              <div className="df-date-fields df-date-fields--after">
                <div className="df-date-field-group df-date-field-group--fixed">
                  <span className="df-date-field__label">After</span>
                  <div className="df-date-field__inline">
                    <SegmentedDateInput
                      className="df-date-field__value df-date-field__value--flex"
                      valueDate={fromDate}
                      onCommitDate={(d) => updateDraft({ fromDate: d })}
                      ariaLabel={`${field.label} — after date`}
                    />
                    <div className="df-time-field">
                      <SegmentedTimeInput
                        valueHms={timeFrom}
                        onCommit={(t) => updateDraft({ timeFrom: t })}
                        ariaLabel={`${field.label} — after time`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="df-date-fields df-date-fields--before">
                <div className="df-date-field-group df-date-field-group--fixed">
                  <span className="df-date-field__label">Before</span>
                  <div className="df-date-field__inline">
                    <SegmentedDateInput
                      className="df-date-field__value df-date-field__value--flex"
                      valueDate={toDate}
                      onCommitDate={(d) => updateDraft({ toDate: d })}
                      ariaLabel={`${field.label} — before date`}
                    />
                    <div className="df-time-field">
                      <SegmentedTimeInput
                        valueHms={timeTo}
                        onCommit={(t) => updateDraft({ timeTo: t })}
                        ariaLabel={`${field.label} — before time`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          <div className="df-footer">
            <button type="button" className="cf-footer__btn cf-footer__btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="cf-footer__btn cf-footer__btn--save"
              onClick={() => {
                const d = draftsByMode[mode];
                const pack = (date, t) => formatDateTimeForFilter(date, t);
                if (mode === "Single") {
                  const day = d.fromDate || d.toDate;
                  onApply(pack(day, d.timeFrom), pack(day, d.timeTo));
                } else if (mode === "After") {
                  onApply(pack(d.fromDate, d.timeFrom), "");
                } else if (mode === "Before") {
                  onApply("", pack(d.toDate, d.timeTo));
                } else {
                  onApply(pack(d.fromDate, d.timeFrom), pack(d.toDate, d.timeTo));
                }
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Drag handle icon (6-dot grip) ─── */
function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="6" cy="4" r="1" fill="currentColor" />
      <circle cx="10" cy="4" r="1" fill="currentColor" />
      <circle cx="6" cy="8" r="1" fill="currentColor" />
      <circle cx="10" cy="8" r="1" fill="currentColor" />
      <circle cx="6" cy="12" r="1" fill="currentColor" />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

/* HTML для плаваючого drag-layer (currentColor → чорний у .cf-filter-row-drag-layer__grip) */
const FILTER_DRAG_GRIP_SVG_HTML =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<circle cx="6" cy="4" r="1" fill="currentColor"/><circle cx="10" cy="4" r="1" fill="currentColor"/>' +
  '<circle cx="6" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="8" r="1" fill="currentColor"/>' +
  '<circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="10" cy="12" r="1" fill="currentColor"/></svg>';

/* ─── Toggle switch (animates, then waits before list move / onChange) ─── */
const TOGGLE_ANIM_MS = 220;
const TOGGLE_MOVE_DELAY_MS = 180;

function ToggleSwitch({ checked, onChange }) {
  const [animating, setAnimating] = useState(null); // "on" | "off" | null
  const [heldVisual, setHeldVisual] = useState(null); // target checked while waiting to commit
  const timerRef = useRef(null);
  const moveDelayRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (moveDelayRef.current) {
      clearTimeout(moveDelayRef.current);
      moveDelayRef.current = null;
    }
    setAnimating(null);
    setHeldVisual(null);
  }, [checked]);

  const handleClick = useCallback(() => {
    if (timerRef.current || moveDelayRef.current || heldVisual !== null) return;
    const direction = checked ? "off" : "on";
    const targetChecked = !checked;
    setAnimating(direction);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setAnimating(null);
      setHeldVisual(targetChecked);
      moveDelayRef.current = setTimeout(() => {
        moveDelayRef.current = null;
        onChange();
      }, TOGGLE_MOVE_DELAY_MS);
    }, TOGGLE_ANIM_MS);
  }, [checked, onChange, heldVisual]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (moveDelayRef.current) clearTimeout(moveDelayRef.current);
    },
    []
  );

  const baseChecked = heldVisual !== null ? heldVisual : checked;
  /* While animating, show the TARGET visual state; otherwise held or prop */
  const visual = animating ? animating === "on" : baseChecked;
  const animClass = animating === "on" ? " cf-toggle--anim-on" : animating === "off" ? " cf-toggle--anim-off" : "";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={visual}
      className={`cf-toggle${visual ? " cf-toggle--on" : ""}${animClass}`}
      onClick={handleClick}
    >
      <span className="cf-toggle__thumb" />
    </button>
  );
}

/* ─── Close (X) icon for preset deletion ─── */
function CloseSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M11.33 4.67L4.67 11.33M4.67 4.67l6.66 6.66" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Arrow-down icon for "Available" header ─── */
function ArrowDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8 3.33v9.34M8 12.67l-3.33-3.34M8 12.67l3.33-3.34" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Customize Filters Popover ─── */
function CustomizeFiltersPopover({
  anchorRef,
  filtersPanelRef,
  onClose,
  personalPresets,
  onPersonalPresetsChange,
  activeFilterIds,
  onActiveFilterIdsChange,
}) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetNameError, setPresetNameError] = useState(null);
  const [availableSort, setAvailableSort] = useState("asc"); // "asc" | "desc"
  const [previewIds, setPreviewIds] = useState(null); // live drag preview order
  const [draggingId, setDraggingId] = useState(null); // for CSS class during render
  const dragItemId = useRef(null);
  const dragLayerRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragMoveCleanupRef = useRef(null);
  const popoverRef = useRef(null);
  const presetInputRef = useRef(null);
  const [positioned, setPositioned] = useState(false);

  const tearDownFilterDragUi = useCallback(() => {
    document.documentElement.classList.remove("cf-filter-dnd-active");
    document.documentElement.style.removeProperty("cursor");
    document.body.style.removeProperty("cursor");
    dragMoveCleanupRef.current?.();
    dragMoveCleanupRef.current = null;
    const layer = dragLayerRef.current;
    if (layer?.parentNode) layer.parentNode.removeChild(layer);
    dragLayerRef.current = null;
  }, []);

  /* Anchor to Customize; re-run when panel height / filter list / scroll changes */
  useLayoutEffect(() => {
    const pop = popoverRef.current;
    if (!pop) return;

    const reposition = () => {
      const anchor = anchorRef?.current;
      const p = popoverRef.current;
      if (!anchor || !p) return;
      const ar = anchor.getBoundingClientRect();
      const pw = p.offsetWidth;
      const ph = p.offsetHeight;
      const margin = 8;

      /* Prefer above the Customize button; flip below if not enough room above.
         Do not clamp top to the viewport — that detaches the popper from the anchor
         when the filter panel grows (e.g. Select all). */
      let top = ar.top - ph - margin;
      if (top < margin) top = ar.bottom + margin;

      let left = ar.left;
      if (left + pw > window.innerWidth - margin) left = window.innerWidth - pw - margin;
      if (left < margin) left = margin;

      p.style.top = `${top}px`;
      p.style.left = `${left}px`;
      setPositioned(true);
    };

    const scheduleReposition = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(reposition);
      });
    };

    scheduleReposition();

    const panel = filtersPanelRef?.current;
    const roPanel =
      typeof ResizeObserver !== "undefined" && panel
        ? new ResizeObserver(() => {
            scheduleReposition();
          })
        : null;
    if (panel && roPanel) roPanel.observe(panel);

    const roPop =
      typeof ResizeObserver !== "undefined" && pop
        ? new ResizeObserver(() => {
            scheduleReposition();
          })
        : null;
    if (roPop) roPop.observe(pop);

    window.addEventListener("resize", scheduleReposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      roPanel?.disconnect();
      roPop?.disconnect();
      window.removeEventListener("resize", scheduleReposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [anchorRef, filtersPanelRef, activeFilterIds]);

  /* Click outside → close (ignore clicks on the anchor button — it handles its own toggle) */
  useEffect(() => {
    const handler = (e) => {
      if (anchorRef?.current?.contains(e.target)) return;
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  /* Escape key → close */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(
    () => () => {
      tearDownFilterDragUi();
    },
    [tearDownFilterDragUi]
  );

  /* Select a preset → load its filters (panel + popover share state) */
  const handleSelectPreset = useCallback(
    (preset) => {
      setSelectedPreset(preset.id);
      onActiveFilterIdsChange([...preset.filters]);
    },
    [onActiveFilterIdsChange]
  );

  /* Toggle a filter on/off (locked filters: drag only, no toggle) */
  const toggleFilter = useCallback(
    (filterId) => {
      if (LOCKED_FILTER_IDS.has(filterId)) return;
      onActiveFilterIdsChange((prev) =>
        prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]
      );
      setSelectedPreset(null);
    },
    [onActiveFilterIdsChange]
  );

  /* Clear optional filters — Order ID + Customer email stay */
  const clearAll = useCallback(() => {
    onActiveFilterIdsChange(["order-id", "email"]);
    setSelectedPreset(null);
  }, [onActiveFilterIdsChange]);

  /* Select all available */
  const selectAll = useCallback(() => {
    onActiveFilterIdsChange(ALL_FILTERS.map((f) => f.id));
    setSelectedPreset(null);
  }, [onActiveFilterIdsChange]);

  /* Delete personal preset */
  const deletePersonalPreset = useCallback((presetId) => {
    onPersonalPresetsChange((prev) => prev.filter((p) => p.id !== presetId));
    setSelectedPreset((cur) => (cur === presetId ? null : cur));
  }, [onPersonalPresetsChange]);

  /* Save as preset */
  const handleSavePreset = useCallback(() => {
    if (!savingPreset) {
      setPresetNameError(null);
      setSavingPreset(true);
      setTimeout(() => presetInputRef.current?.focus(), 0);
      return;
    }
    const name = presetName.trim();
    if (!name) {
      setPresetNameError("Enter a preset name");
      return;
    }
    setPresetNameError(null);
    const newPreset = {
      id: `personal-${Date.now()}`,
      label: name,
      filters: [...activeFilterIds],
    };
    onPersonalPresetsChange((prev) => [...prev, newPreset]);
    setSelectedPreset(newPreset.id);
    setSavingPreset(false);
    setPresetName("");
  }, [savingPreset, presetName, activeFilterIds, onPersonalPresetsChange]);

  const handlePresetKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSavePreset();
      if (e.key === "Escape") {
        setSavingPreset(false);
        setPresetName("");
        setPresetNameError(null);
      }
    },
    [handleSavePreset]
  );

  /* Cancel */
  const handleCancel = useCallback(() => {
    if (savingPreset) {
      setSavingPreset(false);
      setPresetName("");
      setPresetNameError(null);
      return;
    }
    onClose();
  }, [savingPreset, onClose]);

  /* ── Drag and drop for Added filters ── */
  const computePreview = useCallback((base, srcId, targetId) => {
    if (!srcId || srcId === targetId) return base;
    const next = [...base];
    const srcIdx = next.indexOf(srcId);
    const tgtIdx = next.indexOf(targetId);
    if (srcIdx === -1 || tgtIdx === -1) return base;
    next.splice(srcIdx, 1);
    next.splice(tgtIdx, 0, srcId);
    return next;
  }, []);

  const handleDragStart = useCallback(
    (e, filterId) => {
      document.documentElement.classList.add("cf-filter-dnd-active");
      document.documentElement.style.setProperty("cursor", "grabbing", "important");
      document.body.style.setProperty("cursor", "grabbing", "important");
      dragItemId.current = filterId;
      e.dataTransfer.effectAllowed = "move";

      const row = e.currentTarget;
      const rect = row.getBoundingClientRect();
      const label = row.querySelector(".cf-filter-row__label")?.textContent?.trim() ?? "";
      const desc = row.querySelector(".cf-filter-row__desc")?.textContent?.trim() ?? "";

      const layer = document.createElement("div");
      layer.className = "cf-filter-row-drag-layer";
      layer.setAttribute("role", "presentation");
      layer.innerHTML = [
        '<div class="cf-filter-row-drag-layer__inner">',
        `<div class="cf-filter-row-drag-layer__grip" aria-hidden="true">${FILTER_DRAG_GRIP_SVG_HTML}</div>`,
        '<div class="cf-filter-row-drag-layer__text">',
        '<span class="cf-filter-row-drag-layer__label"></span>',
        '<span class="cf-filter-row-drag-layer__desc"></span>',
        "</div></div>",
      ].join("");
      layer.querySelector(".cf-filter-row-drag-layer__label").textContent = label;
      layer.querySelector(".cf-filter-row-drag-layer__desc").textContent = desc;

      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      dragOffsetRef.current = { x: ox, y: oy };
      Object.assign(layer.style, {
        position: "fixed",
        left: `${e.clientX - ox}px`,
        top: `${e.clientY - oy}px`,
        width: `${rect.width}px`,
        zIndex: "10050",
        pointerEvents: "none",
        boxSizing: "border-box",
      });
      document.body.appendChild(layer);
      dragLayerRef.current = layer;

      const hide = new Image();
      hide.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      try {
        e.dataTransfer.setDragImage(hide, 0, 0);
      } catch {
        /* ignore */
      }

      const onDrag = (ev) => {
        const el = dragLayerRef.current;
        if (!el) return;
        if (ev.clientX === 0 && ev.clientY === 0) return;
        el.style.left = `${ev.clientX - dragOffsetRef.current.x}px`;
        el.style.top = `${ev.clientY - dragOffsetRef.current.y}px`;
      };
      row.addEventListener("drag", onDrag);
      dragMoveCleanupRef.current = () => row.removeEventListener("drag", onDrag);

      setDraggingId(filterId);
      setPreviewIds((prev) => prev ?? [...activeFilterIds]);
    },
    [activeFilterIds]
  );

  const handleDragEnd = useCallback(() => {
    tearDownFilterDragUi();
    onActiveFilterIdsChange((prev) => previewIds ?? prev);
    dragItemId.current = null;
    setDraggingId(null);
    setPreviewIds(null);
  }, [previewIds, onActiveFilterIdsChange, tearDownFilterDragUi]);

  const handleDragOver = useCallback(
    (e, filterId) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const srcId = dragItemId.current;
      if (!srcId || srcId === filterId) return;
      setPreviewIds((prev) => computePreview(prev ?? activeFilterIds, srcId, filterId));
    },
    [activeFilterIds, computePreview]
  );

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    const srcId = dragItemId.current;
    if (srcId && srcId !== targetId) setSelectedPreset(null);
    // actual commit happens in handleDragEnd
  }, []);

  /* ── Sort toggle for Available ── */
  const toggleSort = useCallback(() => {
    setAvailableSort((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  /* Search: filter by name AND description */
  const q = searchQuery.trim().toLowerCase();

  /* During drag show preview order; otherwise committed order */
  const displayIds = previewIds ?? activeFilterIds;

  /* Added filters preserve displayIds order */
  const addedFilters = displayIds
    .map((id) => ALL_FILTERS.find((f) => f.id === id))
    .filter(Boolean);
  const availableFilters = ALL_FILTERS.filter((f) => !activeFilterIds.includes(f.id));

  const filteredAdded = q
    ? addedFilters.filter(
        (f) =>
          f.label.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      )
    : addedFilters;

  const filteredAvailableUnsorted = q
    ? availableFilters.filter(
        (f) =>
          f.label.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      )
    : availableFilters;

  const filteredAvailable = [...filteredAvailableUnsorted].sort((a, b) => {
    const cmp = a.label.localeCompare(b.label);
    return availableSort === "asc" ? cmp : -cmp;
  });

  const groupedAvailable = (() => {
    const groups = [];
    const byGroup = new Map();
    for (const f of filteredAvailable) {
      const g = f.group || "Other";
      if (!byGroup.has(g)) {
        const entry = { group: g, items: [] };
        byGroup.set(g, entry);
        groups.push(entry);
      }
      byGroup.get(g).items.push(f);
    }
    groups.sort((a, b) => {
      const ai = FILTER_GROUP_ORDER.indexOf(a.group);
      const bi = FILTER_GROUP_ORDER.indexOf(b.group);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    return groups;
  })();

  return (
    <div className={`cf-popover${positioned ? " cf-popover--visible" : ""}`} ref={popoverRef}>
      <div className="cf-popover__main">
        {/* ── Left: Presets + divider (full modal height) ── */}
        <div className="cf-presets">
          <div className="cf-presets-inner">
            {/* Default presets */}
            <div className="cf-preset-group">
              <div className="cf-preset-heading">
                <span className="cf-preset-heading__text cf-preset-heading__text--default">Presets</span>
              </div>
              <div className="cf-preset-list">
                {DEFAULT_PRESETS.map((p) => (
                  <div
                    key={p.id}
                    className={`cf-preset-item${selectedPreset === p.id ? " cf-preset-item--active" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectPreset(p)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectPreset(p);
                      }
                    }}
                  >
                    <span className="cf-preset-item__label">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal presets */}
            {personalPresets.length > 0 && (
              <div className="cf-preset-group">
                <div className="cf-preset-heading">
                  <span className="cf-preset-heading__text">Personal</span>
                </div>
                <div className="cf-preset-list">
                  {personalPresets.map((p) => (
                    <div
                      key={p.id}
                      className={`cf-preset-item cf-preset-item--personal${selectedPreset === p.id ? " cf-preset-item--active" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectPreset(p)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectPreset(p);
                        }
                      }}
                    >
                      <span className="cf-preset-item__label">{p.label}</span>
                      <button
                        type="button"
                        className="cf-preset-item__delete"
                        aria-label={`Delete ${p.label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePersonalPreset(p.id);
                        }}
                      >
                        <CloseSmallIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Filters column (header + list) + footer ── */}
        <div className="cf-filters-wrap">
          <div className="cf-filters">
            <div className="cf-filters-stack">
              {/* Sticky header with gradient fade */}
              <div className="cf-filters-header">
                <div className="cf-filters-header__content">
                  <div className="cf-filters-heading">
                    <span className="cf-filters-heading__text">Filters</span>
                  </div>
                  <div
                    className={[
                      "unit-textfield",
                      "unit-textfield--sm",
                      "filters-search-unit",
                      "cf-filters-search",
                    ].join(" ")}
                  >
                    <div className="unit-textfield__outline">
                      <div className="unit-textfield__field">
                        <SideIcon icon={SearchGlyph} />
                        <input
                          type="search"
                          placeholder="Search filter"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoComplete="off"
                          spellCheck={false}
                          aria-label="Search filter"
                        />
                        {searchQuery ? (
                          <button
                            type="button"
                            className="filters-search-clear"
                            aria-label="Clear search filter"
                            onClick={() => setSearchQuery("")}
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cf-filters-scroll">
                {/* Added section */}
                {filteredAdded.length > 0 && (
                  <div className="cf-filter-section">
                    <div className="cf-filter-section__header-rail">
                      <div className="cf-filter-section__header">
                        <span className="cf-filter-section__title">Added</span>
                        <button
                          type="button"
                          className="cf-filter-section__action"
                          onClick={clearAll}
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                    <div className="cf-filter-list">
                      {filteredAdded.map((f) => (
                        <div
                          key={f.id}
                          className={`cf-filter-row${draggingId === f.id ? " cf-filter-row--dragging" : ""}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, f.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, f.id)}
                          onDrop={(e) => handleDrop(e, f.id)}
                        >
                          <div
                            className="cf-filter-row__drag"
                            onMouseDown={(ev) => {
                              if (ev.button !== 0) return;
                              document.documentElement.classList.add("cf-filter-dnd-active");
                              document.documentElement.style.setProperty("cursor", "grabbing", "important");
                              document.body.style.setProperty("cursor", "grabbing", "important");
                              const onUp = () => {
                                window.removeEventListener("mouseup", onUp);
                                queueMicrotask(() => {
                                  if (dragItemId.current == null) {
                                    document.documentElement.classList.remove("cf-filter-dnd-active");
                                    document.documentElement.style.removeProperty("cursor");
                                    document.body.style.removeProperty("cursor");
                                  }
                                });
                              };
                              window.addEventListener("mouseup", onUp, { once: true });
                            }}
                          >
                            <DragHandleIcon />
                          </div>
                          <div className="cf-filter-row__info">
                            <span className="cf-filter-row__label">{f.label}</span>
                            <span className="cf-filter-row__desc">{f.description}</span>
                          </div>
                          {LOCKED_FILTER_IDS.has(f.id) ? (
                            <div className="cf-filter-row__toggle-slot" aria-hidden />
                          ) : (
                            <ToggleSwitch checked={true} onChange={() => toggleFilter(f.id)} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available section */}
                {filteredAvailable.length > 0 && (
                  <div className="cf-filter-section cf-filter-section--available">
                    <div className="cf-filter-section__header-rail">
                      <div className="cf-filter-section__header">
                        <div className="cf-filter-section__title-with-icon">
                          <span className="cf-filter-section__title">Available</span>
                          <button
                            type="button"
                            className={`cf-filter-section__sort-btn${availableSort === "desc" ? " cf-filter-section__sort-btn--desc" : ""}`}
                            onClick={toggleSort}
                            aria-label={availableSort === "asc" ? "Sort Z to A" : "Sort A to Z"}
                          >
                            <ArrowDownIcon />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cf-filter-section__action"
                          onClick={selectAll}
                        >
                          Select all
                        </button>
                      </div>
                    </div>
                    <div className="cf-filter-list cf-filter-list--by-group">
                      {groupedAvailable.map((g) => (
                        <div key={g.group} className="cf-filter-group">
                          <div className="cf-filter-group__name">
                            <div className="cf-filter-group__name-pad">
                              <span className="cf-filter-group__name-text">{g.group}</span>
                            </div>
                          </div>
                          {g.items.map((f) => (
                            <div key={f.id} className="cf-filter-row cf-filter-row--available">
                              <div className="cf-filter-row__drag cf-filter-row__drag--empty" />
                              <div className="cf-filter-row__info">
                                <span className="cf-filter-row__label">{f.label}</span>
                                <span className="cf-filter-row__desc">{f.description}</span>
                              </div>
                              <ToggleSwitch
                                checked={false}
                                onChange={() => toggleFilter(f.id)}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {filteredAdded.length === 0 && filteredAvailable.length === 0 && q && (
                  <div className="cf-no-results">No filters found</div>
                )}
              </div>
            </div>
          </div>

          <div className="cf-footer">
            {savingPreset ? (
              <div className="cf-footer__save-row">
                <div
                  className={[
                    "unit-textfield",
                    "unit-textfield--sm",
                    "filters-search-unit",
                    "cf-footer__preset-field",
                    presetNameError ? "unit-textfield--error" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="unit-textfield__outline">
                    <div className="unit-textfield__field">
                      <input
                        ref={presetInputRef}
                        type="text"
                        placeholder="Preset name"
                        value={presetName}
                        onChange={(e) => {
                          setPresetNameError(null);
                          setPresetName(e.target.value);
                        }}
                        onKeyDown={handlePresetKeyDown}
                        aria-label="Preset name"
                        aria-invalid={presetNameError ? true : undefined}
                      />
                    </div>
                  </div>
                  {presetNameError ? (
                    <div className="unit-textfield__helper-wrapper">
                      <span className="unit-textfield__helper" role="alert">
                        {presetNameError}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div
                  className="cf-footer__save-actions"
                  role="group"
                  aria-label="Save preset"
                >
                  <button type="button" className="cf-footer__btn cf-footer__btn--secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="button" className="cf-footer__btn cf-footer__btn--save" onClick={handleSavePreset}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="cf-footer__actions">
                <button type="button" className="cf-footer__btn cf-footer__btn--save" onClick={handleSavePreset}>
                  Save as preset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton table row widths (Figma node 374:10465).
 * Each sub-array holds percentage widths for 5 columns.
 */
const SK_TABLE_ROWS = [
  [53, 67, 56, 46, 32],
  [77, 43, 70, 56, 28],
  [63, 76, 46, 65, 44],
  [53, 67, 56, 46, 32],
  [77, 43, 70, 56, 28],
  [67, 52, 60, 42, 32],
  [53, 67, 56, 46, 32],
  [48, 62, 74, 51, 36],
  [63, 76, 46, 65, 44],
  [48, 62, 74, 51, 36],
  [72, 38, 56, 65, 40],
  [67, 52, 60, 42, 32],
  [63, 76, 46, 65, 44],
  [63, 76, 46, 65, 44],
];

const SIDEBAR_SESSION_KEY = "merchant-hub-sidebar-collapsed";
const RECENT_MAX = 7;

function loadRecent() {
  try {
    const raw = localStorage.getItem("merchant-hub-recent-v2");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => x?.id && x?.label) : [];
  } catch {
    return [];
  }
}

function readSidebarCollapsed() {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SIDEBAR_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

const ICON_GLYPH = {
  dashboard: DashboardGlyph,
  payments: PaymentsGlyph,
  orchestration: RouteGlyph,
  bankMids: BankMidsGlyph,
  billing: BillingGlyph,
  fraudPrevention: FraudPreventionGlyph,
  finances: FinancesGlyph,
  developers: DevelopersGlyph,
  reportsExports: ReportsExportsGlyph,
  taxes: TaxesGlyph,
  accountSettings: AccountSettingsGlyph,
};

/** SVG icons from ./assets/icons (vite-plugin-svgr); color via CSS currentColor */
function SideIcon({ icon, className = "", size = 16 }) {
  return createElement(icon, {
    className: ["icon", className].filter(Boolean).join(" "),
    width: size,
    height: size,
    "aria-hidden": true,
  });
}

function renderFilterInput(field, ctx) {
  const { value, onChange, disabled, invalid } = ctx;
  const common = {
    value: value ?? "",
    disabled: Boolean(disabled),
    "aria-invalid": invalid ? true : undefined,
  };
  switch (field.kind) {
    case "date":
      return (
        <>
          <CalendarGlyph className="icon" />
          <input
            type="text"
            readOnly
            placeholder="DD / MM / YYYY"
            aria-label={field.label}
            {...common}
          />
        </>
      );
    case "select":
      return (
        <>
          <input type="text" readOnly placeholder="" aria-label={field.label} {...common} />
          <SideIcon icon={ChevronDownGlyph} />
        </>
      );
    case "amount":
      return (
        <>
          <div className="unit-textfield__split unit-textfield__split--compare">
            <span className="unit-textfield__split-label">Compare</span>
            <SideIcon icon={ChevronDownGlyph} />
          </div>
          <div className="unit-textfield__split unit-textfield__split--main">
            <input
              type="text"
              placeholder="Amount"
              aria-label="Amount"
              onChange={onChange}
              {...common}
            />
          </div>
        </>
      );
    default:
      return (
        <input
          type="text"
          placeholder=""
          aria-label={field.label}
          onChange={onChange}
          {...common}
        />
      );
  }
}

/* Skeleton constants removed — replaced with live orders table */

function highlightMatch(text, q) {
  if (!q.trim()) return text;
  const i = text.toLowerCase().indexOf(q.trim().toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <strong>{text.slice(i, i + q.trim().length)}</strong>
      {text.slice(i + q.trim().length)}
    </>
  );
}

function readInitialActiveId() {
  return "dashboard";
}

export default function App() {
  const navSections = NAV_SECTIONS_V2;
  const searchIndex = useMemo(() => buildSearchIndex(navSections), [navSections]);
  const [activeId, setActiveId] = useState(readInitialActiveId);
  const [expanded, setExpanded] = useState(() => new Set());
  const [query, setQuery] = useState("");
  const [recentItems, setRecentItems] = useState(loadRecent);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readSidebarCollapsed());
  const [navPopover, setNavPopover] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filtersSearch, setFiltersSearch] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [datePopover, setDatePopover] = useState(null);
  const [personalPresets, setPersonalPresets] = useState([]);
  const [activePanelFilterIds, setActivePanelFilterIds] = useState(() =>
    normalizeActiveFilterIds([...DEFAULT_ADDED_IDS])
  );
  const setPanelFilterIds = useCallback((value) => {
    setActivePanelFilterIds((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      return normalizeActiveFilterIds(next);
    });
  }, []);

  const [filterDraftValues, setFilterDraftValues] = useState(emptyFilterValues);
  const [filterAppliedValues, setFilterAppliedValues] = useState(emptyFilterValues);
  const [filterFieldErrors, setFilterFieldErrors] = useState(() => ({}));
  const [appliedFiltersSearch, setAppliedFiltersSearch] = useState("");
  const [toolbarSearchError, setToolbarSearchError] = useState(null);

  const filterToolbarBadgeCount = useMemo(() => {
    let n = 0;
    for (const id of activePanelFilterIds) {
      const f = ALL_FILTERS.find((x) => x.id === id);
      if (f?.kind === "dateRange") {
        if (
          (filterAppliedValues[f.fromId] ?? "").trim() ||
          (filterAppliedValues[f.toId] ?? "").trim()
        ) {
          n += 1;
        }
      } else if ((filterAppliedValues[id] ?? "").trim()) {
        n += 1;
      }
    }
    if (appliedFiltersSearch.trim()) n += 1;
    return n;
  }, [activePanelFilterIds, filterAppliedValues, appliedFiltersSearch]);

  const setFilterDraft = useCallback((id, next) => {
    setFilterFieldErrors((prev) => {
      if (!prev[id]) return prev;
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setFilterDraftValues((prev) => ({ ...prev, [id]: typeof next === "function" ? next(prev[id] ?? "") : next }));
  }, []);

  const openDatePopover = useCallback((field, anchorEl) => {
    setCustomizeOpen(false);
    setDatePopover({ field, anchorEl });
  }, []);

  const applyDatePopover = useCallback((field, fromValue, toValue) => {
    setFilterFieldErrors((prev) => {
      if (!prev[field.fromId] && !prev[field.toId]) return prev;
      const { [field.fromId]: _from, [field.toId]: _to, ...rest } = prev;
      return rest;
    });
    setFilterDraftValues((prev) => ({
      ...prev,
      [field.fromId]: fromValue,
      [field.toId]: toValue,
    }));
    setDatePopover(null);
  }, []);

  const handleApplyFilters = useCallback(() => {
    const { fieldErrors, toolbarError } = validateFilterPanel(
      activePanelFilterIds,
      filterDraftValues,
      filtersSearch
    );
    setFilterFieldErrors(fieldErrors);
    setToolbarSearchError(toolbarError);
    if (Object.keys(fieldErrors).length > 0 || toolbarError) return;
    setFilterAppliedValues({ ...filterDraftValues });
    setAppliedFiltersSearch(filtersSearch);
  }, [activePanelFilterIds, filterDraftValues, filtersSearch]);

  const handleResetFilters = useCallback(() => {
    setPanelFilterIds(["order-id", "email"]);
    const empty = emptyFilterValues();
    setFilterDraftValues(empty);
    setFilterAppliedValues(empty);
    setFilterFieldErrors({});
    setFiltersSearch("");
    setAppliedFiltersSearch("");
    setToolbarSearchError(null);
    setDatePopover(null);
  }, [setPanelFilterIds]);

  const customizeBtnRef = useRef(null);
  const filtersPanelBodyRef = useRef(null);
  const sidebarContainerRef = useRef(null);
  const navPopoverRef = useRef(null);
  const popoverHideTimer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("merchant-hub-recent-v2", JSON.stringify(recentItems));
    } catch {
      /* ignore */
    }
  }, [recentItems]);

  useEffect(() => {
    try {
      sessionStorage.setItem(SIDEBAR_SESSION_KEY, sidebarCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  const hideNavPopover = useCallback(() => {
    if (popoverHideTimer.current) clearTimeout(popoverHideTimer.current);
    setNavPopover(null);
  }, []);

  const scheduleHideNavPopover = useCallback(() => {
    if (popoverHideTimer.current) clearTimeout(popoverHideTimer.current);
    popoverHideTimer.current = setTimeout(() => setNavPopover(null), 120);
  }, []);

  const cancelHideNavPopover = useCallback(() => {
    if (popoverHideTimer.current) clearTimeout(popoverHideTimer.current);
  }, []);

  const showNavPopoverFor = useCallback(
    (triggerEl, section) => {
      if (!sidebarCollapsed) return;
      cancelHideNavPopover();
      const container = sidebarContainerRef.current;
      if (!container || !triggerEl) return;
      const triggerRect = triggerEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const left = containerRect.right + 8;
      if (section.type === "item") {
        const centerY = triggerRect.top + triggerRect.height / 2;
        setNavPopover({ kind: "tooltip", label: section.label, left, centerY });
      } else {
        setNavPopover({
          kind: "menu",
          title: section.label,
          left,
          top: triggerRect.top,
          items: section.children.map((c) => ({ id: c.id, label: c.label })),
        });
      }
    },
    [sidebarCollapsed, cancelHideNavPopover]
  );

  useLayoutEffect(() => {
    if (!navPopover || navPopover.kind !== "menu" || !navPopoverRef.current) return;
    const el = navPopoverRef.current;
    const h = el.offsetHeight;
    let top = navPopover.top;
    if (top + h > window.innerHeight - 8) top = window.innerHeight - h - 8;
    top = Math.max(8, top);
    if (Math.abs(top - navPopover.top) > 1) {
      setNavPopover((p) => (p && p.kind === "menu" ? { ...p, top } : p));
    }
  }, [navPopover]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!navPopoverRef.current?.contains(e.target) && !e.target.closest(".category-item")) {
        hideNavPopover();
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [hideNavPopover]);

  useEffect(() => () => {
    if (popoverHideTimer.current) clearTimeout(popoverHideTimer.current);
  }, []);

  const searching = query.trim().length > 0;

  const filteredSearch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter(
      (e) => e.label.toLowerCase().includes(q) || (e.parentLabel && e.parentLabel.toLowerCase().includes(q))
    );
  }, [query, searchIndex]);

  const addToRecent = useCallback((id, label) => {
    if (SKIP_RECENT_IDS.has(id)) return;
    setRecentItems((prev) => {
      if (prev.some((i) => i.id === id)) return prev;
      const next = [{ id, label }, ...prev];
      if (next.length > RECENT_MAX) next.length = RECENT_MAX;
      return next;
    });
  }, []);

  const selectNav = useCallback(
    (id, label) => {
      addToRecent(id, label);
      setActiveId(id);
      setQuery("");
      const pid = findParentGroupId(navSections, id);
      if (pid) setExpanded((prev) => new Set([...prev, pid]));
    },
    [addToRecent, navSections]
  );

  const toggleGroup = useCallback((groupId) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(groupId)) n.delete(groupId);
      else n.add(groupId);
      return n;
    });
  }, []);

  const clearRecent = useCallback(() => setRecentItems([]), []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((v) => {
      const next = !v;
      if (next) setQuery("");
      return next;
    });
    hideNavPopover();
  }, [hideNavPopover]);

  const meta = activeId ? getMetaForId(navSections, activeId) : null;

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, alignItems: "stretch" }}>
      <div
        ref={sidebarContainerRef}
        className={`sidebar-container${sidebarCollapsed ? " collapsed" : ""}`}
        id="sidebar-container"
      >
        <div className="side-panel" id="side-panel">
          <div className="top-wrapper">
            <div className="account-wrapper">
              <div className="account-inner">
                <div className="account-avatar">D</div>
                <div className="account-name-wrapper">
                  <span className="account-name">Account name</span>
                  <SideIcon icon={ChevronVerticalGlyph} />
                </div>
              </div>
            </div>

            <div className="search-wrapper">
              <div className="search-bar">
                <SideIcon icon={SearchGlyph} />
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="search-clear-btn"
                  style={{ display: searching ? "flex" : "none" }}
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="panel-wrapper">
            <div className="panel-content" onScroll={hideNavPopover}>
              <div
                id="search-results"
                style={{ display: searching && !sidebarCollapsed ? "block" : "none" }}
              >
                {filteredSearch.length === 0 && searching && (
                  <div className="search-no-results">No results</div>
                )}
                {filteredSearch.map((e) => (
                  <div
                    key={e.id}
                    className={`search-result-item${e.id === activeId ? " active" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectNav(e.id, e.label)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        selectNav(e.id, e.label);
                      }
                    }}
                  >
                    <span className="search-result-name">{highlightMatch(e.label, query)}</span>
                    {e.parentLabel && <span className="search-result-parent">{e.parentLabel}</span>}
                  </div>
                ))}
              </div>

              <div id="nav-content" style={{ display: searching ? "none" : "contents" }}>
                <div
                  id="recent-block"
                  style={{
                    display: recentItems.length && !sidebarCollapsed ? "block" : "none",
                  }}
                >
                  <div className="section-label recent-label-row">
                    <span className="section-label-text">Recent</span>
                    <button type="button" className="clear-btn" id="clear-recent" onClick={clearRecent}>
                      Clear
                    </button>
                  </div>
                  <div id="recent-list">
                    {recentItems.map((item) => (
                      <div
                        key={item.id}
                        className={`nav-item${item.id === activeId ? " active" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => selectNav(item.id, item.label)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            selectNav(item.id, item.label);
                          }
                        }}
                      >
                        <span className="nav-item-text">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="section-label">
                    <span className="section-label-text">Categories</span>
                  </div>
                  <div>
                    {navSections.map((section) => {
                      if (section.type === "item") {
                        return (
                          <div key={section.id} className="category-group">
                            <div
                              className={`category-item${section.id === activeId ? " active" : ""}`}
                              role="button"
                              tabIndex={0}
                              data-nav-id={section.id}
                              data-nav-label={section.label}
                              onClick={() => selectNav(section.id, section.label)}
                              onMouseEnter={(e) => showNavPopoverFor(e.currentTarget, section)}
                              onMouseLeave={scheduleHideNavPopover}
                              onFocus={(e) => sidebarCollapsed && showNavPopoverFor(e.currentTarget, section)}
                              onBlur={scheduleHideNavPopover}
                              onKeyDown={(ev) => {
                                if (ev.key === "Enter" || ev.key === " ") {
                                  ev.preventDefault();
                                  selectNav(section.id, section.label);
                                }
                              }}
                            >
                              <div className="cat-icon-wrap">
                                <SideIcon icon={ICON_GLYPH[section.icon]} />
                              </div>
                              <div className="cat-label-row">
                                <span className="cat-label">{section.label}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const exp = expanded.has(section.id);
                      const hasActiveChild = section.children.some((c) => c.id === activeId);
                      const headerClass =
                        "category-item" + (hasActiveChild && !exp ? " has-active-child" : "");
                      return (
                        <div key={section.id} className={`category-group${exp ? " expanded" : ""}`}>
                          <div
                            className={headerClass}
                            data-expandable=""
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!sidebarCollapsed) toggleGroup(section.id);
                            }}
                            onMouseEnter={(e) => showNavPopoverFor(e.currentTarget, section)}
                            onMouseLeave={scheduleHideNavPopover}
                            onFocus={(e) => sidebarCollapsed && showNavPopoverFor(e.currentTarget, section)}
                            onBlur={scheduleHideNavPopover}
                            onKeyDown={(ev) => {
                              if (ev.key === "Enter" || ev.key === " ") {
                                ev.preventDefault();
                                if (!sidebarCollapsed) toggleGroup(section.id);
                              }
                            }}
                          >
                            <div className="cat-icon-wrap">
                              <SideIcon icon={ICON_GLYPH[section.icon]} />
                            </div>
                            <div className="cat-label-row">
                              <span className="cat-label">{section.label}</span>
                              <SideIcon icon={ChevronDownGlyph} className="cat-chevron" />
                            </div>
                          </div>
                          <div className="submenu">
                            <div className="submenu-inner">
                              {section.children.map((child) => (
                                <div
                                  key={child.id}
                                  className={`subcategory-item${child.id === activeId ? " active" : ""}`}
                                  data-nav-id={child.id}
                                  data-nav-label={child.label}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => selectNav(child.id, child.label)}
                                  onKeyDown={(ev) => {
                                    if (ev.key === "Enter" || ev.key === " ") {
                                      ev.preventDefault();
                                      selectNav(child.id, child.label);
                                    }
                                  }}
                                >
                                  <span className="subcategory-text">{child.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="fade-top" id="fade-top" />
            <div className="fade-bottom" id="fade-bottom" />
          </div>

          <div className="user-wrapper">
            <div className="user-avatar">
              <img src={avtrImg} alt="" decoding="async" />
            </div>
            <div className="user-credentials">
              <span className="user-name">Jane Doe</span>
              <span className="user-email">jane.doe@solidgate.com</span>
            </div>
            <SideIcon icon={ChevronVerticalGlyph} />
          </div>
        </div>

        <button
          type="button"
          className="collapse-btn"
          id="collapse-btn"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
          onClick={toggleSidebarCollapsed}
        >
          <SideIcon icon={SidebarCollapseGlyph} size={24} className="collapse-btn-icon" />
        </button>
      </div>

      {navPopover && (
        <div
          ref={navPopoverRef}
          id="nav-popover"
          role="menu"
          aria-label="Navigation submenu"
          className={navPopover.kind === "tooltip" ? "is-tooltip" : ""}
          style={{
            position: "fixed",
            display: "block",
            zIndex: 500,
            left: navPopover.left,
            ...(navPopover.kind === "tooltip"
              ? { top: navPopover.centerY, transform: "translateY(-50%)" }
              : { top: navPopover.top }),
          }}
          onMouseEnter={cancelHideNavPopover}
          onMouseLeave={scheduleHideNavPopover}
        >
          {navPopover.kind === "tooltip" && (
            <span className="nav-popover-label">{navPopover.label}</span>
          )}
          {navPopover.kind === "menu" && (
            <>
              <div className="nav-popover-title">{navPopover.title}</div>
              <div className="nav-popover-list">
                {navPopover.items.map((item) => (
                  <div
                    key={item.id}
                    className={`nav-popover-item${activeId === item.id ? " active" : ""}`}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      selectNav(item.id, item.label);
                      hideNavPopover();
                    }}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        selectNav(item.id, item.label);
                        hideNavPopover();
                      }
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="main-content" id="main-content">
        {!activeId ? (
          <div className="main-empty" id="main-empty">
            <span className="main-empty-text">Select an item from the navigation</span>
          </div>
        ) : (
          <div className="main-view visible" id="main-view">
            <header className="page-header page-header--main">
              <div className="page-header-primary">
                <h1 className="page-title">Orders</h1>
                <a className="page-doc-link page-doc-link--sm" href="#">
                  <span className="page-doc-link__text">How orders works</span>
                  <SideIcon icon={ExternalLinkGlyph} className="page-doc-link__icon" />
                </a>
                {meta?.parentLabel && (
                  <span className="page-breadcrumb">
                    {meta.parentLabel} / {meta.label}
                  </span>
                )}
              </div>
              <button type="button" className="page-primary-btn page-primary-btn--active">
                <SideIcon icon={PlusGlyph} />
                <span>Create</span>
              </button>
            </header>

            <div className="filters-section">
              <div className="filters-toolbar" role="toolbar" aria-label="Filters toolbar">
                <button
                  type="button"
                  className={`filters-toolbar-btn filters-toolbar-btn--filter${filtersExpanded ? " is-active" : ""}`}
                  aria-expanded={filtersExpanded}
                  aria-controls="filters-panel-body"
                  onClick={() => {
                    if (filtersExpanded) {
                      setCustomizeOpen(false);
                      setDatePopover(null);
                    }
                    setFiltersExpanded((v) => !v);
                  }}
                >
                  <SideIcon icon={FiltersGlyph} className="filters-toolbar-btn__icon" />
                  <span className="filters-toolbar-btn__label">Filter</span>
                  {filterToolbarBadgeCount > 0 ? (
                    <span className="filters-toolbar-btn__badge">{filterToolbarBadgeCount}</span>
                  ) : null}
                </button>

                <div className="filters-toolbar-search">
                  <div
                    className={[
                      "unit-textfield",
                      "unit-textfield--sm",
                      "filters-search-unit",
                      toolbarSearchError ? "unit-textfield--error" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="unit-textfield__outline">
                      <div className="unit-textfield__field">
                        <SideIcon icon={SearchGlyph} />
                        <input
                          type="search"
                          placeholder="Search"
                          autoComplete="off"
                          spellCheck={false}
                          value={filtersSearch}
                          onChange={(e) => {
                            setToolbarSearchError(null);
                            setFiltersSearch(e.target.value);
                          }}
                          aria-label="Search"
                          aria-invalid={toolbarSearchError ? true : undefined}
                        />
                        {filtersSearch ? (
                          <button
                            type="button"
                            className="filters-search-clear"
                            aria-label="Clear search"
                            onClick={() => {
                              setToolbarSearchError(null);
                              setFiltersSearch("");
                            }}
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {toolbarSearchError ? (
                      <div className="unit-textfield__helper-wrapper">
                        <span className="unit-textfield__helper" role="alert">
                          {toolbarSearchError}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="filters-toolbar-actions">
                  <button type="button" className="filters-toolbar-btn">
                    <SideIcon icon={SortGlyph} className="filters-toolbar-btn__icon" />
                    <span className="filters-toolbar-btn__label">Sort</span>
                  </button>
                  <button type="button" className="filters-toolbar-btn">
                    <SideIcon icon={SettingsViewGlyph} className="filters-toolbar-btn__icon" />
                    <span className="filters-toolbar-btn__label">View</span>
                  </button>
                </div>
              </div>

            {filtersExpanded && (
              <div
                ref={filtersPanelBodyRef}
                className="filters-panel"
                id="filters-panel-body"
                role="region"
                aria-label="Filters"
              >
                <div className="filters-panel-fields">
                  {activePanelFilterIds
                    .map((id) => ALL_FILTERS.find((x) => x.id === id))
                    .filter(Boolean)
                    .map((f) => {
                      const isDateRange = f.kind === "dateRange";
                      const err = isDateRange
                        ? filterFieldErrors[f.fromId] || filterFieldErrors[f.toId]
                        : filterFieldErrors[f.id];
                      const disabledField = f.id === "descriptor";
                      return (
                        <div key={f.id} className={`filters-field${isDateRange ? " filters-field--date-range" : ""}`}>
                          <div
                            className={[
                              "unit-textfield",
                              "unit-textfield--sm",
                              datePopover?.field.id === f.id ? "unit-textfield--active" : "",
                              err ? "unit-textfield--error" : "",
                              disabledField ? "unit-textfield--disabled" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            aria-haspopup={isDateRange ? "dialog" : undefined}
                            aria-expanded={isDateRange ? datePopover?.field.id === f.id : undefined}
                            onClick={(e) => {
                              if (!isDateRange || disabledField) return;
                              if (e.target.closest("input")) return;
                              openDatePopover(f, e.currentTarget);
                            }}
                          >
                            <div className="unit-textfield__label-wrapper">
                              <div className="unit-textfield__label">{f.label}</div>
                            </div>
                            <div className="unit-textfield__outline">
                              <div
                                className={
                                  f.kind === "amount"
                                    ? "unit-textfield__field unit-textfield__field--split"
                                    : "unit-textfield__field"
                                }
                              >
                                {isDateRange ? (
                                  <>
                                    <CalendarGlyph className="icon" />
                                    <div className="fp-date-range-segments">
                                      <SegmentedDateInput
                                        className="fp-date-range-segments__half"
                                        valueDate={parseDateValue(filterDraftValues[f.fromId])}
                                        onCommitDate={(d) => {
                                          const prev = parseDateTimeValue(filterDraftValues[f.fromId]);
                                          setFilterDraft(f.fromId, d ? formatDateTimeForFilter(d, prev.timeHms) : "");
                                        }}
                                        ariaLabel={`${f.label} from`}
                                      />
                                      <span className="fp-date-range-segments__arrow" aria-hidden>→</span>
                                      <SegmentedDateInput
                                        className="fp-date-range-segments__half"
                                        valueDate={parseDateValue(filterDraftValues[f.toId])}
                                        onCommitDate={(d) => {
                                          const prev = parseDateTimeValue(filterDraftValues[f.toId]);
                                          setFilterDraft(f.toId, d ? formatDateTimeForFilter(d, prev.timeHms) : "");
                                        }}
                                        ariaLabel={`${f.label} to`}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  renderFilterInput(f, {
                                    value: filterDraftValues[f.id] ?? "",
                                    onChange: (e) => setFilterDraft(f.id, e.target.value),
                                    disabled: disabledField,
                                    invalid: Boolean(err),
                                  })
                                )}
                              </div>
                            </div>
                            {err ? (
                              <div className="unit-textfield__helper-wrapper">
                                <span className="unit-textfield__helper" role="alert">
                                  {err}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="filters-panel-footer">
                  <button
                    ref={customizeBtnRef}
                    type="button"
                    className={`filters-customize-link${customizeOpen ? " is-active" : ""}`}
                    aria-expanded={customizeOpen}
                    aria-haspopup="dialog"
                    onClick={() => {
                      setDatePopover(null);
                      setCustomizeOpen((v) => !v);
                    }}
                  >
                    <SideIcon icon={SettingsCustomizeGlyph} />
                    <span>Customize</span>
                  </button>
                  <div className="filters-panel-footer-actions">
                    <button type="button" className="filters-reset" onClick={handleResetFilters}>
                      Reset
                    </button>
                    <button type="button" className="filters-apply" onClick={handleApplyFilters}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>

            <div className="sk-table-wrap">
              <div className="sk-table-header">
                <div className="sk sk-table-title" />
                <div className="sk sk-table-action" />
              </div>
              {SK_TABLE_ROWS.map((widths, ri) => (
                <div
                  key={ri}
                  className="sk-table-row"
                  style={{ gridTemplateColumns: "2.2fr 1.2fr 0.8fr 0.7fr 0.3fr" }}
                >
                  {widths.map((pct, ci) => (
                    <div key={ci} className="sk sk-cell" style={{ width: `${pct}%` }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {customizeOpen && (
        <CustomizeFiltersPopover
          anchorRef={customizeBtnRef}
          filtersPanelRef={filtersPanelBodyRef}
          onClose={() => setCustomizeOpen(false)}
          personalPresets={personalPresets}
          onPersonalPresetsChange={setPersonalPresets}
          activeFilterIds={activePanelFilterIds}
          onActiveFilterIdsChange={setPanelFilterIds}
        />
      )}

      {datePopover && (
        <DateFilterPopover
          anchorEl={datePopover.anchorEl}
          field={datePopover.field}
          values={filterDraftValues}
          onApply={(fromValue, toValue) => applyDatePopover(datePopover.field, fromValue, toValue)}
          onClose={() => setDatePopover(null)}
        />
      )}
    </div>
  );
}
