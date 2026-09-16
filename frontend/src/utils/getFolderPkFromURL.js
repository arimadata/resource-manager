const SEARCH_PARAM_KEY = "currentFolder";

/**
 * Reads the current folder PK from the URL search params.
 * @returns {string | null} The folder PK, or null if at root.
 */
export const getFolderPkFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get(SEARCH_PARAM_KEY) || null;
};

/**
 * Builds a full URL string with the given folder PK in the search params,
 */
export const buildURLWithCurrentFolder = (folderPk) => {
  const url = new URL(window.location.href);
  if (!folderPk) {
    url.searchParams.delete(SEARCH_PARAM_KEY);
  } else {
    url.searchParams.set(SEARCH_PARAM_KEY, folderPk);
  }
  return url.toString();
};
