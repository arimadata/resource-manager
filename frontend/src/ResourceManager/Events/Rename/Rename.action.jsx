import { useEffect, useRef, useState } from "react";
import { useDetectOutsideClick } from "../../../hooks/useDetectOutsideClick";
import NameInput from "../../../components/NameInput/NameInput";
import ErrorTooltip from "../../../components/ErrorTooltip/ErrorTooltip";
import { useNavigation } from "../../../contexts/NavigationContext";
import PropTypes from "prop-types";
import { dateStringValidator } from "../../../validators/propValidators";

const RenameAction = ({ itemsViewRef, item, eventBroker }) => {
  const [renameItem, setRenameItem] = useState(item?.displayName);
  // const [renameItemWarning, setRenameItemWarning] = useState(false);
  const [itemRenameError, setItemRenameError] = useState(false);
  const [renameErrorMessage, setRenameErrorMessage] = useState("");
  const [errorXPlacement, setErrorXPlacement] = useState("right");
  const [errorYPlacement, setErrorYPlacement] = useState("bottom");
  const { currentPathItems } = useNavigation();

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

RenameAction.propTypes = {
  itemsViewRef: PropTypes.object.isRequired,
  item: PropTypes.shape({
    pk: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
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
    path: PropTypes.string,
    isEditing: PropTypes.bool,
  }).isRequired,
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

export default RenameAction;
