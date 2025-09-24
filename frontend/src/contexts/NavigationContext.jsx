import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useItems } from "./ItemsContext";
import { sortItems } from "../utils/sortItems";
import { arraysEqual } from "../utils/arraysEqual";
import { useSorting } from "./SortingContext";
import PropTypes from "prop-types";

const NavigationContext = createContext();

export const NavigationProvider = ({
  children,
  initialPath,
  headers,
  onPathChange,
}) => {
  const { sortColumn, sortDirection } = useSorting();
  const { items } = useItems();
  const isMountRef = useRef(false);
  const [currentPath, setCurrentPath] = useState(initialPath || []);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentPathItems, setCurrentPathItems] = useState([]);

  ////////////////////////////////////////////////////////////
  // Event handlers

  const switchPath = (path) => {
    if (!path) {
      console.warn("switchPath -> path is undefined");
    } else {
      setCurrentPath(path);
    }
  };

  ////////////////////////////////////////////////////////////
  // Context handlers

  useEffect(() => {
    if (Array.isArray(items)) {
      if (items.length > 0) {
        const currPathItems = items.filter((item) =>
          arraysEqual(item.path.slice(0, -1), currentPath)
        );

        const sortedItems = sortItems({
          items: currPathItems,
          sortColumn,
          sortDirection,
          headers,
        });

        setCurrentPathItems(sortedItems);

        setCurrentFolder(() => {
          if (currentPath.length === 0) return null;
          const currentFolderPk = currentPath[currentPath.length - 1];
          return items.find((item) => item.pk === currentFolderPk) ?? null;
        });
      } else {
        setCurrentPathItems([]);
        setCurrentFolder(null);
      }
    }
  }, [items, currentPath, sortColumn, sortDirection, headers]);

  useEffect(() => {
    if (!isMountRef.current && Array.isArray(items) && items.length > 0) {
      setCurrentPath(initialPath || []);
      isMountRef.current = true;
    }
  }, [initialPath, items]);

  useEffect(() => {
    if (onPathChange) {
      onPathChange(currentPath);
    }
  }, [currentPath, onPathChange]);

  return (
    <NavigationContext.Provider
      value={{
        currentPath,
        setCurrentPath,
        switchPath,
        currentFolder,
        setCurrentFolder,
        currentPathItems,
        setCurrentPathItems,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

NavigationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialPath: PropTypes.arrayOf(PropTypes.string),
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      columnName: PropTypes.string.isRequired,
      getValue: PropTypes.func.isRequired,
      sortAccessor: PropTypes.func,
      isNameColumn: PropTypes.bool,
    })
  ).isRequired,
  onPathChange: PropTypes.func,
};

export const useNavigation = () => useContext(NavigationContext);
