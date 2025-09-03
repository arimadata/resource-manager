import React, { useEffect, useRef, useState } from "react";
import Button from "../../../components/Button/Button";
import { IoWarningOutline } from "react-icons/io5";
import { useDetectOutsideClick } from "../../../hooks/useDetectOutsideClick";
import Modal from "../../../components/Modal/Modal";
import NameInput from "../../../components/NameInput/NameInput";
import ErrorTooltip from "../../../components/ErrorTooltip/ErrorTooltip";
import { useNavigation } from "../../../contexts/NavigationContext";

const maxNameLength = 220;

const RenameAction = ({ itemsViewRef, item, eventBroker }) => {
  const [renameItem, setRenameItem] = useState(item?.displayName);
  // const [renameItemWarning, setRenameItemWarning] = useState(false);
  const [itemRenameError, setItemRenameError] = useState(false);
  const [renameErrorMessage, setRenameErrorMessage] = useState("");
  const [errorXPlacement, setErrorXPlacement] = useState("right");
  const [errorYPlacement, setErrorYPlacement] = useState("bottom");
  const { currentPathItems, setCurrentPathItems } = useNavigation();

  const warningModalRef = useRef(null);
  const outsideClick = useDetectOutsideClick((e) => {
    if (!warningModalRef.current?.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  const handleValidateFolderRename = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      outsideClick.setIsClicked(true);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      eventBroker.publish("cancel");
      return;
    }
    setItemRenameError(false);
  };

  // Auto hide error message after 7 seconds
  useEffect(() => {
    if (itemRenameError) {
      const autoHideError = setTimeout(() => {
        setItemRenameError(false);
        setRenameErrorMessage("");
      }, 7000);

      return () => clearTimeout(autoHideError);
    }
  }, [itemRenameError]);

  function handleFileRenaming() {
    if (renameItem === "" || renameItem === item.displayName) {
      eventBroker.publish("cancel");
    } else if (
      currentPathItems.some((file) => file.displayName === renameItem)
    ) {
      // new name already exists in current folder
      setItemRenameError(true);
      setRenameErrorMessage(
        `This destination already contains a folder named '${renameItem}'.`
      );
      outsideClick.setIsClicked(false);
    } else {
      // new name is valid, proceed with rename and call user's onRename callback
      setItemRenameError(false);
      eventBroker.publish("renameItemDone", {
        ...item,
        displayName: renameItem,
        isEditing: false,
        // TODO: For testing purposes
        resource: {
          ...item.resource,
          displayName: renameItem,
        },
      });
    }
  }

  const focusName = () => {
    outsideClick.ref?.current?.focus();
    outsideClick.ref?.current?.select();
  };

  useEffect(() => {
    focusName();

    // Dynamic Error Message Placement based on available space
    if (outsideClick.ref?.current) {
      const errorMessageWidth = 292 + 8 + 8 + 5; // 8px padding on left and right + additional 5px for gap
      const errorMessageHeight = 56 + 20 + 10 + 2; // 20px :before height
      const itemsContainer = itemsViewRef.current;
      const itemsContainerRect = itemsContainer.getBoundingClientRect();
      const renameInputContainer = outsideClick.ref.current;
      const renameInputContainerRect =
        renameInputContainer.getBoundingClientRect();

      const rightAvailableSpace =
        itemsContainerRect.right - renameInputContainerRect.left;
      rightAvailableSpace > errorMessageWidth
        ? setErrorXPlacement("right")
        : setErrorXPlacement("left");

      const bottomAvailableSpace =
        itemsContainerRect.bottom -
        (renameInputContainerRect.top + renameInputContainer.clientHeight);
      bottomAvailableSpace > errorMessageHeight
        ? setErrorYPlacement("bottom")
        : setErrorYPlacement("top");
    }
  }, []);

  useEffect(() => {
    if (outsideClick.isClicked) {
      handleFileRenaming();
    }
    focusName();
  }, [outsideClick.isClicked]);

  return (
    <>
      <NameInput
        nameInputRef={outsideClick.ref}
        maxLength={maxNameLength}
        value={renameItem}
        onChange={(e) => {
          setRenameItem(e.target.value);
          setItemRenameError(false);
        }}
        onKeyDown={handleValidateFolderRename}
        onClick={(e) => e.stopPropagation()}
        rows={1}
      />
      {itemRenameError && (
        <ErrorTooltip
          message={renameErrorMessage}
          xPlacement={errorXPlacement}
          yPlacement={errorYPlacement}
        />
      )}
    </>
  );
};

export default RenameAction;
