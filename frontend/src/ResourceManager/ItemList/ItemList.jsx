import { useRef } from "react";
import Item from "./Item";
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

  const {
    emptySelecCtxItems,
    selecCtxItems,
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
        <div className="empty-folder">This folder is empty.</div>
      )}

      <ContextMenu
        itemsViewRef={itemsViewRef}
        contextMenuRef={contextMenuRef.ref}
        menuItems={isSelectionCtx ? selecCtxItems : emptySelecCtxItems}
        visible={visible}
        setVisible={setVisible}
        clickPosition={clickPosition}
      />
    </div>
  );
};

ItemList.displayName = "FileList";

export default ItemList;
