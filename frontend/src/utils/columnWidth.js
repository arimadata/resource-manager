/**
 * Column width helpers — on ResourceManager headers.
 * Accepts a number (pixels) or any valid CSS length (e.g. "20%", "12rem").
 */

export const buildGridTemplateColumns = (headers) =>
  headers
    .map(({ width }) => {
      const normalized = width == null ? null : typeof width === "number" ? `${width}px` : width;
      return normalized ? `minmax(0, ${normalized})` : "minmax(0, 1fr)";
    })
    .join(" ");
