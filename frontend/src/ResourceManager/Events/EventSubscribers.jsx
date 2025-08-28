import { useEffect } from "react";
import { useKeyboardEventPublisher } from "../../hooks/useKeyboardEventPublisher";
import { useUserEventHandler } from "../../hooks/useUserEventHandler";
import DeleteAction from "./Delete/Delete.action";
import { useClipBoard } from "../../contexts/ClipboardContext";
import { useNavigation } from "../../contexts/NavigationContext";
import { useSelection } from "../../contexts/SelectionContext";
import { useSingleItem } from "../../contexts/SingleItemContext";
import { useItems } from "../../contexts/ItemsContext";
import Modal from "../../components/Modal/Modal";

export const EventSubscribers = ({
  resourceManagerCfg,
  onCopy,
  onCreateFolder,
  onCreateItem,
  onCut,
  onDelete,
  onFavorite,
  onOpen,
  onPaste,
  onRefresh,
  onRename,
  onSelect,
  onShare,
  eventBroker,
}) => {
  const { items, itemMap, setItems } = useItems();
  const {
    currentPath,
    setCurrentPath,
    currentFolder,
    switchPath,
    setCurrentFolder,
    currentPathItems,
    setCurrentPathItems,
  } = useNavigation();
  const {
    selectedItems,
    selectedItemIndexes,
    setSelectedItemIndexes,
    setSelectedItems,
    hoveredItem,
    setHoveredItem,
    selectItems,
    selectFirst,
    selectLast,
    selectAll,
    unselectAll,
    selectArrowUp,
    selectArrowDown,
    navigateUp,
    navigateDown,
  } = useSelection();
  const { clipBoard, setClipBoard, cutItems, copyItems, pasteItems } =
    useClipBoard();
  const {
    openItem,
    renameItem,
    createFolder,
    addOrReplaceItem,
    toggleFavorite,
    deleteItems,
    emptySelecCtxItems,
    selecCtxItems,
    handleContextMenu,
    handleItemRenaming,
    handleFolderCreating,
    visible, // Context Menu Visibility
    setVisible,
    setRightClickedItem,
    clickPosition,
    isSelectionCtx,
  } = useSingleItem();

  // Register keyboard shortcut publishers
  useKeyboardEventPublisher({ eventBroker, resourceManagerCfg });

  // Register user event subscribers
  useUserEventHandler({
    onCopy,
    onCreateFolder,
    onCreateItem,
    onCut,
    onDelete,
    onFavorite,
    onOpen,
    onPaste,
    onRefresh,
    onRename,
    onSelect,
    onShare,
    eventBroker,
  });

  // Register internal event subscribers
  const eventSubscriptions = {
    // Navigation events
    switchPath: () => switchPath(eventBroker?.data),
    // Selection events
    selectItems: selectItems,
    selectFirst: selectFirst,
    selectLast: selectLast,
    selectAll: selectAll,
    unselectAll: unselectAll,
    selectArrowUp: selectArrowUp,
    selectArrowDown: selectArrowDown,
    navigateUp: navigateUp,
    navigateDown: navigateDown,
    // Clipboard events
    cutItems: cutItems,
    copyItems: copyItems,
    pasteItems: () =>
      pasteItems(
        eventBroker?.data !== undefined ? eventBroker?.data : currentFolder
      ),
    // Single item events
    createFolder: createFolder,
    createFolderDone: () => addOrReplaceItem(eventBroker?.data),
    renameItem: renameItem,
    renameItemDone: () => addOrReplaceItem(eventBroker?.data),
    deleteItemsDone: deleteItems,
    toggleFavorite: () => toggleFavorite(eventBroker?.data),
    openItem: () => openItem(eventBroker?.data || selectedItems[0]),
    // Resetting events
    refresh: () => {
      // User pressed "refresh" button or "F5", this may be a
      // blocking event if user needs to download new items.
      // We provide the release() method to them.
      setClipBoard(null);
      unselectAll();
      setItems(items.filter((item) => !item.isTemporary));
      // eventBroker.release();
    },
    cancel: () => {
      // User pressed `Esc`, we force release the lock
      unselectAll();
      setCurrentPathItems((prev) => {
        if (prev.some((item) => item.isEditing || item.isTemporary)) {
          return prev
            .filter((item) => !item.isTemporary)
            .map((item) => ({ ...item, isEditing: false }));
        }
        return prev;
      });
      // eventBroker.release();
    },
  };
  useEffect(() => {
    // Are we subscribed to this event?
    console.log("eventBroker?.eventCounter", eventBroker?.eventCounter);
    const subscriptionHandler = eventSubscriptions[eventBroker.event];
    if (subscriptionHandler) {
      console.log(
        `( internal ) [${eventBroker.eventCounter}] EventSubscribers processing ->`,
        eventBroker.event
      );
      subscriptionHandler();
    }
  }, [eventBroker?.eventCounter]);

  // Register default modal events to handle locked state events
  // Used only when user defined cleanup function is not provided
  const internalModalEventHandlers = {
    // deligated to caller through "onCreateItem"
    // createItemmDelegate: {
    //   title: "Create Item",
    //   component: <>{`${resourceManagerCfg.createItemLabel || "New item"}`}</>,
    //   width: "35%",
    // },
    // // deligated to caller through "onShareItem"
    // shareItemmDelegate: {
    //   title: "Share Item",
    //   component: (
    //     <>{`Share [${selectedItems
    //       .filter((item) => !item.isDirectory)
    //       .map((item) => item.displayName)
    //       .join(", ")}]`}</>
    //   ),
    //   width: "35%",
    // },
    deleteItems: {
      title: "Delete",
      component: <DeleteAction eventBroker={eventBroker} onDelete={onDelete} />,
      width: "25%",
    },
  };
  const internalModalEventHandler =
    internalModalEventHandlers[eventBroker.event];
  return internalModalEventHandler ? (
    <Modal
      heading={internalModalEventHandler.title}
      isOpen={!!internalModalEventHandler}
      closeModal={() => eventBroker.publish("release")}
      dialogWidth={internalModalEventHandler.width}
    >
      {internalModalEventHandler?.component}
    </Modal>
  ) : null;
};
