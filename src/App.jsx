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
import HelpCircleGlyph from "./assets/icons/help-circle.svg?react";
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
import { UnitTextfield, TextfieldClearIcon } from "./components/UnitTextfield.jsx";
import { FilterDateSignAfter, FilterDateSignArrow, FilterDateSignBefore } from "./components/FilterDateSign.jsx";

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

/** Inline clock icon for time fields in date popover (Figma). */
function ClockGlyph({ className }) {
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
        d="M8 4.25v4.25l2.75 1.5M14.25 8a6.25 6.25 0 11-12.5 0 6.25 6.25 0 0112.5 0z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Reserves label row height when Figma omits text (e.g. second time column). */
function PopoverTextfieldEmptyLabel() {
  return <span className="df-popover-empty-label" aria-hidden>&nbsp;</span>;
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

/** Choosing these presets switches the date filter tab to Range (rolling window or open range). */
const PRESETS_THAT_FORCE_RANGE = new Set(["last-7-days", "last-30-days", "all-time"]);
/** Day presets: switch the date filter tab to Single (one calendar day). */
const PRESETS_THAT_FORCE_SINGLE = new Set(["today", "yesterday", "tomorrow"]);

/** Years of rolling history for “All time” (prototype; replace with section limits later). */
const ALL_TIME_RANGE_YEARS_BACK = 2;
/** Exact day-count lookback from today (not same calendar date N years ago). */
const ALL_TIME_LOOKBACK_DAYS = 365 * ALL_TIME_RANGE_YEARS_BACK;

const DATE_MODES = ["Single", "Range", "Before", "After"];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Stable sync key for segmented date inputs — parent often passes `new Date(...)` each render for the same calendar day. */
function dateCalendarKey(d) {
  if (d == null) return null;
  return startOfDay(d).getTime();
}

function parseSegmentedDateParts(dv, mv, yv) {
  if (!dv || !mv || !yv || yv.length !== 4) return null;
  const y = parseInt(yv, 10);
  const m = parseInt(mv, 10);
  const d = parseInt(dv, 10);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return { date: startOfDay(date), day: d, month: m, year: y };
}

function dateSegmentPlaceholders(d) {
  if (!d) return { day: "00", month: "00", year: "0000" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    year: String(d.getFullYear()),
  };
}

function focusInputCaret(ref, position) {
  queueMicrotask(() => {
    const el = ref?.current;
    if (!el) return;
    el.focus();
    try {
      el.setSelectionRange(position, position);
    } catch {
      /* ignore */
    }
  });
}

/** Month 1–12; returns count of days (e.g. Feb leap). */
function daysInCalendarMonth(year, month1) {
  return new Date(year, month1, 0).getDate();
}

function dateSegmentKeyDown(e, segment, ctx) {
  handleSegmentedDateArrowKey(e, segment, ctx);
  handleSegmentedDateCrossKey(e, segment, ctx);
}

/** ArrowUp / ArrowDown — step the active DD / MM / YYYY segment. */
function handleSegmentedDateArrowKey(e, segment, ctx) {
  const { disabled, dv, mv, yv, setDv, setMv, setYv, commitCompleteDate, dRef, mRef, yRef, fallbackDate } = ctx;
  if (disabled) return;
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

  const base =
    fallbackDate instanceof Date && !Number.isNaN(fallbackDate.getTime())
      ? startOfDay(fallbackDate)
      : startOfDay(new Date());

  let d = dv.length >= 1 ? parseInt(dv, 10) : NaN;
  let mo = mv.length >= 1 ? parseInt(mv, 10) : NaN;
  let yr = yv.length >= 4 ? parseInt(yv, 10) : NaN;

  if (!Number.isFinite(d)) d = base.getDate();
  if (!Number.isFinite(mo)) mo = base.getMonth() + 1;
  if (!Number.isFinite(yr)) yr = base.getFullYear();

  mo = Math.min(12, Math.max(1, mo));
  yr = Math.min(9999, Math.max(1, yr));
  let dim = daysInCalendarMonth(yr, mo);
  d = Math.min(dim, Math.max(1, d));

  const delta = e.key === "ArrowUp" ? 1 : -1;

  if (segment === "y") {
    yr = Math.min(9999, Math.max(1, yr + delta));
    dim = daysInCalendarMonth(yr, mo);
    if (d > dim) d = dim;
  } else if (segment === "m") {
    mo += delta;
    while (mo < 1) {
      mo += 12;
      yr -= 1;
    }
    while (mo > 12) {
      mo -= 12;
      yr += 1;
    }
    yr = Math.min(9999, Math.max(1, yr));
    dim = daysInCalendarMonth(yr, mo);
    if (d > dim) d = dim;
  } else {
    d += delta;
    dim = daysInCalendarMonth(yr, mo);
    if (d < 1) d = 1;
    else if (d > dim) d = dim;
  }

  const nd = String(d).padStart(2, "0");
  const nm = String(mo).padStart(2, "0");
  const ny = String(yr);

  e.preventDefault();
  setDv(nd);
  setMv(nm);
  setYv(ny);
  commitCompleteDate(nd, nm, ny);
  const ref = segment === "d" ? dRef : segment === "m" ? mRef : yRef;
  const caretLen =
    segment === "d" ? nd.length : segment === "m" ? nm.length : ny.length;
  focusInputCaret(ref, caretLen);
}

/** Backspace at segment start / Delete at segment end — edit adjacent DD/MM/YYYY parts. */
function handleSegmentedDateCrossKey(e, segment, ctx) {
  const { disabled, dv, mv, yv, setDv, setMv, setYv, commitCompleteDate, dRef, mRef, yRef } = ctx;
  if (disabled) return;
  if (e.key !== "Backspace" && e.key !== "Delete") return;
  const input = e.currentTarget;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  if (start == null || end == null || start !== end) return;

  if (e.key === "Backspace" && start === 0) {
    if (segment === "d") return;
    if (segment === "m") {
      if (dv.length > 0) {
        e.preventDefault();
        const nd = dv.slice(0, -1);
        setDv(nd);
        commitCompleteDate(nd, mv, yv);
        focusInputCaret(dRef, nd.length);
      } else {
        e.preventDefault();
        focusInputCaret(dRef, dRef.current?.value.length ?? 0);
      }
      return;
    }
    if (segment === "y") {
      if (mv.length > 0) {
        e.preventDefault();
        const nm = mv.slice(0, -1);
        setMv(nm);
        commitCompleteDate(dv, nm, yv);
        focusInputCaret(mRef, nm.length);
      } else if (dv.length > 0) {
        e.preventDefault();
        const nd = dv.slice(0, -1);
        setDv(nd);
        commitCompleteDate(nd, mv, yv);
        focusInputCaret(dRef, nd.length);
      } else {
        e.preventDefault();
        focusInputCaret(mRef, mRef.current?.value.length ?? 0);
      }
    }
    return;
  }

  if (e.key === "Delete" && start === input.value.length) {
    if (segment === "d" && mv.length > 0) {
      e.preventDefault();
      const nm = mv.slice(1);
      setMv(nm);
      commitCompleteDate(dv, nm, yv);
      focusInputCaret(mRef, 0);
    } else if (segment === "m" && yv.length > 0) {
      e.preventDefault();
      const ny = yv.slice(1);
      setYv(ny);
      commitCompleteDate(dv, mv, ny);
      focusInputCaret(yRef, 0);
    }
  }
}

/** Backspace at segment start / Delete at segment end — edit adjacent HH:MM(:SS) parts. */
function handleSegmentedTimeCrossKey(e, segment, ctx) {
  const { disabled, withSeconds, hv, mv, sv, applyTime, hRef, mRef, sRef } = ctx;
  if (disabled) return;
  if (e.key !== "Backspace" && e.key !== "Delete") return;
  const input = e.currentTarget;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  if (start == null || end == null || start !== end) return;

  if (e.key === "Backspace" && start === 0) {
    if (segment === "h") return;
    if (segment === "m") {
      if (hv.length > 0) {
        e.preventDefault();
        const nh = hv.slice(0, -1);
        applyTime(nh, mv, sv);
        focusInputCaret(hRef, nh.length);
      } else {
        e.preventDefault();
        focusInputCaret(hRef, hRef.current?.value.length ?? 0);
      }
      return;
    }
    if (segment === "s") {
      if (mv.length > 0) {
        e.preventDefault();
        const nm = mv.slice(0, -1);
        applyTime(hv, nm, sv);
        focusInputCaret(mRef, nm.length);
      } else if (hv.length > 0) {
        e.preventDefault();
        const nh = hv.slice(0, -1);
        applyTime(nh, mv, sv);
        focusInputCaret(hRef, nh.length);
      } else {
        e.preventDefault();
        focusInputCaret(mRef, mRef.current?.value.length ?? 0);
      }
      return;
    }
    return;
  }

  if (e.key === "Delete" && start === input.value.length) {
    if (segment === "h" && mv.length > 0) {
      e.preventDefault();
      const nm = mv.slice(1);
      applyTime(hv, nm, sv);
      focusInputCaret(mRef, 0);
      return;
    }
    if (segment === "m" && withSeconds && sv.length > 0) {
      e.preventDefault();
      const ns = sv.slice(1);
      applyTime(hv, mv, ns);
      focusInputCaret(sRef, 0);
    }
  }
}

function timeSegmentKeyDown(e, segment, ctx) {
  handleSegmentedTimeArrowKey(e, segment, ctx);
  handleSegmentedTimeCrossKey(e, segment, ctx);
}

/** ArrowUp / ArrowDown — step HH / MM / SS. */
function handleSegmentedTimeArrowKey(e, segment, ctx) {
  const { disabled, withSeconds, hv, mv, sv, applyTime, hRef, mRef, sRef } = ctx;
  if (disabled) return;
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  if (segment === "s" && !withSeconds) return;

  let h = parseInt(hv, 10);
  let mi = parseInt(mv, 10);
  let sec = parseInt(sv, 10);
  if (!Number.isFinite(h)) h = 0;
  if (!Number.isFinite(mi)) mi = 0;
  if (!Number.isFinite(sec)) sec = 0;

  h = Math.min(23, Math.max(0, h));
  mi = Math.min(59, Math.max(0, mi));
  sec = Math.min(59, Math.max(0, sec));

  const delta = e.key === "ArrowUp" ? 1 : -1;

  if (segment === "h") {
    h = Math.min(23, Math.max(0, h + delta));
  } else if (segment === "m") {
    mi = Math.min(59, Math.max(0, mi + delta));
  } else {
    sec = Math.min(59, Math.max(0, sec + delta));
  }

  e.preventDefault();
  const nh = String(h).padStart(2, "0");
  const nmi = String(mi).padStart(2, "0");
  const ns = String(sec).padStart(2, "0");
  applyTime(nh, nmi, ns);
  const ref = segment === "h" ? hRef : segment === "m" ? mRef : sRef;
  focusInputCaret(ref, 2);
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

/** Same packing logic as DateFilterPopover Apply — writes draft dates/times to filter strings. */
function packDateDraftForFilter(mode, d) {
  const pack = (date, t) => formatDateTimeForFilter(date, t);
  if (mode === "Single") {
    const day = d.fromDate || d.toDate;
    return { fromValue: pack(day, d.timeFrom), toValue: pack(day, d.timeTo) };
  }
  if (mode === "After") return { fromValue: pack(d.fromDate, d.timeFrom), toValue: "" };
  if (mode === "Before") return { fromValue: "", toValue: pack(d.toDate, d.timeTo) };
  return { fromValue: pack(d.fromDate, d.timeFrom), toValue: pack(d.toDate, d.timeTo) };
}

function cloneDate(d) {
  return d ? new Date(d.getTime()) : null;
}

/** Local datetime from calendar day + normalized HH:mm:ss. */
function combineDateAndTime(dateDay, timeHms) {
  if (!dateDay) return null;
  const t = normalizeToHms(timeHms ?? "00:00:00");
  const ps = t.split(":").map((x) => parseInt(x, 10) || 0);
  const h = Math.min(23, Math.max(0, ps[0] ?? 0));
  const mi = Math.min(59, Math.max(0, ps[1] ?? 0));
  const sec = Math.min(59, Math.max(0, ps[2] ?? 0));
  return new Date(dateDay.getFullYear(), dateDay.getMonth(), dateDay.getDate(), h, mi, sec, 0);
}

function timeHmsFromDate(dt) {
  return normalizeToHms(
    `${dt.getHours()}:${dt.getMinutes()}:${Math.min(59, Math.max(0, dt.getSeconds()))}`
  );
}

/** Enforce Single / Range / Before / After rules — no future day where rules say so; no future instant at “now”. */
function constrainDraftSlice(mode, slice) {
  const now = new Date();
  const sodToday = startOfDay(now);
  let {
    fromDate,
    toDate,
    timeFrom = "00:00:00",
    timeTo = "00:00:00",
    visibleMonth: vmIn,
    selectedPreset,
  } = slice;
  let tf = normalizeToHms(timeFrom);
  let tt = normalizeToHms(timeTo);

  const capDayToPastOrPresent = (d) => {
    if (!d) return null;
    const sd = startOfDay(d);
    if (sd > sodToday) return cloneDate(sodToday);
    return cloneDate(d);
  };

  if (mode === "Single") {
    let day = fromDate || toDate ? capDayToPastOrPresent(fromDate || toDate) : null;
    if (!day) day = cloneDate(sodToday);
    tf = normalizeToHms(tf);
    tt = normalizeToHms(tt);
    let A = combineDateAndTime(day, tf);
    let B = combineDateAndTime(day, tt);
    if (!A || !B) {
      tf = normalizeToHms("00:00:00");
      tt = normalizeToHms("23:59:59");
      A = combineDateAndTime(day, tf);
      B = combineDateAndTime(day, tt);
    }
    if (A > B) {
      const x = tf;
      tf = tt;
      tt = x;
      A = combineDateAndTime(day, tf);
      B = combineDateAndTime(day, tt);
    }
    const sodD = startOfDay(day);
    if (sodD.getTime() === sodToday.getTime()) {
      if (B > now) {
        B = now;
        tt = timeHmsFromDate(B);
        A = combineDateAndTime(day, tf);
      }
      if (A > now) {
        A = now;
        tf = timeHmsFromDate(A);
        B = combineDateAndTime(day, tt);
        if (A > B) {
          tt = tf;
          B = new Date(A);
        }
      }
    }
    const baseVm = vmIn ?? new Date(day.getFullYear(), day.getMonth(), 1);
    return {
      fromDate: cloneDate(day),
      toDate: cloneDate(day),
      timeFrom: tf,
      timeTo: tt,
      visibleMonth: baseVm,
      selectedPreset: selectedPreset ?? null,
    };
  }

  if (mode === "Range") {
    let fd = capDayToPastOrPresent(fromDate) || cloneDate(sodToday);
    let td = capDayToPastOrPresent(toDate) || cloneDate(sodToday);
    if (startOfDay(fd).getTime() > startOfDay(td).getTime()) {
      const s = fd;
      fd = td;
      td = s;
      const xt = tf;
      tf = tt;
      tt = xt;
    }
    tf = normalizeToHms(tf);
    tt = normalizeToHms(tt);
    let lo = combineDateAndTime(fd, tf);
    let hi = combineDateAndTime(td, tt);
    if (!lo || !hi) {
      lo = combineDateAndTime(fd, normalizeToHms("00:00:00"));
      hi = combineDateAndTime(td, normalizeToHms("23:59:59"));
    }
    let msLo = lo.getTime();
    let msHi = hi.getTime();
    if (msLo > msHi) {
      const s = msLo;
      msLo = msHi;
      msHi = s;
    }
    const msNow = now.getTime();
    msHi = Math.min(msHi, msNow);
    msLo = Math.min(msLo, msHi);

    const dLo = new Date(msLo);
    const dHi = new Date(msHi);
    const nfd = cloneDate(startOfDay(dLo));
    const ntd = cloneDate(startOfDay(dHi));
    const nrf = timeHmsFromDate(dLo);
    const ntt = timeHmsFromDate(dHi);
    const vm = vmIn ?? new Date(nfd.getFullYear(), nfd.getMonth(), 1);
    return {
      fromDate: nfd,
      toDate: ntd,
      timeFrom: nrf,
      timeTo: ntt,
      visibleMonth: vm,
      selectedPreset: selectedPreset ?? null,
    };
  }

  if (mode === "Before") {
    let d = capDayToPastOrPresent(toDate) || cloneDate(sodToday);
    let B = combineDateAndTime(d, tt);
    if (B > now) {
      B = now;
      d = cloneDate(startOfDay(B));
      tt = timeHmsFromDate(B);
    }
    const vm = vmIn ?? new Date(d.getFullYear(), d.getMonth(), 1);
    return {
      fromDate: null,
      toDate: cloneDate(d),
      timeFrom: "00:00:00",
      timeTo: tt,
      visibleMonth: vm,
      selectedPreset: selectedPreset ?? null,
    };
  }

  if (mode === "After") {
    let d = capDayToPastOrPresent(fromDate) || cloneDate(sodToday);
    let A = combineDateAndTime(d, tf);
    if (A > now) {
      A = now;
      d = cloneDate(startOfDay(A));
      tf = timeHmsFromDate(A);
    }
    const vm = vmIn ?? new Date(d.getFullYear(), d.getMonth(), 1);
    return {
      fromDate: cloneDate(d),
      toDate: null,
      timeFrom: tf,
      timeTo: "00:00:00",
      visibleMonth: vm,
      selectedPreset: selectedPreset ?? null,
    };
  }

  return slice;
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

/** DD / MM / YYYY — digits only; static / separators (Figma). With `embedded`, sits inside `UnitTextfield` (popover); otherwise full chrome. */
function SegmentedDateInput({
  valueDate,
  placeholderDate,
  onCommitDate,
  className = "",
  ariaLabel,
  disabled = false,
  invalid = false,
  active = false,
  embedded = false,
}) {
  const dRef = useRef(null);
  const mRef = useRef(null);
  const yRef = useRef(null);
  const [dv, setDv] = useState(() => (valueDate ? String(valueDate.getDate()).padStart(2, "0") : ""));
  const [mv, setMv] = useState(() =>
    valueDate ? String(valueDate.getMonth() + 1).padStart(2, "0") : ""
  );
  const [yv, setYv] = useState(() => (valueDate ? String(valueDate.getFullYear()) : ""));
  const ph = dateSegmentPlaceholders(placeholderDate);
  const isPlaceholder = !dv && !mv && !yv;

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

  const calendarKey = dateCalendarKey(valueDate);
  useEffect(() => {
    syncFromProp(valueDate);
  }, [calendarKey, syncFromProp]);

  const commitIfValid = useCallback(() => {
    if (!dv && !mv && !yv) {
      onCommitDate(null);
      return;
    }
    const parsed = parseSegmentedDateParts(dv, mv, yv);
    if (!parsed) {
      syncFromProp(valueDate);
      return;
    }
    onCommitDate(parsed.date);
    setDv(String(parsed.day).padStart(2, "0"));
    setMv(String(parsed.month).padStart(2, "0"));
    setYv(String(parsed.year));
  }, [dv, mv, yv, onCommitDate, valueDate, syncFromProp]);

  const commitCompleteDate = useCallback((nextDv, nextMv, nextYv) => {
    const parsed = parseSegmentedDateParts(nextDv, nextMv, nextYv);
    if (parsed) onCommitDate(parsed.date);
  }, [onCommitDate]);

  const dateKeyCtx = {
    disabled,
    dv,
    mv,
    yv,
    setDv,
    setMv,
    setYv,
    commitCompleteDate,
    dRef,
    mRef,
    yRef,
    fallbackDate: valueDate ?? placeholderDate ?? undefined,
  };

  const onDigits = (raw, maxLen, setFn, nextRef, nextDv, nextMv, nextYv) => {
    const v = raw.replace(/\D/g, "").slice(0, maxLen);
    setFn(v);
    commitCompleteDate(nextDv(v), nextMv(v), nextYv(v));
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

  const handleBlur = useCallback((e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    commitIfValid();
  }, [commitIfValid]);

  const segClass = [
    "df-seg-date",
    isPlaceholder ? "is-placeholder" : "",
    embedded ? "df-seg-date--embedded" : "",
    embedded ? className : "",
  ]
    .filter(Boolean)
    .join(" ");

  const segMouseDown = (e) => {
    if (disabled) return;
    if (e.target.tagName === "DIV") {
      e.preventDefault();
      focusFirstEmpty();
    }
  };

  const inputs = (
    <>
      <input
        ref={dRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="df-seg-date__inp df-seg-date__inp--dd"
        placeholder={ph.day}
        aria-label={`${ariaLabel} — day`}
        value={dv}
        disabled={disabled}
        onChange={(e) => onDigits(e.target.value, 2, setDv, mRef, (v) => v, () => mv, () => yv)}
        onKeyDown={(e) => dateSegmentKeyDown(e, "d", dateKeyCtx)}
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
        placeholder={ph.month}
        aria-label={`${ariaLabel} — month`}
        value={mv}
        disabled={disabled}
        onChange={(e) => onDigits(e.target.value, 2, setMv, yRef, () => dv, (v) => v, () => yv)}
        onKeyDown={(e) => dateSegmentKeyDown(e, "m", dateKeyCtx)}
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
        placeholder={ph.year}
        aria-label={`${ariaLabel} — year`}
        value={yv}
        disabled={disabled}
        onChange={(e) => onDigits(e.target.value, 4, setYv, null, () => dv, () => mv, (v) => v)}
        onKeyDown={(e) => dateSegmentKeyDown(e, "y", dateKeyCtx)}
      />
    </>
  );

  if (embedded) {
    return (
      <div
        className={segClass}
        role="group"
        aria-label={ariaLabel}
        aria-invalid={invalid ? true : undefined}
        onBlur={handleBlur}
        onMouseDown={segMouseDown}
      >
        {inputs}
      </div>
    );
  }

  return (
    <div
      className={[
        className,
        disabled ? "df-date-field__value--disabled" : "",
        invalid ? "df-date-field__value--error" : "",
        active ? "df-date-field__value--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onBlur={handleBlur}
      onMouseDown={segMouseDown}
    >
      <div
        className={["df-seg-date", isPlaceholder ? "is-placeholder" : ""].filter(Boolean).join(" ")}
        role="group"
        aria-label={ariaLabel}
        aria-invalid={invalid ? true : undefined}
      >
        {inputs}
      </div>
    </div>
  );
}

function FilterDateSegment({ valueDate, placeholderDate, onCommitDate, ariaLabel }) {
  const dRef = useRef(null);
  const mRef = useRef(null);
  const yRef = useRef(null);
  const [dv, setDv] = useState(() => (valueDate ? String(valueDate.getDate()).padStart(2, "0") : ""));
  const [mv, setMv] = useState(() =>
    valueDate ? String(valueDate.getMonth() + 1).padStart(2, "0") : ""
  );
  const [yv, setYv] = useState(() => (valueDate ? String(valueDate.getFullYear()) : ""));
  const ph = dateSegmentPlaceholders(placeholderDate);
  const isPlaceholder = !dv && !mv && !yv;

  const syncFromProp = useCallback((d) => {
    if (!d) { setDv(""); setMv(""); setYv(""); return; }
    setDv(String(d.getDate()).padStart(2, "0"));
    setMv(String(d.getMonth() + 1).padStart(2, "0"));
    setYv(String(d.getFullYear()));
  }, []);

  const calendarKey = dateCalendarKey(valueDate);
  useEffect(() => {
    syncFromProp(valueDate);
  }, [calendarKey, syncFromProp]);

  const commitIfValid = useCallback(() => {
    if (!dv && !mv && !yv) { onCommitDate(null); return; }
    const parsed = parseSegmentedDateParts(dv, mv, yv);
    if (!parsed) { syncFromProp(valueDate); return; }
    onCommitDate(parsed.date);
    setDv(String(parsed.day).padStart(2, "0"));
    setMv(String(parsed.month).padStart(2, "0"));
    setYv(String(parsed.year));
  }, [dv, mv, yv, onCommitDate, valueDate, syncFromProp]);

  const commitCompleteDate = useCallback((nextDv, nextMv, nextYv) => {
    const parsed = parseSegmentedDateParts(nextDv, nextMv, nextYv);
    if (parsed) onCommitDate(parsed.date);
  }, [onCommitDate]);

  const dateKeyCtx = {
    disabled: false,
    dv,
    mv,
    yv,
    setDv,
    setMv,
    setYv,
    commitCompleteDate,
    dRef,
    mRef,
    yRef,
    fallbackDate: valueDate ?? placeholderDate ?? undefined,
  };

  const onDigits = (raw, maxLen, setFn, nextRef, nextDv, nextMv, nextYv) => {
    const v = raw.replace(/\D/g, "").slice(0, maxLen);
    setFn(v);
    commitCompleteDate(nextDv(v), nextMv(v), nextYv(v));
    if (v.length >= maxLen && nextRef?.current) nextRef.current.focus();
  };

  const focusFirstEmpty = useCallback(() => {
    if (!dv) dRef.current?.focus();
    else if (!mv) mRef.current?.focus();
    else if (!yv || yv.length < 4) yRef.current?.focus();
    else dRef.current?.focus();
  }, [dv, mv, yv]);

  const handleBlur = useCallback((e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    commitIfValid();
  }, [commitIfValid]);

  return (
    <div
      className={`fp-date-wrap${isPlaceholder ? " is-placeholder" : ""}`}
      onBlur={handleBlur}
      onMouseDown={(e) => {
        if (e.target.tagName !== "INPUT") { e.preventDefault(); focusFirstEmpty(); }
      }}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="fp-date-wrap__day">
        <input
          ref={dRef} type="text" inputMode="numeric" autoComplete="off"
          className="fp-date-wrap__inp" placeholder={ph.day}
          aria-label={`${ariaLabel} — day`}
          value={dv}
          onChange={(e) => onDigits(e.target.value, 2, setDv, mRef, (v) => v, () => mv, () => yv)}
          onKeyDown={(e) => dateSegmentKeyDown(e, "d", dateKeyCtx)}
        />
      </div>
      <span className="fp-date-wrap__div" aria-hidden>/</span>
      <div className="fp-date-wrap__month">
        <input
          ref={mRef} type="text" inputMode="numeric" autoComplete="off"
          className="fp-date-wrap__inp" placeholder={ph.month}
          aria-label={`${ariaLabel} — month`}
          value={mv}
          onChange={(e) => onDigits(e.target.value, 2, setMv, yRef, () => dv, (v) => v, () => yv)}
          onKeyDown={(e) => dateSegmentKeyDown(e, "m", dateKeyCtx)}
        />
      </div>
      <span className="fp-date-wrap__div" aria-hidden>/</span>
      <div className="fp-date-wrap__year">
        <input
          ref={yRef} type="text" inputMode="numeric" autoComplete="off"
          className="fp-date-wrap__inp" placeholder={ph.year}
          aria-label={`${ariaLabel} — year`}
          value={yv}
          onChange={(e) => onDigits(e.target.value, 4, setYv, null, () => dv, () => mv, (v) => v)}
          onKeyDown={(e) => dateSegmentKeyDown(e, "y", dateKeyCtx)}
        />
      </div>
    </div>
  );
}

/** HH : MM (and optional : SS) — digits only. With `embedded`, lives inside `UnitTextfield` (popover). */
function SegmentedTimeInput({
  valueHms,
  onCommit,
  ariaLabel,
  withSeconds = false,
  disabled = false,
  invalid = false,
  active = false,
  fill = false,
  embedded = false,
}) {
  const hRef = useRef(null);
  const mRef = useRef(null);
  const sRef = useRef(null);
  const canonicalHms = normalizeToHms(valueHms);
  const [interactionTouched, setInteractionTouched] = useState(false);
  const [hv, setHv] = useState(() => canonicalHms.slice(0, 2));
  const [mv, setMv] = useState(() => canonicalHms.slice(3, 5));
  const [sv, setSv] = useState(() => canonicalHms.slice(6, 8));

  /* Fresh segment strings for blur commit — React state hv/mv/sv can lag one tick behind focus jump. */
  const hvRef = useRef(hv);
  const mvRef = useRef(mv);
  const svRef = useRef(sv);

  const defaultMidnightPlaceholderTone = !interactionTouched && canonicalHms === "00:00:00";

  useEffect(() => {
    const n = normalizeToHms(valueHms);
    const nh = n.slice(0, 2);
    const nm = n.slice(3, 5);
    const ns = n.slice(6, 8);
    hvRef.current = nh;
    mvRef.current = nm;
    svRef.current = ns;
    setHv(nh);
    setMv(nm);
    setSv(ns);
  }, [valueHms]);

  const commit = useCallback(() => {
    const out = normalizeToHms(
      `${hvRef.current}:${mvRef.current}:${withSeconds ? svRef.current : "00"}`
    );
    onCommit(out);
    const nh = out.slice(0, 2);
    const nmi = out.slice(3, 5);
    const ns = out.slice(6, 8);
    hvRef.current = nh;
    mvRef.current = nmi;
    svRef.current = ns;
    setHv(nh);
    setMv(nmi);
    setSv(ns);
  }, [onCommit, withSeconds]);

  const applyTime = useCallback(
    (h, m, s) => {
      setInteractionTouched(true);
      const out = normalizeToHms(`${h}:${m}:${withSeconds ? s : "00"}`);
      onCommit(out);
      const nh = out.slice(0, 2);
      const nmi = out.slice(3, 5);
      const ns = out.slice(6, 8);
      hvRef.current = nh;
      mvRef.current = nmi;
      svRef.current = ns;
      setHv(nh);
      setMv(nmi);
      setSv(ns);
    },
    [onCommit, withSeconds]
  );

  const timeKeyCtx = { disabled, withSeconds, hv, mv, sv, applyTime, hRef, mRef, sRef };

  const onDigits = (raw, maxLen, setFn, nextRef, valRef) => {
    setInteractionTouched(true);
    const digitsOnly = raw.replace(/\D/g, "");
    const v = digitsOnly.length > maxLen ? digitsOnly.slice(-maxLen) : digitsOnly;
    valRef.current = v;
    setFn(v);
    if (v.length >= maxLen && nextRef?.current) nextRef.current.focus();
  };

  const focusFirstEmpty = () => {
    if (!hv) hRef.current?.focus();
    else if (!mv) mRef.current?.focus();
    else if (withSeconds && !sv) sRef.current?.focus();
    else hRef.current?.focus();
  };

  const segMouseDown = (e) => {
    if (disabled) return;
    if (e.target.tagName === "DIV") {
      e.preventDefault();
      focusFirstEmpty();
    }
  };

  const segClass = [
    "df-seg-time",
    embedded && fill ? "df-seg-time--embed-fill" : "",
    defaultMidnightPlaceholderTone ? "df-seg-time--default-zero" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const segInner = (
    <>
      <input
        ref={hRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="df-seg-time__inp"
        placeholder="00"
        aria-label={`${ariaLabel} — hours`}
        value={hv}
        disabled={disabled}
        onChange={(e) => onDigits(e.target.value, 2, setHv, mRef, hvRef)}
        onKeyDown={(e) => timeSegmentKeyDown(e, "h", timeKeyCtx)}
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
        placeholder="00"
        aria-label={`${ariaLabel} — minutes`}
        value={mv}
        disabled={disabled}
        onChange={(e) => onDigits(e.target.value, 2, setMv, withSeconds ? sRef : null, mvRef)}
        onKeyDown={(e) => timeSegmentKeyDown(e, "m", timeKeyCtx)}
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
            placeholder="00"
            aria-label={`${ariaLabel} — seconds`}
            value={sv}
            disabled={disabled}
            onChange={(e) => onDigits(e.target.value, 2, setSv, null, svRef)}
            onKeyDown={(e) => timeSegmentKeyDown(e, "s", timeKeyCtx)}
            onBlur={commit}
          />
        </>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <div
        className={segClass}
        role="group"
        aria-label={ariaLabel}
        aria-invalid={invalid ? true : undefined}
        onMouseDown={segMouseDown}
      >
        {segInner}
      </div>
    );
  }

  return (
    <div
      className={[
        "df-time-field",
        fill ? "df-time-field--fill" : "",
        disabled ? "df-time-field--disabled" : "",
        invalid ? "df-time-field--error" : "",
        active ? "df-time-field--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="df-seg-time"
        role="group"
        aria-label={ariaLabel}
        aria-invalid={invalid ? true : undefined}
        onMouseDown={segMouseDown}
      >
        {segInner}
      </div>
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

function getAllTimeDateRange(today = startOfDay(new Date())) {
  const to = today;
  const from = startOfDay(addDays(to, -ALL_TIME_LOOKBACK_DAYS));
  return { from, to };
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
      return getAllTimeDateRange(today);
    default:
      return { from: null, to: null };
  }
}

function DateFilterPopover({
  anchorEl,
  field,
  values,
  mode,
  onModeChange,
  onLiveDraft,
  onApply,
  onReset,
  onClose,
}) {
  const popoverRef = useRef(null);
  const fromParsed = parseDateTimeValue(values[field.fromId]);
  const toParsed = parseDateTimeValue(values[field.toId]);
  const initialFrom = fromParsed.date;
  const initialTo = toParsed.date;
  const initialTimeFrom = normalizeToHms(fromParsed.timeHms);
  const initialTimeTo = normalizeToHms(toParsed.timeHms);

  const [draftsByMode, setDraftsByMode] = useState(() => ({
    Single: createEmptyTabDraft(initialFrom, initialTo, initialTimeFrom, initialTimeTo),
    Range: createEmptyTabDraft(initialFrom, initialTo, initialTimeFrom, initialTimeTo),
    After: createEmptyTabDraft(initialFrom, null, initialTimeFrom, "00:00"),
    Before: createEmptyTabDraft(null, initialTo, "00:00", initialTimeTo),
  }));
  const [positioned, setPositioned] = useState(false);

  const draft = draftsByMode[mode];
  const { fromDate, toDate, visibleMonth, selectedPreset, timeFrom, timeTo } = draft;

  const handleModeChange = useCallback(
    (nextMode) => {
      onModeChange?.(nextMode);
      setDraftsByMode((prev) => {
        const d = prev[nextMode];
        queueMicrotask(() => {
          const { fromValue, toValue } = packDateDraftForFilter(nextMode, d);
          onLiveDraft?.(fromValue, toValue);
        });
        return prev;
      });
    },
    [onModeChange, onLiveDraft]
  );

  /* Sync drafts from filter values when external (e.g. reset) changes them.
     Skip full reset when serialized draft already matches `values` — otherwise we
     remount-style replace state on every onLiveDraft echo and break segmented inputs. */
  useEffect(() => {
    const fromV = values[field.fromId] ?? "";
    const toV = values[field.toId] ?? "";
    setDraftsByMode((prev) => {
      const packed = packDateDraftForFilter(mode, prev[mode]);
      const fromOk = (packed.fromValue ?? "") === fromV;
      const toOk = (packed.toValue ?? "") === toV;
      if (fromOk && toOk) return prev;

      const fp = parseDateTimeValue(fromV);
      const tp = parseDateTimeValue(toV);
      const iFrom = fp.date;
      const iTo = tp.date;
      const iTf = normalizeToHms(fp.timeHms);
      const iTt = normalizeToHms(tp.timeHms);
      return {
        Single: createEmptyTabDraft(iFrom, iTo, iTf, iTt),
        Range: createEmptyTabDraft(iFrom, iTo, iTf, iTt),
        After: createEmptyTabDraft(iFrom, null, iTf, "00:00"),
        Before: createEmptyTabDraft(null, iTo, "00:00", iTt),
      };
    });
  }, [field.fromId, field.toId, values[field.fromId], values[field.toId], mode]);

  const updateDraft = useCallback(
    (patch) => {
      setDraftsByMode((prev) => {
        const merged = { ...prev[mode], ...patch };
        const nextSlice = constrainDraftSlice(mode, merged);
        const next = { ...prev, [mode]: nextSlice };
        queueMicrotask(() => {
          const { fromValue, toValue } = packDateDraftForFilter(mode, nextSlice);
          onLiveDraft?.(fromValue, toValue);
        });
        return next;
      });
    },
    [mode, onLiveDraft]
  );

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

      let left = ar.left;
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
      const forceRange = PRESETS_THAT_FORCE_RANGE.has(presetId);
      const forceSingle = PRESETS_THAT_FORCE_SINGLE.has(presetId);
      if (forceRange) {
        onModeChange?.("Range");
      } else if (forceSingle) {
        onModeChange?.("Single");
      }

      setDraftsByMode((prev) => {
        const activeMode = forceRange ? "Range" : forceSingle ? "Single" : mode;
        const cur = prev[activeMode];
        const presetDates = applyDatePreset(presetId);
        let nf = presetDates.from;
        let nt = presetDates.to;
        if (!forceRange && activeMode === "Single") {
          const anchor = nt ?? nf;
          nf = anchor;
          nt = anchor;
        }
        const today = startOfDay(new Date());
        let vm;
        if (presetId === "all-time") {
          /* Anchor the pair on the month that contains today — not on range `from`. */
          vm = new Date(today.getFullYear(), today.getMonth(), 1);
        } else {
          const base = nf || nt || today;
          vm = new Date(base.getFullYear(), base.getMonth(), 1);
        }
        const updatedSliceRaw = {
          ...cur,
          fromDate: nf,
          toDate: nt,
          visibleMonth: vm,
          selectedPreset: presetId,
        };
        const updatedSlice = constrainDraftSlice(activeMode, updatedSliceRaw);
        const out = {
          ...prev,
          [activeMode]: updatedSlice,
        };
        queueMicrotask(() => {
          const { fromValue, toValue } = packDateDraftForFilter(activeMode, updatedSlice);
          onLiveDraft?.(fromValue, toValue);
        });
        return out;
      });
    },
    [mode, onModeChange, onLiveDraft]
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
        const updatedSlice = constrainDraftSlice(mode, {
          ...cur,
          fromDate: nextFrom,
          toDate: nextTo,
          selectedPreset: null,
        });
        const out = {
          ...prev,
          [mode]: updatedSlice,
        };
        queueMicrotask(() => {
          const { fromValue, toValue } = packDateDraftForFilter(mode, updatedSlice);
          onLiveDraft?.(fromValue, toValue);
        });
        return out;
      });
    },
    [mode, onLiveDraft]
  );

  const renderMonth = (monthDate, { showPrevNav = true, showNextNav = true } = {}) => {
    const days = buildMonthDays(monthDate);
    const todayCell = startOfDay(new Date());
    const goPrevMonth = () =>
      setDraftsByMode((prev) => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          visibleMonth: addMonths(prev[mode].visibleMonth, -1),
        },
      }));
    const goNextMonth = () =>
      setDraftsByMode((prev) => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          visibleMonth: addMonths(prev[mode].visibleMonth, 1),
        },
      }));
    return (
      <div className="df-month">
        <div className="df-month__header">
          {showPrevNav ? (
            <button type="button" className="df-month__nav" aria-label="Previous month" onClick={goPrevMonth}>
              <SideIcon icon={ChevronLeftGlyph} />
            </button>
          ) : (
            <span className="df-month__nav-spacer" aria-hidden />
          )}
          <span className="df-month__title">{monthLabel(monthDate)}</span>
          {showNextNav ? (
            <button type="button" className="df-month__nav df-month__nav--next" aria-label="Next month" onClick={goNextMonth}>
              <SideIcon icon={ChevronLeftGlyph} />
            </button>
          ) : (
            <span className="df-month__nav-spacer" aria-hidden />
          )}
        </div>
        <div className="df-days">
          {days.map((day) => {
            const outside = day.getMonth() !== monthDate.getMonth();
            const sodDay = startOfDay(day);
            const sodNow = startOfDay(new Date());
            const disallowFutureDates = ["Single", "Range", "Before", "After"].includes(mode);
            const isBeyondNow = disallowFutureDates && !outside && sodDay > sodNow;

            const selected = sameDay(day, fromDate) || sameDay(day, toDate);

            let inRange = false;
            if (mode === "Range" && fromDate && toDate) {
              inRange =
                sodDay.getTime() > startOfDay(fromDate).getTime() &&
                sodDay.getTime() < startOfDay(toDate).getTime();
            }

            const zoneAvailBefore =
              mode === "Before" &&
              Boolean(toDate) &&
              !outside &&
              sodDay.getTime() < startOfDay(toDate).getTime();

            const zoneAvailAfter =
              mode === "After" &&
              Boolean(fromDate) &&
              !outside &&
              sodDay.getTime() > startOfDay(fromDate).getTime() &&
              sodDay.getTime() <= sodNow.getTime();

            const isToday = sameDay(day, todayCell);
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isBeyondNow}
                aria-disabled={isBeyondNow ? true : undefined}
                aria-current={isToday ? "date" : undefined}
                className={[
                  "df-day",
                  outside ? "df-day--outside" : "",
                  zoneAvailBefore ? "df-day--zone-before" : "",
                  zoneAvailAfter ? "df-day--zone-after" : "",
                  selected ? "df-day--selected" : "",
                  inRange ? "df-day--range" : "",
                  isToday ? "df-day--today" : "",
                  isBeyondNow ? "df-day--beyond-now" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleDayClick(sodDay)}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const placeholderToday = startOfDay(new Date());
  const placeholderTomorrow = addDays(placeholderToday, 1);

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
                    onClick={() => handleModeChange(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="df-calendar__stack">
              <div className="df-months">
                {renderMonth(visibleMonth, { showPrevNav: true, showNextNav: false })}
                {renderMonth(addMonths(visibleMonth, 1), { showPrevNav: false, showNextNav: true })}
              </div>

            {mode === "Single" ? (
              <div className="df-date-fields df-date-fields--single">
                <UnitTextfield size="sm" className="df-popover-textfield df-popover-textfield--date-fixed" label="Date">
                  <CalendarGlyph className="icon" />
                  <SegmentedDateInput
                    embedded
                    valueDate={fromDate || toDate}
                    placeholderDate={placeholderToday}
                    onCommitDate={(d) =>
                      d ? updateDraft({ fromDate: d, toDate: d }) : updateDraft({ fromDate: null, toDate: null })
                    }
                    ariaLabel={`${field.label} — date`}
                  />
                </UnitTextfield>
                <div className="df-single-time-group">
                  <UnitTextfield size="sm" className="df-popover-textfield" label="Time">
                    <ClockGlyph className="icon" />
                    <SegmentedTimeInput
                      embedded
                      fill
                      withSeconds
                      valueHms={timeFrom}
                      onCommit={(t) => updateDraft({ timeFrom: t })}
                      ariaLabel={`${field.label} — from time`}
                    />
                  </UnitTextfield>
                  <UnitTextfield
                    size="sm"
                    className="df-popover-textfield"
                    label={<PopoverTextfieldEmptyLabel />}
                    rootProps={{ "aria-label": `${field.label} — to time` }}
                  >
                    <ClockGlyph className="icon" />
                    <SegmentedTimeInput
                      embedded
                      fill
                      withSeconds
                      valueHms={timeTo}
                      onCommit={(t) => updateDraft({ timeTo: t })}
                      ariaLabel={`${field.label} — to time`}
                    />
                  </UnitTextfield>
                </div>
              </div>
            ) : mode === "Range" ? (
              <div className="df-date-fields df-date-fields--range">
                <div className="df-date-range-column">
                  <div className="df-date-range-row">
                    <UnitTextfield size="sm" className="df-popover-textfield df-popover-textfield--range-date" label="From">
                      <CalendarGlyph className="icon" />
                      <SegmentedDateInput
                        embedded
                        valueDate={fromDate}
                        placeholderDate={placeholderToday}
                        onCommitDate={(d) => updateDraft({ fromDate: d })}
                        ariaLabel={`${field.label} — from date`}
                      />
                    </UnitTextfield>
                    <UnitTextfield
                      size="sm"
                      className="df-popover-textfield df-popover-textfield--range-time"
                      label={<PopoverTextfieldEmptyLabel />}
                      rootProps={{ "aria-label": `${field.label} — from time` }}
                    >
                      <ClockGlyph className="icon" />
                      <SegmentedTimeInput
                        embedded
                        fill
                        withSeconds={false}
                        valueHms={timeFrom}
                        onCommit={(t) => updateDraft({ timeFrom: t })}
                        ariaLabel={`${field.label} — from time`}
                      />
                    </UnitTextfield>
                  </div>
                </div>
                <div className="df-date-range-column">
                  <div className="df-date-range-row">
                    <UnitTextfield size="sm" className="df-popover-textfield df-popover-textfield--range-date" label="To">
                      <CalendarGlyph className="icon" />
                      <SegmentedDateInput
                        embedded
                        valueDate={toDate}
                        placeholderDate={placeholderTomorrow}
                        onCommitDate={(d) => updateDraft({ toDate: d })}
                        ariaLabel={`${field.label} — to date`}
                      />
                    </UnitTextfield>
                    <UnitTextfield
                      size="sm"
                      className="df-popover-textfield df-popover-textfield--range-time"
                      label={<PopoverTextfieldEmptyLabel />}
                      rootProps={{ "aria-label": `${field.label} — to time` }}
                    >
                      <ClockGlyph className="icon" />
                      <SegmentedTimeInput
                        embedded
                        fill
                        withSeconds={false}
                        valueHms={timeTo}
                        onCommit={(t) => updateDraft({ timeTo: t })}
                        ariaLabel={`${field.label} — to time`}
                      />
                    </UnitTextfield>
                  </div>
                </div>
              </div>
            ) : mode === "After" ? (
              <div className="df-date-fields df-date-fields--single">
                <UnitTextfield size="sm" className="df-popover-textfield df-popover-textfield--date-fixed" label="Date">
                  <CalendarGlyph className="icon" />
                  <SegmentedDateInput
                    embedded
                    valueDate={fromDate}
                    placeholderDate={placeholderToday}
                    onCommitDate={(d) => updateDraft({ fromDate: d })}
                    ariaLabel={`${field.label} — after date`}
                  />
                </UnitTextfield>
                <UnitTextfield size="sm" className="df-popover-textfield df-popover-textfield--pair-datetime-time" label="Time">
                  <ClockGlyph className="icon" />
                  <SegmentedTimeInput
                    embedded
                    fill
                    withSeconds
                    valueHms={timeFrom}
                    onCommit={(t) => updateDraft({ timeFrom: t })}
                    ariaLabel={`${field.label} — after time`}
                  />
                </UnitTextfield>
              </div>
            ) : (
              <div className="df-date-fields df-date-fields--single">
                <UnitTextfield size="sm" className="df-popover-textfield df-popover-textfield--date-fixed" label="Date">
                  <CalendarGlyph className="icon" />
                  <SegmentedDateInput
                    embedded
                    valueDate={toDate}
                    placeholderDate={placeholderToday}
                    onCommitDate={(d) => updateDraft({ toDate: d })}
                    ariaLabel={`${field.label} — before date`}
                  />
                </UnitTextfield>
                <UnitTextfield size="sm" className="df-popover-textfield df-popover-textfield--pair-datetime-time" label="Time">
                  <ClockGlyph className="icon" />
                  <SegmentedTimeInput
                    embedded
                    fill
                    withSeconds
                    valueHms={timeTo}
                    onCommit={(t) => updateDraft({ timeTo: t })}
                    ariaLabel={`${field.label} — before time`}
                  />
                </UnitTextfield>
              </div>
            )}
            </div>
          </div>

          <div className="df-footer">
            <button type="button" className="cf-footer__btn cf-footer__btn--secondary" onClick={onReset}>
              Reset
            </button>
            <button
              type="button"
              className="cf-footer__btn cf-footer__btn--save"
              onClick={() => {
                const d = draftsByMode[mode];
                const { fromValue, toValue } = packDateDraftForFilter(mode, d);
                onApply(fromValue, toValue, mode);
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

  /* Close on click outside */
  useEffect(() => {
    const handlePointerDown = (e) => {
      const pop = popoverRef.current;
      if (!pop) return;
      if (pop.contains(e.target)) return;
      if (anchorRef?.current?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [onClose, anchorRef]);

  /* Click outside → close (ignore clicks on the anchor button — it handles its own toggle) */
  useEffect(() => {
    const handler = (e) => {
      if (anchorRef?.current?.contains(e.target)) return;
      /* Main filters panel stays interactive while Customize is open — do not close on those clicks */
      if (filtersPanelRef?.current?.contains(e.target)) return;
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef, filtersPanelRef]);

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

      Object.assign(layer.style, {
        position: "fixed",
        left: "-9999px",
        top: "0",
        width: `${rect.width}px`,
        zIndex: "10050",
        pointerEvents: "none",
        boxSizing: "border-box",
      });
      document.body.appendChild(layer);
      void layer.offsetHeight;
      dragLayerRef.current = layer;

      try {
        e.dataTransfer.setDragImage(layer, ox, oy);
      } catch {
        const hide = new Image();
        hide.src =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        try {
          e.dataTransfer.setDragImage(hide, 0, 0);
        } catch {
          /* ignore */
        }
      }

      dragMoveCleanupRef.current = null;

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
                        <TextfieldClearIcon />
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
                  <UnitTextfield
                    className={["filters-search-unit", "cf-filters-search"].join(" ")}
                    clearable
                    showClear={Boolean(searchQuery.trim())}
                    onClear={() => setSearchQuery("")}
                    clearAriaLabel="Clear search filter"
                  >
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
                  </UnitTextfield>
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
                <UnitTextfield
                  className={["filters-search-unit", "cf-footer__preset-field"].join(" ")}
                  error={Boolean(presetNameError)}
                  helper={
                    presetNameError ? (
                      <span className="unit-textfield__helper" role="alert">
                        {presetNameError}
                      </span>
                    ) : null
                  }
                  clearable
                  showClear={Boolean(presetName.trim())}
                  onClear={() => {
                    setPresetNameError(null);
                    setPresetName("");
                  }}
                  clearAriaLabel="Clear preset name"
                >
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
                </UnitTextfield>
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

/** Draft value present on the filter row (toolbar panel); drives clear affordance (Figma Main Field). */
function filterFieldDraftHasValue(field, filterDraftValues) {
  if (field.kind === "dateRange") {
    const from = (filterDraftValues[field.fromId] ?? "").trim();
    const to = (filterDraftValues[field.toId] ?? "").trim();
    return Boolean(from || to);
  }
  return Boolean((filterDraftValues[field.id] ?? "").trim());
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
            placeholder="00 / 00 / 0000"
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

  const [filterDateModes, setFilterDateModes] = useState({});
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

  const applyDatePopover = useCallback((field, fromValue, toValue, mode) => {
    setFilterFieldErrors((prev) => {
      if (!prev[field.fromId] && !prev[field.toId]) return prev;
      const { [field.fromId]: _from, [field.toId]: _to, ...rest } = prev;
      return rest;
    });
    setFilterDateModes((prev) => ({ ...prev, [field.id]: mode }));
    setFilterDraftValues((prev) => ({
      ...prev,
      [field.fromId]: fromValue,
      [field.toId]: toValue,
    }));
    setDatePopover(null);
  }, []);

  const resetDatePopoverField = useCallback((field) => {
    setFilterFieldErrors((prev) => {
      if (!prev[field.fromId] && !prev[field.toId]) return prev;
      const { [field.fromId]: _from, [field.toId]: _to, ...rest } = prev;
      return rest;
    });
    /* Keep current date mode tab (Single / Range / …); only clear field values. */
    setFilterDraftValues((prev) => ({
      ...prev,
      [field.fromId]: "",
      [field.toId]: "",
    }));
  }, []);

  const clearFilterFieldDraft = useCallback(
    (field) => {
      if (field.kind === "dateRange") resetDatePopoverField(field);
      else setFilterDraft(field.id, "");
    },
    [resetDatePopoverField, setFilterDraft]
  );

  const syncDatePopoverDraft = useCallback((field, fromValue, toValue) => {
    setFilterFieldErrors((prev) => {
      if (!prev[field.fromId] && !prev[field.toId]) return prev;
      const { [field.fromId]: _from, [field.toId]: _to, ...rest } = prev;
      return rest;
    });
    setFilterDraftValues((prev) => {
      if ((prev[field.fromId] ?? "") === fromValue && (prev[field.toId] ?? "") === toValue) return prev;
      return { ...prev, [field.fromId]: fromValue, [field.toId]: toValue };
    });
  }, []);

  const handleDatePopoverLiveDraft = useCallback(
    (fromValue, toValue) => {
      if (!datePopover) return;
      syncDatePopoverDraft(datePopover.field, fromValue, toValue);
    },
    [datePopover, syncDatePopoverDraft]
  );

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
    setFilterDateModes({});
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
      if (!triggerEl) return;
      const triggerRect = triggerEl.getBoundingClientRect();
      /** Prefer left edge aligned with anchor; viewport clamp after measure — useLayoutEffect. */
      const left = triggerRect.left;
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
    if (!navPopover || !navPopoverRef.current) return;
    const el = navPopoverRef.current;
    const margin = 8;
    const pw = el.offsetWidth;
    const ph = el.offsetHeight;
    let left = navPopover.left;
    if (left + pw > window.innerWidth - margin) left = window.innerWidth - pw - margin;
    if (left < margin) left = margin;
    const updates = {};
    if (Math.round(left) !== Math.round(navPopover.left)) updates.left = left;

    if (navPopover.kind === "menu") {
      let top = navPopover.top;
      if (top + ph > window.innerHeight - margin) top = window.innerHeight - ph - margin;
      top = Math.max(margin, top);
      if (Math.abs(top - navPopover.top) > 1) updates.top = top;
    } else if (navPopover.kind === "tooltip") {
      const half = ph / 2;
      let centerY = navPopover.centerY;
      if (centerY + half > window.innerHeight - margin) centerY = window.innerHeight - margin - half;
      if (centerY - half < margin) centerY = margin + half;
      if (Math.abs(centerY - navPopover.centerY) > 1) updates.centerY = centerY;
    }

    if (Object.keys(updates).length) {
      setNavPopover((p) => (p ? { ...p, ...updates } : p));
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
                <div className="account-avatar">A</div>
                <div className="account-name-wrapper">
                  <span className="account-name">Account name</span>
                </div>
              </div>
              <div className="notification-btn">
                <span className="notification-badge">4</span>
              </div>
            </div>

            <div className="search-wrapper">
              <div className="search-bar">
                <SideIcon icon={SearchGlyph} />
                <input
                  className="search-input"
                  type="search"
                  placeholder="Find category"
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

          <div className="bottom-wrapper">
            <div className="platform-section">
              <div
                className="category-item"
                role="button"
                tabIndex={0}
              >
                <div className="cat-icon-wrap">
                  <SideIcon icon={DevelopersGlyph} />
                </div>
                <div className="cat-label-row">
                  <span className="cat-label">Devtools</span>
                  <SideIcon icon={ChevronDownGlyph} className="cat-chevron" />
                </div>
              </div>
            </div>

            <div className="footer-row">
              <div className="user-wrapper">
                <div className="user-avatar">
                  <img src={avtrImg} alt="" decoding="async" />
                </div>
                <div className="user-credentials">
                  <span className="user-name">Jane Doe</span>
                  <span className="user-email">jane.doe@solidgate.com</span>
                </div>
              </div>
              <div className="help-btn">
                <SideIcon icon={HelpCircleGlyph} size={18} />
              </div>
            </div>
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
                  <UnitTextfield
                    className="filters-search-unit"
                    error={Boolean(toolbarSearchError)}
                    helper={
                      toolbarSearchError ? (
                        <span className="unit-textfield__helper" role="alert">
                          {toolbarSearchError}
                        </span>
                      ) : null
                    }
                    clearable
                    showClear={Boolean(filtersSearch.trim())}
                    onClear={() => {
                      setToolbarSearchError(null);
                      setFiltersSearch("");
                    }}
                    clearAriaLabel="Clear search"
                  >
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
                  </UnitTextfield>
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
                      const dateMode = isDateRange ? (filterDateModes[f.id] || "Single") : null;
                      return (
                        <div key={f.id} className="filters-field">
                          <UnitTextfield
                            rootProps={{
                              "aria-haspopup": isDateRange ? "dialog" : undefined,
                              "aria-expanded": isDateRange ? datePopover?.field.id === f.id : undefined,
                              onClick: (e) => {
                                if (!isDateRange || disabledField) return;
                                if (e.target.closest("input")) return;
                                if (e.target.closest(".unit-textfield__clear")) return;
                                openDatePopover(f, e.currentTarget);
                              },
                            }}
                            disabled={disabledField}
                            error={Boolean(err)}
                            active={datePopover?.field.id === f.id}
                            label={f.label}
                            fieldClassName={f.kind === "amount" ? "unit-textfield__field--split" : undefined}
                            helper={
                              err ? (
                                <span className="unit-textfield__helper" role="alert">
                                  {err}
                                </span>
                              ) : null
                            }
                            clearable={!disabledField}
                            showClear={filterFieldDraftHasValue(f, filterDraftValues)}
                            onClear={() => clearFilterFieldDraft(f)}
                            clearAriaLabel={`Clear ${f.label}`}
                            stopClearPointerPropagation
                          >
                            {isDateRange ? (
                              <>
                                <CalendarGlyph className="icon" />
                                {(() => {
                                  const mode = dateMode;
                                  const fromDate = parseDateValue(filterDraftValues[f.fromId]);
                                  const toDate = parseDateValue(filterDraftValues[f.toId]);
                                  const placeholderToday = startOfDay(new Date());
                                  const placeholderTomorrow = addDays(placeholderToday, 1);
                                  const commitFrom = (d) => {
                                    const prev = parseDateTimeValue(filterDraftValues[f.fromId]);
                                    setFilterDraft(f.fromId, d ? formatDateTimeForFilter(d, prev.timeHms) : "");
                                  };
                                  const commitTo = (d) => {
                                    const prev = parseDateTimeValue(filterDraftValues[f.toId]);
                                    setFilterDraft(f.toId, d ? formatDateTimeForFilter(d, prev.timeHms) : "");
                                  };
                                  if (mode === "Single") {
                                    return (
                                      <FilterDateSegment
                                        valueDate={fromDate}
                                        placeholderDate={placeholderToday}
                                        onCommitDate={(d) => {
                                          commitFrom(d);
                                          commitTo(d);
                                        }}
                                        ariaLabel={f.label}
                                      />
                                    );
                                  }
                                  if (mode === "After") {
                                    return (
                                      <div className="fp-dates-group">
                                        <FilterDateSignAfter />
                                        <FilterDateSegment
                                          valueDate={fromDate}
                                          placeholderDate={placeholderToday}
                                          onCommitDate={commitFrom}
                                          ariaLabel={`${f.label} after`}
                                        />
                                      </div>
                                    );
                                  }
                                  if (mode === "Before") {
                                    return (
                                      <div className="fp-dates-group">
                                        <FilterDateSignBefore />
                                        <FilterDateSegment
                                          valueDate={toDate}
                                          placeholderDate={placeholderToday}
                                          onCommitDate={commitTo}
                                          ariaLabel={`${f.label} before`}
                                        />
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="fp-dates-group">
                                      <FilterDateSegment
                                        valueDate={fromDate}
                                        placeholderDate={placeholderToday}
                                        onCommitDate={commitFrom}
                                        ariaLabel={`${f.label} from`}
                                      />
                                      <FilterDateSignArrow />
                                      <FilterDateSegment
                                        valueDate={toDate}
                                        placeholderDate={placeholderTomorrow}
                                        onCommitDate={commitTo}
                                        ariaLabel={`${f.label} to`}
                                      />
                                    </div>
                                  );
                                })()}
                              </>
                            ) : (
                              renderFilterInput(f, {
                                value: filterDraftValues[f.id] ?? "",
                                onChange: (e) => setFilterDraft(f.id, e.target.value),
                                disabled: disabledField,
                                invalid: Boolean(err),
                              })
                            )}
                          </UnitTextfield>
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
          mode={filterDateModes[datePopover.field.id] || "Single"}
          onModeChange={(mode) =>
            setFilterDateModes((prev) => ({ ...prev, [datePopover.field.id]: mode }))
          }
          onLiveDraft={handleDatePopoverLiveDraft}
          onApply={(fromValue, toValue, mode) => applyDatePopover(datePopover.field, fromValue, toValue, mode)}
          onReset={() => resetDatePopoverField(datePopover.field)}
          onClose={() => setDatePopover(null)}
        />
      )}
    </div>
  );
}
