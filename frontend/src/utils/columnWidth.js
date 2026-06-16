/**
 * Column width helpers — on ResourceManager headers.
 * Accepts a number (pixels) or any valid CSS length (e.g. "20%", "12rem").
 */

/** Normalize header.width to a CSS length, or null when unset. */
export const normalizeColumnWidth = (width) => {
  if (width == null) return null;
  return typeof width === "number" ? `${width}px` : width;
};

/** Single grid track: fixed width when set, otherwise grows to fill remaining space. */
export const getGridColumnTrack = (width) => {
  const normalized = normalizeColumnWidth(width);
  // minmax(0, …) prevents cell content from expanding the track beyond width.
  return normalized ? `minmax(0, ${normalized})` : "minmax(0, 1fr)";
};

/** Full grid-template-columns value for the item list. */
export const buildGridTemplateColumns = (headers) =>
  headers.map(({ width }) => getGridColumnTrack(width)).join(" ");
