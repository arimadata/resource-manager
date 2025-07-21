export const duplicateNameHandler = (itemName, items) => {
  if (items.find((i) => i.displayName === itemName)) {
    // Generating new item name for duplicate item
    let maxItemNum = 0;
    // If there exists a item with name itemName (1), itemName (2), etc.
    // Check if the number is greater than the maxItemNum, then set it to that greater number
    const itemNameRegex = new RegExp(`${itemName} \\(\\d+\\)`);
    items.forEach((i) => {
      if (itemNameRegex.test(i.displayName)) {
        const itemNumStr = i.displayName
          .split(`${itemName} (`)
          .pop()
          .slice(0, -1);
        const itemNum = parseInt(itemNumStr);
        if (!isNaN(itemNum) && itemNum > maxItemNum) {
          maxItemNum = itemNum;
        }
      }
    });
    return `${itemName} (${++maxItemNum})`;
  } else {
    return itemName;
  }
};
