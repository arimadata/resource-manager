import React, { useEffect, useState } from "react";
import Button from "../../../components/Button/Button";
import { useSelection } from "../../../contexts/SelectionContext";
import "./Delete.action.scss";

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

export default DeleteAction;
