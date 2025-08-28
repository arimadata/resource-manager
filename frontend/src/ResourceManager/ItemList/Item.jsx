import { useEffect, useRef, useState } from "react";
import {
  FaRegFile,
  FaRegFolderOpen,
  FaStar,
  FaRegStar,
  FaEllipsis,
} from "react-icons/fa6";
import { useIcon } from "../../hooks/useIcons";
import CreateFolderAction from "../Events/CreateFolder/CreateFolder.action";
import RenameAction from "../Events/Rename/Rename.action";
import { formatDate } from "../../utils/formatDate";
import { useNavigation } from "../../contexts/NavigationContext";
import { useSelection } from "../../contexts/SelectionContext";
import { useClipBoard } from "../../contexts/ClipboardContext";
import Checkbox from "../../components/Checkbox/Checkbox";
import { arraysEqual } from "../../utils/arraysEqual";
import Tooltip from "../../components/Tooltip/Tooltip";

const dragIconSize = 50;

const Item = ({
  index,
  item,
  itemsViewRef,
  selectedItemIndexes,
  eventBroker,
  handleContextMenu,
  setRightClickedItem,
}) => {
  const [itemSelected, setItemSelected] = useState(false);
  const [itemHovered, setItemHovered] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [checkboxClassName, setCheckboxClassName] = useState("hidden");
  const [dropZoneClass, setDropZoneClass] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const iconSize = 20;
  const getIcon = useIcon();
  const { currentPathItems } = useNavigation();
  const { setSelectedItems, setHoveredItem } = useSelection();
  const { clipBoard, setClipBoard } = useClipBoard();
  const dragIconRef = useRef(null);

  const isItemMoving =
    clipBoard?.isMoving &&
    clipBoard.items.find(
      (i) =>
        i.displayName === item.displayName && arraysEqual(i.path, item.path)
    );
  const canSelectItems = eventBroker.canTransition("selectItems");

  // Get the appropriate icon for the item
  const getItemIcon = (size = iconSize) => {
    // If iconName is provided, use it
    if (item.iconName) {
      return getIcon(item.iconName, size);
    }

    // Fallback to default icons based on item type
    if (item.isDirectory) {
      return <FaRegFolderOpen size={size} />;
    } else {
      return <FaRegFile size={size} />;
    }
  };

  const handleItemAccess = (item) => {
    eventBroker.publish("openItem", item);
  };

  const handleItemShare = () => {
    if (!item.isDirectory) {
      eventBroker.publish("shareItems", [item]);
    }
  };

  const handleItemRangeSelection = (shiftKey, ctrlKey) => {
    if (!canSelectItems) return;
    if (selectedItemIndexes.length > 0 && shiftKey) {
      let reverseSelection = false;
      let startRange = selectedItemIndexes[0];
      let endRange = index;

      // Reverse Selection
      if (startRange >= endRange) {
        const temp = startRange;
        startRange = endRange;
        endRange = temp;
        reverseSelection = true;
      }

      const itemsRange = currentPathItems.slice(startRange, endRange + 1);
      setSelectedItems(reverseSelection ? itemsRange.reverse() : itemsRange);
    } else if (selectedItemIndexes.length > 0 && ctrlKey) {
      // Remove item from selected items if it already exists on CTRL + Click, otherwise push it in selectedItems
      setSelectedItems((prev) => {
        const filteredItems = prev.filter(
          (f) => !arraysEqual(f.path, item.path)
        );
        if (prev.length === filteredItems.length) {
          return [...prev, item];
        }
        return filteredItems;
      });
    } else {
      setSelectedItems([item]);
    }
  };

  const handleItemSelection = (e) => {
    e.stopPropagation();
    if (!canSelectItems || item.isEditing) return;
    handleItemRangeSelection(e.shiftKey, e.ctrlKey);

    // Double click to open item
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 300) {
      handleItemAccess(item);
      return;
    }
    setLastClickTime(currentTime);
  };

  const handleItemContextMenu = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (item.isEditing || !canSelectItems) return;

    if (!itemSelected) {
      setSelectedItems([item]);
    }

    setRightClickedItem(item);
    handleContextMenu(e, true);
  };

  // Selection Checkbox Functions
  const handleMouseOver = () => {
    setHoveredItem(item);
    setItemHovered(true);
    setCheckboxClassName("visible");
  };

  const handleMouseLeave = () => {
    !itemSelected && setCheckboxClassName("hidden");
    setHoveredItem(null);
    setItemHovered(false);
  };

  const handleCheckboxChange = (e) => {
    if (!canSelectItems) return;
    if (e.target.checked) {
      setSelectedItems((prev) => [...prev, item]);
    } else {
      setSelectedItems((prev) =>
        prev.filter(
          (f) =>
            f.displayName !== item.displayName &&
            !arraysEqual(f.path, item.path)
        )
      );
    }

    setItemSelected(e.target.checked);
  };
  //

  const handleDragStart = (e) => {
    if (!canSelectItems) return;
    e.dataTransfer.setDragImage(dragIconRef.current, 30, 50);
    e.dataTransfer.effectAllowed = "copy";
    eventBroker.publish("cutItems");
  };

  const handleDragEnd = () => {
    if (!canSelectItems) return;
    setClipBoard(null);
  };

  const handleDragEnterOver = (e) => {
    e.preventDefault();
    if (!canSelectItems) return;
    if (itemSelected || !item.isDirectory) {
      e.dataTransfer.dropEffect = "none";
    } else {
      setTooltipPosition({ x: e.clientX, y: e.clientY + 12 });
      e.dataTransfer.dropEffect = "copy";
      setDropZoneClass("item-drop-zone");
    }
  };

  const handleDragLeave = (e) => {
    if (!canSelectItems) return;
    // To stay in dragging state for the child elements of the target drop-zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropZoneClass((prev) => (prev ? "" : prev));
      setTooltipPosition(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (itemSelected || !item.isDirectory || !canSelectItems) return;

    eventBroker.publish("pasteItems", item);
    setDropZoneClass((prev) => (prev ? "" : prev));
    setTooltipPosition(null);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!canSelectItems) return;
    item.isFavorited = !item.isFavorited; // Mutate in place once
    eventBroker.publish("toggleFavorite", item);
  };

  useEffect(() => {
    setItemSelected(selectedItemIndexes.includes(index));
    setCheckboxClassName(
      selectedItemIndexes.includes(index) ? "visible" : "hidden"
    );
  }, [selectedItemIndexes]);

  return (
    <div
      className={`item-container ${dropZoneClass} ${
        itemSelected || !!item.isEditing ? "item-selected" : ""
      } ${isItemMoving ? "item-moving" : ""}`}
      tabIndex={0}
      title={item.displayName}
      onClick={handleItemSelection}
      onContextMenu={handleItemContextMenu}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      draggable={itemSelected}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnterOver}
      onDragOver={handleDragEnterOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="item">
        {/* Selection Checkbox */}
        {!item.isEditing && (
          <Checkbox
            name={item.displayName}
            id={item.displayName}
            checked={itemSelected}
            className={`selection-checkbox ${checkboxClassName}`}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {/* Star (Favorite) Icon */}
        <span
          onClick={handleFavorite}
          title={item.isFavorited ? "Unfavorite" : "Favorite"}
          className="favorite-icon"
        >
          {item.isFavorited ? (
            <FaStar size={iconSize} />
          ) : (
            <FaRegStar size={iconSize} />
          )}
        </span>

        {/* Item Icon */}
        {getItemIcon(iconSize)}

        {/* Item Name */}
        {item.isEditing ? (
          <div className={`rename-item-container list`}>
            {eventBroker.event === "createFolder" ? (
              <CreateFolderAction
                itemsViewRef={itemsViewRef}
                item={item}
                eventBroker={eventBroker}
              />
            ) : eventBroker.event === "renameItem" ? (
              <RenameAction
                itemsViewRef={itemsViewRef}
                item={item}
                eventBroker={eventBroker}
              />
            ) : null}
          </div>
        ) : (
          <span className="text-truncate item-name">{item.displayName}</span>
        )}
      </div>

      {/* Modified Date & File Size */}
      <div className="item-standard">{formatDate(item.updatedAt)}</div>
      <div className="item-standard">{item.pk}</div>

      {/* Hover Actions Overlay */}
      {itemHovered && (
        <div className="item-hover-actions">
          <button
            className="action-btn"
            title="Open"
            onClick={(e) => {
              e.stopPropagation();
              handleItemAccess(item);
            }}
          >
            <span>Open</span>
          </button>
          {!item.isDirectory && (
            <button
              className="action-btn share-btn"
              title="Share"
              onClick={(e) => {
                e.stopPropagation();
                handleItemShare();
              }}
            >
              <span>Share</span>
            </button>
          )}
          <button
            className="action-btn more-btn"
            title="More options"
            onClick={handleItemContextMenu}
          >
            <FaEllipsis size={iconSize} />
          </button>
        </div>
      )}

      {/* Drag Icon & Tooltip Setup */}
      {tooltipPosition && (
        <Tooltip tooltipPosition={tooltipPosition} name={item.displayName} />
      )}

      <div ref={dragIconRef} className="drag-icon">
        {getItemIcon(dragIconSize)}
      </div>
      {/* Drag Icon & Tooltip Setup */}
    </div>
  );
};

export default Item;
