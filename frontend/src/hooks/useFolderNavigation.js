import { useCallback, useEffect, useState } from "react";
import { arraysEqual } from "../utils/arraysEqual";

const NAVIGATION_PATH_STATE_KEY = "resourceManagerPath";

const getFolderPathFromLocation = () => {
  const historyPath = window.history.state?.[NAVIGATION_PATH_STATE_KEY];
  if (Array.isArray(historyPath)) return historyPath;

  const folderPk = new URL(window.location.href).searchParams.get("folderPk");
  return folderPk ? [folderPk] : [];
};

export const useFolderNavigation = (items, canValidateFolder = false) => {
  const [initialPath, setInitialPath] = useState(getFolderPathFromLocation);

  const syncPathWithUrl = useCallback((newPath, replace = false) => {
    const folderPk = newPath.at(-1) ?? null;

    setInitialPath((previousPath) =>
      arraysEqual(previousPath, newPath) ? previousPath : newPath
    );

    const url = new URL(window.location.href);

    if (folderPk) {
      url.searchParams.set("folderPk", folderPk);
    } else {
      url.searchParams.delete("folderPk");
    }

    const currentState =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};
    const historyPath = currentState[NAVIGATION_PATH_STATE_KEY];
    const nextState = {
      ...currentState,
      [NAVIGATION_PATH_STATE_KEY]: [...newPath],
    };

    if (replace || !Array.isArray(historyPath)) {
      window.history.replaceState(nextState, "", url);
    } else if (!arraysEqual(historyPath, newPath)) {
      window.history.pushState(nextState, "", url);
    }
  }, []);

  useEffect(() => {
    const accessedFolderPk = initialPath.at(-1);
    if (!canValidateFolder || !accessedFolderPk || !Array.isArray(items)) return;

    const folderExists = items.some(
      (item) =>
        item.pk === accessedFolderPk &&
        (item.isDirectory || item.itemType === "folder")
    );

    if (!folderExists) {
      syncPathWithUrl([], true);
    }
  }, [canValidateFolder, initialPath, items, syncPathWithUrl]);

  useEffect(() => {
    const handlePopState = () => {
      setInitialPath(getFolderPathFromLocation());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return { initialPath, syncPathWithUrl };
};
