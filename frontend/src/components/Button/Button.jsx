import PropTypes from "prop-types";
import "./Button.scss";

const Button = ({
  onClick,
  onKeyDown,
  type = "primary",
  padding = "0.4rem 0.8rem",
  children,
}) => {
  return (
    <button
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`fm-button fm-button-${type}`}
      style={{ padding: padding }}
    >
      {children}
    </button>
  );
};

Button.displayName = "Button";
Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  type: PropTypes.string,
  padding: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Button;
