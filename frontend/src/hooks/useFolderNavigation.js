import { useCallback, useEffect, useState } from "react";
import { arraysEqual } from "../utils/arraysEqual";

const NAVIGATION_PATH_STATE_KEY = "resourceManagerPath";

const getFolderPathFromLocation = () => {
  const historyPath = window.history.state?.[NAVIGATION_PATH_STATE_KEY];
  if (Array.isArray(historyPath)) return historyPath;

  const folderPk = new URL(window.location.href).searchParams.get("folderPk");
  return folderPk ? [folderPk] : [];
};

export const useFolderNavigation = () => {
  const [initialPath, setInitialPath] = useState(getFolderPathFromLocation);

  const syncPathWithUrl = useCallback((newPath) => {
    const folderPk = newPath[0] ?? null;

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

    if (!Array.isArray(historyPath)) {
      window.history.replaceState(nextState, "", url);
    } else if (!arraysEqual(historyPath, newPath)) {
      window.history.pushState(nextState, "", url);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setInitialPath(getFolderPathFromLocation());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return { initialPath, syncPathWithUrl };
};
