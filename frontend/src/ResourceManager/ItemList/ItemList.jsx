import { useEffect, useMemo, useRef } from "react";
import Item from "./Item";
import PropTypes from "prop-types";
import { useNavigation } from "../../contexts/NavigationContext";
import { usePagination } from "../../contexts/PaginationContext";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import { useDetectOutsideClick } from "../../hooks/useDetectOutsideClick";
import { useSingleItem } from "../../contexts/SingleItemContext";
import ItemsHeader from "./ItemsHeader";
import { useSelection } from "../../contexts/SelectionContext";
import Loader from "../../components/Loader/Loader";
import Pagination from "../../components/Pagination/Pagination";
import { buildGridTemplateColumns } from "../../utils/buildGridTemplateColumns";
import "./ItemList.scss";

const ItemList = ({ eventBroker, headers, isLoading, primaryColor }) => {
  const { currentPathItems } = useNavigation();
  const { currentPage, pageSize, allowPagination, handlePageChange } =
    usePagination();
  const { selectedItemIndexes } = useSelection();
  const itemsViewRef = useRef(null);

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

  const gridTemplateColumns = buildGridTemplateColumns(headers)  

  const totalItems = currentPathItems.length;
  const isTotalItemsAvailable = totalItems > 0;

  const maxPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const totalPages = pageSize > 0 ? maxPages : 1;

  const isPaginationAvailable =
    !isLoading && isTotalItemsAvailable && allowPagination && totalPages > 1;

  const paginatedItems = useMemo(() => {
    if (!currentPathItems || currentPathItems.length === 0) {
      return [];
    }

    if (!allowPagination) {
      return currentPathItems;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const slicedItems = currentPathItems.slice(startIndex, endIndex);
    return slicedItems;
  }, [currentPathItems, currentPage, pageSize, allowPagination]);

  useEffect(() => {
    if (!allowPagination || !isTotalItemsAvailable) {
      return;
    }

    if (currentPage > totalPages) {
      handlePageChange(totalPages);
    }
  }, [
    allowPagination,
    isTotalItemsAvailable,
    currentPage,
    totalPages,
    handlePageChange,
  ]);

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
      ) : isTotalItemsAvailable ? (
        <>
          {paginatedItems.map((item, index) => {
            const paginatedIndex = index + (currentPage - 1) * pageSize;
            const itemIndex = allowPagination ? paginatedIndex : index;

            return (
              <Item
                key={item.pk}
                index={itemIndex}
                item={item}
                eventBroker={eventBroker}
                itemsViewRef={itemsViewRef}
                selectedItemIndexes={selectedItemIndexes}
                handleContextMenu={handleContextMenu}
                setVisible={setVisible}
                setRightClickedItem={setRightClickedItem}
                headers={headers}
                primaryColor={primaryColor}
              />
            );
          })}
        </>
      ) : (
        <div className="empty-folder">No items found.</div>
      )}
      {isPaginationAvailable && (
        <div className="items-pagination-container">
          <Pagination
            totalPages={totalPages}
            page={currentPage}
            onChange={handlePageChange}
          />
        </div>
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
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  primaryColor: PropTypes.string,
};

export default ItemList;
