import PropTypes from "prop-types";
import "./Tooltip.scss";

const Tooltip = ({ tooltipPosition, name, text = "Move to" }) => {
  return (
    <div
      style={{
        top: `${tooltipPosition.y}px`,
        left: `${tooltipPosition.x}px`,
      }}
      className="drag-move-tooltip"
    >
      {text} <span className="drop-zone-item-name">{name}</span>
    </div>
  );
};

Tooltip.propTypes = {
  tooltipPosition: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  text: PropTypes.string,
};

export default Tooltip;
