import { useEffect, useState, useRef } from "react";
import { useSelection } from "../contexts/SelectionContext";
import { useSingleItem } from "../contexts/SingleItemContext";

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
  const { selectedItems, selectedItemIndexes } = useSelection();
  const { rightClickedItem } = useSingleItem();
  const userDefinedCleanupRef = useRef();

  const eventSubscriptions = {
    createItemDone: [onCreateItem, null],
    shareItems: [onShare, selectedItems.filter((item) => !item.isDirectory)],
    deleteItemsDone: [onDelete, selectedItems],
    createFolderDone: [onCreateFolder, null],
    cutItemsDone: [onCut, null],
    copyItemsDone: [onCopy, null],
    pasteItemsDone: [onPaste, null],
    renameItemDone: [onRename, null],
    toggleFavorite: [onFavorite, null],
    openItem: [onOpen, selectedItems[0]],
    refresh: [onRefresh, null],
    selectItemsDone: [onSelect, selectedItems],
  };

  const handleEvent = (userEventHandler, eventData) => {
    if (!userEventHandler) return;

    // Release the event broker and call the user defined cleanup function
    const release = () => {
      try {
        const fn = userDefinedCleanupRef.current;
        console.log("release ->", fn);
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
        userDefinedCleanupRef.current =
          userEventHandler(eventData, release) ?? undefined;
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
        userEventHandler(eventData, lock);
      } catch (err) {
        console.error("Error while running user defined event handler:", err);
      }
    }
  };

  useEffect(() => {
    // Are we subscribed to this event?
    const subscription = eventSubscriptions[eventBroker.event];
    if (subscription) {
      console.log(
        `( external ) [${eventBroker.eventCounter}] useUserEventHandler processing ->`,
        eventBroker.event
      );
      const [userEventHandler, defaultEventData] = subscription;
      handleEvent(userEventHandler, eventBroker.data ?? defaultEventData);
    }
    // Call user defined cleanup function if it exists on cancel/reset events
    if (["cancel", "refresh", "release"].includes(eventBroker.event)) {
      const fn = userDefinedCleanupRef.current;
      userDefinedCleanupRef.current = undefined;
      if (fn) fn();
    }
  }, [eventBroker?.eventCounter]);
};
