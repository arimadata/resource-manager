import { useCallback, useEffect, useRef, useState } from "react";
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
import { dateStringValidator } from "../../validators/propValidators";
import { ICON_SIZE } from "../../constants/iconSize";
import { DRAG_ICON_SIZE } from "../../constants/dragIconSize";
import PropTypes from "prop-types";

const Item = ({
  index,
  item,
  itemsViewRef,
  selectedItemIndexes,
  eventBroker,
  handleContextMenu,
  setRightClickedItem,
  headers,
  primaryColor,
}) => {
  const [itemSelected, setItemSelected] = useState(false);
  const [itemHovered, setItemHovered] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [checkboxClassName, setCheckboxClassName] = useState("hidden");
  const [dropZoneClass, setDropZoneClass] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const { currentPathItems } = useNavigation();
  const { selectedItems, setSelectedItems, setHoveredItem } = useSelection();
  const { clipBoard, setClipBoard } = useClipBoard();
  const dragIconRef = useRef(null);
  const hoveredElementRef = useRef(null);
  const getIcon = useIcon();

  const isItemMoving =
    clipBoard?.isMoving &&
    clipBoard.items.find(
      (i) => i.name === item.name && arraysEqual(i.path, item.path)
    );
  const canSelectItems = eventBroker.canTransition("selectItems");

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

  const calculateHoverPosition = useCallback(
    (targetElement) => {
      const containerRect = itemsViewRef.current?.getBoundingClientRect();

      if (containerRect && targetElement) {
        const cellRect = targetElement.getBoundingClientRect();

        return {
          top: cellRect.top,
          left: containerRect.right - 200,
          width: 150,
          height: cellRect.height,
        };
      }
      return null;
    },
    [itemsViewRef]
  );

  // Selection Checkbox Functions
  const handleMouseOver = (e) => {
    setHoveredItem(item);
    setItemHovered(true);
    setCheckboxClassName("visible");

    hoveredElementRef.current = e.currentTarget;

    // Calculate the row position for the toolbar
    const hoverPos = calculateHoverPosition(e.currentTarget);
    setHoverPosition(hoverPos);
  };

  const handleMouseLeave = () => {
    !itemSelected && setCheckboxClassName("hidden");
    setHoveredItem(null);
    setItemHovered(false);
    setHoverPosition(null);
    hoveredElementRef.current = null;
  };

  const handleCheckboxChange = (e) => {
    if (!canSelectItems) return;
    if (e.target.checked) {
      setSelectedItems((prev) => [...prev, item]);
    } else {
      setSelectedItems((prev) =>
        prev.filter(
          (f) => f.name !== item.name && !arraysEqual(f.path, item.path)
        )
      );
    }

    setItemSelected(e.target.checked);
  };

  const handleDragStart = (e) => {
    if (!canSelectItems) return;
    e.dataTransfer.setDragImage(dragIconRef.current, 30, DRAG_ICON_SIZE);
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
  }, [selectedItemIndexes, index]);

  // Recalculate hover position when selectedItems change (toolbar height may change)
  useEffect(() => {
    if (itemHovered && hoveredElementRef.current) {
      const hoverPos = calculateHoverPosition(hoveredElementRef.current);
      setHoverPosition(hoverPos);
    }
  }, [selectedItems.length, itemHovered, calculateHoverPosition]);

  return (
    <div
      className={`item-container ${dropZoneClass} ${
        itemSelected || !!item.isEditing ? "item-selected" : ""
      } ${isItemMoving ? "item-moving" : ""}`}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleItemContextMenu}
    >
      {/* Dynamic Header Cells */}
      {headers.map((header) => {
        const isNameColumn = header.isNameColumn;

        return (
          <div
            key={header.columnName.toLowerCase().replace(" ", "-")}
            className={`${
              isNameColumn ? "item-name-cell" : "item-standard-cell"
            } ${dropZoneClass} ${
              itemSelected || !!item.isEditing ? "item-selected" : ""
            } ${isItemMoving ? "item-moving" : ""}`}
            title={isNameColumn ? item.name : undefined}
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
            {isNameColumn && item.isEditing ? (
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
            ) : isNameColumn ? (
              <>
                {/* Selection Checkbox Cell */}
                {!item.isEditing && (
                  <Checkbox
                    name={item.name}
                    id={item.name}
                    checked={itemSelected}
                    className={`selection-checkbox ${checkboxClassName}`}
                    onChange={handleCheckboxChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Icon Cell */}
                <div className="item-icon-wrapper">
                  {getIcon(item.iconName, ICON_SIZE, { color: primaryColor })}
                </div>

                {/* Name Cell */}
                <span className="item-name-text">{header.getValue(item)}</span>

                {/* Favorite Icon Cell */}
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
            ) : (
              header.getValue(item)
            )}
          </div>
        );
      })}

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
              <BsThreeDots size={ICON_SIZE} />
            </button>
          </div>
        </div>
      )}

      {/* Drag Icon & Tooltip Setup */}
      {tooltipPosition && (
        <Tooltip tooltipPosition={tooltipPosition} name={item.name} />
      )}

      <div ref={dragIconRef} className="drag-icon">
        {getIcon(item.iconName, DRAG_ICON_SIZE, { color: primaryColor })}
      </div>
      {/* Drag Icon & Tooltip Setup */}
    </div>
  );
};

Item.displayName = "Item";
Item.propTypes = {
  index: PropTypes.number.isRequired,
  item: PropTypes.shape({
    pk: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    itemType: PropTypes.oneOf(["folder", "resource"]).isRequired,
    iconName: PropTypes.string,
    isFavorited: PropTypes.bool,
    parentPk: PropTypes.string,
    scope: PropTypes.string,
    scopePk: PropTypes.string,
    createdAt: dateStringValidator,
    updatedAt: dateStringValidator,
    resource: PropTypes.object,
    resourcePk: PropTypes.string,
    resourceType: PropTypes.string,
    isDirectory: PropTypes.bool,
    path: PropTypes.arrayOf(PropTypes.string),
    isEditing: PropTypes.bool,
  }).isRequired,
  itemsViewRef: PropTypes.object.isRequired,
  selectedItemIndexes: PropTypes.array.isRequired,
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
  handleContextMenu: PropTypes.func.isRequired,
  setRightClickedItem: PropTypes.func.isRequired,
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      columnName: PropTypes.string.isRequired,
      getValue: PropTypes.func.isRequired,
      sortAccessor: PropTypes.func,
      isNameColumn: PropTypes.bool,
    })
  ).isRequired,
  primaryColor: PropTypes.string,
};

export default Item;
