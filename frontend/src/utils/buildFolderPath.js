/**
 * Build the full path array for a folder PK by walking up parentPk.
 * Returns [] if the PK is not found in the item map (shows root).
 */
export const buildFolderPath = (pk, initialItemsMap, visited = new Set()) => {
  if (visited.has(pk)) return [pk];
  visited.add(pk);

  const item = initialItemsMap.get(pk);
  if (!item) return [];
  if (!item.parentPk) return [pk];

  const parentPath = buildFolderPath(item.parentPk, initialItemsMap, visited);
  return parentPath.length > 0 ? [...parentPath, pk] : [pk];
};
