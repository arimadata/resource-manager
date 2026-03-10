import { useRef } from "react";
import Item from "./Item";
import PropTypes from "prop-types";
import { useNavigation } from "../../contexts/NavigationContext";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import { useDetectOutsideClick } from "../../hooks/useDetectOutsideClick";
import { useSingleItem } from "../../contexts/SingleItemContext";
import ItemsHeader from "./ItemsHeader";
import { useSelection } from "../../contexts/SelectionContext";
import Loader from "../../components/Loader/Loader";
import "./ItemList.scss";

const ItemList = ({
  eventBroker,
  headers,
  isLoading,
  primaryColor,
  allowOpen,
}) => {
  const { currentPathItems } = useNavigation();
  const { selectedItemIndexes } = useSelection();
  const itemsViewRef = useRef(null);

  const gridTemplateColumns = headers.map(() => "1fr").join(" ");

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
      {isLoading ? (
        <div className="items-loading-container">
          <Loader
            loading={true}
            text="Loading resources..."
            className="items-loader"
          />
        </div>
      ) : currentPathItems?.length > 0 ? (
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
              primaryColor={primaryColor}
              allowOpen={allowOpen}
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
      columnName: PropTypes.string.isRequired,
      getValue: PropTypes.func.isRequired,
      sortAccessor: PropTypes.func,
      isNameColumn: PropTypes.bool,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  primaryColor: PropTypes.string,
  allowOpen: PropTypes.func,
};

export default ItemList;
