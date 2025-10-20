import { useState } from "react";
import PropTypes from "prop-types";
import { dateStringValidator } from "../validators/propValidators";

export function ShareModal({ onConfirm, onCancel, data }) {
  const [email, setEmail] = useState("");

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
        <h2>Share item - {data.map((item) => item.name).join(", ")}</h2>
        <input
          style={{ width: "100%" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button onClick={onCancel}>Cancel</button>
          <button
            onClick={() =>
              onConfirm({
                email: email,
              })
            }
            style={{ marginLeft: 8 }}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

ShareModal.displayName = "ShareModal";
ShareModal.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      pk: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      itemType: PropTypes.oneOf(["folder", "resource"]).isRequired,
      iconName: PropTypes.string,
      isFavorited: PropTypes.bool,
      parentPk: PropTypes.string,
      scope: PropTypes.string,
      scopePk: PropTypes.string,
      createdAt: dateStringValidator,
      updatedAt: dateStringValidator,
      resource: PropTypes.object,
      resourcePk: PropTypes.string,
      resourceType: PropTypes.string,
      isDirectory: PropTypes.bool,
      path: PropTypes.arrayOf(PropTypes.string),
      isEditing: PropTypes.bool,
    })
  ).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
