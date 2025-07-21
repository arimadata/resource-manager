import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useItems } from "./ItemsContext";
import sortItems from "../utils/sortItems";
import { arraysEqual } from "../utils/arraysEqual";

const NavigationContext = createContext();

export const NavigationProvider = ({ children, initialPath }) => {
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
    if (Array.isArray(items) && items.length > 0) {
      setCurrentPathItems(() => {
        const currPathItems = items.filter((item) =>
          arraysEqual(item.path.slice(0, -1), currentPath)
        );
        return sortItems(currPathItems);
      });

      setCurrentFolder(() => {
        if (currentPath.length === 0) return null; // Root directory
        const currentFolderPk = currentPath[currentPath.length - 1];
        return items.find((item) => item.pk === currentFolderPk) ?? null;
      });
    }
  }, [items, currentPath]);

  useEffect(() => {
    if (!isMountRef.current && Array.isArray(items) && items.length > 0) {
      setCurrentPath(initialPath || []);
      isMountRef.current = true;
    }
  }, [initialPath, items]);

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

export const useNavigation = () => useContext(NavigationContext);
