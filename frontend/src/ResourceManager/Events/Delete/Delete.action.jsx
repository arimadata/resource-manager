import Button from "../../../components/Button/Button";
import { useSelection } from "../../../contexts/SelectionContext";
import "./Delete.action.scss";
import PropTypes from "prop-types";

const DeleteAction = ({ eventBroker }) => {
  const { selectedItems } = useSelection();

  const deleteMessage = () => {
    if (selectedItems.length === 1) {
      return `Are you sure you want to delete "${selectedItems[0].displayName}"?`;
    } else if (selectedItems.length > 1) {
      return `Are you sure you want to delete these ${selectedItems.length} items?`;
    }
  };

  return (
    <div className="file-delete-confirm">
      <p className="file-delete-confirm-text">{deleteMessage()}</p>
      <div className="file-delete-confirm-actions">
        <Button type="secondary" onClick={() => eventBroker.publish("release")}>
          Cancel
        </Button>
        <Button
          type="danger"
          onClick={() => eventBroker.publish("deleteItemsDone")}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

DeleteAction.propTypes = {
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

export default DeleteAction;
