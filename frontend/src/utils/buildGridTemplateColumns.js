/**
 * Each header's `width` can be a number (pixels), a valid CSS length (e.g. "20%", "12rem"),
 * or omitted — in which case the column defaults to `1fr` and fills available space.
 */

export const buildGridTemplateColumns = (headers) =>
  headers
    .map(({ width }) => {
      const normalized = typeof width === "number" ? `${width}px` : width;
      return normalized ? `minmax(0, ${normalized})` : "minmax(0, 1fr)";
    })
    .join(" ");
