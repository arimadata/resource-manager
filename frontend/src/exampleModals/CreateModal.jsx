import { useState } from "react";

export function CreateModal({ data, onConfirm, onCancel }) {
  const [name, setName] = useState(data?.item?.displayName ?? "");
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
        <h2>Create item - {data?.item?.displayName ?? data}</h2>
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
                ...(data?.item ?? {}),
                displayName: name,
                parentPk: parent?.pk,
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
