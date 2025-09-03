import { useMemo, useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa6";
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
    if (column === sortColumn) {
      switch (sortDirection) {
        case SORT_DIRECTIONS.ASC:
          return <FaSortUp className="sort-icon active" />;
        case SORT_DIRECTIONS.DESC:
          return <FaSortDown className="sort-icon active" />;
        default:
          return <FaSort className="sort-icon inactive" />;
      }
    }
    return <FaSort className="sort-icon inactive" />;
  };

  return (
    <div
      className="items-header"
      onMouseOver={() => setShowSelectAll(true)}
      onMouseLeave={() => setShowSelectAll(false)}
    >
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
      <div className="item-icon"> </div>
      <div className="item-icon"> </div>
      {headers.map((header, i) => (
        <div
          key={header.attribute}
          className={`sortable-header ${
            i === 0 ? "item-name" : "item-standard"
          }`}
          onClick={() => handleSort(header.attribute)}
          style={{ textTransform: "capitalize" }}
        >
          {header.columnName || header.attribute}
          {renderSortIcon(header.attribute)}
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
      attribute: PropTypes.string.isRequired,
      defaultValue: PropTypes.string.isRequired,
      columnName: PropTypes.string,
      transform: PropTypes.func,
      sortAccessor: PropTypes.func,
    })
  ).isRequired,
};

export default ItemsHeader;
