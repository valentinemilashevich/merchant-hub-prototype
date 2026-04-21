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
  NAV_SECTIONS_V1,
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

const FILTER_FIELDS = [
  { id: "order-id", label: "Order ID", kind: "text" },
  { id: "customer-email", label: "Customer email", kind: "text" },
  { id: "channel", label: "Channel", kind: "select" },
  { id: "payment-type", label: "Payment type", kind: "select" },
];

/* ─── Customize Filters: full filter catalogue ─── */
const ALL_FILTERS = [
  { id: "order-id", label: "Order ID", description: "by order identifier" },
  { id: "email", label: "Email", description: "by customer email adress" },
  { id: "created", label: "Created", description: "Transaction creation date" },
  { id: "updated", label: "Updated", description: "Transaction update date" },
  { id: "channel", label: "Channel", description: "Transaction date has been updated." },
  { id: "amount", label: "Amount", description: "Amount in USD, EUR, GBP or other" },
  { id: "currency", label: "Currency", description: "USD, EUR, GBP and more" },
  { id: "customer-id", label: "Customer ID", description: "By customer identifier" },
  { id: "status", label: "Status", description: "Actual transaction status" },
  { id: "refund", label: "Refund", description: "Refund status" },
  { id: "cardholder-name", label: "Cardholder name", description: "First name, Second name" },
  { id: "descriptor", label: "Descriptor", description: "Statement descriptor text" },
  { id: "payment-type", label: "Payment type", description: "Card, APM, or other method" },
  { id: "card-brand", label: "Card brand", description: "Visa, Mastercard, Amex and more" },
  { id: "card-number", label: "Card number", description: "Last 4 digits or full number" },
  { id: "country", label: "Country", description: "Customer or card country" },
  { id: "3ds-status", label: "3DS status", description: "3D Secure verification result" },
  { id: "error-code", label: "Error code", description: "Decline or error reason code" },
];

const DEFAULT_ADDED_IDS = ["order-id", "email", "created", "updated"];

