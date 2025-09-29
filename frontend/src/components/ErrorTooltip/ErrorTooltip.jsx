import PropTypes from "prop-types";
import "./ErrorTooltip.scss";

const ErrorTooltip = ({ message, xPlacement, yPlacement }) => {
  return (
    <p className={`error-tooltip ${xPlacement} ${yPlacement}`}>{message}</p>
  );
};

ErrorTooltip.displayName = "ErrorTooltip";
ErrorTooltip.propTypes = {
  message: PropTypes.string.isRequired,
  xPlacement: PropTypes.string.isRequired,
  yPlacement: PropTypes.string.isRequired,
};

export default ErrorTooltip;
