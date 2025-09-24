import { useMemo, useState } from "react";
import { FaArrowDown } from "react-icons/fa6";
import PropTypes from "prop-types";
import Checkbox from "../../components/Checkbox/Checkbox";
import { useSelection } from "../../contexts/SelectionContext";
import { useNavigation } from "../../contexts/NavigationContext";
import { SORT_DIRECTIONS } from "../../constants/sortDirections";
import { useSorting } from "../../contexts/SortingContext";

const ItemsHeader = ({ eventBroker, headers }) => {
  const [showSelectAll, setShowSelectAll] = useState(false);

  const { selectedItems } = useSelection();
  const { currentPathItems } = useNavigation();
  const { sortColumn, sortDirection, handleSort } = useSorting();

  const allItemsSelected = useMemo(() => {
    return (
      currentPathItems.length > 0 &&
      selectedItems.length === currentPathItems.length
    );
  }, [selectedItems, currentPathItems]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setShowSelectAll(true);
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
    <div
      className="items-header"
      onMouseOver={() => setShowSelectAll(true)}
      onMouseLeave={() => setShowSelectAll(false)}
    >
      {headers.map((header) => (
        <div
          key={header.columnName.toLowerCase().replace(" ", "-")}
          className={`sortable-header ${
            header.isNameColumn ? "item-name-header" : "item-standard-header"
          }`}
          onClick={() => handleSort(header.columnName)}
        >
          {header.isNameColumn && (
            <div className="item-select-all">
              {(showSelectAll || allItemsSelected) && (
                <Checkbox
                  checked={allItemsSelected}
                  onChange={handleSelectAll}
                  title="Select all"
                  disabled={currentPathItems.length === 0}
                />
              )}
            </div>
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
    })
  ).isRequired,
};

export default ItemsHeader;
