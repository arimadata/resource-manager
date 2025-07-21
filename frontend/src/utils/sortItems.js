const sortAscending = (items) =>
  items.sort((a, b) => a.displayName.localeCompare(b.displayName));

const sortItems = (items) => {
  const folders = items.filter((item) => item.isDirectory);
  const resources = items.filter((item) => !item.isDirectory);
  const sortedFolders = sortAscending(folders);
  const sortedResources = sortAscending(resources);

  return [...sortedFolders, ...sortedResources];
};

export default sortItems;
