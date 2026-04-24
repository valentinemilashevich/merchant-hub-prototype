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

import {
  NAV_SECTIONS_V2,
  SKIP_RECENT_IDS,
  buildSearchIndex,
  findParentGroupId,
  getMetaForId,
  isValidNavId,
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

/* ─── Toggle switch (animates before firing onChange) ─── */
const TOGGLE_ANIM_MS = 220;

function ToggleSwitch({ checked, onChange }) {
  const [animating, setAnimating] = useState(null); // "on" | "off" | null
  const timerRef = useRef(null);

  const handleClick = useCallback(() => {
    if (timerRef.current) return;
    const direction = checked ? "off" : "on";
    setAnimating(direction);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setAnimating(null);
      onChange();
    }, TOGGLE_ANIM_MS);
  }, [checked, onChange]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  /* While animating, show the TARGET visual state; otherwise show checked */
  const visual = animating ? (animating === "on") : checked;
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

  const groupedAvailable = useMemo(() => {
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
  }, [filteredAvailable]);

  return (
    <div className={`cf-popover${positioned ? " cf-popover--visible" : ""}`} ref={popoverRef}>
      <div className="cf-popover__main">
        {/* ── Left: Presets + divider (full modal height) ── */}
        <div className="cf-presets">
          <div className="cf-presets-inner">
            {/* Default presets */}
            <div className="cf-preset-group">
              <div className="cf-preset-heading">
                <span className="cf-preset-heading__text">Presets</span>
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
                  <div className="cf-filter-section">
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
                    if (filtersExpanded) setCustomizeOpen(false);
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
                      const dateField = { kind: "date" };
                      return (
                        <div
                          key={f.id}
                          className={["filters-field", isDateRange ? "filters-field--date-range" : ""]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <div
                            className={[
                              "unit-textfield",
                              "unit-textfield--sm",
                              err ? "unit-textfield--error" : "",
                              disabledField ? "unit-textfield--disabled" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <div className="unit-textfield__label-wrapper">
                              <div className="unit-textfield__label">{f.label}</div>
                            </div>
                            <div className="unit-textfield__outline">
                              {isDateRange ? (
                                <div className="filters-date-range-stack">
                                  <div className="filters-date-range-line">
                                    <span className="filters-date-range-hint">From</span>
                                    <div className="unit-textfield__field">
                                      {renderFilterInput(
                                        { ...dateField, label: `${f.label}, from` },
                                        {
                                          value: filterDraftValues[f.fromId] ?? "",
                                          onChange: (e) => setFilterDraft(f.fromId, e.target.value),
                                          disabled: disabledField,
                                          invalid: Boolean(filterFieldErrors[f.fromId]),
                                        }
                                      )}
                                    </div>
                                  </div>
                                  <div className="filters-date-range-line">
                                    <span className="filters-date-range-hint">To</span>
                                    <div className="unit-textfield__field">
                                      {renderFilterInput(
                                        { ...dateField, label: `${f.label}, to` },
                                        {
                                          value: filterDraftValues[f.toId] ?? "",
                                          onChange: (e) => setFilterDraft(f.toId, e.target.value),
                                          disabled: disabledField,
                                          invalid: Boolean(filterFieldErrors[f.toId]),
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={
                                    f.kind === "amount"
                                      ? "unit-textfield__field unit-textfield__field--split"
                                      : "unit-textfield__field"
                                  }
                                >
                                  {renderFilterInput(f, {
                                    value: filterDraftValues[f.id] ?? "",
                                    onChange: (e) => setFilterDraft(f.id, e.target.value),
                                    disabled: disabledField,
                                    invalid: Boolean(err),
                                  })}
                                </div>
                              )}
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
                    onClick={() => setCustomizeOpen((v) => !v)}
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
    </div>
  );
}
