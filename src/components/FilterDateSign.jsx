/**
 * Date-range comparison glyphs — sign wrapper + assets from `svg icons/` (After / Before / Range).
 */

import AfterGlyph from "../../svg icons/After.svg?react";
import BeforeGlyph from "../../svg icons/Before.svg?react";
import RangeGlyph from "../../svg icons/Range.svg?react";

export function FilterDateSignAfter() {
  return (
    <span className="fp-dates-group__sign fp-dates-group__sign--after" aria-hidden>
      <AfterGlyph className="fp-dates-group__sign-svg" aria-hidden />
    </span>
  );
}

export function FilterDateSignBefore() {
  return (
    <span className="fp-dates-group__sign fp-dates-group__sign--before" aria-hidden>
      <BeforeGlyph className="fp-dates-group__sign-svg" aria-hidden />
    </span>
  );
}

export function FilterDateSignArrow() {
  return (
    <span className="fp-dates-group__sign fp-dates-group__sign--arrow" aria-hidden>
      <RangeGlyph className="fp-dates-group__sign-svg" aria-hidden />
    </span>
  );
}
