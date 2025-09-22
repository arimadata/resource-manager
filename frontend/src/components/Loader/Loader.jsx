import PropTypes from "prop-types";
import { ImSpinner2 } from "react-icons/im";
import "./Loader.scss";

const Loader = ({ className, text = "Loading..." }) => {
  return (
    <div className={`loader-container ${className || ""}`}>
      <div className="loader-content">
        <ImSpinner2 className="spinner" />
        <p className="loader-text">{text}</p>
      </div>
    </div>
  );
};

Loader.displayName = "Loader";
Loader.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string,
};

export default Loader;
