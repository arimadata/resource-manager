import { useRef } from "react";
import Item from "./Item";
import PropTypes from "prop-types";
import { useNavigation } from "../../contexts/NavigationContext";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import { useDetectOutsideClick } from "../../hooks/useDetectOutsideClick";
import { useSingleItem } from "../../contexts/SingleItemContext";
import ItemsHeader from "./ItemsHeader";
import { useSelection } from "../../contexts/SelectionContext";
import "./ItemList.scss";

const ItemList = ({ eventBroker, headers }) => {
  const { currentPathItems } = useNavigation();
  const { selectedItemIndexes } = useSelection();
  const itemsViewRef = useRef(null);

  const gridTemplateColumns = `40px 32px ${headers.map(() => "1fr").join(" ")}`;

  const {
    emptySelectCtxItems,
    selectCtxItems,
    handleContextMenu,
    visible,
    setVisible,
    setRightClickedItem,
    clickPosition,
    isSelectionCtx,
  } = useSingleItem();

  const contextMenuRef = useDetectOutsideClick(() => setVisible(false));

  return (
    <div
      ref={itemsViewRef}
      className={`items list`}
      style={{ gridTemplateColumns }}
      onContextMenu={handleContextMenu}
      onClick={() => eventBroker.publish("unselectAll")}
    >
      <ItemsHeader eventBroker={eventBroker} headers={headers} />
      {currentPathItems?.length > 0 ? (
        <>
          {currentPathItems.map((item, index) => (
            <Item
              key={index}
              index={index}
              item={item}
              eventBroker={eventBroker}
              itemsViewRef={itemsViewRef}
              selectedItemIndexes={selectedItemIndexes}
              handleContextMenu={handleContextMenu}
              setVisible={setVisible}
              setRightClickedItem={setRightClickedItem}
              headers={headers}
            />
          ))}
        </>
      ) : (
        <div className="empty-folder">No items found.</div>
      )}

      <ContextMenu
        contextMenuRef={contextMenuRef.ref}
        menuItems={isSelectionCtx ? selectCtxItems : emptySelectCtxItems}
        visible={visible}
        setVisible={setVisible}
        clickPosition={clickPosition}
      />
    </div>
  );
};

ItemList.displayName = "FileList";
ItemList.propTypes = {
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
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      attribute: PropTypes.string.isRequired,
      defaultValue: PropTypes.string.isRequired,
      columnName: PropTypes.string,
      transform: PropTypes.func,
      sortAccessor: PropTypes.func,
    })
  ).isRequired,
};

export default ItemList;
