import { useEffect, useRef } from "react";
import { useSelection } from "../contexts/SelectionContext";

export const useUserEventHandler = ({
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
  const { selectedItems } = useSelection();
  const userDefinedCleanupRef = useRef();

  const eventSubscriptions = {
    createItem: [onCreateItem],
    shareItems: [onShare, selectedItems.filter((item) => !item.isDirectory)],
    deleteItemsDone: [onDelete, selectedItems],
    createFolderDone: [onCreateFolder, null],
    cutItemsDone: [onCut, null],
    copyItemsDone: [onCopy, null],
    pasteItemsDone: [onPaste, null],
    renameItemDone: [onRename, null],
    toggleFavorite: [onFavorite, null],
    openItem: [onOpen, selectedItems[0]],
    refresh: [onRefresh],
    selectItemsDone: [onSelect, selectedItems],
  };

  const handleEvent = (userEventHandler, hasNoDataParam, eventData) => {
    if (!userEventHandler) return;

    // Release the event broker and call the user defined cleanup function
    const release = () => {
      try {
        const fn = userDefinedCleanupRef.current;
        userDefinedCleanupRef.current = undefined;
        if (fn) fn();
      } catch (err) {
        console.error("Error while releasing event:", err);
      } finally {
        eventBroker.publish("release");
      }
    };

    // Lock the event broker and return the release function
    const lock = () => {
      eventBroker.publish("userLocked");
      return release;
    };

    if (eventBroker.isModalEvent()) {
      try {
        // Execute user code - keep the UI locked until release() is called if this
        // is a blocking event.
        if (hasNoDataParam) {
          userDefinedCleanupRef.current =
            userEventHandler(release) ?? undefined;
        } else {
          userDefinedCleanupRef.current =
            userEventHandler(eventData, release) ?? undefined;
        }
      } catch (err) {
        console.error("Error while running user defined event handler:", err);
      } finally {
        // Modal events require a user defined cleanup function and are always locked
        // until the user releases the lock.
        if (!userDefinedCleanupRef.current) {
          console.error(
            "No user defined cleanup function found for modal event:",
            eventBroker.event
          );
        }
      }
    } else {
      // Regular user defined event handler with the option to lock the UI
      try {
        if (hasNoDataParam) {
          userEventHandler(lock);
        } else {
          userEventHandler(eventData, lock);
        }
      } catch (err) {
        console.error("Error while running user defined event handler:", err);
      }
    }
  };

  useEffect(() => {
    // Are we subscribed to this event?
    const subscription = eventSubscriptions[eventBroker.event];
    if (subscription) {
      const [userEventHandler, defaultEventData] = subscription;
      const hasNoDataParam = subscription.length === 1;
      const eventData = hasNoDataParam
        ? undefined
        : eventBroker.data ?? defaultEventData;
      handleEvent(userEventHandler, hasNoDataParam, eventData);
    }
    // Call user defined cleanup function if it exists on cancel/reset events
    if (["cancel", "refresh", "release"].includes(eventBroker.event)) {
      const fn = userDefinedCleanupRef.current;
      userDefinedCleanupRef.current = undefined;
      if (fn) fn();
    }
  }, [eventBroker?.eventCounter]);
};
