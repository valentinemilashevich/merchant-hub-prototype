/**
 * Unit UI Kit Textfield shell — optional trailing clear inside `.unit-textfield__field`.
 * Enable with `clearable` + `showClear` + `onClear`.
 */

export function TextfieldClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M11.33 4.67L4.67 11.33M4.67 4.67l6.66 6.66" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function UnitTextfield({
  className = "",
  size = "sm",
  disabled = false,
  error = false,
  active = false,
  label,
  helper,
  children,
  fieldClassName,
  rootProps = {},
  clearable = false,
  showClear = false,
  onClear,
  clearAriaLabel = "Clear",
  /** Use when clear sits inside an anchored dialog/popover so outside-click handlers ignore the press */
  stopClearPointerPropagation = false,
}) {
  const rootClass = [
    "unit-textfield",
    size === "sm" ? "unit-textfield--sm" : "",
    disabled ? "unit-textfield--disabled" : "",
    error ? "unit-textfield--error" : "",
    active ? "unit-textfield--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const fieldClass = ["unit-textfield__field", fieldClassName].filter(Boolean).join(" ");

  const showClearBtn = Boolean(clearable && showClear && onClear);

  const handleClearMouseDown = (e) => {
    if (stopClearPointerPropagation) e.stopPropagation();
  };

  const handleClearClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClear();
  };

  return (
    <div className={rootClass} {...rootProps}>
      {label != null && label !== false ? (
        <div className="unit-textfield__label-wrapper">
          {typeof label === "string" ? <div className="unit-textfield__label">{label}</div> : label}
        </div>
      ) : null}
      <div className="unit-textfield__outline">
        <div className={fieldClass}>
          {children}
          {showClearBtn ? (
            <button
              type="button"
              className="unit-textfield__clear"
              disabled={disabled}
              aria-label={clearAriaLabel}
              onMouseDown={handleClearMouseDown}
              onClick={handleClearClick}
            >
              <TextfieldClearIcon />
            </button>
          ) : null}
        </div>
      </div>
      {helper ? <div className="unit-textfield__helper-wrapper">{helper}</div> : null}
    </div>
  );
}
