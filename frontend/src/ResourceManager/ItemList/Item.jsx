import { useEffect, useRef, useState } from "react";
import { BsStarFill, BsStar, BsThreeDots } from "react-icons/bs";

import { useIcon } from "../../hooks/useIcons";
import CreateFolderAction from "../Events/CreateFolder/CreateFolder.action";
import RenameAction from "../Events/Rename/Rename.action";
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
  headers,
}) => {
  const [itemSelected, setItemSelected] = useState(false);
  const [itemHovered, setItemHovered] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [checkboxClassName, setCheckboxClassName] = useState("hidden");
  const [dropZoneClass, setDropZoneClass] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);

  const iconSize = 20;
  const getIcon = useIcon();
  const { currentPathItems } = useNavigation();
  const { setSelectedItems, setHoveredItem } = useSelection();
  const { clipBoard, setClipBoard } = useClipBoard();
  const dragIconRef = useRef(null);

  const getHeaderValue = (header) => {
    let value =
      item.itemType === "folder"
        ? item[header.attribute]
        : item.resource[header.attribute];

    if (!value) return item.itemType === "folder" ? "--" : header.defaultValue;

    if (header.transform) {
      value = header.transform(value) ?? header.defaultValue;
    }
    return value;
  };

  const isItemMoving =
    clipBoard?.isMoving &&
    clipBoard.items.find(
      (i) =>
        i.displayName === item.displayName && arraysEqual(i.path, item.path)
    );
  const canSelectItems = eventBroker.canTransition("selectItems");

  const getItemIcon = (size = iconSize) => {
    if (item.itemType === "folder") {
      return getIcon("BsFolderFill", size);
    }

    switch (item.resourceType) {
      case "report":
        return getIcon("BsFileEarmarkFill", size);
      case "mmm":
        return getIcon("BsFileEarmarkFill", size);
      case "audience":
        return getIcon("BsPeopleFill", size);
      default:
        return getIcon("BsFileEarmarkFill", size);
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
  const handleMouseOver = (e) => {
    setHoveredItem(item);
    setItemHovered(true);
    setCheckboxClassName("visible");

    // Calculate the row position for the toolbar
    const containerRect = itemsViewRef.current?.getBoundingClientRect();
    const currentCell = e.currentTarget;

    if (containerRect && currentCell) {
      const cellRect = currentCell.getBoundingClientRect();

      const hoverPos = {
        top: cellRect.top,
        left: containerRect.right - 200,
        width: 150,
        height: cellRect.height,
      };

      setHoverPosition(hoverPos);
    }
  };

  const handleMouseLeave = () => {
    !itemSelected && setCheckboxClassName("hidden");
    setHoveredItem(null);
    setItemHovered(false);
    setHoverPosition(null);
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
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      {/* Selection Checkbox Cell */}
      <div
        className={`item-select-cell ${dropZoneClass} ${
          itemSelected || !!item.isEditing ? "item-selected" : ""
        } ${isItemMoving ? "item-moving" : ""}`}
        onClick={handleItemSelection}
        onContextMenu={handleItemContextMenu}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        draggable={itemSelected}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragEnter={handleDragEnterOver}
        onDragOver={handleDragEnterOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
      </div>

      {/* Icon Cell */}
      <div
        className={`item-icon-cell ${dropZoneClass} ${
          itemSelected || !!item.isEditing ? "item-selected" : ""
        } ${isItemMoving ? "item-moving" : ""}`}
        onClick={handleItemSelection}
        onContextMenu={handleItemContextMenu}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        draggable={itemSelected}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragEnter={handleDragEnterOver}
        onDragOver={handleDragEnterOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="item-icon-wrapper">{getItemIcon()}</div>
      </div>

      {/* Name Cell */}
      <div
        className={`item-name-cell ${dropZoneClass} ${
          itemSelected || !!item.isEditing ? "item-selected" : ""
        } ${isItemMoving ? "item-moving" : ""}`}
        title={item.displayName}
        onClick={handleItemSelection}
        onContextMenu={handleItemContextMenu}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        draggable={itemSelected}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragEnter={handleDragEnterOver}
        onDragOver={handleDragEnterOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
          <>
            <span className="item-name-text">{getHeaderValue(headers[0])}</span>
            <span
              onClick={handleFavorite}
              title={item.isFavorited ? "Unfavorite" : "Favorite"}
              className="favorite-icon-inline"
            >
              {item.isFavorited ? (
                <BsStarFill size={20} color="#fbbf24" />
              ) : (
                <BsStar size={20} style={{ color: "#d1d5db" }} />
              )}
            </span>
          </>
        )}
      </div>

      {/* Dynamic Header Value Cells */}
      {headers &&
        headers.slice(1).map((header) => (
          <div
            key={header.attribute}
            className={`item-standard-cell ${dropZoneClass} ${
              itemSelected || !!item.isEditing ? "item-selected" : ""
            } ${isItemMoving ? "item-moving" : ""}`}
            onMouseEnter={handleMouseOver}
            onMouseLeave={handleMouseLeave}
          >
            {getHeaderValue(header)}
          </div>
        ))}

      {/* Hover Actions Overlay */}
      {itemHovered && hoverPosition && (
        <div
          className={`item-hover-actions fixed-position ${
            itemSelected ? "selected-background" : "default-background"
          }`}
          style={{
            top: hoverPosition.top,
            left: hoverPosition.left,
            width: hoverPosition.width,
            height: hoverPosition.height,
          }}
          onMouseEnter={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <div className="actions-container">
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
              <BsThreeDots size={iconSize} />
            </button>
          </div>
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
