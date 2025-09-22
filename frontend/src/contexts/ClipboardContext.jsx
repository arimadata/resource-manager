import { createContext, useContext, useState } from "react";
import { useSelection } from "./SelectionContext";
import { useItems } from "./ItemsContext";
import PropTypes from "prop-types";

const ClipBoardContext = createContext();

export const ClipBoardProvider = ({ children, eventBroker }) => {
  const [clipBoard, setClipBoard] = useState(null);
  const { selectedItems, unselectAll } = useSelection();
  const { items, setItems } = useItems();

  ////////////////////////////////////////////////////////////
  // Event handlers

  const cutItems = () => {
    setClipBoard({
      items: selectedItems,
      isMoving: true,
    });
    eventBroker.publish("cutItemsDone", selectedItems);
  };

  const copyItems = () => {
    console.warn("Copying items is currently not supported");
    eventBroker.publish("release");
    return;
    // if (selectedItems.length === 0) {
    //   return;
    // }
    // setClipBoard({
    //   items: selectedItems,
    //   isMoving: false,
    // });
    // eventBroker.publish("copyItemsDone", selectedItems);
  };

  // TODO: Show error if destination folder already has file(s) with the same name
  const pasteItems = (destinationFolder) => {
    const copiedItems = clipBoard.items;
    const operationType = clipBoard.isMoving ? "move" : "copy";

    const isCurrentFolder = copiedItems.every(
      (item) =>
        (!item.parentPk && destinationFolder === null) ||
        item.parentPk === destinationFolder?.pk
    );

    if (isCurrentFolder) {
      setClipBoard(null);
      unselectAll();
      eventBroker.publish("release");
      return;
    }

    const pasteData = {
      copiedItems,
      destinationFolder,
      operationType,
    };
    if (operationType === "copy") {
      console.warn("Copying items is currently not supported");
      eventBroker.publish("release");
    } else {
      // Emit event to user event handler
      setClipBoard(null);
      unselectAll();
      // Move all items to destination folder
      const copiedItemsMap = copiedItems.reduce((acc, item) => {
        acc[item.pk] = item;
        return acc;
      }, {});
      const allItems = items.map((item) => {
        if (copiedItemsMap[item.pk]) {
          return { ...item, parentPk: destinationFolder?.pk || null };
        }
        return item;
      });
      setItems(allItems);
      eventBroker.publish("pasteItemsDone", pasteData);
    }
  };

  return (
    <ClipBoardContext.Provider
      value={{
        clipBoard,
        setClipBoard,
        cutItems,
        copyItems,
        pasteItems,
      }}
    >
      {children}
    </ClipBoardContext.Provider>
  );
};

ClipBoardProvider.propTypes = {
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
};

export const useClipBoard = () => useContext(ClipBoardContext);
