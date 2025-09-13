import { createContext, useContext, useEffect, useState } from "react";
import { BiRename, BiSelectMultiple } from "react-icons/bi";
import {
  BsCopy,
  BsFolderPlus,
  BsScissors,
  BsFileEarmarkPlus,
} from "react-icons/bs";
import { FaRegFile, FaRegPaste, FaArrowUpFromBracket } from "react-icons/fa6";
import { FiRefreshCw } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import { PiFolderOpen } from "react-icons/pi";
import { useClipBoard } from "./ClipboardContext";
import { useSelection } from "./SelectionContext";
import { useNavigation } from "./NavigationContext";
import { duplicateNameHandler } from "../utils/duplicateNameHandler";
import { useItems } from "./ItemsContext";
import { useIcon } from "../hooks/useIcons";
import PropTypes from "prop-types";

const SingleItemContext = createContext();

export const SingleItemProvider = ({
  children,
  eventBroker,
  resourceManagerCfg,
  customEmptySelectCtxItems = [],
  customSelectCtxItems = [],
}) => {
  const [visible, setVisible] = useState(false);
  const [isSelectionCtx, setIsSelectionCtx] = useState(false);
  const [clickPosition, setClickPosition] = useState({ clickX: 0, clickY: 0 });
  const [rightClickedItem, setRightClickedItem] = useState(null);

  const { items, setItems, defaultFolderTemplate } = useItems();
  const { clipBoard } = useClipBoard();
  const { selectedItems, selectedItemIndexes, unselectAll } = useSelection();
  const { currentPath, setCurrentPath, currentPathItems, setCurrentPathItems } =
    useNavigation();
  const getIcon = useIcon();

  ////////////////////////////////////////////////////////////
  // Event handlers

  const openItem = (item) => {
    // Handled "openItem" event
    if (item && item.isDirectory) {
      // Enter folder
      setCurrentPath(item.path);
      unselectAll();
    }
  };

  const renameItem = () => {
    if (selectedItemIndexes.length > 0) {
      setCurrentPathItems((prev) => {
        if (prev[selectedItemIndexes.at(-1)]) {
          prev[selectedItemIndexes.at(-1)].isEditing = true;
        }
        return prev;
      });
      unselectAll();
    } else {
      // Nothing to rename
      eventBroker.publish("release");
    }
  };

  const createFolder = () => {
    const tempPk = new Date().valueOf().toString();
    setCurrentPathItems((prev) => {
      return [
        ...prev,
        {
          ...defaultFolderTemplate,
          pk: tempPk,
          displayName: duplicateNameHandler("New Folder", currentPathItems),
          path: [...currentPath, tempPk],
          itemType: "folder",
          isDirectory: true,
          isEditing: true,
          isTemporary: true,
          parentPk: currentPath.at(-1) || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const deleteItems = () => {
    setCurrentPathItems((prev) => {
      return prev.filter((item) => !selectedItems.includes(item));
    });
    const newItems = items.filter((item) => !selectedItems.includes(item));
    setItems(newItems);
    unselectAll();
  };

  const addOrReplaceItem = (item) => {
    if (item?.pk) {
      const newItems = items.filter((i) => i.pk !== item.pk).concat(item);
      setItems(newItems);
    } else {
      console.warn("Received event 'addOrReplaceItem' with no item data");
    }
  };

  // Handler for toggling favorite
  const toggleFavorite = () => {
    setCurrentPathItems((prev) => [...prev]); // Trigger re-render
  };

  ////////////////////////////////////////////////////////////
  // Context handlers

  const handleItemOpen = () => {
    eventBroker.publish("openItem");
    setVisible(false);
  };

  const handleShareItem = () => {
    eventBroker.publish("shareItems");
    setVisible(false);
  };

  const handleMoveOrCopyItems = (isMoving) => {
    if (isMoving) {
      eventBroker.publish("cutItems");
    } else {
      eventBroker.publish("copyItems");
    }
    setVisible(false);
  };

  const handleItemPasting = () => {
    eventBroker.publish("pasteItems", rightClickedItem);
    setVisible(false);
  };

  const handleRenaming = () => {
    eventBroker.publish("renameItem");
    setVisible(false);
  };

  const handleDelete = () => {
    eventBroker.publish("deleteItems");
    setVisible(false);
  };

  const handleRefresh = () => {
    eventBroker.publish("refresh");
    setVisible(false);
  };

  const handleCreateNewFolder = () => {
    eventBroker.publish("createFolder");
    setVisible(false);
  };

  const handleCreateNewItem = () => {
    eventBroker.publish("createItem");
    setVisible(false);
  };

  const handleselectAllItems = () => {
    eventBroker.publish("selectAll");
    setVisible(false);
  };

  ////////////////////////////////////////////////////////////
  // Context Menu Items

  // Append custom menu items provided by user to the
  const processCustomMenuItems = (customItems, type) => {
    const ctxItems = type === "empty" ? currentPathItems : rightClickedItem;
    return customItems.map((item) => {
      const isHidden =
        typeof item.hidden === "function"
          ? item.hidden(ctxItems)
          : Boolean(item.hidden);

      const processedItem = {
        ...item,
        icon:
          typeof item.icon === "string" ? getIcon(item.icon, 18) : item.icon,
        onClick: item.onClick ? () => item.onClick(ctxItems) : undefined,
        hidden: isHidden,
      };

      // Process children
      if (item.children && item.children.length > 0) {
        processedItem.children = item.children.map((child) => {
          const isChildHidden =
            typeof child.hidden === "function"
              ? child.hidden(ctxItems)
              : Boolean(child.hidden);

          return {
            ...child,
            icon:
              typeof child.icon === "string"
                ? getIcon(child.icon, 18)
                : child.icon,
            onClick: child.onClick ? () => child.onClick(ctxItems) : undefined,
            hidden: isChildHidden,
          };
        });

        // Hide parent if all children are hidden
        const visibleChildren = processedItem.children.filter(
          (child) => !child.hidden
        );
        if (visibleChildren.length === 0) {
          processedItem.hidden = true;
        }
      }

      return processedItem;
    });
  };

  // Context Menu - General: when selecting empty space //
  const defaultEmptySelectCtxItems = [
    {
      title: "Refresh",
      icon: <FiRefreshCw size={18} />,
      onClick: handleRefresh,
      divider: true,
    },
    resourceManagerCfg.allowCreateItem && {
      title: resourceManagerCfg.createItemLabel || "New item",
      icon: <BsFileEarmarkPlus size={18} />,
      onClick: handleCreateNewItem,
    },
    resourceManagerCfg.allowCreateFolder && {
      title: "New folder",
      icon: <BsFolderPlus size={18} />,
      onClick: handleCreateNewFolder,
      divider: true,
    },
    {
      title: "Select all",
      icon: <BiSelectMultiple size={18} />,
      onClick: handleselectAllItems,
    },
  ].filter(Boolean); // remove undefined/falsy items

  // Merge custom items with default items
  const processedCustomEmptyItems = processCustomMenuItems(
    customEmptySelectCtxItems,
    "empty"
  );
  const emptySelectCtxItems = [
    ...processedCustomEmptyItems,
    ...defaultEmptySelectCtxItems,
  ];

  // Context Menu - Selected Items: when selecting an item //
  const defaultSelectCtxItems = [
    resourceManagerCfg.allowShareItem &&
      !rightClickedItem?.isDirectory && {
        title: "Share",
        icon: <FaArrowUpFromBracket size={16} />,
        onClick: handleShareItem,
      },
    {
      title: "Open",
      icon: rightClickedItem?.isDirectory ? (
        <PiFolderOpen size={20} />
      ) : (
        <FaRegFile size={16} />
      ),
      onClick: handleItemOpen,
      divider: true,
    },
    resourceManagerCfg.allowCut && {
      title: "Cut",
      icon: <BsScissors size={19} />,
      onClick: () => handleMoveOrCopyItems(true),
    },
    resourceManagerCfg.allowCopy && {
      title: "Copy",
      icon: <BsCopy strokeWidth={0.1} size={17} />,
      onClick: () => handleMoveOrCopyItems(false),
      divider: !rightClickedItem?.isDirectory,
    },
    resourceManagerCfg.allowPaste && {
      title: "Paste",
      icon: <FaRegPaste size={18} />,
      onClick: handleItemPasting,
      className: `${clipBoard ? "" : "disable-paste"}`,
      hidden: !rightClickedItem?.isDirectory,
      divider: true,
    },
    {
      title: "Rename",
      icon: <BiRename size={19} />,
      onClick: handleRenaming,
      hidden: selectedItems.length > 1,
    },
    {
      title: "Delete",
      icon: <MdOutlineDelete size={19} />,
      onClick: handleDelete,
    },
  ].filter(Boolean); // remove undefined/falsy items

  // Merge custom items with default items
  const processedCustomSelectItems = processCustomMenuItems(
    customSelectCtxItems,
    "selected"
  );
  const selectCtxItems = [
    ...processedCustomSelectItems,
    ...defaultSelectCtxItems,
  ];

  const handleFolderCreating = () => {
    eventBroker.publish("createFolder");
  };

  const handleItemRenaming = () => {
    eventBroker.publish("renameItem");
  };

  const handleContextMenu = (e, isSelection = false) => {
    // true -> Context Menu is for an item (item specific)
    // false -> Context Menu is for an empty selection (general)
    e.preventDefault();
    setClickPosition({ clickX: e.clientX, clickY: e.clientY });
    setIsSelectionCtx(isSelection);
    !isSelection && eventBroker.publish("unselectAll");
    setVisible(true);
  };

  useEffect(() => {
    unselectAll();
  }, [currentPath]);

  return (
    <SingleItemContext.Provider
      value={{
        openItem,
        renameItem,
        createFolder,
        deleteItems,
        addOrReplaceItem,
        toggleFavorite,
        emptySelectCtxItems,
        selectCtxItems,
        handleContextMenu,
        handleItemRenaming,
        handleFolderCreating,
        visible, // Context Menu Visibility
        setVisible,
        setRightClickedItem,
        clickPosition,
        isSelectionCtx,
      }}
    >
      {children}
    </SingleItemContext.Provider>
  );
};

SingleItemProvider.propTypes = {
  children: PropTypes.node.isRequired,
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
  resourceManagerCfg: PropTypes.shape({
    allowCreateItem: PropTypes.bool,
    allowCreateFolder: PropTypes.bool,
    allowShareItem: PropTypes.bool,
    allowCut: PropTypes.bool,
    allowCopy: PropTypes.bool,
    allowPaste: PropTypes.bool,
    allowRename: PropTypes.bool,
    createItemLabel: PropTypes.string,
    allowDelete: PropTypes.bool,
    allowFavorite: PropTypes.bool,
  }).isRequired,
  customEmptySelectCtxItems: PropTypes.array,
  customSelectCtxItems: PropTypes.array,
};

export const useSingleItem = () => useContext(SingleItemContext);
