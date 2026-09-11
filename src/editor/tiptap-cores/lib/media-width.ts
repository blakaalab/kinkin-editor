import type { Attribute } from "@tiptap/core";

/** Narrower than this and a picture or a player stops being usable. */
export const MIN_MEDIA_WIDTH = 10;

/**
 * A media width, as a whole percentage of the column it sits in — or `null`
 * for the default, which is as wide as the column allows. A percentage rather
 * than pixels so the same document reads the same in an editor 1,300px wide
 * and on a page 700px wide.
 *
 * Accepts `50`, `"50"` or `"50%"`; anything unusable, or 100% and over, is
 * `null`.
 */
export const normalizeMediaWidth = (value: unknown): number | null => {
  const width =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  if (!Number.isFinite(width) || width >= 100) {
    return null;
  }

  return Math.max(MIN_MEDIA_WIDTH, Math.round(width));
};

/**
 * The `width` attribute image, video and video embed share. Rendered as an
 * inline `width: N%` style — the element centres itself, so width is the only
 * thing a resize has to write down.
 *
 * Parsing reads a percentage style only: a pixel `width="560"` on pasted
 * embed code describes someone else's page, not a share of this column.
 */
export const mediaWidthAttribute: Attribute = {
  default: null,
  parseHTML: (element) => {
    const { width } = element.style;
    return width.endsWith("%") ? normalizeMediaWidth(width) : null;
  },
  renderHTML: (attributes) => {
    const width = normalizeMediaWidth(attributes.width);
    return width ? { style: `width: ${width}%` } : {};
  },
};
