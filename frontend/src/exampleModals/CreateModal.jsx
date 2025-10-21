import { useState } from "react";
import PropTypes from "prop-types";

export function CreateModal({ onConfirm, onCancel }) {
  const [name, setName] = useState("");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 1,
      }}
    >
      <div style={{ background: "#fff", padding: 24, minWidth: 300 }}>
        <h2>Create item - {name}</h2>
        <input
          style={{ width: "100%" }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
        />
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button onClick={onCancel}>Cancel</button>
          <button
            onClick={() =>
              onConfirm({
                name,
              })
            }
            style={{ marginLeft: 8 }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

CreateModal.displayName = "CreateModal";
CreateModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
