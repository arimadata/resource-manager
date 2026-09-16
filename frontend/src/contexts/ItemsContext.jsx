import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { arraysEqual } from "../utils/arraysEqual";
import { dateStringValidator } from "../validators/propValidators";
import PropTypes from "prop-types";

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

export const ItemsProvider = ({ children, items, initialItems }) => {
  const [itemsState, setItemsState] = useState([]);
  const [itemsMap, setItemsMap] = useState(new Map());
  const [defaultFolderTemplate, setDefaultFolderTemplate] = useState(null);

  const initialItemsMap = useMemo(() => {
    const initialMap = new Map();
    initialItems.forEach((item) => initialMap.set(item.pk, item));
    return initialMap;
  }, [initialItems]);

  const setItems = (newItems) => {
    // Setting items will also set the itemMap (and transform the items)
    if (!newItems) return;
    const newItemMap = new Map();
    newItems.forEach((item) => {
      newItemMap.set(item.pk, item);
    });
    const transformedItems = transformItems(newItems, newItemMap);
    setItemsMap(newItemMap);
    setItemsState(transformedItems);
    // Make sure we have at least one folder to use as template
    const defaultValues = {
      pk: null,
      parentPk: null,
      name: "",
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
    }
  };

  useEffect(() => {
    if (Array.isArray(items)) {
      setItems(items);
    }
  }, [items]);

  const getChildren = (item) => {
    if (!item.isDirectory) return [];

    return itemsState.filter((child) =>
      arraysEqual(child.path.slice(0, -1), item.path)
    );
  };

  return (
    <ItemsContext.Provider
      value={{
        items: itemsState,
        itemsMap,
        initialItems,
        initialItemsMap,
        setItems,
        getChildren,
        defaultFolderTemplate,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

ItemsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialItems: PropTypes.arrayOf(
    PropTypes.shape({
      pk: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      itemType: PropTypes.oneOf(["folder", "resource"]).isRequired,
      iconName: PropTypes.string,
      isFavorited: PropTypes.bool,
      parentPk: PropTypes.string,
      scope: PropTypes.string,
      scopePk: PropTypes.string,
      createdAt: dateStringValidator,
      updatedAt: dateStringValidator,
      resource: PropTypes.object,
      resourcePk: PropTypes.string,
      resourceType: PropTypes.string,
      isDirectory: PropTypes.bool,
      path: PropTypes.string,
      isEditing: PropTypes.bool,
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      pk: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      itemType: PropTypes.oneOf(["folder", "resource"]).isRequired,
      iconName: PropTypes.string,
      isFavorited: PropTypes.bool,
      parentPk: PropTypes.string,
      scope: PropTypes.string,
      scopePk: PropTypes.string,
      createdAt: dateStringValidator,
      updatedAt: dateStringValidator,
      resource: PropTypes.object,
      resourcePk: PropTypes.string,
      resourceType: PropTypes.string,
      isDirectory: PropTypes.bool,
      path: PropTypes.string,
      isEditing: PropTypes.bool,
    })
  ).isRequired,
};

export const useItems = () => useContext(ItemsContext);
