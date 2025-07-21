import { createContext, useContext, useEffect, useState } from "react";
import { arraysEqual } from "../utils/arraysEqual";

const ItemsContext = createContext();

const transformItems = (rawItems, itemMap) => {
  if (!Array.isArray(rawItems)) return [];

  const buildPath = (item, visited = new Set()) => {
    // Prevent infinite loops
    if (visited.has(item.pk)) return [item.pk];
    visited.add(item.pk);

    if (!item.parentPk) return [item.pk]; // Root level
    const parent = itemMap.get(item.parentPk);
    if (!parent) return [item.pk]; // Parent not found, treat as root level

    const parentPath = buildPath(parent, visited);
    return [...parentPath, item.pk];
  };

  return rawItems.map((item) => ({
    ...item,
    // Make life easier
    isDirectory: item.itemType === "folder",
    path: buildPath(item),
    isEditing: false,
  }));
};

export const ItemsProvider = ({ children, itemsData }) => {
  const [items, setItemsState] = useState([]);
  const [itemMap, setItemMapState] = useState(new Map());
  const [defaultFolderTemplate, setDefaultFolderTemplate] = useState(null);

  const setItems = (newItems) => {
    // Setting items will also set the itemMap (and transform the items)
    if (!newItems) return;
    const newItemMap = new Map();
    newItems.forEach((item) => {
      newItemMap.set(item.pk, item);
    });
    const transformedItems = transformItems(newItems, newItemMap);
    setItemMapState(newItemMap);
    setItemsState(transformedItems);
    // Make sure we have atleast one folder to use as template
    const defaultValues = {
      pk: null,
      parentPk: null,
      displayName: "",
      isEditing: false,
      isFavorited: false,
      resource: null,
      createdAt: null,
      updatedAt: null,
    };
    if (newItems.length > 0) {
      for (const item of newItems) {
        // Snatch any folder/item to use as template for creating more
        if (item.isDirectory && !defaultFolderTemplate) {
          setDefaultFolderTemplate({
            ...item,
            ...defaultValues,
          });
          break;
        }
      }
      // If no folder was found, use an item as template
      if (!defaultFolderTemplate) {
        setDefaultFolderTemplate({
          ...newItems[0],
          ...defaultValues,
          iconName: "FaRegFolderOpen",
          itemType: "folder",
          resourcePk: null,
          isDirectory: true,
        });
      }
    }
  };

  useEffect(() => {
    if (Array.isArray(itemsData) && itemsData.length > 0) {
      setItems(itemsData);
    }
  }, [itemsData]);

  const getChildren = (item) => {
    if (!item.isDirectory) return [];

    return items.filter((child) =>
      arraysEqual(child.path.slice(0, -1), item.path)
    );
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        itemMap,
        setItems,
        getChildren,
        defaultFolderTemplate,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);
