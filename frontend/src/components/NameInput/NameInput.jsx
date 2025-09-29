import { MAX_NAME_LENGTH } from "../../constants/maxNameLength";
import PropTypes from "prop-types";
import "./NameInput.scss";

const NameInput = ({
  nameInputRef,
  value,
  onChange,
  onKeyDown,
  onClick,
  rows,
}) => {
  return (
    <textarea
      ref={nameInputRef}
      className="rename-item"
      maxLength={MAX_NAME_LENGTH}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onClick={onClick}
      rows={rows}
    />
  );
};

NameInput.displayName = "NameInput";
NameInput.propTypes = {
  nameInputRef: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  rows: PropTypes.number.isRequired,
};

export default NameInput;
