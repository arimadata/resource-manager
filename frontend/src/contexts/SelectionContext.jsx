import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigation } from "./NavigationContext";
import { usePagination } from "./PaginationContext";
import { arraysEqual } from "../utils/arraysEqual";
import PropTypes from "prop-types";

const SelectionContext = createContext();

export const SelectionProvider = ({ eventBroker, children }) => {
  const { currentPathItems } = useNavigation();
  const { currentPage, pageSize, allowPagination } = usePagination();
  const [selectedItems, _setSelectedItems] = useState([]);
  const [selectedItemIndexes, _setSelectedItemIndexes] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  const paginatedItems = useMemo(() => {
    if (!currentPathItems || currentPathItems.length === 0) return [];
    if (!allowPagination) return currentPathItems;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const slicedItems = currentPathItems.slice(startIndex, endIndex);
    return slicedItems;
  }, [currentPathItems, currentPage, pageSize, allowPagination]);

  ////////////////////////////////////////////////////////////
  // Event handlers

  const setSelectedItems = (param) => {
    const items = typeof param === "function" ? param(selectedItems) : param;
    if (items.length > 0) {
      _setSelectedItems(items);
      _setSelectedItemIndexes(() => {
        return items.map((selectedItem) => {
          return currentPathItems.findIndex((f) =>
            arraysEqual(f.path, selectedItem.path)
          );
        });
      });
    } else {
      _setSelectedItems((prev) => (prev.length > 0 ? [] : prev));
      _setSelectedItemIndexes((prev) => (prev.length > 0 ? [] : prev));
    }
  };

  const selectFirst = () => {
    if (currentPathItems.length > 0) {
      setSelectedItems([currentPathItems[0]]);
    }
  };

  const selectLast = () => {
    if (currentPathItems.length > 0) {
      setSelectedItems([currentPathItems.at(-1)]);
    }
  };

  const selectAll = () => {
    setSelectedItems(paginatedItems);
  };

  const unselectAll = () => {
    _setSelectedItems((prev) => (prev.length > 0 ? [] : prev));
    _setSelectedItemIndexes((prev) => (prev.length > 0 ? [] : prev));
  };

  const selectArrowUp = () => {
    if (currentPathItems.length === 0) return;
    const currentSelectedIndexes = [...selectedItemIndexes].sort(
      (a, b) => a - b
    );
    // Nothing selected, select first item
    if (currentSelectedIndexes.length === 0) {
      setSelectedItems([currentPathItems[0]]);
      return;
    }
    // Find the topmost selected item and expand selection upward
    const topIndex = currentSelectedIndexes[0];
    const bottomIndex =
      currentSelectedIndexes[currentSelectedIndexes.length - 1];
    if (topIndex > 0) {
      const newTopIndex = topIndex - 1;
      const selectedRange = currentPathItems.slice(
        newTopIndex,
        bottomIndex + 1
      );
      setSelectedItems(selectedRange);
    }
  };

  const selectArrowDown = () => {
    if (currentPathItems.length === 0) return;
    const currentSelectedIndexes = [...selectedItemIndexes].sort(
      (a, b) => a - b
    );
    // Nothing selected, select first item
    if (currentSelectedIndexes.length === 0) {
      setSelectedItems([currentPathItems[0]]);
      return;
    }
    // Find the bottommost selected item and expand selection downward
    const topIndex = currentSelectedIndexes[0];
    const bottomIndex =
      currentSelectedIndexes[currentSelectedIndexes.length - 1];
    if (bottomIndex < currentPathItems.length - 1) {
      const newBottomIndex = bottomIndex + 1;
      const selectedRange = currentPathItems.slice(
        topIndex,
        newBottomIndex + 1
      );
      setSelectedItems(selectedRange);
    }
  };

  const navigateUp = () => {
    // Nothing to select, return
    if (currentPathItems.length === 0) return;
    // Nothing selected, select first item
    if (selectedItemIndexes.length === 0) {
      setSelectedItems([currentPathItems[0]]);
      return;
    }
    // Move selection up by one item (replace current selection)
    const currentSelectedIndexes = [...selectedItemIndexes].sort(
      (a, b) => a - b
    );
    const currentIndex = currentSelectedIndexes[0];
    if (currentIndex > 0) {
      setSelectedItems([currentPathItems[currentIndex - 1]]);
    } else {
      // Select first item if first item is selected and there's no room to move up
      setSelectedItems([currentPathItems[0]]);
    }
  };

  const navigateDown = () => {
    // Nothing to select, return
    if (currentPathItems.length === 0) return;
    // Nothing selected, select first item
    if (selectedItemIndexes.length === 0) {
      setSelectedItems([currentPathItems[0]]);
      return;
    }
    // Move selection down by one item (replace current selection)
    const currentSelectedIndexes = [...selectedItemIndexes].sort(
      (a, b) => a - b
    );
    const currentIndex =
      currentSelectedIndexes[currentSelectedIndexes.length - 1];
    if (currentIndex < currentPathItems.length - 1) {
      setSelectedItems([currentPathItems[currentIndex + 1]]);
    } else {
      // Select last item if last item is selected and there's no room to move down
      setSelectedItems([currentPathItems.at(-1)]);
    }
  };

  ////////////////////////////////////////////////////////////
  // Context handlers

  useEffect(() => {
    if (selectedItems.length) {
      // For user defined "onSelect" callback
      eventBroker.publish("selectItemsDone");
    }
  }, [selectedItems]);

  return (
    <SelectionContext.Provider
      value={{
        selectedItems,
        selectedItemIndexes,
        setSelectedItems,
        hoveredItem,
        setHoveredItem,
        selectFirst,
        selectLast,
        selectAll,
        unselectAll,
        selectArrowUp,
        selectArrowDown,
        navigateUp,
        navigateDown,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

SelectionProvider.propTypes = {
  eventBroker: PropTypes.shape({
    publish: PropTypes.func,
    canTransition: PropTypes.func,
    isInlineEditing: PropTypes.func,
    isLocked: PropTypes.func,
    isModalEvent: PropTypes.func,
    state: PropTypes.string,
    event: PropTypes.string,
    data: PropTypes.object,
    eventCounter: PropTypes.number,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export const useSelection = () => useContext(SelectionContext);
