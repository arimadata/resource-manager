import { useMemo, useState } from "react";
import Checkbox from "../../components/Checkbox/Checkbox";
import { useSelection } from "../../contexts/SelectionContext";
import { useNavigation } from "../../contexts/NavigationContext";

const ItemsHeader = ({ eventBroker }) => {
  const [showSelectAll, setShowSelectAll] = useState(false);

  const { selectedItems } = useSelection();
  const { currentPathItems } = useNavigation();

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
      <div className="item-name">Name</div>
      <div className="item-standard">Last Modified</div>
      <div className="item-standard">Misc</div>
    </div>
  );
};

export default ItemsHeader;
