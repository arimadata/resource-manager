import { useMemo } from "react";
import { FaArrowDown } from "react-icons/fa6";
import PropTypes from "prop-types";
import Checkbox from "../../components/Checkbox/Checkbox";
import { useSelection } from "../../contexts/SelectionContext";
import { usePagination } from "../../contexts/PaginationContext";
import { SORT_DIRECTIONS } from "../../constants/sortDirections";
import { useSorting } from "../../contexts/SortingContext";
import { useNavigation } from "../../contexts/NavigationContext";

const ItemsHeader = ({ eventBroker, headers }) => {
  const { selectedItems } = useSelection();
  const { currentPage, pageSize, allowPagination } = usePagination();
  const { currentPathItems } = useNavigation();
  const { sortColumn, sortDirection, handleSort } = useSorting();

  const paginatedItems = useMemo(() => {
    if (!currentPathItems || currentPathItems.length === 0) return [];
    if (!allowPagination) return currentPathItems;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const slicedItems = currentPathItems.slice(startIndex, endIndex);
    return slicedItems;
  }, [currentPathItems, currentPage, pageSize, allowPagination]);

  const allItemsSelected = useMemo(() => {
    if (paginatedItems.length === 0) return;
    const isAllSelected = paginatedItems.every((item) =>
      selectedItems.some((selected) => selected.pk === item.pk)
    );
    return isAllSelected;
  }, [selectedItems, paginatedItems]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      eventBroker.publish("selectAll");
    } else {
      eventBroker.publish("unselectAll");
    }
  };

  const renderSortIcon = (column) => {
    if (column === sortColumn && sortDirection) {
      return (
        <FaArrowDown
          className={`sort-icon active ${
            sortDirection === SORT_DIRECTIONS.ASC ? "rotate-up" : ""
          }`}
        />
      );
    }
    return null;
  };

  return (
    <div className="items-header">
      {headers.map((header) => (
        <div
          key={header.columnName.toLowerCase().replace(" ", "-")}
          className={`sortable-header ${
            header.isNameColumn ? "item-name-header" : "item-standard-header"
          }`}
          onClick={() => handleSort(header.columnName)}
        >
          {header.isNameColumn && (
            <Checkbox
              checked={allItemsSelected}
              onClick={(e) => e.stopPropagation()}
              onChange={handleSelectAll}
              title="Select all"
              disabled={paginatedItems.length === 0}
            />
          )}
          <span className="header-text">{header.columnName}</span>
          {renderSortIcon(header.columnName)}
        </div>
      ))}
    </div>
  );
};

ItemsHeader.propTypes = {
  eventBroker: PropTypes.shape({
    publish: PropTypes.func.isRequired,
  }).isRequired,
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      columnName: PropTypes.string.isRequired,
      getValue: PropTypes.func.isRequired,
      sortAccessor: PropTypes.func,
      isNameColumn: PropTypes.bool,
      // Column width: number (px) or CSS length string.
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ).isRequired,
};

export default ItemsHeader;
