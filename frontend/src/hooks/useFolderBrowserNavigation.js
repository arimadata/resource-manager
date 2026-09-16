import { useEffect, useRef } from "react";
import {
  buildURLWithCurrentFolder,
  getFolderPkFromURL,
} from "../utils/getFolderPkFromURL";
import { buildFolderPath } from "../utils/buildFolderPath";
import { useItems } from "../contexts/ItemsContext";

/**
 * Syncs the resource manager's current folder with the `?folder=<pk>` URL
 * search param so the browser back / forward buttons navigate between
 * previously visited folders.
 *
 * @param {string[]}           currentPath
 * @param {Function}           setCurrentPath
 * @param {Function}           resolvePath
 * @param {React.RefObject<boolean>} isInitializedRef
 */
export const useFolderBrowserNavigation = (
  currentPath,
  setCurrentPath,
  isInitializedRef
) => {
  const { initialItemsMap } = useItems();
  const isPopstateNavigation = useRef(false);

  const resolveCurrentPath = (folderPk) => {
    if (!folderPk || !initialItemsMap || initialItemsMap.size === 0) return [];
    return buildFolderPath(folderPk, initialItemsMap);
  };

  useEffect(() => {
    const handlePopState = () => {
      const folderPk = getFolderPkFromURL();
      isPopstateNavigation.current = true;
      setCurrentPath(
        folderPk ? buildFolderPath(folderPk, initialItemsMap) : []
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setCurrentPath, initialItemsMap]);

  useEffect(() => {
    if (!isInitializedRef.current) return;

    if (isPopstateNavigation.current) {
      isPopstateNavigation.current = false;
      return;
    }

    const currentFolderPk =
      currentPath?.length > 0 ? currentPath[currentPath.length - 1] : null;
    const urlFolderPk = getFolderPkFromURL();

    if (currentFolderPk !== urlFolderPk) {
      window.history.pushState(
        window.history.state,
        "",
        buildURLWithCurrentFolder(currentFolderPk)
      );
    }
  }, [currentPath, isInitializedRef]);

  return { resolveCurrentPath };
};
