import PropTypes from "prop-types";
import "./Checkbox.scss";

const Checkbox = ({
  name,
  id,
  checked,
  onClick,
  onChange,
  className = "",
  title,
  disabled = false,
}) => {
  return (
    <input
      className={`fm-checkbox ${className}`}
      type="checkbox"
      name={name}
      id={id}
      checked={checked}
      onClick={onClick}
      onChange={onChange}
      title={title}
      disabled={disabled}
    />
  );
};

Checkbox.displayName = "Checkbox";
Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Checkbox;