const DEFAULT_PRESETS = [
  {
    id: "finances",
    label: "Finances",
    filters: ["order-id", "amount", "currency", "status", "created", "updated"],
  },
  {
    id: "data-analytics",
    label: "Data analytics",
    filters: ["order-id", "channel", "status", "country", "card-brand", "created"],
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
  {
    id: "development",
    label: "Developement",
    filters: ["order-id", "error-code", "3ds-status", "status", "channel"],
  },
];

/* ─── Drag handle icon (6-dot grip) ─── */
function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="6" cy="4" r="1" fill="#8F8F8F" />
      <circle cx="10" cy="4" r="1" fill="#8F8F8F" />
      <circle cx="6" cy="8" r="1" fill="#8F8F8F" />
      <circle cx="10" cy="8" r="1" fill="#8F8F8F" />
      <circle cx="6" cy="12" r="1" fill="#8F8F8F" />
      <circle cx="10" cy="12" r="1" fill="#8F8F8F" />
    </svg>
  );
}

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
function CustomizeFiltersPopover({ anchorRef, onClose, onSave }) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [addedIds, setAddedIds] = useState(() => [...DEFAULT_ADDED_IDS]);
  const [personalPresets, setPersonalPresets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [availableSort, setAvailableSort] = useState("asc"); // "asc" | "desc"
  const [dragOverId, setDragOverId] = useState(null);
  const dragItemId = useRef(null);
  const popoverRef = useRef(null);
  const presetInputRef = useRef(null);
  const [positioned, setPositioned] = useState(false);

  /* Position popover anchored to the Customize button — runs after first paint */
  useLayoutEffect(() => {
    const anchor = anchorRef?.current;
    const pop = popoverRef.current;
    if (!anchor || !pop) return;

    const reposition = () => {
      const ar = anchor.getBoundingClientRect();
      const pw = pop.offsetWidth;
      const ph = pop.offsetHeight;

      /* Try to place bottom-left of popover at top-left of button */
      let top = ar.top - ph - 8;
      let left = ar.left;

      /* If it overflows the top of the viewport, place below */
      if (top < 8) top = ar.bottom + 8;

      /* Clamp horizontal */
      if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
      if (left < 8) left = 8;

      /* Clamp vertical to viewport */
      if (top + ph > window.innerHeight - 8) top = window.innerHeight - ph - 8;
      if (top < 8) top = 8;

      pop.style.top = top + "px";
      pop.style.left = left + "px";
      setPositioned(true);
    };

    /* Use rAF to ensure layout is computed */
    const id = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(id);
  }, [anchorRef]);

  /* Click outside → close */
  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  /* Escape key → close */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Select a preset → load its filters */
  const handleSelectPreset = useCallback((preset) => {
    setSelectedPreset(preset.id);
    setAddedIds([...preset.filters]);
  }, []);

  /* Toggle a filter on/off */
  const toggleFilter = useCallback((filterId) => {
    setAddedIds((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
    setSelectedPreset(null);
  }, []);

  /* Clear all added */
  const clearAll = useCallback(() => {
    setAddedIds([]);
    setSelectedPreset(null);
  }, []);

  /* Select all available */
  const selectAll = useCallback(() => {
    setAddedIds(ALL_FILTERS.map((f) => f.id));
    setSelectedPreset(null);
  }, []);

  /* Delete personal preset */
  const deletePersonalPreset = useCallback((presetId) => {
    setPersonalPresets((prev) => prev.filter((p) => p.id !== presetId));
    setSelectedPreset((cur) => (cur === presetId ? null : cur));
  }, []);

  /* Save as preset */
  const handleSavePreset = useCallback(() => {
    if (!savingPreset) {
      setSavingPreset(true);
      setTimeout(() => presetInputRef.current?.focus(), 0);
      return;
    }
    const name = presetName.trim();
    if (!name) return;
    const newPreset = {
      id: `personal-${Date.now()}`,
      label: name,
      filters: [...addedIds],
    };
    setPersonalPresets((prev) => [...prev, newPreset]);
    setSelectedPreset(newPreset.id);
    setSavingPreset(false);
    setPresetName("");
  }, [savingPreset, presetName, addedIds]);

  const handlePresetKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSavePreset();
      if (e.key === "Escape") {
        setSavingPreset(false);
        setPresetName("");
      }
    },
    [handleSavePreset]
  );

  /* Cancel */
  const handleCancel = useCallback(() => {
    if (savingPreset) {
      setSavingPreset(false);
      setPresetName("");
      return;
    }
    onClose();
  }, [savingPreset, onClose]);

  /* ── Drag and drop for Added filters ── */
  const handleDragStart = useCallback((e, filterId) => {
    dragItemId.current = filterId;
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("cf-filter-row--dragging");
  }, []);

  const handleDragEnd = useCallback((e) => {
    dragItemId.current = null;
    setDragOverId(null);
    e.currentTarget.classList.remove("cf-filter-row--dragging");
  }, []);

  const handleDragOver = useCallback((e, filterId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(filterId);
  }, []);

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    const srcId = dragItemId.current;
    if (!srcId || srcId === targetId) { setDragOverId(null); return; }
    setAddedIds((prev) => {
      const next = [...prev];
      const srcIdx = next.indexOf(srcId);
      const tgtIdx = next.indexOf(targetId);
      if (srcIdx === -1 || tgtIdx === -1) return prev;
      next.splice(srcIdx, 1);
      next.splice(tgtIdx, 0, srcId);
      return next;
    });
    setSelectedPreset(null);
    setDragOverId(null);
  }, []);

  /* ── Sort toggle for Available ── */
  const toggleSort = useCallback(() => {
    setAvailableSort((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  /* Search: filter by name AND description */
  const q = searchQuery.trim().toLowerCase();

  /* Added filters preserve addedIds order */
  const addedFilters = addedIds
    .map((id) => ALL_FILTERS.find((f) => f.id === id))
    .filter(Boolean);
  const availableFilters = ALL_FILTERS.filter((f) => !addedIds.includes(f.id));

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

  return (
    <div className={`cf-popover${positioned ? " cf-popover--visible" : ""}`} ref={popoverRef}>
      {/* ── Content area ── */}
      <div className="cf-body">
        {/* ── Left: Presets ── */}
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
            {(personalPresets.length > 0 || savingPreset) && (
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
                  {savingPreset && (
                    <div className="cf-preset-item cf-preset-item--editing">
                      <input
                        ref={presetInputRef}
                        className="cf-preset-item__input"
                        type="text"
                        placeholder="Preset name"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        onKeyDown={handlePresetKeyDown}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Filters ── */}
        <div className="cf-filters">
          {/* Search */}
          <div className="cf-filters-search-group">
            <div className="cf-filters-heading">
              <span className="cf-filters-heading__text">Filters</span>
            </div>
            <div className="cf-filters-search">
              <div className="cf-filters-search__icon">
                <SideIcon icon={SearchGlyph} />
              </div>
              <input
                className="cf-filters-search__input"
                type="text"
                placeholder="Search filter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="cf-filters-scroll">
            {/* Added section */}
            {filteredAdded.length > 0 && (
              <div className="cf-filter-section">
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
                <div className="cf-filter-list">
                  {filteredAdded.map((f) => (
                    <div
                      key={f.id}
                      className={`cf-filter-row${dragOverId === f.id ? " cf-filter-row--drag-over" : ""}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, f.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, f.id)}
                      onDrop={(e) => handleDrop(e, f.id)}
                    >
                      <div className="cf-filter-row__drag">
                        <DragHandleIcon />
                      </div>
                      <div className="cf-filter-row__info">
                        <span className="cf-filter-row__label">{f.label}</span>
                        <span className="cf-filter-row__desc">{f.description}</span>
                      </div>
                      <ToggleSwitch
                        checked={true}
                        onChange={() => toggleFilter(f.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available section */}
            {filteredAvailable.length > 0 && (
              <div className="cf-filter-section">
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
                <div className="cf-filter-list">
                  {filteredAvailable.map((f) => (
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
              </div>
            )}

            {/* No results */}
            {filteredAdded.length === 0 && filteredAvailable.length === 0 && q && (
              <div className="cf-no-results">No filters found</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="cf-footer">
        <div className="cf-footer__actions">
          <button type="button" className="cf-footer__btn cf-footer__btn--cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="cf-footer__btn cf-footer__btn--save" onClick={handleSavePreset}>
            Save as preset
          </button>
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

const VERSION_STORAGE_KEY = "merchant-hub-ui-version";
const SIDEBAR_SESSION_KEY = "merchant-hub-sidebar-collapsed";
const RECENT_MAX = 7;

function readUiVersion() {
  if (typeof localStorage === "undefined") return "v1";
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY) === "v2" ? "v2" : "v1";
  } catch {
    return "v1";
  }
}

function loadRecentForVersion(version) {
  try {
    const raw = localStorage.getItem(`merchant-hub-recent-${version}`);
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

function renderFilterInput(field) {
  switch (field.kind) {
    case "date":
      return (
        <>
          <input type="text" readOnly placeholder="DD / MM / YYYY" />
          <CalendarGlyph className="icon" />
        </>
      );
    case "select":
      return (
        <>
          <input type="text" readOnly placeholder="Select" />
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
            <input type="text" readOnly placeholder="Amount" />
          </div>
        </>
      );
    default:
      return <input type="text" readOnly />;
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
  const [uiVersion, setUiVersion] = useState(readUiVersion);
  const navSections = uiVersion === "v2" ? NAV_SECTIONS_V2 : NAV_SECTIONS_V1;
  const searchIndex = useMemo(() => buildSearchIndex(navSections), [navSections]);
  const [activeId, setActiveId] = useState(readInitialActiveId);
  const [expanded, setExpanded] = useState(() => new Set());
  const [query, setQuery] = useState("");
  const [recentItems, setRecentItems] = useState(() => loadRecentForVersion(readUiVersion()));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readSidebarCollapsed());
  const [navPopover, setNavPopover] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filtersSearch, setFiltersSearch] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const customizeBtnRef = useRef(null);
  const sidebarContainerRef = useRef(null);
  const navPopoverRef = useRef(null);
  const popoverHideTimer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(`merchant-hub-recent-${uiVersion}`, JSON.stringify(recentItems));
    } catch {
      /* ignore */
    }
  }, [recentItems, uiVersion]);

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

  const applyUiVersion = useCallback(
    (next) => {
      if (next === uiVersion) return;
      setUiVersion(next);
      try {
        localStorage.setItem(VERSION_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      setRecentItems(loadRecentForVersion(next));
      const sections = next === "v2" ? NAV_SECTIONS_V2 : NAV_SECTIONS_V1;
      setActiveId((id) => (id && isValidNavId(sections, id) ? id : null));
      setExpanded(new Set());
      setQuery("");
      hideNavPopover();
    },
    [uiVersion, hideNavPopover]
  );

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
                  onClick={() => setFiltersExpanded((v) => !v)}
                >
                  <SideIcon icon={FiltersGlyph} className="filters-toolbar-btn__icon" />
                  <span className="filters-toolbar-btn__label">Filter</span>
                  <span className="filters-toolbar-btn__badge">2</span>
                </button>

                <div className="filters-toolbar-search">
                  <div className="unit-textfield unit-textfield--sm">
                    <div className="unit-textfield__outline">
                      <div className="unit-textfield__field">
                        <SideIcon icon={SearchGlyph} />
                        <input
                          type="search"
                          placeholder="Search"
                          autoComplete="off"
                          spellCheck={false}
                          value={filtersSearch}
                          onChange={(e) => setFiltersSearch(e.target.value)}
                          aria-label="Search"
                        />
                      </div>
                    </div>
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
                className="filters-panel"
                id="filters-panel-body"
                role="region"
                aria-label="Filters"
              >
                <div className="filters-panel-fields">
                  {FILTER_FIELDS.map((f) => (
                    <div key={f.id} className="filters-field">
                      <p className="filters-field-label">{f.label}</p>
                      <div className="unit-textfield unit-textfield--sm">
                        <div className="unit-textfield__outline">
                          <div
                            className={
                              f.kind === "amount"
                                ? "unit-textfield__field unit-textfield__field--split"
                                : "unit-textfield__field"
                            }
                          >
                            {renderFilterInput(f)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="filters-panel-footer">
                  <button
                    ref={customizeBtnRef}
                    type="button"
                    className="filters-customize-link"
                    onClick={() => setCustomizeOpen((v) => !v)}
                  >
                    <SideIcon icon={SettingsCustomizeGlyph} />
                    <span>Customize</span>
                  </button>
                  <div className="filters-panel-footer-actions">
                    <button type="button" className="filters-reset">
                      Reset all
                    </button>
                    <button type="button" className="filters-apply">
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
          onClose={() => setCustomizeOpen(false)}
          onSave={() => setCustomizeOpen(false)}
        />
      )}

      <div
        className="prototype-version-switch prototype-version-switch--floating"
        role="group"
        aria-label="Prototype navigation version"
      >
        <button
          type="button"
          className={`prototype-version-btn${uiVersion === "v1" ? " is-active" : ""}`}
          aria-pressed={uiVersion === "v1"}
          onClick={() => applyUiVersion("v1")}
        >
          v1
        </button>
        <button
          type="button"
          className={`prototype-version-btn${uiVersion === "v2" ? " is-active" : ""}`}
          aria-pressed={uiVersion === "v2"}
          onClick={() => applyUiVersion("v2")}
        >
          v2
        </button>
      </div>
    </div>
  );
}
