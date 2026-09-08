/**
 * The palettes the colour menus offer.
 *
 * These are literal values, not `--tt-core-*` tokens, and they have to be: a
 * colour is stored in the document itself (`<span style="color: …">`), so it is
 * part of the content rather than part of the theme. A document keeps the
 * colour it was written with wherever it is rendered — which also means a
 * colour chosen here will not follow a consumer into a dark theme.
 *
 * Each one is picked to stay legible on white and to keep contrast against the
 * matching highlight.
 */
export interface ColorSwatch {
  label: string;
  value: string;
}

export const TEXT_COLORS: ColorSwatch[] = [
  { label: "Grey", value: "#62748e" },
  { label: "Brown", value: "#8b5a2b" },
  { label: "Red", value: "#c61d1d" },
  { label: "Orange", value: "#c2620c" },
  { label: "Yellow", value: "#a16207" },
  { label: "Green", value: "#0d8050" },
  { label: "Blue", value: "#1478e3" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Pink", value: "#db2777" },
];

export const HIGHLIGHT_COLORS: ColorSwatch[] = [
  { label: "Grey", value: "#eceef2" },
  { label: "Brown", value: "#f3e8dc" },
  { label: "Red", value: "#fde8e8" },
  { label: "Orange", value: "#fdead8" },
  { label: "Yellow", value: "#fdf3c8" },
  { label: "Green", value: "#e6f5ef" },
  { label: "Blue", value: "#e6f1fd" },
  { label: "Purple", value: "#efe8fd" },
  { label: "Pink", value: "#fce7f0" },
];
